/**
 * Assignments and executions.
 *
 * An initiative is the capability. A packet is one accountable change.
 * An assignment is the schedulable unit and may name several packets.
 * An execution is one Cursor run of that assignment. The run moves
 * dispatched → started → running → completed, failed, refused, or interrupted.
 * A pending dispatch reserves the engineer slot only until its reservation
 * ends. It does not occupy the slot after that.
 *
 * This module does not call GitHub or Cursor. The caller passes `now`.
 */
import {
  acknowledgeDispatch,
  applyEvent,
  decide,
  type DispatchRecord,
  type SiblingLink,
  type WorkItem,
  type World,
} from "./machine.ts";

export const PENDING_RESERVE_MS = 30 * 60 * 1000;
export const START_HOLD_MS = 15 * 60 * 1000;
export const ARCHITECT_RESERVE_MS = 3 * 60 * 60 * 1000;
export const MAX_RUNS_PER_AGENT = 4;
export const MAX_ANALYST_PACKETS = 3;
export const ENGINEER_BACKLOG_LIMIT = 2;

export const ENGINEER_QUEUE_STAGES = ["change_specified", "engineering", "candidate", "verifying"] as const;

export type ExecutionPhase =
  | "dispatched"
  | "started"
  | "running"
  | "completed"
  | "failed"
  | "refused"
  | "interrupted";

export interface WorkerExecution {
  id: string;
  assignmentId: string;
  role: "architect" | "analyst" | "engineer";
  phase: ExecutionPhase;
  packetIds: string[];
  revisions: Record<string, string>;
  label: DispatchRecord["label"] | null;
  prHead: string;
  agentId: string | null;
  continuation: "fresh" | "resume";
  /**
   * `bound` means an already-running agent was recorded without adding a wake label.
   * Absent means the label actuator confirmed the wake.
   */
  delivery?: "label" | "bound";
  issuedAt: string;
  startedAt: string | null;
  runningAt: string | null;
  endedAt: string | null;
  reserveUntil: string;
  startUntil: string | null;
  leaseUntil: string | null;
  reason: string | null;
  /** Present only when a provider usage record was stored. Never invented. */
  usageUsd?: number | null;
}

export interface Assignment {
  id: string;
  role: WorkerExecution["role"];
  initiativeId: string;
  packetIds: string[];
  /** Why these packets share an execution. Null when the assignment is one packet. */
  basis: string | null;
  executionIds: string[];
}

export interface ExecutionLedger {
  stateRevision: number;
  usedDispatches: number;
  packets: Record<string, WorkItem>;
  initiatives: Record<
    string,
    {
      id: string;
      session: string;
      revision: string;
      dispatch: DispatchRecord | null;
      queue: string;
      checkpointAt?: string | null;
      contextSaturated?: boolean;
      updatedAt?: string | null;
    }
  >;
  executions?: Record<string, WorkerExecution>;
  assignments?: Record<string, Assignment>;
}

export interface RecoveryChange {
  id: string;
  phase: ExecutionPhase;
  reason: string;
}

const TERMINAL: ReadonlySet<ExecutionPhase> = new Set(["completed", "failed", "refused", "interrupted"]);

export function isTerminal(phase: ExecutionPhase): boolean {
  return TERMINAL.has(phase);
}

export function plusMs(iso: string, ms: number): string {
  return new Date(Date.parse(iso) + ms).toISOString();
}

export function executionOccupies(execution: WorkerExecution, now: string): boolean {
  if (isTerminal(execution.phase)) return false;
  if (execution.phase === "dispatched") return execution.reserveUntil > now;
  if (execution.phase === "started") return (execution.startUntil ?? execution.reserveUntil) > now;
  if (execution.phase === "running") return Boolean(execution.leaseUntil && execution.leaseUntil > now);
  return false;
}

