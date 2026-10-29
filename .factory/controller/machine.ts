/**
 * Tower software-factory controller.
 *
 * Pure transitions. No GitHub, no Cursor, no clock except the `now` the caller passes.
 * Persistence and label calls live in dispatch.ts. This file does not perform them.
 * A wake effect is a proposal. It becomes a dispatch only after `acknowledgeDispatch`,
 * and that acknowledgement belongs after the label API succeeds.
 * Absence of a label is not permission to advance.
 * `budgetUsd` is illustrative. It never authorizes a wake.
 */

export type Stage =
  | "draft"
  | "released"
  | "analysis"
  | "change_specified"
  | "engineering"
  | "candidate"
  | "verifying"
  | "verified"
  | "integration_authorized"
  | "integrated"
  | "reconciled"
  | "accepted"
  | "blocked"
  | "returned_architect"
  | "returned_analyst";

export type FailureClass =
  | "implementation"
  | "specification"
  | "systems_contract"
  | "infrastructure"
  | "external";

export type WakeEffect = "none" | "wake_sa" | "wake_engineer" | "wake_repair" | "wake_architect";

export const REQUIRED_CHANGE_SECTIONS = [
  "intent",
  "must",
  "stores",
  "runtime",
  "ports",
  "verify",
  "out_of_scope",
  "impact_manifest",
  "dependency_reconciliation",
] as const;

export const SEAT_LABELS = [
  "factory-wake-architect",
  "factory-wake-sa",
  "factory-wake-engineer",
  "factory-repair",
] as const;

export const HOLD_LABELS = ["factory-blocked", "factory-hold"] as const;

export interface Lease {
  workerId: string;
  role: "architect" | "analyst" | "engineer";
  until: string;
  revision: string;
}

/** Written only after a label add succeeds. Workers must match it exactly. */
export interface DispatchRecord {
  packetId: string;
  revision: string;
  prHead: string;
  effect: Exclude<WakeEffect, "none">;
  label: (typeof SEAT_LABELS)[number];
}

/** A check that actually ran. A name without a run id is not evidence. */
export interface CheckEvidence {
  name: string;
  runId: string;
  outcome: "pass" | "fail";
}

/**
 * How this packet's implementation was carried out.
 * `manual` is a seated run with no label wake.
 * `automatic` is a run whose dispatch record was acknowledged.
 */
export interface ExecutionRecord {
  mode: "manual" | "automatic";
  checks: CheckEvidence[];
}

export interface WorkItem {
  id: string;
  initiativeId: string;
  stage: Stage;
  wake: "hold" | "sa";
  revision: string;
  hold: boolean;
  blockerId: string | null;
  lease: Lease | null;
  attempts: number;
  maxAttempts: number;
  candidateSha: string | null;
  verifiedSha: string | null;
  lastFailureFingerprint: string | null;
  lastFailureClass: FailureClass | null;
  dispatchedSaRevision: string | null;
  dispatchedEngineerRevision: string | null;
  dispatchedRepairFingerprint: string | null;
  releaseEligible: boolean;
  integratedSha: string | null;
  reconciliationId: string | null;
  dispatch: DispatchRecord | null;
  /** Null until a manual record or an automatic verification says how the work ran. */
  execution: ExecutionRecord | null;
}

export interface World {
  activation: "inactive" | "active";
  now: string;
  /** Another implementation batch already owns the single engineering slot. */
  engineeringBusy: boolean;
  /** Illustrative dollars. Never read as permission to dispatch. */
  budgetUsd: number | null;
  /**
   * Fixed count of worker wakes this pilot may perform.
   * Null and 0 both refuse. Null is not unlimited.
   */
  authorizedDispatches: number | null;
  usedDispatches: number;
  /**
   * Set by the ledger. Undefined means this caller is exercising a packet
   * transition and has not supplied a scope. `suspended`, `inactive`, and
   * `complete` refuse every wake.
   */
  scopeStatus?: "inactive" | "active" | "suspended" | "complete";
}

