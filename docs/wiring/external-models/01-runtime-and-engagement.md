# External models — Runtime & engagement (Pass A)

**Audience:** CTO  
**Zone:** Agentic engagement runtime · send / enroll / halt paths · Automations / Agents CT workbenches  
**Think Stack facets (primary):** Core Application & Runtime · Data Storage & Management  
**Inputs:** [`../CTO-THINK-STACK.md`](../CTO-THINK-STACK.md) · [`00-PASS-BRIEF.md`](./00-PASS-BRIEF.md) · [`../../sme/capability/C2-agentic-engagement-runtime.md`](../../sme/capability/C2-agentic-engagement-runtime.md) · [`../paper-trace/function/C2-agentic-engagement-runtime.md`](../paper-trace/function/C2-agentic-engagement-runtime.md) · [`../../register/how/operator-configuration-libraries.md`](../../register/how/operator-configuration-libraries.md) · [`../../register/how/consultant-governance.md`](../../register/how/consultant-governance.md) · [`../../register/how/consultant-core.md`](../../register/how/consultant-core.md) · CT Automations/Agents/Activity (`prototype-ant` workbenches)  
**Status:** Inventory + model contracts only. Do not wire the app in this file.

---

## Scope of accomplishments

Dense C2 + CT paths that leave pure UI / React state:

| Accomplishment cluster | Must be true outside the browser chrome |
|---|---|
| **Read → decide → act** | Inbound reply capture, closed-set intent, tool-bounded next act, Send-gate re-check, chronology |
| **Send** | Armed/Active posture, gate allow → outbound accept, delivery/open/click evidence back into criteria |
| **Enroll** | Automation trigger → enroll-into-template → sequence instance under bound packs / campaign calendar |
| **Halt / suppress** | Consultant Halt, stop/hostile/silence, Send gates deny, runners cancel pending jobs |
| **CT workbenches** | Publish version (libraries), Workflow canvas enroll actions, Agent/sequence rulesets, Activity chronology reads |

---

## Canonical externals (deduplicated)

