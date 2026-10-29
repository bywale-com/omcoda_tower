/**
 * Tower software-factory controller.
 *
 * Pure transitions. No GitHub, no Cursor, no clock except the `now` the caller passes.
 * A wake effect is a proposal. It becomes a dispatch only after `acknowledgeDispatch`,
 * and that acknowledgement belongs after the label API succeeds.
 * Absence of a label is not permission to advance.
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

export type WakeEffect = "none" | "wake_sa" | "wake_engineer" | "wake_repair";

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
}

export interface World {
  activation: "inactive" | "active";
  now: string;
  /** Another implementation batch already owns the single engineering slot. */
  engineeringBusy: boolean;
  /** Null means the provider did not expose a hard limit. Do not pretend it is enforced. */
  budgetUsd: number | null;
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
  | { type: "accept"; sha: string }
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
  };
}

export function leaseActive(item: WorkItem, now: string): boolean {
  return Boolean(item.lease && item.lease.until > now);
}

function clone(item: WorkItem): WorkItem {
  return {
    ...item,
    lease: item.lease ? { ...item.lease } : null,
  };
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
    if (event.role === "analyst" && next.stage === "released") next.stage = "analysis";
    if (event.role === "engineer" && next.stage === "change_specified") next.stage = "engineering";
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
    if (!item.lease || item.lease.workerId !== event.workerId || item.lease.role !== "analyst") {
      return refuse(item, "worker_mismatch");
    }
    const missing = REQUIRED_CHANGE_SECTIONS.filter((section) => !event.sections.includes(section));
    if (missing.length) return refuse(item, "sections_incomplete");
    next.stage = "change_specified";
    next.lease = null;
    return accept(next, "change_specified");
  }

  if (event.type === "commit_candidate") {
    if (item.stage !== "engineering") return refuse(item, "wrong_stage");
    if (event.revision !== item.revision) return refuse(item, "revision_mismatch");
    if (!item.lease || item.lease.workerId !== event.workerId || item.lease.role !== "engineer") {
      return refuse(item, "worker_mismatch");
    }
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

  if (event.type === "accept") {
    if (item.stage !== "verified") return refuse(item, "wrong_stage");
    if (!item.verifiedSha || event.sha !== item.verifiedSha) return refuse(item, "sha_mismatch");
    next.stage = "accepted";
    return accept(next, "accepted");
  }

  return refuse(item, "unknown_event");
}

const LABEL_FOR: Record<Exclude<WakeEffect, "none">, (typeof SEAT_LABELS)[number]> = {
  wake_sa: "factory-wake-sa",
  wake_engineer: "factory-wake-engineer",
  wake_repair: "factory-repair",
};

export function decide(item: WorkItem, world: World): Decision {
  const none = (reason: string): Decision => ({ effect: "none", reason, label: null });
  if (world.activation !== "active") return none("inactive");
  if (item.hold) return none("hold");
  if (item.blockerId || item.stage === "blocked") return none("blocked");
  if (item.stage === "returned_architect" || item.stage === "returned_analyst") {
    return none(item.stage);
  }
  if (leaseActive(item, world.now)) return none("lease_held");
  if (world.budgetUsd !== null && world.budgetUsd <= 0) return none("budget_exhausted");

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
export function acknowledgeDispatch(item: WorkItem, effect: WakeEffect): WorkItem {
  const next = clone(item);
  if (effect === "wake_sa") next.dispatchedSaRevision = item.revision;
  if (effect === "wake_engineer") next.dispatchedEngineerRevision = item.revision;
  if (effect === "wake_repair" && item.lastFailureFingerprint) {
    next.dispatchedRepairFingerprint = item.lastFailureFingerprint;
  }
  return next;
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
] as const;
