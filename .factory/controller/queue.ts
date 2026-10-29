/**
 * Scope, initiative queue, and the one control step.
 *
 * Selection is a sort. It does not call a model. A wake is still only a
 * proposal: the label actuator acknowledges it, and a failed add writes nothing.
 * PKT-001's manual execution record is not rewritten here.
 */
import {
  decide,
  freshItem,
  leaseActive,
  type Decision,
  type DispatchRecord,
  type World,
} from "./machine.ts";
import {
  type FactoryLedger,
  type InitiativeRecord,
  type LabelActuator,
  type ScopeState,
  type StateStore,
} from "./dispatch.ts";

export interface LedgerResult {
  ok: boolean;
  reason: string;
  ledger: FactoryLedger;
}

export type LedgerEvent =
  | { type: "authorize_scope"; id: string; modules: string[]; authorizedDispatches: number }
  | { type: "suspend"; reason: string }
  | {
      type: "register_initiative";
      initiative: {
        id: string;
        module: string;
        capability: string;
        entry: string;
        obligation: string;
        priority: number;
        dependsOn?: string[];
        inheritedSpecifications?: string[];
        outstanding?: string[];
      };
    }
  | { type: "select_next" }
  | { type: "open_packet"; initiativeId: string; packetId: string }
  | { type: "set_coverage"; initiativeId: string; coverageComplete: boolean }
  | {
      type: "architect_session";
      initiativeId: string;
      outcome: "continue" | "interrupted" | "packets_released" | "founder_decision" | "external_blocker" | "complete";
      note?: string;
    }
  | { type: "close_initiative"; initiativeId: string }
  | { type: "reconcile_dispatch"; packetId: string; workerExecution: "ran" | "absent" };

export interface WakeProposal {
  kind: "initiative" | "packet";
  id: string;
  decision: Decision;
}

export interface ControlStep {
  ledger: FactoryLedger;
  wakes: WakeProposal[];
  reason: string;
}

export interface ReadModel {
  stateRevision: number;
  scope: ScopeState;
  modules: Array<{ module: string; complete: boolean; reason: string }>;
  initiatives: Array<{
    id: string;
    module: string;
    capability: string;
    entry: string;
    obligation: string;
    queue: InitiativeRecord["queue"];
    priority: number;
    dependsOn: string[];
    inheritedSpecifications: string[];
    investigation: InitiativeRecord["investigation"];
    session: InitiativeRecord["session"];
    coverageComplete: boolean | null;
    outstanding: string[];
    packetIds: string[];
    blockedReason: string | null;
    updatedAt: string | null;
    dispatch: DispatchRecord | null;
  }>;
  packets: Array<{
    id: string;
    initiativeId: string;
    stage: string;
    wake: string;
    executionMode: "manual" | "automatic" | null;
    candidateSha: string | null;
    verifiedSha: string | null;
    integratedSha: string | null;
    reconciliationId: string | null;
    dispatch: DispatchRecord | null;
    dispatchHistory: DispatchRecord[];
    checks: Array<{ name: string; runId: string; outcome: string }>;
  }>;
}

function cloneLedger(ledger: FactoryLedger): FactoryLedger {
  return structuredClone(ledger);
}

function bump(revision: string): string {
  const match = /^rev-(\d+)$/.exec(revision);
  if (!match) return `${revision}-2`;
  return `rev-${Number(match[1]) + 1}`;
}

export function freshInitiative(input: {
  id: string;
  module: string;
  capability: string;
  entry: string;
  obligation: string;
  priority: number;
  dependsOn?: string[];
  inheritedSpecifications?: string[];
  outstanding?: string[];
  now?: string | null;
}): InitiativeRecord {
  return {
    id: input.id,
    module: input.module,
    capability: input.capability,
    entry: input.entry,
    obligation: input.obligation,
    priority: input.priority,
    dependsOn: input.dependsOn ?? [],
    inheritedSpecifications: input.inheritedSpecifications ?? [],
    investigation: "discovered",
    queue: "discovered",
    coverageComplete: null,
    outstanding: input.outstanding ?? [],
    session: "idle",
    revision: "rev-0",
    dispatch: null,
    blockedReason: null,
    packetIds: [],
    updatedAt: input.now ?? null,
  };
}

