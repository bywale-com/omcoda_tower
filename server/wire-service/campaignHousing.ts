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
  }>(
    `SELECT id, campaign_id, token, ord, override_content, content
     FROM campaign_channel WHERE campaign_id = ANY($1::text[])
     ORDER BY ord ASC`,
    [ids],
  );

  const objBy = new Map(objs.rows.map((o) => [o.campaign_id, o]));
  const chBy = new Map<string, typeof chans.rows>();
  for (const ch of chans.rows) {
    const list = chBy.get(ch.campaign_id) ?? [];
    list.push(ch);
    chBy.set(ch.campaign_id, list);
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
      channels: (chBy.get(c.id) ?? []).map((ch) => ({
        id: ch.id,
        token: ch.token,
        ord: ch.ord,
        override_content: ch.override_content,
        content: ch.content ?? {},
      })),
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
        channelKeep.push(chId);
        await pool.query(
          `INSERT INTO campaign_channel
             (id, campaign_id, token, ord, override_content, content, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6::jsonb,now())
           ON CONFLICT (campaign_id, token) DO UPDATE SET
             ord=EXCLUDED.ord,
             override_content=EXCLUDED.override_content,
             content=EXCLUDED.content,
             updated_at=now()`,
          [
            chId,
            id,
            ch.token,
            ch.ord ?? 0,
            Boolean(ch.overrideContent),
            JSON.stringify(ch.content ?? {}),
          ],
        );
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

export async function firstAuthoredChannel(
  pool: Pool,
  campaignId: string | null,
): Promise<{ token: string; content: Record<string, unknown> } | null> {
  if (!campaignId) return null;
  const camp = await pool.query<{ override_this: boolean }>(
    `SELECT override_this FROM campaign WHERE id=$1`,
    [campaignId],
  );
  if (!camp.rows[0]?.override_this) return null;
  const ch = await pool.query<{ token: string; content: Record<string, unknown> }>(
    `SELECT token, content FROM campaign_channel
     WHERE campaign_id=$1 ORDER BY ord ASC LIMIT 1`,
    [campaignId],
  );
  return ch.rows[0] ?? null;
}

export function platformTemplateIdForClass(sequenceClass: string): string {
  if (sequenceClass === "reactivation") return "tpl.reactivation.v1";
  if (sequenceClass === "reengagement") return "tpl.reengagement.v1";
  return "tpl.optin_launch.v1";
}
