# SOURCE_MANIFEST

Tower product tree scanned: `origin/main` @ `48d4511` (worktree). Recon does not contain `src/` / `server/`; this inventory is of the product, delivered on recon as `tower-light/`.

Parser: TypeScript 5.8 `createSourceFile` (AST). 0 parse failures.

| Metric | Count |
|---|---|
| Listed | 1081 |
| Scanned | 730 |
| Excluded | 351 |
| Failed | 0 |

## Buckets

| Status | Kind | Count |
|---|---|---|
| excluded | asset | 113 |
| excluded | docs | 238 |
| scanned | config | 13 |
| scanned | css | 8 |
| scanned | html | 2 |
| scanned | js-ts-ast | 666 |
| scanned | other | 8 |
| scanned | sql | 33 |

## Policy

- **Scanned:** authored JS/TS/TSX/MJS, SQL, CSS, HTML, JSON/YAML/env/Docker/CI configs.
- **Excluded docs:** markdown / `.mdc` prose (not a runtime construction). Listed so they are not silent.
- **Excluded assets:** png/svg/mp4.
- **Excluded lockfile:** `package-lock.json` internals.
- **Not in this tree:** `node_modules`, `dist`, `dist-api` (gitignored; not listed as authored source).

Absence of a pattern is only claimed for **successfully scanned** files in that bucket.

## Every listed path

