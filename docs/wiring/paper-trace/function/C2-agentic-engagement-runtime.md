# Function traces — C2 Agentic engagement runtime
**Pass:** Think Stack Wiring Function (paper)
**Source:** ../../sme/capability/C2-agentic-engagement-runtime.md
**Items:** 24

## Local node list (discovered)

- `provider_webhook_receipt`
- `messaging_event_stream`
- `conversation_thread`
- `intent_classification`
- `engagement_attempt`
- `send_gate_decision`
- `outbound_message`
- `engagement_record`
- `suppression_list`
- `escalation_ticket`
- `consent_record`
- `firm_operations_bind`
- `firm_tenancy`
- `sequence_enrollment`
- `sequence_instance`
- `sequence_rule_set`
- `campaign_calendar`
- `criteria_window`
- `form_activity_event`
- `attempt_job_queue`
- `sequence_finish_state`
- `auto_reply_pause`
- `runtime_tool_invocation`
- `support_context_bundle`
- `human_disposition`
- `triage_context_snapshot`
- `audit_trail`

### `agent-01` — `Inbound replies are first-class conversation events, not optional log lines`
**Implementation (source):** Conversations and Engagement record now show inbound replies as durable thread events linked to the prior outbound, and active firm runners consume the same stream before scheduling more motion.
**Start:** `Starting from provider_webhook_receipt (existing)`
**Path:**
1. When an inbound participant reply webhook occurs at `provider_webhook_receipt`, an inbound reply event is appended at `messaging_event_stream`. idempotent
2. When the inbound reply event occurs at `messaging_event_stream`, the channel thread and prior outbound linkage are updated at `conversation_thread`. encrypted
3. When the linked reply appears at `conversation_thread`, a pending read request occurs at `intent_classification`.
4. When reply capture completes at `conversation_thread`, inbound-received chronology occurs at `engagement_record`.
5. When the inbound reply event occurs at `messaging_event_stream`, the active owner is marked reply-interrupted at `engagement_attempt`.
**Nodes touched:**
- `provider_webhook_receipt`
- `messaging_event_stream`
- `conversation_thread`
- `intent_classification`
- `engagement_record`
- `engagement_attempt`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-02` — `Closed intent set: booked / question / stop / hostile (plus unsure)`
**Implementation (source):** Conversations, Engagement record, and sequence policy now use the same closed reply intent set rather than per-template free-text labels.
**Start:** `Starting from conversation_thread (existing)`
**Path:**
1. When an unclassified inbound reply occurs at `conversation_thread`, a closed-set classification request occurs at `intent_classification`.
2. When classification completion occurs at `intent_classification`, exactly one class and confidence occur at `intent_classification`.
3. When the closed intent result occurs at `intent_classification`, the thread's current intent marker changes at `conversation_thread`.
4. When the intent marker changes at `conversation_thread`, classified-reply chronology occurs at `engagement_record`.
5. When the classified class occurs at `intent_classification`, next-action eligibility changes at `engagement_attempt`.
**Nodes touched:**
- `conversation_thread`
- `intent_classification`
- `engagement_record`
- `engagement_attempt`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance.

### `agent-03` — `Stop / opt-out language is a hard intent that freezes CEMs`
**Implementation (source):** Stop-class language and provider STOP keywords now classify as terminal, suppress automatic CEMs, freeze attempts, and record the stop-to-suppression chain.
**Start:** `Starting from provider_webhook_receipt (existing)`
**Path:**
1. When a STOP keyword or stop-language reply occurs at `provider_webhook_receipt`, an inbound reply event is appended at `messaging_event_stream`. idempotent
2. When the stop reply event occurs at `messaging_event_stream`, terminal stop intent is written at `intent_classification`.
3. When terminal stop intent occurs at `intent_classification`, a channel/contact suppression entry occurs at `suppression_list`. under jurisdiction
4. When the suppression entry occurs at `suppression_list`, a deny result for automatic CEMs occurs at `send_gate_decision`.
5. When the deny result occurs at `send_gate_decision`, the active owner and pending attempts are frozen at `engagement_attempt`.
6. When the attempt freeze occurs at `engagement_attempt`, stop-to-suppression chronology occurs at `engagement_record`.
**Nodes touched:**
- `provider_webhook_receipt`
- `messaging_event_stream`
- `intent_classification`
- `suppression_list`
- `send_gate_decision`
- `engagement_attempt`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-04` — `Low-confidence / no-match must not invent an intent`
**Implementation (source):** Low-confidence replies now become `unsure`, pause automatic owner motion, and open human review before the runtime acts.
**Start:** `Starting from intent_classification (existing)`
**Path:**
1. When a reply cannot meet the confidence floor at `intent_classification`, an `unsure` result occurs at `intent_classification`.
2. When `unsure` occurs at `intent_classification`, automatic next-attempt eligibility is paused at `engagement_attempt`.
3. When the pause occurs at `engagement_attempt`, a review item with reply context occurs at `escalation_ticket`.
4. When the review item occurs at `escalation_ticket`, escalated-thread state occurs at `conversation_thread`.
5. When escalated-thread state occurs at `conversation_thread`, fail-closed chronology occurs at `engagement_record`.
**Nodes touched:**
- `intent_classification`
- `engagement_attempt`
- `escalation_ticket`
- `conversation_thread`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-05` — `Classification always re-enters Send gates before the next send`
**Implementation (source):** Every classified inbound now forces a post-reply gate check before any next attempt can schedule or send.
**Start:** `Starting from intent_classification (existing)`
**Path:**
1. When a non-terminal intent result occurs at `intent_classification`, a post-reply gate evaluation occurs at `send_gate_decision`.
2. When the gate evaluation occurs at `send_gate_decision`, consent, suppression, and firm posture are read from `consent_record`, `suppression_list`, and `firm_operations_bind`.
3. When gate deny occurs at `send_gate_decision`, blocked next-owner action occurs at `engagement_attempt`. idempotent
4. When the gate allows at `send_gate_decision`, eligible next-attempt state occurs at `engagement_attempt`.
5. When eligible next-attempt state occurs at `engagement_attempt`, any later send instance is created at `outbound_message`.
6. When the gate result occurs at `send_gate_decision`, post-reply allow or deny chronology occurs at `engagement_record`.
**Nodes touched:**
- `intent_classification`
- `send_gate_decision`
- `consent_record`
- `suppression_list`
- `firm_operations_bind`
- `engagement_attempt`
- `outbound_message`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations; External Systems.

### `agent-06` — `Auto-replies / OOO are not finishing “replied” intents`
**Implementation (source):** Out-of-office and machine replies now pause under the owning channel, with a bounded resume policy, instead of finishing the engagement as human intent.
**Start:** `Starting from provider_webhook_receipt (existing)`
**Path:**
1. When an auto-reply or OOO inbound occurs at `provider_webhook_receipt`, the inbound event is appended at `messaging_event_stream`. idempotent
2. When the auto-reply signal occurs at `messaging_event_stream`, non-human pause classification occurs at `intent_classification`.
3. When non-human pause classification occurs at `intent_classification`, an OOO pause window occurs at `auto_reply_pause`.
4. When the OOO pause window occurs at `auto_reply_pause`, the current channel owner is held at `engagement_attempt`.
5. When resume-window maturity occurs at `auto_reply_pause`, re-entry eligibility recheck occurs at `send_gate_decision`.
6. When the pause or resume state changes at `auto_reply_pause`, pause chronology occurs at `engagement_record`.
**Nodes touched:**
- `provider_webhook_receipt`
- `messaging_event_stream`
- `intent_classification`
- `auto_reply_pause`
- `engagement_attempt`
- `send_gate_decision`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-07` — `Exactly one channel owns the flow at a time`
**Implementation (source):** Active runners now expose and enforce a single owning channel, with attempts nested under that owner and dual-owner schedules refused.
**Start:** `Starting from firm_operations_bind (new)`
**Path:**
1. When a sequence becomes Active for a firm at `firm_operations_bind`, an active sequence instance occurs at `sequence_instance`.
2. When sequence-instance activation occurs at `sequence_instance`, single channel owner assignment occurs at `engagement_attempt`.
3. When another owner schedule request occurs while one owner is active at `engagement_attempt`, request rejection occurs at `engagement_attempt`. idempotent
4. When the active owner schedules an outbound attempt at `engagement_attempt`, gate evaluation occurs at `send_gate_decision`.
5. When the active-owner state changes at `engagement_attempt`, owner chronology occurs at `engagement_record`.
**Nodes touched:**
- `firm_operations_bind`
- `sequence_instance`
- `engagement_attempt`
- `send_gate_decision`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-08` — `Happy-path handoff is forward-only when criteria are met`
**Implementation (source):** Authored owner order now moves only forward when the current owner's criteria fire, with no backward re-entry outside a new local attempt.
**Start:** `Starting from sequence_rule_set (new)`
**Path:**
1. When forward owner order authorship occurs at `sequence_rule_set`, ordered owner state occurs at `sequence_instance`.
2. When a current-owner success or failure criterion occurs at `messaging_event_stream`, the matching window is satisfied at `criteria_window`.
3. When the criteria window is satisfied at `criteria_window`, a forward-only owner transition occurs at `engagement_attempt`.
4. When the forward owner transition occurs at `engagement_attempt`, channel-specific permission recheck occurs at `send_gate_decision`.
5. When the transition is accepted at `engagement_attempt`, handoff chronology occurs at `engagement_record`.
**Nodes touched:**
- `sequence_rule_set`
- `sequence_instance`
- `messaging_event_stream`
- `criteria_window`
- `engagement_attempt`
- `send_gate_decision`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-09` — `Attempts are local retries under the failed channel, not a global Attempt N`
**Implementation (source):** Attempt counters now live under the failed owning channel, and thread and record context show the same nested owner.
**Start:** `Starting from engagement_attempt (existing)`
**Path:**
1. When an owner-level failure condition occurs at `engagement_attempt`, a local retry cycle is created under that same owner at `engagement_attempt`.
2. When the local retry cycle occurs at `engagement_attempt`, a scheduled retry job occurs at `attempt_job_queue`.
3. When the retry job is armed at `attempt_job_queue`, gate evaluation for the same owner occurs at `send_gate_decision`.
4. When inbound reply arrival during the retry cycle occurs at `conversation_thread`, nested owner context update occurs at `conversation_thread`.
5. When the local retry cycle changes at `engagement_attempt`, local-attempt chronology occurs at `engagement_record`.
**Nodes touched:**
- `engagement_attempt`
- `attempt_job_queue`
- `send_gate_decision`
- `conversation_thread`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-10` — `Criteria windows drive non-reply escalation between owners`
**Implementation (source):** Delivery, open, click, form, and elapsed-window signals now drive owner escalation instead of blind timers.
**Start:** `Starting from messaging_event_stream (existing)`
**Path:**
1. When delivered, opened, clicked, or elapsed message evidence occurs at `messaging_event_stream`, criteria evidence is evaluated at `criteria_window`.
2. When form started or submitted evidence occurs at `form_activity_event`, criteria evidence is evaluated at `criteria_window`.
3. When the authored criteria window is satisfied at `criteria_window`, non-reply transition eligibility occurs at `engagement_attempt`.
4. When transition eligibility occurs at `engagement_attempt`, channel and posture recheck occurs at `send_gate_decision`.
5. When the transition is applied at `engagement_attempt`, criteria-caused handoff chronology occurs at `engagement_record`.
**Nodes touched:**
- `messaging_event_stream`
- `form_activity_event`
- `criteria_window`
- `engagement_attempt`
- `send_gate_decision`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-11` — `Live inbound (and live form visit) nullifies in-flight attempts`
**Implementation (source):** Live replies and form activity now hard-cancel pending scheduled attempts before intent policy or criteria policy can continue.
**Start:** `Starting from messaging_event_stream (existing)`
**Path:**
1. When a live inbound reply occurs at `messaging_event_stream`, the active pending job is marked nullified at `engagement_attempt`. within race boundary · idempotent
2. When a live form visit occurs at `form_activity_event`, the active pending job is marked nullified at `engagement_attempt`. within race boundary · idempotent
3. When pending job nullification occurs at `engagement_attempt`, scheduled-send cancellation occurs at `attempt_job_queue`.
4. When the job cancellation occurs at `attempt_job_queue`, classification or form policy evaluation continues at `intent_classification` or `criteria_window`.
5. When nullification completes at `engagement_attempt`, attempt-nullified chronology occurs at `engagement_record`.
**Nodes touched:**
- `messaging_event_stream`
- `form_activity_event`
- `engagement_attempt`
- `attempt_job_queue`
- `intent_classification`
- `criteria_window`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; External Systems; Infrastructure & Operations; Identity / Security / Compliance.