export function openExecution(input: {
  stateRevision: number;
  role: WorkerExecution["role"];
  effect: string;
  packetIds: string[];
  revisions: Record<string, string>;
  label: WorkerExecution["label"];
  prHead: string;
  now: string;
  continuation: "fresh" | "resume";
  agentId?: string | null;
  reserveMs?: number;
  delivery?: "label" | "bound";
}): { execution: WorkerExecution; assignment: Assignment } {
  const primary = input.packetIds[0] ?? input.effect;
  const id = `dsp-${input.stateRevision + 1}-${input.role}-${primary}`;
  const assignmentId = `asg-${id}`;
  const execution: WorkerExecution = {
    id,
    assignmentId,
    role: input.role,
    phase: "dispatched",
    packetIds: [...input.packetIds],
    revisions: { ...input.revisions },
    label: input.label,
    prHead: input.prHead,
    agentId: input.agentId ?? null,
    continuation: input.continuation,
    ...(input.delivery ? { delivery: input.delivery } : {}),
    issuedAt: input.now,
    startedAt: null,
    runningAt: null,
    endedAt: null,
    reserveUntil: plusMs(input.now, input.reserveMs ?? PENDING_RESERVE_MS),
    startUntil: null,
    leaseUntil: null,
    reason: null,
  };
  const assignment: Assignment = {
    id: assignmentId,
    role: input.role,
    initiativeId: primary,
    packetIds: [...input.packetIds],
    basis: null,
    executionIds: [id],
  };
  return { execution, assignment };
}

function executionsOf(ledger: ExecutionLedger): Record<string, WorkerExecution> {
  return ledger.executions ?? {};
}

export function executionById(ledger: ExecutionLedger, id: string | undefined): WorkerExecution | null {
  if (!id) return null;
  return executionsOf(ledger)[id] ?? null;
}

export function liveExecutionFor(ledger: ExecutionLedger, packetId: string): WorkerExecution | null {
  const packet = ledger.packets[packetId];
  const named = executionById(ledger, packet?.dispatch?.executionId);
  if (named && !isTerminal(named.phase)) return named;
  return (
    Object.values(executionsOf(ledger)).find(
      (execution) => execution.packetIds.includes(packetId) && !isTerminal(execution.phase),
    )     ?? null
  );
}

/**
 * Record an engineer assignment for an agent that is already executing.
 * Does not add a wake label. Spends one dispatch. The cap is unchanged.
 */
export function prepareBoundEngineer<T extends ExecutionLedger & { authorizedDispatches: number | null; scope?: { status?: string } }>(
  ledger: T,
  opts: { packetId: string; workerId: string; prHead: string; now: string },
): { ok: true; reason: "bound"; ledger: T } | { ok: false; reason: string; ledger: T } {
  const refuse = (reason: string) => ({ ok: false as const, reason, ledger });
  const packet = ledger.packets[opts.packetId];
  if (!packet) return refuse("unknown_packet");
  if (!/^bc-[0-9a-f-]{8,}$/i.test(opts.workerId)) return refuse("worker_id_missing");
  if (!/^[0-9a-f]{7,64}$/i.test(opts.prHead)) return refuse("pr_head_mismatch");
  const scopeStatus = ledger.scope?.status;
  const world: World = {
    activation: "active",
    now: opts.now,
    engineeringBusy: false,
    budgetUsd: null,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
    scopeStatus:
      scopeStatus === "active" || scopeStatus === "suspended" || scopeStatus === "inactive" || scopeStatus === "complete"
        ? scopeStatus
        : undefined,
  };
  const occupied = Object.values(ledger.packets).some((other) => {
    if (other.id === opts.packetId) return false;
    if (other.stage === "engineering" && other.lease && other.lease.until > opts.now) return true;
    if (other.stage === "change_specified" && other.dispatchedEngineerRevision === other.revision) return true;
    const execution = liveExecutionFor(ledger, other.id);
    return Boolean(execution && execution.role === "engineer" && executionOccupies(execution, opts.now));
  });
  if (occupied) return refuse("concurrency");
  const decision = decide(packet, world);
  if (decision.effect !== "wake_engineer") return refuse(decision.reason);
  const next = structuredClone(ledger) as T;
  const opened = openExecution({
    stateRevision: next.stateRevision,
    role: "engineer",
    effect: "wake_engineer",
    packetIds: [packet.id],
    revisions: { [packet.id]: packet.revision },
    label: "factory-wake-engineer",
    prHead: opts.prHead,
    now: opts.now,
    continuation: "fresh",
    agentId: opts.workerId,
    delivery: "bound",
  });
  let stamped = acknowledgeDispatch(next.packets[packet.id], "wake_engineer", { prHead: opts.prHead, issuedAt: opts.now });
  if (stamped.dispatch) {
    stamped.dispatch.executionId = opened.execution.id;
    stamped.dispatch.assignmentId = opened.assignment.id;
  }
  const until = plusMs(opts.now, 60 * 60 * 1000);
  const leased = applyEvent(
    stamped,
    { type: "acquire_lease", workerId: opts.workerId, role: "engineer", until, revision: packet.revision },
    world,
  );
  if (!leased.ok) return refuse(leased.reason);
  stamped = leased.item;
  next.packets = { ...next.packets, [packet.id]: stamped };
  next.executions = { ...(next.executions ?? {}), [opened.execution.id]: opened.execution };
  opened.assignment.initiativeId = packet.initiativeId;
  next.assignments = { ...(next.assignments ?? {}), [opened.assignment.id]: opened.assignment };
  next.usedDispatches += 1;
  let drafted = applyWorkerSignal(next, packet.id, { type: "acknowledge_start", workerId: opts.workerId, now: opts.now });
  drafted = applyWorkerSignal(drafted, packet.id, {
    type: "running",
    workerId: opts.workerId,
    now: opts.now,
    leaseUntil: until,
  });
  return { ok: true, reason: "bound", ledger: drafted };
}

