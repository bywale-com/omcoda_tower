/**
 * Shared cascade primitives for event path (machine.ts) and time path (worker).
 * Thresholds / channel order are always read from seeded rule/sequence tables.
 */
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { getPool } from "./db.ts";
import { dispatchEmail, dispatchSms, isHaltBlockingNew, type DispatchResult } from "./dispatchSend.ts";
import { shouldLiveSend } from "./sendMode.ts";
import {
  loadTemplateCells,
  resolveBoundTemplate,
  type NormalizedCell,
} from "./templateWalk.ts";

export type AttemptState = {
  delivered?: boolean;
  opened?: boolean;
  link_clicked?: boolean;
  form_started?: boolean;
  form_submitted?: boolean;
  inbound_override?: boolean;
  delivered_at?: string;
  opened_at?: string;
  form_started_at?: string;
  last_escalation?: string;
  /** Authored template cursor — cells are the sequence; ladder escalates within a cell */
  templateId?: string;
  cellIndex?: number;
  cellId?: string;
  enrolledAt?: string;
  [key: string]: unknown;
};

export type CriteriaRow = {
  id: string;
  label: string;
  enabled: boolean;
  when_clause: string | null;
  condition_clause: string | null;
  set_value: string | null;
  threshold: string | number | null;
  threshold_unit: string | null;
};

export type ActiveAttemptRow = {
  id: string;
  firm_id: string;
  contact_id: string;
  enrollment_id: string | null;
  owner_channel: string | null;
  status: string;
  state: AttemptState;
  window_started_at: string;
  fired_criteria: Record<string, string>;
  created_at: string;
};

function msForThreshold(threshold: number, unit: string | null): number {
  const u = (unit ?? "minutes").toLowerCase();
  if (u.startsWith("hour")) return threshold * 60 * 60 * 1000;
  if (u.startsWith("day")) return threshold * 24 * 60 * 60 * 1000;
  return threshold * 60 * 1000; // minutes default
}

function channelFromWhen(whenClause: string | null): string | null {
  if (!whenClause) return null;
  const m = whenClause.match(/channel\s*=\s*(text|email|form|sms)/i);
  return m ? m[1].toLowerCase().replace("sms", "text") : null;
}

export async function loadChannelOrder(pool: Pool, firmId: string): Promise<string[]> {
  const rows = await pool.query<{ token: string }>(
    `SELECT token FROM seq_channel_ownership_order
     WHERE firm_id IS NULL OR firm_id = $1
     ORDER BY CASE WHEN firm_id = $1 THEN 0 ELSE 1 END, ord ASC`,
    [firmId],
  );
  const tokens = rows.rows.map((r) => r.token.toLowerCase());
  return tokens.length ? tokens : ["text", "email", "form"];
}

export async function loadAttemptCriteria(pool: Pool, firmId: string): Promise<CriteriaRow[]> {
  const rows = await pool.query<CriteriaRow>(
    `SELECT id, label, enabled, when_clause, condition_clause, set_value, threshold, threshold_unit
     FROM rule_attempt_criteria
     WHERE enabled = true AND (firm_id IS NULL OR firm_id = $1)
     ORDER BY ord ASC`,
    [firmId],
  );
  return rows.rows;
}

export async function ensureTickWorkflow(pool: Pool, firmId: string): Promise<string> {
  const id = `wf-tick-${firmId}`;
  await pool.query(
    `INSERT INTO workflow (id, firm_id, name, target)
     VALUES ($1,$2,'Tick worker (faceless time)', 'contact')
     ON CONFLICT (id) DO NOTHING`,
    [id, firmId],
  );
  await pool.query(
    `INSERT INTO workflow_state (workflow_id, status) VALUES ($1,'active')
     ON CONFLICT (workflow_id) DO NOTHING`,
    [id],
  );
  return id;
}

export async function writeEngagement(
  pool: Pool,
  firmId: string,
  contactId: string,
  eventKind: string,
  payload: Record<string, unknown>,
): Promise<string> {
  const id = `eng-${randomUUID()}`;
  await pool.query(
    `INSERT INTO engagement_records (id, firm_id, contact_id, event_kind, payload)
     VALUES ($1,$2,$3,$4,$5::jsonb)`,
    [id, firmId, contactId, eventKind, JSON.stringify(payload)],
  );
  return id;
}