| id | system | facet | why (accomplishments) | sources (impl/How/paper) | modelTag | modelContract (inputs → outputs / who reads) |
|---|---|---|---|---|---|---|
| `durable-store` | Durable engagement + library state store (process-boundary DB) | Data Storage | Sequence instances, enrollments, rule-set versions, bind posture, threads, chronology, tickets must survive reload and be shared by runners — not React state | C2 agent-07/12/13/23/24; paper `sequence_*`, `engagement_*`, `firm_operations_bind`, `firm_tenancy`; How Configuration libraries Publish · Firm operations bind · Engagement record (Activity) | **modelable** | **In:** upserts for pack versions, bind, enrollment, attempt/owner state, thread rows, finish/arm. **Out:** keyed reads by firm/contact/sequence. **Readers:** attempt runner, enrollment engine, Send gates, Conversations, Engagement record/Activity, Audit, CT workbenches |
| `messaging-event-stream` | Append-only messaging / runtime event stream | Data Storage · Core Runtime | Shared send/delivery/reply/form/classify/act events feed criteria, Engagement record, C7 metrics adjacency | C2 agent-01/10/23; paper `messaging_event_stream`; seed fusion C1+C2+C7 | **modelable** | **In:** normalized event appends (idempotent keys). **Out:** ordered event feed + projections. **Readers:** criteria windows, Engagement record/Activity, triage snapshot, analytics later |
| `attempt-job-queue` | Scheduled attempt / retry job queue + runner | Core Runtime · Infra | Local retries, owner escalations, Armed prepare vs Active send, cancel-on-inbound races | C2 agent-09/11/15/24; paper `attempt_job_queue`, `engagement_attempt` | **modelable** | **In:** schedule/cancel jobs `{sequenceId, owner, attemptN, fireAt, purpose}`. **Out:** due jobs → gate check → send or deny; cancel ack. **Readers:** engagement runner; Engagement record (nullify/schedule rows); Firm health |
| `engagement-send-runtime` | Outbound CEM / channel send accept plane (ESP/SMS provider edge) | External Systems · Core Runtime | Contact-facing sends after gate allow; message ids for delivery linkage | C2 agent-05/14/15/24; paper `outbound_message`, `send_gate_decision`; How Firm bind Armed/Active; stand-in `mailer` (partial, OTP+cem purpose) | **modelable** | **In:** `{to, channel, template/step, firmFrom, purpose: cem\|system}`. **Out:** `{messageId, acceptedAt}` or reject. **Readers:** messaging stream, criteria, Engagement record. *Real ESP cutover later; DNS/warmup separate (human).* |
| `messaging-provider-ingress` | Provider webhook / inbound reply + delivery receipt plane | External Systems | Inbound replies, STOP keywords, delivery/open/click, bounce/complaint adjacency for criteria and stop | C2 agent-01/03/06/10/11; paper `provider_webhook_receipt` → `messaging_event_stream` | **modelable** | **In:** signed provider payloads (or stand-in inject). **Out:** idempotent receipt + normalized stream events. **Readers:** intent classifier, attempt nullify, suppression plane, Engagement record |
| `form-activity-ingress` | Live form visit / submit signal plane | External Systems · Core Runtime | Nullify in-flight attempts on form visit; finishing predicate on submit; criteria windows | C2 agent-10/11/12; paper `form_activity_event` | **modelable** | **In:** `{contactId, formId, kind: visit\|submit\|start, at}`. **Out:** stream events + finish/nullify hooks. **Readers:** attempt queue, finish state, Engagement record |
| `template-enrollment-engine` | Automation → enroll-into-template / arm-next engine | Core Runtime | Workflow canvas enroll actions; calendar day → sequence instance; finish → arm successor | C2 agent-12/13; paper `campaign_calendar`, `sequence_enrollment`, `sequence_instance`; How Automation workflows · Agent workbench contacts tab | **modelable** | **In:** `{firmId, contactId, templateVersionId, cause: workflow\|calendar\|finish-arm, posture}`. **Out:** enrollment row + sequence instance (or deny: readiness/halt/suppression). **Readers:** attempt runner, Agent contacts tab, Board phase chips |
| `pack-library-store` | Published configuration library versions (Automation / Engagement / Evaluation packs) | Data Storage | CT Publish version must persist authored graphs/rulesets for bind dropdowns — authorship leaves the editor | How operator-configuration-libraries 1.1–1.3; CT AntAutomationWorkbench / AntAgentWorkbench; paper `sequence_rule_set` | **modelable** | **In:** draft edit + Publish version. **Out:** immutable version id + payload. **Readers:** Firm operations bind dropdowns; enrollment engine; runtime rule loader. *(May physically share `durable-store`; named for contract clarity.)* |
| `send-gate-plane` | Send-gate decision service (consent · silence · suppression · posture · halt) | Core Runtime · Identity/Compliance | Every calendar send, reply-driven act, and channel escalation re-enters gates | C2 agent-05/15/24; paper `send_gate_decision`, `consent_record`, `suppression_list`, `firm_operations_bind`; How Send gates / Halt / Silence / Founder kill-switch | **modelable** | **In:** `{firmId, contactId, channel, purpose, trigger}`. **Out:** allow/deny + reason chips. **Readers:** engagement-send-runtime, attempt queue, Conversations triage, Engagement record |
| `suppression-halt-plane` | Suppression + halt / silence enforcement store | Data Storage · Identity/Compliance | Stop/hostile/opt-out/halt/kill-switch must fail-closed for runners; consultant Confirm halt writes here | C2 agent-03/17; How consultant-governance Halt; contact-silence; founder Kill-switch; paper `suppression_list`; stand-in `haltStore` (partial) | **modelable** | **In:** halt commit / lift; stop/hostile/silence/suppress upserts; founder kill-switch. **Out:** active deny sets by contact/firm/channel. **Readers:** send-gate-plane, enrollment engine, attempt cancel. *Human refuse itself is human-only; the store/contract is modelable.* |
| `intent-classifier` | Closed-set reply intent classification service | Core Runtime · External Systems | booked / question / stop / hostile / unsure (+ OOO pause class) before decide→act | C2 agent-02/03/04/06/14; paper `intent_classification` | **modelable** | **In:** `{replyText, channel, threadId, confidenceFloor}`. **Out:** `{intent, confidence, terminal?}`. **Readers:** runtime tool chooser, escalation opener, Engagement record. *Fake deterministic classifier OK for CT; real NLU/LLM later behind same I/O.* |
| `runtime-tool-executor` | Constrained agent tool-invocation plane (no free-form send) | Core Runtime | Decide→act closed tool set: classify, cancel, schedule, suppress, escalate, arm-next | C2 agent-14/16/20; paper `runtime_tool_invocation` | **modelable** | **In:** `{tool, args, intent, owner, sequenceId}`. **Out:** tool result + gate result; never raw free-form CEM. **Readers:** audit-trail, Engagement record, attempt queue / suppression / escalation |
| `escalation-ticket-queue` | HITL escalation → Customer support ticket queue | Core Runtime · Data Storage | Unsure/hostile/policy-edge pauses → Ticket with context bundle; disposition resumes/closes | C2 agent-16–20; paper `escalation_ticket`, `support_context_bundle`, `human_disposition`; How operator-support Ticket queue | **modelable** | **In:** open `{reason, priority, contextBundle}`; disposition `{reclassify\|resume\|close\|keep-suppressed}`. **Out:** ticket rows + disposition events. **Readers:** Conversations, Support CT, Engagement record, attempt unpause |
| `audit-trail-ledger` | Append-only audit / change + tool-act ledger | Data Storage · Identity/Compliance | Halt, Publish, Bind, tool acts, escalations must be accountable outside UI memory | C2 agent-14/19/23; How operator-audit-trail; paper `audit_trail`; stand-in `auditTrail` (partial) | **modelable** | **In:** append `{actor, kind, subject, payload}`. **Out:** filterable event list. **Readers:** Audit trail module, Support context, wire proofs |
| `consent-silence-ledger` | Consent + channel-scope + silence legal state | Data Storage · Identity/Compliance | Channel escalation and CEM leave require channel-scoped consent; silence stops automatic motion | C2 agent-05/15; How contact-consent · contact-silence; paper `consent_record` | **modelable** | **In:** Agree/Ignore/Silence commits; channel scope. **Out:** consent/silence snapshot. **Readers:** send-gate-plane, support context bundle, Book readiness adjacency |
| `otp-auth-challenge-store` | Login OTP challenge store (auth boundary) | Identity · External | Login Send code / Verify leaves browser; not engagement core but shares mailer | Wire log LOGIN-OTP; stand-in `otpStore` · `mailer` | **modelable** | **In:** issue(email) / verify(challengeId, code). **Out:** challenge + sessionToken or deny. **Readers:** Login CT. *Listed because already stand-in-wired; not a C2 densify driver.* |
| `sms-send-provider` | SMS / A2P outbound + STOP ingress | External Systems | Channel-ownership tree includes SMS escalation when authored | C2 agent-07/15; HUMAN-PROVISIONING `sms_sender_registration` | **defer** | Not densified as V1 CT send path; contract mirrors email send+ingress when named. TCR/brand registration remains human-only residue. |
| `sending-identity-dns` | Firm sending domain / DKIM / DMARC / warmup posture | External · Infra · Identity | Real branded CEM leave needs DNS + warmup — irreducible human provisioning | HUMAN-PROVISIONING-SET sending identity nodes; C1 adjacency honored by C2 gates | **human-only** | **In-app side only:** readiness flags consumed by send-gate-plane (`sending_identity_ready`). **Human:** DNS publish, domain approval, warmup calendar-time. Do not fake real DNS. |
| `consultant-halt-refusal` | Human license refusal (consultant Confirm halt) | Identity · Compliance | Hard human gate — product cannot invent the refuse | How consultant-governance 1.2; World hard gate | **human-only** | **Model in-app side:** haltStore commit I/O after Confirm. **Human residue:** the decision to refuse. Runner honor is `suppression-halt-plane` (modelable). |
| `counsel-silence-law` | CASL / stop / silence legal interpretation | Identity · Compliance | Seat 3 owns silence law content; runtime only honors ledger effects | C2 boundaries (not CASL counsel); agent-03 handoff | **human-only** | **In-app:** honor `consent-silence-ledger` + suppression entries. **Human:** counsel policy text / jurisdiction rules authorship — not a fake ESP. |