### `agent-12` — `Finishing events close the sequence and may arm the next`
**Implementation (source):** Booked, form-submitted, terminal no-reply, stop, and human close now finish the current sequence and can arm the next authored peer.
**Start:** `Starting from sequence_finish_state (new)`
**Path:**
1. When booked or stop intent occurs at `intent_classification`, a finishing predicate is written at `sequence_finish_state`.
2. When form submitted occurs at `form_activity_event`, a goal-met predicate is written at `sequence_finish_state`.
3. When terminal no-reply occurs at `engagement_attempt`, a no-reply predicate is written at `sequence_finish_state`.
4. When a finishing predicate occurs at `sequence_finish_state`, the active sequence closes at `sequence_instance`.
5. When the closed sequence has an authored successor at `sequence_rule_set`, next-sequence armed state occurs at `sequence_enrollment`.
6. When close or arm state occurs at `sequence_instance` or `sequence_enrollment`, finishing chronology occurs at `engagement_record`.
**Nodes touched:**
- `sequence_finish_state`
- `intent_classification`
- `form_activity_event`
- `engagement_attempt`
- `sequence_instance`
- `sequence_rule_set`
- `sequence_enrollment`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-13` — `Campaign calendar and attempt engine are two layers — do not conflate`
**Implementation (source):** Day-ordered campaign content now enrolls a sequence instance, while owner and attempt law runs inside the attempt engine as separate state.
**Start:** `Starting from campaign_calendar (new)`
**Path:**
1. When a campaign day becomes eligible at `campaign_calendar`, sequence enrollment state occurs at `sequence_enrollment`.
2. When enrollment occurs at `sequence_enrollment`, a runtime sequence instance occurs at `sequence_instance`.
3. When the runtime sequence instance occurs at `sequence_instance`, owner and attempt rules are loaded from `sequence_rule_set`.
4. When owner rules are loaded from `sequence_rule_set`, active owner state occurs at `engagement_attempt`.
5. When calendar phase or owner attempt state change occurs at `campaign_calendar` or `engagement_attempt`, distinct chronology entries occur at `engagement_record`.
**Nodes touched:**
- `campaign_calendar`
- `sequence_enrollment`
- `sequence_instance`
- `sequence_rule_set`
- `engagement_attempt`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Infrastructure & Operations; Cost / FinOps.

### `agent-14` — `Decide→act uses constrained tool-use, not free-form LLM sends`
**Implementation (source):** Runtime decisions now execute through a closed tool set that re-enters Send gates and records tool name, intent, owner, and gate result.
**Start:** `Starting from intent_classification (existing)`
**Path:**
1. When an actionable intent occurs at `intent_classification`, a closed tool choice occurs at `runtime_tool_invocation`.
2. When a send-like tool choice occurs at `runtime_tool_invocation`, gate evaluation occurs at `send_gate_decision`.
3. When the gate allows at `send_gate_decision`, owner action state changes at `engagement_attempt` and any send instance occurs at `outbound_message`.
4. When the gate denies at `send_gate_decision`, tool failure state occurs at `runtime_tool_invocation` and no send occurs at `outbound_message`.
5. When any tool act resolves at `runtime_tool_invocation`, tool audit state occurs at `audit_trail`.
6. When the tool act changes runtime state at `runtime_tool_invocation`, tool-act chronology occurs at `engagement_record`.
**Nodes touched:**
- `intent_classification`
- `runtime_tool_invocation`
- `send_gate_decision`
- `engagement_attempt`
- `outbound_message`
- `audit_trail`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations; External Systems; Cost / FinOps.

### `agent-15` — `Channel escalation still requires channel-scoped consent and suppression clearance`
**Implementation (source):** Forward channel escalation now checks channel-scoped consent and suppression before the attempt engine can treat escalation as allowed.
**Start:** `Starting from engagement_attempt (existing)`
**Path:**
1. When owner escalation eligibility occurs at `engagement_attempt`, channel permission evaluation occurs at `send_gate_decision`.
2. When permission evaluation occurs at `send_gate_decision`, channel scope is read at `consent_record`.
3. When permission evaluation occurs at `send_gate_decision`, address and channel suppression are read at `suppression_list`.
4. When consent or suppression denies at `send_gate_decision`, blocked escalation state occurs at `engagement_attempt`. under jurisdiction
5. When consent and suppression allow at `send_gate_decision`, next-owner scheduling occurs at `attempt_job_queue`.
6. When escalation is blocked or allowed at `engagement_attempt`, channel-scope chronology occurs at `engagement_record`.
**Nodes touched:**
- `engagement_attempt`
- `send_gate_decision`
- `consent_record`
- `suppression_list`
- `attempt_job_queue`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations; External Systems.

### `agent-16` — `Unsure and policy edge cases open Escalation queue, not silent continue`
**Implementation (source):** Unsure replies, policy edges, and failed tool preconditions now pause automatic attempts and open an escalation item.
**Start:** `Starting from intent_classification (existing)`
**Path:**
1. When `unsure` or policy-edge classification occurs at `intent_classification`, automatic action pause occurs at `engagement_attempt`.
2. When a tool precondition fails at `runtime_tool_invocation`, automatic action pause occurs at `engagement_attempt`.
3. When action pause occurs at `engagement_attempt`, an escalation item occurs at `escalation_ticket`.
4. When the escalation item occurs at `escalation_ticket`, escalated status occurs at `conversation_thread`.
5. When escalated status occurs at `conversation_thread`, escalation-opened chronology occurs at `engagement_record`.
**Nodes touched:**
- `intent_classification`
- `runtime_tool_invocation`
- `engagement_attempt`
- `escalation_ticket`
- `conversation_thread`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-17` — `Hostile intent halts automatic CEMs and escalates immediately`
**Implementation (source):** Hostile replies now suppress automatic outreach for the contact sequence, halt attempts, and open a high-priority human escalation.
**Start:** `Starting from intent_classification (existing)`
**Path:**
1. When hostile intent occurs at `intent_classification`, automatic CEM suppression occurs at `suppression_list`.
2. When automatic CEM suppression occurs at `suppression_list`, deny state occurs at `send_gate_decision`.
3. When deny state occurs at `send_gate_decision`, current and pending attempts halt at `engagement_attempt`.
4. When hostile intent occurs at `intent_classification`, a high-priority escalation item occurs at `escalation_ticket`.
5. When halt and escalation state occur at `engagement_attempt` and `escalation_ticket`, hostile-halt chronology occurs at `engagement_record`.
**Nodes touched:**
- `intent_classification`
- `suppression_list`
- `send_gate_decision`
- `engagement_attempt`
- `escalation_ticket`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-18` — `Escalation queue items land in Customer support Ticket queue with engagement context`
**Implementation (source):** Runtime escalations now materialize as engagement-escalation tickets with thread, intent, owner, last-send, firm, and contact context.
**Start:** `Starting from escalation_ticket (existing)`
**Path:**
1. When runtime escalation opening occurs at `escalation_ticket`, engagement-escalation typing occurs at `escalation_ticket`.
2. When engagement-escalation typing occurs at `escalation_ticket`, support context is assembled at `support_context_bundle`.
3. When support context assembly occurs at `support_context_bundle`, thread linkage occurs at `conversation_thread`.
4. When the ticket and context are ready at `escalation_ticket`, ticket-opened chronology occurs at `engagement_record`.
5. When escalation item work occurs at `escalation_ticket`, the same support queue item state occurs at `escalation_ticket`. idempotent
**Nodes touched:**
- `escalation_ticket`
- `support_context_bundle`
- `conversation_thread`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations; Cost / FinOps.

### `agent-19` — `Escalation policy carries priority, reason codes, and required context bundle`
**Implementation (source):** Each escalation now carries reason, priority, verbatim reply, confidence, sequence, owner, pending attempt, and consent/silence snapshot.
**Start:** `Starting from escalation_ticket (existing)`
**Path:**
1. When an escalation reason occurs at `escalation_ticket`, reason code and priority state occur at `escalation_ticket`.
2. When reason and priority occur at `escalation_ticket`, reply and thread context gathering occurs at `support_context_bundle`.
3. When context gathering occurs at `support_context_bundle`, confidence and class are gathered from `intent_classification`.
4. When context gathering occurs at `support_context_bundle`, owner and pending attempt are gathered from `engagement_attempt`.
5. When context gathering occurs at `support_context_bundle`, consent and gate posture are gathered from `consent_record` and `send_gate_decision`.
6. When the bundle is complete at `support_context_bundle`, escalation audit state occurs at `audit_trail`.
**Nodes touched:**
- `escalation_ticket`
- `support_context_bundle`
- `conversation_thread`
- `intent_classification`
- `engagement_attempt`
- `consent_record`
- `send_gate_decision`
- `audit_trail`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-20` — `Human resolution resumes, reclassifies, or closes — never silent drop`
**Implementation (source):** Human handling now returns an explicit disposition that reclassifies, resumes, closes, or keeps suppression in durable runtime state.
**Start:** `Starting from escalation_ticket (existing)`
**Path:**
1. When a human resolves an escalation at `escalation_ticket`, explicit disposition state occurs at `human_disposition`.
2. When reclassify disposition occurs at `human_disposition`, corrected class state occurs at `intent_classification`.
3. When resume disposition occurs at `human_disposition`, unpaused owner state occurs at `engagement_attempt`.
4. When close disposition occurs at `human_disposition`, finishing predicate state occurs at `sequence_finish_state`.
5. When keep-suppressed disposition occurs at `human_disposition`, continued deny state occurs at `suppression_list` and `send_gate_decision`.
6. When any disposition changes runtime state at `human_disposition`, disposition chronology occurs at `engagement_record`.
**Nodes touched:**
- `escalation_ticket`
- `human_disposition`
- `intent_classification`
- `engagement_attempt`
- `sequence_finish_state`
- `suppression_list`
- `send_gate_decision`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-21` — `Conversations is the operator reply-triage surface; Engagement record stays chronology`
**Implementation (source):** Conversations now owns live reply triage while Engagement record remains a read-only chronology of the same runtime events.
**Start:** `Starting from conversation_thread (existing)`
**Path:**
1. When an inbound reply lands at `conversation_thread`, live triage state occurs at `conversation_thread`.
2. When intent or escalation state change occurs at `intent_classification` or `escalation_ticket`, thread work state update occurs at `conversation_thread`.
3. When an operator takes a triage action at `conversation_thread`, a closed runtime tool request occurs at `runtime_tool_invocation`.
4. When a runtime tool request resolves at `runtime_tool_invocation`, immutable chronology occurs at `engagement_record`.
5. When chronology occurs at `engagement_record`, no triage ownership changes occur at `engagement_record`. idempotent
**Nodes touched:**
- `conversation_thread`
- `intent_classification`
- `escalation_ticket`
- `runtime_tool_invocation`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-22` — `Conversations triage shows intent, owner, gates, and pending attempt`
**Implementation (source):** A Conversations thread now shows intent, owner, gate posture, pending or nullified attempt, and escalation status from the runtime's actual states.
**Start:** `Starting from conversation_thread (existing)`
**Path:**
1. When a thread is opened for triage at `conversation_thread`, a context projection request occurs at `triage_context_snapshot`.
2. When the projection request occurs at `triage_context_snapshot`, current class is read from `intent_classification`.
3. When the projection request occurs at `triage_context_snapshot`, active owner and pending/nullified attempt are read from `engagement_attempt`.
4. When the projection request occurs at `triage_context_snapshot`, gate posture is read from `send_gate_decision`.
5. When the projection request occurs at `triage_context_snapshot`, escalation status is read from `escalation_ticket`.
6. When context projection completion occurs at `triage_context_snapshot`, visible triage context change occurs at `conversation_thread`.
**Nodes touched:**
- `conversation_thread`
- `triage_context_snapshot`
- `intent_classification`
- `engagement_attempt`
- `send_gate_decision`
- `escalation_ticket`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-23` — `Engagement record must chronicle classifications, overrides, and tool acts`
**Implementation (source):** Engagement record now appends inbound, classification, nullify, handoff, gate deny, escalation, disposition, and finish events without becoming the decision engine.
**Start:** `Starting from messaging_event_stream (existing)`
**Path:**
1. When inbound or delivery evidence occurs at `messaging_event_stream`, event chronology occurs at `engagement_record`.
2. When classification completes at `intent_classification`, classified-intent chronology occurs at `engagement_record`.
3. When nullify or owner handoff occurs at `engagement_attempt`, runtime-transition chronology occurs at `engagement_record`.
4. When gate deny occurs at `send_gate_decision`, gate-denied chronology occurs at `engagement_record`.
5. When escalation opens or resolves at `escalation_ticket` or `human_disposition`, HITL chronology occurs at `engagement_record`.
6. When a tool act resolves at `runtime_tool_invocation`, tool-act chronology occurs at `engagement_record` and audit state occurs at `audit_trail`.
7. When sequence close or arm occurs at `sequence_finish_state` or `sequence_enrollment`, finish/armed chronology occurs at `engagement_record`.
**Nodes touched:**
- `messaging_event_stream`
- `engagement_record`
- `intent_classification`
- `engagement_attempt`
- `send_gate_decision`
- `escalation_ticket`
- `human_disposition`
- `runtime_tool_invocation`
- `audit_trail`
- `sequence_finish_state`
- `sequence_enrollment`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations.

### `agent-24` — `Runtime only runs while Firm operations bind is Armed/Active and enrolled`
**Implementation (source):** The runtime now obeys firm bind posture: Armed can prepare, Active can speak, and unbound or posture-denied sends are blocked and recorded.
**Start:** `Starting from firm_operations_bind (new)`
**Path:**
1. When a firm becomes bound at `firm_operations_bind`, eligible tenancy posture occurs at `firm_tenancy`.
2. When a sequence is enrolled under the bound firm at `sequence_enrollment`, posture-scoped sequence state occurs at `sequence_instance`.
3. When the posture is Armed at `firm_operations_bind`, prepare-only scheduling state can occur at `attempt_job_queue` but no contact-facing send occurs at `outbound_message`.
4. When Active posture occurs at `firm_operations_bind`, contact-facing send eligibility occurs at `send_gate_decision`.
5. When posture denies at `send_gate_decision`, blocked attempt state occurs at `engagement_attempt` and no send occurs at `outbound_message`.
6. When inbound human-review need occurs while not Active at `conversation_thread`, escalation opening can still occur at `escalation_ticket`.
7. When posture allows or blocks motion at `firm_operations_bind` or `send_gate_decision`, posture chronology occurs at `engagement_record`.
**Nodes touched:**
- `firm_operations_bind`
- `firm_tenancy`
- `sequence_enrollment`
- `sequence_instance`
- `attempt_job_queue`
- `outbound_message`
- `send_gate_decision`
- `engagement_attempt`
- `conversation_thread`
- `escalation_ticket`
- `engagement_record`
**Facets swept:** Core Application & Runtime; Data Storage & Management; Identity / Security / Compliance; Infrastructure & Operations; External Systems.
