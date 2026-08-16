/**
 * Sequence ⊃ campaigns housing. cells jsonb is leftover data, not the spine.
 * Next campaign = next ord when this campaign's objective is met.
 */
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

export type ObjectiveKind = "click" | "form" | "meeting";
export type CompletionTable = "messaging_events" | "fact_writebacks" | "meeting_booked";
export type ChannelToken = "text" | "email" | "call";

export type CampaignChannelDraft = {
  id?: string;
  token: ChannelToken;
  ord?: number;
  overrideContent?: boolean;
  content?: Record<string, unknown>;
  variations?: Array<{
    id?: string;
    ord?: number;
    applyMode?: "every" | "only_this" | "every_except";
    attemptN?: number | null;
    content?: Record<string, unknown>;
  }>;
  rulesOverride?: boolean;
  withinSeconds?: number | null;
  rules?: Array<{
    id?: string;
    key?: string;
    label?: string;
    enabled?: boolean;
    condition?: string;
    threshold?: number | null;
    thresholdUnit?: string | null;
    ord?: number;
  }>;
};

export type CampaignDraft = {
  id?: string;
  name: string;
  ord: number;
  overrideThis?: boolean;
  attemptCount?: number | null;
  waitAfterLastFailedSeconds?: number | null;
  nthException?: Record<string, unknown>;
  objective?: {
    id?: string;
    kind: ObjectiveKind;
    name: string;
    completionTable: CompletionTable;
    source?: "template" | "scratch";
  };
  channels?: CampaignChannelDraft[];
};

export type CampaignRow = {
  id: string;
  firm_id: string | null;
  sequence_id: string;
  name: string;
  ord: number;
  override_this: boolean;
  attempt_count: number | null;
  wait_after_last_failed_seconds: number | null;
  nth_exception: Record<string, unknown>;
  objective: {
    id: string;
    kind: ObjectiveKind;
    name: string;
    completion_table: CompletionTable;
    source: "template" | "scratch";
  } | null;
  channels: Array<{
    id: string;
    token: ChannelToken;
    ord: number;
    override_content: boolean;
    content: Record<string, unknown>;
    variations: Array<{
      id: string;
      ord: number;
      apply_mode: "every" | "only_this" | "every_except";
      attempt_n: number | null;
      content: Record<string, unknown>;
    }>;
    rules_override: boolean;
    within_seconds: number | null;
    rules: Array<{
      id: string;
      label: string;
      enabled: boolean;
      when_clause: string | null;
      condition_clause: string | null;
      threshold: number | null;
      threshold_unit: string | null;
      ord: number;
    }>;
  }>;
};

export async function firstCampaignId(
  pool: Pool,
  sequenceId: string,
): Promise<string | null> {
  const row = await pool.query<{ id: string }>(
    `SELECT id FROM campaign WHERE sequence_id=$1 ORDER BY ord ASC, id ASC LIMIT 1`,
    [sequenceId],
  );
  return row.rows[0]?.id ?? null;
}