---

## Already partially modeled (`src/app/wire/standins/`)

Present on branch `cursor/wire-standins-ffe4` (ports in `src/app/wire/ports.ts`). Map to this inventory:

| Stand-in module | Port | Maps to external id | Coverage note |
|---|---|---|---|
| `mailer.ts` | `MailerPort` | `engagement-send-runtime` (+ OTP mail) | Outbox accept only; no delivery/open/click webhooks yet |
| `otpStore.ts` | `OtpStorePort` | `otp-auth-challenge-store` | Login path wired; not engagement |
| `haltStore.ts` | `HaltStorePort` | `suppression-halt-plane` (halt facet) | Contact / firm-book halt + lift; does **not** yet unify stop/hostile/silence/ESP suppressions |
| `auditTrail.ts` | `AuditTrailPort` | `audit-trail-ledger` | Append/list; Halt writes through it |

**Gaps vs densified C2:** no stand-ins yet for `attempt-job-queue`, `template-enrollment-engine`, `messaging-provider-ingress`, `form-activity-ingress`, `intent-classifier`, `runtime-tool-executor`, `escalation-ticket-queue`, full `suppression-halt-plane`, or shared `durable-store` / `messaging-event-stream` / `pack-library-store`.

---

## CT Automations / Agents / Activity — boundary reads