export function moduleComplete(ledger: FactoryLedger, module: string): { complete: boolean; reason: string } {
  const rows = Object.values(ledger.initiatives).filter((item) => item.module === module);
  if (!rows.length) return { complete: false, reason: "no_initiatives" };
  if (rows.some((item) => item.coverageComplete !== true)) return { complete: false, reason: "coverage_open" };
  if (rows.some((item) => item.queue !== "completed")) return { complete: false, reason: "initiatives_open" };
  return { complete: true, reason: "covered" };
}

function depsMet(item: InitiativeRecord, initiatives: Record<string, InitiativeRecord>): boolean {
  return item.dependsOn.every((id) => initiatives[id]?.queue === "completed");
}

function eligible(ledger: FactoryLedger): InitiativeRecord[] {
  return Object.values(ledger.initiatives)
    .filter((item) => ledger.scope.modules.includes(item.module))
    .filter((item) => item.queue === "discovered" || item.queue === "eligible")
    .filter((item) => depsMet(item, ledger.initiatives))
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
}

export function applyLedgerEvent(ledger: FactoryLedger, event: LedgerEvent, world: World): LedgerResult {
  const next = cloneLedger(ledger);
  const refuse = (reason: string): LedgerResult => ({ ok: false, reason, ledger });
  const accept = (reason: string): LedgerResult => ({ ok: true, reason, ledger: next });

  if (event.type === "authorize_scope") {
    if (!event.id || !event.modules.length) return refuse("scope_incomplete");
    if (!Number.isInteger(event.authorizedDispatches) || event.authorizedDispatches <= 0) {
      return refuse("dispatch_not_authorized");
    }
    next.scope = {
      id: event.id,
      status: "active",
      modules: [...event.modules],
      founderDecision: null,
      blockReason: null,
    };
    next.authorizedDispatches = event.authorizedDispatches;
    return accept("scope_authorized");
  }

  if (event.type === "suspend") {
    if (!event.reason) return refuse("suspension_reason_missing");
    next.scope = { ...next.scope, status: "suspended", blockReason: event.reason };
    return accept("suspended");
  }

  if (event.type === "register_initiative") {
    const seed = event.initiative;
    if (!seed.id || !seed.module || !seed.entry || !seed.obligation) return refuse("initiative_incomplete");
    if (next.initiatives[seed.id]) return refuse("initiative_exists");
    if (!Number.isFinite(seed.priority)) return refuse("priority_missing");
    next.initiatives[seed.id] = freshInitiative({ ...seed, now: world.now });
    return accept("initiative_registered");
  }

  if (event.type === "select_next") {
    if (world.activation !== "active") return refuse("inactive");
    if (next.scope.status === "suspended") return refuse("suspended");
    if (next.scope.status === "inactive") return refuse("scope_inactive");
    if (next.scope.status === "complete") return refuse("scope_complete");
    if (next.scope.founderDecision) return refuse("founder_decision");
    if (Object.values(next.initiatives).some((item) => item.queue === "active")) return refuse("initiative_active");
    const chosen = eligible(next)[0];
    if (!chosen) {
      const open = next.scope.modules.some((module) => !moduleComplete(next, module).complete);
      if (!open && next.scope.modules.length > 0) {
        next.scope = { ...next.scope, status: "complete" };
        return accept("scope_complete");
      }
      return refuse("none_eligible");
    }
    next.initiatives[chosen.id] = {
      ...chosen,
      queue: "active",
      session: "continuation_due",
      investigation: chosen.investigation === "discovered" ? "investigating" : chosen.investigation,
      updatedAt: world.now,
    };
    return accept("selected");
  }

  if (event.type === "open_packet") {
    const initiative = next.initiatives[event.initiativeId];
    if (!initiative || initiative.queue !== "active") return refuse("initiative_not_active");
    if (next.packets[event.packetId]) return refuse("packet_exists");
    const packet = freshItem(event.packetId, initiative.id);
    packet.releaseEligible = false;
    next.packets[event.packetId] = packet;
    initiative.packetIds = [...initiative.packetIds, event.packetId];
    initiative.updatedAt = world.now;
    return accept("packet_opened");
  }

  if (event.type === "set_coverage") {
    const initiative = next.initiatives[event.initiativeId];
    if (!initiative) return refuse("unknown_initiative");
    initiative.coverageComplete = event.coverageComplete;
    initiative.updatedAt = world.now;
    return accept("coverage_set");
  }

  if (event.type === "architect_session") {
    const initiative = next.initiatives[event.initiativeId];
    if (!initiative || initiative.queue !== "active") return refuse("initiative_not_active");
    initiative.updatedAt = world.now;
    if (event.outcome === "continue" || event.outcome === "interrupted") {
      initiative.revision = bump(initiative.revision);
      initiative.dispatch = null;
      initiative.session = "continuation_due";
      return accept(event.outcome === "interrupted" ? "architect_interrupted" : "architect_continue");
    }
    if (event.outcome === "packets_released" || event.outcome === "complete") {
      initiative.session = "idle";
      initiative.dispatch = null;
      if (event.outcome === "complete") initiative.investigation = "closed";
      return accept(event.outcome === "complete" ? "architect_complete" : "packets_released");
    }
    if (event.outcome === "founder_decision") {
      const note = event.note ?? "founder_decision";
      initiative.session = "founder_decision";
      initiative.blockedReason = note;
      next.scope = { ...next.scope, founderDecision: note };
      return accept("founder_decision");
    }
    initiative.queue = "blocked";
    initiative.session = "idle";
    initiative.blockedReason = event.note ?? "external_blocker";
    next.scope = { ...next.scope, status: "suspended", blockReason: initiative.blockedReason };
    return accept("external_blocker");
  }

  if (event.type === "close_initiative") {
    const initiative = next.initiatives[event.initiativeId];
    if (!initiative) return refuse("unknown_initiative");
    if (initiative.coverageComplete !== true) return refuse("coverage_incomplete");
    const packets = initiative.packetIds.map((id) => next.packets[id]).filter(Boolean);
    if (!packets.length || packets.some((packet) => packet.stage !== "accepted")) return refuse("packets_open");
    initiative.queue = "completed";
    initiative.session = "idle";
    initiative.investigation = "closed";
    initiative.dispatch = null;
    initiative.updatedAt = world.now;
    return accept("initiative_completed");
  }

  if (event.type === "reconcile_dispatch") {
    const packet = next.packets[event.packetId];
    if (!packet) return refuse("unknown_packet");
    const current = packet.dispatch;
    if (!current) return refuse("no_dispatch");
    const refund =
      event.workerExecution === "absent" &&
      current.effect === "wake_sa" &&
      packet.dispatchedSaRevision === current.revision;
    if (refund && next.usedDispatches < 1) return refuse("spend_missing");
    packet.dispatchHistory = [
      ...(packet.dispatchHistory ?? []),
      { ...current, workerExecution: event.workerExecution },
    ];
    packet.dispatch = null;
    if (refund) {
      packet.dispatchedSaRevision = null;
      next.usedDispatches -= 1;
    }
    return accept(event.workerExecution === "ran" ? "dispatch_ran" : "dispatch_absent");
  }

  return refuse("unknown_event");
}