export async function loadHousing(
  pool: Pool,
  sequenceId: string,
): Promise<CampaignRow[]> {
  const camps = await pool.query<{
    id: string;
    firm_id: string | null;
    sequence_id: string;
    name: string;
    ord: number;
    override_this: boolean;
    attempt_count: number | null;
    wait_after_last_failed_seconds: number | null;
    nth_exception: Record<string, unknown>;
  }>(
    `SELECT id, firm_id, sequence_id, name, ord, override_this,
            attempt_count, wait_after_last_failed_seconds, nth_exception
     FROM campaign WHERE sequence_id=$1 ORDER BY ord ASC, id ASC`,
    [sequenceId],
  );
  const ids = camps.rows.map((r) => r.id);
  if (!ids.length) return [];

  const objs = await pool.query<{
    id: string;
    campaign_id: string;
    kind: ObjectiveKind;
    name: string;
    completion_table: CompletionTable;
    source: "template" | "scratch";
  }>(
    `SELECT id, campaign_id, kind, name, completion_table, source
     FROM campaign_objective WHERE campaign_id = ANY($1::text[])`,
    [ids],
  );
  const chans = await pool.query<{
    id: string;
    campaign_id: string;
    token: ChannelToken;
    ord: number;
    override_content: boolean;
    content: Record<string, unknown>;
    rules_override: boolean;
    within_seconds: number | null;
  }>(
    `SELECT id, campaign_id, token, ord, override_content, content,
            COALESCE(rules_override, false) AS rules_override, within_seconds
     FROM campaign_channel WHERE campaign_id = ANY($1::text[])
     ORDER BY ord ASC`,
    [ids],
  );
  const channelIds = chans.rows.map((ch) => ch.id);
  const variations = channelIds.length
    ? await pool.query<{
        id: string;
        campaign_channel_id: string;
        ord: number;
        apply_mode: "every" | "only_this" | "every_except";
        attempt_n: number | null;
        content: Record<string, unknown>;
      }>(
        `SELECT id, campaign_channel_id, ord, apply_mode, attempt_n, content
         FROM campaign_channel_variation
         WHERE campaign_channel_id = ANY($1::text[])
         ORDER BY ord ASC`,
        [channelIds],
      )
    : { rows: [] as Array<{
        id: string;
        campaign_channel_id: string;
        ord: number;
        apply_mode: "every" | "only_this" | "every_except";
        attempt_n: number | null;
        content: Record<string, unknown>;
      }> };
  const rules = channelIds.length
    ? await pool.query<{
        id: string;
        campaign_channel_id: string | null;
        label: string;
        enabled: boolean;
        when_clause: string | null;
        condition_clause: string | null;
        threshold: number | null;
        threshold_unit: string | null;
        ord: number;
      }>(
        `SELECT id, campaign_channel_id, label, enabled, when_clause, condition_clause,
                threshold, threshold_unit, ord
         FROM rule_attempt_criteria
         WHERE campaign_channel_id = ANY($1::text[])
         ORDER BY ord ASC`,
        [channelIds],
      )
    : { rows: [] as Array<{
        id: string;
        campaign_channel_id: string | null;
        label: string;
        enabled: boolean;
        when_clause: string | null;
        condition_clause: string | null;
        threshold: number | null;
        threshold_unit: string | null;
        ord: number;
      }> };

  const objBy = new Map(objs.rows.map((o) => [o.campaign_id, o]));
  const chBy = new Map<string, typeof chans.rows>();
  for (const ch of chans.rows) {
    const list = chBy.get(ch.campaign_id) ?? [];
    list.push(ch);
    chBy.set(ch.campaign_id, list);
  }
  const varBy = new Map<string, typeof variations.rows>();
  for (const row of variations.rows) {
    const list = varBy.get(row.campaign_channel_id) ?? [];
    list.push(row);
    varBy.set(row.campaign_channel_id, list);
  }
  const ruleBy = new Map<string, typeof rules.rows>();
  for (const row of rules.rows) {
    if (!row.campaign_channel_id) continue;
    const list = ruleBy.get(row.campaign_channel_id) ?? [];
    list.push(row);
    ruleBy.set(row.campaign_channel_id, list);
  }

  return camps.rows.map((c) => {
    const o = objBy.get(c.id);
    return {
      ...c,
      objective: o
        ? {
            id: o.id,
            kind: o.kind,
            name: o.name,
            completion_table: o.completion_table,
            source: o.source,
          }
        : null,
      channels: (chBy.get(c.id) ?? []).map((ch) => {
        const vars = varBy.get(ch.id) ?? [];
        const leftover = ch.content ?? {};
        return {
          id: ch.id,
          token: ch.token,
          ord: ch.ord,
          override_content: ch.override_content,
          content: vars[0]?.content ?? leftover,
          variations: vars.length
            ? vars.map((v) => ({
                id: v.id,
                ord: v.ord,
                apply_mode: v.apply_mode,
                attempt_n: v.attempt_n,
                content: v.content ?? {},
              }))
            : [
                {
                  id: `var-${ch.id}`,
                  ord: 0,
                  apply_mode: "every" as const,
                  attempt_n: null,
                  content: leftover,
                },
              ],
          rules_override: Boolean(ch.rules_override),
          within_seconds: ch.within_seconds,
          rules: (ruleBy.get(ch.id) ?? []).map((r) => ({
            id: r.id,
            label: r.label,
            enabled: r.enabled,
            when_clause: r.when_clause,
            condition_clause: r.condition_clause,
            threshold: r.threshold,
            threshold_unit: r.threshold_unit,
            ord: r.ord,
          })),
        };
      }),
    };
  });
}