export type FactoryEvent =
  | { type: "release"; wake: "hold" | "sa"; gatesPass: boolean; revision: string }
  | {
      type: "acquire_lease";
      workerId: string;
      role: Lease["role"];
      until: string;
      revision: string;
    }
  | { type: "release_lease"; workerId: string }
  | {
      type: "sign_change";
      revision: string;
      sections: string[];
      workerId: string;
    }
  | { type: "commit_candidate"; sha: string; revision: string; workerId: string }
  | { type: "start_verification"; sha: string }
  | {
      type: "verification_result";
      sha: string;
      outcome: "pass" | "fail";
      failureClass?: FailureClass;
      fingerprint?: string;
      justification?: string;
    }
  | { type: "authorize_integration"; sha: string }
  | { type: "integrate"; candidateSha: string; mergeSha: string }
  | { type: "reconcile"; sha: string; reconciliationId: string }
  | { type: "accept"; sha: string }
  | {
      /**
       * Record seated work that never received a label wake.
       * Lands on `verified` only. Does not write a dispatch record, does not
       * spend `authorizedDispatches`, and does not authorize integration.
       */
      type: "record_manual_evidence";
      sha: string;
      revision: string;
      sections: string[];
      checks: CheckEvidence[];
    }
  | { type: "blocker"; blockerId: string; failureClass: "infrastructure" | "external" }
  | { type: "clear_blocker" }
  | { type: "hold" }
  | { type: "clear_hold" }
  | { type: "prose_complete" };

export interface ApplyResult {
  ok: boolean;
  reason: string;
  item: WorkItem;
}

export interface Decision {
  effect: WakeEffect;
  reason: string;
  label: (typeof SEAT_LABELS)[number] | null;
}

export function freshItem(id = "pkt-001", initiativeId = "exec-identity"): WorkItem {
  return {
    id,
    initiativeId,
    stage: "draft",
    wake: "hold",
    revision: "rev-0",
    hold: false,
    blockerId: null,
    lease: null,
    attempts: 0,
    maxAttempts: 1,
    candidateSha: null,
    verifiedSha: null,
    lastFailureFingerprint: null,
    lastFailureClass: null,
    dispatchedSaRevision: null,
    dispatchedEngineerRevision: null,
    dispatchedRepairFingerprint: null,
    releaseEligible: false,
    integratedSha: null,
    reconciliationId: null,
    dispatch: null,
    execution: null,
  };
}

export function stageAdmits(stage: Stage, role: Lease["role"]): boolean {
  if (role === "analyst") return stage === "released" || stage === "analysis";
  if (role === "engineer") return stage === "change_specified" || stage === "engineering";
  if (role === "architect") return stage === "draft" || stage === "returned_architect";
  return false;
}

export function leaseActive(item: WorkItem, now: string): boolean {
  return Boolean(item.lease && item.lease.until > now);
}

function clone(item: WorkItem): WorkItem {
  return {
    ...item,
    lease: item.lease ? { ...item.lease } : null,
    dispatch: item.dispatch ? { ...item.dispatch } : null,
    execution: item.execution
      ? { mode: item.execution.mode, checks: item.execution.checks.map((check) => ({ ...check })) }
      : null,
  };
}

function leaseCovers(item: WorkItem, workerId: string, role: Lease["role"], now: string): string | null {
  if (!item.lease || item.lease.workerId !== workerId || item.lease.role !== role) return "worker_mismatch";
  if (item.lease.until <= now || item.lease.revision !== item.revision) return "lease_expired";
  return null;
}

function refuse(item: WorkItem, reason: string): ApplyResult {
  return { ok: false, reason, item };
}

function accept(item: WorkItem, reason: string): ApplyResult {
  return { ok: true, reason, item };
}