async function hasInboundOverride(
  pool: Pool,
  attempt: ActiveAttemptRow,
): Promise<boolean> {
  if (attempt.state?.inbound_override) return true;
  const since = attempt.window_started_at;
  const inbound = await pool.query(
    `SELECT 1 FROM engagement_records
     WHERE firm_id=$1 AND contact_id=$2
       AND event_kind IN ('inbound_reply','form_visit','inbound_override')
       AND created_at >= $3::timestamptz
     LIMIT 1`,
    [attempt.firm_id, attempt.contact_id, since],
  );
  return Boolean(inbound.rowCount && inbound.rowCount > 0);
}

function clockAnchor(attempt: ActiveAttemptRow, channel: string): Date {
  const state = attempt.state ?? {};
  // Re-entries do not reset the clock — prefer original form_started_at / window_started_at
  if (channel === "form" && state.form_started_at) {
    return new Date(String(state.form_started_at));
  }
  if (state.delivered_at) return new Date(String(state.delivered_at));
  if (state.opened_at) return new Date(String(state.opened_at));
  return new Date(attempt.window_started_at);
}

function criteriaDue(
  row: CriteriaRow,
  attempt: ActiveAttemptRow,
  now: Date,
): boolean {
  if (!row.enabled || row.threshold == null) return false;
  const channel = channelFromWhen(row.when_clause);
  const owner = (attempt.owner_channel ?? "").toLowerCase();
  if (channel && channel !== owner && !(channel === "text" && owner === "sms")) {
    return false;
  }

  const state = attempt.state ?? {};
  const when = (row.when_clause ?? "").toLowerCase();
  const cond = (row.condition_clause ?? "").toLowerCase();

  // Match seeded when/condition semantics against attempt state
  if (when.includes("delivered") && !state.delivered) return false;
  if (when.includes("opened") && !state.opened) return false;
  if (when.includes("started") && !state.form_started) return false;
  if (when.includes("primer_sent") && !state.delivered) return false;

  if (cond.includes("not opened") && state.opened) return false;
  if (cond.includes("link not clicked") && state.link_clicked) return false;
  if (cond.includes("not submitted") && state.form_submitted) return false;
  if (cond.includes("non_reply") && state.opened) return false; // reply counted as opened/inbound

  const threshold = Number(row.threshold);
  if (!Number.isFinite(threshold)) return false;
  const elapsed = now.getTime() - clockAnchor(attempt, channel ?? owner).getTime();
  return elapsed >= msForThreshold(threshold, row.threshold_unit);
}

export type TickFire = {
  attemptId: string;
  criteriaId: string;
  setValue: string | null;
  fromChannel: string;
  toChannel: string | null;
  runId: string;
  engagementId: string;
  send?: DispatchResult;
};