export async function saveHousing(
  pool: Pool,
  sequenceId: string,
  firmId: string | null,
  drafts: CampaignDraft[],
): Promise<CampaignRow[]> {
  const keepIds: string[] = [];
  for (const draft of drafts) {
    const id = draft.id?.trim() || `camp-${randomUUID()}`;
    keepIds.push(id);
    await pool.query(
      `INSERT INTO campaign
         (id, firm_id, sequence_id, name, ord, override_this,
          attempt_count, wait_after_last_failed_seconds, nth_exception, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,now())
       ON CONFLICT (id) DO UPDATE SET
         name=EXCLUDED.name,
         ord=EXCLUDED.ord,
         override_this=EXCLUDED.override_this,
         attempt_count=EXCLUDED.attempt_count,
         wait_after_last_failed_seconds=EXCLUDED.wait_after_last_failed_seconds,
         nth_exception=EXCLUDED.nth_exception,
         updated_at=now()`,
      [
        id,
        firmId,
        sequenceId,
        draft.name || "Untitled campaign",
        draft.ord,
        Boolean(draft.overrideThis),
        draft.attemptCount ?? null,
        draft.waitAfterLastFailedSeconds ?? null,
        JSON.stringify(draft.nthException ?? {}),
      ],
    );

    if (draft.objective) {
      const objId = draft.objective.id?.trim() || `obj-${id}`;
      await pool.query(
        `INSERT INTO campaign_objective
           (id, campaign_id, kind, name, completion_table, source)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (campaign_id) DO UPDATE SET
           kind=EXCLUDED.kind,
           name=EXCLUDED.name,
           completion_table=EXCLUDED.completion_table,
           source=EXCLUDED.source`,
        [
          objId,
          id,
          draft.objective.kind,
          draft.objective.name,
          draft.objective.completionTable,
          draft.objective.source ?? "scratch",
        ],
      );
    }

    const channelKeep: string[] = [];
    if (draft.overrideThis) {
      const channels = draft.channels?.length
        ? draft.channels
        : ([
            { token: "text", ord: 0 },
            { token: "email", ord: 1 },
            { token: "call", ord: 2 },
          ] satisfies CampaignChannelDraft[]);
      for (const ch of channels) {
        const chId = ch.id?.trim() || `ch-${id}-${ch.token}`;
        const variations = ch.variations?.length
          ? ch.variations
          : [{ ord: 0, applyMode: "every" as const, attemptN: null, content: ch.content ?? {} }];
        const leftoverContent = variations[0]?.content ?? ch.content ?? {};
        const saved = await pool.query<{ id: string }>(
          `INSERT INTO campaign_channel
             (id, campaign_id, token, ord, override_content, content,
              rules_override, within_seconds, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,now())
           ON CONFLICT (campaign_id, token) DO UPDATE SET
             ord=EXCLUDED.ord,
             override_content=EXCLUDED.override_content,
             content=EXCLUDED.content,
             rules_override=EXCLUDED.rules_override,
             within_seconds=EXCLUDED.within_seconds,
             updated_at=now()
           RETURNING id`,
          [
            chId,
            id,
            ch.token,
            ch.ord ?? 0,
            Boolean(ch.overrideContent),
            JSON.stringify(leftoverContent),
            Boolean(ch.rulesOverride),
            ch.withinSeconds ?? null,
          ],
        );
        const realChId = saved.rows[0]?.id ?? chId;
        channelKeep.push(realChId);

        const varKeep: string[] = [];
        for (const [i, variation] of variations.entries()) {
          const applyMode =
            variation.applyMode === "only_this" || variation.applyMode === "every_except"
              ? variation.applyMode
              : "every";
          const attemptN = applyMode === "every" ? null : (variation.attemptN ?? 1);
          const varId = variation.id?.trim() || `var-${realChId}-${i}`;
          varKeep.push(varId);
          await pool.query(
            `INSERT INTO campaign_channel_variation
               (id, campaign_channel_id, ord, apply_mode, attempt_n, content, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6::jsonb,now())
             ON CONFLICT (id) DO UPDATE SET
               campaign_channel_id=EXCLUDED.campaign_channel_id,
               ord=EXCLUDED.ord,
               apply_mode=EXCLUDED.apply_mode,
               attempt_n=EXCLUDED.attempt_n,
               content=EXCLUDED.content,
               updated_at=now()`,
            [
              varId,
              realChId,
              variation.ord ?? i,
              applyMode,
              attemptN,
              JSON.stringify(variation.content ?? {}),
            ],
          );
        }
        if (varKeep.length) {
          await pool.query(
            `DELETE FROM campaign_channel_variation
             WHERE campaign_channel_id=$1 AND NOT (id = ANY($2::text[]))`,
            [realChId, varKeep],
          );
        }

        if (ch.rulesOverride) {
          const ruleKeep: string[] = [];
          for (const [i, rule] of (ch.rules ?? []).entries()) {
            const key = (rule.key?.trim() || `r${i}`).replace(/-/g, "_");
            if (key === "within_time") continue;
            const ruleId = rule.id?.trim() || `acr-ch-${realChId}-${key}`;
            ruleKeep.push(ruleId);
            const label = rule.label?.trim() || `${ch.token} · ${key.replace(/_/g, " ")}`;
            await pool.query(
              `INSERT INTO rule_attempt_criteria
                 (id, firm_id, label, enabled, when_clause, condition_clause, set_value,
                  threshold, threshold_unit, ord, source, campaign_channel_id, channel_token)
               VALUES ($1,$2,$3,$4,$5,$6,'escalate_forward',$7,$8,$9,'channel_local',$10,$11)
               ON CONFLICT (id) DO UPDATE SET
                 label=EXCLUDED.label,
                 enabled=EXCLUDED.enabled,
                 when_clause=EXCLUDED.when_clause,
                 condition_clause=EXCLUDED.condition_clause,
                 threshold=EXCLUDED.threshold,
                 threshold_unit=EXCLUDED.threshold_unit,
                 ord=EXCLUDED.ord,
                 campaign_channel_id=EXCLUDED.campaign_channel_id,
                 channel_token=EXCLUDED.channel_token,
                 version=rule_attempt_criteria.version+1`,
              [
                ruleId,
                firmId,
                label,
                Boolean(rule.enabled),
                `channel=${ch.token}`,
                rule.condition ?? key.replace(/_/g, " "),
                null,
                null,
                rule.ord ?? i,
                realChId,
                ch.token,
              ],
            );
          }
          if (ruleKeep.length) {
            await pool.query(
              `DELETE FROM rule_attempt_criteria
               WHERE campaign_channel_id=$1 AND NOT (id = ANY($2::text[]))`,
              [realChId, ruleKeep],
            );
          }
        } else {
          await pool.query(`DELETE FROM rule_attempt_criteria WHERE campaign_channel_id=$1`, [
            realChId,
          ]);
        }
      }
    }
    if (channelKeep.length) {
      await pool.query(
        `DELETE FROM campaign_channel
         WHERE campaign_id=$1 AND NOT (id = ANY($2::text[]))`,
        [id, channelKeep],
      );
    } else {
      await pool.query(`DELETE FROM campaign_channel WHERE campaign_id=$1`, [id]);
    }
  }

  if (keepIds.length) {
    await pool.query(
      `DELETE FROM campaign WHERE sequence_id=$1 AND NOT (id = ANY($2::text[]))`,
      [sequenceId, keepIds],
    );
  } else {
    await pool.query(`DELETE FROM campaign WHERE sequence_id=$1`, [sequenceId]);
  }

  return loadHousing(pool, sequenceId);
}

