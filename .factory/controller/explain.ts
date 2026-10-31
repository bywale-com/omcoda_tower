/**
 * Explainable factory state.
 *
 * Derived from the ledger the controller already keeps. This module does not
 * write, does not admit a transition, and does not read handoff prose.
 * A fact the ledger does not store is Unknown. A missing heartbeat is not a stall.
 * `now` is the caller's clock. An empty `now` leaves lease validity Unknown.
 */

import { dependencyComponents, readyReleases } from "./conclusion.ts";
import type { FactoryLedger, InitiativeRecord, ReleaseRecord } from "./dispatch.ts";
import {
  engineerQueueDepth,
  executionOccupies,
  isTerminal,
  liveExecutionFor,
  PENDING_RESERVE_MS,
  plusMs,
  recordedSpecificationReturn,
  type WorkerExecution,
} from "./execution.ts";
import { decide, type WakeEffect, type WorkItem, type World } from "./machine.ts";

const SATISFIED = new Set(["accepted", "integrated", "reconciled", "integration_authorized"]);

export type Actor = "architect" | "analyst" | "engineer" | "controller" | "github_actions" | "founder" | "unknown";

export type Situation = "proceeding" | "held" | "external" | "intervention" | "complete" | "unknown";

export interface NamedClock {
  name: "dispatch_attempted" | "lease_until" | "running_since" | "release_opened";
  at: string;
}

export interface WorkExplanation {
  id: string;
  where: string;
  happening: string;
  why: string;
  next: string;
  who: Actor;
  clocks: NamedClock[];
  situation: Situation;
}

export interface ExecutionExplanation {
  id: string;
  packetIds: string[];
  phase: WorkerExecution["phase"];
  alert: boolean;
  historical: boolean;
  why: string;
  clocks: NamedClock[];
}

export interface ObservedVerification {
  name: string;
  status: string;
  conclusion: string | null;
  runId: string;
}

export interface FactoryExplanation {
  summary: {
    headline: string;
    scopeStatus: FactoryLedger["scope"]["status"];
    lanes: Array<"engineer" | "analyst" | "architect"> | null;
    withheldLanes: Array<"engineer" | "analyst" | "architect">;
    engineersRunning: number;
    awaitingVerification: number;
    founderInbox: Array<{ id: string; prNumber: number; prUrl: string | null; packetIds: string[] }>;
    intervention: string[];
    knownDefects: string[];
  };
  packets: WorkExplanation[];
  executions: ExecutionExplanation[];
  initiatives: WorkExplanation[];
}

export function explainFactory(
  ledger: FactoryLedger,
  now = "",
  jobs?: readonly ObservedVerification[],
): FactoryExplanation {
  const owner = engineerSlotOwner(ledger, now);
  const packets = Object.values(ledger.packets)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((packet) => explainPacket(ledger, packet, now, owner, jobs));
  const executions = Object.values(ledger.executions ?? {})
    .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt) || a.id.localeCompare(b.id))
    .map((execution) => explainExecution(ledger, execution));
  const initiatives = Object.values(ledger.initiatives)
    .sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id))
    .map((initiative) => explainInitiative(ledger, initiative));
  const lanes = ledger.scope.lanes ?? null;
  const founderInbox = Object.values(ledger.releases ?? {})
    .filter((release) => release.prNumber != null && !release.mergeSha)
    .sort((a, b) => (a.prNumber ?? 0) - (b.prNumber ?? 0))
    .map((release) => ({
      id: release.id,
      prNumber: release.prNumber as number,
      prUrl: release.prUrl,
      packetIds: [...release.packetIds],
    }));
  const engineersRunning = Object.values(ledger.executions ?? {}).filter(
    (execution) =>
      execution.role === "engineer" &&
      execution.phase === "running" &&
      leaseWindow(execution.leaseUntil, now) === "valid",
  ).length;
  const awaitingVerification = packets.filter((packet) => packet.where === "candidate").length;
  const intervention = packets.filter((packet) => packet.situation === "intervention").map((packet) => packet.id);
  const knownDefects = packets.filter((packet) => packet.happening.startsWith("Known defect")).map((packet) => packet.id);
  const summary = {
    headline: "",
    scopeStatus: ledger.scope.status,
    lanes,
    withheldLanes: withheld(lanes),
    engineersRunning,
    awaitingVerification,
    founderInbox,
    intervention,
    knownDefects,
  };
  summary.headline = headline(summary);
  return { summary, packets, executions, initiatives };
}