export async function escalateAttemptWindow(
  pool: Pool,
  attempt: ActiveAttemptRow,
  criteria: CriteriaRow,
  channelOrder: string[],
  now = new Date(),
): Promise<TickFire | null> {
  if (attempt.fired_criteria?.[criteria.id]) {
    return null; // idempotent — already fired
  }
  if (await hasInboundOverride(pool, attempt)) {
    await pool.query(
      `UPDATE active_attempts
       SET status='nullified', updated_at=now(),
           state = state || jsonb_build_object('inbound_override', true, 'nullified_at', $2::text)
       WHERE id=$1`,
      [attempt.id, now.toISOString()],
    );
    await writeEngagement(pool, attempt.firm_id, attempt.contact_id, "attempt_nullified", {
      attemptId: attempt.id,
      reason: "inbound_override",
      criteriaId: criteria.id,
    });
    return null;
  }
  if (!criteriaDue(criteria, attempt, now)) return null;

  const fromChannel = (attempt.owner_channel ?? "text").toLowerCase();
  const setValue = criteria.set_value;
  let toChannel: string | null = null;

  if (setValue === "return_to_sequence_head") {
    toChannel = channelOrder[0] ?? "text";
  } else if (
    setValue === "escalate_forward" ||
    setValue === "next_attempt_or_forward" ||
    setValue === "tier_signal_low_nonreply"
  ) {
    const idx = channelOrder.indexOf(fromChannel === "sms" ? "text" : fromChannel);
    toChannel = idx >= 0 && idx < channelOrder.length - 1 ? channelOrder[idx + 1] : null;
  }

  const fired = {
    ...(attempt.fired_criteria ?? {}),
    [criteria.id]: now.toISOString(),
  };
  const nextState: AttemptState = {
    ...(attempt.state ?? {}),
    last_escalation: criteria.id,
    // Do NOT reset window_started_at — re-entries keep original clock
    delivered: toChannel === fromChannel ? attempt.state?.delivered : false,
    opened: false,
    link_clicked: false,
  };

  await pool.query(
    `UPDATE active_attempts
     SET owner_channel=$2,
         fired_criteria=$3::jsonb,
         state=$4::jsonb,
         updated_at=now()
     WHERE id=$1 AND status='open'`,
    [attempt.id, toChannel ?? fromChannel, JSON.stringify(fired), JSON.stringify(nextState)],
  );

  const workflowId = await ensureTickWorkflow(pool, attempt.firm_id);
  const runId = `run-${randomUUID()}`;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label, node_status, counts, finished_at)
     VALUES ($1,$2,$3,'success',$4,$5::jsonb,$6::jsonb,now())`,
    [
      runId,
      workflowId,
      attempt.firm_id,
      `window:${criteria.id}`,
      JSON.stringify({
        attemptId: attempt.id,
        criteriaId: criteria.id,
        fromChannel,
        toChannel,
        setValue,
      }),
      JSON.stringify({ fired: 1 }),
    ],
  );

  const engagementId = await writeEngagement(
    pool,
    attempt.firm_id,
    attempt.contact_id,
    "window_fired",
    {
      attemptId: attempt.id,
      criteriaId: criteria.id,
      criteriaLabel: criteria.label,
      fromChannel,
      toChannel,
      setValue,
      runId,
      threshold: criteria.threshold,
      threshold_unit: criteria.threshold_unit,
    },
  );

  let send: DispatchResult | undefined;
  if (toChannel && (toChannel === "email" || toChannel === "text")) {
    const subject = `Tower follow-up (${criteria.id})`;
    const bodyText = `Sequence advanced: ${fromChannel} → ${toChannel} after ${criteria.label}`;
    send = await actuateChannelSend({
      firmId: attempt.firm_id,
      contactId: attempt.contact_id,
      channel: toChannel,
      purpose: "cem",
      subject,
      bodyText,
    });
    if (send.ok && !send.dryRun) {
      await writeEngagement(pool, attempt.firm_id, attempt.contact_id, "send_live", {
        attemptId: attempt.id,
        channel: toChannel,
        messageId: send.messageId,
        runId,
        criteriaId: criteria.id,
        criteriaLabel: criteria.label,
        subject,
        bodyText,
      });
    } else if (send.ok && send.dryRun) {
      await writeEngagement(pool, attempt.firm_id, attempt.contact_id, "send_dry_run", {
        attemptId: attempt.id,
        channel: toChannel,
        reason: send.reason,
        runId,
        criteriaId: criteria.id,
        criteriaLabel: criteria.label,
        subject,
        bodyText,
      });
    }
  }

  return {
    attemptId: attempt.id,
    criteriaId: criteria.id,
    setValue,
    fromChannel,
    toChannel,
    runId,
    engagementId,
    send,
  };
}

export type ChannelSendInput = {
  firmId: string;
  contactId: string;
  channel: "text" | "email" | "sms" | string;
  purpose: string;
  subject?: string;
  bodyText?: string;
};

export async function actuateChannelSend(input: ChannelSendInput): Promise<DispatchResult> {
  const pool = getPool();
  const contact = await pool.query<{ email: string | null; phone: string | null }>(
    `SELECT email, phone FROM contact_records WHERE id=$1 AND firm_id=$2 LIMIT 1`,
    [input.contactId, input.firmId],
  );
  const row = contact.rows[0];
  const channel = input.channel === "sms" ? "text" : input.channel;

  if (channel === "email") {
    const to =
      row?.email ||
      (shouldLiveSend(input.contactId) ? process.env.TEST_EMAIL_TO : undefined);
    if (!to) {
      return {
        ok: true,
        dryRun: true,
        reason: "no email on contact — dry-run intent only",
        channel: "email",
      };
    }
    return dispatchEmail({
      to,
      subject: input.subject ?? "Tower",
      bodyText: input.bodyText ?? "Tower sequence step",
      firmId: input.firmId,
      contactId: input.contactId,
      purpose: input.purpose,
    });
  }

  if (channel === "text") {
    const to =
      row?.phone ||
      (shouldLiveSend(input.contactId) ? process.env.TEST_SMS_TO : undefined);
    if (!to) {
      return {
        ok: true,
        dryRun: true,
        reason: "no phone on contact — dry-run intent only",
        channel: "sms",
      };
    }
    return dispatchSms({
      to,
      body: input.bodyText ?? "Tower sequence step",
      firmId: input.firmId,
      contactId: input.contactId,
      purpose: input.purpose,
    });
  }

  return {
    ok: true,
    dryRun: true,
    reason: `channel ${channel} has no live dispatcher`,
    channel: "email",
  };
}

export type EnrollActuateInput = {
  firmId: string;
  contactId: string;
  agentRef: string;
  sequenceId?: string;
  workflowRunId?: string;
  payload?: Record<string, unknown>;
  /** First owner channel; default = head of channel order */
  ownerChannel?: string;
  purpose?: string;
  /** When true, also fire the first-step send for the owner channel */
  fireFirstStep?: boolean;
};

export async function enrollAndActuate(input: EnrollActuateInput) {
  const pool = getPool();

  // H1: firm-book or contact halt blocks NEW enrollments (does not abort in-flight attempts).
  if (await isHaltBlockingNew(input.firmId, input.contactId)) {
    return {
      enrollmentId: "",
      attemptId: "",
      dryRun: true,
      send: {
        ok: false as const,
        deny: "policy",
        detail: "halt active",
      },
      blocked: "halt" as const,
    };
  }

  const live = shouldLiveSend(input.contactId);
  const id = `enr-${randomUUID()}`;
  const tpl = await resolveBoundTemplate(pool, input.firmId, input.agentRef);
  const firstCell: NormalizedCell | null = tpl?.cells[0] ?? null;
  const payload = {
    ...(input.payload ?? {}),
    dryRun: !live,
    templateId: tpl?.templateId ?? input.agentRef,
    cellId: firstCell?.id ?? null,
  };

  await pool.query(
    `INSERT INTO enrollment (id, firm_id, contact_id, agent_ref, sequence_id, workflow_run_id, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [
      id,
      input.firmId,
      input.contactId,
      input.agentRef,
      input.sequenceId ?? tpl?.templateId ?? null,
      input.workflowRunId ?? null,
      JSON.stringify(payload),
    ],
  );

  const order = await loadChannelOrder(pool, input.firmId);
  // Authored cell channel wins; ladder is within-cell escalation after that.
  const owner =
    input.ownerChannel ?? firstCell?.channel ?? order[0] ?? "text";
  const attemptId = `att-${randomUUID()}`;
  const now = new Date().toISOString();
  const state: AttemptState = {
    delivered: true,
    delivered_at: now,
    step: firstCell?.token ?? "primer",
    templateId: tpl?.templateId ?? input.agentRef,
    cellIndex: 0,
    cellId: firstCell?.id,
    enrolledAt: now,
  };
  await pool.query(
    `INSERT INTO active_attempts
       (id, firm_id, contact_id, enrollment_id, owner_channel, status, state, window_started_at, fired_criteria)
     VALUES ($1,$2,$3,$4,$5,'open',$6::jsonb,$7::timestamptz,'{}'::jsonb)`,
    [
      attemptId,
      input.firmId,
      input.contactId,
      id,
      owner,
      JSON.stringify(state),
      now,
    ],
  );

  let send: DispatchResult | undefined;
  if (input.fireFirstStep !== false) {
    const subject = firstCell?.subject ?? `Tower — ${input.agentRef}`;
    const bodyText =
      firstCell?.bodyText ?? `Sequence start via ${input.agentRef}`;
    send = await actuateChannelSend({
      firmId: input.firmId,
      contactId: input.contactId,
      channel: owner,
      purpose: input.purpose ?? "opt-in",
      subject,
      bodyText,
    });
    await writeEngagement(pool, input.firmId, input.contactId, live ? "send_live" : "send_dry_run", {
      enrollmentId: id,
      attemptId,
      channel: owner,
      templateId: state.templateId,
      cellId: state.cellId,
      cellIndex: 0,
      subject,
      bodyText,
      messageId: send.ok && !send.dryRun ? send.messageId : undefined,
      reason: send.ok && send.dryRun ? send.reason : undefined,
      send,
    });
  }

  return {
    enrollmentId: id,
    attemptId,
    dryRun: !live,
    send,
    templateId: state.templateId,
    cellId: state.cellId,
    cellIndex: 0,
  };
}