export async function copySequenceFromTemplate(
  pool: Pool,
  opts: {
    firmId: string;
    sequenceClass: string;
    sourceTemplateId: string;
  },
): Promise<string> {
  const src = await pool.query<{
    id: string;
    sequence_class: string;
    variant: string;
    label: string;
    cells: unknown;
    source: string | null;
    silences: unknown;
  }>(`SELECT * FROM sequence_template WHERE id=$1`, [opts.sourceTemplateId]);
  if (!src.rowCount) throw new Error("source sequence missing");
  const row = src.rows[0];
  const newId = `tpl.${opts.sequenceClass}.${opts.firmId.slice(0, 8)}.${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO sequence_template
       (id, sequence_class, variant, label, cells, source, silences, firm_id)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7::jsonb,$8)`,
    [
      newId,
      opts.sequenceClass,
      row.variant ?? "v1",
      row.label,
      JSON.stringify(row.cells ?? []),
      row.source,
      JSON.stringify(row.silences ?? []),
      opts.firmId,
    ],
  );

  const housing = await loadHousing(pool, opts.sourceTemplateId);
  const drafts: CampaignDraft[] = housing.map((c, i) => ({
    name: c.name,
    ord: c.ord ?? i,
    overrideThis: c.override_this,
    attemptCount: c.attempt_count,
    waitAfterLastFailedSeconds: c.wait_after_last_failed_seconds,
    nthException: c.nth_exception,
    objective: c.objective
      ? {
          kind: c.objective.kind,
          name: c.objective.name,
          completionTable: c.objective.completion_table,
          source: "template",
        }
      : undefined,
    channels: c.channels.map((ch) => ({
      token: ch.token,
      ord: ch.ord,
      overrideContent: ch.override_content,
      content: ch.content,
      variations: ch.variations.map((v) => ({
        ord: v.ord,
        applyMode: v.apply_mode,
        attemptN: v.attempt_n,
        content: v.content,
      })),
      rulesOverride: Boolean(ch.rules_override),
      withinSeconds: ch.within_seconds,
      rules: ch.rules.map((r, i) => ({
        label: r.label,
        enabled: r.enabled,
        condition: r.condition_clause ?? undefined,
        threshold: r.threshold,
        thresholdUnit: r.threshold_unit,
        ord: r.ord ?? i,
      })),
    })),
  }));
  await saveHousing(pool, newId, opts.firmId, drafts);

  const bindId = `bind.${opts.firmId}.${opts.sequenceClass}.${randomUUID().slice(0, 8)}`;
  await pool.query(
    `INSERT INTO firm_sequence_binding
       (id, firm_id, sequence_class, template_id, variable_bindings, is_default)
     VALUES ($1,$2,$3,$4,'{}'::jsonb,false)
     ON CONFLICT (id) DO NOTHING`,
    [bindId, opts.firmId, opts.sequenceClass, newId],
  );
  return newId;
}

