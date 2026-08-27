/**
 * Wait occupancy desk — N1 / N1b / N2. Packet 028.
 * Resume this run's outgoing. Do not dispatch a second graph.
 */
import type { Context } from "hono";
import { getPool } from "./db.ts";
import { requireSessionFirm } from "./sessionFirm.ts";
import { resumeWaitRun } from "./workflowWalk.ts";
import type { RunWrite } from "./runWrites.ts";

function json(c: Context, body: unknown, status = 200) {
  return c.json(body, status);
}

function sessionApprover(raw: string | undefined): "consultant" | "operator" {
  return raw === "operator" ? "operator" : "consultant";
}

/** GET /machine/wait-occupancy — grouped notes for this session's Approver. */
export async function handleWaitOccupancyList(c: Context) {
  const firm = await requireSessionFirm(c);
  const approver = sessionApprover(c.req.query("approver"));
  const pool = getPool();
  const { rows } = await pool.query<{
    workflow_id: string;
    wait_node_id: string;
    title: string;
    n: string;
  }>(
    approver === "operator"
      ? `SELECT workflow_id, wait_node_id, title, COUNT(*)::text AS n
           FROM wait_occupancy
          WHERE status IN ('open','scheduled')
            AND approver = 'operator'
          GROUP BY workflow_id, wait_node_id, title
          ORDER BY MIN(created_at) ASC`
      : `SELECT workflow_id, wait_node_id, title, COUNT(*)::text AS n
           FROM wait_occupancy
          WHERE status IN ('open','scheduled')
            AND approver = 'consultant'
            AND firm_id = $1
          GROUP BY workflow_id, wait_node_id, title
          ORDER BY MIN(created_at) ASC`,
    approver === "operator" ? [] : [firm],
  );
  return json(c, {
    notes: rows.map((row) => ({
      workflowId: row.workflow_id,
      waitNodeId: row.wait_node_id,
      title: row.title,
      count: Number(row.n),
      approver,
    })),
  });
}

/** POST /machine/wait-occupancy/approve — Approve now / later for that Wait group. */
export async function handleWaitOccupancyApprove(c: Context) {
  const firm = await requireSessionFirm(c);
  const body = await c.req.json<{
    workflowId?: string;
    waitNodeId?: string;
    mode?: "now" | "later";
    approveAt?: string;
    approver?: string;
  }>();
  const workflowId = String(body.workflowId ?? "").trim();
  const waitNodeId = String(body.waitNodeId ?? "").trim();
  const mode = body.mode === "later" ? "later" : "now";
  const approver = sessionApprover(body.approver ?? c.req.query("approver"));
  if (!workflowId || !waitNodeId) {
    return json(c, { ok: false, error: "workflowId and waitNodeId required" }, 400);
  }
  if (mode === "later" && !String(body.approveAt ?? "").trim()) {
    return json(c, { ok: false, error: "approveAt required for later" }, 400);
  }

  const pool = getPool();
  const laterOpenSql =
    approver === "operator"
      ? `workflow_id=$1 AND wait_node_id=$2 AND approver='operator' AND status='open'`
      : `workflow_id=$1 AND wait_node_id=$2 AND approver='consultant' AND firm_id=$3 AND status='open'`;
  const groupSql =
    approver === "operator"
      ? `workflow_id=$1 AND wait_node_id=$2 AND approver='operator' AND status IN ('open','scheduled')`
      : `workflow_id=$1 AND wait_node_id=$2 AND approver='consultant' AND firm_id=$3 AND status IN ('open','scheduled')`;
  const groupParams =
    approver === "operator" ? [workflowId, waitNodeId] : [workflowId, waitNodeId, firm];

  if (mode === "later") {
    const approveAt = new Date(String(body.approveAt)).toISOString();
    const scheduled = await pool.query<{ workflow_run_id: string }>(
      approver === "operator"
        ? `UPDATE wait_occupancy
           SET status='scheduled', approve_at=$3::timestamptz
           WHERE ${laterOpenSql}
           RETURNING workflow_run_id`
        : `UPDATE wait_occupancy
           SET status='scheduled', approve_at=$4::timestamptz
           WHERE ${laterOpenSql}
           RETURNING workflow_run_id`,
      [...groupParams, approveAt],
    );
    const runIds = [...new Set(scheduled.rows.map((r) => r.workflow_run_id))];
    if (runIds.length) {
      await pool.query(
        `UPDATE workflow_run
         SET resume_at=$1::timestamptz
         WHERE id = ANY($2::text[]) AND status='waiting'`,
        [approveAt, runIds],
      );
    }
    return json(c, { ok: true, mode: "later", runs: runIds.length });
  }

  const open = await pool.query<{
    id: string;
    workflow_run_id: string;
    contact_id: string;
    firm_id: string;
  }>(
    `SELECT id, workflow_run_id, contact_id, firm_id
       FROM wait_occupancy
      WHERE ${groupSql}`,
    groupParams,
  );
  if (!open.rows.length) {
    return json(c, { ok: true, mode: "now", runs: 0 });
  }

  await pool.query(
    `UPDATE wait_occupancy
     SET status='approved', approved_at=now()
     WHERE id = ANY($1::text[])`,
    [open.rows.map((r) => r.id)],
  );

  const byRun = new Map<string, { firmId: string; writes: RunWrite[]; contactIds: string[] }>();
  for (const row of open.rows) {
    const cur = byRun.get(row.workflow_run_id) ?? {
      firmId: row.firm_id,
      writes: [] as RunWrite[],
      contactIds: [] as string[],
    };
    cur.writes.push({ table: "wait_occupancy", id: row.id, contact_id: row.contact_id });
    cur.contactIds.push(row.contact_id);
    byRun.set(row.workflow_run_id, cur);
  }

  let resumed = 0;
  for (const [runId, group] of byRun) {
    await resumeWaitRun(pool, {
      runId,
      workflowId,
      firmId: group.firmId,
      waitNodeId,
      contactIds: [...new Set(group.contactIds)],
      previousWrites: group.writes,
    });
    resumed += 1;
  }
  return json(c, { ok: true, mode: "now", runs: resumed });
}