function headline(summary: FactoryExplanation["summary"]): string {
  const scope = summary.scopeStatus === "active" ? "Factory operating" : `Factory ${summary.scopeStatus}`;
  const parts = [
    scope,
    countPhrase(summary.engineersRunning, "Engineer active", "Engineers active"),
    countPhrase(summary.awaitingVerification, "packet awaiting verification", "packets awaiting verification"),
    countPhrase(summary.founderInbox.length, "release awaiting your review", "releases awaiting your review"),
  ];
  if (summary.knownDefects.length) {
    parts.push(countPhrase(summary.knownDefects.length, "known defect", "known defects"));
  }
  return parts.join(" · ");
}

function countPhrase(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function withheld(
  lanes: Array<"engineer" | "analyst" | "architect"> | null,
): Array<"engineer" | "analyst" | "architect"> {
  if (!lanes) return [];
  return (["architect", "analyst", "engineer"] as const).filter((lane) => !lanes.includes(lane));
}

function explainPacket(
  ledger: FactoryLedger,
  packet: WorkItem,
  now: string,
  owner: string | null,
  jobs: readonly ObservedVerification[] | undefined,
): WorkExplanation {
  if (packet.stage === "accepted") {
    return row(packet, {
      happening: "Accepted.",
      why: "Nothing further is required.",
      next: "Nothing.",
      who: "unknown",
      situation: "complete",
    });
  }
  if (ledger.scope.status !== "active") {
    return row(packet, {
      happening: `Stage is ${packet.stage}.`,
      why: `Scope is ${ledger.scope.status}.`,
      next: "Unknown",
      who: "founder",
      situation: "held",
    });
  }
  if (packet.hold) {
    return row(packet, {
      happening: `Stage is ${packet.stage}. A hold is recorded.`,
      why: "A hold blocks the next wake.",
      next: "Clear the hold.",
      who: "founder",
      situation: "held",
    });
  }
  if (packet.blockerId || packet.stage === "blocked") {
    return row(packet, {
      happening: `Stage is ${packet.stage}.`,
      why: packet.blockerId ? `Blocked by ${packet.blockerId}.` : "Blocked.",
      next: "Clear the blocker.",
      who: "founder",
      situation: "held",
    });
  }
  if (packet.stage === "returned_architect" && packet.specificationBlock?.failureClass === "specification") {
    const architectLane = !ledger.scope.lanes || ledger.scope.lanes.includes("architect");
    return row(packet, {
      happening: `Returned to the Architect. ${packet.revision} is unsigned.`,
      why: packet.specificationBlock.escalationNote
        ? `Requirements blocked. ${packet.specificationBlock.escalationNote}`
        : "Requirements blocked.",
      next: architectLane ? "The next architect session can revise this packet." : "Include the architect lane.",
      who: architectLane ? "architect" : "founder",
      situation: architectLane ? "proceeding" : "held",
    });
  }
  if (!(packet.stage === "returned_analyst" && packet.specificationBlock?.failureClass === "systems_contract")) {
    if (packet.stage === "returned_analyst" || packet.stage === "returned_architect") {
      return row(packet, {
        happening: `Stage is ${packet.stage}.`,
        why: `Reopen from ${packet.stage} is not an event.`,
        next: "Unknown",
        who: packet.stage === "returned_analyst" ? "analyst" : "architect",
        situation: "intervention",
      });
    }
  }
  if (packet.stage === "returned_analyst" && packet.specificationBlock?.failureClass === "systems_contract") {
    if (packet.dispatch?.effect === "wake_sa") {
      return row(packet, {
        happening: `Returned to the Analyst at ${packet.revision}. The dispatch is open.`,
        why: packet.specificationBlock.note,
        next: "Sign the change.",
        who: "analyst",
        situation: "proceeding",
      });
    }
    const falseRan = [...(packet.dispatchHistory ?? [])].reverse().find(
      (row) => row.effect === "wake_sa" && row.revision === packet.revision && row.workerExecution === "ran" && row.executionId,
    );
    const unstarted = falseRan?.executionId ? ledger.executions?.[falseRan.executionId] : undefined;
    if (unstarted?.phase === "dispatched" && !unstarted.endedAt) {
      return row(packet, {
        happening: `Returned to the Analyst at ${packet.revision}. The dispatch was recorded as ran before the worker started.`,
        why: "The systems-change file from the blocked revision is not this wake.",
        next: "The next Factory dispatch pass restores the unstarted Analyst dispatch.",
        who: "controller",
        situation: "held",
      });
    }
  }

  const execution = liveExecutionFor(ledger, packet.id);
  const stageStillOpen = packet.stage === "engineering" || packet.stage === "analysis" || packet.stage === "change_specified";
  const leaseUntil = packet.lease?.until ?? (stageStillOpen ? execution?.leaseUntil ?? null : null);
  const window = leaseWindow(leaseUntil, now);
  if (stageStillOpen && execution?.phase === "running" && window === "elapsed" && leaseUntil) {
    return row(packet, {
      happening: `Execution phase is running. The lease elapsed at ${leaseUntil}.`,
      why: "Recovery has not run. Factory dispatch has no schedule.",
      next: "The next Factory dispatch pass recovers this execution.",
      who: "controller",
      situation: "held",
      clocks: clocks(execution, leaseUntil, packet),
    });
  }
  if (stageStillOpen && window === "unknown" && execution?.phase === "running" && leaseUntil) {
    return row(packet, {
      happening: `Execution phase is running. Lease until ${leaseUntil}. Whether that lease is still valid is Unknown.`,
      why: "The caller did not pass a clock.",
      next: "Unknown",
      who: execution.role,
      situation: "unknown",
      clocks: clocks(execution, leaseUntil, packet),
    });
  }
  if (stageStillOpen && window === "valid" && leaseUntil && (packet.lease || execution?.phase === "running")) {
    const role = packet.lease?.role ?? execution?.role ?? "engineer";
    const worker = packet.lease?.workerId ?? execution?.agentId ?? "Unknown";
    const named = execution ? ` on ${execution.id}` : "";
    return row(packet, {
      happening: `${title(role)} ${worker} is running${named}. Lease valid until ${leaseUntil}.`,
      why: "The factory has recorded an active execution. Progress since the last running signal is Unknown.",
      next: role === "analyst" ? "Sign the change." : role === "engineer" ? "Record a candidate SHA." : "Continue the session.",
      who: role,
      situation: "proceeding",
      clocks: clocks(execution, leaseUntil, packet),
    });
  }

  if (packet.stage === "candidate" || packet.stage === "verifying") {
    return explainVerification(packet, jobs, execution);
  }
  if (
    packet.stage === "verified" ||
    packet.stage === "integration_authorized" ||
    packet.stage === "integrated" ||
    packet.stage === "reconciled"
  ) {
    return explainVerified(ledger, packet);
  }
  if (
    packet.stage === "released" &&
    packet.wake === "sa" &&
    packet.dispatchedSaRevision === packet.revision &&
    !packet.dispatch
  ) {
    const ran = (packet.dispatchHistory ?? []).some(
      (record) => record.effect === "wake_sa" && record.revision === packet.revision && record.workerExecution === "ran",
    );
    const issued = (packet.dispatchHistory ?? []).find((record) => record.effect === "wake_sa" && record.issuedAt)?.issuedAt;
    return row(packet, {
      happening: ran
        ? `Known defect. Released. The Analyst dispatch for ${packet.revision} is recorded as ran.`
        : `Released. ${packet.revision} was already dispatched to the Analyst.`,
      why: ran
        ? "No sign_change is recorded, and this revision is not dispatched again. This is a known defect."
        : "No sign_change is recorded, and this revision is not dispatched again.",
      next: "Unknown",
      who: "unknown",
      situation: "intervention",
      clocks: issued ? [{ name: "dispatch_attempted", at: issued }] : [],
    });
  }
  if (packet.stage === "draft" && packet.wake === "hold") {
    return row(packet, {
      happening: "Draft. Wake is hold.",
      why: "A hold wake is not dispatched.",
      next: "Unknown",
      who: "founder",
      situation: "held",
    });
  }

  const busy = owner != null && owner !== packet.id;
  const decision = decide(packet, worldFor(ledger, now, busy));
  if (decision.effect !== "none" && !laneAllows(ledger.scope.lanes ?? null, decision.effect)) {
    const lane = decision.effect === "wake_sa" ? "analyst" : "engineer";
    return row(packet, {
      happening: `Stage is ${packet.stage}.`,
      why: `The ${lane} lane is off.`,
      next: `Include the ${lane} lane.`,
      who: "founder",
      situation: "held",
    });
  }
  if (decision.reason === "concurrency") {
    return row(packet, {
      happening: `Stage is ${packet.stage}.`,
      why: owner ? `The engineer slot is occupied by ${owner}.` : "The engineer slot is occupied.",
      next: "That execution records its result.",
      who: "engineer",
      situation: "held",
    });
  }
  if (decision.reason === "dispatch_authorization_exhausted" || decision.reason === "dispatch_not_authorized") {
    const cap = ledger.authorizedDispatches;
    const detail = cap == null ? "Dispatch is not authorized." : `Dispatch authorization is exhausted (${ledger.usedDispatches}/${cap}).`;
    return row(packet, {
      happening: `Stage is ${packet.stage}.`,
      why: decision.reason === "dispatch_not_authorized" ? "Dispatch is not authorized." : detail,
      next: "Unknown",
      who: "founder",
      situation: "held",
    });
  }
  if (decision.effect === "wake_engineer") {
    return row(packet, {
      happening: "The change is specified.",
      why: "This revision has not been dispatched to the Engineer.",
      next: "The next pass wakes the Engineer.",
      who: "engineer",
      situation: "proceeding",
    });
  }
  if (decision.effect === "wake_repair") {
    return row(packet, {
      happening: `Engineering. The last failure is ${packet.lastFailureClass ?? "unclassified"}.`,
      why: "This failure fingerprint has not been dispatched.",
      next: "The next pass wakes a repair.",
      who: "engineer",
      situation: "proceeding",
    });
  }
  if (decision.effect === "wake_sa" && decision.reason === "specification_returned") {
    const blocked = packet.specificationBlock?.blockedRevision ?? "the prior revision";
    return row(packet, {
      happening: `Returned to the Analyst at ${packet.revision}. ${blocked} stays in history.`,
      why: packet.specificationBlock?.note ?? "The engineer recorded a systems-contract block.",
      next: "The next pass wakes the Analyst.",
      who: "analyst",
      situation: "proceeding",
    });
  }
  if (decision.effect === "wake_sa") {
    return row(packet, {
      happening: "Released. This revision has not been dispatched to the Analyst.",
      why: "The controller wakes an Analyst when the dispatched revision differs.",
      next: "The next pass wakes the Analyst.",
      who: "analyst",
      situation: "proceeding",
    });
  }
  if (decision.reason === "no_transition" && packet.stage === "engineering") {
    const expired = Object.values(ledger.executions ?? {}).find(
      (execution) =>
        execution.role === "engineer" &&
        execution.packetIds.includes(packet.id) &&
        isTerminal(execution.phase) &&
        (execution.reason === "lease_expired" || execution.reason === "reservation_expired"),
    );
    if (!packet.candidateSha && !packet.specificationBlock && !packet.dispatch && packet.attempts === 0 && !packet.lastFailureFingerprint && !packet.lease && expired) {
      if (recordedSpecificationReturn(packet, expired, now)) {
        return row(packet, {
          happening: `Engineering. The lease on ${expired.id} expired before a candidate.`,
          why: "The recorded contradiction matches this execution and worker. Recovery adopts it before any re-arm.",
          next: "The next Factory dispatch pass returns this packet to the Analyst.",
          who: "controller",
          situation: "held",
          clocks: clocks(expired, expired.leaseUntil, packet),
        });
      }
      return row(packet, {
        happening: `Engineering. The lease on ${expired.id} expired before a candidate.`,
        why: "An expired engineering execution cannot leave the packet here.",
        next: "The next Factory dispatch pass returns this packet to change_specified.",
        who: "controller",
        situation: "held",
        clocks: clocks(expired, expired.leaseUntil, packet),
      });
    }
    return row(packet, {
      happening: "Engineering. No live lease and no classified failure.",
      why: "An engineer wake requires change_specified. A repair wake requires a classified failure.",
      next: "Unknown",
      who: "unknown",
      situation: "intervention",
    });
  }
  if (decision.reason === "no_transition" && packet.stage === "analysis") {
    return row(packet, {
      happening: "Analysis has no live lease.",
      why: "The controller does not wake another Analyst for a packet already in analysis.",
      next: "Unknown",
      who: "unknown",
      situation: "intervention",
    });
  }
  return row(packet, {
    happening: `Stage is ${packet.stage}.`,
    why: decision.reason === "no_transition" ? "No transition is proposed." : decision.reason,
    next: "Unknown",
    who: "unknown",
    situation: "unknown",
  });
}

function explainVerification(
  packet: WorkItem,
  jobs: readonly ObservedVerification[] | undefined,
  execution: WorkerExecution | null,
): WorkExplanation {
  const sha = packet.candidateSha ?? "Unknown";
  if (packet.stage === "verifying") {
    return row(packet, {
      happening: `Verification of ${sha} is recorded as in progress.`,
      why: "The candidate SHA matches and the result is not recorded.",
      next: `Record the Actions run id for commit ${sha}.`,
      who: "github_actions",
      situation: "proceeding",
      clocks: clocks(execution, null, packet),
    });
  }
  const match = jobs?.find((job) => job.name === sha || (sha !== "Unknown" && job.name.includes(sha)));
  if (!jobs) {
    return row(packet, {
      happening: `Candidate ${sha} is recorded. Whether a verification job is already open is Unknown.`,
      why: "Verification starts from the candidate SHA.",
      next: `GitHub Actions must verify commit ${sha}.`,
      who: "github_actions",
      situation: "external",
      clocks: clocks(execution, null, packet),
    });
  }
  if (match && match.status !== "completed") {
    return row(packet, {
      happening: `Verification job ${match.runId} is ${match.status}.`,
      why: "Verification starts from the candidate SHA.",
      next: `GitHub Actions must verify commit ${sha}.`,
      who: "github_actions",
      situation: "proceeding",
      clocks: clocks(execution, null, packet),
    });
  }
  return row(packet, {
    happening: match
      ? `Verification job ${match.runId} finished ${match.conclusion ?? "without a conclusion"}. The run id is not on the packet.`
      : `Candidate ${sha} is recorded. No verification job is open for that commit.`,
    why: "Verification starts from the candidate SHA.",
    next: `GitHub Actions must verify commit ${sha}.`,
    who: "github_actions",
    situation: "external",
    clocks: clocks(execution, null, packet),
  });
}

function explainVerified(ledger: FactoryLedger, packet: WorkItem): WorkExplanation {
  if (packet.stage !== "verified") {
    return row(packet, {
      happening: `Stage is ${packet.stage}.`,
      why: "The merge path has not finished.",
      next: "The conclude path continues to accepted.",
      who: "controller",
      situation: "proceeding",
    });
  }
  const release = Object.values(ledger.releases ?? {}).find((item) => item.packetIds.includes(packet.id)) ?? null;
  if (release?.mergeSha) {
    return row(packet, {
      happening: `Verified at ${packet.verifiedSha}. Release ${release.id} has merge SHA ${release.mergeSha}.`,
      why: "The merge SHA is recorded and the packet is still verified.",
      next: "The conclude path continues to accepted.",
      who: "controller",
      situation: "proceeding",
      clocks: releaseClock(release),
    });
  }
  if (release?.prNumber != null) {
    return row(packet, {
      happening: `Verified at ${packet.verifiedSha}. Release ${release.id} is pull request ${release.prNumber}.`,
      why: "The dependency set is verified and the pull request is open.",
      next: `Merge release pull request ${release.prNumber}.`,
      who: "founder",
      situation: "external",
      clocks: releaseClock(release),
    });
  }
  const holding = dependencyHolders(ledger, packet.id);
  if (holding.length) {
    return row(packet, {
      happening: `Verified at ${packet.verifiedSha}.`,
      why: `Waiting on ${holding.join(", ")}.`,
      next: `${joinIds(holding)} ${holding.length === 1 ? "reaches" : "reach"} verified.`,
      who: "unknown",
      situation: "held",
    });
  }
  const ready = readyReleaseIds(ledger);
  if (ready.has(packet.id)) {
    return row(packet, {
      happening: `Verified at ${packet.verifiedSha}.`,
      why: "Every open packet in the dependency set is verified.",
      next: "The next Factory dispatch pass opens a release pull request.",
      who: "controller",
      situation: "proceeding",
    });
  }
  return row(packet, {
    happening: `Verified at ${packet.verifiedSha ?? "Unknown"}.`,
    why: "No release is recorded and no dependency holder is recorded.",
    next: "Unknown",
    who: "unknown",
    situation: "unknown",
  });
}

function explainExecution(ledger: FactoryLedger, execution: WorkerExecution): ExecutionExplanation {
  const resolved = laterResolved(ledger, execution);
  const openStart = (execution.phase === "dispatched" || execution.phase === "started") && !execution.runningAt;
  const alert = openStart && !resolved;
  const historical = isTerminal(execution.phase) && !execution.startedAt && !execution.runningAt && execution.phase !== "completed" && resolved;
  const why = alert
    ? "Dispatch is recorded and the worker start is not established."
    : historical
      ? "The start was never confirmed. A later outcome is already recorded."
      : (execution.reason ?? "Recorded.");
  const clocks: NamedClock[] = [{ name: "dispatch_attempted", at: execution.issuedAt }];
  if (execution.runningAt) clocks.push({ name: "running_since", at: execution.runningAt });
  if (execution.leaseUntil) clocks.push({ name: "lease_until", at: execution.leaseUntil });
  return {
    id: execution.id,
    packetIds: [...execution.packetIds],
    phase: execution.phase,
    alert,
    historical,
    why,
    clocks,
  };
}

function explainInitiative(ledger: FactoryLedger, initiative: InitiativeRecord): WorkExplanation {
  const depth = engineerQueueDepth(Object.values(ledger.packets));
  const lanes = ledger.scope.lanes ?? null;
  const architectAllowed = !lanes || lanes.includes("architect");
  if (ledger.scope.status !== "active") {
    return {
      id: initiative.id,
      where: initiative.session,
      happening: `Architect session is ${initiative.session}.`,
      why: `Scope is ${ledger.scope.status}.`,
      next: "Unknown",
      who: "founder",
      clocks: [],
      situation: "held",
    };
  }
  if (initiative.queue === "active" && initiative.session === "continuation_due" && !initiative.dispatch) {
    if (depth >= ENGINEER_BACKLOG_FOR_EXPLANATION) {
      return {
        id: initiative.id,
        where: initiative.session,
        happening: "Architect session is continuation_due.",
        why: `Engineer queue depth is ${depth}. This is backpressure.`,
        next: "The engineer queue drops below 2.",
        who: "controller",
        clocks: [],
        situation: "held",
      };
    }
    if (!architectAllowed) {
      return {
        id: initiative.id,
        where: initiative.session,
        happening: "Architect session is continuation_due.",
        why: `The architect lane is off. Engineer queue depth is ${depth}, so this is not backpressure.`,
        next: "Include the architect lane.",
        who: "founder",
        clocks: [],
        situation: "held",
      };
    }
    return {
      id: initiative.id,
      where: initiative.session,
      happening: "Architect session is continuation_due.",
      why: "The architect session is due.",
      next: "The next pass resumes the architect.",
      who: "architect",
      clocks: [],
      situation: "proceeding",
    };
  }
  if (initiative.session === "running") {
    return {
      id: initiative.id,
      where: initiative.session,
      happening: "Architect session is running.",
      why: "A running session is recorded.",
      next: "The session continues.",
      who: "architect",
      clocks: [],
      situation: "proceeding",
    };
  }
  return {
    id: initiative.id,
    where: initiative.session,
    happening: `Architect session is ${initiative.session}.`,
    why: "No architect wake is due.",
    next: "Unknown",
    who: "unknown",
    clocks: [],
    situation: "unknown",
  };
}

const ENGINEER_BACKLOG_FOR_EXPLANATION = 2;

function laterResolved(ledger: FactoryLedger, execution: WorkerExecution): boolean {
  const later = Object.values(ledger.executions ?? {}).some(
    (other) =>
      other.id !== execution.id &&
      other.issuedAt > execution.issuedAt &&
      other.packetIds.some((id) => execution.packetIds.includes(id)) &&
      (other.phase === "completed" || other.reason === "candidate_recorded"),
  );
  if (later) return true;
  return execution.packetIds.some((id) => {
    const packet = ledger.packets[id];
    if (!packet?.candidateSha) return false;
    return (
      packet.stage === "candidate" ||
      packet.stage === "verifying" ||
      packet.stage === "verified" ||
      SATISFIED.has(packet.stage)
    );
  });
}

function dependencyHolders(ledger: FactoryLedger, packetId: string): string[] {
  const component = dependencyComponents(Object.values(ledger.packets)).find((ids) => ids.includes(packetId)) ?? [packetId];
  return component.filter((id) => {
    if (id === packetId) return false;
    const packet = ledger.packets[id];
    if (!packet || SATISFIED.has(packet.stage)) return false;
    return !(packet.stage === "verified" && packet.verifiedSha);
  });
}

function readyReleaseIds(ledger: FactoryLedger): Set<string> {
  const opened = Object.keys(ledger.releases ?? {});
  const ids = new Set<string>();
  for (const release of readyReleases(Object.values(ledger.packets), opened)) {
    for (const id of release.packetIds) ids.add(id);
  }
  return ids;
}

function engineerSlotOwner(ledger: FactoryLedger, now: string): string | null {
  const ids = Object.values(ledger.packets)
    .map((packet) => packet.id)
    .sort();
  for (const id of ids) {
    const packet = ledger.packets[id];
    if (packet.stage === "engineering" && packet.lease && leaseWindow(packet.lease.until, now) === "valid") return id;
    const execution = liveExecutionFor(ledger, id);
    if (
      execution &&
      execution.role === "engineer" &&
      (packet.stage === "change_specified" || packet.stage === "engineering") &&
      executionOccupies(execution, now || "9999-12-31T00:00:00.000Z")
    ) {
      if (now) return id;
    }
    if (packet.stage === "change_specified" && packet.dispatchedEngineerRevision === packet.revision) {
      if (pending(packet.dispatch?.issuedAt, now)) return id;
    }
    if (
      packet.stage === "engineering" &&
      packet.lastFailureFingerprint != null &&
      packet.dispatchedRepairFingerprint === packet.lastFailureFingerprint &&
      (leaseWindow(packet.lease?.until ?? null, now) === "valid" || pending(packet.dispatch?.issuedAt, now))
    ) {
      return id;
    }
  }
  return null;
}

function pending(issuedAt: string | undefined, now: string): boolean {
  if (!now) return false;
  if (!issuedAt) return true;
  return plusMs(issuedAt, PENDING_RESERVE_MS) > now;
}

function worldFor(ledger: FactoryLedger, now: string, engineeringBusy: boolean): World {
  return {
    activation: "active",
    now: now || "1970-01-01T00:00:00.000Z",
    engineeringBusy,
    budgetUsd: null,
    authorizedDispatches: ledger.authorizedDispatches,
    usedDispatches: ledger.usedDispatches,
    scopeStatus: ledger.scope.status,
  };
}

function laneAllows(lanes: Array<"engineer" | "analyst" | "architect"> | null, effect: WakeEffect): boolean {
  if (!lanes || effect === "none") return true;
  if (effect === "wake_engineer" || effect === "wake_repair") return lanes.includes("engineer");
  if (effect === "wake_sa") return lanes.includes("analyst");
  if (effect === "wake_architect") return lanes.includes("architect");
  return false;
}

function leaseWindow(until: string | null, now: string): "valid" | "elapsed" | "unknown" {
  if (!until || !now) return "unknown";
  return until > now ? "valid" : "elapsed";
}

function clocks(execution: WorkerExecution | null, leaseUntil: string | null, packet: WorkItem): NamedClock[] {
  const found: NamedClock[] = [];
  const issued = packet.dispatch?.issuedAt;
  if (issued) found.push({ name: "dispatch_attempted", at: issued });
  if (execution?.runningAt) found.push({ name: "running_since", at: execution.runningAt });
  if (leaseUntil) found.push({ name: "lease_until", at: leaseUntil });
  return found;
}

function releaseClock(release: ReleaseRecord): NamedClock[] {
  return release.openedAt ? [{ name: "release_opened", at: release.openedAt }] : [];
}

function joinIds(ids: string[]): string {
  if (ids.length === 1) return ids[0];
  if (ids.length === 2) return `${ids[0]} and ${ids[1]}`;
  return `${ids.slice(0, -1).join(", ")}, and ${ids[ids.length - 1]}`;
}

function title(role: "architect" | "analyst" | "engineer"): string {
  if (role === "analyst") return "Analyst";
  if (role === "engineer") return "Engineer";
  return "Architect";
}

function row(
  packet: WorkItem,
  fields: {
    happening: string;
    why: string;
    next: string;
    who: Actor;
    situation: Situation;
    clocks?: NamedClock[];
  },
): WorkExplanation {
  return {
    id: packet.id,
    where: packet.stage,
    happening: fields.happening,
    why: fields.why,
    next: fields.next,
    who: fields.who,
    clocks: fields.clocks ?? [],
    situation: fields.situation,
  };
}