export async function campaignObjectiveMet(
  pool: Pool,
  opts: { firmId: string; contactId: string; campaignId: string },
): Promise<boolean> {
  const obj = await pool.query<{ completion_table: CompletionTable }>(
    `SELECT completion_table FROM campaign_objective WHERE campaign_id=$1 LIMIT 1`,
    [opts.campaignId],
  );
  const table = obj.rows[0]?.completion_table;
  if (!table) return false;
  if (table === "meeting_booked") {
    const r = await pool.query(
      `SELECT 1 FROM meeting_booked WHERE firm_id=$1 AND contact_id=$2 LIMIT 1`,
      [opts.firmId, opts.contactId],
    );
    return Boolean(r.rowCount);
  }
  if (table === "fact_writebacks") {
    const r = await pool.query(
      `SELECT 1 FROM fact_writebacks WHERE firm_id=$1 AND contact_id=$2 LIMIT 1`,
      [opts.firmId, opts.contactId],
    );
    return Boolean(r.rowCount);
  }
  const r = await pool.query(
    `SELECT 1 FROM messaging_events WHERE firm_id=$1 AND contact_id=$2 LIMIT 1`,
    [opts.firmId, opts.contactId],
  );
  return Boolean(r.rowCount);
}

export async function nextCampaignId(
  pool: Pool,
  sequenceId: string,
  currentCampaignId: string,
): Promise<string | null> {
  const rows = await pool.query<{ id: string }>(
    `SELECT id FROM campaign WHERE sequence_id=$1 ORDER BY ord ASC, id ASC`,
    [sequenceId],
  );
  const idx = rows.rows.findIndex((r) => r.id === currentCampaignId);
  if (idx < 0 || idx >= rows.rows.length - 1) return null;
  return rows.rows[idx + 1].id;
}

