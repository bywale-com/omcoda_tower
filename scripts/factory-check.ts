/**
 * Deterministic factory check. No database, no Cursor, no GitHub writes.
 * Run: npm run factory:check
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
import { markReleased } from "../.factory/controller/release.ts";
import { headMatchesDispatch } from "../.factory/controller/wake.ts";
import {
  applyLedgerEvent,
  commitLedgerEvent,
  controlStep,
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
  assert.match(engineer, /packetId, revision, and prHead/);
  assert.match(engineer, /scripts\/factory-wake-check\.ts factory-wake-engineer/);
  assert.match(engineer, /scripts\/factory-wake-check\.ts factory-repair/);
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
  const spy: GhRun = async (args, childEnv) => {
    spawned += 1;
    assert.equal(childEnv.GH_TOKEN, "wake-token");
    assert.equal(childEnv.GITHUB_TOKEN, "wake-token");
    assert.deepEqual(args, labelEditArgs(136, "factory-wake-sa"));
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
  assert.equal(spawned, 1);
  const failedAdd = await githubLabelActuator({
    env: {
      FACTORY_CONTROLLER: "active",
      FACTORY_LABELS: "armed",
      WAKE_GITHUB_TOKEN: "wake-token",
      FACTORY_SPEND_LIMIT_CONFIRMED: "yes",
      FACTORY_AUTOMATIONS_SAVED: "yes",
    },
    pr: 136,
    runGh: async () => ({ status: 1, stdout: "", stderr: "denied" }),
  }).add(labelInput);
  assert.equal(failedAdd.reason, "label_add_failed");
  assert.deepEqual(labelEditArgs(136, "factory-wake-sa"), ["pr", "edit", "136", "--add-label", "factory-wake-sa"]);
  const applyScript = read("scripts/factory-dispatch-apply.ts");
  assert.match(applyScript, /dispatch_not_authorized/);
  assert.match(read(".factory/controller/dispatch.ts"), /not shared by separate GitHub Actions runners/);

  const committed = JSON.parse(read(".factory/state/ledger.json"));
  assert.equal(committed.authorizedDispatches, 4);
  assert.equal(committed.usedDispatches, 0);
  assert.equal(committed.stateRevision, 6);
  assert.equal(committed.scope.id, "agents-and-automations");
  assert.equal(committed.scope.status, "active");
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
  const released = markReleased("**Wake:** hold\n", {
    gates: { behaviorEstablished: true, scopeBounded: true },
  });
  assert.equal(released.ok, true);
  if (released.ok) {
    assert.match(released.markdown, /\*\*Wake:\*\* sa/);
    assert.equal(released.manifest.wake, "sa");
    assert.equal(released.manifest.release, "released");
  }
});

check("the committed scope is agents-and-automations and PKT-001 stays manual", () => {
  const committed = JSON.parse(read(".factory/state/ledger.json")) as FactoryLedger;
  const view = projectFactory(committed);
  assert.equal(view.scope.id, "agents-and-automations");
  assert.equal(view.scope.status, "active");
  assert.deepEqual(view.scope.modules, ["Agents and Automations"]);
  assert.equal(view.stateRevision, 6);
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
  assert.equal(execIdentity?.queue, "eligible");
  assert.equal(execIdentity?.packetIds[0], "pkt-001-click-attribution");
  assert.equal(launch?.queue, "discovered");
  assert.deepEqual(launch?.dependsOn, ["exec-identity"]);
  assert.equal(moduleComplete(committed, "Agents").reason, "coverage_open");
  assert.equal(moduleComplete(committed, "Agents and Automations").reason, "coverage_open");
  const step = controlStep(committed, { ...cycleWorld, activation: "active" });
  assert.equal(step.wakes.length, 1);
  assert.equal(step.wakes[0].id, "exec-identity");
  assert.equal(step.wakes[0].decision.label, "factory-wake-architect");
  assert.equal(step.wakes.some((wake) => wake.id === "pkt-001-click-attribution"), false);
  assert.equal(committed.packets["pkt-001-click-attribution"].execution?.mode, "manual");
  assert.equal(committed.authorizedDispatches, 4);
  assert.equal(committed.usedDispatches, 0);
  assert.equal(committed.initiatives["exec-identity"].dispatch, null);
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
  assert.equal(proposed.reason, "architect_due");
  assert.equal(proposed.wakes.length, 1);
  assert.equal(proposed.wakes[0].id, "exec-identity");
  assert.equal(proposed.wakes[0].effect, "wake_architect");
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
  assert.equal(committed.scope.status, "active");
  assert.equal(committed.scope.id, "agents-and-automations");
  assert.equal(committed.authorizedDispatches, 4);
  assert.equal(committed.usedDispatches, 0);
  assert.equal(committed.initiatives["exec-identity"].dispatch, null);
  assert.equal(committed.packets["pkt-001-click-attribution"].execution?.mode, "manual");
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