export function decideScope(ledger: FactoryLedger, world: World): Decision & { initiativeId: string | null } {
  const none = (reason: string): Decision & { initiativeId: string | null } => ({
    effect: "none",
    reason,
    label: null,
    initiativeId: null,
  });
  if (world.activation !== "active") return none("inactive");
  if (ledger.scope.status === "suspended" || world.scopeStatus === "suspended") return none("suspended");
  if (ledger.scope.status === "inactive" || world.scopeStatus === "inactive") return none("scope_inactive");
  if (ledger.scope.status === "complete" || world.scopeStatus === "complete") return none("scope_complete");
  if (ledger.scope.founderDecision) return none("founder_decision");
  if (world.authorizedDispatches == null || world.authorizedDispatches <= 0) return none("dispatch_not_authorized");
  if (world.usedDispatches >= world.authorizedDispatches) return none("dispatch_authorization_exhausted");
  const active = Object.values(ledger.initiatives).find((item) => item.queue === "active");
  if (!active) return none("no_initiative");
  if (active.session === "founder_decision") return none("founder_decision");
  if (active.dispatch && active.session === "running") return none("already_dispatched");
  if (active.session === "continuation_due" && !active.dispatch) {
    return {
      effect: "wake_architect",
      reason: "architect_due",
      label: "factory-wake-architect",
      initiativeId: active.id,
    };
  }
  return none("no_transition");
}

