/**
 * Deterministic factory check. No database, no Cursor, no GitHub writes.
 * Run: npm run factory:check
 */
import assert from "node:assert/strict";
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
  FileStore,
  MemoryStore,
  commitEvent,
  dispatchWake,
  emptyLedger,
  githubLabelActuator,
  labelEditArgs,
  scriptedActuator,
} from "../.factory/controller/dispatch.ts";
import {
  clickMatchesEnrollment,
  enrollmentForClick,
  type PursuitEnrollment,
  type PursuitMessage,
} from "../.factory/experiments/click-attribution.ts";

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
  assert.equal(factory.labelActuator, "not_wired");
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

check("dispatch workflow cannot boot from a pull request or a schedule", () => {
  const workflow = read(".github/workflows/factory-dispatch.yml");
  assert.equal(workflow.includes("pull_request:"), false);
  assert.equal(workflow.includes("schedule:"), false);
  assert.ok(workflow.includes("workflow_dispatch:"));
  assert.ok(workflow.includes("I_AUTHORIZE_FACTORY_DISPATCH"));
  assert.ok(workflow.includes("label actuator is not wired"));
});

check("seat prompts keep the Travis gates that stopped empty boots", () => {
  const architect = read("docs/factory/prompts/architect.prompt.md");
  const analyst = read("docs/factory/prompts/systems-analyst.prompt.md");
  const engineer = read("docs/factory/prompts/engineer.prompt.md");
  assert.match(architect, /Checkpoint does not end the session/);
  assert.match(architect, /Do not edit docs\/specification-pass\//);
  assert.match(architect, /You must not set \*\*Wake:\*\* sa unless the founder has authorized factory dispatch/);
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
  assert.match(engineer, /packetId, revision, and prHead/);
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

  const disabled = await githubLabelActuator({}).add({
    label: "factory-wake-sa",
    packetId,
    revision: "rev-1",
    prHead,
  });
  assert.equal(disabled.reason, "actuator_disabled");
  const armed = await githubLabelActuator({
    FACTORY_CONTROLLER: "active",
    FACTORY_LABELS: "armed",
    WAKE_GITHUB_TOKEN: "present",
  }).add({ label: "factory-wake-sa", packetId, revision: "rev-1", prHead });
  assert.equal(armed.reason, "actuator_not_connected");
  assert.deepEqual(labelEditArgs(136, "factory-wake-sa"), ["pr", "edit", "136", "--add-label", "factory-wake-sa"]);

  const committed = JSON.parse(read(".factory/state/ledger.json"));
  assert.equal(committed.authorizedDispatches, null);
  assert.equal(committed.usedDispatches, 0);
  assert.equal(committed.packets[packetId].stage, "draft");
  assert.equal(committed.packets[packetId].wake, "hold");
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
