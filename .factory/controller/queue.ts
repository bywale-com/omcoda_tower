/**
 * Scope, initiative queue, and the one control step.
 *
 * Selection is a sort. It does not call a model. A wake is still only a
 * proposal: the label actuator acknowledges it, and a failed add writes nothing.
 * PKT-001's manual execution record is not rewritten here.
 */
import {
  analystAssignment,
  engineerAssignment,
  latestArchitectExecution,
  liveExecutionFor,
  openExecution,
  planContinuation,
  planPacketContinuation,
  productionPressure,
  recoverExecutions,
  runsOnAgent,
  unconfirmedDelivery,
  type UnconfirmedDelivery,
} from "./execution.ts";
import { readyReleases } from "./conclusion.ts";
import { explainFactory, type FactoryExplanation } from "./explain.ts";
import {
  applyEvent,
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
      type: "resume_scope";
      reason: string;
      authorizedDispatches: number;
      lanes?: Array<"engineer" | "analyst" | "architect"> | null;
    }
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
      outcome: "continue" | "interrupted" | "checkpoint" | "packets_released" | "founder_decision" | "external_blocker" | "complete";
      note?: string;
      agentId?: string;
      contextSaturated?: boolean;
    }
  | { type: "close_initiative"; initiativeId: string }
  | { type: "reconcile_dispatch"; packetId: string; workerExecution: "ran" | "absent" }
  | { type: "recover_stale" }
  | {
      type: "record_release";
      id: string;
      packetIds: string[];
      prNumber: number;
      prUrl: string;
      openedAt: string;
    }
  | { type: "conclude_release"; id: string; mergeSha: string; reconciliationId: string }
  | {
      type: "record_siblings";
      packetId: string;
      siblings: Array<{ id: string; basis: "contract" | "dependency" | "component" | "runtime" | "boundary"; note: string }>;
    };

export interface WakeProposal {
  kind: "initiative" | "packet";
  id: string;
  packetIds?: string[];
  basis?: string | null;
  decision: Decision;
}

export interface ControlStep {
  ledger: FactoryLedger;
  wakes: WakeProposal[];
  reason: string;
  /** Set when an open authorization still needs its label pulse. Not a new spend. */
  redelivery?: UnconfirmedDelivery | null;
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
  /** Derived. It does not admit a transition. `now` empty leaves lease validity Unknown. */
  explanation: FactoryExplanation;
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