/**
 * An engineer is already in the slot when a change is dispatched and not yet
 * committed, a lease is still live, or a repair for this fingerprint was already
 * woken. A packet that is merely waiting for its first repair wake does not
 * occupy the slot; the pass below proposes at most one such wake.
 */
function implementationOccupied(ledger: FactoryLedger, now: string): boolean {
  return Object.values(ledger.packets).some((packet) => {
    if (packet.stage === "change_specified" && packet.dispatchedEngineerRevision === packet.revision) return true;
    if (packet.stage === "engineering" && leaseActive(packet, now)) return true;
    if (
      packet.stage === "engineering" &&
      packet.lastFailureFingerprint != null &&
      packet.dispatchedRepairFingerprint === packet.lastFailureFingerprint
    ) {
      return true;
    }
    return false;
  });
}

/** True while a Systems Analyst dispatch is the current authorization for some packet. */
function analystOpen(ledger: FactoryLedger): boolean {
  return Object.values(ledger.packets).some((packet) => packet.dispatch?.effect === "wake_sa");
}

/** One deterministic pass. Packet wakes are preferred over another architect session. */
export function controlStep(ledger: FactoryLedger, world: World): ControlStep {
  const scoped: World = {
    ...world,
    scopeStatus: ledger.scope.status,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
  };
  if (scoped.activation !== "active") return { ledger, wakes: [], reason: "inactive" };
  if (ledger.scope.status !== "active") {
    const reason = ledger.scope.status === "suspended" ? "suspended" : ledger.scope.status === "complete" ? "scope_complete" : "scope_inactive";
    return { ledger, wakes: [], reason };
  }
  let next = ledger;
  const active = Object.values(ledger.initiatives).find((item) => item.queue === "active");
  if (!active && !ledger.scope.founderDecision) {
    const selected = applyLedgerEvent(ledger, { type: "select_next" }, scoped);
    if (selected.ok) next = selected.ledger;
  }
  const packetWorld: World = { ...scoped, scopeStatus: next.scope.status, authorizedDispatches: next.authorizedDispatches, usedDispatches: next.usedDispatches };
  let engineerSlot = world.engineeringBusy || implementationOccupied(next, scoped.now);
  const saOpen = analystOpen(next);
  let saProposed = saOpen;
  const packetWakes: WakeProposal[] = [];
  const packets = Object.values(next.packets).sort((a, b) => a.id.localeCompare(b.id));
  for (const packet of packets) {
    const decision = decide(packet, { ...packetWorld, engineeringBusy: engineerSlot });
    if (decision.effect === "none") continue;
    if (decision.effect === "wake_sa" && saProposed) continue;
    packetWakes.push({ kind: "packet", id: packet.id, decision });
    if (decision.effect === "wake_sa") saProposed = true;
    if (decision.effect === "wake_engineer" || decision.effect === "wake_repair") engineerSlot = true;
  }
  if (packetWakes.length) return { ledger: next, wakes: packetWakes, reason: packetWakes[0].decision.reason };
  if (saOpen) return { ledger: next, wakes: [], reason: "analyst_open" };
  const architect = decideScope(next, packetWorld);
  if (architect.effect !== "none" && architect.initiativeId) {
    return {
      ledger: next,
      wakes: [{ kind: "initiative", id: architect.initiativeId, decision: architect }],
      reason: architect.reason,
    };
  }
  return { ledger: next, wakes: [], reason: architect.reason };
}