function componentFrom(
  packets: readonly WorkItem[],
  admit: (packet: WorkItem) => boolean,
): { packetIds: string[]; basis: string | null } | null {
  const eligible = packets.filter(admit).sort((a, b) => a.id.localeCompare(b.id));
  if (!eligible.length) return null;
  const byId = new Map(eligible.map((packet) => [packet.id, packet]));
  const seen = new Set<string>([eligible[0].id]);
  const notes: string[] = [];
  const queue = [eligible[0].id];
  while (queue.length) {
    const id = queue.shift() as string;
    for (const link of byId.get(id)?.siblings ?? []) {
      if (!byId.has(link.id) || seen.has(link.id)) continue;
      seen.add(link.id);
      notes.push(`${link.basis}: ${link.note}`);
      queue.push(link.id);
    }
  }
  const packetIds = [...seen].sort();
  return { packetIds, basis: packetIds.length > 1 ? (notes[0] ?? "sibling") : null };
}

/**
 * Eligible released packets that share an Architect-recorded sibling link.
 * The lowest eligible id is the seed. The assignment is that whole component.
 * `limit` is the size fuse after a run has already ended `context_saturated`.
 * A packet whose sibling is not eligible is dispatched alone.
 */
export function analystAssignment(
  packets: readonly WorkItem[],
  opts?: { limit?: number | null },
): { packetIds: string[]; basis: string | null } | null {
  const batch = componentFrom(
    packets,
    (packet) =>
      packet.stage === "released" &&
      packet.wake === "sa" &&
      packet.dispatchedSaRevision !== packet.revision &&
      !packet.hold &&
      !packet.blockerId,
  );
  if (!batch) return null;
  if (opts?.limit == null) return batch;
  const packetIds = batch.packetIds.slice(0, opts.limit);
  return { packetIds, basis: packetIds.length > 1 ? batch.basis : null };
}

/** Eligible change_specified packets in one sibling component. The lowest id is the seed. */
export function engineerAssignment(
  packets: readonly WorkItem[],
): { packetIds: string[]; basis: string | null } | null {
  return componentFrom(
    packets,
    (packet) =>
      packet.stage === "change_specified" &&
      packet.dispatchedEngineerRevision !== packet.revision &&
      !packet.hold &&
      !packet.blockerId,
  );
}

export function planContinuation(input: {
  agentId: string | null;
  runsOnAgent: number;
  resumeSupported: boolean;
  contextSaturated: boolean;
  reason?: string;
}): { mode: "resume" | "fresh"; reason: string; agentId: string | null } {
  if (input.contextSaturated) return { mode: "fresh", reason: "context_saturated", agentId: null };
  if (!input.agentId) return { mode: "fresh", reason: "no_agent", agentId: null };
  if (!input.resumeSupported) return { mode: "fresh", reason: "continuation_unavailable", agentId: null };
  if (input.runsOnAgent >= MAX_RUNS_PER_AGENT) return { mode: "fresh", reason: "agent_run_cap", agentId: null };
  return { mode: "resume", reason: input.reason ?? "architect_resume", agentId: input.agentId };
}