| CT surface | Writes that leave UI | Reads that need fake runtime |
|---|---|---|
| **Automations** (Workflow canvas · Publish version) | `pack-library-store` publish; enroll action nodes → `template-enrollment-engine` | Enrollment outcomes; run/deny reasons |
| **Agents** (sequence editor · Publish · contacts/activity tabs) | `pack-library-store` / `sequence_rule_set`; contacts enrollment/suppression rules | `attempt-job-queue` motion; Activity = Engagement record + stream |
| **Activity** (consultant Engagement record chronology) | *(read-only)* triage/halt may append via tools/halt | `messaging-event-stream` + `engagement_record` projection — never authorship |
| **Halt outreach** | `suppression-halt-plane` + `audit-trail-ledger` | Send gates / runners honor (already partial stand-in) |

---

## Tag counts (this file)

| Tag | Count | ids |
|---|---|---|
| **modelable** | **16** | `durable-store`, `messaging-event-stream`, `attempt-job-queue`, `engagement-send-runtime`, `messaging-provider-ingress`, `form-activity-ingress`, `template-enrollment-engine`, `pack-library-store`, `send-gate-plane`, `suppression-halt-plane`, `intent-classifier`, `runtime-tool-executor`, `escalation-ticket-queue`, `audit-trail-ledger`, `consent-silence-ledger`, `otp-auth-challenge-store` |
| **human-only** | **3** | `sending-identity-dns`, `consultant-halt-refusal`, `counsel-silence-law` |
| **defer** | **1** | `sms-send-provider` |

**Totals: modelable 16 · human-only 3 · defer 1** (20 distinct boundary systems).  
Engagement-core subset (excluding OTP auth adjacency): modelable **15** · human-only **3** · defer **1**.

---

## CTO notes — what a fake runtime must mimic

A CT-worthy fake engagement runtime is **not** a table of static Activity rows. It must mimic the **fail-closed loop**:

1. **Posture** — Armed prepares/schedules; Active may CEM; unbound/halted/suppressed never speak.  
2. **Single owner** — one channel owns; attempts nest locally; jobs cancel when inbound/form wins the race.  
3. **Gate every leave** — calendar send, reply-driven tool, and escalation all re-enter Send gates (consent · silence · suppression · halt · bind).  
4. **Closed tools** — classify → schedule / nullify / suppress / escalate / arm-next; no free-form LLM send as control plane.  
5. **Durable truth** — enrollments, jobs, suppressions, tickets, and chronology survive refresh and are the same objects Automations/Agents/Activity/Halt read.

Stand-ins should expose those contracts (schedule/cancel, accept send, inject inbound, commit halt, append audit) even when the “provider” is in-process memory — so densified CT click-paths exercise real app code against fake systems.