/**
 * Advance authored cell cursor when the next cell's offset is due.
 * Channel ladder still escalates *within* the current cell via escalateAttemptWindow.
 */
export async function advanceTemplateCellIfDue(
  pool: Pool,
  attempt: ActiveAttemptRow,
  now = new Date(),
): Promise<TickFire | null> {
  const state = attempt.state ?? {};
  const templateId = typeof state.templateId === "string" ? state.templateId : null;
  if (!templateId) return null;
  const cellIndex = typeof state.cellIndex === "number" ? state.cellIndex : 0;
  const enrolledAt = state.enrolledAt
    ? new Date(String(state.enrolledAt))
    : new Date(attempt.window_started_at);

  const tpl = await loadTemplateCellsCached(pool, templateId);
  if (!tpl || cellIndex >= tpl.cells.length - 1) return null;

  const nextIndex = cellIndex + 1;
  const next = tpl.cells[nextIndex];
  const dueAt = enrolledAt.getTime() + next.offsetMs;
  if (now.getTime() < dueAt) return null;

  const fromChannel = (attempt.owner_channel ?? "text").toLowerCase();
  const toChannel = next.channel;
  const fired = { ...(attempt.fired_criteria ?? {}) };
  const nextState: AttemptState = {
    ...state,
    cellIndex: nextIndex,
    cellId: next.id,
    step: next.token,
    last_escalation: `cell:${next.id}`,
    delivered: true,
    delivered_at: now.toISOString(),
    opened: false,
    link_clicked: false,
    // Fresh within-cell window
  };

  await pool.query(
    `UPDATE active_attempts
     SET owner_channel=$2,
         fired_criteria='{}'::jsonb,
         state=$3::jsonb,
         window_started_at=$4::timestamptz,
         updated_at=now()
     WHERE id=$1 AND status='open'`,
    [attempt.id, toChannel, JSON.stringify(nextState), now.toISOString()],
  );

  const workflowId = await ensureTickWorkflow(pool, attempt.firm_id);
  const runId = `run-${randomUUID()}`;
  await pool.query(
    `INSERT INTO workflow_run (id, workflow_id, firm_id, status, trigger_label, node_status, counts, finished_at)
     VALUES ($1,$2,$3,'success',$4,$5::jsonb,$6::jsonb,now())`,
    [
      runId,
      workflowId,
      attempt.firm_id,
      `cell:${next.id}`,
      JSON.stringify({
        attemptId: attempt.id,
        templateId,
        fromCellIndex: cellIndex,
        toCellIndex: nextIndex,
        cellId: next.id,
        fromChannel,
        toChannel,
      }),
      JSON.stringify({ fired: 1 }),
    ],
  );

  const engagementId = await writeEngagement(
    pool,
    attempt.firm_id,
    attempt.contact_id,
    "cell_advanced",
    {
      attemptId: attempt.id,
      templateId,
      fromCellIndex: cellIndex,
      toCellIndex: nextIndex,
      cellId: next.id,
      cellLabel: next.label,
      fromChannel,
      toChannel,
      runId,
    },
  );

  let send: DispatchResult | undefined;
  if (toChannel === "email" || toChannel === "text") {
    const subject = next.subject;
    const bodyText = next.bodyText;
    send = await actuateChannelSend({
      firmId: attempt.firm_id,
      contactId: attempt.contact_id,
      channel: toChannel,
      purpose: "cem",
      subject,
      bodyText,
    });
    const live = shouldLiveSend(attempt.contact_id);
    await writeEngagement(
      pool,
      attempt.firm_id,
      attempt.contact_id,
      live && send.ok && !send.dryRun ? "send_live" : "send_dry_run",
      {
        attemptId: attempt.id,
        cellId: next.id,
        cellLabel: next.label,
        channel: toChannel,
        subject,
        bodyText,
        messageId: send.ok && !send.dryRun ? send.messageId : undefined,
        reason: send.ok && send.dryRun ? send.reason : undefined,
        send,
        runId,
      },
    );
  }

  return {
    attemptId: attempt.id,
    criteriaId: `cell:${next.id}`,
    setValue: "advance_template_cell",
    fromChannel,
    toChannel,
    runId,
    engagementId,
    send,
  };
}