| Path | Status | Kind |
|---|---|---|
| `.env.example` | scanned | config |
| `.env.sandbox.example` | scanned | config |
| `.git` | scanned | other — git metadata |
| `.github/workflows/prod-tick.yml` | scanned | config |
| `.github/workflows/ship.yml` | scanned | config |
| `.gitignore` | scanned | config |
| `AGENTS.md` | excluded | docs — markdown / not runtime construction |
| `api/auth.ts` | scanned | js-ts-ast |
| `api/ping.ts` | scanned | js-ts-ast |
| `api/wire.ts` | scanned | js-ts-ast |
| `ATTRIBUTIONS.md` | excluded | docs — markdown / not runtime construction |
| `claude-design-hero-trimmed.mp4` | excluded | asset — binary/media asset |
| `default_shadcn_theme.css` | scanned | css |
| `deploy/tower-tick-worker.service` | scanned | config |
| `docker-compose.worker.yml` | scanned | config |
| `Dockerfile.worker` | scanned | config |
| `docs/build-foundation/00-rudiments.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/01-ui-first-and-how.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/02-surface-registry.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/03-visual-system.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/04-flows-and-shipping.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/05-register-augmented-build.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/06-parametric-elimination-applied.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/06-parametric-elimination.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/07-overlay-escape.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/08-outcome-so-that.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/cursor-rules/how-analysis.mdc` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/cursor-rules/icons.mdc` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/cursor-rules/overlay-escape.mdc` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/cursor-rules/parametric-elimination.mdc` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/cursor-rules/surface-registry.mdc` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/cursor-rules/theme-tokens.mdc` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/PROJECT-BRIEF.template.md` | excluded | docs — markdown / not runtime construction |
| `docs/build-foundation/README.md` | excluded | docs — markdown / not runtime construction |
| `docs/ideas/audit-module.md` | excluded | docs — markdown / not runtime construction |
| `docs/ideas/tower-product-vision.md` | excluded | docs — markdown / not runtime construction |
| `docs/method/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/method/DECISION-CONSTITUTION.md` | excluded | docs — markdown / not runtime construction |
| `docs/method/TWO-COLUMN-SYNTHESIS.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/auth-service-contract.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/console-state.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/database-seeding-protocol.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/engagement-chart-gantt-decisions.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/immigration-rules-engine2-giveback.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/product-log-2026-06-13.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/PRODUCT-STATE-GUIDE.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/product-state-index.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/psd/tower/PSD-tower-v0.1.0.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/psd/tower/PSD-tower-v0.2.0.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/psd/tower/PSD-tower-v0.3.0.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/psd/tower/PSD-tower-v0.4.0.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/psd/tower/screenshots/01-board-sarah-details.png` | excluded | asset — binary/media asset |
| `docs/product/psd/tower/screenshots/02-hub-audits-sidebar.png` | excluded | asset — binary/media asset |
| `docs/product/psd/tower/screenshots/03-hub-audit-detail-records.png` | excluded | asset — binary/media asset |
| `docs/product/psd/tower/screenshots/04-contacts-directory.png` | excluded | asset — binary/media asset |
| `docs/product/psd/tower/screenshots/05-console-holon-registry.png` | excluded | asset — binary/media asset |
| `docs/product/psd/tower/screenshots/06-sarah-engagement-activity.png` | excluded | asset — binary/media asset |
| `docs/product/psd/tower/screenshots/README.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/register-augmented-build-bridge.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/register-manager-prompt.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/systems-register.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/tasks/login-production-follow-ups.md` | excluded | docs — markdown / not runtime construction |
| `docs/product/ui-first-build-methodology.md` | excluded | docs — markdown / not runtime construction |
| `docs/README.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/AGENT-NOTIFY-CHANNEL.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/agents-blueprint/C0-agents-global-settings-entry.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C1-sequence-templates.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C11-channel-attempt-variation.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C13-sequence-activity.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C14-sequence-settings-channel-rules.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C15-channel-rules-one-timer.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C2-add-objective-template.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C2b-add-objective-scratch.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C3-two-campaigns.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C4-override-this.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C5-content-toggle.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C5b-content-toggle-closeup.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C6-agents-settings-global.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C7-sequence-settings.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C8-sequence-contacts-enroll.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C8b-select-from-list.png` | excluded | asset — binary/media asset |
| `docs/register/agents-blueprint/C9-campaign-local-attempt-add-channel.png` | excluded | asset — binary/media asset |
| `docs/register/AGENTS-FACE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/AGENTS-SA-PACKAGE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/AGENTS-UI-BLUEPRINT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/APP-ELEVATION-GAP.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/AUTHOR-RUNTIME-CLOSED.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/automations-blueprint/A1-smallest-workflow.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A10-output-classes-lattice.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A11-rule-output-required-data-listing.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A12-form-from-required-data.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A13-lattice-required-data-listing.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A14-action-assign-or-template.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A15-blank-canvas-chain.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A16-if-previous-result.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A17-trigger-firm-provisioned.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A18-trigger-global-local.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A19-automations-contacts.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A2-rule-gui.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A3-rule-custom.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/a34-live-contacts.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A4-gui-plus-named-code.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A5-inside-trigger.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A6-add-node.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A7-action-two-kinds.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A8-action-agents-objective.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/A9-rule-output-gap.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/add-tag-pass/01-add-tag-parameters.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/add-tag-pass/02-tag-picker-open.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/add-tag-pass/03-contact-empty.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/add-tag-pass/04-close-input.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/add-tag-pass/05-output.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/add-tag-pass/README.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/automations-blueprint/in-app-action-pass/01-kind.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/in-app-action-pass/02-in-app-by-module.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/in-app-action-pass/03-book-readiness-start-audit.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/in-app-action-pass/04-contacts-confirm-book.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/in-app-action-pass/05-firms-provision.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/in-app-action-pass/06-output.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/in-app-action-pass/07-input-closed.png` | excluded | asset — binary/media asset |
| `docs/register/automations-blueprint/in-app-action-pass/README.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/AUTOMATIONS-FACE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/AUTOMATIONS-SA-PACKAGE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/AUTOMATIONS-UI-BLUEPRINT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/CLIENT-DATA-BIND.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/CONTROLS-LEDGER.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/DATA-IN-TABLES.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/DEPLOY-READINESS.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/enrichment/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/enrichment/consultant-cants.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/enrichment/contact-cants.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/enrichment/operator-cants.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/FACELESS-GAPS-CLOSED.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/FIRM-BINDING.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/furnish/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/furnish/consultant-furnish.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/furnish/contact-furnish.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/furnish/operator-furnish.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/consultant-access.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/consultant-core.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/consultant-governance.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/contact-book.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/contact-consent.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/contact-refresh.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/contact-silence.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-acquisition.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-activation-state.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-activation.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-audit-trail.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-book-readiness.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-commercial.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-configuration-libraries.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-firm-bind.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-firm-health.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-founder-controls.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-oversight.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-provision.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-reference-data.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-register-evolution.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/how/operator-support.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/HUB-STRUCTURE-SYSTEM-BIND.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/IMAGE-CAPTION-AUDIT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/IMPLEMENTER-FACE-PASS.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/IMPLEMENTER-UI-TESTS.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/MAGIC-ACCESS-LINK.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/MODULAR-CONTROL-MAP.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/OPERATOR-REVISIONS.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/ORCHESTRATION.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/OUTCOME-SYSTEM-MAP.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/OUTCOMES.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PASS-FORK-MAP.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/personas.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PHASE-TWO-LOG.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PHASE-TWO.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PLACEHOLDER-REAL-MAP.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PLATE-CHROME-RULE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PRIMITIVES.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/priors/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/priors/consultant.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/priors/contact-and-ct-chrome.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/priors/operator-house.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/priors/operator-libraries.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PRODUCTION-WALK.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PROTOTYPE-COHESION-ANALYSIS.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PROTOTYPE-COHESION-PLAN.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/PROTOTYPE-ON-CANVAS-PLAN.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SEED.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SHIP-READINESS.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEM-COMPONENT-MAP.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/ACTUATION-REPORT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/BUILD-interactive-system-map.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/BUILD-system-map-v2-table-inventory.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/BUILD-system-map-v3-templates-and-binding.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/CONTROLS-TABLES-RECONCILIATION.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/END-TO-END-REPORT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/FROZEN-TABLES-v1.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/MODULARITY-REPORT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/RECONCILIATION-v1.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/RESOLUTION-REPORT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/SCHEMA-REPORT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/V2-BACKLOG.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/system-map/V3-REPORT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-AGENTS-ASCRIBE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-ANALYST-LOG.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-AUTOMATIONS-ASCRIBE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-AUTOMATIONS-NODE-OUTPUT.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-CHANGE-PACKET-022.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-CHANGE-PACKET-023.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-GOAL.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-OBJECTIVE-ESCROW.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-REQUIREMENTS-FILLED.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-REQUIREMENTS.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/SYSTEMS-STORY.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/THREE-SURFACE-MODEL.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/weak/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/weak/consultant.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/weak/contact.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/weak/operator-house.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/weak/operator-libraries.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/WORLD-CRAFT-ARCHIVE.md` | excluded | docs — markdown / not runtime construction |
| `docs/register/WORLD.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/AGENT-VS-HUMAN-PROVISIONING.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/00-ROSTER.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/C1-email-deliverability.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/C2-agentic-engagement-runtime.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/C3-eligibility-reference-pipeline.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/C4-book-ingestion-identity.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/C5-forward-deploy-generation.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/C6-escrow-payment-mechanics.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/C7-instrumentation-analytics.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/capability/CAPABILITY-CONSIDERATIONS.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/CROSS-CUTTING.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/DOCTRINE-sme-cto-implementation.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/HANDOFF-ROUTING.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/HANDOFF.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/00-SURFACE-VOCAB.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/01-immigration-pathway-eligibility.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/02-ircc-reference-data.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/03-canadian-privacy-casl.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/04-consultancy-desk-ops.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/05-platform-ads-meta-trust.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/06-payments-escrow.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/07-consultancy-crm-book-connect.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/CLICKPATH-DENSIFICATION.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/implementation/DENSIFY-LAW.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/METHODOLOGY.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/pass2/01-immigration-pathway-eligibility.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/pass2/02-ircc-reference-data.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/pass2/03-canadian-privacy-casl.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/pass2/04-consultancy-desk-ops.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/pass2/05-platform-ads-meta-trust.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/pass2/06-payments-escrow.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/pass2/07-consultancy-crm-book-connect.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/ROSTER.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/SME-GRAPH.md` | excluded | docs — markdown / not runtime construction |
| `docs/sme/SURFACE-INTENT.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/CTO-THINK-STACK.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/00-PASS-BRIEF.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/01-runtime-and-engagement.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/02-send-enrich-ads.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/03-data-identity-money.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/04-CONTROL-RECONCILIATION.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/05-SENDING-IDENTITY-WALL.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/06-SMS-CANADA-GATE.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/external-models/HUMAN-ONLY.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/FOUNDER-INPUT-CHECKLIST.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/NODE-DEFINITION.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/_NODE-UNION-DRAFT.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/01-STEP1-STATUS.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/CANONICAL-NODES.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/CANTS-AND-FURNISH.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/_SEED-NODES.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/C1-email-deliverability.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/C2-agentic-engagement-runtime.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/C3-eligibility-reference-pipeline.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/C4-book-ingestion-identity.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/C5-forward-deploy-generation.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/C6-escrow-payment-mechanics.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/function/C7-instrumentation-analytics.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/paper-trace/HUMAN-PROVISIONING-SET.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/STANDIN-WIRING.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/wire-log/00-INDEX.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/wire-log/CRM-OAUTH-META-CHIPS.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/wire-log/GO-CUTOVER.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/wire-log/HALT-OUTREACH.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/wire-log/LOGIN-OTP.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/wire-log/POOL-SEND-GATES.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/WIRING-CRITICAL-INTERACTION.md` | excluded | docs — markdown / not runtime construction |
| `docs/wiring/WIRING-METHOD.md` | excluded | docs — markdown / not runtime construction |
| `guidelines/Activity.md` | excluded | docs — markdown / not runtime construction |
| `guidelines/Guidelines.md` | excluded | docs — markdown / not runtime construction |
| `guidelines/Reactivation.md` | excluded | docs — markdown / not runtime construction |
| `index.html` | scanned | html |
| `landingpage.md` | excluded | docs — markdown / not runtime construction |
| `MODULES-ALIVE.md` | excluded | docs — markdown / not runtime construction |
| `package-lock.json` | scanned | other — lockfile internals |
| `package.json` | scanned | config |
| `pnpm-workspace.yaml` | scanned | config |
| `postcss.config.mjs` | scanned | js-ts-ast |
| `prototype-ant.html` | scanned | html |
| `public/assets/claude-design-hero-trimmed.mp4` | excluded | asset — binary/media asset |
| `public/assets/tower-by-omcoda-logo.png` | excluded | asset — binary/media asset |
| `public/tower-app-logo.svg` | excluded | asset — binary/media asset |
| `README.md` | excluded | docs — markdown / not runtime construction |
| `rules.md` | excluded | docs — markdown / not runtime construction |
| `scripts/bundle-vercel-api.mjs` | scanned | js-ts-ast |
| `scripts/check-access-table.ts` | scanned | js-ts-ast |
| `scripts/close-walk-gaps.ts` | scanned | js-ts-ast |
| `scripts/copy-notion-icons.mjs` | scanned | js-ts-ast |
| `scripts/ensure-platform-admin.ts` | scanned | js-ts-ast |
| `scripts/generate-holon-catalog-flat.mts` | scanned | js-ts-ast |
| `scripts/generate-how-graphs.py` | scanned | other — python helper |
| `scripts/issue-access-link.ts` | scanned | js-ts-ast |
| `scripts/lift-active-halts.ts` | scanned | js-ts-ast |
| `scripts/pgConnect.ts` | scanned | js-ts-ast |
| `scripts/prod-otp-verify-once.ts` | scanned | js-ts-ast |
| `scripts/read-latest-otp.ts` | scanned | js-ts-ast |
| `scripts/restore-channel-order.ts` | scanned | js-ts-ast |
| `scripts/run-migration.ts` | scanned | js-ts-ast |
| `scripts/run-seed.ts` | scanned | js-ts-ast |
| `scripts/sync-capability-sme-from-docs.py` | scanned | other — python helper |
| `scripts/sync-how-from-docs.py` | scanned | other — python helper |
| `scripts/sync-persona-cants-furnish-from-docs.py` | scanned | other — python helper |
| `scripts/sync-sme-from-docs.py` | scanned | other — python helper |
| `scripts/sync-wiring-paper-from-docs.py` | scanned | other — python helper |
| `scripts/vercel-entries/auth.ts` | scanned | js-ts-ast |
| `scripts/vercel-entries/fetchBridge.ts` | scanned | js-ts-ast |
| `scripts/vercel-entries/wire.ts` | scanned | js-ts-ast |
| `scripts/verify-access-link.ts` | scanned | js-ts-ast |
| `scripts/verify-admin-consultants.ts` | scanned | js-ts-ast |
| `scripts/verify-affordance-roundtrip.ts` | scanned | js-ts-ast |
| `scripts/verify-author-runtime.ts` | scanned | js-ts-ast |
| `scripts/verify-automations-alive.ts` | scanned | js-ts-ast |
| `scripts/verify-boot-env.ts` | scanned | js-ts-ast |
| `scripts/verify-continuous-worker.ts` | scanned | js-ts-ast |
| `scripts/verify-deny-gates.ts` | scanned | js-ts-ast |
| `scripts/verify-firm-binding.ts` | scanned | js-ts-ast |
| `scripts/verify-machine-e2e.ts` | scanned | js-ts-ast |
| `scripts/verify-modular-surfaces.ts` | scanned | js-ts-ast |
| `scripts/verify-production-walk.ts` | scanned | js-ts-ast |
| `scripts/verify-reference-persist.ts` | scanned | js-ts-ast |
| `scripts/verify-session-firm.ts` | scanned | js-ts-ast |
| `scripts/verify-ship-spine.ts` | scanned | js-ts-ast |
| `scripts/verify-worker-actuation.ts` | scanned | js-ts-ast |
| `scripts/walk-verify-firm.ts` | scanned | js-ts-ast |
| `server/auth-service/accessLinks.ts` | scanned | js-ts-ast |
| `server/auth-service/app.ts` | scanned | js-ts-ast |
| `server/auth-service/cors.ts` | scanned | js-ts-ast |
| `server/auth-service/crypto.ts` | scanned | js-ts-ast |
| `server/auth-service/db.ts` | scanned | js-ts-ast |
| `server/auth-service/email.ts` | scanned | js-ts-ast |
| `server/auth-service/index.ts` | scanned | js-ts-ast |
| `server/auth-service/logger.ts` | scanned | js-ts-ast |
| `server/auth-service/platformAdmin.ts` | scanned | js-ts-ast |
| `server/auth-service/registerRoutes.ts` | scanned | js-ts-ast |
| `server/auth-service/routes.ts` | scanned | js-ts-ast |
| `server/wire-service/app.ts` | scanned | js-ts-ast |
| `server/wire-service/auditRun.ts` | scanned | js-ts-ast |
| `server/wire-service/bootEnv.ts` | scanned | js-ts-ast |
| `server/wire-service/campaignHousing.ts` | scanned | js-ts-ast |
| `server/wire-service/capabilities.ts` | scanned | js-ts-ast |
| `server/wire-service/cascade.ts` | scanned | js-ts-ast |
| `server/wire-service/contactAccessMint.ts` | scanned | js-ts-ast |
| `server/wire-service/contactSeat.ts` | scanned | js-ts-ast |
| `server/wire-service/db.ts` | scanned | js-ts-ast |
| `server/wire-service/dispatchSend.ts` | scanned | js-ts-ast |
| `server/wire-service/eventTest.ts` | scanned | js-ts-ast |
| `server/wire-service/machine.ts` | scanned | js-ts-ast |
| `server/wire-service/operatorPanes.ts` | scanned | js-ts-ast |
| `server/wire-service/pool.ts` | scanned | js-ts-ast |
| `server/wire-service/resendClient.ts` | scanned | js-ts-ast |
| `server/wire-service/routes.ts` | scanned | js-ts-ast |
| `server/wire-service/runWrites.ts` | scanned | js-ts-ast |
| `server/wire-service/send.ts` | scanned | js-ts-ast |
| `server/wire-service/sendMode.ts` | scanned | js-ts-ast |
| `server/wire-service/sessionFirm.ts` | scanned | js-ts-ast |
| `server/wire-service/stores.ts` | scanned | js-ts-ast |
| `server/wire-service/templateWalk.ts` | scanned | js-ts-ast |
| `server/wire-service/twilioClient.ts` | scanned | js-ts-ast |
| `server/wire-service/waitNote.ts` | scanned | js-ts-ast |
| `server/wire-service/webhooks.ts` | scanned | js-ts-ast |
| `server/wire-service/worker.ts` | scanned | js-ts-ast |
| `server/wire-service/workflowWalk.ts` | scanned | js-ts-ast |
| `src/app/App.tsx` | scanned | js-ts-ast |
| `src/app/auth/AccessEntry.tsx` | scanned | js-ts-ast |
| `src/app/auth/authClient.ts` | scanned | js-ts-ast |
| `src/app/auth/AuthContext.tsx` | scanned | js-ts-ast |
| `src/app/auth/AuthGate.tsx` | scanned | js-ts-ast |
| `src/app/auth/platformAdmin.ts` | scanned | js-ts-ast |
| `src/app/components/ActivityBar.tsx` | scanned | js-ts-ast |
| `src/app/components/ActivityBarHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/archive/NudgePopover.tsx` | scanned | js-ts-ast |
| `src/app/components/BoardPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/client-portal/ClientEngagementCalendar.tsx` | scanned | js-ts-ast |
| `src/app/components/client-portal/ClientPortalPage.tsx` | scanned | js-ts-ast |
| `src/app/components/ClientDataPage.tsx` | scanned | js-ts-ast |
| `src/app/components/ClientIcon.tsx` | scanned | js-ts-ast |
| `src/app/components/ClientPageHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/ClientView.tsx` | scanned | js-ts-ast |
| `src/app/components/contacts/ContactIndicatorIcon.tsx` | scanned | js-ts-ast |
| `src/app/components/contacts/ContactRow.tsx` | scanned | js-ts-ast |
| `src/app/components/contacts/ContactsBody.tsx` | scanned | js-ts-ast |
| `src/app/components/contacts/ContactsSectionHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/contacts/directoryRowStyles.ts` | scanned | js-ts-ast |
| `src/app/components/contacts/DirectorySectionHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/contacts/ImportRow.tsx` | scanned | js-ts-ast |
| `src/app/components/contacts/ImportsSectionHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/ContactView.tsx` | scanned | js-ts-ast |
| `src/app/components/DataPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/docs/agentHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/automationHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/boardBodyHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/clientDataHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/contactsBodyHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/docsHighlight.ts` | scanned | js-ts-ast |
| `src/app/components/docs/docsRegistryHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/engagementListHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/engagementTimelineHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/HolonBoundary.tsx` | scanned | js-ts-ast |
| `src/app/components/docs/holonCatalogChrome.ts` | scanned | js-ts-ast |
| `src/app/components/docs/holonCatalogFlat.ts` | scanned | js-ts-ast |
| `src/app/components/docs/holonCatalogTree.ts` | scanned | js-ts-ast |
| `src/app/components/docs/holonDetailContent.ts` | scanned | js-ts-ast |
| `src/app/components/docs/holonIcons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/HolonInspectLayer.tsx` | scanned | js-ts-ast |
| `src/app/components/docs/HolonPurposeHoverCard.tsx` | scanned | js-ts-ast |
| `src/app/components/docs/HolonTreeIcon.tsx` | scanned | js-ts-ast |
| `src/app/components/docs/hubBodyHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/icepanelLinks.ts` | scanned | js-ts-ast |
| `src/app/components/docs/loginHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/primaryNavigationIcons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/RegisterContentChildHolons.tsx` | scanned | js-ts-ast |
| `src/app/components/docs/registerMeta/boardRegisterMeta.ts` | scanned | js-ts-ast |
| `src/app/components/docs/registerMeta/composeViewHolons.ts` | scanned | js-ts-ast |
| `src/app/components/docs/registerMeta/index.ts` | scanned | js-ts-ast |
| `src/app/components/docs/registerMeta/loginRegisterMeta.ts` | scanned | js-ts-ast |
| `src/app/components/docs/registerMeta/registry.ts` | scanned | js-ts-ast |
| `src/app/components/docs/registerMeta/types.ts` | scanned | js-ts-ast |
| `src/app/components/docs/registerMeta/views.ts` | scanned | js-ts-ast |
| `src/app/components/docs/shellHolonOrder.ts` | scanned | js-ts-ast |
| `src/app/components/docs/surfacePurpose.ts` | scanned | js-ts-ast |
| `src/app/components/docs/surfacePurposeBoard.ts` | scanned | js-ts-ast |
| `src/app/components/docs/surfacePurposeClientData.ts` | scanned | js-ts-ast |
| `src/app/components/docs/surfacePurposeContacts.ts` | scanned | js-ts-ast |
| `src/app/components/docs/surfacePurposeHub.ts` | scanned | js-ts-ast |
| `src/app/components/docs/surfacePurposeShell.ts` | scanned | js-ts-ast |
| `src/app/components/docs/treeLayout.ts` | scanned | js-ts-ast |
| `src/app/components/docs/treeTypography.ts` | scanned | js-ts-ast |
| `src/app/components/DocsPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/EventsTab.tsx` | scanned | js-ts-ast |
| `src/app/components/figma/ImageWithFallback.tsx` | scanned | js-ts-ast |
| `src/app/components/HaltOutreachBar.tsx` | scanned | js-ts-ast |
| `src/app/components/HolonDetailPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/AddAuditFlow.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentAddStepMenu.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentDetailView.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentEditor.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentEditorEmptyState.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentSequenceCanvas.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentSequenceEditor.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/AgentStepRail.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/nodes/AgentStepFrame.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/nodes/EmailStepNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/nodes/TaskStepNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/agent/stepNodeStyles.ts` | scanned | js-ts-ast |
| `src/app/components/hub/AgentsSectionHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/AuditDetailView.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/AuditRecordsTable.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/auditRowIcon.ts` | scanned | js-ts-ast |
| `src/app/components/hub/AuditServicesPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/AuditsSectionHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/AuditTreeBlock.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AttachStepMenu.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationAddTriggerMenu.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationBuildPalette.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationDetailView.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/automationEdgeTypes.ts` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationEditorContext.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationEmptyCanvas.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationEventTriggerConfigPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationManualClassFilterPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationManualTriggerConfigPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationNodeConfigModal.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/automationNodeTypes.ts` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationRunsTab.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationWorkflowCanvas.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationWorkflowEditor.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/AutomationWorkflowHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/ConstantsIndustryTableView.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/DataClassScopeSelector.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/edges/AutomationInsertEdge.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/edges/EdgeInsertMenu.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/FieldPathDropInput.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/IfConditionConfigForm.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/ManualEnrollmentCriteriaSummary.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/NodeDataPane.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/nodes/ActionNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/nodes/BranchNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/nodes/ConstantNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/nodes/ExitNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/nodes/GetNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/nodes/RuleNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/nodes/TriggerNode.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/RuleAnalysisPane.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/RuleOutcomesConfigForm.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/WorkflowNodeFrame.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/WorkflowNodeRunChrome.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/automation/workflowNodeStyles.ts` | scanned | js-ts-ast |
| `src/app/components/hub/automation/WorkflowNodeToolbar.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/AutomationsSectionHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/HubBody.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/HubToolDetailView.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/HubToolRow.tsx` | scanned | js-ts-ast |
| `src/app/components/hub/HubToolView.tsx` | scanned | js-ts-ast |
| `src/app/components/icons/NotionIcon.tsx` | scanned | js-ts-ast |
| `src/app/components/icons/ResendLogo.tsx` | scanned | js-ts-ast |
| `src/app/components/icons/SupabaseLogo.tsx` | scanned | js-ts-ast |
| `src/app/components/icons/TowerAppLogo.tsx` | scanned | js-ts-ast |
| `src/app/components/imports/CsvImportColumnMappingDialog.tsx` | scanned | js-ts-ast |
| `src/app/components/imports/CsvImportFlow.tsx` | scanned | js-ts-ast |
| `src/app/components/imports/csvImportTypes.ts` | scanned | js-ts-ast |
| `src/app/components/imports/csvImportValidation.ts` | scanned | js-ts-ast |
| `src/app/components/imports/parseCsvPreview.ts` | scanned | js-ts-ast |
| `src/app/components/inspector/clientMessageData.ts` | scanned | js-ts-ast |
| `src/app/components/inspector/ClientMessagePanel.tsx` | scanned | js-ts-ast |
| `src/app/components/inspector/emailInspectorData.ts` | scanned | js-ts-ast |
| `src/app/components/inspector/EmailOutputPreview.tsx` | scanned | js-ts-ast |
| `src/app/components/inspector/EngagementNodePanel.tsx` | scanned | js-ts-ast |
| `src/app/components/inspector/FormCaptureReplay.tsx` | scanned | js-ts-ast |
| `src/app/components/inspector/FormOutputPreview.tsx` | scanned | js-ts-ast |
| `src/app/components/JourneyTab.tsx` | scanned | js-ts-ast |
| `src/app/components/NudgeGantt.tsx` | scanned | js-ts-ast |
| `src/app/components/PhaseTooltip.tsx` | scanned | js-ts-ast |
| `src/app/components/StatusBar.tsx` | scanned | js-ts-ast |
| `src/app/components/tasks/TaskRow.tsx` | scanned | js-ts-ast |
| `src/app/components/tasks/TasksBody.tsx` | scanned | js-ts-ast |
| `src/app/components/tasks/TasksSectionHeader.tsx` | scanned | js-ts-ast |
| `src/app/components/tasks/TaskStatusToggle.tsx` | scanned | js-ts-ast |
| `src/app/components/tokens.ts` | scanned | js-ts-ast |
| `src/app/components/touchpoints/TaskTouchpointPanel.tsx` | scanned | js-ts-ast |
| `src/app/components/touchpoints/touchpointUtils.ts` | scanned | js-ts-ast |
| `src/app/components/ui/accordion.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/alert-dialog.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/alert.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/aspect-ratio.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/avatar.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/badge.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/breadcrumb.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/button.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/calendar.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/card.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/carousel.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/chart.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/checkbox.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/collapsible.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/command.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/context-menu.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/dialog.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/drawer.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/dropdown-menu.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/form.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/hover-card.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/input-otp.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/input.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/label.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/menubar.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/navigation-menu.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/pagination.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/popover.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/progress.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/radio-group.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/resizable.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/scroll-area.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/select.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/separator.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/sheet.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/sidebar.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/skeleton.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/slider.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/sonner.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/switch.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/syncShadcnTheme.ts` | scanned | js-ts-ast |
| `src/app/components/ui/table.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/tabs.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/textarea.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/toggle-group.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/toggle.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/tooltip.tsx` | scanned | js-ts-ast |
| `src/app/components/ui/towerChrome.ts` | scanned | js-ts-ast |
| `src/app/components/ui/use-mobile.ts` | scanned | js-ts-ast |
| `src/app/components/ui/utils.ts` | scanned | js-ts-ast |
| `src/app/components/Workspace.tsx` | scanned | js-ts-ast |
| `src/app/constants/layout.ts` | scanned | js-ts-ast |
| `src/app/context/AuditContext.tsx` | scanned | js-ts-ast |
| `src/app/context/AutomationContext.tsx` | scanned | js-ts-ast |
| `src/app/context/DocsHighlightContext.tsx` | scanned | js-ts-ast |
| `src/app/context/DocsRegistryContext.tsx` | scanned | js-ts-ast |
| `src/app/context/HolonDetailContext.tsx` | scanned | js-ts-ast |
| `src/app/context/PanelContext.tsx` | scanned | js-ts-ast |
| `src/app/context/TaskContext.tsx` | scanned | js-ts-ast |
| `src/app/context/TouchpointFocusContext.tsx` | scanned | js-ts-ast |
| `src/app/data/agentDefinitions.ts` | scanned | js-ts-ast |
| `src/app/data/agentSteps.ts` | scanned | js-ts-ast |
| `src/app/data/auditRecordReachability.ts` | scanned | js-ts-ast |
| `src/app/data/audits.ts` | scanned | js-ts-ast |
| `src/app/data/automationBuildModules.ts` | scanned | js-ts-ast |
| `src/app/data/automationCompare.ts` | scanned | js-ts-ast |
| `src/app/data/automationConditions.ts` | scanned | js-ts-ast |
| `src/app/data/automationConstants.ts` | scanned | js-ts-ast |
| `src/app/data/automationDataClassNames.ts` | scanned | js-ts-ast |
| `src/app/data/automationDataPull.ts` | scanned | js-ts-ast |
| `src/app/data/automationEvents.ts` | scanned | js-ts-ast |
| `src/app/data/automationGet.ts` | scanned | js-ts-ast |
| `src/app/data/automationNodeRuntime.ts` | scanned | js-ts-ast |
| `src/app/data/automationRules.ts` | scanned | js-ts-ast |
| `src/app/data/automationRuns.ts` | scanned | js-ts-ast |
| `src/app/data/automationTriggerSelect.ts` | scanned | js-ts-ast |
| `src/app/data/automationWorkflows.ts` | scanned | js-ts-ast |
| `src/app/data/clientPortalData.ts` | scanned | js-ts-ast |
| `src/app/data/clients.ts` | scanned | js-ts-ast |
| `src/app/data/collectibleFields.ts` | scanned | js-ts-ast |
| `src/app/data/contacts.ts` | scanned | js-ts-ast |
| `src/app/data/engagementCalendarData.ts` | scanned | js-ts-ast |
| `src/app/data/eventTestContract.ts` | scanned | js-ts-ast |
| `src/app/data/hub.ts` | scanned | js-ts-ast |
| `src/app/data/immigrationMatrixOutcomes.ts` | scanned | js-ts-ast |
| `src/app/data/immigrationReferenceTables.ts` | scanned | js-ts-ast |
| `src/app/data/imports.ts` | scanned | js-ts-ast |
| `src/app/data/inAppAffordances.ts` | scanned | js-ts-ast |
| `src/app/data/journeyByClient.ts` | scanned | js-ts-ast |
| `src/app/data/journeyGantt.ts` | scanned | js-ts-ast |
| `src/app/data/journeySequences.ts` | scanned | js-ts-ast |
| `src/app/data/journeyTree.ts` | scanned | js-ts-ast |
| `src/app/data/marcusJourney.ts` | scanned | js-ts-ast |
| `src/app/data/optInLaunchTree.ts` | scanned | js-ts-ast |
| `src/app/data/reactivationTree.ts` | scanned | js-ts-ast |
| `src/app/data/sarahNudgeTimeline.ts` | scanned | js-ts-ast |
| `src/app/data/tasks.ts` | scanned | js-ts-ast |
| `src/app/data/testWalk.ts` | scanned | js-ts-ast |
| `src/app/icons/brand/index.ts` | scanned | js-ts-ast |
| `src/app/icons/dependency-55534e-icon.png` | excluded | asset — binary/media asset |
| `src/app/icons/notion-icon-urls.ts` | scanned | js-ts-ast |
| `src/app/icons/tower-app-logo.svg` | excluded | asset — binary/media asset |
| `src/app/marketing/components/AuthHeroMedia.tsx` | scanned | js-ts-ast |
| `src/app/marketing/components/LoginForm.tsx` | scanned | js-ts-ast |
| `src/app/marketing/components/OmcodaNav.tsx` | scanned | js-ts-ast |
| `src/app/marketing/omcodaLinks.ts` | scanned | js-ts-ast |
| `src/app/marketing/pages/LoginPage.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/createRegisterCanvasNodes.ts` | scanned | js-ts-ast |
| `src/app/register/canvas/flowWireAnchors.ts` | scanned | js-ts-ast |
| `src/app/register/canvas/frameChrome.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/RegisterCanvasFlowWires.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/registerCanvasNodeTypes.ts` | scanned | js-ts-ast |
| `src/app/register/canvas/RegisterFlowWireMetaCard.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/RegisterFlowWireStepBadge.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/RegisterSystemNode.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/RegisterTableNode.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/RegisterViewFrameContent.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/RegisterViewFrameNode.tsx` | scanned | js-ts-ast |
| `src/app/register/canvas/registerViewLayout.ts` | scanned | js-ts-ast |
| `src/app/register/canvas/registerViewNodes.ts` | scanned | js-ts-ast |
| `src/app/register/components/ArtboardBodySkeleton.tsx` | scanned | js-ts-ast |
| `src/app/register/components/HowAnalysisDetailPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterArtboardCanvas.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterArtboardFrame.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterBootSkeleton.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterCanvasPlaceholder.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterClickThroughPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterComponentsTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterEnrichmentTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterErrorBoundary.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterFlowCanvas.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterFlowsTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterGate.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterHowCanvas.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterHowTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterJourneyFlowsTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterLeftPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterPassSection.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterPriorsTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterShellChrome.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterSmeTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterTheoryCanvas.tsx` | scanned | js-ts-ast |
| `src/app/register/components/RegisterWiringPaperTree.tsx` | scanned | js-ts-ast |
| `src/app/register/components/theory/ImplementationBlock.tsx` | scanned | js-ts-ast |
| `src/app/register/components/theory/RegisterTheoryPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/components/theory/TextWithUiRefs.tsx` | scanned | js-ts-ast |
| `src/app/register/components/treeCollapse.ts` | scanned | js-ts-ast |
| `src/app/register/composer/HolonComposerNode.tsx` | scanned | js-ts-ast |
| `src/app/register/composer/RegisterViewComposer.tsx` | scanned | js-ts-ast |
| `src/app/register/composer/surfaceRegistry.ts` | scanned | js-ts-ast |
| `src/app/register/composer/surfaceTypes.ts` | scanned | js-ts-ast |
| `src/app/register/context/RegisterSelectionContext.tsx` | scanned | js-ts-ast |
| `src/app/register/context/RegisterShellContext.tsx` | scanned | js-ts-ast |
| `src/app/register/flowCanvas/buildFlowStepGraph.ts` | scanned | js-ts-ast |
| `src/app/register/flowCanvas/nodes/RegisterFlowGraphNode.tsx` | scanned | js-ts-ast |
| `src/app/register/flowCanvas/registerFlowEdgeTypes.ts` | scanned | js-ts-ast |
| `src/app/register/flowCanvas/registerFlowNodeStyles.ts` | scanned | js-ts-ast |
| `src/app/register/flowCanvas/registerFlowNodeTypes.ts` | scanned | js-ts-ast |
| `src/app/register/flowCanvas/RegisterFlowStepCanvas.tsx` | scanned | js-ts-ast |
| `src/app/register/flowCanvas/RegisterFlowWireEdge.tsx` | scanned | js-ts-ast |
| `src/app/register/flows/arriveAtBoardSeeBoardStep.ts` | scanned | js-ts-ast |
| `src/app/register/flows/flowFocus.ts` | scanned | js-ts-ast |
| `src/app/register/flows/flowWireEndpointLabels.ts` | scanned | js-ts-ast |
| `src/app/register/flows/index.ts` | scanned | js-ts-ast |
| `src/app/register/flows/loginSendOtpStep.ts` | scanned | js-ts-ast |
| `src/app/register/flows/loginVerifyOtpStep.ts` | scanned | js-ts-ast |
| `src/app/register/flows/types.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/buildHowGraph.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/consultantAccess.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/consultantCore.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/consultantGovernance.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/contactBook.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/contactConsent.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/contactRefresh.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/contactSilence.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/helpers.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/howAnalysisEdgeTypes.tsx` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/howAnalysisLayout.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/howAnalysisNodeStyles.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/howAnalysisNodeTypes.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/index.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/nodes/HowAnalysisNode.tsx` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorAcquisition.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorActivation.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorActivationState.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorAuditTrail.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorBookReadiness.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorCommercial.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorConfigurationLibraries.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorFirmBind.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorFirmHealth.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorFounderControls.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorOversight.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorProvision.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorReferenceData.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorRegisterEvolution.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/operatorSupport.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/registry.ts` | scanned | js-ts-ast |
| `src/app/register/howAnalysis/types.ts` | scanned | js-ts-ast |
| `src/app/register/journeyFlows/coreCloseFlow.ts` | scanned | js-ts-ast |
| `src/app/register/journeyFlows/index.ts` | scanned | js-ts-ast |
| `src/app/register/journeyFlows/types.ts` | scanned | js-ts-ast |
| `src/app/register/pages/RegisterPage.tsx` | scanned | js-ts-ast |
| `src/app/register/pages/RegisterWorkspace.tsx` | scanned | js-ts-ast |
| `src/app/register/panes/EnrichmentFurnishPane.tsx` | scanned | js-ts-ast |
| `src/app/register/panes/FlowsPane.tsx` | scanned | js-ts-ast |
| `src/app/register/panes/PersonasFunctionPane.tsx` | scanned | js-ts-ast |
| `src/app/register/panes/PriorsPane.tsx` | scanned | js-ts-ast |
| `src/app/register/panes/SmePane.tsx` | scanned | js-ts-ast |
| `src/app/register/panes/WiringPaperPane.tsx` | scanned | js-ts-ast |
| `src/app/register/panes/WorldPane.tsx` | scanned | js-ts-ast |
| `src/app/register/passes/registerPasses.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/ant-design-composition-patterns.md` | excluded | docs — markdown / not runtime construction |
| `src/app/register/prototype-ant/AntCtHost.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/antFill.css` | scanned | css |
| `src/app/register/prototype-ant/chrome.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/BoardModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/clientData/ActivityChronology.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/clientData/ActivityInspectDrawer.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/clientData/ClientDataPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/clientData/engagementProjection.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/ClientWorkspace.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/ConsultantAntScene.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/ContactsModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/HaltOutreachModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/LoginModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/meetingsData.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/MeetingsModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/PreparedModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/consultant/shared.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/contact/ContactAntScene.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/contact/ContactWorkspace.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/MATCH-REPORT.md` | excluded | docs — markdown / not runtime construction |
| `src/app/register/prototype-ant/operator/AcquisitionAdsModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/ActivationForwardDeployModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/ActivationStateModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/AgentsSettingsModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/AntAgentCanvas.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/AntAgentWorkbench.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/AntAutomationWorkbench.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/AuditTrailModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/ActionPlateModals.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/canvasOps.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/CompareOperand.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/DirectInputPane.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/GetParametersPane.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/IfPlateModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/InputPane.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/MappedSlot.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/NodeInteriorModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/OutputPane.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/pickerDirectory.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/plateChrome.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/PlateInsertEdge.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/RuleOutcomesPane.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/RulePlateModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/SwitchPlateModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/TriggerSelectModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/TriggerTestDataPane.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/WaitParametersPane.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/automationPlates/WireAddMenu.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/BookReadinessModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/channelRuleGrain.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/ChannelRulesFields.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/CommercialModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/ConfigurationLibrariesModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/ContactPickModal.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/CustomerSupportModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/FirmHealthModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/FirmOperationsBindModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/FounderAgencyControlsModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/modalScroll.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/operatorAntData.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/OperatorAntScene.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/operatorAntTags.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/operatorConfigLibraries.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/operatorFirmIndex.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/OversightModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/packCatalogStore.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/ProvisionModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/ReferenceDataModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/RegisterEvolutionModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/operator/SendingInfrastructureModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/PEER-CREATE-PARITY.md` | excluded | docs — markdown / not runtime construction |
| `src/app/register/prototype-ant/PrototypeAntApp.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/REARCHITECTURE.md` | excluded | docs — markdown / not runtime construction |
| `src/app/register/prototype-ant/SPACING.md` | excluded | docs — markdown / not runtime construction |
| `src/app/register/prototype-ant/theme.ts` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/viewAsContext.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype-ant/WaitNoteOverlay.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/ConsultantClientWorkspace.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/ConsultantPrototypeScene.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/ContactPrototypeScene.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/HiFiEmptyModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/LiveBriefPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/MeetingsModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/AcquisitionAdsModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/ActivationForwardDeployModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/ActivationStateModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/AuditTrailModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/BookReadinessPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/CommercialModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/ConfigurationLibrariesPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/CustomerSupportModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/FirmHealthModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/FirmOperationsBindPanel.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/FounderAgencyControlsModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/index.ts` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/operatorChrome.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/operatorConfigLibraries.ts` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/operatorWireHelpers.ts` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/OversightModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/packCatalogStore.ts` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/ProvisionModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/ReferenceDataModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/RegisterEvolutionModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operator/SendingInfrastructureModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/operatorNav.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/OperatorPrototypeScene.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/PreparedWorkspaceModule.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/RegisterLoginScene.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/RegisterPrototypeCanvas.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/registerSurfaceChrome.tsx` | scanned | js-ts-ast |
| `src/app/register/prototype/shared/meetingsStore.ts` | scanned | js-ts-ast |
| `src/app/register/prototype/shared/referenceDraft.ts` | scanned | js-ts-ast |
| `src/app/register/registerAuth.ts` | scanned | js-ts-ast |
| `src/app/register/RegisterHolonCatalogBootstrap.tsx` | scanned | js-ts-ast |
| `src/app/register/surfaces/boardSurfaces.tsx` | scanned | js-ts-ast |
| `src/app/register/surfaces/loginSurfaces.tsx` | scanned | js-ts-ast |
| `src/app/register/systems/registerSystemLayout.ts` | scanned | js-ts-ast |
| `src/app/register/systems/registry.ts` | scanned | js-ts-ast |
| `src/app/register/tables/registerTableLayout.ts` | scanned | js-ts-ast |
| `src/app/register/tables/registry.ts` | scanned | js-ts-ast |
| `src/app/register/theory/enrichment/index.ts` | scanned | js-ts-ast |
| `src/app/register/theory/enrichment/personaCantsFurnish.ts` | scanned | js-ts-ast |
| `src/app/register/theory/enrichment/types.ts` | scanned | js-ts-ast |
| `src/app/register/theory/outcomes.ts` | scanned | js-ts-ast |
| `src/app/register/theory/priors/index.ts` | scanned | js-ts-ast |
| `src/app/register/theory/priors/items.ts` | scanned | js-ts-ast |
| `src/app/register/theory/priors/types.ts` | scanned | js-ts-ast |
| `src/app/register/theory/priors/weakItems.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/index.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/seats/C1-email-deliverability.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/seats/C2-agentic-engagement-runtime.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/seats/C3-eligibility-reference-pipeline.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/seats/C4-book-ingestion-identity.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/seats/C5-forward-deploy-generation.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/seats/C6-escrow-payment-mechanics.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/capability/seats/C7-instrumentation-analytics.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/index.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/seats/01-immigration-pathway-eligibility.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/seats/02-ircc-reference-data.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/seats/03-canadian-privacy-casl.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/seats/04-consultancy-desk-ops.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/seats/05-platform-ads-meta-trust.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/seats/06-payments-escrow.ts` | scanned | js-ts-ast |
| `src/app/register/theory/sme/seats/07-consultancy-crm-book-connect.ts` | scanned | js-ts-ast |
| `src/app/register/theory/types.ts` | scanned | js-ts-ast |
| `src/app/register/theory/uiKindStyles.ts` | scanned | js-ts-ast |
| `src/app/register/theory/wiring/canonicalNodes.ts` | scanned | js-ts-ast |
| `src/app/register/theory/wiring/cantsAndFurnish.ts` | scanned | js-ts-ast |
| `src/app/register/theory/wiring/function/index.ts` | scanned | js-ts-ast |
| `src/app/register/theory/wiring/humanProvisioning.ts` | scanned | js-ts-ast |
| `src/app/register/theory/wiring/index.ts` | scanned | js-ts-ast |
| `src/app/register/theory/wiring/types.ts` | scanned | js-ts-ast |
| `src/app/register/theory/world.ts` | scanned | js-ts-ast |
| `src/app/register/trace/moduleShapes.ts` | scanned | js-ts-ast |
| `src/app/register/trace/RegisterTraceContext.tsx` | scanned | js-ts-ast |
| `src/app/register/trace/surfaceCatalog.ts` | scanned | js-ts-ast |
| `src/app/register/views/boardClientsView.ts` | scanned | js-ts-ast |
| `src/app/register/views/index.ts` | scanned | js-ts-ast |
| `src/app/register/views/loginSignInView.ts` | scanned | js-ts-ast |
| `src/app/register/views/loginVerifyView.ts` | scanned | js-ts-ast |
| `src/app/register/views/types.ts` | scanned | js-ts-ast |
| `src/app/Router.tsx` | scanned | js-ts-ast |
| `src/app/system-map/canvas/layout.ts` | scanned | js-ts-ast |
| `src/app/system-map/canvas/SystemMapNode.tsx` | scanned | js-ts-ast |
| `src/app/system-map/data/corpusSources.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/coverage.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/edges.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/model.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/modularity.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/nodes.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/submaps.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/tables.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/tableTypes.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/templates.ts` | scanned | js-ts-ast |
| `src/app/system-map/data/types.ts` | scanned | js-ts-ast |
| `src/app/system-map/sim/engine.ts` | scanned | js-ts-ast |
| `src/app/system-map/SystemMapPage.tsx` | scanned | js-ts-ast |
| `src/app/wire/activeFirm.ts` | scanned | js-ts-ast |
| `src/app/wire/contactSeatTypes.ts` | scanned | js-ts-ast |
| `src/app/wire/demoIds.ts` | scanned | js-ts-ast |
| `src/app/wire/firmBrand.ts` | scanned | js-ts-ast |
| `src/app/wire/fixtures/catalog.ts` | scanned | js-ts-ast |
| `src/app/wire/fixtures/store.ts` | scanned | js-ts-ast |
| `src/app/wire/http.ts` | scanned | js-ts-ast |
| `src/app/wire/index.ts` | scanned | js-ts-ast |
| `src/app/wire/machineTypes.ts` | scanned | js-ts-ast |
| `src/app/wire/ports.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/auditTrail.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/bootstrapFixtures.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/consentSilence.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/crmOAuth.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/espMailer.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/haltStore.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/index.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/machineApi.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/otpStore.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/primaryStore.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/sendingPool.ts` | scanned | js-ts-ast |
| `src/app/wire/reals/smsApi.ts` | scanned | js-ts-ast |
| `src/app/wire/registry.ts` | scanned | js-ts-ast |
| `src/app/wire/sessionFirm.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/auditTrail.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/consentSilence.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/contactSeatMirror.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/crmOAuth.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/enrichCrawl.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/escrow.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/espMailer.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/haltStore.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/index.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/ipPool.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/listUnsubscribe.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/machineApi.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/mailer.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/metaAds.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/otpStore.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/primaryStore.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/sendGate.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/sendingPool.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/smsApi.ts` | scanned | js-ts-ast |
| `src/app/wire/standins/warmup.ts` | scanned | js-ts-ast |
| `src/app/wire/useWireTick.ts` | scanned | js-ts-ast |
| `src/assets/notion-icons/arrows-up-down-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/bell-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/bell-slash-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/calendar-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/chart-bar-horizontal-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/chart-bar-line-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/chart-bar-vertical-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/checkmark-list-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/chevrons-down-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/circle-dashed-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/clock-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/cloud-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/compass-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/computer-window-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/cursor-click-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/dependency-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/directional-sign-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/document-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/document-arrow-up-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/documents-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/dot-circle-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/eye-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/eye-slash-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/filter-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/gear-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/git-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/graduation-cap-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/grid-square-2x2-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/house-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/information-circle-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/lightning-bolt-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/list-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/list-bullet-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/magnifying-glass-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/pencil-list-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/people-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/plus-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/square-dashed-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/tag-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/user-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/user-circle-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/user-squares-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/assets/notion-icons/wrench-55534e-icon.svg` | excluded | asset — binary/media asset |
| `src/imports/image-1.png` | excluded | asset — binary/media asset |
| `src/imports/image-2.png` | excluded | asset — binary/media asset |
| `src/imports/image-3.png` | excluded | asset — binary/media asset |
| `src/imports/image-4.png` | excluded | asset — binary/media asset |
| `src/imports/image-5.png` | excluded | asset — binary/media asset |
| `src/imports/image-6.png` | excluded | asset — binary/media asset |
| `src/imports/image.png` | excluded | asset — binary/media asset |
| `src/main-prototype-ant.tsx` | scanned | js-ts-ast |
| `src/main.tsx` | scanned | js-ts-ast |
| `src/styles/fonts.css` | scanned | css |
| `src/styles/globals.css` | scanned | css |
| `src/styles/index.css` | scanned | css |
| `src/styles/omcoda-marketing.css` | scanned | css |
| `src/styles/tailwind.css` | scanned | css |
| `src/styles/theme.css` | scanned | css |
| `supabase/migrations/001_auth_tables.sql` | scanned | sql |
| `supabase/migrations/002_applied_seeds.sql` | scanned | sql |
| `supabase/migrations/003_ct_wire_stores.sql` | scanned | sql |
| `supabase/migrations/004_machine_tables.sql` | scanned | sql |
| `supabase/migrations/005_actuation.sql` | scanned | sql |
| `supabase/migrations/006_workflow_trigger.sql` | scanned | sql |
| `supabase/migrations/007_meeting_booked.sql` | scanned | sql |
| `supabase/migrations/008_access_links.sql` | scanned | sql |
| `supabase/migrations/009_outbound_message_content.sql` | scanned | sql |
| `supabase/migrations/010_sequence_campaign_housing.sql` | scanned | sql |
| `supabase/migrations/011_channel_variations.sql` | scanned | sql |
| `supabase/migrations/012_grain_audience_one_timer.sql` | scanned | sql |
| `supabase/migrations/013_operator_book_people.sql` | scanned | sql |
| `supabase/migrations/014_contact_import.sql` | scanned | sql |
| `supabase/migrations/015_house_notes_handle.sql` | scanned | sql |
| `supabase/migrations/016_trigger_local_cascade.sql` | scanned | sql |
| `supabase/migrations/017_event_test_contract.sql` | scanned | sql |
| `supabase/migrations/018_collectible_fields.sql` | scanned | sql |
| `supabase/migrations/019_contact_seat.sql` | scanned | sql |
| `supabase/migrations/020_workspace_opt_out.sql` | scanned | sql |
| `supabase/migrations/021_objective_local_axis.sql` | scanned | sql |
| `supabase/migrations/022_pursuit_exhausted.sql` | scanned | sql |
| `supabase/migrations/023_operator_panes.sql` | scanned | sql |
| `supabase/migrations/024_wait_occupancy.sql` | scanned | sql |
| `supabase/seeds/001_tower_platform.sql` | scanned | sql |
| `supabase/seeds/002_machine_tables.sql` | scanned | sql |
| `supabase/seeds/003_canonical_workflows.sql` | scanned | sql |
| `supabase/seeds/004_contact_seat.sql` | scanned | sql |
| `supabase/seeds/005_contact_workspace_fill.sql` | scanned | sql |
| `supabase/seeds/006_objective_local_axis.sql` | scanned | sql |
| `supabase/seeds/007_pursuit_exhausted.sql` | scanned | sql |
| `supabase/seeds/008_constants_pack_keys.sql` | scanned | sql |
| `supabase/seeds/009_register_gaps.sql` | scanned | sql |
| `supabase/seeds/manifest.json` | scanned | config |
| `tower_logo_icon_dark-mode.png` | excluded | asset — binary/media asset |
| `tower_logo_icon_light-mode.png` | excluded | asset — binary/media asset |
| `tsconfig.json` | scanned | config |
| `V2-BACKLOG.md` | excluded | docs — markdown / not runtime construction |
| `vercel.json` | scanned | config |
| `vite.config.ts` | scanned | js-ts-ast |