function relatedPacketIds(ledger: ExecutionLedger, packetIds: readonly string[]): Set<string> {
  const seen = new Set<string>(packetIds);
  const queue = [...packetIds];
  while (queue.length) {
    const id = queue.shift() as string;
    const packet = ledger.packets[id];
    for (const link of packet?.siblings ?? []) {
      if (seen.has(link.id) || !ledger.packets[link.id]) continue;
      seen.add(link.id);
      queue.push(link.id);
    }
    for (const other of Object.values(ledger.packets)) {
      if (seen.has(other.id)) continue;
      if ((other.siblings ?? []).some((link) => link.id === id)) {
        seen.add(other.id);
        queue.push(other.id);
      }
    }
  }
  return seen;
}

function latestMatching(
  ledger: ExecutionLedger,
  admit: (execution: WorkerExecution) => boolean,
): WorkerExecution | null {
  const rows = Object.values(executionsOf(ledger))
    .filter(admit)
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : a.issuedAt > b.issuedAt ? -1 : 0));
  return rows[0] ?? null;
}

/**
 * The next packet wake reuses an agent when one is still eligible.
 * An engineer follows the latest engineer agent until the context is full,
 * the agent has four runs, or there is no agent id. A refusal uses that same agent.
 * An analyst follows the same agent only to finish a component that stopped
 * because the context was full. That follow-up is capped at `MAX_ANALYST_PACKETS`.
 */
export function planPacketContinuation(input: {
  ledger: ExecutionLedger;
  role: "analyst" | "engineer";
  packetIds: readonly string[];
  resumeSupported: boolean;
}): { mode: "resume" | "fresh"; reason: string; agentId: string | null; limit: number | null } {
  const wanted = relatedPacketIds(input.ledger, input.packetIds);
  const latest =
    input.role === "engineer"
      ? latestMatching(input.ledger, (execution) => execution.role === "engineer" && Boolean(execution.agentId))
      : latestMatching(
          input.ledger,
          (execution) => execution.role === "analyst" && execution.packetIds.some((id) => wanted.has(id)),
        );
  const saturated = latest?.reason === "context_saturated";
  const limit = input.role === "analyst" && saturated ? MAX_ANALYST_PACKETS : null;
  if (input.role === "analyst" && !saturated) {
    return { mode: "fresh", reason: "fresh", agentId: null, limit };
  }
  const plan = planContinuation({
    agentId: latest?.agentId ?? null,
    runsOnAgent: runsOnAgent(input.ledger, latest?.agentId ?? null),
    resumeSupported: input.resumeSupported,
    contextSaturated: input.role === "engineer" && saturated,
    reason: "worker_resume",
  });
  return { ...plan, limit };
}

export function runsOnAgent(ledger: ExecutionLedger, agentId: string | null): number {
  if (!agentId) return 0;
  return Object.values(executionsOf(ledger)).filter((execution) => execution.agentId === agentId).length;
}

export function latestArchitectExecution(ledger: ExecutionLedger, initiativeId: string): WorkerExecution | null {
  const rows = Object.values(executionsOf(ledger))
    .filter((execution) => execution.role === "architect" && execution.packetIds.includes(initiativeId))
    .sort((a, b) => (a.issuedAt < b.issuedAt ? 1 : a.issuedAt > b.issuedAt ? -1 : 0));
  return rows[0] ?? null;
}

export function engineerQueueDepth(packets: Iterable<WorkItem>): number {
  let depth = 0;
  for (const packet of packets) {
    if ((ENGINEER_QUEUE_STAGES as readonly string[]).includes(packet.stage)) depth += 1;
  }
  return depth;
}

export function productionPressure(packets: Iterable<WorkItem>): {
  engineerQueueDepth: number;
  holdArchitect: boolean;
  holdRelease: boolean;
  reason: string;
} {
  const depth = engineerQueueDepth(packets);
  const hold = depth >= ENGINEER_BACKLOG_LIMIT;
  return {
    engineerQueueDepth: depth,
    holdArchitect: hold,
    holdRelease: hold,
    reason: hold ? "engineer_backlog" : "clear",
  };
}

export interface ProductionMetrics {
  trackedFreshLaunches: number;
  trackedResumeRuns: number;
  refusedOrFailedLaunches: number;
  completedExecutions: number;
  usefulPacketsPerExecution: number | null;
  /** Tracked launches divided by completed executions. Null when none have completed. */
  launchesPerCompletedPacket: number | null;
  engineerQueueDepth: number;
  /** Accepted packets whose execution was not manual. */
  acceptedPackets: number;
  /** Null when the ledger has no provider usage figure. */
  costPerAcceptedPacket: number | null;
}