export function applyEvent(item: WorkItem, event: FactoryEvent, world: World): ApplyResult {
  const next = clone(item);

  if (event.type === "prose_complete") {
    return refuse(item, "prose_is_not_evidence");
  }

  if (event.type === "hold") {
    next.hold = true;
    return accept(next, "hold");
  }

  if (event.type === "clear_hold") {
    next.hold = false;
    return accept(next, "hold_cleared");
  }

  if (event.type === "blocker") {
    // A founder or ops hold does not erase the stage. Clearing it must not
    // advance the work; the next decide() pass is a separate observation.
    next.blockerId = event.blockerId;
    next.lastFailureClass = event.failureClass;
    next.lease = null;
    return accept(next, "blocked");
  }

  if (event.type === "clear_blocker") {
    next.blockerId = null;
    return accept(next, "blocker_cleared_no_dispatch");
  }

  if (event.type === "release") {
    if (item.stage !== "draft") return refuse(item, "wrong_stage");
    if (!event.gatesPass) return refuse(item, "gates_failed");
    next.releaseEligible = true;
    next.wake = event.wake;
    if (event.wake === "hold") return accept(next, "eligible_held");
    next.stage = "released";
    next.revision = event.revision;
    return accept(next, "released");
  }

  if (event.type === "acquire_lease") {
    if (event.revision !== item.revision) return refuse(item, "revision_mismatch");
    if (!stageAdmits(item.stage, event.role)) return refuse(item, "role_not_admitted");
    if (leaseActive(item, world.now) && item.lease!.workerId !== event.workerId) {
      return refuse(item, "lease_held");
    }
    if (item.hold || item.blockerId) return refuse(item, item.hold ? "hold" : "blocked");
    next.lease = {
      workerId: event.workerId,
      role: event.role,
      until: event.until,
      revision: event.revision,
    };
    if (event.role === "analyst" && item.stage === "released") next.stage = "analysis";
    if (event.role === "engineer" && item.stage === "change_specified") next.stage = "engineering";
    return accept(next, "lease_acquired");
  }

  if (event.type === "release_lease") {
    if (!item.lease || item.lease.workerId !== event.workerId) return refuse(item, "worker_mismatch");
    next.lease = null;
    return accept(next, "lease_released");
  }

  if (event.type === "sign_change") {
    if (item.stage !== "analysis") return refuse(item, "wrong_stage");
    if (event.revision !== item.revision) return refuse(item, "revision_mismatch");
    const analystLease = leaseCovers(item, event.workerId, "analyst", world.now);
    if (analystLease) return refuse(item, analystLease);
    const missing = REQUIRED_CHANGE_SECTIONS.filter((section) => !event.sections.includes(section));
    if (missing.length) return refuse(item, "sections_incomplete");
    next.stage = "change_specified";
    next.lease = null;
    return accept(next, "change_specified");
  }

  if (event.type === "commit_candidate") {
    if (item.stage !== "engineering") return refuse(item, "wrong_stage");
    if (event.revision !== item.revision) return refuse(item, "revision_mismatch");
    const engineerLease = leaseCovers(item, event.workerId, "engineer", world.now);
    if (engineerLease) return refuse(item, engineerLease);
    if (!event.sha) return refuse(item, "sha_mismatch");
    next.stage = "candidate";
    next.candidateSha = event.sha;
    next.verifiedSha = null;
    next.lease = null;
    return accept(next, "candidate");
  }

  if (event.type === "start_verification") {
    if (item.stage !== "candidate") return refuse(item, "wrong_stage");
    if (!item.candidateSha || event.sha !== item.candidateSha) return refuse(item, "sha_mismatch");
    next.stage = "verifying";
    return accept(next, "verifying");
  }

  if (event.type === "verification_result") {
    if (item.stage !== "verifying") return refuse(item, "wrong_stage");
    if (!item.candidateSha || event.sha !== item.candidateSha) return refuse(item, "sha_mismatch");
    if (event.outcome === "pass") {
      next.stage = "verified";
      next.verifiedSha = event.sha;
      next.lastFailureClass = null;
      if (item.dispatch) {
        next.execution = { mode: "automatic", checks: [] };
      }
      return accept(next, "verified");
    }
    const failureClass = event.failureClass;
    if (!failureClass || !event.fingerprint) return refuse(item, "unclassified_failure");
    next.lastFailureClass = failureClass;
    if (failureClass === "specification") {
      next.stage = "returned_architect";
      next.lease = null;
      return accept(next, "returned_architect");
    }
    if (failureClass === "systems_contract") {
      next.stage = "returned_analyst";
      next.lease = null;
      return accept(next, "returned_analyst");
    }
    if (failureClass === "infrastructure" || failureClass === "external") {
      next.stage = "blocked";
      next.blockerId = `auto-${failureClass}-${event.fingerprint}`;
      next.lease = null;
      return accept(next, "blocked");
    }
    if (
      item.lastFailureFingerprint === event.fingerprint &&
      !event.justification
    ) {
      next.stage = "blocked";
      next.blockerId = `duplicate-${event.fingerprint}`;
      next.lease = null;
      return accept(next, "duplicate_failure");
    }
    if (item.attempts + 1 > item.maxAttempts) {
      next.stage = "blocked";
      next.blockerId = `attempts-${event.fingerprint}`;
      next.lease = null;
      return accept(next, "attempts_exhausted");
    }
    next.attempts += 1;
    next.lastFailureFingerprint = event.fingerprint;
    next.stage = "engineering";
    next.lease = null;
    return accept(next, "repair_ready");
  }

  if (event.type === "authorize_integration") {
    if (item.stage !== "verified") return refuse(item, "wrong_stage");
    if (!item.verifiedSha || event.sha !== item.verifiedSha) return refuse(item, "sha_mismatch");
    next.stage = "integration_authorized";
    return accept(next, "integration_authorized");
  }

  if (event.type === "integrate") {
    if (item.stage !== "integration_authorized") return refuse(item, "wrong_stage");
    if (!item.verifiedSha || event.candidateSha !== item.verifiedSha) return refuse(item, "sha_mismatch");
    if (!event.mergeSha) return refuse(item, "integration_evidence_missing");
    next.stage = "integrated";
    next.integratedSha = event.mergeSha;
    return accept(next, "integrated");
  }

  if (event.type === "reconcile") {
    if (item.stage !== "integrated") return refuse(item, "wrong_stage");
    if (!item.verifiedSha || event.sha !== item.verifiedSha) return refuse(item, "sha_mismatch");
    if (!event.reconciliationId) return refuse(item, "integration_evidence_missing");
    next.stage = "reconciled";
    next.reconciliationId = event.reconciliationId;
    return accept(next, "reconciled");
  }

  if (event.type === "accept") {
    if (item.stage !== "reconciled") return refuse(item, "wrong_stage");
    if (!item.verifiedSha || event.sha !== item.verifiedSha || !item.integratedSha) {
      return refuse(item, "sha_mismatch");
    }
    next.stage = "accepted";
    return accept(next, "accepted");
  }

  if (event.type === "record_manual_evidence") {
    if (item.stage !== "draft") return refuse(item, "wrong_stage");
    if (item.wake !== "hold") return refuse(item, "wake_is_dispatch");
    if (item.dispatch) return refuse(item, "dispatch_already_recorded");
    if (item.hold || item.blockerId) return refuse(item, item.hold ? "hold" : "blocked");
    if (!event.sha || !event.revision) return refuse(item, "sha_mismatch");
    const missing = REQUIRED_CHANGE_SECTIONS.filter((section) => !event.sections.includes(section));
    if (missing.length) return refuse(item, "sections_incomplete");
    if (!event.checks.length) return refuse(item, "verification_evidence_missing");
    for (const check of event.checks) {
      if (!check.name || !check.runId) return refuse(item, "verification_evidence_missing");
      if (check.outcome !== "pass") return refuse(item, "verification_failed");
    }
    next.stage = "verified";
    next.revision = event.revision;
    next.candidateSha = event.sha;
    next.verifiedSha = event.sha;
    next.execution = {
      mode: "manual",
      checks: event.checks.map((check) => ({ ...check })),
    };
    next.dispatch = null;
    next.lease = null;
    return accept(next, "verified_manual");
  }

  return refuse(item, "unknown_event");
}

