/**
 * Left→right trial: every modular (non-wall, non-deferred) fact the CT surface writes
 * must land in the stand-in table via the same API the UI calls.
 * Cascade/UI copy alone never counts.
 */
import { standInMachineApi, getStandInBookSnapshot } from "../src/app/wire/standins/machineApi";
import { standInHaltStore } from "../src/app/wire/standins/haltStore";
import { standInConsentSilence } from "../src/app/wire/standins/consentSilence";

async function assert(label: string, cond: boolean, detail?: string) {
  if (!cond) throw new Error(`FAIL · ${label}${detail ? ` · ${detail}` : ""}`);
  console.log(`PASS · ${label}${detail ? ` · ${detail}` : ""}`);
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

async function trialEligibilityPipeline() {
  const before = await standInMachineApi.listEligibilityPipeline();
  const reversed = [...before]
    .reverse()
    .map((row, index) => ({ id: row.id, token: row.token, label: row.label, ord: index }));
  const saved = await standInMachineApi.upsertEligibilityPipeline(reversed);
  await assert(
    "seq_eligibility_pipeline reorder",
    saved.map((s) => s.token).join(",") === reversed.map((s) => s.token).join(","),
    saved.map((s) => s.token).join(" → "),
  );
}

async function trialMotionPrecedence() {
  const rows = await standInMachineApi.listMotionPrecedence();
  const target = rows[0];
  const flipped = !target.enabled;
  const updated = await standInMachineApi.upsertMotionPrecedence(target.id, { enabled: flipped });
  await assert("rule_motion_precedence enable", updated.enabled === flipped, target.id);
  const reordered = [...rows].reverse().map((row, index) => ({ ...row, ord: index }));
  for (const row of reordered) {
    await standInMachineApi.upsertMotionPrecedence(row.id, { ord: row.ord });
  }
  const after = await standInMachineApi.listMotionPrecedence();
  await assert("rule_motion_precedence ord", after[0]?.id === reordered[0]?.id, after[0]?.id);
}

async function trialPathways() {
  const rows = await standInMachineApi.listEligibilityPathways();
  const target = rows.find((r) => r.enabled) ?? rows[0];
  const flipped = !target.enabled;
  const updated = await standInMachineApi.upsertEligibilityPathway(target.id, { enabled: flipped });
  await assert("rule_eligibility_pathway enable", updated.enabled === flipped, target.id);
  await standInMachineApi.upsertEligibilityPathway(target.id, { enabled: target.enabled });
}

async function trialFieldClass() {
  const rows = await standInMachineApi.listFieldClassRouting();
  const target = rows[0];
  const nextVal = `${target.set_value ?? "route"}-trial`;
  const enabled = await standInMachineApi.upsertFieldClassRouting(target.id, {
    enabled: !target.enabled,
  });
  await assert("rule_field_class_routing enable", enabled.enabled === !target.enabled, target.id);
  const valued = await standInMachineApi.upsertFieldClassRouting(target.id, { setValue: nextVal });
  await assert("rule_field_class_routing set_value", valued.set_value === nextVal, nextVal);
  await standInMachineApi.upsertFieldClassRouting(target.id, {
    enabled: target.enabled,
    setValue: target.set_value,
  });
}

async function trialReachability() {
  const rows = await standInMachineApi.listReachabilityChecks();
  const target = rows[0];
  const nextVal = `${target.set_value ?? "check"}-trial`;
  const enabled = await standInMachineApi.upsertReachabilityCheck(target.id, {
    enabled: !target.enabled,
  });
  await assert("rule_reachability_checks enable", enabled.enabled === !target.enabled, target.id);
  const valued = await standInMachineApi.upsertReachabilityCheck(target.id, { setValue: nextVal });
  await assert("rule_reachability_checks set_value", valued.set_value === nextVal, nextVal);
  await standInMachineApi.upsertReachabilityCheck(target.id, {
    enabled: target.enabled,
    setValue: target.set_value,
  });
}

async function trialAttemptCriteria() {
  const rows = await standInMachineApi.listAttemptCriteria();
  const target = rows.find((r) => r.threshold != null) ?? rows[0];
  const nextThreshold = (target.threshold ?? 30) + 5;
  const enabled = await standInMachineApi.upsertAttemptCriteria(target.id, {
    enabled: !target.enabled,
  });
  await assert("rule_attempt_criteria enable", enabled.enabled === !target.enabled, target.id);
  const th = await standInMachineApi.upsertAttemptCriteria(target.id, {
    threshold: nextThreshold,
  });
  await assert(
    "rule_attempt_criteria threshold",
    th.threshold === nextThreshold,
    String(nextThreshold),
  );
  await standInMachineApi.upsertAttemptCriteria(target.id, {
    enabled: target.enabled,
    threshold: target.threshold,
  });
}

async function trialChannelAndPhase() {
  const channels = await standInMachineApi.listChannelOrder();
  const flippedCh = [...channels]
    .reverse()
    .map((row, index) => ({ id: row.id, token: row.token, label: row.label, ord: index }));
  const savedCh = await standInMachineApi.upsertChannelOrder(flippedCh);
  await assert("seq_channel_ownership_order", savedCh[0]?.id === flippedCh[0]?.id, savedCh[0]?.token);

  const phases = await standInMachineApi.listPhaseOrder();
  const flippedPh = [...phases]
    .reverse()
    .map((row, index) => ({ id: row.id, token: row.token, label: row.label, ord: index }));
  const savedPh = await standInMachineApi.upsertPhaseOrder(flippedPh);
  await assert("seq_phase_order", savedPh[0]?.id === flippedPh[0]?.id, savedPh[0]?.token);
}

async function trialCohortAndMetrics() {
  const cohort = await standInMachineApi.listCohortScoring();
  const next = `${cohort[0].set_value ?? "tier"}-trial`;
  const updated = await standInMachineApi.upsertCohortScoring(cohort[0].id, { setValue: next });
  await assert("rule_cohort_scoring set_value", updated.set_value === next, next);

  const metrics = await standInMachineApi.listMetricsThresholds();
  const nextTh = (metrics[0].threshold ?? 0) + 3;
  const m = await standInMachineApi.upsertMetricsThreshold(metrics[0].id, { threshold: nextTh });
  await assert("rule_metrics_thresholds threshold", m.threshold === nextTh, String(nextTh));
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
}

async function trialWorkflowActivateAndRun() {
  const created = await standInMachineApi.createWorkflow({
    name: "Trial workflow",
    target: "contact",
    graph: {
      nodes: [
        {
          id: "t1",
          type: "trigger",
          data: { triggerKind: "manual", label: "Manual" },
        },
        {
          id: "a1",
          type: "action",
          data: { agentRef: "tpl.reactivation.v1", label: "Call agent" },
        },
      ],
      edges: [{ id: "e1", source: "t1", target: "a1" }],
    },
  });
  await assert("workflow create draft", created.status === "draft", created.id);
  const activated = await standInMachineApi.activateWorkflow(created.id);
  await assert(
    "workflow_state draft→active",
    activated.status === "active",
    activated.transition ?? activated.status,
  );
  const listed = (await standInMachineApi.listWorkflows()).find((w) => w.id === created.id);
  await assert("workflow list holds active", (listed as { status?: string })?.status === "active");

  const run = await standInMachineApi.startRun(created.id, "Manual run");
  await assert("workflow_run start", Boolean(run.id), run.id);
  const runs = await standInMachineApi.listRuns(created.id);
  await assert(
    "workflow_run list holds",
    runs.some((r) => r.id === run.id),
    run.id,
  );
}

async function trialTemplateAndBinding() {
  const cells = [
    { id: "c1", channel: "email", label: "Step 1", body: "Hello trial" },
    { id: "c2", channel: "text", label: "Step 2", body: "Ping" },
  ];
  const tpl = await standInMachineApi.upsertTemplate({
    id: "tpl.trial.v1",
    sequenceClass: "reactivation",
    label: "Trial template",
    cells,
  });
  await assert("sequence_template cells count", tpl.cells === cells.length, String(tpl.cells));
  const listed = await standInMachineApi.listTemplates();
  const stored = listed.templates.find((t: { id: string }) => t.id === "tpl.trial.v1") as
    | { cells?: unknown[] }
    | undefined;
  await assert(
    "sequence_template cells content",
    Array.isArray(stored?.cells) &&
      (stored!.cells[0] as { body?: string })?.body === "Hello trial",
    "Hello trial",
  );

  const bind = await standInMachineApi.upsertBinding({
    sequenceClass: "reactivation",
    templateId: "tpl.trial.v1",
    variableBindings: { firmName: "Cedar Pathways" },
  });
  await assert("firm_sequence_binding", bind.templateId === "tpl.trial.v1", bind.id);
  const binds = (await standInMachineApi.listTemplates()).bindings as Array<{
    template_id: string;
    variable_bindings?: Record<string, unknown>;
  }>;
  const storedBind = binds.find((b) => b.template_id === "tpl.trial.v1");
  await assert(
    "firm_sequence_binding variables",
    storedBind?.variable_bindings?.firmName === "Cedar Pathways",
    "Cedar Pathways",
  );
}

async function trialEnrollment() {
  const enr = await standInMachineApi.createEnrollment({
    contactId: "contact-trial-1",
    agentRef: "tpl.reactivation.v1",
    sequenceId: "tpl.trial.v1",
    payload: { source: "agents-launch-trial" },
  });
  await assert("enrollment create", Boolean(enr.id), enr.id);
  const board = await standInMachineApi.boardDetections();
  await assert(
    "enrollment list holds",
    board.enrollments.some((e) => e.id === enr.id && e.contact_id === "contact-trial-1"),
    enr.id,
  );
}

async function trialBookAudit() {
  const contactId = "contact-book-trial";
  const result = await standInMachineApi.createAuditRun({
    importIds: ["import-trial"],
    contactIds: [
      {
        id: contactId,
        email: "ada@example.com",
        phone: "+15551234567",
        name: "Ada Trial",
      },
    ],
  });
  await assert("audit_runs", result.id.startsWith("arun-") && result.status === "complete", result.id);
  const snap = getStandInBookSnapshot();
  await assert(
    "contact_records",
    snap.contact_records.some((c) => c.id === contactId && c.email === "ada@example.com"),
    contactId,
  );
  await assert(
    "reachability_verdicts",
    snap.reachability_verdicts.some((v) => v.contactId === contactId && v.verdict === "reachable"),
    "reachable",
  );
  await assert(
    "sequence_ready",
    snap.sequence_ready.some((r) => r.contactId === contactId && r.ready === true),
    "ready",
  );
  await assert(
    "audit_runs persist",
    snap.audit_runs.some((r) => r.id === result.id),
    result.id,
  );
}

async function trialPreparedWorkspace() {
  const row = await standInMachineApi.upsertPreparedWorkspace({
    id: "pw-trial",
    status: "staged",
    body: { firmLabel: "Cedar Pathways", templateId: "tpl.trial.v1" },
  });
  await assert("prepared_workspaces upsert", row.id === "pw-trial", row.id);
  const listed = await standInMachineApi.listPreparedWorkspaces();
  const stored = listed.find((r) => r.id === "pw-trial");
  await assert(
    "prepared_workspaces body",
    (stored?.body as { firmLabel?: string })?.firmLabel === "Cedar Pathways",
    "Cedar Pathways",
  );
}

async function trialHalt() {
  const record = await standInHaltStore.commit({
    consultantId: "consultant-trial",
    firmId: "firm-cedar",
    contactId: "contact-halt-1",
    scope: "contact",
    reason: "trial halt",
  });
  await assert("halt_records commit", Boolean(record.id) && !record.liftedAt, record.id);
  const active = await standInHaltStore.listActive("firm-cedar");
  await assert(
    "halt_records list active",
    active.some((h) => h.id === record.id),
    record.id,
  );
  const lifted = await standInHaltStore.lift(record.id);
  await assert("halt_records lift", Boolean(lifted?.liftedAt), lifted?.id ?? "");
}

async function trialConsent() {
  const contactId = "contact-consent-trial";
  await standInConsentSilence.setConsent(contactId, "firm-cedar", "express");
  let got = await standInConsentSilence.get(contactId);
  await assert("consent_records setConsent", got.basis === "express" && !got.silenced, got.basis);
  await standInConsentSilence.silence(contactId, "firm-cedar", "trial");
  got = await standInConsentSilence.get(contactId);
  await assert("consent_records silence", got.silenced === true, "silenced");
}

async function trialFactWriteback() {
  const contactId = "contact-fwb-trial";
  const fieldKey = "crs_score";
  const value = 512;
  const result = await standInMachineApi.writeFact({
    contactId,
    fieldKey,
    value,
    source: "nudge-form-trial",
  });
  await assert("fact_writebacks write", result.fieldKey === fieldKey, result.writebackId);
  const listed = await standInMachineApi.listFactWritebacks(contactId);
  await assert(
    "fact_writebacks list holds value",
    listed.some((w) => w.field_key === fieldKey && w.value === value),
    `${fieldKey}=${value}`,
  );
}

async function trialFirmHealthReads() {
  const attempts = await standInMachineApi.listActiveAttempts();
  await assert("active_attempts read", attempts.length >= 1, `${attempts.length} rows`);
  const engagement = await standInMachineApi.listEngagementRecords();
  await assert("engagement_records read", engagement.length >= 1, `${engagement.length} rows`);
}

async function main() {
  await trialReferencePersist();
  await trialEligibilityPipeline();
  await trialMotionPrecedence();
  await trialPathways();
  await trialFieldClass();
  await trialReachability();
  await trialAttemptCriteria();
  await trialChannelAndPhase();
  await trialCohortAndMetrics();
  await trialEvaluationPin();
  await trialCampaignState();
  await trialWorkflowActivateAndRun();
  await trialTemplateAndBinding();
  await trialEnrollment();
  await trialBookAudit();
  await trialPreparedWorkspace();
  await trialHalt();
  await trialConsent();
  await trialFactWriteback();
  await trialFirmHealthReads();
  console.log("ALL LEFT→RIGHT TRIALS PASSED");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