export function productionMetrics(ledger: ExecutionLedger): ProductionMetrics {
  const executions = Object.values(executionsOf(ledger));
  const fresh = executions.filter((execution) => execution.continuation !== "resume" && execution.delivery !== "bound");
  const resumed = executions.filter((execution) => execution.continuation === "resume");
  const refusedOrFailed = executions.filter((execution) => execution.phase === "refused" || execution.phase === "failed");
  const completed = executions.filter((execution) => execution.phase === "completed" && execution.packetIds.length > 0);
  const useful = completed.reduce((sum, execution) => {
    const advanced = execution.packetIds.filter((id) => {
      const stage = ledger.packets[id]?.stage;
      return stage != null && stage !== "draft" && stage !== "released";
    }).length;
    return sum + advanced;
  }, 0);
  const accepted = Object.values(ledger.packets).filter(
    (packet) => packet.stage === "accepted" && packet.execution?.mode !== "manual",
  ).length;
  const usage = executions.map((execution) => execution.usageUsd).filter((value): value is number => typeof value === "number");
  return {
    trackedFreshLaunches: fresh.length,
    trackedResumeRuns: resumed.length,
    refusedOrFailedLaunches: refusedOrFailed.length,
    completedExecutions: completed.length,
    usefulPacketsPerExecution: completed.length ? useful / completed.length : null,
    launchesPerCompletedPacket: completed.length ? (fresh.length + resumed.length) / completed.length : null,
    engineerQueueDepth: engineerQueueDepth(Object.values(ledger.packets)),
    acceptedPackets: accepted,
    costPerAcceptedPacket: usage.length && accepted > 0 ? usage.reduce((sum, value) => sum + value, 0) / accepted : null,
  };
}

function archiveDispatch(packet: WorkItem, workerExecution: "ran" | "absent"): void {
  if (!packet.dispatch) return;
  packet.dispatchHistory = [...(packet.dispatchHistory ?? []), { ...packet.dispatch, workerExecution }];
  packet.dispatch = null;
}

function ensureMaps(ledger: ExecutionLedger): {
  executions: Record<string, WorkerExecution>;
  assignments: Record<string, Assignment>;
} {
  if (!ledger.executions) ledger.executions = {};
  if (!ledger.assignments) ledger.assignments = {};
  return { executions: ledger.executions, assignments: ledger.assignments };
}

function finish(
  execution: WorkerExecution,
  phase: ExecutionPhase,
  now: string,
  reason: string,
): void {
  execution.phase = phase;
  execution.endedAt = now;
  execution.reason = reason;
}

/**
 * Release reservations and leases the clock has already ended.
 * A candidate SHA is kept. A refused engineer does not stay in the slot.
 * History stays on the execution and on the packet's dispatch history.
 */