const LABEL_FOR: Record<Exclude<WakeEffect, "none">, (typeof SEAT_LABELS)[number]> = {
  wake_architect: "factory-wake-architect",
  wake_sa: "factory-wake-sa",
  wake_engineer: "factory-wake-engineer",
  wake_repair: "factory-repair",
};

export function decide(item: WorkItem, world: World): Decision {
  const none = (reason: string): Decision => ({ effect: "none", reason, label: null });
  if (world.activation !== "active") return none("inactive");
  if (world.scopeStatus === "suspended") return none("suspended");
  if (world.scopeStatus === "inactive") return none("scope_inactive");
  if (world.scopeStatus === "complete") return none("scope_complete");
  if (item.hold) return none("hold");
  if (item.blockerId || item.stage === "blocked") return none("blocked");
  if (item.stage === "returned_architect" || item.stage === "returned_analyst") {
    return none(item.stage);
  }
  if (leaseActive(item, world.now)) return none("lease_held");
  if (world.authorizedDispatches == null || world.authorizedDispatches <= 0) {
    return none("dispatch_not_authorized");
  }
  if (world.usedDispatches >= world.authorizedDispatches) {
    return none("dispatch_authorization_exhausted");
  }

  if (
    item.stage === "released" &&
    item.wake === "sa" &&
    item.dispatchedSaRevision !== item.revision
  ) {
    return { effect: "wake_sa", reason: "released_packet", label: LABEL_FOR.wake_sa };
  }

  if (
    item.stage === "change_specified" &&
    item.dispatchedEngineerRevision !== item.revision
  ) {
    if (world.engineeringBusy) return none("concurrency");
    return { effect: "wake_engineer", reason: "change_specified", label: LABEL_FOR.wake_engineer };
  }

  if (
    item.stage === "engineering" &&
    item.attempts > 0 &&
    item.lastFailureFingerprint &&
    item.dispatchedRepairFingerprint !== item.lastFailureFingerprint
  ) {
    if (world.engineeringBusy) return none("concurrency");
    return { effect: "wake_repair", reason: "implementation_failure", label: LABEL_FOR.wake_repair };
  }

  return none("no_transition");
}

