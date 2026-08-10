/**
 * Trial modular → control pairs against stand-in machineApi.
 * Each check: mutate via the same API the surface calls → list must hold the new value.
 */
import { standInMachineApi } from "../src/app/wire/standins/machineApi";

async function assert(label: string, cond: boolean, detail?: string) {
  if (!cond) throw new Error(`FAIL · ${label}${detail ? ` · ${detail}` : ""}`);
  console.log(`PASS · ${label}${detail ? ` · ${detail}` : ""}`);
}

async function trialEligibilityPipeline() {
  const before = await standInMachineApi.listEligibilityPipeline();
  await assert("pipeline loaded", before.length >= 2, `${before.length} stages`);
  const reversed = [...before]
    .reverse()
    .map((row, index) => ({ id: row.id, token: row.token, label: row.label, ord: index }));
  const saved = await standInMachineApi.upsertEligibilityPipeline(reversed);
  const tokens = saved.map((s) => s.token).join(",");
  const expected = reversed.map((s) => s.token).join(",");
  await assert("seq_eligibility_pipeline reorder", tokens === expected, tokens);
  // restore seed order
  await standInMachineApi.upsertEligibilityPipeline(
    before.map((row, index) => ({ id: row.id, token: row.token, label: row.label, ord: index })),
  );
}

async function trialMotionPrecedence() {
  const rows = await standInMachineApi.listMotionPrecedence();
  await assert("motion loaded", rows.length >= 1, `${rows.length} rows`);
  const target = rows[0];
  const flipped = !target.enabled;
  const updated = await standInMachineApi.upsertMotionPrecedence(target.id, { enabled: flipped });
  await assert(
    "rule_motion_precedence enable",
    updated.enabled === flipped,
    `${target.id}=${String(flipped)}`,
  );
  if (rows.length >= 2) {
    const reordered = [...rows]
      .reverse()
      .map((row, index) => ({ ...row, ord: index }));
    for (const row of reordered) {
      await standInMachineApi.upsertMotionPrecedence(row.id, { ord: row.ord });
    }
    const after = await standInMachineApi.listMotionPrecedence();
    await assert(
      "rule_motion_precedence ord",
      after[0]?.id === reordered[0]?.id,
      after.map((r) => r.id).join(" → "),
    );
  }
  await standInMachineApi.upsertMotionPrecedence(target.id, { enabled: target.enabled });
}

async function trialReferencePersist() {
  const key = "cec.min_hours";
  const edited = 1601;
  const result = await standInMachineApi.upsertReference({
    id: "ref.reference.immigration.local",
    key: "reference.immigration",
    version: 101,
    payload: {
      industry: "immigration",
      rows: [{ key, label: "CEC minimum skilled hours", value: edited, type: "number" }],
    },
  });
  const stored = (await standInMachineApi.listReferenceVersions()).find(
    (v) => v.id === result.referenceId,
  );
  const rows = Array.isArray(stored?.payload?.rows)
    ? (stored!.payload.rows as Array<{ key: string; value: unknown }>)
    : [];
  await assert(
    "reference_versions.payload.rows value",
    rows.find((r) => r.key === key)?.value === edited,
    `${key}=${edited}`,
  );
}

async function trialChannelAndPhase() {
  const channels = await standInMachineApi.listChannelOrder();
  if (channels.length >= 2) {
    const flipped = [...channels]
      .reverse()
      .map((row, index) => ({ id: row.id, token: row.token, label: row.label, ord: index }));
    const saved = await standInMachineApi.upsertChannelOrder(flipped);
    await assert(
      "seq_channel_ownership_order",
      saved[0]?.id === flipped[0]?.id,
      saved.map((r) => r.token).join(" → "),
    );
  }
  const phases = await standInMachineApi.listPhaseOrder();
  if (phases.length >= 2) {
    const flipped = [...phases]
      .reverse()
      .map((row, index) => ({ id: row.id, token: row.token, label: row.label, ord: index }));
    const saved = await standInMachineApi.upsertPhaseOrder(flipped);
    await assert(
      "seq_phase_order",
      saved[0]?.id === flipped[0]?.id,
      saved.map((r) => r.token).join(" → "),
    );
  }
}

async function trialCohortAndMetrics() {
  const cohort = await standInMachineApi.listCohortScoring();
  if (cohort[0]) {
    const next = `${cohort[0].set_value ?? "tier"}-trial`;
    const updated = await standInMachineApi.upsertCohortScoring(cohort[0].id, { setValue: next });
    await assert("rule_cohort_scoring set_value", updated.set_value === next, next);
  }
  const metrics = await standInMachineApi.listMetricsThresholds();
  if (metrics[0]) {
    const next = (metrics[0].threshold ?? 0) + 3;
    const updated = await standInMachineApi.upsertMetricsThreshold(metrics[0].id, {
      threshold: next,
    });
    await assert("rule_metrics_thresholds threshold", updated.threshold === next, String(next));
  }
}

async function trialEvaluationPin() {
  const pin = await standInMachineApi.putEvaluationPin("pack-trial", {
    referenceVersionId: "ref.crs.cutoff.v1",
    rulesetId: "ruleset.trial",
  });
  const got = await standInMachineApi.getEvaluationPin("pack-trial");
  await assert(
    "constants_packs eval pin",
    got.referenceVersionId === pin.referenceVersionId && got.rulesetId === pin.rulesetId,
    `${got.referenceVersionId}+${got.rulesetId}`,
  );
}

async function trialCampaignState() {
  await standInMachineApi.setCampaignState("running");
  const got = await standInMachineApi.getCampaignState();
  await assert("campaign_states", got.state === "running", got.state);
  await standInMachineApi.setCampaignState("armed-for-activation");
}

async function main() {
  await trialEligibilityPipeline();
  await trialMotionPrecedence();
  await trialReferencePersist();
  await trialChannelAndPhase();
  await trialCohortAndMetrics();
  await trialEvaluationPin();
  await trialCampaignState();
  console.log("ALL MODULAR SURFACE TRIALS PASSED");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