const templateCache = new Map<string, Awaited<ReturnType<typeof loadTemplateCells>>>();

async function loadTemplateCellsCached(pool: Pool, templateId: string) {
  if (templateCache.has(templateId)) return templateCache.get(templateId)!;
  const loaded = await loadTemplateCells(pool, templateId);
  templateCache.set(templateId, loaded);
  return loaded;
}

/** One worker tick across all open attempts (all firms). */
export async function tickOnce(now = new Date()): Promise<{
  scanned: number;
  fired: TickFire[];
  nullified: number;
}> {
  const pool = getPool();
  const attempts = await pool.query<ActiveAttemptRow>(
    `SELECT id, firm_id, contact_id, enrollment_id, owner_channel, status,
            COALESCE(state, '{}'::jsonb) AS state,
            COALESCE(window_started_at, created_at) AS window_started_at,
            COALESCE(fired_criteria, '{}'::jsonb) AS fired_criteria,
            created_at
     FROM active_attempts
     WHERE status = 'open'
     ORDER BY created_at ASC
     LIMIT 500`,
  );

  const fired: TickFire[] = [];
  let nullified = 0;

  // Group criteria/order per firm
  const criteriaByFirm = new Map<string, CriteriaRow[]>();
  const orderByFirm = new Map<string, string[]>();

  for (const attempt of attempts.rows) {
    // Normalize jsonb
    if (typeof attempt.state === "string") {
      attempt.state = JSON.parse(attempt.state) as AttemptState;
    }
    if (typeof attempt.fired_criteria === "string") {
      attempt.fired_criteria = JSON.parse(attempt.fired_criteria) as Record<string, string>;
    }

    if (await hasInboundOverride(pool, attempt)) {
      await pool.query(
        `UPDATE active_attempts SET status='nullified', updated_at=now(),
           state = state || jsonb_build_object('inbound_override', true)
         WHERE id=$1 AND status='open'`,
        [attempt.id],
      );
      nullified += 1;
      continue;
    }

    // Authored cell cursor first (day/offset walk), then within-cell channel ladder.
    {
      const cellFire = await advanceTemplateCellIfDue(pool, attempt, now);
      if (cellFire) fired.push(cellFire);
    }

    if (!criteriaByFirm.has(attempt.firm_id)) {
      criteriaByFirm.set(attempt.firm_id, await loadAttemptCriteria(pool, attempt.firm_id));
      orderByFirm.set(attempt.firm_id, await loadChannelOrder(pool, attempt.firm_id));
    }
    const criteria = criteriaByFirm.get(attempt.firm_id)!;
    const order = orderByFirm.get(attempt.firm_id)!;

    for (const row of criteria) {
      // Reload attempt after possible prior fire in this tick
      const fresh = await pool.query<ActiveAttemptRow>(
        `SELECT id, firm_id, contact_id, enrollment_id, owner_channel, status,
                COALESCE(state, '{}'::jsonb) AS state,
                COALESCE(window_started_at, created_at) AS window_started_at,
                COALESCE(fired_criteria, '{}'::jsonb) AS fired_criteria,
                created_at
         FROM active_attempts WHERE id=$1`,
        [attempt.id],
      );
      const current = fresh.rows[0];
      if (!current || current.status !== "open") break;
      if (typeof current.state === "string") current.state = JSON.parse(current.state);
      if (typeof current.fired_criteria === "string") {
        current.fired_criteria = JSON.parse(current.fired_criteria as unknown as string);
      }

      const result = await escalateAttemptWindow(pool, current, row, order, now);
      if (result) fired.push(result);
    }
  }

  // Also fire active schedule workflow_trigger rows (validated-shape walk)
  try {
    const { dispatchScheduleTriggers } = await import("./workflowWalk.js");
    const scheduled = await dispatchScheduleTriggers(pool);
    if (scheduled.length) {
      console.log(
        "[cascade] schedule workflows fired",
        scheduled.map((s) => `${s.workflowId}:${s.enrollments}`).join(","),
      );
    }
  } catch (err) {
    console.warn("[cascade] schedule triggers:", err);
  }

  return { scanned: attempts.rowCount ?? 0, fired, nullified };
}