/** Call only after the label API has added `effect`'s label. A failed add must not call this. */
export function acknowledgeDispatch(
  item: WorkItem,
  effect: WakeEffect,
  record?: { prHead: string },
): WorkItem {
  const next = clone(item);
  if (effect === "wake_sa") next.dispatchedSaRevision = item.revision;
  if (effect === "wake_engineer") next.dispatchedEngineerRevision = item.revision;
  if (effect === "wake_repair" && item.lastFailureFingerprint) {
    next.dispatchedRepairFingerprint = item.lastFailureFingerprint;
  }
  if (record && effect !== "none") {
    next.dispatch = {
      packetId: item.id,
      revision: item.revision,
      prHead: record.prHead,
      effect,
      label: LABEL_FOR[effect],
    };
  }
  return next;
}

export function workerMayRun(input: {
  label: (typeof SEAT_LABELS)[number];
  packetId: string;
  revision: string;
  prHead: string;
  wake: "hold" | "sa";
  dispatch: DispatchRecord | null;
}): { ok: boolean; reason: string } {
  if (!input.dispatch) return { ok: false, reason: "no_dispatch_record" };
  if (input.dispatch.packetId !== input.packetId) return { ok: false, reason: "packet_mismatch" };
  if (input.dispatch.revision !== input.revision) return { ok: false, reason: "revision_mismatch" };
  if (input.dispatch.prHead !== input.prHead) return { ok: false, reason: "pr_head_mismatch" };
  if (input.dispatch.label !== input.label) return { ok: false, reason: "label_mismatch" };
  if (input.label === "factory-wake-sa" && input.wake !== "sa") return { ok: false, reason: "wake_hold" };
  if (input.dispatch.effect === "wake_sa" && input.label !== "factory-wake-sa") {
    return { ok: false, reason: "label_mismatch" };
  }
  if (input.dispatch.effect === "wake_engineer" && input.label !== "factory-wake-engineer") {
    return { ok: false, reason: "label_mismatch" };
  }
  if (input.dispatch.effect === "wake_repair" && input.label !== "factory-repair") {
    return { ok: false, reason: "label_mismatch" };
  }
  if (input.dispatch.effect === "wake_architect" && input.label !== "factory-wake-architect") {
    return { ok: false, reason: "label_mismatch" };
  }
  return { ok: true, reason: "authorized" };
}

export type InitiativeSummary =
  | "discovered"
  | "scoped"
  | "investigating"
  | "specifying"
  | "packets_ready"
  | "in_production"
  | "verifying"
  | "reconciling"
  | "complete";

const PRODUCTION = new Set<Stage>([
  "analysis",
  "change_specified",
  "engineering",
  "candidate",
  "integration_authorized",
  "integrated",
  "reconciled",
  "returned_architect",
  "returned_analyst",
]);

export function deriveInitiative(input: {
  investigation: "discovered" | "scoped" | "investigating" | "specifying" | "closed";
  packets: Array<{ stage: Stage; required: boolean }>;
}): InitiativeSummary {
  const required = input.packets.filter((packet) => packet.required);
  const stages = input.packets.map((packet) => packet.stage);
  if (input.investigation === "discovered") return "discovered";
  if (input.investigation === "scoped" && input.packets.length === 0) return "scoped";
  const allRequiredAccepted =
    required.length > 0 && required.every((packet) => packet.stage === "accepted");
  if (allRequiredAccepted && input.investigation === "closed") return "complete";
  if (allRequiredAccepted && input.investigation !== "closed") return "reconciling";
  if (stages.some((stage) => stage === "verifying" || stage === "verified")) return "verifying";
  if (stages.some((stage) => PRODUCTION.has(stage))) return "in_production";
  if (stages.some((stage) => stage === "released" || stage === "accepted")) return "packets_ready";
  if (input.investigation === "specifying") return "specifying";
  if (input.investigation === "investigating" || input.investigation === "closed") return "investigating";
  return "scoped";
}

/**
 * Authoritative transition ids. docs/factory/STATE-MACHINE.md must list each id.
 * The factory check fails when the page and this list diverge.
 */
export const TRANSITION_IDS = [
  "T01",
  "T02",
  "T03",
  "T04",
  "T05",
  "T06",
  "T07",
  "T08",
  "T09",
  "T10",
  "T11",
  "T12",
  "T13",
  "T14",
  "T15",
  "T16",
  "T17",
  "T18",
  "T19",
  "T20",
  "T21",
  "T22",
  "T23",
  "T24",
  "T25",
  "T26",
  "T27",
  "T28",
  "T29",
  "T30",
  "T31",
  "T32",
  "T33",
  "T34",
  "T35",
  "T36",
  "T37",
  "T38",
  "T39",
  "T40",
  "T41",
  "T42",
  "T43",
  "T44",
  "T45",
  "T46",
  "T47",
  "T48",
] as const;