export function recoverExecutions<T extends ExecutionLedger>(
  ledger: T,
  now: string,
): { ledger: T; changes: RecoveryChange[] } {
  const next = structuredClone(ledger) as T;
  const changes: RecoveryChange[] = [];
  const { executions, assignments } = ensureMaps(next);

  for (const packet of Object.values(next.packets)) {
    const dispatch = packet.dispatch;
    if (!dispatch) continue;
    if (dispatch.effect !== "wake_engineer" && dispatch.effect !== "wake_repair" && dispatch.effect !== "wake_sa") {
      continue;
    }
    const role = dispatch.effect === "wake_sa" ? "analyst" : "engineer";
    let execution = dispatch.executionId ? executions[dispatch.executionId] : liveExecutionFor(next, packet.id);
    const reserveUntil = execution?.reserveUntil ?? (dispatch.issuedAt ? plusMs(dispatch.issuedAt, PENDING_RESERVE_MS) : "");
    const candidateKept =
      Boolean(packet.candidateSha) &&
      (packet.stage === "candidate" || packet.stage === "verifying" || packet.stage === "verified" || packet.stage === "accepted");
    const leaseLive = Boolean(packet.lease && packet.lease.until > now);
    if (leaseLive) continue;
    if (!candidateKept && reserveUntil > now && (!execution || execution.phase === "dispatched" || execution.phase === "started")) {
      continue;
    }
    if (!execution) {
      const opened = openExecution({
        stateRevision: next.stateRevision,
        role,
        effect: dispatch.effect,
        packetIds: [packet.id],
        revisions: { [packet.id]: packet.revision },
        label: dispatch.label,
        prHead: dispatch.prHead,
        now: dispatch.issuedAt ?? now,
        continuation: "fresh",
      });
      opened.execution.issuedAt = dispatch.issuedAt ?? now;
      opened.execution.reserveUntil = reserveUntil || now;
      opened.assignment.initiativeId = packet.initiativeId;
      execution = opened.execution;
      executions[execution.id] = execution;
      assignments[opened.assignment.id] = opened.assignment;
      dispatch.executionId = execution.id;
      dispatch.assignmentId = execution.assignmentId;
    }
    if (isTerminal(execution.phase)) continue;

    if (candidateKept) {
      finish(execution, "completed", now, "candidate_recorded");
      archiveDispatch(packet, "ran");
      changes.push({ id: execution.id, phase: "completed", reason: "candidate_recorded" });
      continue;
    }
    if (execution.phase === "running" && execution.leaseUntil && execution.leaseUntil > now) continue;
    if (execution.phase === "started" && execution.startUntil && execution.startUntil > now) continue;

    const started = execution.phase === "started" || execution.phase === "running" || Boolean(packet.lease);
    const phase: ExecutionPhase = started ? "interrupted" : "refused";
    const reason = started ? "lease_expired" : "reservation_expired";
    finish(execution, phase, now, reason);
    archiveDispatch(packet, started ? "ran" : "absent");
    packet.lease = null;
    if (role === "engineer" && packet.dispatchedEngineerRevision === packet.revision && !packet.candidateSha) {
      packet.dispatchedEngineerRevision = null;
    }
    if (role === "engineer" && dispatch.effect === "wake_repair") {
      packet.dispatchedRepairFingerprint = null;
    }
    if (role === "analyst" && packet.dispatchedSaRevision === packet.revision && (packet.stage === "released" || packet.stage === "analysis")) {
      packet.dispatchedSaRevision = null;
      if (!started && next.usedDispatches > 0) next.usedDispatches -= 1;
    }
    changes.push({ id: execution.id, phase, reason });
  }

  for (const initiative of Object.values(next.initiatives)) {
    const dispatch = initiative.dispatch;
    if (!dispatch || dispatch.effect !== "wake_architect" || initiative.session !== "running") continue;
    const mark = initiative.checkpointAt && initiative.checkpointAt > (dispatch.issuedAt ?? "") ? initiative.checkpointAt : dispatch.issuedAt;
    if (!mark) continue;
    if (plusMs(mark, ARCHITECT_RESERVE_MS) > now) continue;
    let execution = dispatch.executionId ? executions[dispatch.executionId] : null;
    if (!execution) {
      const opened = openExecution({
        stateRevision: next.stateRevision,
        role: "architect",
        effect: "wake_architect",
        packetIds: [initiative.id],
        revisions: { [initiative.id]: initiative.revision },
        label: dispatch.label,
        prHead: dispatch.prHead,
        now: dispatch.issuedAt ?? now,
        continuation: "fresh",
        reserveMs: ARCHITECT_RESERVE_MS,
      });
      execution = opened.execution;
      executions[execution.id] = execution;
      assignments[opened.assignment.id] = opened.assignment;
    }
    if (isTerminal(execution.phase)) continue;
    finish(execution, "interrupted", now, "reservation_expired");
    initiative.dispatch = null;
    initiative.session = "continuation_due";
    initiative.updatedAt = now;
    changes.push({ id: execution.id, phase: "interrupted", reason: "reservation_expired" });
  }

  if (!changes.length) return { ledger, changes };
  return { ledger: next, changes };
}

