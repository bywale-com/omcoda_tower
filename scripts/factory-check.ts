/**
 * Deterministic factory check. No database, no Cursor, no GitHub writes.
 * Run: npm run factory:check
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TRANSITION_IDS,
  acknowledgeDispatch,
  applyEvent,
  decide,
  deriveInitiative,
  freshItem,
  workerMayRun,
  type WorkItem,
  type World,
} from "../.factory/controller/machine.ts";
import {
  ContentsBlobRemote,
  GitHubContentsStore,
  githubContentsRemote,
  type ContentsRemote,
} from "../.factory/controller/contents.ts";
import {
  FileStore,
  MemoryStore,
  commitEvent,
  dispatchWake,
  emptyLedger,
  githubLabelActuator,
  labelEditArgs,
  labelRemoveArgs,
  labelViewArgs,
  scriptedActuator,
  type FactoryLedger,
  type GhRun,
} from "../.factory/controller/dispatch.ts";
import {
  clickMatchesEnrollment,
  enrollmentForClick,
  type PursuitEnrollment,
  type PursuitMessage,
} from "../.factory/experiments/click-attribution.ts";
import {
  PLATE_BUCKETS,
  markReleased,
  readPlateArtifacts,
  type PlateEvidence,
  type ReleaseManifest,
} from "../.factory/controller/release.ts";
import { cursorFollowUp, followUpRequest } from "../.factory/controller/cursor.ts";
import {
  analystAssignment,
  engineerAssignment,
  planContinuation,
  planPacketContinuation,
  prepareBoundEngineer,
  productionMetrics,
  productionPressure,
  recoverExecutions,
} from "../.factory/controller/execution.ts";
import { readyReleases } from "../.factory/controller/conclusion.ts";
import { headMatchesDispatch, selectLabeledDispatch } from "../.factory/controller/wake.ts";
import {
  applyLedgerEvent,
  commitLedgerEvent,
  controlStep,
  decideScope,
  dispatchInitiative,
  freshInitiative,
  moduleComplete,
  projectFactory,
  type LedgerEvent,
} from "../.factory/controller/queue.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path: string) => readFileSync(join(root, path), "utf8");

let passed = 0;
const queue: Array<{ name: string; fn: () => void | Promise<void> }> = [];
function check(name: string, fn: () => void | Promise<void>) {
  queue.push({ name, fn });
}

const inactive: World = {
  activation: "inactive",
  now: "2026-10-29T12:00:00Z",
  engineeringBusy: false,
  budgetUsd: null,
  authorizedDispatches: null,
  usedDispatches: 0,
};
const active: World = {
  ...inactive,
  activation: "active",
  authorizedDispatches: 10,
};

function must<T extends { ok: boolean; reason: string; item: WorkItem }>(
  result: T,
  reason: string,
): WorkItem {
  assert.equal(result.ok, true, result.reason);
  assert.equal(result.reason, reason);
  return result.item;
}

check("T01 eligible packet on hold does not leave draft", () => {
  const result = applyEvent(
    freshItem(),
    { type: "release", wake: "hold", gatesPass: true, revision: "rev-1" },
    inactive,
  );
  const item = must(result, "eligible_held");
  assert.equal(item.stage, "draft");
  assert.equal(item.releaseEligible, true);
  assert.equal(item.wake, "hold");
  assert.equal(decide(item, active).effect, "none");
});

check("T26 failed gates do not release", () => {
  const result = applyEvent(
    freshItem(),
    { type: "release", wake: "sa", gatesPass: false, revision: "rev-1" },
    active,
  );
  assert.equal(result.ok, false);
  assert.equal(result.reason, "gates_failed");
  assert.equal(result.item.stage, "draft");
});

check("T02 release is recorded while the controller is inactive", () => {
  const item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, inactive),
    "released",
  );
  assert.equal(item.stage, "released");
  assert.equal(decide(item, inactive).reason, "inactive");
  assert.equal(decide(item, inactive).label, null);
});

check("T03 active controller proposes factory-wake-sa once per revision", () => {
  let item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  const first = decide(item, active);
  assert.equal(first.effect, "wake_sa");
  assert.equal(first.label, "factory-wake-sa");
  const again = decide(item, active);
  assert.equal(again.effect, "wake_sa");
  item = acknowledgeDispatch(item, "wake_sa");
  assert.equal(decide(item, active).effect, "none");
});

check("T20 prose completion is not evidence", () => {
  const item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  const prose = applyEvent(item, { type: "prose_complete" }, active);
  assert.equal(prose.ok, false);
  assert.equal(prose.reason, "prose_is_not_evidence");
  assert.equal(prose.item.stage, "released");
});

check("T18 hold and blocker suppress wakes, and clearing a blocker does not dispatch", () => {
  let item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  item = must(applyEvent(item, { type: "hold" }, active), "hold");
  assert.equal(decide(item, active).reason, "hold");
  item = must(applyEvent(item, { type: "clear_hold" }, active), "hold_cleared");
  item = must(
    applyEvent(item, { type: "blocker", blockerId: "BLOCKER-001", failureClass: "external" }, active),
    "blocked",
  );
  assert.equal(item.stage, "released");
  assert.equal(decide(item, active).reason, "blocked");
  item = must(applyEvent(item, { type: "clear_blocker" }, active), "blocker_cleared_no_dispatch");
  assert.equal(decide(item, active).effect, "wake_sa");
});

check("T21 a live lease refuses a second worker", () => {
  let item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  item = must(
    applyEvent(
      item,
      { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  assert.equal(item.stage, "analysis");
  const clash = applyEvent(
    item,
    { type: "acquire_lease", workerId: "bc-b", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
    active,
  );
  assert.equal(clash.reason, "lease_held");
  assert.equal(decide(item, active).reason, "lease_held");
});

check("T05 and T06 systems-change signature requires the lease, the revision, and every section", () => {
  let item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  item = must(
    applyEvent(
      item,
      { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  const short = applyEvent(
    item,
    { type: "sign_change", revision: "rev-1", sections: ["intent"], workerId: "bc-a" },
    active,
  );
  assert.equal(short.reason, "sections_incomplete");
  const stale = applyEvent(
    item,
    {
      type: "sign_change",
      revision: "rev-old",
      sections: [
        "intent",
        "must",
        "stores",
        "runtime",
        "ports",
        "verify",
        "out_of_scope",
        "impact_manifest",
        "dependency_reconciliation",
      ],
      workerId: "bc-a",
    },
    active,
  );
  assert.equal(stale.reason, "revision_mismatch");
  item = must(
    applyEvent(
      item,
      {
        type: "sign_change",
        revision: "rev-1",
        sections: [
          "intent",
          "must",
          "stores",
          "runtime",
          "ports",
          "verify",
          "out_of_scope",
          "impact_manifest",
          "dependency_reconciliation",
        ],
        workerId: "bc-a",
      },
      active,
    ),
    "change_specified",
  );
  assert.equal(item.lease, null);
  assert.equal(decide(item, active).label, "factory-wake-engineer");
});

check("T25 and T27 budget and concurrency suppress engineering dispatch", () => {
  let item = freshItem();
  item = must(applyEvent(item, { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active), "released");
  item = must(
    applyEvent(
      item,
      { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  item = must(
    applyEvent(
      item,
      {
        type: "sign_change",
        revision: "rev-1",
        sections: [
          "intent",
          "must",
          "stores",
          "runtime",
          "ports",
          "verify",
          "out_of_scope",
          "impact_manifest",
          "dependency_reconciliation",
        ],
        workerId: "bc-a",
      },
      active,
    ),
    "change_specified",
  );
  assert.equal(decide(item, { ...active, engineeringBusy: true }).reason, "concurrency");
  assert.equal(decide(item, { ...active, authorizedDispatches: null }).reason, "dispatch_not_authorized");
  assert.equal(decide(item, { ...active, authorizedDispatches: 0, budgetUsd: 1_000_000 }).reason, "dispatch_not_authorized");
  assert.equal(
    decide(item, { ...active, authorizedDispatches: 1, usedDispatches: 1 }).reason,
    "dispatch_authorization_exhausted",
  );
  assert.equal(decide(item, { ...active, budgetUsd: 0 }).effect, "wake_engineer");
});

check("T10 and T11 verification evidence is bound to the candidate SHA", () => {
  let item = releasedThroughCandidate("sha-1");
  const wrongStart = applyEvent(item, { type: "start_verification", sha: "sha-other" }, active);
  assert.equal(wrongStart.reason, "sha_mismatch");
  item = must(applyEvent(item, { type: "start_verification", sha: "sha-1" }, active), "verifying");
  const wrongPass = applyEvent(
    item,
    { type: "verification_result", sha: "sha-other", outcome: "pass" },
    active,
  );
  assert.equal(wrongPass.reason, "sha_mismatch");
  assert.equal(wrongPass.item.stage, "verifying");
  item = must(
    applyEvent(item, { type: "verification_result", sha: "sha-1", outcome: "pass" }, active),
    "verified",
  );
  assert.equal(item.verifiedSha, "sha-1");
  const premature = applyEvent(item, { type: "accept", sha: "sha-1" }, active);
  assert.equal(premature.ok, false);
  assert.equal(premature.reason, "wrong_stage");
  assert.equal(premature.item.stage, "verified");
  item = must(applyEvent(item, { type: "authorize_integration", sha: "sha-1" }, active), "integration_authorized");
  const missingMerge = applyEvent(item, { type: "integrate", candidateSha: "sha-1", mergeSha: "" }, active);
  assert.equal(missingMerge.reason, "integration_evidence_missing");
  item = must(
    applyEvent(item, { type: "integrate", candidateSha: "sha-1", mergeSha: "merge-1" }, active),
    "integrated",
  );
  item = must(
    applyEvent(item, { type: "reconcile", sha: "sha-1", reconciliationId: "rec-1" }, active),
    "reconciled",
  );
  const wrongAccept = applyEvent(item, { type: "accept", sha: "sha-other" }, active);
  assert.equal(wrongAccept.reason, "sha_mismatch");
  item = must(applyEvent(item, { type: "accept", sha: "sha-1" }, active), "accepted");
});

check("T12 through T17 failure class chooses the return path", () => {
  const spec = applyEvent(verifyingItem(), {
    type: "verification_result",
    sha: "sha-1",
    outcome: "fail",
    failureClass: "specification",
    fingerprint: "spec-1",
  }, active);
  assert.equal(must(spec, "returned_architect").stage, "returned_architect");
  assert.equal(decide(spec.item, active).effect, "none");

  const contract = applyEvent(verifyingItem(), {
    type: "verification_result",
    sha: "sha-1",
    outcome: "fail",
    failureClass: "systems_contract",
    fingerprint: "contract-1",
  }, active);
  assert.equal(contract.item.stage, "returned_analyst");

  const external = applyEvent(verifyingItem(), {
    type: "verification_result",
    sha: "sha-1",
    outcome: "fail",
    failureClass: "external",
    fingerprint: "spend-limit",
  }, active);
  assert.equal(external.item.stage, "blocked");
  assert.equal(decide(external.item, active).effect, "none");
  const cleared = must(applyEvent(external.item, { type: "clear_blocker" }, active), "blocker_cleared_no_dispatch");
  assert.equal(cleared.stage, "blocked");
  assert.equal(decide(cleared, active).effect, "none");

  const infra = applyEvent(verifyingItem(), {
    type: "verification_result",
    sha: "sha-1",
    outcome: "fail",
    failureClass: "infrastructure",
    fingerprint: "missing-secret",
  }, active);
  assert.equal(infra.reason, "blocked");

  let repair = must(
    applyEvent(verifyingItem(), {
      type: "verification_result",
      sha: "sha-1",
      outcome: "fail",
      failureClass: "implementation",
      fingerprint: "click-a",
    }, active),
    "repair_ready",
  );
  assert.equal(decide(repair, active).label, "factory-repair");
  repair = acknowledgeDispatch(repair, "wake_repair");
  assert.equal(decide(repair, active).effect, "none");

  repair = must(
    applyEvent(
      { ...repair, stage: "verifying" },
      {
        type: "verification_result",
        sha: "sha-1",
        outcome: "fail",
        failureClass: "implementation",
        fingerprint: "click-a",
      },
      active,
    ),
    "duplicate_failure",
  );
  assert.equal(decide(repair, active).effect, "none");
});

check("T28 a second distinct implementation failure escalates instead of looping", () => {
  let item = must(
    applyEvent(verifyingItem(), {
      type: "verification_result",
      sha: "sha-1",
      outcome: "fail",
      failureClass: "implementation",
      fingerprint: "click-a",
    }, active),
    "repair_ready",
  );
  item = { ...item, stage: "verifying" };
  const second = applyEvent(item, {
    type: "verification_result",
    sha: "sha-1",
    outcome: "fail",
    failureClass: "implementation",
    fingerprint: "click-b",
    justification: "new stack",
  }, active);
  assert.equal(second.reason, "attempts_exhausted");
  assert.equal(decide(second.item, active).effect, "none");
});

check("T30 initiative summary is derived from packet stages", () => {
  assert.equal(deriveInitiative({ investigation: "discovered", packets: [] }), "discovered");
  assert.equal(deriveInitiative({ investigation: "scoped", packets: [] }), "scoped");
  assert.equal(
    deriveInitiative({ investigation: "investigating", packets: [{ stage: "draft", required: true }] }),
    "investigating",
  );
  assert.equal(
    deriveInitiative({ investigation: "investigating", packets: [{ stage: "released", required: true }] }),
    "packets_ready",
  );
  assert.equal(
    deriveInitiative({
      investigation: "investigating",
      packets: [
        { stage: "accepted", required: true },
        { stage: "draft", required: true },
      ],
    }),
    "packets_ready",
  );
  assert.equal(
    deriveInitiative({
      investigation: "investigating",
      packets: [{ stage: "engineering", required: true }],
    }),
    "in_production",
  );
  assert.equal(
    deriveInitiative({ investigation: "investigating", packets: [{ stage: "verifying", required: true }] }),
    "verifying",
  );
  assert.equal(
    deriveInitiative({
      investigation: "investigating",
      packets: [{ stage: "integration_authorized", required: true }],
    }),
    "in_production",
  );
  assert.equal(
    deriveInitiative({ investigation: "specifying", packets: [{ stage: "accepted", required: true }] }),
    "reconciling",
  );
  assert.equal(
    deriveInitiative({ investigation: "closed", packets: [{ stage: "accepted", required: true }] }),
    "complete",
  );
});

check("click oracle attributes the stamped enrollment and refuses the newest-row shortcut", () => {
  const message: PursuitMessage = {
    enrollmentId: "A",
    campaignObjectiveId: "ObjA",
    createdAt: "2026-10-01T00:00:00Z",
  };
  const a: PursuitEnrollment = {
    id: "A",
    enrolledAt: "2026-09-01T00:00:00Z",
    campaignId: "camp-a",
    currentObjectiveId: "ObjA",
  };
  const b: PursuitEnrollment = {
    id: "B",
    enrolledAt: "2026-10-02T00:00:00Z",
    campaignId: "camp-a",
    currentObjectiveId: "ObjA",
  };
  assert.equal(enrollmentForClick(message), "A");
  assert.equal(clickMatchesEnrollment(message, a), true);
  assert.equal(clickMatchesEnrollment(message, b), false);
  const newest = [a, b].sort((left, right) => right.enrolledAt.localeCompare(left.enrolledAt))[0];
  assert.equal(newest.id, "B");
  assert.notEqual(enrollmentForClick(message), newest.id);

  const otherObjective: PursuitEnrollment = { ...b, id: "A", currentObjectiveId: "ObjB", campaignId: "camp-b" };
  assert.equal(clickMatchesEnrollment(message, { ...a, currentObjectiveId: "ObjB" }), false);
  assert.equal(clickMatchesEnrollment(message, otherObjective), false);

  const bare: PursuitMessage = { enrollmentId: null, campaignObjectiveId: null, createdAt: message.createdAt };
  assert.equal(enrollmentForClick(bare), null);
  assert.equal(clickMatchesEnrollment(bare, a), false);

  const unstampedObjective: PursuitMessage = {
    enrollmentId: "A",
    campaignObjectiveId: null,
    createdAt: "2026-10-01T00:00:00Z",
  };
  assert.equal(clickMatchesEnrollment(unstampedObjective, a), true);
  assert.equal(clickMatchesEnrollment(unstampedObjective, b), false);
  assert.equal(
    clickMatchesEnrollment(
      { ...unstampedObjective, createdAt: "2026-08-01T00:00:00Z" },
      a,
    ),
    false,
  );
  assert.equal(clickMatchesEnrollment(message, { ...a, campaignId: null }), false);
});

check("committed manifests stay inactive, held, and pointed at PR 135", () => {
  const factory = JSON.parse(read(".factory/manifests/factory.json"));
  assert.equal(factory.activation, "inactive");
  assert.equal(factory.dispatch, "forbidden");
  assert.equal(factory.labelActuator, "connected_disarmed");
  const packet = JSON.parse(read(".factory/manifests/packets/pkt-001-click-attribution.json"));
  assert.equal(packet.wake, "hold");
  assert.equal(packet.release, "draft");
  assert.equal(packet.releaseEligible, true);
  const initiative = JSON.parse(read(".factory/manifests/initiatives/exec-identity.json"));
  assert.equal(initiative.source.pr, 135);
  assert.equal(initiative.source.sha, "1f6f43ab2dbe8b0e32b0a344990795bb998c8be3");
  assert.equal(initiative.mutation, "read-only-reference");
  const claims = JSON.parse(read(".factory/manifests/pr135-claims.json"));
  assert.equal(claims.claims.length, 88);
  const numbers = claims.claims.map((claim: { n: number }) => claim.n);
  assert.deepEqual(numbers, Array.from({ length: 88 }, (_, index) => index + 1));
});

check("state-machine page lists every transition id", () => {
  const page = read("docs/factory/STATE-MACHINE.md");
  for (const id of TRANSITION_IDS) {
    assert.ok(page.includes(`| ${id} |`), `missing ${id}`);
  }
});

check("dispatch workflow prints a control pass and does not schedule labels", () => {
  const workflow = read(".github/workflows/factory-dispatch.yml");
  assert.ok(workflow.includes("pull_request:"));
  assert.equal(workflow.includes("schedule:"), false);
  assert.ok(workflow.includes("workflow_dispatch:"));
  assert.ok(workflow.includes("I_AUTHORIZE_FACTORY_DISPATCH"));
  assert.ok(workflow.includes("actuator disarmed"));
  assert.ok(workflow.includes("FACTORY_SPEND_LIMIT_CONFIRMED"));
  assert.ok(workflow.includes("FACTORY_AUTOMATIONS_SAVED"));
  assert.ok(workflow.includes("scripts/factory-control.ts"));
  assert.ok(workflow.includes("scripts/factory-authorize-scope.ts"));
  assert.ok(workflow.includes("scripts/factory-suspend.ts"));
  assert.equal(workflow.includes("gh pr edit"), false);
  const controlJob = workflow.slice(workflow.indexOf("  control:"), workflow.indexOf("  dispatch:"));
  assert.ok(controlJob.indexOf('echo "actuator disarmed"') < controlJob.indexOf("scripts/factory-control.ts --apply"));
  assert.equal(controlJob.includes("factory-authorize-scope.ts"), false);
  assert.equal(controlJob.includes("factory-suspend.ts"), false);
  assert.match(read("scripts/factory-authorize-scope.ts"), /dispatch_not_authorized/);
  assert.match(read("scripts/factory-suspend.ts"), /suspension_reason_missing/);
});

check("seat prompts keep the Travis gates that stopped empty boots", () => {
  const architect = read("docs/factory/prompts/architect.prompt.md");
  const analyst = read("docs/factory/prompts/systems-analyst.prompt.md");
  const engineer = read("docs/factory/prompts/engineer.prompt.md");
  assert.match(architect, /Checkpoint does not end the session/);
  assert.match(architect, /Do not edit docs\/specification-pass\//);
  assert.match(architect, /You must not set \*\*Wake:\*\* sa unless the ledger scope status is `active` and all seven release gates pass/);
  assert.match(architect, /factory-wake-architect/);
  assert.match(architect, /initiative's id, revision, and prHead/);
  assert.match(architect, /`packetId` in that record is the initiative id/);
  assert.match(architect, /scripts\/factory-wake-check\.ts factory-wake-architect/);
  assert.match(analyst, /Run only if this commit has this exact line: `\*\*Wake:\*\* sa`/);
  assert.match(analyst, /If this wake is a label removed, stop/);
  assert.match(analyst, /If `factory-blocked` or `factory-hold` is on the PR: stop/);
  assert.match(analyst, /You do not open another pull request/);
  assert.match(engineer, /Switch to the pull request head branch before reading the packet/);
  assert.match(engineer, /A successful build is not completion/);
  assert.match(engineer, /If `factory-blocked` or `factory-hold` is on the PR: stop/);
  assert.match(engineer, /On `factory-repair`, recut once, then stop/);
  assert.match(engineer, /You do not open another pull request/);
  assert.equal(analyst.includes("HEAD~1"), false);
  assert.match(analyst, /packetId, revision, and prHead/);
  assert.match(analyst, /scripts\/factory-wake-check\.ts factory-wake-sa/);
  assert.match(analyst, /scripts\/factory-analyst\.ts lease --worker/);
  assert.match(analyst, /scripts\/factory-analyst\.ts sign --worker/);
  assert.match(analyst, /scripts\/factory-analyst\.ts interrupt --worker/);
  assert.match(analyst, /change_specified/);
  assert.match(engineer, /packetId, revision, and prHead/);
  assert.match(engineer, /scripts\/factory-wake-check\.ts factory-wake-engineer/);
  assert.match(engineer, /scripts\/factory-wake-check\.ts factory-repair/);
  assert.match(engineer, /scripts\/factory-engineer\.ts lease --worker/);
  assert.match(engineer, /scripts\/factory-engineer\.ts candidate --worker/);
  assert.match(architect, /No timer enforces this interval/);
  const packet = read("docs/factory/initiatives/exec-identity/packets/PKT-001-click-attribution.md");
  assert.match(packet, /\*\*Wake:\*\* hold/);
});

function releasedThroughCandidate(sha: string): WorkItem {
  let item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  item = must(
    applyEvent(
      item,
      { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  item = must(
    applyEvent(
      item,
      {
        type: "sign_change",
        revision: "rev-1",
        sections: [
          "intent",
          "must",
          "stores",
          "runtime",
          "ports",
          "verify",
          "out_of_scope",
          "impact_manifest",
          "dependency_reconciliation",
        ],
        workerId: "bc-a",
      },
      active,
    ),
    "change_specified",
  );
  item = acknowledgeDispatch(item, "wake_engineer");
  item = must(
    applyEvent(
      item,
      { type: "acquire_lease", workerId: "bc-e", role: "engineer", until: "2026-10-29T14:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  return must(
    applyEvent(
      item,
      { type: "commit_candidate", sha, revision: "rev-1", workerId: "bc-e" },
      active,
    ),
    "candidate",
  );
}

function verifyingItem(): WorkItem {
  return must(applyEvent(releasedThroughCandidate("sha-1"), { type: "start_verification", sha: "sha-1" }, active), "verifying");
}

check("T31 a lease is refused when the role does not own the stage", () => {
  const released = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  const engineer = applyEvent(
    released,
    { type: "acquire_lease", workerId: "bc-e", role: "engineer", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
    active,
  );
  assert.equal(engineer.reason, "role_not_admitted");
  assert.equal(engineer.item.stage, "released");
  assert.equal(engineer.item.lease, null);
  const analysis = must(
    applyEvent(
      released,
      { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  const analystLater = applyEvent(
    { ...analysis, stage: "change_specified", lease: null },
    { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
    active,
  );
  assert.equal(analystLater.reason, "role_not_admitted");
});

check("T32 an expired lease cannot sign a change or commit a candidate", () => {
  let item = must(
    applyEvent(freshItem(), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  item = must(
    applyEvent(
      item,
      { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T11:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  const signed = applyEvent(
    item,
    {
      type: "sign_change",
      revision: "rev-1",
      sections: [...sections()],
      workerId: "bc-a",
    },
    active,
  );
  assert.equal(signed.reason, "lease_expired");
  assert.equal(signed.item.stage, "analysis");
  const engineering = {
    ...item,
    stage: "engineering" as const,
    lease: {
      workerId: "bc-e",
      role: "engineer" as const,
      until: "2026-10-29T11:00:00Z",
      revision: "rev-1",
    },
  };
  const committed = applyEvent(
    engineering,
    { type: "commit_candidate", sha: "sha-1", revision: "rev-1", workerId: "bc-e" },
    active,
  );
  assert.equal(committed.reason, "lease_expired");
});

check("T38 through T41 durable dispatch binds the wake and rejects stale or failed labels", async () => {
  const calls: string[] = [];
  const store = new MemoryStore(emptyLedger(3));
  const world = active;
  const packetId = "pkt-001-click-attribution";
  const prHead = "head-1";
  let result = await commitEvent(
    store,
    packetId,
    { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" },
    world,
  );
  assert.equal(result.reason, "released");

  const failed = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: false, reason: "label_api_failed" }], calls),
    packetId,
    prHead,
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "label_api_failed");
  let ledger = await store.read();
  assert.equal(ledger.usedDispatches, 0);
  assert.equal(ledger.packets[packetId].dispatch, null);
  assert.equal(ledger.packets[packetId].dispatchedSaRevision, null);
  assert.equal(ledger.stateRevision, 1);

  const woke = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    packetId,
    prHead,
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(woke.reason, "dispatched");
  assert.equal(woke.effect, "wake_sa");
  ledger = await store.read();
  assert.equal(ledger.usedDispatches, 1);
  assert.equal(ledger.stateRevision, 2);
  const dispatch = ledger.packets[packetId].dispatch;
  assert.ok(dispatch);
  assert.equal(
    workerMayRun({
      label: "factory-wake-sa",
      packetId,
      revision: "rev-1",
      prHead,
      wake: "sa",
      dispatch,
    }).ok,
    true,
  );
  assert.equal(
    workerMayRun({
      label: "factory-wake-sa",
      packetId,
      revision: "rev-1",
      prHead: "head-2",
      wake: "sa",
      dispatch,
    }).reason,
    "pr_head_mismatch",
  );
  assert.equal(
    workerMayRun({
      label: "factory-wake-sa",
      packetId: "other",
      revision: "rev-1",
      prHead,
      wake: "sa",
      dispatch,
    }).reason,
    "packet_mismatch",
  );
  assert.equal(
    workerMayRun({
      label: "factory-wake-sa",
      packetId,
      revision: "rev-old",
      prHead,
      wake: "sa",
      dispatch,
    }).reason,
    "revision_mismatch",
  );
  assert.equal(
    workerMayRun({
      label: "factory-wake-engineer",
      packetId,
      revision: "rev-1",
      prHead,
      wake: "sa",
      dispatch,
    }).reason,
    "label_mismatch",
  );

  const beforeDuplicate = calls.length;
  const duplicate = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    packetId,
    prHead,
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.reason, "no_transition");
  assert.equal(calls.length, beforeDuplicate);

  result = await commitEvent(
    store,
    packetId,
    { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
    world,
  );
  assert.equal(result.item.stage, "analysis");
  result = await commitEvent(
    store,
    packetId,
    { type: "sign_change", revision: "rev-1", sections: [...sections()], workerId: "bc-a" },
    world,
  );
  assert.equal(result.reason, "change_specified");
  const engineerWake = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    packetId,
    prHead,
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: 0,
  });
  assert.equal(engineerWake.effect, "wake_engineer");
  assert.equal(
    workerMayRun({
      label: "factory-wake-engineer",
      packetId,
      revision: "rev-1",
      prHead,
      wake: "sa",
      dispatch: (await store.read()).packets[packetId].dispatch,
    }).ok,
    true,
  );
  result = await commitEvent(
    store,
    packetId,
    { type: "acquire_lease", workerId: "bc-e", role: "engineer", until: "2026-10-29T14:00:00Z", revision: "rev-1" },
    world,
  );
  result = await commitEvent(
    store,
    packetId,
    { type: "commit_candidate", sha: "sha-1", revision: "rev-1", workerId: "bc-e" },
    world,
  );
  assert.equal(result.item.candidateSha, "sha-1");
  result = await commitEvent(store, packetId, { type: "start_verification", sha: "sha-1" }, world);
  result = await commitEvent(
    store,
    packetId,
    { type: "verification_result", sha: "sha-1", outcome: "pass" },
    world,
  );
  assert.equal(result.item.stage, "verified");
  const tooSoon = await commitEvent(store, packetId, { type: "accept", sha: "sha-1" }, world);
  assert.equal(tooSoon.reason, "wrong_stage");
  result = await commitEvent(store, packetId, { type: "authorize_integration", sha: "sha-1" }, world);
  result = await commitEvent(
    store,
    packetId,
    { type: "integrate", candidateSha: "sha-1", mergeSha: "merge-1" },
    world,
  );
  result = await commitEvent(
    store,
    packetId,
    { type: "reconcile", sha: "sha-1", reconciliationId: "rec-pkt-001" },
    world,
  );
  result = await commitEvent(store, packetId, { type: "accept", sha: "sha-1" }, world);
  assert.equal(result.item.stage, "accepted");
  assert.equal(result.item.integratedSha, "merge-1");
  ledger = await store.read();
  assert.equal(ledger.usedDispatches, 2);
  assert.equal(ledger.packets[packetId].stage, "accepted");

  const dir = mkdtempSync(join(tmpdir(), "tower-factory-"));
  const file = join(dir, "ledger.json");
  writeFileSync(file, `${JSON.stringify(emptyLedger(1), null, 2)}\n`);
  const files = new FileStore(file);
  const stale = await files.compareAndSwap(0, { ...emptyLedger(1), stateRevision: 1 });
  assert.equal(stale, true);
  const rejected = await files.compareAndSwap(0, { ...emptyLedger(1), stateRevision: 2 });
  assert.equal(rejected, false);
  assert.equal((await files.read()).stateRevision, 1);

  let spawned = 0;
  const names = new Set<string>();
  const spy: GhRun = async (args, childEnv) => {
    spawned += 1;
    assert.equal(childEnv.GH_TOKEN, "wake-token");
    assert.equal(childEnv.GITHUB_TOKEN, "wake-token");
    if (args[1] === "view") return { status: 0, stdout: [...names].join("\n"), stderr: "" };
    assert.deepEqual(args, labelEditArgs(136, "factory-wake-sa"));
    names.add("factory-wake-sa");
    return { status: 0, stdout: "", stderr: "" };
  };
  const labelInput = { label: "factory-wake-sa", packetId, revision: "rev-1", prHead };
  const disabled = await githubLabelActuator({ env: {}, pr: 136, runGh: spy }).add(labelInput);
  assert.equal(disabled.reason, "actuator_disabled");
  const tokenOnly = await githubLabelActuator({
    env: {
      FACTORY_CONTROLLER: "active",
      FACTORY_LABELS: "armed",
      WAKE_GITHUB_TOKEN: "wake-token",
    },
    pr: 136,
    runGh: spy,
  }).add(labelInput);
  assert.equal(tokenOnly.reason, "actuator_disabled");
  assert.equal(spawned, 0);
  const armed = await githubLabelActuator({
    env: {
      FACTORY_CONTROLLER: "active",
      FACTORY_LABELS: "armed",
      WAKE_GITHUB_TOKEN: "wake-token",
      FACTORY_SPEND_LIMIT_CONFIRMED: "yes",
      FACTORY_AUTOMATIONS_SAVED: "yes",
    },
    pr: 136,
    runGh: spy,
  }).add(labelInput);
  assert.equal(armed.reason, "labeled");
  assert.equal(spawned, 3);
  const failedAdd = await githubLabelActuator({
    env: {
      FACTORY_CONTROLLER: "active",
      FACTORY_LABELS: "armed",
      WAKE_GITHUB_TOKEN: "wake-token",
      FACTORY_SPEND_LIMIT_CONFIRMED: "yes",
      FACTORY_AUTOMATIONS_SAVED: "yes",
    },
    pr: 136,
    runGh: async (args) => {
      if (args[1] === "view") return { status: 0, stdout: "", stderr: "" };
      return { status: 1, stdout: "", stderr: "HTTP 403: Resource not accessible by integration" };
    },
  }).add(labelInput);
  assert.equal(failedAdd.reason, "label_add_failed: HTTP 403: Resource not accessible by integration");
  assert.deepEqual(labelEditArgs(136, "factory-wake-sa"), ["pr", "edit", "136", "--add-label", "factory-wake-sa"]);
  const applyScript = read("scripts/factory-dispatch-apply.ts");
  assert.match(applyScript, /dispatch_not_authorized/);
  assert.match(read(".factory/controller/dispatch.ts"), /not shared by separate GitHub Actions runners/);

  const committed = JSON.parse(read(".factory/state/ledger.json"));
  assert.equal(committed.authorizedDispatches, 50);
  assert.ok(committed.usedDispatches >= 4 && committed.usedDispatches <= committed.authorizedDispatches);
  assert.ok(committed.stateRevision >= 32);
  assert.equal(committed.scope.id, "agents-and-automations");
  assert.ok(committed.scope.status === "suspended" || committed.scope.status === "active");
  const recorded = committed.packets[packetId];
  assert.equal(recorded.stage, "accepted");
  assert.equal(recorded.wake, "hold");
  assert.equal(recorded.dispatch, null);
  assert.equal(recorded.integratedSha, "9c45f19fa1ac9d909247d6be83c9263273b1bcbb");
  assert.equal(recorded.reconciliationId, "pr-136-9c45f19fa1ac9d909247d6be83c9263273b1bcbb");
  assert.equal(recorded.candidateSha, "19c47938d8aa8884b4874999a50667f5677205b3");
  assert.equal(recorded.verifiedSha, recorded.candidateSha);
  assert.equal(recorded.execution.mode, "manual");
  assert.deepEqual(
    recorded.execution.checks.map((check: { runId: string }) => check.runId),
    ["40873984441", "40873984426"],
  );
});

check("T42 and T43 manual evidence verifies without a dispatch and cannot accept", async () => {
  const packetId = "pkt-001-click-attribution";
  const sha = "19c47938d8aa8884b4874999a50667f5677205b3";
  const checks = [
    { name: "factory-check", runId: "40873984441", outcome: "pass" as const },
    { name: "verify:click-attribution", runId: "40873984426", outcome: "pass" as const },
  ];
  const evidence = {
    type: "record_manual_evidence" as const,
    sha,
    revision: "rev-1",
    sections: [...sections()],
    checks,
  };
  const store = new MemoryStore(emptyLedger(null));
  const result = await commitEvent(store, packetId, evidence, inactive);
  assert.equal(result.reason, "verified_manual");
  assert.equal(result.item.stage, "verified");
  assert.equal(result.item.wake, "hold");
  assert.equal(result.item.dispatch, null);
  assert.equal(result.item.execution?.mode, "manual");
  assert.equal(result.item.candidateSha, sha);
  assert.equal(result.item.verifiedSha, sha);
  const ledger = await store.read();
  assert.equal(ledger.stateRevision, 1);
  assert.equal(ledger.usedDispatches, 0);
  assert.equal(ledger.authorizedDispatches, null);
  const decision = decide(result.item, active);
  assert.equal(decision.effect, "none");
  assert.equal(decision.reason, "no_transition");
  assert.equal(
    (await commitEvent(store, packetId, { type: "accept", sha }, active)).reason,
    "wrong_stage",
  );
  assert.equal(
    (await commitEvent(store, packetId, { type: "integrate", candidateSha: sha, mergeSha: "merge-1" }, active)).reason,
    "wrong_stage",
  );

  const failed = applyEvent(
    freshItem(packetId),
    { ...evidence, checks: [{ name: "ship", runId: "1", outcome: "fail" }] },
    inactive,
  );
  assert.equal(failed.reason, "verification_failed");
  assert.equal(failed.item.stage, "draft");
  assert.equal(
    applyEvent(freshItem(packetId), { ...evidence, sections: ["intent"] }, inactive).reason,
    "sections_incomplete",
  );
  assert.equal(applyEvent(freshItem(packetId), { ...evidence, sha: "" }, inactive).reason, "sha_mismatch");
  assert.equal(applyEvent(freshItem(packetId), { ...evidence, checks: [] }, inactive).reason, "verification_evidence_missing");
  const released = must(
    applyEvent(freshItem(packetId), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, inactive),
    "released",
  );
  assert.equal(applyEvent(released, evidence, inactive).reason, "wrong_stage");
  const marked = freshItem(packetId);
  marked.wake = "sa";
  assert.equal(applyEvent(marked, evidence, inactive).reason, "wake_is_dispatch");
  const dispatched = acknowledgeDispatch(freshItem(packetId), "wake_engineer", { prHead: "head-1" });
  assert.equal(applyEvent(dispatched, evidence, inactive).reason, "dispatch_already_recorded");
});

class BarrierRemote implements ContentsRemote {
  sha = "blob-0";
  ledger: FactoryLedger;
  private gets = 0;
  private release: (() => void) | null = null;

  constructor(ledger: FactoryLedger) {
    this.ledger = structuredClone(ledger);
  }

  async get() {
    const snap = { sha: this.sha, ledger: structuredClone(this.ledger) };
    this.gets += 1;
    if (this.gets === 1) {
      await new Promise<void>((resolve) => {
        this.release = resolve;
      });
    } else if (this.gets === 2) {
      this.release?.();
    }
    return snap;
  }

  async put(expectedSha: string, ledger: FactoryLedger) {
    if (expectedSha !== this.sha) return { ok: false as const, reason: "conflict" as const };
    this.sha = `blob-${ledger.stateRevision}`;
    this.ledger = structuredClone(ledger);
    return { ok: true as const, sha: this.sha };
  }
}

check("contents compare-and-swap rejects a stale blob across two clients", async () => {
  const shared = new ContentsBlobRemote({ sha: "blob-0", ledger: emptyLedger(2) });
  const left = new GitHubContentsStore(shared);
  const right = new GitHubContentsStore(shared);
  const next = { ...emptyLedger(2), stateRevision: 1 };
  assert.equal(await left.compareAndSwap(0, next), true);
  assert.equal(await right.compareAndSwap(0, { ...emptyLedger(2), stateRevision: 1 }), false);
  assert.equal((await right.read()).stateRevision, 1);

  const raced = new BarrierRemote(emptyLedger(3));
  const a = new GitHubContentsStore(raced);
  const b = new GitHubContentsStore(raced);
  const release = {
    type: "release" as const,
    wake: "sa" as const,
    gatesPass: true,
    revision: "rev-1",
  };
  const packetId = "pkt-001-click-attribution";
  const [first, second] = await Promise.all([
    commitEvent(a, packetId, release, active),
    commitEvent(b, packetId, release, active),
  ]);
  assert.equal([first.ok, second.ok].filter(Boolean).length, 1);
  assert.equal((await a.read()).stateRevision, 1);
  assert.equal((await a.read()).packets[packetId].stage, "released");

  let sha = "blob-0";
  let body = emptyLedger(1);
  let putSha = "";
  const remote = githubContentsRemote({
    owner: "bywale-com",
    repo: "omcoda_tower",
    path: ".factory/state/ledger.json",
    branch: "cursor/software-factory-33ee",
    env: { WAKE_GITHUB_TOKEN: "wake-token", GITHUB_TOKEN: "bot-token" },
    runGh: async (args, childEnv, stdin) => {
      assert.equal(childEnv.GH_TOKEN, "wake-token");
      assert.equal(childEnv.GITHUB_TOKEN, "wake-token");
      if (args.includes("--method")) {
        const sent = JSON.parse(stdin ?? "{}") as { sha: string; content: string };
        putSha = sent.sha;
        if (sent.sha !== sha) return { status: 1, stdout: "", stderr: "409 Conflict" };
        sha = "blob-after";
        body = JSON.parse(Buffer.from(sent.content, "base64").toString("utf8")) as FactoryLedger;
        return { status: 0, stdout: JSON.stringify({ content: { sha } }), stderr: "" };
      }
      return {
        status: 0,
        stdout: JSON.stringify({
          sha,
          content: Buffer.from(JSON.stringify(body)).toString("base64"),
          encoding: "base64",
        }),
        stderr: "",
      };
    },
  });
  const seen = await remote.get();
  assert.equal(seen?.sha, "blob-0");
  const wrote = await remote.put(seen!.sha, { ...emptyLedger(1), stateRevision: 1 });
  assert.equal(wrote.ok, true);
  assert.equal(putSha, "blob-0");
  const stale = await remote.put("blob-0", { ...emptyLedger(1), stateRevision: 1 });
  assert.equal(stale.ok, false);
  if (!stale.ok) assert.equal(stale.reason, "conflict");
  assert.equal((await remote.get())?.ledger.stateRevision, 1);
});

check("production click path advances the enrollment stamped on the message", () => {
  const housing = read("server/wire-service/campaignHousing.ts");
  const clickAt = housing.indexOf("event_class = 'clicked'");
  assert.ok(clickAt > 0);
  const clickSql = housing.slice(clickAt, housing.indexOf("ORDER BY e.at DESC", clickAt));
  assert.match(clickSql, /\(campaign_objective_id = \$3 AND enrollment_id = \$4\)/);
  assert.match(clickSql, /campaign_objective_id IS NULL/);
  assert.match(clickSql, /enrollment_id = \$4/);
  assert.match(clickSql, /created_at >= \$5/);
  const meetingAt = housing.indexOf('completion_table === "meeting_booked"');
  const meetingSql = housing.slice(meetingAt, clickAt);
  assert.equal(meetingSql.includes("campaign_objective_id = $3 AND enrollment_id = $4"), false);

  const hook = read("server/wire-service/webhooks.ts");
  assert.match(hook, /SELECT firm_id, contact_id, enrollment_id FROM outbound_messages/);
  const click = hook.slice(hook.indexOf('eventClass === "clicked"'), hook.indexOf('eventClass === "bounce_hard"'));
  assert.match(click, /advanceEnrollmentCampaign/);
  assert.match(click, /enrollmentId/);
  assert.equal(click.includes("onCompletionWrite"), false);

  const scp = read("docs/factory/initiatives/exec-identity/systems/SCP-pkt-001-click-attribution.md");
  for (const heading of [
    "## Intent",
    "## Must / must-not",
    "## Stores and contracts",
    "## Runtime",
    "## Ports",
    "## Verify",
    "## Out of scope",
    "## Impact manifest",
    "## Dependency reconciliation",
  ]) {
    assert.ok(scp.includes(heading), heading);
  }
  assert.match(scp, /Form and meeting callers of `onCompletionWrite` stay/);
  const packet = read("docs/factory/initiatives/exec-identity/packets/PKT-001-click-attribution.md");
  assert.match(packet, /\*\*Wake:\*\* hold/);
});

check("opening an ask does not write the enrollment cursor", () => {
  const seat = read("server/wire-service/contactSeat.ts");
  const get = seat.slice(
    seat.indexOf("export async function handleContactSeatGet"),
    seat.indexOf("export async function handleContactSeatConsent"),
  );
  assert.ok(get.includes("handleContactSeatGet"));
  assert.equal(get.includes("UPDATE enrollment"), false);
  assert.match(get, /return json\(c, await projectSeat\(resolved\.pool, resolved\.link\)\)/);

  const project = seat.slice(seat.indexOf("async function projectSeat"), seat.indexOf("async function seatFromToken"));
  assert.match(project, /const campaignId = enrollment\?\.campaign_id \?\? link\.campaign_id;/);

  const routes = read("server/wire-service/routes.ts");
  assert.match(routes, /wire\.get\("\/machine\/contact-workspaces\/:contactId", handleContactSeatGet\)/);
  assert.match(routes, /wire\.get\("\/contact-seat\/:token", handleContactSeatGet\)/);
});

check("a resumed wait restores stored writes before goOn", () => {
  const source = read("server/wire-service/workflowWalk.ts");
  const start = source.indexOf("if (opts.resumeFromNodeId)");
  const end = source.indexOf("await visit(start.id)", start);
  const branch = source.slice(start, end);
  assert.ok(start >= 0 && end > start);
  assert.ok(branch.includes("ctx.chainWrites[nodeId] = writesFromUnknown(status.writes)"));
  assert.ok(branch.includes("ctx.previousWrites = Array.isArray(waitedWrites) ? writesFromUnknown(waitedWrites) : []"));
  assert.ok(branch.indexOf("ctx.previousWrites") < branch.indexOf("await goOn(opts.resumeFromNodeId"));
  assert.equal(branch.includes("counts.waitWrites"), false);
  assert.equal(branch.includes("wait_occupancy"), false);
  assert.match(branch, /SELECT node_status FROM workflow_run WHERE id=\$1/);
  const loader = source.slice(source.indexOf("async function loadWriteRow"), source.indexOf("async function loadWriteField"));
  assert.match(loader.trim(), /return null;\s*\}$/);
  const filter = read(".github/workflows/factory-check.yml");
  assert.match(filter, /server\/wire-service\/workflowWalk\.ts/);
  assert.match(filter, /scripts\/verify-resume-same-run\.ts/);
  assert.match(read(".github/workflows/ship.yml"), /verify-resume-same-run\.ts/);
});

check("an objective_met firing publishes the engagement row and the flipped enrollment", () => {
  const housing = read("server/wire-service/campaignHousing.ts");
  const start = housing.indexOf("export async function advanceEnrollmentCampaign");
  const end = housing.indexOf("export async function recordCampaignFailure", start);
  const fn = housing.slice(start, end);
  const binding = "`eng-${randomUUID()}`";
  assert.equal(fn.split(binding).length - 1, 1);
  const declared = fn.match(/const (\w+) = `eng-\$\{randomUUID\(\)\}`;/);
  assert.ok(declared);
  const name = declared![1];
  const rowCount = fn.indexOf("if (!flipped.rowCount)");
  const insertAt = fn.indexOf("INSERT INTO engagement_records");
  const dispatchAt = fn.indexOf("dispatchEventToWorkflows");
  assert.ok(rowCount >= 0 && insertAt > rowCount && dispatchAt > insertAt);
  const insertArgs = fn.slice(fn.indexOf("[", insertAt), fn.indexOf("]", insertAt));
  assert.match(insertArgs, new RegExp(`^\\[\\s*${name}\\b`));
  assert.equal(insertArgs.includes(binding), false);
  const writesAt = fn.indexOf("writes:", dispatchAt);
  const writesEnd = fn.indexOf("],", writesAt);
  const writes = fn.slice(writesAt, writesEnd);
  const engAt = writes.indexOf('"engagement_records"');
  const enrAt = writes.indexOf('"enrollment"');
  assert.ok(engAt >= 0 && enrAt > engAt);
  assert.match(writes.slice(engAt, enrAt), new RegExp(`id: ${name}\\b`));
  const dispatchBody = fn.slice(dispatchAt, writesEnd);
  assert.match(dispatchBody, /campaign_objective_id/);
  assert.match(dispatchBody, /enrollment_id/);
  assert.match(dispatchBody, /completion_id/);
  assert.equal(fn.includes("INSERT INTO enrollment"), false);

  const walk = read("server/wire-service/workflowWalk.ts");
  const dispatchFn = walk.slice(walk.indexOf("export async function dispatchEventToWorkflows"));
  const payloadAt = dispatchFn.indexOf("triggerPayload:");
  const expr = dispatchFn.slice(payloadAt, dispatchFn.indexOf("\n", payloadAt));
  assert.equal(expr.includes("anyPass"), false);

  const loader = walk.slice(walk.indexOf("async function loadWriteRow"), walk.indexOf("async function loadWriteField"));
  const sql = "SELECT * FROM engagement_records WHERE id=$1";
  const sqlAt = loader.indexOf(sql);
  assert.ok(sqlAt >= 0);
  const statement = loader.slice(loader.lastIndexOf("`", sqlAt) + 1, loader.indexOf("`", sqlAt));
  assert.equal(statement, sql);
  for (const banned of ["firm_id", "contact_id", "ORDER BY", "LIMIT"]) {
    assert.equal(statement.includes(banned), false, banned);
  }
  assert.match(loader.trim(), /return null;\s*\}$/);

  const writesFile = read("server/wire-service/runWrites.ts");
  const wStart = writesFile.indexOf("export function writesFromPayload");
  const wNext = writesFile.indexOf("\nexport ", wStart + 10);
  const wFn = writesFile.slice(wStart, wNext < 0 ? writesFile.length : wNext);
  assert.equal(wFn.includes("enrollment_id"), false);

  const filter = read(".github/workflows/factory-check.yml");
  assert.match(filter, /server\/wire-service\/workflowWalk\.ts/);
  assert.match(filter, /server\/wire-service\/runWrites\.ts/);
  assert.match(filter, /scripts\/verify-firing-handle\.ts/);
  assert.match(read(".github/workflows/ship.yml"), /verify-firing-handle\.ts/);
});

check("an audit result row belongs to the run that wrote it", () => {
  const sql = read("supabase/migrations/025_audit_row_grain.sql");
  for (const banned of [
    "DELETE FROM reachability_verdicts",
    "DELETE FROM sequence_ready",
    "SET verdict",
    "SET ready",
  ]) {
    assert.equal(sql.includes(banned), false, banned);
  }
  assert.equal(sql.split("PRIMARY KEY (audit_run_id, contact_id)").length - 1, 2);
  assert.equal((sql.match(/audit_run_id TEXT/g) ?? []).length >= 2, true);
  const withoutRunKey = sql.replace(/audit_run_id/g, "runkey");
  assert.equal(/\bADD COLUMN(?: IF NOT EXISTS)?\s+id\b/i.test(withoutRunKey), false);
  assert.equal(/\bid\s+TEXT\b/i.test(withoutRunKey), false);

  const audit = read("server/wire-service/auditRun.ts");
  assert.equal(audit.includes("ON CONFLICT (contact_id, firm_id)"), false);
  const writer = audit.slice(audit.indexOf("export async function executeAuditRun"));
  assert.match(writer, /INSERT INTO reachability_verdicts \(audit_run_id/);
  assert.match(writer, /INSERT INTO sequence_ready \(audit_run_id/);
  assert.equal(writer.split("id: runId, contact_id: contact.id").length - 1, 2);

  const walk = read("server/wire-service/workflowWalk.ts");
  const loader = walk.slice(walk.indexOf("async function loadWriteRow"), walk.indexOf("async function loadWriteField"));
  const predicate = "audit_run_id=$1 AND contact_id=$2 AND firm_id=$3";
  assert.equal(loader.split(predicate).length - 1, 2);
  let from = 0;
  for (let n = 0; n < 2; n += 1) {
    const at = loader.indexOf(predicate, from);
    assert.ok(at >= 0);
    const statement = loader.slice(loader.lastIndexOf("`", at) + 1, loader.indexOf("`", at));
    assert.equal(statement.includes("ORDER BY"), false);
    from = at + predicate.length;
  }

  const machine = read("server/wire-service/machine.ts");
  const book = machine.slice(
    machine.indexOf("export async function handleAuditRunGet"),
    machine.indexOf("export async function handleContactImport"),
  );
  assert.match(book, /sr\.audit_run_id = rv\.audit_run_id AND sr\.contact_id = rv\.contact_id/);

  const eventTest = read("server/wire-service/eventTest.ts");
  const writeFn = eventTest.slice(eventTest.indexOf("function writeId"), eventTest.indexOf("function toWrites"));
  const auditAt = writeFn.indexOf("audit_run_id");
  assert.ok(auditAt >= 0);
  assert.ok(writeFn.indexOf("body.id") > auditAt);
  assert.ok(writeFn.indexOf("body.contact_id") > auditAt);

  const paths = read(".github/workflows/factory-check.yml");
  for (const path of [
    "server/wire-service/auditRun.ts",
    "server/wire-service/workflowWalk.ts",
    "server/wire-service/machine.ts",
    "server/wire-service/eventTest.ts",
    "scripts/verify-audit-row-grain.ts",
    "supabase/migrations/025_audit_row_grain.sql",
    "scripts/close-walk-gaps.ts",
    "scripts/verify-automations-alive.ts",
    "scripts/verify-machine-e2e.ts",
    "scripts/verify-ship-spine.ts",
  ]) {
    assert.ok(paths.includes(path), path);
  }
  assert.match(read(".github/workflows/ship.yml"), /verify-audit-row-grain\.ts/);
});

check("three id-keyed tables load by primary key and the generic action stores that key", () => {
  const walk = read("server/wire-service/workflowWalk.ts");
  const setStart = walk.indexOf("const PERSON_WRITE_TABLES = new Set([");
  const setEnd = walk.indexOf("]);", setStart);
  const set = walk.slice(setStart, setEnd);
  for (const name of [
    "sequence_ready",
    "reachability_verdicts",
    "contact_records",
    "contact_tag",
    "enrollment",
    "wait_occupancy",
    "engagement_records",
    "fact_writebacks",
    "meeting_booked",
  ]) {
    assert.ok(set.includes(`"${name}"`), name);
  }
  for (const banned of ["eligibility_evaluations", "eligibility_results", "signals", "motion_decisions"]) {
    assert.equal(set.includes(`"${banned}"`), false, banned);
  }

  const loader = walk.slice(walk.indexOf("async function loadWriteRow"), walk.indexOf("async function loadWriteField"));
  for (const table of ["fact_writebacks", "meeting_booked", "wait_occupancy"]) {
    const sql = `SELECT * FROM ${table} WHERE id=$1`;
    const sqlAt = loader.indexOf(sql);
    assert.ok(sqlAt >= 0, table);
    const statement = loader.slice(loader.lastIndexOf("`", sqlAt) + 1, loader.indexOf("`", sqlAt));
    assert.equal(statement, sql);
    for (const banned of ["firm_id", "contact_id", "ORDER BY", "LIMIT"]) {
      assert.equal(statement.includes(banned), false, `${table} ${banned}`);
    }
  }
  assert.match(loader.trim(), /return null;\s*\}$/);

  const operand = walk.slice(walk.indexOf("async function resolveOperandText"), walk.indexOf("async function comparePasses"));
  const find = "row.contact_id === contactId || row.id === contactId";
  assert.equal(operand.split(find).length - 1, 2);

  const ifFn = walk.slice(walk.indexOf("async function evalIfPick"), walk.indexOf("function switchPathsOf"));
  assert.match(ifFn, /for \(const cid of ctx\.contactIds\)/);
  assert.match(ifFn, /personTableOf/);
  const switchFn = walk.slice(walk.indexOf('if (type === "switch")'), walk.indexOf('if (type === "get")'));
  assert.match(switchFn, /for \(const cid of ctx\.contactIds\)/);
  assert.match(switchFn, /personTableOf/);

  const rule = walk.slice(walk.indexOf("async function resolveRuleOperand"), walk.indexOf("async function evaluateRuleConditions"));
  assert.match(rule, /SELECT value FROM fact_writebacks/);
  assert.match(rule, /firm_id=\$1 AND contact_id=\$2 AND field_key=\$3/);
  assert.match(rule, /ORDER BY created_at DESC LIMIT 1/);

  const actionAt = walk.indexOf('if (type === "action")');
  const engageAt = walk.indexOf("const engagementId = await writeEngagement", actionAt);
  assert.ok(engageAt > actionAt);
  const forAt = walk.lastIndexOf("for (const contactId of ctx.contactIds)", engageAt);
  const beforeLoop = walk.slice(actionAt, forAt);
  for (const kind of ["call_agent", "ascribe_tag", "run_audit"]) {
    const at = beforeLoop.indexOf(`if (actionType === "${kind}")`);
    assert.ok(at >= 0, kind);
    assert.ok(beforeLoop.indexOf("return;", at) > at, kind);
  }
  assert.match(beforeLoop, /rawAction !== "run_audit" && rawAction !== "ascribe_tag"/);

  const loopEnd = walk.indexOf("await persistAction", engageAt);
  const loop = walk.slice(forAt, loopEnd);
  assert.match(loop, /const engagementId = await writeEngagement\(/);
  assert.match(loop, /writes\.push\(\{ table: "engagement_records", id: engagementId, contact_id: contactId \}\)/);
  assert.equal(/\bid: contactId\b/.test(loop), false);

  const cascade = read("server/wire-service/cascade.ts");
  const writer = cascade.slice(
    cascade.indexOf("export async function writeEngagement"),
    cascade.indexOf("async function hasInboundOverride"),
  );
  const binding = "`eng-${randomUUID()}`";
  assert.equal(writer.split(binding).length - 1, 1);
  const declared = writer.match(/const (\w+) = `eng-\$\{randomUUID\(\)\}`;/);
  assert.ok(declared);
  const name = declared![1];
  assert.match(writer, new RegExp(`\\[\\s*${name}\\b`));
  assert.match(writer, new RegExp(`return ${name};`));

  const filter = read(".github/workflows/factory-check.yml");
  for (const path of [
    "server/wire-service/workflowWalk.ts",
    "server/wire-service/cascade.ts",
    "scripts/verify-id-keyed-loads.ts",
  ]) {
    assert.ok(filter.includes(path), path);
  }
  assert.match(read(".github/workflows/ship.yml"), /verify-id-keyed-loads\.ts/);
});

check("a fact firing publishes the inserted write-back id", () => {
  function sliceFn(source: string, start: string, end: string): string {
    const at = source.indexOf(start);
    assert.ok(at >= 0, start);
    const to = source.indexOf(end, at + start.length);
    assert.ok(to > at, end);
    return source.slice(at, to);
  }

  function objectAt(source: string, braceAt: number): string {
    let depth = 0;
    for (let i = braceAt; i < source.length; i += 1) {
      if (source[i] === "{") depth += 1;
      else if (source[i] === "}") {
        depth -= 1;
        if (depth === 0) return source.slice(braceAt, i + 1);
      }
    }
    assert.fail("unbalanced payload");
  }

  function payloadOf(fn: string, eventName: string): string {
    const at = fn.indexOf(`eventName: "${eventName}"`);
    assert.ok(at >= 0, eventName);
    const key = fn.indexOf("payload:", at);
    assert.ok(key > at, eventName);
    const brace = fn.indexOf("{", key);
    return objectAt(fn, brace);
  }

  function writesArray(payload: string): string {
    const at = payload.indexOf("writes:");
    assert.ok(at >= 0);
    const bracket = payload.indexOf("[", at);
    let depth = 0;
    for (let i = bracket; i < payload.length; i += 1) {
      if (payload[i] === "[") depth += 1;
      else if (payload[i] === "]") {
        depth -= 1;
        if (depth === 0) return payload.slice(bracket, i + 1);
      }
    }
    assert.fail("unbalanced writes");
  }

  const machine = read("server/wire-service/machine.ts");
  const fact = sliceFn(machine, "export async function handleFactWriteback", "export async function handleFactWritebacksList");
  const payload = payloadOf(fact, "fact_writebacks");
  for (const key of [
    "writebackId: writeId",
    "fieldKey",
    "contactId",
    "form_ref: stamp.formRef",
    "campaign_objective_id: stamp.campaignObjectiveId",
  ]) {
    assert.ok(payload.includes(key), key);
  }
  const writes = writesArray(payload);
  assert.equal(writes.split("{").length - 1, 1);
  assert.match(writes, /table: "fact_writebacks"/);
  assert.match(writes, /id: writeId/);
  assert.match(writes, /contact_id: contactId/);
  for (const banned of [
    "firm_id",
    "contactIds",
    "contact_ids",
    "...cascade",
    "missingIds",
    "eligibility_evaluations",
    "eligibility_results",
    "signals",
    "motion_decisions",
  ]) {
    assert.equal(payload.includes(banned), false, banned);
  }
  const dispatch = fact.slice(fact.indexOf('eventName: "fact_writebacks"'));
  assert.match(dispatch, /contactIds: \[contactId\]/);
  const required = fact.indexOf('"contactId and fieldKey required"');
  const insert = fact.indexOf("INSERT INTO fact_writebacks");
  assert.ok(required >= 0 && required < insert);

  const seatFile = read("server/wire-service/contactSeat.ts");
  const seat = sliceFn(seatFile, "export async function handleContactSeatFacts", "export async function handleContactSeatMeeting");
  const seatPayload = payloadOf(seat, "fact_writebacks");
  const seatWrites = writesArray(seatPayload);
  assert.equal(seatWrites.split("{").length - 1, 1);
  assert.match(seatWrites, /table: "fact_writebacks"/);
  assert.match(seatWrites, /id: writeId/);
  assert.match(seatWrites, /contact_id: resolved\.link\.contact_id/);
  assert.ok(seatPayload.includes("firm_id: resolved.link.firm_id"));
  assert.ok(seatPayload.includes("contact_id: resolved.link.contact_id"));
  for (const banned of [
    "contactIds",
    "contact_ids",
    "...cascade",
    "missingIds",
    "eligibility_evaluations",
    "eligibility_results",
    "signals",
    "motion_decisions",
  ]) {
    assert.equal(seatPayload.includes(banned), false, banned);
  }
  const skip = seat.indexOf("if (!fieldKey) continue");
  const seatInsert = seat.indexOf("INSERT INTO fact_writebacks");
  assert.ok(skip >= 0 && skip < seatInsert);

  const cascade = sliceFn(machine, "export async function runContactEligibilityCascade", "export async function handleFactWriteback");
  const eligibility = payloadOf(cascade, "eligibility.changed");
  assert.equal(eligibility.includes("writes"), false);

  const writesFile = read("server/wire-service/runWrites.ts");
  const fromPayload = writesFile.slice(writesFile.indexOf("export function writesFromPayload"));
  assert.ok(fromPayload.startsWith("export function writesFromPayload"));
  assert.equal(fromPayload.includes("writebackId"), false);

  for (const fn of [fact, seat]) {
    const call = fn.indexOf("onCompletionWrite(");
    assert.ok(call >= 0);
    const body = fn.slice(call, fn.indexOf(");", call));
    assert.match(body, /table: "fact_writebacks"/);
    assert.match(body, /rowId: writeId/);
  }

  const housing = read("server/wire-service/campaignHousing.ts");
  const branch = housing.indexOf('if (objective.completion_table === "fact_writebacks")');
  assert.ok(branch >= 0);
  const statement = housing.slice(branch, housing.indexOf("return { ok:", branch));
  assert.match(statement, /campaign_objective_id = \$3/);
  assert.match(statement, /ORDER BY created_at DESC LIMIT 1/);

  const filter = read(".github/workflows/factory-check.yml");
  for (const path of [
    "server/wire-service/machine.ts",
    "server/wire-service/runWrites.ts",
    "scripts/verify-fact-writes.ts",
  ]) {
    assert.ok(filter.includes(path), path);
  }
  assert.match(read(".github/workflows/ship.yml"), /verify-fact-writes\.ts/);
});

check("a meeting firing publishes the inserted booking id", () => {
  function sliceFn(source: string, start: string, end: string): string {
    const at = source.indexOf(start);
    assert.ok(at >= 0, start);
    const to = source.indexOf(end, at + start.length);
    assert.ok(to > at, end);
    return source.slice(at, to);
  }

  function objectAt(source: string, braceAt: number): string {
    let depth = 0;
    for (let i = braceAt; i < source.length; i += 1) {
      if (source[i] === "{") depth += 1;
      else if (source[i] === "}") {
        depth -= 1;
        if (depth === 0) return source.slice(braceAt, i + 1);
      }
    }
    assert.fail("unbalanced payload");
  }

  function payloadOf(fn: string, eventName: string): string {
    const at = fn.indexOf(`eventName: "${eventName}"`);
    assert.ok(at >= 0, eventName);
    const key = fn.indexOf("payload:", at);
    assert.ok(key > at, eventName);
    const brace = fn.indexOf("{", key);
    return objectAt(fn, brace);
  }

  function writesArray(payload: string): string {
    const at = payload.indexOf("writes:");
    assert.ok(at >= 0);
    const bracket = payload.indexOf("[", at);
    let depth = 0;
    for (let i = bracket; i < payload.length; i += 1) {
      if (payload[i] === "[") depth += 1;
      else if (payload[i] === "]") {
        depth -= 1;
        if (depth === 0) return payload.slice(bracket, i + 1);
      }
    }
    assert.fail("unbalanced writes");
  }

  const machine = read("server/wire-service/machine.ts");
  const meeting = sliceFn(machine, "export async function handleMeetingBook", "export async function handleMeetingsList");
  const payload = payloadOf(meeting, "meeting_booked");
  for (const key of [
    "meetingId: id",
    "contactId",
    "slot: body.slot ?? null",
    "campaign_objective_id: campaignObjectiveId",
  ]) {
    assert.ok(payload.includes(key), key);
  }
  const writes = writesArray(payload);
  assert.equal(writes.split("{").length - 1, 1);
  assert.match(writes, /table: "meeting_booked"/);
  assert.match(writes, /\bid\b/);
  assert.match(writes, /contact_id: contactId/);
  for (const banned of [
    "firm_id",
    "contactIds",
    "contact_ids",
    "source",
    "engagement_records",
    "`eng-${randomUUID()}`",
  ]) {
    assert.equal(payload.includes(banned), false, banned);
  }
  const dispatch = meeting.slice(meeting.indexOf('eventName: "meeting_booked"'));
  assert.match(dispatch, /contactIds: \[contactId\]/);
  const required = meeting.indexOf('"contactId required"');
  const insert = meeting.indexOf("INSERT INTO meeting_booked");
  assert.ok(required >= 0 && required < insert);
  assert.equal(meeting.includes('"slot required"'), false);
  const engagement = meeting.indexOf("INSERT INTO engagement_records");
  assert.ok(engagement > meeting.indexOf('eventName: "meeting_booked"'));
  assert.match(meeting, /`eng-\$\{randomUUID\(\)\}`/);
  const completion = meeting.slice(meeting.indexOf("onCompletionWrite("));
  assert.match(completion, /table: "meeting_booked"/);
  assert.match(completion, /rowId: id/);
  const nullify = meeting.slice(meeting.indexOf("UPDATE active_attempts"));
  assert.match(nullify, /nullified_at/);

  const seatFile = read("server/wire-service/contactSeat.ts");
  const seat = sliceFn(seatFile, "export async function handleContactSeatMeeting", "export async function handleContactSeatUpload");
  const seatPayload = payloadOf(seat, "meeting_booked");
  const seatWrites = writesArray(seatPayload);
  assert.equal(seatWrites.split("{").length - 1, 1);
  assert.match(seatWrites, /table: "meeting_booked"/);
  assert.match(seatWrites, /\bid\b/);
  assert.match(seatWrites, /contact_id: resolved\.link\.contact_id/);
  assert.ok(seatPayload.includes("firm_id: resolved.link.firm_id"));
  assert.ok(seatPayload.includes("slot"));
  assert.ok(seatPayload.includes("contact_id: resolved.link.contact_id"));
  const seatGuard = seat.indexOf("if (!slot)");
  const seatInsert = seat.indexOf("INSERT INTO meeting_booked");
  assert.ok(seatGuard >= 0 && seatGuard < seatInsert);
  assert.equal(seat.includes("INSERT INTO engagement_records"), false);
  const seatNullify = seat.slice(seat.indexOf("UPDATE active_attempts"));
  assert.equal(seatNullify.includes("nullified_at"), false);
  const seatCompletion = seat.slice(seat.indexOf("onCompletionWrite("));
  assert.match(seatCompletion, /table: "meeting_booked"/);
  assert.match(seatCompletion, /rowId: id/);

  const fromPayload = read("server/wire-service/runWrites.ts");
  const writer = fromPayload.slice(fromPayload.indexOf("export function writesFromPayload"));
  assert.ok(writer.startsWith("export function writesFromPayload"));
  assert.equal(writer.includes("meetingId"), false);

  const walk = read("server/wire-service/workflowWalk.ts");
  const localRef = sliceFn(walk, "function localRefFromPayload", "function localAxesMatch");
  assert.equal(localRef.includes("meeting_booked"), false);

  const housing = read("server/wire-service/campaignHousing.ts");
  const branch = housing.indexOf('if (objective.completion_table === "meeting_booked")');
  assert.ok(branch >= 0);
  const statement = housing.slice(branch, housing.indexOf('if (objective.completion_table === "fact_writebacks")', branch));
  assert.match(statement, /campaign_objective_id = \$3/);
  assert.match(statement, /enrollment_id = \$4/);
  assert.match(statement, /created_at >= \$5/);
  assert.match(statement, /ORDER BY created_at DESC LIMIT 1/);
  assert.equal(statement.includes("campaign_objective_id = $3 AND enrollment_id = $4"), false);

  const filter = read(".github/workflows/factory-check.yml");
  for (const path of [
    "server/wire-service/machine.ts",
    "server/wire-service/runWrites.ts",
    "server/wire-service/workflowWalk.ts",
    "scripts/verify-meeting-writes.ts",
  ]) {
    assert.ok(filter.includes(path), path);
  }
  assert.match(read(".github/workflows/ship.yml"), /verify-meeting-writes\.ts/);
});

check("a campaign_failure firing publishes the inserted failure id", () => {
  function sliceFn(source: string, start: string, end: string): string {
    const at = source.indexOf(start);
    assert.ok(at >= 0, start);
    const to = source.indexOf(end, at + start.length);
    assert.ok(to > at, end);
    return source.slice(at, to);
  }

  function objectAt(source: string, braceAt: number): string {
    let depth = 0;
    for (let i = braceAt; i < source.length; i += 1) {
      if (source[i] === "{") depth += 1;
      else if (source[i] === "}") {
        depth -= 1;
        if (depth === 0) return source.slice(braceAt, i + 1);
      }
    }
    assert.fail("unbalanced payload");
  }

  function payloadOf(fn: string, eventName: string): string {
    const at = fn.indexOf(`eventName: "${eventName}"`);
    assert.ok(at >= 0, eventName);
    const key = fn.indexOf("payload:", at);
    assert.ok(key > at, eventName);
    const brace = fn.indexOf("{", key);
    return objectAt(fn, brace);
  }

  function writesArray(payload: string): string {
    const at = payload.indexOf("writes:");
    assert.ok(at >= 0);
    const bracket = payload.indexOf("[", at);
    let depth = 0;
    for (let i = bracket; i < payload.length; i += 1) {
      if (payload[i] === "[") depth += 1;
      else if (payload[i] === "]") {
        depth -= 1;
        if (depth === 0) return payload.slice(bracket, i + 1);
      }
    }
    assert.fail("unbalanced writes");
  }

  const cascade = read("server/wire-service/cascade.ts");
  const escalate = sliceFn(cascade, "export async function escalateAttemptWindow", "export type ChannelSendInput");
  const branchAt = escalate.indexOf("if (!toChannel)");
  assert.ok(branchAt >= 0);
  const branch = escalate.slice(branchAt);
  const payload = payloadOf(branch, "campaign_failure");
  for (const key of [
    "campaignFailureId: failId",
    "attemptId: attempt.id",
    "campaign_id: enr.rows[0]?.campaign_id ?? null",
  ]) {
    assert.ok(payload.includes(key), key);
  }
  assert.equal(payload.includes("campaign_id: campaignId"), false);
  const writes = writesArray(payload);
  assert.equal(writes.split("{").length - 1, 1);
  assert.match(writes, /table: "campaign_failure"/);
  assert.match(writes, /id: failId/);
  assert.match(writes, /contact_id: attempt\.contact_id/);
  for (const banned of [
    "firm_id",
    "active_attempts",
    "enrollment",
    "engagement_records",
    "workflow_run",
    "send_live",
    "send_dry_run",
  ]) {
    assert.equal(writes.includes(banned), false, banned);
  }
  const withoutWrites = payload.replace(writes, "");
  for (const banned of ["firm_id", "contact_id", "sequence_id", "criteriaId", "setValue", "anyPass"]) {
    assert.equal(withoutWrites.includes(banned), false, banned);
  }
  assert.match(branch, /contactIds: \[attempt\.contact_id\]/);
  assert.match(branch, /campaignId: enr\.rows\[0\]\?\.campaign_id \?\? null/);
  assert.match(branch, /payload: \{ attemptId: attempt\.id, criteriaId: criteria\.id, setValue \}/);
  assert.match(branch, /console\.warn\("\[cascade\] campaign_failure dispatch:", err\)/);
  const firedAt = escalate.indexOf("if (attempt.fired_criteria?.[criteria.id])");
  const inboundAt = escalate.indexOf("hasInboundOverride");
  assert.ok(firedAt >= 0 && firedAt < branchAt);
  assert.ok(inboundAt >= 0 && inboundAt < branchAt);
  const firedReturn = escalate.indexOf("return null", firedAt);
  assert.ok(firedReturn > firedAt && firedReturn < branchAt);
  const inboundReturn = escalate.indexOf("return null", inboundAt);
  assert.ok(inboundReturn > inboundAt && inboundReturn < branchAt);

  const housing = read("server/wire-service/campaignHousing.ts");
  const record = sliceFn(housing, "export async function recordCampaignFailure", "export async function pickAuthoredContent");
  assert.match(record, /const id = `cfail-\$\{randomUUID\(\)\}`/);
  assert.match(record, /INSERT INTO campaign_failure \(id, firm_id, contact_id, campaign_id, sequence_id, payload\)/);
  assert.match(record, /status='exhausted'/);
  assert.match(record, /WHERE id=\$1 AND status='open'/);
  const exhaust = record.slice(record.indexOf("UPDATE enrollment"), record.indexOf('query("COMMIT")'));
  assert.match(exhaust, /pursuit_state='exhausted'/);
  assert.equal(exhaust.includes("campaign_id"), false);
  assert.ok(record.indexOf('query("COMMIT")') < record.lastIndexOf("return id"));

  const fromPayload = read("server/wire-service/runWrites.ts");
  const writerAt = fromPayload.indexOf("export function writesFromPayload");
  assert.ok(writerAt >= 0);
  assert.equal(fromPayload.slice(writerAt).includes("campaignFailureId"), false);

  const walk = read("server/wire-service/workflowWalk.ts");
  const loader = sliceFn(walk, "export async function loadWriteRow", "async function loadWriteField");
  const statement = loader.match(/SELECT \* FROM campaign_failure WHERE id=\$1/);
  assert.ok(statement);
  for (const banned of ["firm_id", "contact_id", "ORDER BY", "LIMIT"]) {
    assert.equal(statement[0].includes(banned), false, banned);
  }
  assert.match(loader.trimEnd(), /return null;\s*\}$/);
  const people = sliceFn(walk, "const PERSON_WRITE_TABLES = new Set([", "]);");
  assert.equal(people.includes("campaign_failure"), false);
  const localRef = sliceFn(walk, "function localRefFromPayload", "function localAxesMatch");
  assert.match(localRef, /eventName === "campaign_failure"\) return payloadString\(payload, \["campaign_id", "campaignId"\]\)/);
  const triggerRef = read("src/app/data/automationTriggerSelect.ts");
  const triggerArm = sliceFn(triggerRef, "export function triggerLocalRefFromPayload", "export function triggerLocalAxesMatch");
  assert.match(triggerArm, /eventName === "campaign_failure"\) return payloadString\(payload, \["campaign_id", "campaignId"\]\)/);

  const door = read("server/wire-service/eventTest.ts");
  assert.match(door, /SELECT \* FROM campaign_failure WHERE firm_id=\$1 ORDER BY created_at DESC LIMIT 10/);
  const tickAt = cascade.indexOf("export async function tickOnce");
  assert.ok(tickAt >= 0);
  assert.ok(cascade.indexOf("WHERE status = 'open'", tickAt) > tickAt);

  const filter = read(".github/workflows/factory-check.yml");
  for (const path of [
    "server/wire-service/cascade.ts",
    "server/wire-service/workflowWalk.ts",
    "server/wire-service/runWrites.ts",
    "server/wire-service/eventTest.ts",
    "server/wire-service/campaignHousing.ts",
    "src/app/data/automationTriggerSelect.ts",
    "scripts/verify-campaign-failure-writes.ts",
  ]) {
    assert.ok(filter.includes(path), path);
  }
  assert.match(read(".github/workflows/ship.yml"), /verify-campaign-failure-writes\.ts/);
});

check("a ct_firms firing publishes the provisioned firm id", () => {
  function sliceFn(source: string, start: string, end: string): string {
    const at = source.indexOf(start);
    assert.ok(at >= 0, start);
    const to = source.indexOf(end, at + start.length);
    assert.ok(to > at, end);
    return source.slice(at, to);
  }

  function objectAt(source: string, braceAt: number): string {
    let depth = 0;
    for (let i = braceAt; i < source.length; i += 1) {
      if (source[i] === "{") depth += 1;
      else if (source[i] === "}") {
        depth -= 1;
        if (depth === 0) return source.slice(braceAt, i + 1);
      }
    }
    assert.fail("unbalanced payload");
  }

  function bracketAt(source: string, bracketAtIndex: number): string {
    let depth = 0;
    for (let i = bracketAtIndex; i < source.length; i += 1) {
      if (source[i] === "[") depth += 1;
      else if (source[i] === "]") {
        depth -= 1;
        if (depth === 0) return source.slice(bracketAtIndex, i + 1);
      }
    }
    assert.fail("unbalanced writes");
  }

  const machine = read("server/wire-service/machine.ts");
  const fn = sliceFn(machine, "export async function handleMachineProvision", "export async function handleMachineAccessInvite");
  assert.match(fn, /const firm = body\.firmId\?\.trim\(\) \|\| randomUUID\(\)/);
  const upsertAt = fn.indexOf("INSERT INTO ct_firms (id, name, posture, updated_at)");
  assert.ok(upsertAt >= 0);
  const upsert = fn.slice(fn.lastIndexOf("`", upsertAt) + 1, fn.indexOf("`", upsertAt));
  assert.match(upsert, /VALUES \(\$1,\$2,'Idle',now\(\)\)/);
  assert.match(upsert, /ON CONFLICT \(id\) DO UPDATE SET name=EXCLUDED\.name, updated_at=now\(\)/);
  assert.equal(upsert.includes("RETURNING"), false);
  const conflict = upsert.slice(upsert.indexOf("DO UPDATE"));
  for (const banned of ["posture", "pool_slug", "pool_domain", "sending_identity_id"]) {
    assert.equal(conflict.includes(banned), false, banned);
  }
  assert.ok(fn.indexOf("[firm, firmName]", upsertAt) > upsertAt);
  // The kept users insert returns its id. The ct_firms upsert does not.
  assert.equal(fn.split("RETURNING").length - 1, 1);
  assert.match(fn, /INSERT INTO users \(firm_id, email\) VALUES \(\$1::uuid, \$2\) RETURNING id/);
  assert.equal(fn.includes("BEGIN"), false);
  assert.equal(fn.includes("COMMIT"), false);
  const missing = fn.indexOf('{ error: "firmName and email required" }');
  const poolAt = fn.indexOf("getPool()");
  assert.ok(missing >= 0 && poolAt > missing);
  const callAt = fn.indexOf("await dispatchEventToWorkflows");
  const auditAt = fn.indexOf('kind: "firm.provisioned"');
  assert.ok(fn.indexOf("provision.authUser.failed") < callAt);
  assert.ok(fn.indexOf("provision.accessLink.failed") < callAt);
  assert.ok(callAt < auditAt);
  assert.equal(fn.slice(callAt, auditAt).includes("try"), false);
  const call = objectAt(fn, fn.indexOf("{", callAt));
  assert.match(call, /firmId:\s*firm/);
  assert.match(call, /eventName:\s*"ct_firms"/);
  assert.equal(call.includes("contactIds"), false);
  const payload = objectAt(call, call.indexOf("{", call.indexOf("payload:")));
  assert.match(payload, /firmId:\s*firm/);
  assert.match(payload, /\bfirmName\b/);
  assert.match(payload, /\bemail\b/);
  const writes = bracketAt(payload, payload.indexOf("[", payload.indexOf("writes:")));
  assert.equal(writes.split("{").length - 1, 1);
  assert.match(writes, /table:\s*"ct_firms"/);
  assert.match(writes, /id:\s*firm/);
  assert.equal(writes.includes("contact_id"), false);
  const withoutWrites = payload.replace(writes, "");
  for (const banned of [
    "posture",
    "website",
    "role",
    "consultant_name",
    "consultant_email",
    "contact_id",
    "contactIds",
    "anyPass",
  ]) {
    assert.equal(withoutWrites.includes(banned), false, banned);
  }
  assert.equal(/\bid\s*:/.test(withoutWrites), false);

  const fromPayload = read("server/wire-service/runWrites.ts");
  const writer = fromPayload.slice(fromPayload.indexOf("export function writesFromPayload"));
  assert.equal(writer.includes("ct_firms"), false);
  assert.equal(writer.includes("firmName"), false);

  const walk = read("server/wire-service/workflowWalk.ts");
  const loader = sliceFn(walk, "export async function loadWriteRow", "async function loadWriteField");
  const sqlText = "SELECT * FROM ct_firms WHERE id=$1";
  const sqlAt = loader.indexOf(sqlText);
  assert.ok(sqlAt >= 0);
  const statement = loader.slice(loader.lastIndexOf("`", sqlAt) + 1, loader.indexOf("`", sqlAt + sqlText.length));
  assert.equal(statement.replace(/\s+/g, " ").trim(), sqlText);
  const stripped = statement.replace(/ct_firms/g, "");
  for (const banned of ["firm_id", "contact_id", "posture", "ORDER BY", "LIMIT", "firms"]) {
    assert.equal(stripped.includes(banned), false, banned);
  }
  assert.match(loader.slice(sqlAt, sqlAt + sqlText.length + 40), /\[w\.id\]/);
  assert.match(loader.trimEnd(), /return null;\s*\}$/);
  const people = sliceFn(walk, "const PERSON_WRITE_TABLES = new Set([", "]);");
  assert.equal(people.includes("ct_firms"), false);
  const localRef = sliceFn(walk, "function localRefFromPayload", "function localAxesMatch");
  assert.match(localRef, /eventName === "ct_firms"\) return payloadString\(payload, \["id", "firm_id", "firmId"\]\)/);
  const axes = sliceFn(walk, "function localAxesMatch", "export async function dispatchEventToWorkflows");
  assert.match(axes, /payloadString\(opts\.payload, \["firm_id", "firmId"\]\) \?\? opts\.firmId/);
  const firmsMod = sliceFn(walk, 'if (module === "firms")', 'if (module === "');
  assert.match(firmsMod, /table: "ct_firms"/);
  assert.equal(firmsMod.includes("contact_id"), false);

  const triggerRef = read("src/app/data/automationTriggerSelect.ts");
  const triggerArm = sliceFn(triggerRef, "export function triggerLocalRefFromPayload", "export function triggerLocalAxesMatch");
  assert.match(triggerArm, /eventName === "ct_firms"\) return payloadString\(payload, \["id", "firm_id", "firmId"\]\)/);
  const entryAt = triggerRef.indexOf('id: "ct_firms"');
  const entry = triggerRef.slice(entryAt, triggerRef.indexOf("id:", entryAt + 12));
  const layers = entry.match(/layers:\s*\[([\s\S]*?)\]/);
  assert.ok(layers);
  assert.equal(layers[1].replace(/\s+/g, ""), '{kind:"firm"}');

  const catalog = read("src/app/data/automationWorkflows.ts");
  const localSet = sliceFn(catalog, "export const WORKFLOW_EVENTS_WITH_LOCAL = new Set", "]);");
  assert.ok(localSet.includes('"ct_firms"'));

  assert.match(read("server/wire-service/eventTest.ts"), /SELECT \* FROM ct_firms WHERE id=\$1 LIMIT 1/);

  const poolSrc = read("server/wire-service/pool.ts");
  const alloc = sliceFn(poolSrc, "export async function handlePoolAllocate", "export async function handlePoolGet");
  assert.equal(alloc.includes("dispatchEventToWorkflows"), false);
  const poolConflict = alloc.slice(alloc.indexOf("ON CONFLICT (id)"));
  assert.match(poolConflict, /pool_slug = EXCLUDED\.pool_slug/);
  assert.match(poolConflict, /pool_domain = EXCLUDED\.pool_domain/);
  assert.match(poolConflict, /sending_identity_id = EXCLUDED\.sending_identity_id/);
  assert.equal(poolConflict.slice(poolConflict.indexOf("DO UPDATE"), poolConflict.indexOf("`")).includes("posture"), false);

  const stores = read("server/wire-service/stores.ts");
  const auditFn = sliceFn(stores, "export async function appendFirmAudit", "export async function handleAuditAppend");
  assert.equal(auditFn.includes("dispatchEventToWorkflows"), false);

  const seat = read("server/wire-service/contactSeat.ts");
  const projected = sliceFn(seat, "async function projectSeat", "async function seatFromToken");
  assert.match(projected, /UNION ALL/);
  assert.match(projected, /FROM ct_firms/);
  assert.match(projected, /FROM firms/);

  const filter = read(".github/workflows/factory-check.yml");
  for (const path of [
    "server/wire-service/machine.ts",
    "server/wire-service/workflowWalk.ts",
    "server/wire-service/runWrites.ts",
    "server/wire-service/eventTest.ts",
    "server/wire-service/pool.ts",
    "server/wire-service/stores.ts",
    "server/wire-service/routes.ts",
    "src/app/data/automationTriggerSelect.ts",
    "src/app/data/automationWorkflows.ts",
    "scripts/verify-firm-provision-writes.ts",
    ".github/workflows/ship.yml",
    "server/wire-service/contactSeat.ts",
  ]) {
    assert.ok(filter.includes(path), path);
  }
  assert.match(read(".github/workflows/ship.yml"), /verify-firm-provision-writes\.ts/);
});

function sections(): string[] {
  return [
    "intent",
    "must",
    "stores",
    "runtime",
    "ports",
    "verify",
    "out_of_scope",
    "impact_manifest",
    "dependency_reconciliation",
  ];
}

function initiativeSeed(id: string, module: string, priority: number, dependsOn: string[] = []): LedgerEvent {
  return {
    type: "register_initiative",
    initiative: {
      id,
      module,
      capability: id,
      entry: `Operator → ${module} → ${id}`,
      obligation: `Complete ${id}`,
      priority,
      dependsOn,
    },
  };
}

function changeSpecified(id: string): WorkItem {
  let item = must(
    applyEvent(freshItem(id, "alpha"), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  item = must(
    applyEvent(
      item,
      { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
      active,
    ),
    "lease_acquired",
  );
  return must(
    applyEvent(
      item,
      { type: "sign_change", revision: "rev-1", sections: [...sections()], workerId: "bc-a" },
      active,
    ),
    "change_specified",
  );
}

const cycleWorld: World = { ...active, now: "2026-10-29T12:00:00Z", authorizedDispatches: 8 };

check("T44 through T48 an authorized scope continues and selects the next initiative", async () => {
  const store = new MemoryStore(emptyLedger(null));
  const refused = await commitLedgerEvent(
    store,
    { type: "authorize_scope", id: "agents-scope", modules: ["Agents"], authorizedDispatches: 0 },
    cycleWorld,
  );
  assert.equal(refused.ok, false);
  assert.equal(refused.reason, "dispatch_not_authorized");
  assert.equal((await store.read()).authorizedDispatches, null);

  const authorized = await commitLedgerEvent(
    store,
    { type: "authorize_scope", id: "agents-scope", modules: ["Agents"], authorizedDispatches: 8 },
    cycleWorld,
  );
  assert.equal(authorized.reason, "scope_authorized");
  assert.equal(authorized.ledger.scope.status, "active");
  for (const event of [
    initiativeSeed("alpha", "Agents", 1),
    initiativeSeed("beta", "Agents", 2, ["alpha"]),
    initiativeSeed("gamma", "Other", 1),
  ]) {
    const registered = await commitLedgerEvent(store, event, cycleWorld);
    assert.equal(registered.ok, true, registered.reason);
  }

  const selected = await commitLedgerEvent(store, { type: "select_next" }, cycleWorld);
  assert.equal(selected.reason, "selected");
  assert.equal(selected.ledger.initiatives.alpha.queue, "active");
  assert.equal(selected.ledger.initiatives.alpha.session, "continuation_due");
  assert.equal(selected.ledger.initiatives.beta.queue, "discovered");
  assert.equal(selected.ledger.initiatives.gamma.queue, "discovered");

  const calls: string[] = [];
  const failedWake = await dispatchInitiative({
    store,
    actuator: scriptedActuator([{ ok: false, reason: "label_add_failed" }], calls),
    initiativeId: "alpha",
    prHead: "head-a",
    activation: "active",
    now: cycleWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(failedWake.ok, false);
  assert.equal(failedWake.reason, "label_add_failed");
  assert.equal(calls.length, 1);
  assert.equal((await store.read()).usedDispatches, 0);
  assert.equal((await store.read()).initiatives.alpha.dispatch, null);

  const woke = await dispatchInitiative({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    initiativeId: "alpha",
    prHead: "head-a",
    activation: "active",
    now: cycleWorld.now,
    engineeringBusy: false,
    budgetUsd: 30,
  });
  assert.equal(woke.reason, "dispatched");
  assert.equal((await store.read()).usedDispatches, 1);
  assert.equal((await store.read()).initiatives.alpha.session, "running");
  const architectDispatch = (await store.read()).initiatives.alpha.dispatch;
  assert.equal(
    workerMayRun({
      label: "factory-wake-architect",
      packetId: "alpha",
      revision: "rev-0",
      prHead: "head-a",
      wake: "hold",
      dispatch: architectDispatch,
    }).ok,
    true,
  );
  assert.equal(
    workerMayRun({
      label: "factory-wake-sa",
      packetId: "alpha",
      revision: "rev-0",
      prHead: "head-a",
      wake: "hold",
      dispatch: architectDispatch,
    }).reason,
    "label_mismatch",
  );
  const beforeDuplicate = calls.length;
  const duplicate = await dispatchInitiative({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    initiativeId: "alpha",
    prHead: "head-b",
    activation: "active",
    now: cycleWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(duplicate.reason, "already_dispatched");
  assert.equal(calls.length, beforeDuplicate);

  const continued = await commitLedgerEvent(
    store,
    { type: "architect_session", initiativeId: "alpha", outcome: "continue" },
    cycleWorld,
  );
  assert.equal(continued.reason, "architect_continue");
  assert.equal(continued.ledger.initiatives.alpha.revision, "rev-1");
  assert.equal(continued.ledger.initiatives.alpha.dispatch, null);
  assert.equal(continued.ledger.initiatives.alpha.session, "continuation_due");
  assert.equal(continued.ledger.initiatives.alpha.queue, "active");
  const again = controlStep(await store.read(), cycleWorld);
  assert.equal(again.wakes.length, 1);
  assert.equal(again.wakes[0].id, "alpha");
  assert.equal(again.wakes[0].decision.label, "factory-wake-architect");

  const releasedSession = await commitLedgerEvent(
    store,
    { type: "architect_session", initiativeId: "alpha", outcome: "packets_released" },
    cycleWorld,
  );
  assert.equal(releasedSession.reason, "packets_released");
  assert.equal(releasedSession.ledger.initiatives.alpha.session, "idle");
  assert.equal(releasedSession.ledger.initiatives.alpha.queue, "active");
  const opened = await commitLedgerEvent(
    store,
    { type: "open_packet", initiativeId: "alpha", packetId: "pkt-alpha" },
    cycleWorld,
  );
  assert.equal(opened.reason, "packet_opened");
  const wrongRole = await commitEvent(
    store,
    "pkt-alpha",
    { type: "acquire_lease", workerId: "bc-e", role: "engineer", until: "2026-10-29T13:00:00Z", revision: "rev-0" },
    cycleWorld,
  );
  assert.equal(wrongRole.reason, "role_not_admitted");
  const packetRelease = await commitEvent(
    store,
    "pkt-alpha",
    { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" },
    cycleWorld,
  );
  assert.equal(packetRelease.reason, "released");
  const staleSign = await commitEvent(
    store,
    "pkt-alpha",
    { type: "sign_change", revision: "rev-0", sections: [...sections()], workerId: "bc-a" },
    cycleWorld,
  );
  assert.equal(staleSign.reason, "wrong_stage");
  const saProposed = controlStep(await store.read(), cycleWorld);
  assert.equal(saProposed.wakes.length, 1);
  assert.equal(saProposed.wakes[0].kind, "packet");
  assert.equal(saProposed.wakes[0].id, "pkt-alpha");
  assert.equal(saProposed.wakes[0].decision.label, "factory-wake-sa");

  const saWake = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    packetId: "pkt-alpha",
    prHead: "head-a",
    activation: "active",
    now: cycleWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(saWake.effect, "wake_sa");
  await commitEvent(
    store,
    "pkt-alpha",
    { type: "acquire_lease", workerId: "bc-a", role: "analyst", until: "2026-10-29T13:00:00Z", revision: "rev-1" },
    cycleWorld,
  );
  const signed = await commitEvent(
    store,
    "pkt-alpha",
    { type: "sign_change", revision: "rev-1", sections: [...sections()], workerId: "bc-a" },
    cycleWorld,
  );
  assert.equal(signed.reason, "change_specified");
  const busy = controlStep(await store.read(), { ...cycleWorld, engineeringBusy: true });
  assert.equal(busy.wakes.filter((wake) => wake.decision.effect === "wake_engineer").length, 0);

  const engineerWake = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    packetId: "pkt-alpha",
    prHead: "head-a",
    activation: "active",
    now: cycleWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(engineerWake.effect, "wake_engineer");
  await commitEvent(
    store,
    "pkt-alpha",
    { type: "acquire_lease", workerId: "bc-e", role: "engineer", until: "2026-10-29T14:00:00Z", revision: "rev-1" },
    cycleWorld,
  );
  const candidate = await commitEvent(
    store,
    "pkt-alpha",
    { type: "commit_candidate", sha: "cand-1", revision: "rev-1", workerId: "bc-e" },
    cycleWorld,
  );
  assert.equal(candidate.item.candidateSha, "cand-1");
  await commitEvent(store, "pkt-alpha", { type: "start_verification", sha: "cand-1" }, cycleWorld);
  const verifying = (await store.read()).packets["pkt-alpha"];
  const repair = applyEvent(
    verifying,
    { type: "verification_result", sha: "cand-1", outcome: "fail", failureClass: "implementation", fingerprint: "fp-1" },
    cycleWorld,
  );
  assert.equal(repair.reason, "repair_ready");
  assert.equal(decide(repair.item, cycleWorld).label, "factory-repair");
  const duplicatedFailure = applyEvent(
    { ...repair.item, stage: "verifying" },
    { type: "verification_result", sha: "cand-1", outcome: "fail", failureClass: "implementation", fingerprint: "fp-1" },
    cycleWorld,
  );
  assert.equal(duplicatedFailure.reason, "duplicate_failure");
  assert.equal(
    applyEvent(
      verifying,
      { type: "verification_result", sha: "cand-1", outcome: "fail", failureClass: "specification", fingerprint: "spec-1" },
      cycleWorld,
    ).item.stage,
    "returned_architect",
  );
  assert.equal(
    applyEvent(
      verifying,
      { type: "verification_result", sha: "cand-1", outcome: "fail", failureClass: "systems_contract", fingerprint: "contract-1" },
      cycleWorld,
    ).item.stage,
    "returned_analyst",
  );
  const external = applyEvent(
    verifying,
    { type: "verification_result", sha: "cand-1", outcome: "fail", failureClass: "external", fingerprint: "provider" },
    cycleWorld,
  );
  assert.equal(external.item.stage, "blocked");
  assert.equal(decide(external.item, cycleWorld).effect, "none");

  const passed = await commitEvent(
    store,
    "pkt-alpha",
    { type: "verification_result", sha: "cand-1", outcome: "pass" },
    cycleWorld,
  );
  assert.equal(passed.item.stage, "verified");
  assert.equal(passed.item.execution?.mode, "automatic");
  assert.equal((await commitEvent(store, "pkt-alpha", { type: "accept", sha: "cand-1" }, cycleWorld)).reason, "wrong_stage");
  assert.equal(
    (await commitEvent(store, "pkt-alpha", { type: "integrate", candidateSha: "cand-1", mergeSha: "merge-sim" }, cycleWorld)).reason,
    "wrong_stage",
  );
  await commitEvent(store, "pkt-alpha", { type: "authorize_integration", sha: "cand-1" }, cycleWorld);
  const integrated = await commitEvent(
    store,
    "pkt-alpha",
    { type: "integrate", candidateSha: "cand-1", mergeSha: "merge-sim" },
    cycleWorld,
  );
  assert.equal(integrated.item.integratedSha, "merge-sim");
  await commitEvent(
    store,
    "pkt-alpha",
    { type: "reconcile", sha: "cand-1", reconciliationId: "rec-alpha" },
    cycleWorld,
  );
  const accepted = await commitEvent(store, "pkt-alpha", { type: "accept", sha: "cand-1" }, cycleWorld);
  assert.equal(accepted.item.stage, "accepted");

  const earlyClose = await commitLedgerEvent(store, { type: "close_initiative", initiativeId: "alpha" }, cycleWorld);
  assert.equal(earlyClose.reason, "coverage_incomplete");
  assert.equal(moduleComplete(await store.read(), "Agents").reason, "coverage_open");
  await commitLedgerEvent(store, { type: "set_coverage", initiativeId: "alpha", coverageComplete: true }, cycleWorld);
  const closed = await commitLedgerEvent(store, { type: "close_initiative", initiativeId: "alpha" }, cycleWorld);
  assert.equal(closed.reason, "initiative_completed");
  assert.equal(closed.ledger.initiatives.alpha.queue, "completed");
  const view = projectFactory(closed.ledger);
  assert.equal(view.packets.find((packet) => packet.id === "pkt-alpha")?.initiativeId, "alpha");
  assert.equal(view.initiatives.find((item) => item.id === "beta")?.dependsOn[0], "alpha");
  assert.equal(view.packets.find((packet) => packet.id === "pkt-alpha")?.integratedSha, "merge-sim");

  const preview = controlStep(await store.read(), cycleWorld);
  assert.equal(preview.wakes[0].id, "beta");
  assert.equal(preview.wakes[0].decision.label, "factory-wake-architect");
  assert.equal(preview.ledger.authorizedDispatches, 8);
  const persisted = await commitLedgerEvent(store, { type: "select_next" }, cycleWorld);
  assert.equal(persisted.reason, "selected");
  assert.equal(persisted.ledger.initiatives.beta.queue, "active");
  assert.equal(persisted.ledger.initiatives.gamma.queue, "discovered");
  const follow = controlStep(await store.read(), cycleWorld);
  assert.equal(follow.wakes[0].id, "beta");
  assert.equal(follow.wakes[0].decision.label, "factory-wake-architect");

  const pilot = (await store.read()).packets["pkt-001-click-attribution"];
  assert.equal(pilot.stage, "draft");
  assert.equal(pilot.wake, "hold");
  assert.equal(pilot.execution, null);
  assert.equal(pilot.dispatch, null);

  await commitLedgerEvent(store, { type: "suspend", reason: "founder_stop" }, cycleWorld);
  const stopped = controlStep(await store.read(), cycleWorld);
  assert.equal(stopped.wakes.length, 0);
  assert.equal(stopped.reason, "suspended");
  assert.equal(decide(packetRelease.item, { ...cycleWorld, scopeStatus: "suspended" }).reason, "suspended");
  assert.equal((await store.read()).initiatives.beta.queue, "active");
});

check("equal priority selects the lower initiative id", async () => {
  const store = new MemoryStore(emptyLedger(null));
  await commitLedgerEvent(
    store,
    { type: "authorize_scope", id: "agents-scope", modules: ["Agents"], authorizedDispatches: 2 },
    cycleWorld,
  );
  await commitLedgerEvent(store, initiativeSeed("b", "Agents", 1), cycleWorld);
  await commitLedgerEvent(store, initiativeSeed("a", "Agents", 1), cycleWorld);
  const selected = await commitLedgerEvent(store, { type: "select_next" }, cycleWorld);
  assert.equal(selected.ledger.initiatives.a.queue, "active");
  assert.equal(selected.ledger.initiatives.b.queue, "discovered");
});

check("an unsatisfied dependency does not start and does not complete the scope", async () => {
  const store = new MemoryStore(emptyLedger(null));
  await commitLedgerEvent(
    store,
    { type: "authorize_scope", id: "agents-scope", modules: ["Agents"], authorizedDispatches: 2 },
    cycleWorld,
  );
  await commitLedgerEvent(store, initiativeSeed("beta", "Agents", 1, ["alpha"]), cycleWorld);
  const selected = await commitLedgerEvent(store, { type: "select_next" }, cycleWorld);
  assert.equal(selected.reason, "none_eligible");
  assert.equal(selected.ledger.scope.status, "active");
  const step = controlStep(await store.read(), cycleWorld);
  assert.equal(step.wakes.length, 0);
  assert.equal(step.reason, "no_initiative");
});

check("a founder decision does not start the next initiative", async () => {
  const store = new MemoryStore(emptyLedger(null));
  await commitLedgerEvent(
    store,
    { type: "authorize_scope", id: "agents-scope", modules: ["Agents"], authorizedDispatches: 2 },
    cycleWorld,
  );
  await commitLedgerEvent(store, initiativeSeed("alpha", "Agents", 1), cycleWorld);
  await commitLedgerEvent(store, initiativeSeed("beta", "Agents", 2), cycleWorld);
  await commitLedgerEvent(store, { type: "select_next" }, cycleWorld);
  const decision = await commitLedgerEvent(
    store,
    { type: "architect_session", initiativeId: "alpha", outcome: "founder_decision", note: "which enrollment" },
    cycleWorld,
  );
  assert.equal(decision.reason, "founder_decision");
  const step = controlStep(await store.read(), cycleWorld);
  assert.equal(step.wakes.length, 0);
  assert.equal(step.reason, "founder_decision");
  assert.equal((await store.read()).initiatives.beta.queue, "discovered");
  assert.equal((await store.read()).initiatives.alpha.queue, "active");
});

check("one authorized dispatch does not continue after it is spent", async () => {
  const store = new MemoryStore(emptyLedger(null));
  await commitLedgerEvent(
    store,
    { type: "authorize_scope", id: "agents-scope", modules: ["Agents"], authorizedDispatches: 1 },
    cycleWorld,
  );
  await commitLedgerEvent(store, initiativeSeed("alpha", "Agents", 1), cycleWorld);
  await commitLedgerEvent(store, { type: "select_next" }, cycleWorld);
  const woke = await dispatchInitiative({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], []),
    initiativeId: "alpha",
    prHead: "head-a",
    activation: "active",
    now: cycleWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(woke.reason, "dispatched");
  await commitLedgerEvent(store, { type: "architect_session", initiativeId: "alpha", outcome: "continue" }, cycleWorld);
  const step = controlStep(await store.read(), cycleWorld);
  assert.equal(step.wakes.length, 0);
  assert.equal(step.reason, "dispatch_authorization_exhausted");
});

check("an interrupted architect session stays open and an external blocker suspends the scope", async () => {
  const store = new MemoryStore(emptyLedger(null));
  await commitLedgerEvent(
    store,
    { type: "authorize_scope", id: "agents-scope", modules: ["Agents"], authorizedDispatches: 3 },
    cycleWorld,
  );
  await commitLedgerEvent(store, initiativeSeed("alpha", "Agents", 1), cycleWorld);
  await commitLedgerEvent(store, initiativeSeed("beta", "Agents", 2), cycleWorld);
  await commitLedgerEvent(store, { type: "select_next" }, cycleWorld);
  const interrupted = await commitLedgerEvent(
    store,
    { type: "architect_session", initiativeId: "alpha", outcome: "interrupted" },
    cycleWorld,
  );
  assert.equal(interrupted.reason, "architect_interrupted");
  assert.equal(interrupted.ledger.initiatives.alpha.queue, "active");
  assert.equal(interrupted.ledger.initiatives.alpha.session, "continuation_due");
  assert.equal(controlStep(interrupted.ledger, cycleWorld).wakes[0].decision.label, "factory-wake-architect");
  const blocked = await commitLedgerEvent(
    store,
    { type: "architect_session", initiativeId: "alpha", outcome: "external_blocker", note: "provider cap" },
    cycleWorld,
  );
  assert.equal(blocked.reason, "external_blocker");
  assert.equal(blocked.ledger.scope.status, "suspended");
  assert.equal(blocked.ledger.initiatives.alpha.queue, "blocked");
  const step = controlStep(blocked.ledger, cycleWorld);
  assert.equal(step.wakes.length, 0);
  assert.equal(step.reason, "suspended");
  assert.equal(step.ledger.initiatives.beta.queue, "discovered");
});

check("one engineering slot is proposed and a second implementation waits", () => {
  const ledger = emptyLedger(4);
  ledger.packets = { "pkt-b": changeSpecified("pkt-b"), "pkt-a": changeSpecified("pkt-a") };
  const open = controlStep(ledger, cycleWorld);
  const engineers = open.wakes.filter((wake) => wake.decision.effect === "wake_engineer");
  assert.equal(engineers.length, 1);
  assert.equal(engineers[0].id, "pkt-a");
  const taken = structuredClone(ledger);
  taken.packets["pkt-a"].dispatchedEngineerRevision = taken.packets["pkt-a"].revision;
  const waiting = controlStep(taken, cycleWorld);
  assert.equal(waiting.wakes.filter((wake) => wake.decision.effect === "wake_engineer").length, 0);
});

check("a module with no initiatives is not complete, and a covered module completes the scope", () => {
  const empty = emptyLedger(2);
  empty.scope = { id: "s", status: "active", modules: ["Empty"], founderDecision: null, blockReason: null };
  empty.packets = {};
  assert.equal(moduleComplete(empty, "Empty").reason, "no_initiatives");
  const refused = applyLedgerEvent(empty, { type: "select_next" }, cycleWorld);
  assert.equal(refused.reason, "none_eligible");
  assert.equal(refused.ledger.scope.status, "active");

  const openCoverage = emptyLedger(2);
  openCoverage.scope = { id: "s", status: "active", modules: ["Agents"], founderDecision: null, blockReason: null };
  openCoverage.packets = {};
  openCoverage.initiatives.alpha = freshInitiative({
    id: "alpha",
    module: "Agents",
    capability: "alpha",
    entry: "Operator → Agents → alpha",
    obligation: "Complete alpha",
    priority: 1,
    now: cycleWorld.now,
  });
  openCoverage.initiatives.alpha.queue = "completed";
  openCoverage.initiatives.alpha.coverageComplete = null;
  const stillOpen = applyLedgerEvent(openCoverage, { type: "select_next" }, cycleWorld);
  assert.equal(stillOpen.reason, "none_eligible");
  assert.equal(moduleComplete(openCoverage, "Agents").reason, "coverage_open");
  assert.equal(stillOpen.ledger.scope.status, "active");

  const covered = structuredClone(openCoverage);
  covered.initiatives.alpha.coverageComplete = true;
  const done = applyLedgerEvent(covered, { type: "select_next" }, cycleWorld);
  assert.equal(done.reason, "scope_complete");
  assert.equal(done.ledger.scope.status, "complete");
  const step = controlStep(done.ledger, cycleWorld);
  assert.equal(step.wakes.length, 0);
  assert.equal(step.reason, "scope_complete");
});

check("markReleased refuses manual evidence and rewrites a gated packet once", () => {
  const manifest = JSON.parse(read(".factory/manifests/packets/pkt-001-click-attribution.json"));
  const markdown = read("docs/factory/initiatives/exec-identity/packets/PKT-001-click-attribution.md");
  const refused = markReleased(markdown, manifest);
  assert.equal(refused.ok, false);
  if (!refused.ok) assert.equal(refused.reason, "manual_evidence_not_a_release");
  assert.equal(manifest.wake, "hold");
  assert.match(markdown, /\*\*Wake:\*\* hold/);
  const ungated = markReleased("**Wake:** hold\n", { gates: { behaviorEstablished: true, scopeBounded: false } });
  assert.equal(ungated.ok, false);
  if (!ungated.ok) assert.equal(ungated.reason, "gates_failed");
  const missing = markReleased("no wake line", { gates: { behaviorEstablished: true } });
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.reason, "wake_line_missing");
  const released = markReleased("**Wake:** hold\n**UI:** none\n\n## Plates\n\nNone.\n", {
    ui: "none",
    gates: { behaviorEstablished: true, scopeBounded: true },
  });
  assert.equal(released.ok, true);
  if (released.ok) {
    assert.match(released.markdown, /\*\*Wake:\*\* sa/);
    assert.equal(released.manifest.wake, "sa");
    assert.equal(released.manifest.release, "released");
    assert.equal(released.manifest.ui, "none");
    assert.equal(released.manifest.plates, "none");
  }
});

check("a glass change needs a plate and five buckets before Wake sa", () => {
  const gates = {
    behaviorEstablished: true,
    scopeBounded: true,
    dependenciesUnderstood: true,
    acceptanceDefined: true,
    noBlockingQuestion: true,
    noContradictorySpecification: true,
    independentlyImplementable: true,
  };
  const artifact = "docs/factory/plates/pkt-visual.png";
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const shot = { bytes: png.length, header: png };
  const visual = [
    "**Wake:** hold",
    "**UI:** changes",
    "**Approver:** founder",
    "",
    "## Plates",
    "",
    `Artifact: ${artifact}`,
    "",
    ...PLATE_BUCKETS.map((bucket) => `${bucket}: ${bucket} on the new hole.`),
    "",
  ].join("\n");
  const manifest: ReleaseManifest = {
    id: "pkt-visual",
    ui: "changes",
    gates,
    founderApproved: true,
  };
  const readable: PlateEvidence = { artifacts: { [artifact]: shot } };

  const missingFile = markReleased(visual, manifest, { artifacts: {} });
  assert.equal(missingFile.ok, false);
  if (!missingFile.ok) assert.equal(missingFile.reason, "plate_missing");
  const emptyFile = markReleased(visual, manifest, { artifacts: { [artifact]: { bytes: 0, header: png } } });
  assert.equal(emptyFile.ok, false);
  if (!emptyFile.ok) assert.equal(emptyFile.reason, "plate_missing");
  const countedOnly = markReleased(visual, manifest, { artifacts: { [artifact]: { bytes: png.length } } });
  assert.equal(countedOnly.ok, false);
  if (!countedOnly.ok) assert.equal(countedOnly.reason, "plate_missing");
  const proseFile = visual.replace(artifact, "docs/factory/plates/pkt-visual.md");
  const notAnImage = markReleased(proseFile, manifest, {
    artifacts: { "docs/factory/plates/pkt-visual.md": shot },
  });
  assert.equal(notAnImage.ok, false);
  if (!notAnImage.ok) assert.equal(notAnImage.reason, "plate_missing");
  const escaped = visual.replace(artifact, "../pkt-visual.png");
  const outside = markReleased(escaped, manifest, { artifacts: { "../pkt-visual.png": shot } });
  assert.equal(outside.ok, false);
  if (!outside.ok) assert.equal(outside.reason, "plate_missing");

  const thin = visual.replace("Copy: Copy on the new hole.\n", "");
  const unread = markReleased(thin, manifest, readable);
  assert.equal(unread.ok, false);
  if (!unread.ok) assert.equal(unread.reason, "plate_read_incomplete");

  const blocked = markReleased(visual, { ...manifest, gates: { ...gates, scopeBounded: false } }, readable);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.equal(blocked.reason, "gates_failed");

  const unlabeled = markReleased("**Wake:** hold\n\n## Plates\n\nNone.\n", { gates });
  assert.equal(unlabeled.ok, false);
  if (!unlabeled.ok) assert.equal(unlabeled.reason, "ui_unclassified");
  const disagreed = markReleased(visual, { ...manifest, ui: "none" }, readable);
  assert.equal(disagreed.ok, false);
  if (!disagreed.ok) assert.equal(disagreed.reason, "ui_classification_mismatch");
  const paintedNone = markReleased(
    "**Wake:** hold\n**UI:** none\n\n## Plates\n\nArtifact: docs/factory/plates/pkt-visual.png\n",
    { ui: "none", gates },
  );
  assert.equal(paintedNone.ok, false);
  if (!paintedNone.ok) assert.equal(paintedNone.reason, "plates_not_none");
  const nameless = markReleased(visual, { ui: "changes", gates }, readable);
  assert.equal(nameless.ok, false);
  if (!nameless.ok) assert.equal(nameless.reason, "packet_id_missing");

  const headed = [
    "**Wake:** hold",
    "**UI:** changes",
    "",
    "## Plates",
    "",
    `Artifact: ${artifact}`,
    "",
    "### Copy",
    "Save is on the glass.",
    "### Do not build",
    "The sider stays.",
    "### Implied",
    "The closed menu still opens.",
    "### Completes",
    "The empty state is in this module.",
    "### Out of scope",
    "The catalog column.",
    "",
  ].join("\n");
  const releasedPlate = markReleased(visual, manifest, readable);
  assert.equal(releasedPlate.ok, true);
  if (releasedPlate.ok) {
    assert.match(releasedPlate.markdown, /\*\*Wake:\*\* sa/);
    assert.equal(releasedPlate.manifest.wake, "sa");
    assert.equal(releasedPlate.manifest.release, "released");
    assert.equal(releasedPlate.manifest.ui, "changes");
    assert.equal(releasedPlate.manifest.plates, artifact);
    assert.equal(releasedPlate.manifest.founderApproved, undefined);
    assert.equal(releasedPlate.manifest.founderPlateApproval, undefined);
    assert.deepEqual(Object.keys(releasedPlate.manifest.gates ?? {}).sort(), Object.keys(gates).sort());
  }
  const headedRelease = markReleased(headed, manifest, readable);
  assert.equal(headedRelease.ok, true);

  const dir = mkdtempSync(join(tmpdir(), "plate-"));
  writeFileSync(join(dir, "hole.png"), png);
  writeFileSync(join(dir, "empty.png"), Buffer.alloc(0));
  writeFileSync(join(dir, "note.png"), Buffer.from("not an image"));
  const loaded = readPlateArtifacts(dir, ["hole.png", "empty.png", "note.png", "../hole.png", "missing.png"]);
  assert.deepEqual(Object.keys(loaded), ["hole.png"]);
  assert.equal(loaded["hole.png"]?.bytes, png.length);
  const fromDisk = markReleased(visual.replaceAll(artifact, "hole.png"), manifest, { artifacts: loaded });
  assert.equal(fromDisk.ok, true);

  const architect = read("docs/factory/prompts/architect.prompt.md");
  assert.match(architect, /\*\*UI:\*\* none/);
  assert.match(architect, /\*\*UI:\*\* changes/);
  assert.match(architect, /readPlateArtifacts/);
  assert.match(architect, /A byte count written by hand is not an artifact/);
  assert.match(architect, /Founder approval is not required/);
  assert.equal(architect.includes("missing founder approval"), false);
  assert.equal(read(".factory/controller/release.ts").includes("founder_approval_missing"), false);
  for (const bucket of PLATE_BUCKETS) assert.equal(architect.includes(bucket), true);
  assert.match(read("docs/factory/templates/IMPLEMENTATION-PACKET.md"), /\*\*UI:\*\* none/);
  assert.match(read("docs/factory/OPERATING-PROTOCOL.md"), /refuses to write `\*\*Wake:\*\* sa`/);
});

check("committed non-UI packets stay released without a generated plate", () => {
  const dir = "docs/factory/initiatives/exec-identity/packets";
  const names = readdirSync(join(root, dir))
    .filter((name) => /^PKT-.*\.md$/.test(name))
    .sort();
  assert.deepEqual(names, [
    "PKT-001-click-attribution.md",
    "PKT-002-open-ask-cursor.md",
    "PKT-003-resume-same-run.md",
    "PKT-004-firing-handle.md",
    "PKT-005-audit-row-grain.md",
    "PKT-006-id-keyed-loads.md",
    "PKT-007-fact-writes.md",
    "PKT-008-meeting-writes.md",
    "PKT-009-eligibility-writes.md",
    "PKT-010-campaign-failure-writes.md",
    "PKT-011-halt-records-writes.md",
    "PKT-012-consent-opt-out-writes.md",
    "PKT-013-firm-provision-writes.md",
    "PKT-014-empty-firing-audience.md",
    "PKT-015-halt-enroll-firm.md",
    "PKT-016-halt-send-firm.md",
    "PKT-017-tick-send-halt.md",
    "PKT-018-send-denied-engagement.md",
    "PKT-019-first-step-send-denied.md",
  ]);
  for (const name of names) {
    const markdown = read(`${dir}/${name}`);
    const id = name.replace(/^PKT-/, "pkt-").replace(/\.md$/, "");
    const manifest = JSON.parse(read(`.factory/manifests/packets/${id}.json`)) as ReleaseManifest;
    assert.equal(markdown.includes("**UI:** changes"), false);
    if (id === "pkt-010-campaign-failure-writes" || id === "pkt-011-halt-records-writes" || id === "pkt-012-consent-opt-out-writes" || id === "pkt-013-firm-provision-writes" || id === "pkt-014-empty-firing-audience" || id === "pkt-015-halt-enroll-firm" || id === "pkt-016-halt-send-firm" || id === "pkt-017-tick-send-halt" || id === "pkt-018-send-denied-engagement" || id === "pkt-019-first-step-send-denied") {
      assert.equal(manifest.ui, "none");
      assert.equal(manifest.plates, "none");
    } else {
      assert.equal(manifest.ui, undefined);
    }
    if (id === "pkt-001-click-attribution") {
      assert.match(markdown, /\*\*Wake:\*\* hold/);
      assert.match(markdown, /No plate is required/);
      assert.equal(manifest.wake, "hold");
      assert.equal(manifest.execution, "manual");
      assert.equal(manifest.release, "draft");
      continue;
    }
    assert.match(markdown, /\*\*Wake:\*\* sa/);
    assert.match(markdown, /## Plates\r?\n\r?\nNone\./);
    assert.equal(manifest.wake, "sa");
    assert.equal(manifest.release, "released");
  }
  assert.equal(existsSync(join(root, "docs/factory/plates")), false);
});

check("the committed scope is agents-and-automations and PKT-001 stays manual", () => {
  const committed = JSON.parse(read(".factory/state/ledger.json")) as FactoryLedger;
  const view = projectFactory(committed);
  assert.equal(view.scope.id, "agents-and-automations");
  assert.ok(view.scope.status === "suspended" || view.scope.status === "active");
  assert.deepEqual(view.scope.modules, ["Agents and Automations"]);
  assert.ok(view.stateRevision >= 32);
  const packet = view.packets.find((item) => item.id === "pkt-001-click-attribution");
  assert.ok(packet);
  assert.equal(packet.stage, "accepted");
  assert.equal(packet.wake, "hold");
  assert.equal(packet.executionMode, "manual");
  assert.equal(packet.integratedSha, "9c45f19fa1ac9d909247d6be83c9263273b1bcbb");
  assert.equal(packet.reconciliationId, "pr-136-9c45f19fa1ac9d909247d6be83c9263273b1bcbb");
  assert.equal(packet.dispatch, null);
  assert.equal(packet.candidateSha, "19c47938d8aa8884b4874999a50667f5677205b3");
  const execIdentity = view.initiatives.find((item) => item.id === "exec-identity");
  const launch = view.initiatives.find((item) => item.id === "launch-agent");
  assert.equal(execIdentity?.queue, "active");
  const initiative = committed.initiatives["exec-identity"];
  if (initiative.session === "running") {
    assert.equal(initiative.dispatch?.effect, "wake_architect");
    assert.equal(initiative.dispatch?.label, "factory-wake-architect");
  } else {
    assert.equal(initiative.session, "continuation_due");
    assert.equal(initiative.dispatch, null);
  }
  assert.equal(execIdentity?.packetIds[0], "pkt-001-click-attribution");
  assert.equal(launch?.queue, "discovered");
  assert.deepEqual(launch?.dependsOn, ["exec-identity"]);
  assert.equal(moduleComplete(committed, "Agents").reason, "coverage_open");
  assert.equal(moduleComplete(committed, "Agents and Automations").reason, "coverage_open");
  assertRecoveryLedger(committed);
});

function runTsx(script: string, env: NodeJS.ProcessEnv) {
  return spawnSync(join(root, "node_modules/.bin/tsx"), [script], { cwd: root, encoding: "utf8", env });
}

function quietEnv(extra: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.FACTORY_CONTROLLER;
  delete env.FACTORY_LABELS;
  delete env.WAKE_GITHUB_TOKEN;
  delete env.FACTORY_SPEND_LIMIT_CONFIRMED;
  delete env.FACTORY_AUTOMATIONS_SAVED;
  delete env.GH_TOKEN;
  delete env.GITHUB_TOKEN;
  return { ...env, ...extra };
}

check("control and authorize commands do not arm the committed ledger", () => {
  const dry = runTsx("scripts/factory-control.ts", quietEnv());
  assert.equal(dry.status, 0, dry.stderr);
  const inactiveBody = JSON.parse(dry.stdout) as { reason: string; wakes: unknown[] };
  assert.equal(inactiveBody.reason, "inactive");
  assert.deepEqual(inactiveBody.wakes, []);
  const scoped = runTsx("scripts/factory-control.ts", quietEnv({ FACTORY_CONTROLLER: "active" }));
  assert.equal(scoped.status, 0, scoped.stderr);
  const proposed = JSON.parse(scoped.stdout) as { reason: string; wakes: Array<{ id: string; effect: string }> };
  const committedForDry = JSON.parse(read(".factory/state/ledger.json")) as FactoryLedger;
  const openAnalyst = Object.values(committedForDry.packets).some((packet) => packet.dispatch?.effect === "wake_sa");
  if (committedForDry.scope.status === "suspended") {
    assert.equal(proposed.reason, "suspended");
    assert.equal(proposed.wakes.length, 0);
  } else if (committedForDry.scope.status === "active") {
    assert.equal(proposed.wakes.some((wake) => wake.effect === "wake_architect"), false);
    assert.equal(productionPressure(Object.values(committedForDry.packets)).holdArchitect, true);
  } else if (openAnalyst) {
    assert.equal(proposed.reason, "analyst_open");
    assert.equal(proposed.wakes.length, 0);
  } else if (committedForDry.usedDispatches >= (committedForDry.authorizedDispatches ?? 0)) {
    assert.equal(proposed.reason, "dispatch_authorization_exhausted");
    assert.equal(proposed.wakes.length, 0);
  } else if (proposed.reason === "already_dispatched") {
    assert.equal(proposed.wakes.length, 0);
    assert.equal(committedForDry.initiatives["exec-identity"].session, "running");
    assert.equal(committedForDry.initiatives["exec-identity"].dispatch?.effect, "wake_architect");
  } else if (proposed.wakes[0]?.effect === "wake_engineer") {
    assert.equal(proposed.wakes.filter((wake) => wake.effect === "wake_engineer").length, 1);
    assert.notEqual(proposed.wakes[0].id, "pkt-001-click-attribution");
  } else {
    assert.equal(proposed.wakes.length, 1);
    assert.equal(proposed.wakes[0].effect, "wake_sa");
    assert.notEqual(proposed.wakes[0].id, "pkt-002-open-ask-cursor");
    assert.notEqual(proposed.wakes[0].id, "pkt-001-click-attribution");
  }
  const planned = runTsx(
    "scripts/factory-authorize-scope.ts",
    quietEnv({ SCOPE_ID: "agents-scope", SCOPE_MODULES: "Agents", AUTHORIZED_DISPATCHES: "4" }),
  );
  assert.equal(planned.status, 0, planned.stderr);
  const event = JSON.parse(planned.stdout) as { type: string; authorizedDispatches: number };
  assert.equal(event.type, "authorize_scope");
  assert.equal(event.authorizedDispatches, 4);
  const apply = spawnSync(join(root, "node_modules/.bin/tsx"), ["scripts/factory-authorize-scope.ts", "--apply"], {
    cwd: root,
    encoding: "utf8",
    env: quietEnv({ AUTHORIZED_DISPATCHES: "4", SCOPE_ID: "agents-scope", SCOPE_MODULES: "Agents" }),
  });
  assert.equal(apply.status, 1);
  assert.match(apply.stderr, /actuator disarmed/);
  const suspend = runTsx("scripts/factory-suspend.ts", quietEnv({ SUSPEND_REASON: "founder_stop" }));
  assert.equal(suspend.status, 0, suspend.stderr);
  assert.equal((JSON.parse(suspend.stdout) as { type: string }).type, "suspend");
  const committed = JSON.parse(read(".factory/state/ledger.json")) as FactoryLedger;
  assert.ok(committed.scope.status === "suspended" || committed.scope.status === "active");
  assert.equal(committed.scope.id, "agents-and-automations");
  assert.equal(committed.authorizedDispatches, 50);
  assert.ok(committed.usedDispatches >= 4);
  assert.ok(committed.usedDispatches <= committed.authorizedDispatches);
  assert.ok(committed.stateRevision >= 32);
  if (committed.initiatives["exec-identity"].session === "running") {
    assert.equal(committed.initiatives["exec-identity"].dispatch?.effect, "wake_architect");
  } else {
    assert.equal(committed.initiatives["exec-identity"].session, "continuation_due");
    assert.equal(committed.initiatives["exec-identity"].dispatch, null);
  }
  assert.equal(committed.packets["pkt-001-click-attribution"].execution?.mode, "manual");
});

check("a label already on the pull request is pulsed once per Analyst, Architect, and Engineer wake", async () => {
  const armedEnv = {
    FACTORY_CONTROLLER: "active",
    FACTORY_LABELS: "armed",
    WAKE_GITHUB_TOKEN: "wake-token",
    FACTORY_SPEND_LIMIT_CONFIRMED: "yes",
    FACTORY_AUTOMATIONS_SAVED: "yes",
  };
  const wakeWorld: World = { ...active, now: "2026-10-29T18:00:00Z", authorizedDispatches: 8, usedDispatches: 0 };
  function pulse(initial: string[] = []) {
    const labels = new Set(initial);
    const calls: string[][] = [];
    const run: GhRun = async (args) => {
      calls.push(args);
      if (args[1] === "view") return { status: 0, stdout: [...labels].join("\n"), stderr: "" };
      if (args.includes("--remove-label")) {
        labels.delete(args[args.indexOf("--remove-label") + 1]);
        return { status: 0, stdout: "", stderr: "" };
      }
      if (args.includes("--add-label")) {
        labels.add(args[args.indexOf("--add-label") + 1]);
        return { status: 0, stdout: "", stderr: "" };
      }
      return { status: 1, stdout: "", stderr: "unexpected" };
    };
    return { calls, run, labels };
  }
  function verbs(calls: string[][]): string[] {
    return calls.map((args) => {
      if (args[1] === "view") return "view";
      if (args.includes("--remove-label")) return "remove";
      if (args.includes("--add-label")) return "add";
      return "other";
    });
  }
  function released(id: string): WorkItem {
    return must(
      applyEvent(freshItem(id, "exec-identity"), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, inactive),
      "released",
    );
  }
  function specified(id: string): WorkItem {
    const opened = released(id);
    const leased = must(
      applyEvent(opened, {
        type: "acquire_lease",
        role: "analyst",
        workerId: "bc-a",
        revision: "rev-1",
        until: "2026-10-29T19:00:00Z",
      }, wakeWorld),
      "lease_acquired",
    );
    return must(
      applyEvent(leased, { type: "sign_change", revision: "rev-1", sections: [...sections()], workerId: "bc-a" }, wakeWorld),
      "change_specified",
    );
  }

  const analyst = pulse();
  const analystLedger = emptyLedger(8);
  analystLedger.packets["pkt-a"] = released("pkt-a");
  analystLedger.packets["pkt-b"] = released("pkt-b");
  const analystStore = new MemoryStore(analystLedger);
  const analystActuator = githubLabelActuator({ env: armedEnv, pr: 137, runGh: analyst.run });
  const firstSa = await dispatchWake({
    store: analystStore,
    actuator: analystActuator,
    packetId: "pkt-a",
    prHead: "head-a",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(firstSa.reason, "dispatched");
  assert.deepEqual(verbs(analyst.calls), ["view", "add", "view"]);
  const repeatSa = await dispatchWake({
    store: analystStore,
    actuator: analystActuator,
    packetId: "pkt-a",
    prHead: "head-a",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(repeatSa.reason, "no_transition");
  assert.equal(verbs(analyst.calls).length, 3);
  const secondSa = await dispatchWake({
    store: analystStore,
    actuator: analystActuator,
    packetId: "pkt-b",
    prHead: "head-b",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(secondSa.reason, "dispatched");
  assert.deepEqual(verbs(analyst.calls), ["view", "add", "view", "view", "remove", "view", "add", "view"]);
  const analystSaved = await analystStore.read();
  assert.equal(analystSaved.usedDispatches, 2);
  assert.equal(analystSaved.packets["pkt-a"].dispatch?.prHead, "head-a");
  assert.equal(analystSaved.packets["pkt-b"].dispatch?.prHead, "head-b");
  assert.equal(analystSaved.packets["pkt-a"].dispatchedSaRevision, "rev-1");
  assert.equal(analystSaved.packets["pkt-b"].dispatchedSaRevision, "rev-1");

  const architect = pulse(["factory-wake-architect"]);
  const architectStore = new MemoryStore(emptyLedger(8));
  assert.equal((await commitLedgerEvent(architectStore, initiativeSeed("alpha", "test", 1), wakeWorld)).ok, true);
  assert.equal((await commitLedgerEvent(architectStore, { type: "select_next" }, wakeWorld)).reason, "selected");
  const architectActuator = githubLabelActuator({ env: armedEnv, pr: 137, runGh: architect.run });
  const firstArchitect = await dispatchInitiative({
    store: architectStore,
    actuator: architectActuator,
    initiativeId: "alpha",
    prHead: "head-1",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(firstArchitect.reason, "dispatched");
  assert.deepEqual(verbs(architect.calls), ["view", "remove", "view", "add", "view"]);
  assert.equal(
    (await commitLedgerEvent(architectStore, { type: "architect_session", initiativeId: "alpha", outcome: "continue" }, wakeWorld)).reason,
    "architect_continue",
  );
  const secondArchitect = await dispatchInitiative({
    store: architectStore,
    actuator: architectActuator,
    initiativeId: "alpha",
    prHead: "head-2",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(secondArchitect.reason, "dispatched");
  assert.equal(verbs(architect.calls).filter((verb) => verb === "add").length, 2);
  assert.equal(verbs(architect.calls).filter((verb) => verb === "remove").length, 2);
  const architectSaved = await architectStore.read();
  assert.equal(architectSaved.usedDispatches, 2);
  assert.equal(architectSaved.initiatives.alpha.dispatch?.revision, "rev-1");
  assert.equal(architectSaved.initiatives.alpha.dispatch?.prHead, "head-2");
  assert.equal(architectSaved.initiatives.alpha.session, "running");

  const engineer = pulse();
  const engineerLedger = emptyLedger(8);
  engineerLedger.packets.one = specified("one");
  engineerLedger.packets.two = specified("two");
  const before = controlStep(engineerLedger, wakeWorld);
  assert.equal(before.wakes.length, 1);
  assert.equal(before.wakes[0].decision.effect, "wake_engineer");
  const engineerStore = new MemoryStore(engineerLedger);
  const engineerActuator = githubLabelActuator({ env: armedEnv, pr: 137, runGh: engineer.run });
  assert.equal((await dispatchWake({
    store: engineerStore,
    actuator: engineerActuator,
    packetId: before.wakes[0].id,
    prHead: "eng-1",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  })).reason, "dispatched");
  const occupied = controlStep(await engineerStore.read(), wakeWorld);
  assert.equal(occupied.wakes.length, 0);
  const freed = await engineerStore.read();
  freed.packets[before.wakes[0].id].stage = "candidate";
  const nextEngineer = controlStep(freed, wakeWorld);
  assert.equal(nextEngineer.wakes.length, 1);
  assert.equal(nextEngineer.wakes[0].decision.label, "factory-wake-engineer");
  const engineerStore2 = new MemoryStore(freed);
  assert.equal((await dispatchWake({
    store: engineerStore2,
    actuator: githubLabelActuator({ env: armedEnv, pr: 137, runGh: engineer.run }),
    packetId: nextEngineer.wakes[0].id,
    prHead: "eng-2",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  })).reason, "dispatched");
  assert.deepEqual(verbs(engineer.calls), ["view", "add", "view", "view", "remove", "view", "add", "view"]);
  const engineerSaved = await engineerStore2.read();
  assert.equal(engineerSaved.usedDispatches, 2);
  assert.equal(engineerSaved.packets[before.wakes[0].id].dispatch?.prHead, "eng-1");
  assert.equal(engineerSaved.packets[nextEngineer.wakes[0].id].dispatch?.prHead, "eng-2");

  const unconfirmedLedger = emptyLedger(8);
  unconfirmedLedger.packets["pkt-a"] = released("pkt-a");
  const unconfirmedStore = new MemoryStore(unconfirmedLedger);
  const missed = await dispatchWake({
    store: unconfirmedStore,
    actuator: githubLabelActuator({
      env: armedEnv,
      pr: 137,
      runGh: async (args) => {
        if (args[1] === "view") return { status: 0, stdout: "", stderr: "" };
        if (args.includes("--add-label")) return { status: 0, stdout: "", stderr: "" };
        return { status: 1, stdout: "", stderr: "unexpected" };
      },
    }),
    packetId: "pkt-a",
    prHead: "head-a",
    activation: "active",
    now: wakeWorld.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(missed.reason, "label_add_unconfirmed");
  assert.equal((await unconfirmedStore.read()).packets["pkt-a"].dispatch, null);
  assert.equal((await unconfirmedStore.read()).usedDispatches, 0);
  const denied = await githubLabelActuator({
    env: armedEnv,
    pr: 137,
    runGh: async (args) => {
      if (args[1] === "view") return { status: 0, stdout: "factory-wake-sa\n", stderr: "" };
      return { status: 1, stdout: "", stderr: "HTTP 403: Resource not accessible by integration" };
    },
  }).add({ label: "factory-wake-sa", packetId: "pkt-a", revision: "rev-1", prHead: "head-a" });
  assert.equal(denied.reason, "label_remove_failed: HTTP 403: Resource not accessible by integration");
  assert.deepEqual(labelViewArgs(137), ["pr", "view", "137", "--json", "labels", "--jq", ".labels[].name"]);
  assert.deepEqual(labelRemoveArgs(137, "factory-wake-sa"), ["pr", "edit", "137", "--remove-label", "factory-wake-sa"]);
});

check("a ledger-only commit keeps the authorized head and a product commit does not", () => {
  assert.equal(
    headMatchesDispatch({
      dispatchPrHead: "sha-1",
      head: "sha-1",
      isAncestor: true,
      changedPaths: [],
    }).reason,
    "authorized",
  );
  assert.equal(
    headMatchesDispatch({
      dispatchPrHead: "sha-1",
      head: "sha-2",
      isAncestor: true,
      changedPaths: [".factory/state/ledger.json"],
    }).reason,
    "authorized",
  );
  assert.equal(
    headMatchesDispatch({
      dispatchPrHead: "sha-1",
      head: "sha-2",
      isAncestor: true,
      changedPaths: [".factory/state/ledger.json", "server/wire-service/webhooks.ts"],
    }).reason,
    "pr_head_moved",
  );
  assert.equal(
    headMatchesDispatch({
      dispatchPrHead: "sha-1",
      head: "sha-9",
      isAncestor: false,
      changedPaths: [],
    }).reason,
    "pr_head_mismatch",
  );
});

function assertRecoveryLedger(committed: FactoryLedger) {
  assert.equal(committed.scope.id, "agents-and-automations");
  assert.deepEqual(committed.scope.modules, ["Agents and Automations"]);
  assert.equal(committed.authorizedDispatches, 50);
  assert.ok(committed.usedDispatches >= 4);
  assert.ok(committed.usedDispatches <= committed.authorizedDispatches);
  assert.ok(committed.stateRevision >= 32);
  const pkt001 = committed.packets["pkt-001-click-attribution"];
  assert.equal(pkt001.stage, "accepted");
  assert.equal(pkt001.wake, "hold");
  assert.equal(pkt001.dispatch, null);
  assert.equal(pkt001.execution?.mode, "manual");
  assert.equal(pkt001.verifiedSha, "19c47938d8aa8884b4874999a50667f5677205b3");
  assert.equal(pkt001.integratedSha, "9c45f19fa1ac9d909247d6be83c9263273b1bcbb");
  const progressed = new Set([
    "change_specified",
    "engineering",
    "candidate",
    "verifying",
    "verified",
    "integration_authorized",
    "integrated",
    "reconciled",
    "accepted",
  ]);
  const pkt002 = committed.packets["pkt-002-open-ask-cursor"];
  assert.equal(progressed.has(pkt002.stage), true);
  assert.equal(pkt002.wake, "sa");
  assert.equal(pkt002.dispatchedSaRevision, "rev-1");
  if (pkt002.stage === "engineering") {
    assert.equal(pkt002.lease?.role, "engineer");
    assert.equal(pkt002.lease?.revision, pkt002.revision);
  } else {
    assert.equal(pkt002.lease, null);
  }
  const ran = (pkt002.dispatchHistory ?? []).find((row) => row.workerExecution === "ran");
  assert.ok(ran);
  assert.equal(ran.packetId, "pkt-002-open-ask-cursor");
  assert.equal(ran.revision, "rev-1");
  assert.equal(ran.prHead, "a19229352274f07f177619c8d92f689d21d4fdba");
  assert.equal(ran.effect, "wake_sa");
  assert.equal(ran.label, "factory-wake-sa");
  const absentHeads: Record<string, string> = {
    "pkt-003-resume-same-run": "3d15878496575ff4f40e187a3d8012bc7107b6ae",
    "pkt-004-firing-handle": "00ec5e7f066e6e491c4b6f3d1f80db360da25675",
  };
  for (const [id, prHead] of Object.entries(absentHeads)) {
    const packet = committed.packets[id];
    assert.equal(progressed.has(packet.stage), true);
    assert.equal(packet.wake, "sa");
    assert.equal(packet.dispatchedSaRevision, "rev-1");
    const absent = (packet.dispatchHistory ?? []).find((row) => row.workerExecution === "absent");
    const ranRecord = (packet.dispatchHistory ?? []).find((row) => row.workerExecution === "ran" && row.effect === "wake_sa");
    assert.ok(absent);
    assert.ok(ranRecord);
    assert.equal(absent.packetId, id);
    assert.equal(absent.revision, "rev-1");
    assert.equal(absent.prHead, prHead);
    assert.equal(absent.effect, "wake_sa");
    assert.equal(absent.label, "factory-wake-sa");
    if (packet.dispatch?.effect === "wake_sa") assert.notEqual(packet.dispatch.prHead, prHead);
  }
  assert.ok(committed.usedDispatches >= 31);
  assert.ok(committed.usedDispatches <= committed.authorizedDispatches);
  assert.ok(committed.stateRevision >= 123);
  assert.ok(committed.scope.status === "suspended" || committed.scope.status === "active");
  const pkt002Exec = Object.values(committed.executions ?? {}).find(
    (execution) => execution.role === "engineer" && execution.packetIds.includes(pkt002.id) && execution.reason === "candidate_recorded",
  );
  assert.equal(pkt002.candidateSha, "3246a074efecd8adb98e4ca232d443b90821173f");
  assert.ok(pkt002.stage === "candidate" || pkt002.stage === "verified");
  if (pkt002.stage === "verified") {
    assert.equal(pkt002.verifiedSha, pkt002.candidateSha);
    assert.equal(pkt002.execution?.mode, "automatic");
    assert.ok((pkt002.execution?.checks ?? []).some((check) => check.outcome === "pass" && check.runId));
  } else {
    assert.equal(pkt002.verifiedSha, null);
  }
  assert.equal(pkt002.dispatch, null);
  assert.ok(pkt002Exec);
  assert.equal(pkt002Exec.phase, "completed");
  assert.equal(pkt002Exec.reason, "candidate_recorded");
  const engineerRan = (pkt002.dispatchHistory ?? []).filter(
    (row) => row.effect === "wake_engineer" && row.workerExecution === "ran",
  );
  assert.equal(engineerRan.length, 1);
  assert.equal(engineerRan[0].prHead, "f06148b747f212ef49678b226e3650cc353e598f");
  const pkt003 = committed.packets["pkt-003-resume-same-run"];
  assert.ok(
    pkt003.stage === "change_specified" ||
      pkt003.stage === "engineering" ||
      pkt003.stage === "candidate" ||
      pkt003.stage === "verified",
  );
  if (pkt003.stage === "change_specified") {
    assert.equal(pkt003.dispatch, null);
    assert.equal(pkt003.dispatchedEngineerRevision, null);
    assert.equal(pkt003.candidateSha, null);
  }
  if (pkt003.stage === "candidate" || pkt003.stage === "verified") {
    assert.equal(pkt003.lease, null);
    assert.equal(pkt003.dispatch, null);
    assert.match(pkt003.candidateSha ?? "", /^[0-9a-f]{40}$/);
  }
  if (pkt003.stage === "verified") {
    assert.equal(pkt003.verifiedSha, pkt003.candidateSha);
    assert.equal(pkt003.execution?.mode, "automatic");
    assert.ok((pkt003.execution?.checks ?? []).some((check) => check.outcome === "pass" && check.runId));
  }
  const pkt003Exec = Object.values(committed.executions ?? {}).find(
    (execution) => execution.role === "engineer" && execution.packetIds.includes(pkt003.id) && execution.reason === "reservation_expired",
  );
  assert.ok(pkt003Exec);
  assert.equal(pkt003Exec.phase, "refused");
  assert.equal(pkt003Exec.reason, "reservation_expired");
  const engineerAbsent = (pkt003.dispatchHistory ?? []).filter(
    (row) => row.effect === "wake_engineer" && row.workerExecution === "absent",
  );
  assert.equal(engineerAbsent.length, 1);
  assert.equal(engineerAbsent[0].prHead, "f451cee9422ebfb0fda2b120bfb0f669299c0242");
  const architectSession = committed.initiatives["exec-identity"].session;
  if (architectSession === "running") {
    assert.equal(committed.initiatives["exec-identity"].dispatch?.effect, "wake_architect");
  } else {
    assert.equal(architectSession, "continuation_due");
    assert.equal(committed.initiatives["exec-identity"].dispatch, null);
  }
  const metrics = productionMetrics(committed);
  assert.equal(metrics.costPerAcceptedPacket, null);
  assert.equal(metrics.acceptedPackets, 0);
  assert.ok(metrics.refusedOrFailedLaunches >= 1);
  assert.ok(metrics.trackedFreshLaunches >= 2);
  assert.ok(metrics.completedExecutions >= 1);
  assert.ok(metrics.engineerQueueDepth >= 2);
  assert.equal(productionPressure(Object.values(committed.packets)).holdArchitect, true);
  assert.equal(recoverExecutions(committed, "2026-10-30T15:45:00.000Z").changes.length, 0);
  const component = "firing-pointers: this firing places its own rows on payload.writes";
  for (const id of [
    "pkt-007-fact-writes",
    "pkt-008-meeting-writes",
    "pkt-009-eligibility-writes",
    "pkt-010-campaign-failure-writes",
    "pkt-011-halt-records-writes",
    "pkt-012-consent-opt-out-writes",
    "pkt-013-firm-provision-writes",
  ]) {
    const packet = committed.packets[id];
    const manifest = JSON.parse(read(`.factory/manifests/packets/${id}.json`)) as { siblings?: Array<{ id: string; basis: string; note: string }> };
    const expected = [
      "pkt-007-fact-writes",
      "pkt-008-meeting-writes",
      "pkt-009-eligibility-writes",
      "pkt-010-campaign-failure-writes",
      "pkt-011-halt-records-writes",
      "pkt-012-consent-opt-out-writes",
      "pkt-013-firm-provision-writes",
    ].filter((other) => other !== id);
    const got = (packet.siblings ?? []).map((link) => link.id).sort();
    assert.deepEqual(got, expected);
    for (const link of packet.siblings ?? []) {
      assert.equal(link.basis, "component");
      assert.equal(link.note, component);
    }
    assert.deepEqual(manifest.siblings, packet.siblings);
  }
  assert.equal(committed.packets["pkt-002-open-ask-cursor"].siblings, undefined);
  assert.equal(committed.packets["pkt-005-audit-row-grain"].siblings, undefined);
  assert.equal(committed.packets["pkt-014-empty-firing-audience"].siblings, undefined);
  assert.deepEqual(
    (committed.packets["pkt-003-resume-same-run"].siblings ?? []).map((link) => link.id),
    ["pkt-004-firing-handle"],
  );
  assert.deepEqual(
    (committed.packets["pkt-004-firing-handle"].siblings ?? []).map((link) => link.id).sort(),
    ["pkt-003-resume-same-run", "pkt-006-id-keyed-loads"],
  );
  assert.deepEqual(
    (committed.packets["pkt-015-halt-enroll-firm"].siblings ?? []).map((link) => link.id),
    ["pkt-016-halt-send-firm"],
  );
  assert.equal(committed.packets["pkt-017-tick-send-halt"].siblings?.length, 2);
  const step = controlStep(committed, { ...cycleWorld, activation: "active" });
  if (committed.scope.status === "suspended") {
    assert.equal(step.reason, "suspended");
    assert.equal(step.wakes.length, 0);
    return;
  }
  const engineers = step.wakes.filter((wake) => wake.decision.effect === "wake_engineer");
  assert.ok(engineers.length <= 1);
  assert.equal(step.wakes.some((wake) => wake.decision.effect === "wake_architect"), false);
  const open = Object.values(committed.packets).filter((packet) => packet.dispatch?.effect === "wake_sa");
  if (engineers.length === 1) {
    assert.equal(engineers[0].decision.label, "factory-wake-engineer");
  } else if (open.length > 0 && step.wakes.length === 0) {
    assert.equal(step.reason, "analyst_open");
  } else if (committed.usedDispatches >= (committed.authorizedDispatches ?? 0)) {
    assert.equal(step.wakes.length, 0);
    assert.equal(step.reason, "dispatch_authorization_exhausted");
  }
}

check("an Analyst signature wakes one Engineer and an interruption can be retried", async () => {
  const world: World = { ...cycleWorld, now: "2026-10-29T18:00:00Z", authorizedDispatches: 20, usedDispatches: 4 };
  function released(id: string): WorkItem {
    return must(
      applyEvent(freshItem(id, "exec-identity"), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, inactive),
      "released",
    );
  }
  const ledger = emptyLedger(4);
  ledger.usedDispatches = 4;
  ledger.packets["pkt-a"] = acknowledgeDispatch(released("pkt-a"), "wake_sa", { prHead: "head-a" });
  ledger.packets["pkt-b"] = acknowledgeDispatch(released("pkt-b"), "wake_sa", { prHead: "head-b" });
  ledger.initiatives.alpha = freshInitiative({
    id: "alpha",
    module: "test",
    capability: "alpha",
    entry: "Operator → Agents → alpha",
    obligation: "Continue alpha",
    priority: 1,
    now: world.now,
  });
  ledger.initiatives.alpha.queue = "active";
  ledger.initiatives.alpha.session = "continuation_due";
  const raised = applyLedgerEvent(
    ledger,
    { type: "authorize_scope", id: "agents-and-automations", modules: ["Agents and Automations"], authorizedDispatches: 20 },
    world,
  );
  assert.equal(raised.reason, "scope_authorized");
  assert.equal(raised.ledger.authorizedDispatches, 20);
  assert.equal(raised.ledger.usedDispatches, 4);
  const raisedAgain = applyLedgerEvent(
    raised.ledger,
    { type: "authorize_scope", id: "agents-and-automations", modules: ["Agents and Automations"], authorizedDispatches: 50 },
    world,
  );
  assert.equal(raisedAgain.reason, "scope_authorized");
  assert.equal(raisedAgain.ledger.authorizedDispatches, 50);
  assert.equal(raisedAgain.ledger.usedDispatches, 4);
  assert.equal(raisedAgain.ledger.packets["pkt-a"].stage, raised.ledger.packets["pkt-a"].stage);

  const leased = must(
    applyEvent(raised.ledger.packets["pkt-a"], {
      type: "acquire_lease",
      workerId: "bc-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      role: "analyst",
      until: "2026-10-29T22:00:00Z",
      revision: "rev-1",
    }, world),
    "lease_acquired",
  );
  assert.equal(leased.stage, "analysis");
  const held = structuredClone(raised.ledger);
  held.packets["pkt-a"] = { ...leased, dispatch: null };
  held.packets["pkt-b"] = { ...held.packets["pkt-b"], dispatch: null };
  const during = controlStep(held, world);
  assert.equal(during.reason, "analysis_open");
  assert.equal(during.wakes.length, 0);
  const blocked = must(
    applyEvent(leased, { type: "blocker", blockerId: "BLOCKER-009", failureClass: "external" }, world),
    "blocked",
  );
  assert.equal(blocked.stage, "analysis");
  assert.equal(decide(blocked, world).reason, "blocked");
  const interrupted = must(
    applyEvent(leased, { type: "interrupt_analysis", workerId: "bc-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }, world),
    "analysis_interrupted",
  );
  assert.equal(interrupted.stage, "released");
  assert.equal(interrupted.lease, null);
  assert.equal(interrupted.dispatchedSaRevision, null);
  assert.equal(interrupted.dispatch, null);
  assert.equal(interrupted.dispatchHistory[0].workerExecution, "ran");
  assert.equal(interrupted.dispatchHistory[0].prHead, "head-a");
  assert.equal(decide(interrupted, { ...world, usedDispatches: 4 }).effect, "wake_sa");

  const signed = must(
    applyEvent(leased, { type: "sign_change", revision: "rev-1", sections: [...sections()], workerId: "bc-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }, world),
    "change_specified",
  );
  assert.equal(signed.stage, "change_specified");
  assert.equal(signed.lease, null);
  assert.equal(signed.dispatchedSaRevision, "rev-1");
  const specified = structuredClone(raised.ledger);
  specified.packets["pkt-a"] = signed;
  specified.packets["pkt-b"] = must(
    applyEvent(leased.stage === "analysis" ? raised.ledger.packets["pkt-b"] : raised.ledger.packets["pkt-b"], {
      type: "acquire_lease",
      workerId: "bc-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      role: "analyst",
      until: "2026-10-29T22:00:00Z",
      revision: "rev-1",
    }, world),
    "lease_acquired",
  );
  specified.packets["pkt-b"] = must(
    applyEvent(specified.packets["pkt-b"], {
      type: "sign_change",
      revision: "rev-1",
      sections: [...sections()],
      workerId: "bc-bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    }, world),
    "change_specified",
  );
  specified.authorizedDispatches = 20;
  specified.usedDispatches = 4;
  const ready = controlStep(specified, world);
  assert.equal(ready.wakes.filter((wake) => wake.decision.effect === "wake_engineer").length, 1);
  assert.equal(ready.wakes[0].id, "pkt-a");
  assert.equal(ready.wakes[0].decision.label, "factory-wake-engineer");
  const store = new MemoryStore(specified);
  const woke = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], []),
    packetId: "pkt-a",
    prHead: "eng-a",
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(woke.reason, "dispatched");
  const saved = await store.read();
  assert.equal(saved.usedDispatches, 5);
  assert.equal(saved.packets["pkt-a"].dispatch?.effect, "wake_engineer");
  assert.equal(saved.packets["pkt-a"].dispatchedSaRevision, "rev-1");
  const waiting = controlStep(saved, world);
  assert.equal(waiting.wakes.filter((wake) => wake.decision.effect === "wake_engineer").length, 0);
  assert.equal(waiting.wakes.some((wake) => wake.id === "pkt-b"), false);

  const adoptedLedger = emptyLedger(20);
  adoptedLedger.usedDispatches = 4;
  const finished = acknowledgeDispatch(released("pkt-done"), "wake_sa", { prHead: "head-done" });
  finished.dispatchHistory = [{ ...finished.dispatch!, workerExecution: "ran" }];
  finished.dispatch = null;
  adoptedLedger.packets["pkt-done"] = finished;
  const unsigned = applyEvent(finished, { type: "adopt_existing_change", sections: ["intent"] }, world);
  assert.equal(unsigned.reason, "sections_incomplete");
  assert.equal(unsigned.item.stage, "released");
  const unrun = released("pkt-new");
  assert.equal(applyEvent(unrun, { type: "adopt_existing_change", sections: [...sections()] }, world).reason, "execution_not_recorded");
  const adopted = must(
    applyEvent(finished, { type: "adopt_existing_change", sections: [...sections()] }, world),
    "existing_change_adopted",
  );
  assert.equal(adopted.stage, "change_specified");
  assert.equal(adopted.lease, null);
  assert.equal(adopted.dispatchedSaRevision, "rev-1");
  assert.equal(adopted.dispatchHistory[0].workerExecution, "ran");
  assert.equal(adopted.dispatchHistory[0].prHead, "head-done");
  assert.equal(decide(adopted, { ...world, usedDispatches: 4 }).effect, "wake_engineer");
  const disarmed = spawnSync(join(root, "node_modules/.bin/tsx"), ["scripts/factory-analyst.ts", "lease", "--worker", "bc-aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"], {
    cwd: root,
    encoding: "utf8",
    env: quietEnv({ GITHUB_ACTIONS: "true" }),
  });
  assert.equal(disarmed.status, 1);
  assert.match(disarmed.stderr, /actuator disarmed/);
});

check("an absent Analyst dispatch can be recovered and a ran dispatch cannot be repeated", async () => {
  function released(id: string): WorkItem {
    return must(
      applyEvent(freshItem(id, "exec-identity"), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, inactive),
      "released",
    );
  }
  function stamped(id: string, prHead: string): WorkItem {
    const item = acknowledgeDispatch(released(id), "wake_sa", { prHead, issuedAt: "2026-10-29T21:28:22.000Z" });
    delete (item as { dispatchHistory?: unknown }).dispatchHistory;
    return item;
  }
  const ledger = emptyLedger(4);
  ledger.usedDispatches = 4;
  ledger.stateRevision = 21;
  ledger.packets["pkt-002"] = stamped("pkt-002", "head-002");
  ledger.packets["pkt-003"] = stamped("pkt-003", "head-003");
  ledger.packets["pkt-004"] = stamped("pkt-004", "head-004");
  ledger.packets["pkt-005"] = released("pkt-005");
  ledger.initiatives.alpha = freshInitiative({
    id: "alpha",
    module: "test",
    capability: "alpha",
    entry: "Operator → Agents → alpha",
    obligation: "Continue alpha",
    priority: 1,
    now: cycleWorld.now,
  });
  ledger.initiatives.alpha.queue = "active";
  ledger.initiatives.alpha.session = "continuation_due";
  ledger.initiatives.alpha.revision = "rev-1";

  const world: World = { ...cycleWorld, authorizedDispatches: 4, usedDispatches: 4 };
  const missing = applyLedgerEvent(ledger, { type: "reconcile_dispatch", packetId: "pkt-missing", workerExecution: "absent" }, world);
  assert.equal(missing.reason, "unknown_packet");
  assert.equal(missing.ledger.usedDispatches, 4);
  const bare = applyLedgerEvent(ledger, { type: "reconcile_dispatch", packetId: "pkt-005", workerExecution: "absent" }, world);
  assert.equal(bare.reason, "no_dispatch");
  assert.equal(bare.ledger.packets["pkt-005"].dispatch, null);
  assert.equal(bare.ledger.usedDispatches, 4);

  const ran = applyLedgerEvent(ledger, { type: "reconcile_dispatch", packetId: "pkt-002", workerExecution: "ran" }, world);
  assert.equal(ran.reason, "dispatch_ran");
  assert.equal(ran.ledger.usedDispatches, 4);
  assert.equal(ran.ledger.packets["pkt-002"].dispatchedSaRevision, "rev-1");
  assert.equal(ran.ledger.packets["pkt-002"].dispatch, null);
  assert.equal(ran.ledger.packets["pkt-002"].dispatchHistory.length, 1);
  assert.equal(ran.ledger.packets["pkt-002"].dispatchHistory[0].workerExecution, "ran");
  assert.equal(ran.ledger.packets["pkt-002"].dispatchHistory[0].prHead, "head-002");
  assert.equal(ran.ledger.packets["pkt-002"].dispatchHistory[0].effect, "wake_sa");
  assert.equal(ran.ledger.packets["pkt-002"].dispatchHistory[0].label, "factory-wake-sa");
  assert.equal(ran.ledger.packets["pkt-002"].dispatchHistory[0].revision, "rev-1");
  assert.equal(
    decide(ran.ledger.packets["pkt-002"], { ...world, usedDispatches: 2 }).reason,
    "no_transition",
  );
  const ambiguous = selectLabeledDispatch(Object.values(ran.ledger.packets), "factory-wake-sa");
  assert.equal(ambiguous.ok, false);
  if (!ambiguous.ok) assert.equal(ambiguous.reason, "ambiguous_dispatch");

  const absent = applyLedgerEvent(ran.ledger, { type: "reconcile_dispatch", packetId: "pkt-003", workerExecution: "absent" }, world);
  assert.equal(absent.reason, "dispatch_absent");
  assert.equal(absent.ledger.usedDispatches, 3);
  assert.equal(absent.ledger.packets["pkt-003"].dispatchedSaRevision, null);
  assert.equal(absent.ledger.packets["pkt-003"].dispatch, null);
  const archived = absent.ledger.packets["pkt-003"].dispatchHistory[0];
  assert.equal(archived.workerExecution, "absent");
  assert.equal(archived.packetId, "pkt-003");
  assert.equal(archived.revision, "rev-1");
  assert.equal(archived.prHead, "head-003");
  assert.equal(archived.effect, "wake_sa");
  assert.equal(archived.label, "factory-wake-sa");
  assert.equal(
    decide(absent.ledger.packets["pkt-003"], { ...world, usedDispatches: absent.ledger.usedDispatches }).effect,
    "wake_sa",
  );

  const blocked = controlStep(absent.ledger, world);
  assert.equal(blocked.reason, "analyst_open");
  assert.equal(blocked.wakes.length, 0);
  assert.equal(blocked.wakes.some((wake) => wake.decision.effect === "wake_architect"), false);

  const oneOpen = selectLabeledDispatch(Object.values(absent.ledger.packets), "factory-wake-sa");
  assert.equal(oneOpen.ok, true);
  if (oneOpen.ok) assert.equal(oneOpen.row.id, "pkt-004");
  const none = selectLabeledDispatch(
    Object.values(absent.ledger.packets).map((packet) => ({ ...packet, dispatch: null })),
    "factory-wake-sa",
  );
  assert.equal(none.ok, false);
  if (!none.ok) assert.equal(none.reason, "no_dispatch_record");

  const closed = applyLedgerEvent(
    absent.ledger,
    { type: "reconcile_dispatch", packetId: "pkt-004", workerExecution: "ran" },
    world,
  );
  assert.equal(closed.reason, "dispatch_ran");
  assert.equal(closed.ledger.usedDispatches, 3);
  assert.equal(closed.ledger.packets["pkt-004"].dispatchedSaRevision, "rev-1");
  const next = controlStep(closed.ledger, { ...world, usedDispatches: closed.ledger.usedDispatches });
  assert.equal(next.wakes.length, 1);
  assert.equal(next.wakes[0].id, "pkt-003");
  assert.equal(next.wakes[0].decision.effect, "wake_sa");
  assert.equal(next.wakes.some((wake) => wake.decision.effect === "wake_architect"), false);
  const one = selectLabeledDispatch(Object.values(closed.ledger.packets), "factory-wake-sa");
  assert.equal(one.ok, false);
  if (!one.ok) assert.equal(one.reason, "no_dispatch_record");

  const store = new MemoryStore(closed.ledger);
  const recovered = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], []),
    packetId: "pkt-003",
    prHead: "head-003-again",
    activation: "active",
    now: "2026-10-29T22:10:00.000Z",
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(recovered.reason, "dispatched");
  const saved = await store.read();
  assert.equal(saved.usedDispatches, 4);
  assert.equal(saved.packets["pkt-003"].dispatch?.prHead, "head-003-again");
  assert.equal(saved.packets["pkt-003"].dispatch?.issuedAt, "2026-10-29T22:10:00.000Z");
  assert.equal(saved.packets["pkt-003"].dispatchHistory.length, 1);
  assert.equal(saved.packets["pkt-003"].dispatchHistory[0].workerExecution, "absent");
  assert.equal(saved.packets["pkt-003"].dispatchHistory[0].prHead, "head-003");
  const held = controlStep(saved, world);
  assert.equal(held.reason, "analyst_open");
  assert.equal(held.wakes.length, 0);

  const broke = emptyLedger(1);
  broke.usedDispatches = 0;
  broke.packets["pkt-x"] = stamped("pkt-x", "head-x");
  const refused = applyLedgerEvent(broke, { type: "reconcile_dispatch", packetId: "pkt-x", workerExecution: "absent" }, world);
  assert.equal(refused.reason, "spend_missing");
  assert.equal(refused.ledger.usedDispatches, 0);
  assert.equal(refused.ledger.packets["pkt-x"].dispatch?.prHead, "head-x");
  assert.equal(refused.ledger.packets["pkt-x"].dispatchedSaRevision, "rev-1");
});

check("assignments batch siblings, recover the engineer slot, and hold a deep queue", async () => {
  const world: World = { ...active, now: "2026-10-30T12:00:00.000Z", authorizedDispatches: 8, usedDispatches: 0 };
  function released(id: string, revision = "rev-1"): WorkItem {
    return must(
      applyEvent(freshItem(id, "exec-identity"), { type: "release", wake: "sa", gatesPass: true, revision }, active),
      "released",
    );
  }
  const shared = { basis: "component" as const, note: "firing-pointers places this firing's rows on payload.writes" };
  const left = released("pkt-009-eligibility-writes");
  const right = released("pkt-012-consent-opt-out-writes");
  const between = released("pkt-010-campaign-failure-writes");
  const waiting = released("pkt-011-halt-records-writes");
  left.siblings = [{ id: right.id, ...shared }];
  right.siblings = [{ id: left.id, ...shared }];
  waiting.siblings = [{ id: left.id, ...shared }];
  waiting.stage = "change_specified";
  const ledger = emptyLedger(8);
  ledger.packets = { [left.id]: left, [between.id]: between, [right.id]: right, [waiting.id]: waiting };
  const alone = analystAssignment([between]);
  assert.deepEqual(alone?.packetIds, [between.id]);
  assert.equal(alone?.basis, null);
  const batch = analystAssignment(Object.values(ledger.packets));
  assert.deepEqual(batch?.packetIds, [left.id, right.id]);
  assert.match(batch?.basis ?? "", /component/);
  const step = controlStep(ledger, world);
  const analysts = step.wakes.filter((wake) => wake.decision.effect === "wake_sa");
  assert.equal(analysts.length, 1);
  assert.deepEqual(analysts[0].packetIds, [left.id, right.id]);
  const calls: string[] = [];
  const store = new MemoryStore(ledger);
  const woke = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    packetId: left.id,
    packetIds: analysts[0].packetIds,
    basis: analysts[0].basis,
    prHead: "head-batch",
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(woke.reason, "dispatched");
  assert.equal((await store.read()).usedDispatches, 1);
  const saved = await store.read();
  const executionId = saved.packets[left.id].dispatch?.executionId;
  assert.ok(executionId);
  assert.equal(saved.packets[right.id].dispatch?.executionId, executionId);
  assert.notEqual(saved.packets[left.id].revision, "rev-9");
  assert.equal(saved.packets[right.id].revision, "rev-1");
  assert.equal(
    workerMayRun({
      label: "factory-wake-sa",
      packetId: right.id,
      revision: right.revision,
      prHead: "head-batch",
      wake: "sa",
      dispatch: saved.packets[right.id].dispatch,
      executionId: "dsp-other",
    }).reason,
    "execution_mismatch",
  );
  const leaseUntil = "2026-10-30T13:00:00.000Z";
  for (const id of [left.id, right.id]) {
    const leased = await commitEvent(
      store,
      id,
      { type: "acquire_lease", workerId: "bc-analyst", role: "analyst", until: leaseUntil, revision: "rev-1" },
      world,
    );
    assert.equal(leased.reason, "lease_acquired");
    const signed = await commitEvent(
      store,
      id,
      { type: "sign_change", revision: "rev-1", sections: sections(), workerId: "bc-analyst" },
      world,
    );
    assert.equal(signed.reason, "change_specified");
    assert.equal(signed.item.revision, "rev-1");
  }
  const signedLedger = await store.read();
  const execution = signedLedger.executions?.[executionId as string];
  assert.equal(execution?.phase, "completed");
  assert.equal(execution?.reason, "specifications_signed");
  assert.equal(signedLedger.packets[left.id].stage, "change_specified");
  assert.equal(signedLedger.packets[right.id].stage, "change_specified");
  assert.equal(signedLedger.usedDispatches, 1);

  const architect = emptyLedger(4);
  architect.initiatives.alpha = freshInitiative({
    id: "alpha",
    module: "test",
    capability: "alpha",
    entry: "Operator → test → alpha",
    obligation: "Continue alpha",
    priority: 1,
    now: world.now,
  });
  architect.initiatives.alpha.queue = "active";
  architect.initiatives.alpha.session = "running";
  architect.initiatives.alpha.dispatch = {
    packetId: "alpha",
    revision: "rev-0",
    prHead: "head-a",
    effect: "wake_architect",
    label: "factory-wake-architect",
    issuedAt: world.now,
  };
  const checkpoint = applyLedgerEvent(
    architect,
    { type: "architect_session", initiativeId: "alpha", outcome: "checkpoint" },
    world,
  );
  assert.equal(checkpoint.reason, "architect_checkpoint");
  assert.equal(checkpoint.ledger.initiatives.alpha.session, "running");
  assert.equal(checkpoint.ledger.initiatives.alpha.dispatch?.label, "factory-wake-architect");
  assert.equal(checkpoint.ledger.initiatives.alpha.revision, "rev-0");
  assert.equal(controlStep(checkpoint.ledger, world).wakes.some((wake) => wake.decision.effect === "wake_architect"), false);
  const ended = applyLedgerEvent(
    checkpoint.ledger,
    { type: "architect_session", initiativeId: "alpha", outcome: "continue", agentId: "bc-architect-1" },
    world,
  );
  assert.equal(ended.ledger.initiatives.alpha.session, "continuation_due");
  ended.ledger.executions = {
    "dsp-architect": {
      id: "dsp-architect",
      assignmentId: "asg-architect",
      role: "architect",
      phase: "completed",
      packetIds: ["alpha"],
      revisions: { alpha: "rev-0" },
      label: "factory-wake-architect",
      prHead: "head-a",
      agentId: "bc-architect-1",
      continuation: "fresh",
      issuedAt: world.now,
      startedAt: world.now,
      runningAt: world.now,
      endedAt: world.now,
      reserveUntil: "2026-10-30T15:00:00.000Z",
      startUntil: null,
      leaseUntil: null,
      reason: "execution_ended",
    },
  };
  const resumed = planContinuation({
    agentId: "bc-architect-1",
    runsOnAgent: 1,
    resumeSupported: true,
    contextSaturated: false,
  });
  assert.equal(resumed.mode, "resume");
  assert.equal(
    planContinuation({ agentId: null, runsOnAgent: 0, resumeSupported: true, contextSaturated: false }).mode,
    "fresh",
  );
  assert.equal(
    planContinuation({ agentId: "bc-architect-1", runsOnAgent: 4, resumeSupported: true, contextSaturated: false }).reason,
    "agent_run_cap",
  );
  const follow = followUpRequest("bc-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "Continue from the handoff.");
  assert.equal(follow.method, "POST");
  assert.equal(follow.url, "https://api.cursor.com/v1/agents/bc-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/runs");
  const unarmed = await cursorFollowUp({ env: {} }).send("bc-architect-1", "Continue");
  assert.equal(unarmed.reason, "continuation_unavailable");
  const scopeDecision = decideScope(ended.ledger, { ...world, resumeSupported: true });
  assert.equal(scopeDecision.reason, "architect_resume");
  assert.equal(scopeDecision.label, null);
  assert.equal(scopeDecision.agentId, "bc-architect-1");

  const engineering = emptyLedger(4);
  const first = changeSpecified("pkt-003-resume-same-run");
  const second = changeSpecified("pkt-004-firing-handle");
  engineering.packets = { [first.id]: first, [second.id]: second };
  const opened = controlStep(engineering, world);
  assert.equal(opened.wakes.filter((wake) => wake.decision.effect === "wake_engineer").length, 1);
  const engineerStore = new MemoryStore(engineering);
  const engineerWake = await dispatchWake({
    store: engineerStore,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], []),
    packetId: first.id,
    prHead: "head-eng",
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: null,
  });
  assert.equal(engineerWake.reason, "dispatched");
  const refused = await commitEvent(
    engineerStore,
    first.id,
    { type: "refuse_execution", workerId: "bc-engineer" },
    world,
  );
  assert.equal(refused.reason, "execution_refused");
  const afterRefuse = await engineerStore.read();
  assert.equal(afterRefuse.packets[first.id].dispatch, null);
  assert.equal(afterRefuse.packets[first.id].dispatchedEngineerRevision, null);
  assert.equal(afterRefuse.packets[first.id].stage, "change_specified");
  assert.equal(Object.values(afterRefuse.executions ?? {})[0]?.phase, "refused");
  assert.equal(afterRefuse.packets[first.id].dispatchHistory.at(-1)?.workerExecution, "absent");
  const nextEngineer = controlStep(afterRefuse, world);
  assert.equal(nextEngineer.wakes.filter((wake) => wake.decision.effect === "wake_engineer").length, 1);
  assert.notEqual(nextEngineer.wakes.find((wake) => wake.decision.effect === "wake_engineer")?.id, undefined);
  const planted = changeSpecified("pkt-002-open-ask-cursor");
  planted.stage = "candidate";
  planted.candidateSha = "3246a074efecd8adb98e4ca232d443b90821173f";
  planted.dispatchedEngineerRevision = planted.revision;
  const kept = applyEvent(planted, { type: "refuse_execution", workerId: "bc-engineer" }, world);
  assert.equal(kept.reason, "candidate_recorded");
  assert.equal(kept.item.candidateSha, planted.candidateSha);
  const mismatch = applyEvent(
    planted,
    { type: "record_candidate_checks", sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", checks: [{ name: "ship", runId: "1", outcome: "pass" }] },
    world,
  );
  assert.equal(mismatch.reason, "sha_mismatch");
  assert.equal(mismatch.item.stage, "candidate");
  const failedCheck = applyEvent(
    planted,
    { type: "record_candidate_checks", sha: planted.candidateSha as string, checks: [{ name: "ship", runId: "1", outcome: "fail" }] },
    world,
  );
  assert.equal(failedCheck.reason, "verification_failed");
  assert.equal(failedCheck.item.verifiedSha, null);
  const verified = must(
    applyEvent(
      planted,
      { type: "record_candidate_checks", sha: planted.candidateSha as string, checks: [{ name: "ship", runId: "1", outcome: "pass" }] },
      world,
    ),
    "verified",
  );
  assert.equal(verified.verifiedSha, planted.candidateSha);

  const stale = emptyLedger(4);
  const abandoned = changeSpecified("pkt-stale");
  abandoned.dispatchedEngineerRevision = abandoned.revision;
  abandoned.dispatch = {
    packetId: abandoned.id,
    revision: abandoned.revision,
    prHead: "head-stale",
    effect: "wake_engineer",
    label: "factory-wake-engineer",
    issuedAt: "2026-10-30T10:00:00.000Z",
  };
  stale.packets = { [abandoned.id]: abandoned, [second.id]: changeSpecified(second.id) };
  stale.usedDispatches = 1;
  const recovered = recoverExecutions(stale, "2026-10-30T12:00:00.000Z");
  assert.equal(recovered.changes[0]?.phase, "refused");
  assert.equal(recovered.changes[0]?.reason, "reservation_expired");
  assert.equal(recovered.ledger.packets[abandoned.id].dispatchedEngineerRevision, null);
  assert.equal(recovered.ledger.packets[abandoned.id].dispatch, null);
  assert.equal(recovered.ledger.usedDispatches, 1);
  assert.equal(controlStep(recovered.ledger, world).wakes.some((wake) => wake.decision.effect === "wake_engineer"), true);

  const running = changeSpecified("pkt-leased");
  running.stage = "engineering";
  running.lease = { workerId: "bc-engineer", role: "engineer", until: "2026-10-30T12:30:00.000Z", revision: running.revision };
  running.dispatchedEngineerRevision = running.revision;
  running.dispatch = {
    packetId: running.id,
    revision: running.revision,
    prHead: "head-lease",
    effect: "wake_engineer",
    label: "factory-wake-engineer",
    issuedAt: "2026-10-30T11:00:00.000Z",
    executionId: "dsp-leased",
  };
  const leasedLedger = emptyLedger(4);
  leasedLedger.packets = { [running.id]: running };
  leasedLedger.executions = {
    "dsp-leased": {
      id: "dsp-leased",
      assignmentId: "asg-leased",
      role: "engineer",
      phase: "running",
      packetIds: [running.id],
      revisions: { [running.id]: running.revision },
      label: "factory-wake-engineer",
      prHead: "head-lease",
      agentId: "bc-engineer",
      continuation: "fresh",
      issuedAt: "2026-10-30T11:00:00.000Z",
      startedAt: "2026-10-30T11:05:00.000Z",
      runningAt: "2026-10-30T11:05:00.000Z",
      endedAt: null,
      reserveUntil: "2026-10-30T11:30:00.000Z",
      startUntil: "2026-10-30T11:20:00.000Z",
      leaseUntil: "2026-10-30T12:30:00.000Z",
      reason: null,
    },
  };
  const interrupted = recoverExecutions(leasedLedger, "2026-10-30T13:00:00.000Z");
  assert.equal(interrupted.changes[0]?.phase, "interrupted");
  assert.equal(interrupted.changes[0]?.reason, "lease_expired");
  assert.equal(interrupted.ledger.packets[running.id].lease, null);
  assert.equal(interrupted.ledger.packets[running.id].dispatchedEngineerRevision, null);
  assert.equal(interrupted.ledger.executions?.["dsp-leased"].phase, "interrupted");

  const pressured = emptyLedger(4);
  pressured.packets = { [first.id]: changeSpecified("pkt-a"), [second.id]: changeSpecified("pkt-b") };
  pressured.initiatives.alpha = freshInitiative({
    id: "alpha",
    module: "test",
    capability: "alpha",
    entry: "Operator → test → alpha",
    obligation: "Continue alpha",
    priority: 1,
    now: world.now,
  });
  pressured.initiatives.alpha.queue = "active";
  pressured.initiatives.alpha.session = "continuation_due";
  assert.equal(productionPressure(Object.values(pressured.packets)).holdArchitect, true);
  const held = controlStep(pressured, world);
  assert.equal(held.wakes.some((wake) => wake.decision.effect === "wake_architect"), false);
  assert.equal(held.wakes.some((wake) => wake.decision.effect === "wake_engineer"), true);
  const metrics = productionMetrics(interrupted.ledger);
  assert.equal(metrics.costPerAcceptedPacket, null);
  assert.equal(metrics.refusedOrFailedLaunches, 0);
  assert.equal(metrics.trackedFreshLaunches, 1);
  const withUsage = structuredClone(interrupted.ledger);
  const row = Object.values(withUsage.executions ?? {})[0];
  row.usageUsd = 2;
  withUsage.packets[running.id].stage = "accepted";
  assert.equal(productionMetrics(withUsage).costPerAcceptedPacket, 2);
});

check("resume_scope keeps the cap and the backlog still holds the architect", () => {
  const world: World = { ...active, now: "2026-10-30T18:00:00.000Z", authorizedDispatches: 50, usedDispatches: 31 };
  const ledger = emptyLedger(50);
  ledger.usedDispatches = 31;
  const suspended = applyLedgerEvent(ledger, { type: "suspend", reason: "repair" }, world);
  assert.equal(suspended.reason, "suspended");
  const raised = applyLedgerEvent(
    suspended.ledger,
    { type: "resume_scope", reason: "downstream lanes", authorizedDispatches: 51 },
    world,
  );
  assert.equal(raised.reason, "cap_changed");
  assert.equal(raised.ledger.authorizedDispatches, 50);
  assert.equal(raised.ledger.scope.status, "suspended");
  const resumed = applyLedgerEvent(
    suspended.ledger,
    { type: "resume_scope", reason: "downstream lanes", authorizedDispatches: 50 },
    world,
  );
  assert.equal(resumed.reason, "scope_resumed");
  assert.equal(resumed.ledger.scope.status, "active");
  assert.equal(resumed.ledger.authorizedDispatches, 50);
  assert.equal(resumed.ledger.usedDispatches, 31);
  resumed.ledger.packets["pkt-a"] = changeSpecified("pkt-a");
  resumed.ledger.packets["pkt-b"] = changeSpecified("pkt-b");
  resumed.ledger.initiatives.alpha = freshInitiative({
    id: "alpha",
    module: "test",
    capability: "alpha",
    entry: "Operator → test → alpha",
    obligation: "Continue alpha",
    priority: 1,
    now: world.now,
  });
  resumed.ledger.initiatives.alpha.queue = "active";
  resumed.ledger.initiatives.alpha.session = "continuation_due";
  const step = controlStep(resumed.ledger, world);
  assert.equal(step.wakes.some((wake) => wake.decision.effect === "wake_architect"), false);
  assert.equal(step.wakes.some((wake) => wake.decision.effect === "wake_engineer"), true);
  const laned = applyLedgerEvent(
    suspended.ledger,
    { type: "resume_scope", reason: "engineer lane", authorizedDispatches: 50, lanes: ["engineer"] },
    world,
  );
  assert.equal(laned.reason, "scope_resumed");
  assert.deepEqual(laned.ledger.scope.lanes, ["engineer"]);
  laned.ledger.packets["pkt-a"] = changeSpecified("pkt-a");
  laned.ledger.packets["pkt-r"] = must(
    applyEvent(freshItem("pkt-r", "alpha"), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
    "released",
  );
  const heldLane = controlStep(laned.ledger, world);
  assert.equal(heldLane.wakes.some((wake) => wake.decision.effect === "wake_sa"), false);
  assert.equal(heldLane.wakes.some((wake) => wake.decision.effect === "wake_architect"), false);
  assert.equal(heldLane.wakes.some((wake) => wake.decision.effect === "wake_engineer"), true);
  const suspendedBind = emptyLedger(50);
  suspendedBind.scope.status = "suspended";
  suspendedBind.packets["pkt-003-resume-same-run"] = changeSpecified("pkt-003-resume-same-run");
  const refusedBind = prepareBoundEngineer(suspendedBind, {
    packetId: "pkt-003-resume-same-run",
    workerId: "bc-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    prHead: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    now: "2026-10-30T18:00:00.000Z",
  });
  assert.equal(refusedBind.ok, false);
  const activeBind = emptyLedger(50);
  activeBind.usedDispatches = 31;
  activeBind.packets["pkt-003-resume-same-run"] = changeSpecified("pkt-003-resume-same-run");
  const bound = prepareBoundEngineer(activeBind, {
    packetId: "pkt-003-resume-same-run",
    workerId: "bc-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    prHead: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    now: "2026-10-30T18:00:00.000Z",
  });
  assert.equal(bound.ok, true);
  if (bound.ok) {
    const row = bound.ledger.packets["pkt-003-resume-same-run"];
    assert.equal(row.stage, "engineering");
    assert.equal(row.lease?.workerId, "bc-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    assert.equal(bound.ledger.usedDispatches, 32);
    assert.equal(bound.ledger.authorizedDispatches, 50);
    const execution = Object.values(bound.ledger.executions ?? {}).find((item) => item.packetIds.includes(row.id));
    assert.equal(execution?.phase, "running");
    assert.equal(execution?.delivery, "bound");
    assert.equal(execution?.agentId, "bc-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    assert.equal(execution?.startedAt, "2026-10-30T18:00:00.000Z");
  }
});

check("a worker keeps one agent and a release is a verified dependency set", async () => {
  const world: World = { ...active, now: "2026-10-31T12:00:00.000Z", authorizedDispatches: 8, usedDispatches: 0, resumeSupported: true };
  function released(id: string): WorkItem {
    return must(
      applyEvent(freshItem(id, "exec-identity"), { type: "release", wake: "sa", gatesPass: true, revision: "rev-1" }, active),
      "released",
    );
  }
  const link = { basis: "component" as const, note: "one component" };
  const ids = ["pkt-a", "pkt-b", "pkt-c", "pkt-d"];
  const rows = ids.map((id) => released(id));
  for (const row of rows) {
    row.siblings = rows.filter((other) => other.id !== row.id).map((other) => ({ id: other.id, ...link }));
  }
  const ledger = emptyLedger(8);
  ledger.packets = Object.fromEntries(rows.map((row) => [row.id, row]));
  const batch = analystAssignment(Object.values(ledger.packets));
  assert.deepEqual(batch?.packetIds, ids);
  const step = controlStep(ledger, world);
  const analysts = step.wakes.filter((wake) => wake.decision.effect === "wake_sa");
  assert.equal(analysts.length, 1);
  assert.deepEqual(analysts[0].packetIds, ids);

  const specified = rows.map((row) => {
    const next = structuredClone(row);
    next.stage = "change_specified";
    next.dispatchedSaRevision = "rev-1";
    return next;
  });
  const engineering = emptyLedger(8);
  engineering.packets = Object.fromEntries(specified.map((row) => [row.id, row]));
  const engineer = engineerAssignment(Object.values(engineering.packets));
  assert.deepEqual(engineer?.packetIds, ids);
  const engineerStep = controlStep(engineering, world);
  const engineers = engineerStep.wakes.filter((wake) => wake.decision.effect === "wake_engineer");
  assert.equal(engineers.length, 1);
  assert.deepEqual(engineers[0].packetIds, ids);

  const calls: string[] = [];
  const resumed: string[] = [];
  engineering.executions = {
    "dsp-old": {
      id: "dsp-old",
      assignmentId: "asg-old",
      role: "engineer",
      phase: "refused",
      packetIds: ["pkt-a"],
      revisions: { "pkt-a": "rev-1" },
      label: "factory-wake-engineer",
      prHead: "head-old",
      agentId: "bc-engineer-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      continuation: "fresh",
      issuedAt: "2026-10-31T11:00:00.000Z",
      startedAt: "2026-10-31T11:01:00.000Z",
      runningAt: null,
      endedAt: "2026-10-31T11:02:00.000Z",
      reserveUntil: "2026-10-31T11:30:00.000Z",
      startUntil: null,
      leaseUntil: null,
      reason: "worker_refused",
    },
  };
  const store = new MemoryStore(engineering);
  const plan = planPacketContinuation({
    ledger: engineering,
    role: "engineer",
    packetIds: ids,
    resumeSupported: true,
  });
  assert.equal(plan.mode, "resume");
  assert.equal(plan.agentId, "bc-engineer-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
  const woke = await dispatchWake({
    store,
    actuator: scriptedActuator([{ ok: true, reason: "labeled" }], calls),
    packetId: "pkt-a",
    packetIds: ids,
    prHead: "head-next",
    activation: "active",
    now: world.now,
    engineeringBusy: false,
    budgetUsd: null,
    resumeSupported: true,
    resume: async (agentId) => {
      resumed.push(agentId);
      return { ok: true, reason: "resumed" };
    },
  });
  assert.equal(woke.reason, "resumed");
  assert.deepEqual(calls, []);
  assert.deepEqual(resumed, ["bc-engineer-aaaa-4aaa-8aaa-aaaaaaaaaaaa"]);
  const saved = await store.read();
  assert.equal(saved.usedDispatches, 1);
  const executionId = saved.packets["pkt-a"].dispatch?.executionId as string;
  const worker = "bc-engineer-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const until = "2026-10-31T13:00:00.000Z";
  const leasedFirst = await commitEvent(
    store,
    "pkt-a",
    { type: "acquire_lease", workerId: worker, role: "engineer", until, revision: "rev-1" },
    world,
  );
  assert.equal(leasedFirst.reason, "lease_acquired");
  const first = await commitEvent(
    store,
    "pkt-a",
    { type: "commit_candidate", sha: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", revision: "rev-1", workerId: worker },
    world,
  );
  assert.equal(first.reason, "candidate");
  const mid = await store.read();
  assert.equal(mid.executions?.[executionId]?.phase, "running");
  assert.equal(mid.packets["pkt-b"].stage, "change_specified");
  for (const id of ["pkt-b", "pkt-c", "pkt-d"]) {
    const leased = await commitEvent(
      store,
      id,
      { type: "acquire_lease", workerId: worker, role: "engineer", until, revision: "rev-1" },
      world,
    );
    assert.equal(leased.reason, "lease_acquired");
    const recorded = await commitEvent(
      store,
      id,
      { type: "commit_candidate", sha: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", revision: "rev-1", workerId: worker },
      world,
    );
    assert.equal(recorded.reason, "candidate");
  }
  const done = await store.read();
  assert.equal(done.executions?.[executionId]?.phase, "completed");
  assert.equal(done.executions?.[executionId]?.reason, "candidate_recorded");

  const saturated = structuredClone(engineering);
  saturated.packets = Object.fromEntries(specified.map((row) => [row.id, structuredClone(row)]));
  saturated.executions = {
    "dsp-full": {
      id: "dsp-full",
      assignmentId: "asg-full",
      role: "analyst",
      phase: "completed",
      packetIds: ids,
      revisions: Object.fromEntries(ids.map((id) => [id, "rev-1"])),
      label: "factory-wake-sa",
      prHead: "head-sa",
      agentId: "bc-analyst-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      continuation: "fresh",
      issuedAt: "2026-10-31T10:00:00.000Z",
      startedAt: "2026-10-31T10:01:00.000Z",
      runningAt: null,
      endedAt: "2026-10-31T10:05:00.000Z",
      reserveUntil: "2026-10-31T10:30:00.000Z",
      startUntil: null,
      leaseUntil: null,
      reason: "context_saturated",
    },
  };
  const analystPlan = planPacketContinuation({
    ledger: saturated,
    role: "analyst",
    packetIds: ids,
    resumeSupported: true,
  });
  assert.equal(analystPlan.mode, "resume");
  assert.equal(analystPlan.limit, 3);
  const limited = analystAssignment(rows, { limit: analystPlan.limit });
  assert.equal(limited?.packetIds.length, 3);

  function verified(id: string, sha: string): WorkItem {
    const item = freshItem(id, "exec-identity");
    item.stage = "verified";
    item.verifiedSha = sha;
    item.candidateSha = sha;
    return item;
  }
  const alone = verified("pkt-002-open-ask-cursor", "3246a074efecd8adb98e4ca232d443b90821173f");
  const haltA = verified("pkt-015-halt-enroll-firm", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  const haltB = verified("pkt-016-halt-send-firm", "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
  haltA.siblings = [{ id: haltB.id, basis: "dependency", note: "halt chain" }];
  const waiting = verified("pkt-017-tick-send-halt", "cccccccccccccccccccccccccccccccccccccccc");
  waiting.stage = "change_specified";
  waiting.verifiedSha = null;
  haltB.siblings = [
    { id: haltA.id, basis: "dependency", note: "halt chain" },
    { id: waiting.id, basis: "dependency", note: "halt chain" },
  ];
  const held = readyReleases([alone, haltA, haltB, waiting]);
  assert.deepEqual(held.map((release) => release.packetIds), [["pkt-002-open-ask-cursor"]]);
  waiting.stage = "verified";
  waiting.verifiedSha = "cccccccccccccccccccccccccccccccccccccccc";
  const chain = readyReleases([alone, haltA, haltB, waiting]);
  assert.deepEqual(
    chain.map((release) => release.id),
    [
      "rel-pkt-002-open-ask-cursor",
      "rel-pkt-015-halt-enroll-firm--pkt-016-halt-send-firm--pkt-017-tick-send-halt",
    ],
  );
  const recorded = applyLedgerEvent(
    emptyLedger(8),
    {
      type: "record_release",
      id: chain[0].id,
      packetIds: chain[0].packetIds,
      prNumber: 200,
      prUrl: "https://github.com/bywale-com/omcoda_tower/pull/200",
      openedAt: world.now,
    },
    world,
  );
  recorded.ledger.packets[alone.id] = alone;
  const opened = applyLedgerEvent(
    recorded.ledger,
    {
      type: "record_release",
      id: chain[0].id,
      packetIds: chain[0].packetIds,
      prNumber: 200,
      prUrl: "https://github.com/bywale-com/omcoda_tower/pull/200",
      openedAt: world.now,
    },
    world,
  );
  assert.equal(opened.reason, "release_recorded");
  const missingSha = applyLedgerEvent(
    opened.ledger,
    { type: "conclude_release", id: chain[0].id, mergeSha: "", reconciliationId: "pr-200" },
    world,
  );
  assert.equal(missingSha.reason, "integration_evidence_missing");
  const concluded = applyLedgerEvent(
    opened.ledger,
    {
      type: "conclude_release",
      id: chain[0].id,
      mergeSha: "dddddddddddddddddddddddddddddddddddddddd",
      reconciliationId: "pr-200-dddddddddddddddddddddddddddddddddddddddd",
    },
    world,
  );
  assert.equal(concluded.reason, "release_concluded");
  assert.equal(concluded.ledger.packets[alone.id].stage, "accepted");
  assert.equal(concluded.ledger.packets[alone.id].integratedSha, "dddddddddddddddddddddddddddddddddddddddd");
  const emerge = read("scripts/factory-emerge.ts");
  assert.equal(emerge.includes("gh pr merge"), false);
  assert.match(emerge, /mail_unconfigured/);
  assert.match(emerge, /"fetch", "--depth=2", "origin"/);
  assert.match(read(".github/workflows/factory-dispatch.yml"), /scripts\/factory-emerge\.ts --apply/);
});

const failures: string[] = [];
for (const item of queue) {
  try {
    await item.fn();
    passed += 1;
    console.log(`ok  ${item.name}`);
  } catch (error) {
    failures.push(item.name);
    console.error(`fail ${item.name}`);
    console.error(error);
  }
}
if (failures.length) {
  console.error(`\n${failures.length} failed, ${passed} passed`);
  process.exit(1);
}
console.log(`\n${passed} checks passed`);