export async function advanceEnrollmentCampaign(
  pool: Pool,
  enrollmentId: string,
): Promise<{ advanced: boolean; campaignId: string | null }> {
  const enr = await pool.query<{
    id: string;
    firm_id: string;
    contact_id: string;
    sequence_id: string | null;
    campaign_id: string | null;
  }>(
    `SELECT id, firm_id, contact_id, sequence_id, campaign_id FROM enrollment WHERE id=$1`,
    [enrollmentId],
  );
  const row = enr.rows[0];
  if (!row?.sequence_id || !row.campaign_id) {
    return { advanced: false, campaignId: row?.campaign_id ?? null };
  }
  const met = await campaignObjectiveMet(pool, {
    firmId: row.firm_id,
    contactId: row.contact_id,
    campaignId: row.campaign_id,
  });
  if (!met) return { advanced: false, campaignId: row.campaign_id };
  const next = await nextCampaignId(pool, row.sequence_id, row.campaign_id);
  await pool.query(`UPDATE enrollment SET campaign_id=$2 WHERE id=$1`, [
    enrollmentId,
    next,
  ]);
  return { advanced: Boolean(next), campaignId: next };
}

export async function recordCampaignFailure(
  pool: Pool,
  opts: {
    firmId: string;
    contactId: string;
    sequenceId: string | null;
    campaignId: string | null;
    payload?: Record<string, unknown>;
  },
): Promise<string> {
  const id = `cfail-${randomUUID()}`;
  await pool.query(
    `INSERT INTO campaign_failure (id, firm_id, contact_id, campaign_id, sequence_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
    [
      id,
      opts.firmId,
      opts.contactId,
      opts.campaignId,
      opts.sequenceId,
      JSON.stringify(opts.payload ?? {}),
    ],
  );
  return id;
}

export function pickVariationContent(
  variations: Array<{
    apply_mode: string;
    attempt_n: number | null;
    ord: number;
    content: Record<string, unknown>;
  }>,
  attemptN: number,
): Record<string, unknown> {
  const sorted = variations.slice().sort((a, b) => a.ord - b.ord);
  const only = sorted.find((row) => row.apply_mode === "only_this" && row.attempt_n === attemptN);
  if (only) return only.content ?? {};
  const excepted = sorted.find(
    (row) => row.apply_mode === "every_except" && row.attempt_n != null && row.attempt_n !== attemptN,
  );
  if (excepted) return excepted.content ?? {};
  const every = sorted.find((row) => row.apply_mode === "every");
  return (every ?? sorted[0])?.content ?? {};
}

export async function pickAuthoredContent(
  pool: Pool,
  campaignId: string | null,
  token: string,
  attemptN: number,
): Promise<{ token: string; content: Record<string, unknown> } | null> {
  if (!campaignId) return null;
  const camp = await pool.query<{ override_this: boolean }>(
    `SELECT override_this FROM campaign WHERE id=$1`,
    [campaignId],
  );
  if (!camp.rows[0]?.override_this) return null;
  const ch = await pool.query<{ id: string; token: string; content: Record<string, unknown> }>(
    `SELECT id, token, content FROM campaign_channel
     WHERE campaign_id=$1 AND token=$2
     ORDER BY ord ASC LIMIT 1`,
    [campaignId, token],
  );
  const row = ch.rows[0];
  if (!row) return null;
  const vars = await pool.query<{
    apply_mode: string;
    attempt_n: number | null;
    ord: number;
    content: Record<string, unknown>;
  }>(
    `SELECT apply_mode, attempt_n, ord, content
     FROM campaign_channel_variation WHERE campaign_channel_id=$1 ORDER BY ord ASC`,
    [row.id],
  );
  const content = vars.rows.length
    ? pickVariationContent(vars.rows, attemptN)
    : (row.content ?? {});
  return { token: row.token, content };
}

export async function firstAuthoredChannel(
  pool: Pool,
  campaignId: string | null,
  attemptN = 1,
): Promise<{ token: string; content: Record<string, unknown> } | null> {
  if (!campaignId) return null;
  const camp = await pool.query<{ override_this: boolean }>(
    `SELECT override_this FROM campaign WHERE id=$1`,
    [campaignId],
  );
  if (!camp.rows[0]?.override_this) return null;
  const ch = await pool.query<{ token: string }>(
    `SELECT token FROM campaign_channel
     WHERE campaign_id=$1 ORDER BY ord ASC LIMIT 1`,
    [campaignId],
  );
  const token = ch.rows[0]?.token;
  if (!token) return null;
  return pickAuthoredContent(pool, campaignId, token, attemptN);
}

export function platformTemplateIdForClass(sequenceClass: string): string {
  if (sequenceClass === "reactivation") return "tpl.reactivation.v1";
  if (sequenceClass === "reengagement") return "tpl.reengagement.v1";
  return "tpl.optin_launch.v1";
}