  if (event.type === "resume_scope") {
    if (next.scope.status !== "suspended") return refuse("not_suspended");
    if (!event.reason) return refuse("resume_reason_missing");
    if (event.authorizedDispatches !== next.authorizedDispatches) return refuse("cap_changed");
    if (event.lanes?.some((lane) => lane !== "engineer" && lane !== "analyst" && lane !== "architect")) {
      return refuse("lane_invalid");
    }
    next.scope = {
      ...next.scope,
      status: "active",
      blockReason: null,
      lanes: event.lanes === undefined ? null : event.lanes,
    };
    return accept("scope_resumed");
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
    if (event.contextSaturated) initiative.contextSaturated = true;
    if (event.outcome === "checkpoint") {
      initiative.checkpointAt = world.now;
      if (initiative.session === "continuation_due") initiative.session = "running";
      if (event.agentId && initiative.dispatch) {
        const executions = next.executions ?? {};
        let execution = initiative.dispatch.executionId ? executions[initiative.dispatch.executionId] : null;
        if (!execution) {
          const opened = openExecution({
            stateRevision: next.stateRevision,
            role: "architect",
            effect: "wake_architect",
            packetIds: [initiative.id],
            revisions: { [initiative.id]: initiative.revision },
            label: initiative.dispatch.label,
            prHead: initiative.dispatch.prHead,
            now: initiative.dispatch.issuedAt ?? world.now,
            continuation: "fresh",
            agentId: event.agentId,
            reserveMs: 3 * 60 * 60 * 1000,
          });
          opened.execution.phase = "running";
          opened.execution.startedAt = world.now;
          opened.execution.runningAt = world.now;
          opened.assignment.initiativeId = initiative.id;
          next.executions = { ...executions, [opened.execution.id]: opened.execution };
          next.assignments = { ...(next.assignments ?? {}), [opened.assignment.id]: opened.assignment };
          initiative.dispatch = {
            ...initiative.dispatch,
            executionId: opened.execution.id,
            assignmentId: opened.assignment.id,
          };
        } else if (
          execution.phase !== "completed" &&
          execution.phase !== "failed" &&
          execution.phase !== "refused" &&
          execution.phase !== "interrupted"
        ) {
          execution.agentId = event.agentId;
          execution.phase = "running";
          execution.runningAt = execution.runningAt ?? world.now;
        }
      }
      return accept("architect_checkpoint");
    }
    if (event.outcome === "continue" || event.outcome === "interrupted") {
      const executions = { ...(next.executions ?? {}) };
      let execution = initiative.dispatch?.executionId ? executions[initiative.dispatch.executionId] ?? null : null;
      if (!execution && initiative.dispatch) {
        const opened = openExecution({
          stateRevision: next.stateRevision,
          role: "architect",
          effect: "wake_architect",
          packetIds: [initiative.id],
          revisions: { [initiative.id]: initiative.revision },
          label: initiative.dispatch.label,
          prHead: initiative.dispatch.prHead,
          now: initiative.dispatch.issuedAt ?? world.now,
          continuation: "fresh",
          agentId: event.agentId ?? null,
          reserveMs: 3 * 60 * 60 * 1000,
        });
        opened.assignment.initiativeId = initiative.id;
        execution = opened.execution;
        executions[execution.id] = execution;
        next.assignments = { ...(next.assignments ?? {}), [opened.assignment.id]: opened.assignment };
      }
      if (
        execution &&
        execution.phase !== "completed" &&
        execution.phase !== "failed" &&
        execution.phase !== "refused" &&
        execution.phase !== "interrupted"
      ) {
        execution.phase = event.outcome === "interrupted" ? "interrupted" : "completed";
        execution.endedAt = world.now;
        execution.reason = event.outcome === "interrupted" ? "worker_interrupted" : "execution_ended";
        if (event.agentId) execution.agentId = event.agentId;
      }
      next.executions = executions;
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

  if (event.type === "recover_stale") {
    const recovered = recoverExecutions(next, world.now);
    if (!recovered.changes.length) return refuse("nothing_stale");
    next.executions = recovered.ledger.executions;
    next.assignments = recovered.ledger.assignments;
    next.packets = recovered.ledger.packets;
    next.initiatives = recovered.ledger.initiatives;
    next.usedDispatches = recovered.ledger.usedDispatches;
    return accept("recovered");
  }

  if (event.type === "record_release") {
    const ready = readyReleases(Object.values(next.packets)).find((release) => release.id === event.id);
    if (!ready) return refuse("release_not_ready");
    if (event.packetIds.join("\n") !== ready.packetIds.join("\n")) return refuse("release_mismatch");
    if (next.releases?.[event.id]) return refuse("release_exists");
    if (!Number.isInteger(event.prNumber) || event.prNumber <= 0 || !event.prUrl) return refuse("release_pr_missing");
    next.releases = {
      ...(next.releases ?? {}),
      [event.id]: {
        id: event.id,
        packetIds: [...ready.packetIds],
        prNumber: event.prNumber,
        prUrl: event.prUrl,
        openedAt: event.openedAt,
        mergeSha: null,
      },
    };
    return accept("release_recorded");
  }

  if (event.type === "conclude_release") {
    const release = next.releases?.[event.id];
    if (!release) return refuse("release_missing");
    if (!/^[0-9a-f]{40}$/i.test(event.mergeSha)) return refuse("integration_evidence_missing");
    if (!event.reconciliationId) return refuse("integration_evidence_missing");
    for (const id of release.packetIds) {
      let item = next.packets[id];
      if (!item) return refuse("unknown_packet");
      if (item.stage === "accepted" && item.integratedSha === event.mergeSha) continue;
      const sha = item.verifiedSha;
      if (!sha) return refuse("sha_mismatch");
      const steps = [
        { type: "authorize_integration" as const, sha },
        { type: "integrate" as const, candidateSha: sha, mergeSha: event.mergeSha },
        { type: "reconcile" as const, sha, reconciliationId: event.reconciliationId },
        { type: "accept" as const, sha },
      ];
      for (const step of steps) {
        const applied = applyEvent(item, step, world);
        if (!applied.ok) return refuse(applied.reason);
        item = applied.item;
      }
      next.packets[id] = item;
    }
    next.releases = {
      ...next.releases,
      [event.id]: { ...release, mergeSha: event.mergeSha },
    };
    return accept("release_concluded");
  }

  if (event.type === "record_siblings") {
    const packet = next.packets[event.packetId];
    if (!packet) return refuse("unknown_packet");
    if (!event.siblings.length) return refuse("siblings_missing");
    for (const link of event.siblings) {
      if (!link.id || link.id === packet.id || !link.note) return refuse("sibling_invalid");
    }
    packet.siblings = event.siblings.map((link) => ({ id: link.id, basis: link.basis, note: link.note }));
    return accept("siblings_recorded");
  }

  if (event.type === "reconcile_dispatch") {
    const packet = next.packets[event.packetId];
    if (!packet) return refuse("unknown_packet");
    const current = packet.dispatch;
    if (!current) return refuse("no_dispatch");
    if (event.workerExecution === "ran" && current.executionId) {
      const execution = next.executions?.[current.executionId];
      if (execution?.phase === "dispatched") return refuse("lease_not_claimed");
    }
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
    if (productionPressure(Object.values(ledger.packets)).holdArchitect) return none("backpressure");
    const latest = latestArchitectExecution(ledger, active.id);
    const plan = planContinuation({
      agentId: latest?.agentId ?? null,
      runsOnAgent: runsOnAgent(ledger, latest?.agentId ?? null),
      resumeSupported: world.resumeSupported === true,
      contextSaturated: active.contextSaturated === true,
    });
    if (plan.mode === "resume" && plan.agentId) {
      return {
        effect: "wake_architect",
        reason: "architect_resume",
        label: null,
        delivery: "resume",
        agentId: plan.agentId,
        initiativeId: active.id,
      };
    }
    return {
      effect: "wake_architect",
      reason: "architect_due",
      label: "factory-wake-architect",
      delivery: "label",
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
function pendingDispatchOccupies(issuedAt: string | undefined, now: string): boolean {
  if (!issuedAt) return true;
  return new Date(Date.parse(issuedAt) + 30 * 60 * 1000).toISOString() > now;
}

function implementationOccupied(ledger: FactoryLedger, now: string): boolean {
  return Object.values(ledger.packets).some((packet) => {
    if (packet.stage === "engineering" && leaseActive(packet, now)) return true;
    const execution = liveExecutionFor(ledger, packet.id);
    if (execution && (packet.stage === "change_specified" || packet.stage === "engineering")) {
      if (execution.phase === "dispatched") return execution.reserveUntil > now;
      if (execution.phase === "started") return (execution.startUntil ?? execution.reserveUntil) > now;
      if (execution.phase === "running") return Boolean(execution.leaseUntil && execution.leaseUntil > now);
      return false;
    }
    if (packet.stage === "change_specified" && packet.dispatchedEngineerRevision === packet.revision) {
      return pendingDispatchOccupies(packet.dispatch?.issuedAt, now);
    }
    if (
      packet.stage === "engineering" &&
      packet.lastFailureFingerprint != null &&
      packet.dispatchedRepairFingerprint === packet.lastFailureFingerprint
    ) {
      return leaseActive(packet, now) || pendingDispatchOccupies(packet.dispatch?.issuedAt, now);
    }
    return false;
  });
}

/** True while a Systems Analyst dispatch is the current authorization for some packet. */
function analystOpen(ledger: FactoryLedger): boolean {
  return Object.values(ledger.packets).some((packet) => packet.dispatch?.effect === "wake_sa");
}

/** True while an Analyst lease is still the authority for an unsigned change. */
function analystLeaseOpen(ledger: FactoryLedger, now: string): boolean {
  return Object.values(ledger.packets).some((packet) => packet.stage === "analysis" && leaseActive(packet, now));
}

/** One deterministic pass. Packet wakes are preferred over another architect session. */
export function controlStep(ledger: FactoryLedger, world: World): ControlStep {
  const recovered = recoverExecutions(ledger, world.now);
  ledger = recovered.ledger;
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
  const redelivery = unconfirmedDelivery(next, packetWorld.now);
  if (redelivery) return { ledger: next, wakes: [], reason: "delivery_unconfirmed", redelivery };
  let engineerSlot = world.engineeringBusy || implementationOccupied(next, scoped.now);
  const saOpen = analystOpen(next);
  let saProposed = saOpen;
  const packetWakes: WakeProposal[] = [];
  const claimed = new Set<string>();
  const packets = Object.values(next.packets).sort((a, b) => a.id.localeCompare(b.id));
  for (const packet of packets) {
    if (claimed.has(packet.id)) continue;
    const decision = decide(packet, { ...packetWorld, engineeringBusy: engineerSlot });
    if (decision.effect === "none") continue;
    if (decision.effect === "wake_sa" && saProposed) continue;
    if (decision.effect === "wake_sa") {
      const full = analystAssignment(Object.values(next.packets)) ?? { packetIds: [packet.id], basis: null };
      const plan = planPacketContinuation({
        ledger: next,
        role: "analyst",
        packetIds: full.packetIds,
        resumeSupported: packetWorld.resumeSupported === true,
      });
      const batch = analystAssignment(Object.values(next.packets), { limit: plan.limit }) ?? full;
      packetWakes.push({
        kind: "packet",
        id: batch.packetIds[0] ?? packet.id,
        packetIds: batch.packetIds,
        basis: batch.basis,
        decision: {
          ...decision,
          packetIds: batch.packetIds,
          basis: batch.basis,
          ...(plan.mode === "resume" ? { delivery: "resume" as const, agentId: plan.agentId, label: null } : {}),
        },
      });
      saProposed = true;
      continue;
    }
    if (decision.effect === "wake_engineer") {
      const batch = engineerAssignment(Object.values(next.packets)) ?? { packetIds: [packet.id], basis: null };
      const plan = planPacketContinuation({
        ledger: next,
        role: "engineer",
        packetIds: batch.packetIds,
        resumeSupported: packetWorld.resumeSupported === true,
      });
      for (const id of batch.packetIds) claimed.add(id);
      packetWakes.push({
        kind: "packet",
        id: batch.packetIds[0] ?? packet.id,
        packetIds: batch.packetIds,
        basis: batch.basis,
        decision: {
          ...decision,
          packetIds: batch.packetIds,
          basis: batch.basis,
          ...(plan.mode === "resume" ? { delivery: "resume" as const, agentId: plan.agentId, label: null } : {}),
        },
      });
      engineerSlot = true;
      continue;
    }
    packetWakes.push({ kind: "packet", id: packet.id, decision });
    if (decision.effect === "wake_engineer" || decision.effect === "wake_repair") engineerSlot = true;
  }
  const lanes = next.scope.lanes ?? null;
  const allowedPackets = filterLanes(packetWakes, lanes);
  if (packetWakes.length && !allowedPackets.length) return { ledger: next, wakes: [], reason: "lane_held" };
  if (allowedPackets.length) return { ledger: next, wakes: allowedPackets, reason: allowedPackets[0].decision.reason };
  if (saOpen) return { ledger: next, wakes: [], reason: "analyst_open" };
  if (analystLeaseOpen(next, scoped.now)) return { ledger: next, wakes: [], reason: "analysis_open" };
  const architect = decideScope(next, packetWorld);
  if (architect.effect !== "none" && architect.initiativeId) {
    const architectWake: WakeProposal = { kind: "initiative", id: architect.initiativeId, decision: architect };
    const allowedArchitect = filterLanes([architectWake], lanes);
    if (!allowedArchitect.length) return { ledger: next, wakes: [], reason: "lane_held" };
    return { ledger: next, wakes: allowedArchitect, reason: architect.reason };
  }
  return { ledger: next, wakes: [], reason: architect.reason };
}

function filterLanes(
  wakes: WakeProposal[],
  lanes: Array<"engineer" | "analyst" | "architect"> | null,
): WakeProposal[] {
  if (!lanes) return wakes;
  return wakes.filter((wake) => {
    const effect = wake.decision.effect;
    if (effect === "wake_engineer" || effect === "wake_repair") return lanes.includes("engineer");
    if (effect === "wake_sa") return lanes.includes("analyst");
    if (effect === "wake_architect") return lanes.includes("architect");
    return false;
  });
}

export function projectFactory(ledger: FactoryLedger, now = ""): ReadModel {
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
    explanation: explainFactory(ledger, now),
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
  resumeSupported?: boolean;
  resume?: (agentId: string, text: string) => Promise<{ ok: boolean; reason: string }>;
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
      resumeSupported: opts.resumeSupported === true,
    };
    const decision = decideScope(ledger, world);
    if (decision.effect !== "wake_architect" || decision.initiativeId !== opts.initiativeId) {
      return { write: null, result: { ok: false, reason: decision.reason } };
    }
    const initiative = ledger.initiatives[opts.initiativeId];
    const continuation = decision.delivery === "resume" ? "resume" : "fresh";
    if (continuation === "resume") {
      if (!decision.agentId || !opts.resume) return { write: null, result: { ok: false, reason: "continuation_unavailable" } };
      const sent = await opts.resume(
        decision.agentId,
        `Continue initiative ${initiative.id} from the handoff. A checkpoint does not end this execution.`,
      );
      if (!sent.ok) return { write: null, result: { ok: false, reason: sent.reason } };
    } else {
      if (!decision.label) return { write: null, result: { ok: false, reason: decision.reason } };
      const added = await opts.actuator.add({
        label: decision.label,
        packetId: initiative.id,
        revision: initiative.revision,
        prHead: opts.prHead,
      });
      if (!added.ok) return { write: null, result: { ok: false, reason: added.reason } };
    }
    const opened = openExecution({
      stateRevision: ledger.stateRevision,
      role: "architect",
      effect: "wake_architect",
      packetIds: [initiative.id],
      revisions: { [initiative.id]: initiative.revision },
      label: "factory-wake-architect",
      prHead: opts.prHead,
      now: opts.now,
      continuation,
      agentId: decision.agentId ?? null,
      reserveMs: 3 * 60 * 60 * 1000,
    });
    const acknowledged: InitiativeRecord = {
      ...initiative,
      session: "running",
      contextSaturated: false,
      dispatch: {
        packetId: initiative.id,
        revision: initiative.revision,
        prHead: opts.prHead,
        effect: "wake_architect",
        label: "factory-wake-architect",
        issuedAt: opts.now,
        executionId: opened.execution.id,
        assignmentId: opened.assignment.id,
      },
    };
    return {
      write: {
        ...ledger,
        stateRevision: ledger.stateRevision + 1,
        usedDispatches: ledger.usedDispatches + 1,
        initiatives: { ...ledger.initiatives, [initiative.id]: acknowledged },
        executions: { ...(ledger.executions ?? {}), [opened.execution.id]: opened.execution },
        assignments: { ...(ledger.assignments ?? {}), [opened.assignment.id]: opened.assignment },
      },
      result: { ok: true, reason: continuation === "resume" ? "resumed" : "dispatched" },
    };
  });
}