export function applyWorkerSignal<T extends ExecutionLedger>(
  ledger: T,
  packetId: string,
  signal:
    | { type: "acknowledge_start"; workerId: string; now: string }
    | { type: "running"; workerId: string; now: string; leaseUntil: string | null }
    | { type: "refuse_execution"; workerId: string; now: string }
    | { type: "signed"; now: string }
    | { type: "candidate"; now: string }
    | { type: "interrupted"; now: string }
    | { type: "context_saturated"; workerId: string; now: string },
): T {
  const next = structuredClone(ledger) as T;
  const packet = next.packets[packetId];
  if (!packet) return next;
  const { executions } = ensureMaps(next);
  let execution = packet.dispatch?.executionId ? executions[packet.dispatch.executionId] : liveExecutionFor(next, packetId);

  if (signal.type === "acknowledge_start") {
    if (!execution || isTerminal(execution.phase)) return next;
    if (execution.phase === "dispatched") {
      execution.phase = "started";
      execution.startedAt = signal.now;
      execution.startUntil = plusMs(signal.now, START_HOLD_MS);
      execution.agentId = execution.agentId ?? signal.workerId;
    }
    return next;
  }

  if (signal.type === "running") {
    if (!execution || isTerminal(execution.phase)) return next;
    if (!execution.startedAt) execution.startedAt = signal.now;
    execution.phase = "running";
    execution.runningAt = signal.now;
    execution.leaseUntil = signal.leaseUntil;
    execution.agentId = execution.agentId ?? signal.workerId;
    return next;
  }

  if (signal.type === "refuse_execution") {
    if (packet.candidateSha) return next;
    if (!execution && packet.dispatch) {
      const opened = openExecution({
        stateRevision: next.stateRevision,
        role: packet.dispatch.effect === "wake_sa" ? "analyst" : "engineer",
        effect: packet.dispatch.effect,
        packetIds: [packet.id],
        revisions: { [packet.id]: packet.revision },
        label: packet.dispatch.label,
        prHead: packet.dispatch.prHead,
        now: signal.now,
        continuation: "fresh",
        agentId: signal.workerId,
      });
      execution = opened.execution;
      executions[execution.id] = execution;
      packet.dispatch.executionId = execution.id;
    }
    if (!execution || isTerminal(execution.phase)) return next;
    finish(execution, "refused", signal.now, "worker_refused");
    for (const id of execution.packetIds) {
      const member = next.packets[id];
      if (!member || member.candidateSha) continue;
      archiveDispatch(member, "absent");
      member.lease = null;
      if (member.dispatchedEngineerRevision === member.revision) member.dispatchedEngineerRevision = null;
      member.dispatchedRepairFingerprint = null;
    }
    return next;
  }

  if (signal.type === "candidate") {
    if (packet.dispatch?.effect === "wake_engineer" || packet.dispatch?.effect === "wake_repair") archiveDispatch(packet, "ran");
    if (!execution) return next;
    const waiting = execution.packetIds.some((id) => {
      const member = next.packets[id];
      return Boolean(member && !member.candidateSha);
    });
    if (!waiting && !isTerminal(execution.phase)) finish(execution, "completed", signal.now, "candidate_recorded");
    else if (!isTerminal(execution.phase) && (execution.phase === "dispatched" || execution.phase === "started")) {
      execution.phase = "running";
      execution.runningAt = execution.runningAt ?? signal.now;
    }
    return next;
  }

  if (signal.type === "context_saturated") {
    if (!execution || isTerminal(execution.phase)) return next;
    if (execution.agentId && execution.agentId !== signal.workerId) return next;
    execution.agentId = execution.agentId ?? signal.workerId;
    finish(execution, "completed", signal.now, "context_saturated");
    for (const id of execution.packetIds) {
      const member = next.packets[id];
      if (!member) continue;
      if (execution.role === "analyst" && (member.stage === "released" || member.stage === "analysis")) {
        member.stage = "released";
        member.lease = null;
        if (member.dispatchedSaRevision === member.revision) member.dispatchedSaRevision = null;
        if (member.dispatch) archiveDispatch(member, "ran");
      }
      if (execution.role === "engineer" && !member.candidateSha) {
        member.lease = null;
        if (member.dispatchedEngineerRevision === member.revision) member.dispatchedEngineerRevision = null;
        if (member.dispatch) archiveDispatch(member, "ran");
      }
    }
    return next;
  }

  if (signal.type === "signed") {
    if (packet.dispatch?.effect === "wake_sa") archiveDispatch(packet, "ran");
    if (!execution) return next;
    const waiting = execution.packetIds.some((id) => {
      const stage = next.packets[id]?.stage;
      return stage === "released" || stage === "analysis";
    });
    if (!waiting && !isTerminal(execution.phase)) finish(execution, "completed", signal.now, "specifications_signed");
    else if (execution.phase === "dispatched" || execution.phase === "started") {
      execution.phase = "running";
      execution.runningAt = execution.runningAt ?? signal.now;
    }
    return next;
  }

  if (signal.type === "interrupted") {
    if (execution && !isTerminal(execution.phase)) finish(execution, "interrupted", signal.now, "worker_interrupted");
    return next;
  }

  return next;
}

export function siblingNote(link: SiblingLink): string {
  return `${link.basis}: ${link.note}`;
}