export function projectFactory(ledger: FactoryLedger): ReadModel {
  return {
    stateRevision: ledger.stateRevision,
    scope: structuredClone(ledger.scope),
    modules: ledger.scope.modules.map((module) => ({ module, ...moduleComplete(ledger, module) })),
    initiatives: Object.values(ledger.initiatives)
      .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
      .map((item) => ({
        id: item.id,
        module: item.module,
        capability: item.capability,
        entry: item.entry,
        obligation: item.obligation,
        queue: item.queue,
        priority: item.priority,
        dependsOn: [...item.dependsOn],
        inheritedSpecifications: [...item.inheritedSpecifications],
        investigation: item.investigation,
        session: item.session,
        coverageComplete: item.coverageComplete,
        outstanding: [...item.outstanding],
        packetIds: [...item.packetIds],
        blockedReason: item.blockedReason,
        updatedAt: item.updatedAt,
        dispatch: item.dispatch ? { ...item.dispatch } : null,
      })),
    packets: Object.values(ledger.packets).map((packet) => ({
      id: packet.id,
      initiativeId: packet.initiativeId,
      stage: packet.stage,
      wake: packet.wake,
      executionMode: packet.execution?.mode ?? null,
      candidateSha: packet.candidateSha,
      verifiedSha: packet.verifiedSha,
      integratedSha: packet.integratedSha,
      reconciliationId: packet.reconciliationId,
      dispatch: packet.dispatch ? { ...packet.dispatch } : null,
      dispatchHistory: (packet.dispatchHistory ?? []).map((record) => ({ ...record })),
      checks: packet.execution?.checks.map((check) => ({ ...check })) ?? [],
    })),
  };
}

export async function commitLedgerEvent(
  store: StateStore,
  event: LedgerEvent,
  world: World,
): Promise<LedgerResult> {
  return store.transact(async (ledger) => {
    const applied = applyLedgerEvent(ledger, event, world);
    if (!applied.ok) return { write: null, result: applied };
    return {
      write: { ...applied.ledger, stateRevision: ledger.stateRevision + 1 },
      result: { ...applied, ledger: { ...applied.ledger, stateRevision: ledger.stateRevision + 1 } },
    };
  });
}

export async function dispatchInitiative(opts: {
  store: StateStore;
  actuator: LabelActuator;
  initiativeId: string;
  prHead: string;
  activation: World["activation"];
  now: string;
  engineeringBusy: boolean;
  budgetUsd: number | null;
}): Promise<{ ok: boolean; reason: string }> {
  return opts.store.transact(async (ledger) => {
    const world: World = {
      activation: opts.activation,
      now: opts.now,
      engineeringBusy: opts.engineeringBusy,
      budgetUsd: opts.budgetUsd,
      authorizedDispatches: ledger.authorizedDispatches,
      usedDispatches: ledger.usedDispatches,
      scopeStatus: ledger.scope.status,
    };
    const decision = decideScope(ledger, world);
    if (decision.effect !== "wake_architect" || decision.initiativeId !== opts.initiativeId || !decision.label) {
      return { write: null, result: { ok: false, reason: decision.reason } };
    }
    const initiative = ledger.initiatives[opts.initiativeId];
    const added = await opts.actuator.add({
      label: decision.label,
      packetId: initiative.id,
      revision: initiative.revision,
      prHead: opts.prHead,
    });
    if (!added.ok) return { write: null, result: { ok: false, reason: added.reason } };
    const acknowledged: InitiativeRecord = {
      ...initiative,
      session: "running",
      dispatch: {
        packetId: initiative.id,
        revision: initiative.revision,
        prHead: opts.prHead,
        effect: "wake_architect",
        label: "factory-wake-architect",
        issuedAt: opts.now,
      },
    };
    return {
      write: {
        ...ledger,
        stateRevision: ledger.stateRevision + 1,
        usedDispatches: ledger.usedDispatches + 1,
        initiatives: { ...ledger.initiatives, [initiative.id]: acknowledged },
      },
      result: { ok: true, reason: "dispatched" },
    };
  });
}
