# C2 — Agentic engagement runtime (read → decide → act)

**Pass:** Pass1 + Pass2 + implementation (combined)  
**Axis:** Capability (adds product) — not compliance  
**Producer:** SME (applied-AI / agent-systems + conversation design) — not PM/CTO  
**Status:** Paper only — NOT Register-integrated. Awaiting validation.  
**Brief:** Run a live sequence that reads replies, classifies intent, picks the next channel/attempt, and escalates — the thing that makes engagement *hands-free*, not a static drip.  
**Who:** applied-AI / agent-systems engineer + conversation designer.  
**Residual:** attempt/channel state machine + reply-reading loop (LLM tool-use, intent classification, escalation policy) beyond generic backend.  
**Revealed:** Inbound reply capture + intent classification (booked / question / stop / hostile) **new**; Attempt/channel state machine **partial** (Sarah’s-nudge model documented, not built); Human-in-loop escalation queue **new** → Customer support Ticket queue; Reply inbox/triage **new** → Operator **Conversations** surface.  
**Plugs:** Engagement record · Send gates · Firm operations bind · Customer support.  
**Boundaries:** Not CASL counsel (stop/silence law owned by seat 3 — runtime must honor ledger). Not deliverability/warmup (C1). Not campaign-calendar copy authorship. Not UI wireframes as solutions. Not inventing consultant Automations authorship.  
**Anchors:** Capability roster C2; Seed §5.5 two sequencing layers; OPERATOR-REVISIONS §5b attempt/channel-ownership; World Attempt / channel-ownership engine + Engagement record; `sarahNudgeTimeline.ts` / engagement-chart-gantt-decisions; How Engagement templates / Agent · sequence editor; Customer support Ticket queue.  
**Vocab:** [`../implementation/00-SURFACE-VOCAB.md`](../implementation/00-SURFACE-VOCAB.md) — may use **Conversations**, **Escalation queue**.  
**Style:** Question · References · Thesis gap · Solution (`<mechanism> so that <purpose>`) · Handoff · implementationProblem · implementation · implementationAdds.

**Item count:** 24 (`agent-01` … `agent-24`)

---

## Focus gap 1 — Inbound reply capture + intent classification

### agent-01 — Inbound replies are first-class conversation events, not optional log lines

**Question:** How must firm-branded email/SMS replies enter the runtime so the agent can read→decide→act rather than drip blindly?  
**References:**
- Twilio Conversations webhooks (`onMessageAdded` / message lifecycle) — https://www.twilio.com/docs/conversations/conversations-webhooks
- Twilio Conversations Intelligence rules (intent/sentiment on communication → webhook) — https://www.twilio.com/docs/conversations/intelligence/define-rules
- World: Attempt / channel-ownership engine (live inbound can override in-flight attempt)
**Thesis gap:** Product commits to hands-free sequences and an Engagement record chronology, but has no durable inbound capture path — without reply events the “read” half of the loop does not exist.  
**Solution:** Capture every inbound participant message on the firm-branded thread as a durable conversation event (channel, address, body, timestamps, delivery linkage to prior outbound) so that the runtime always has a reply object to classify before any next attempt fires.  
**Handoff:** cto (primary capture/wiring); both where Engagement record must surface the event

**implementationProblem:**  
Sequences advance on timers and open/click criteria while inbound replies are invisible or buried in provider logs. The agent cannot override or stop motion because nothing durable enters Tower.

**implementation:**  
On **Conversations**, you can now see inbound replies as first-class thread events linked to the prior outbound on that channel.  
On **Engagement record**, you can now examine reply-received chronology for the contact without opening provider consoles.  
On **Firm operations bind**, Armed / Active sequences consume the same inbound event stream before scheduling the next attempt.

**implementationAdds:** `["inbound-event", "conversation-thread", "reply-linkage"]`

---

### agent-02 — Closed intent set: booked / question / stop / hostile (plus unsure)

**Question:** What intent classes must the reply reader distinguish so next-channel and escalation policy can be deterministic?  
**References:**
- Google Conversational Actions — intents & NLU best practices (reuse intents; avoid free-text-only intents) — https://developers.google.com/assistant/conversational/best-practice-nlu
- Dialogflow CX intents (intent matching + confidence) — https://cloud.google.com/dialogflow/cx/docs/concept/intent
- Capability roster C2 revealed classes: booked / question / stop / hostile
**Thesis gap:** Seed/World name override-on-inbound and finishing events, but never lock the intent taxonomy the runtime must emit — PM would invent ad-hoc labels per sequence.  
**Solution:** Classify every inbound into a closed product intent set — `booked`, `question`, `stop`, `hostile`, plus `unsure` when confidence fails — so that channel handoff, silence, and escalation policies bind to stable classes rather than free-text vibes.  
**Handoff:** both (PM: outcome/state vocabulary; CTO: classifier contract)

**implementationProblem:**  
Without a closed intent set, operators and automations invent per-template labels. Escalation and Send-gate reactions cannot be shared across firms or phases.

**implementation:**  
On **Conversations**, you can now see each inbound tagged with one of booked / question / stop / hostile / unsure.  
On **Engagement record**, you can now examine the classified intent beside the reply event.  
On **Agent / sequence editor**, you can now bind next-step and escalation policy to those classes — not free-text tags.

**implementationAdds:** `["intent-booked", "intent-question", "intent-stop", "intent-hostile", "intent-unsure"]`

---

### agent-03 — Stop / opt-out language is a hard intent that freezes CEMs

**Question:** How should STOP / unsubscribe / “leave me alone” replies interact with the attempt engine relative to softer intents?  
**References:**
- FTC CAN-SPAM Act: Compliance Guide for Business (honor opt-out; process promptly) — https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- CRTC CASL FAQ (SMS STOP/Unsubscribe readily performed) — https://crtc.gc.ca/eng/com500/faq500.htm
- Outreach sequence states: Finished / Opt-Out style terminal replies — https://support.outreach.io/support/solutions/articles/159000426253-outreach-sequence-states-overview
**Thesis gap:** CASL seat owns silence law; capability seat must still ensure the *runtime* treats stop-class replies as terminal for automatic attempts — not as “question” to answer with another CEM.  
**Solution:** Map stop-class language (and provider STOP keywords) to intent `stop`, immediately suppress further automatic CEMs on that address/channel per Send gates, and write silence-adjacent ledger effects so that the reply-reading loop cannot continue drip after withdrawal.  
**Handoff:** both (sync seat 3 CASL on ledger; CTO: fail-closed runner)

**implementationProblem:**  
A stop reply can be misread as engagement or queued for a helpful follow-up. Automatic attempts keep firing after the contact withdrew.

**implementation:**  
On **Conversations**, a stop-class inbound now shows intent `stop` and freezes further automatic attempts on that thread.  
On **Firm operations bind** Send gates, you can now see the contact enrollment-blocked for automatic CEMs after stop.  
On **Engagement record**, you can now examine stop-class reply → suppression as chronology, not a soft badge.

**implementationAdds:** `["intent-stop-terminal", "cem-suppress-on-stop", "stop-keyword"]`

---

### agent-04 — Low-confidence / no-match must not invent an intent

**Question:** What happens when the classifier cannot confidently match booked / question / stop / hostile?  
**References:**
- Google Assistant NLU — use `NO_MATCH` carefully; do not force free-text global overrides — https://developers.google.com/assistant/conversational/best-practice-nlu
- Dialogflow CX intent detection confidence — https://cloud.google.com/dialogflow/cx/docs/concept/intent
- LangChain / agent tool-calling patterns: structured tool choice over unconstrained free text — https://python.langchain.com/docs/concepts/tools/
**Thesis gap:** LLM-first prototypes will “guess” a next step when unsure; that silently ships hostile or stop as question and burns trust/compliance.  
**Solution:** Emit `unsure` (or equivalent no-match) below a configured confidence floor and route to human-in-loop rather than picking a channel attempt so that the runtime fails closed on ambiguity instead of inventing intent.  
**Handoff:** both

**implementationProblem:**  
Ambiguous replies are forced into a best-guess class. Wrong guesses drive wrong channel escalations or polite CEM replies after hostility.

**implementation:**  
On **Conversations**, low-confidence replies now show intent `unsure` and do not auto-advance the attempt owner.  
On **Escalation queue**, you can now open those threads for human classification before the runtime acts.  
On **Firm operations bind**, you can now see that unsure blocks automatic next-attempt until resolved.

**implementationAdds:** `["confidence-floor", "intent-unsure", "fail-closed-classify"]`

---

### agent-05 — Classification always re-enters Send gates before the next send

**Question:** After a reply is classified, what must be true before the runtime may schedule or send the next attempt?  
**References:**
- Capability roster C2 → “triggers Send-gate re-check”; C1 suppression adjacency
- Outreach rulesets: reply / opt-out change sequence state before further steps — https://support.outreach.io/support/solutions/articles/159000426339-outreach-sequence-rulesets-overview
- CASL CEM triad + silence (seat 3) as hard gates
**Thesis gap:** Attempt engine DNA assumes criteria windows hand off channels; it does not state that every post-reply action re-validates consent, silence, and suppression.  
**Solution:** Require a Send-gate re-check (consent basis, channel scope, silenced/suppressed, firm Armed/Active) after every classified inbound and before every outbound attempt so that reply-driven motion cannot bypass the same gates as calendar-driven sends.  
**Handoff:** both (CTO: gate in runner; PM: never-see auto-send past failed gate)

**implementationProblem:**  
Reply-driven “helpful” follow-ups skip the gates that calendar sends respect. Silenced or consent-lapsed contacts still get the next attempt because the runtime treated inbound as a new license to speak.

**implementation:**  
On **Firm operations bind** Send gates, you can now see post-reply re-check before any next attempt is scheduled.  
On **Conversations**, choosing or confirming a next step stays blocked when Send gates deny.  
On **Engagement record**, you can now examine gate-denied-after-reply as a chronology event.

**implementationAdds:** `["send-gate-recheck", "post-reply-gate", "attempt-blocked-by-gate"]`

---

### agent-06 — Auto-replies / OOO are not finishing “replied” intents

**Question:** How should out-of-office and machine auto-replies be treated versus a human prospect reply?  
**References:**
- Outreach Paused (OOTO) + auto-resume rulesets — https://support.outreach.io/support/solutions/articles/159000426253-outreach-sequence-states-overview
- Outreach Amplify / OOO return-date extraction (public product behavior) — https://support.outreach.io/support/solutions/articles/159000425834-outreach-glossary
- Apollo / sales-engagement sequence practice: pause on OOO rather than mark replied (public help behaviors; under-claim vendor parity)
**Thesis gap:** Treating every inbound as “Finished (Replied)” collapses OOO into booked/question and prematurely ends or wrongly escalates sequences.  
**Solution:** Detect auto-reply / OOO as a non-terminal pause class (not `booked` / not `stop`) that holds the current attempt owner and may resume after a bounded window so that machine acknowledgements do not finish the engagement or invent human intent.  
**Handoff:** both

**implementationProblem:**  
OOO messages finish the sequence as if the contact engaged, or trigger question-handling CEMs. Real human replies later have no owner state to resume.

**implementation:**  
On **Conversations**, OOO / auto-reply now shows as paused-OOTO (not booked, not stop).  
On **Engagement record**, you can now examine pause and scheduled resume under the owning channel.  
On **Agent / sequence editor**, you can now set OOO pause/resume policy without treating auto-reply as Finished (Replied).

**implementationAdds:** `["ooo-pause", "auto-reply-nonterminal", "resume-window"]`

---

## Focus gap 2 — Attempt / channel state machine at runtime

### agent-07 — Exactly one channel owns the flow at a time

**Question:** What ownership rule must the runtime enforce while waits, attempts, and escalations are in flight?  
**References:**
- OPERATOR-REVISIONS §5b — one owner at a time; waits/attempts nest under that owner
- World definition: Attempt / channel-ownership engine
- Engagement chart decision log — owner-based nesting — [`../../product/engagement-chart-gantt-decisions.md`](../../product/engagement-chart-gantt-decisions.md)
**Thesis gap:** Sarah’s model is documented; without a built owner invariant, dual-channel “helpfulness” (email + SMS racing) ships and breaks criteria windows.  
**Solution:** Enforce a single active channel owner per engagement sequence instance, with all timers and local attempts nested under that owner, so that the runtime never races two owners and chronology stays inspectable.  
**Handoff:** cto (runner invariant); pm (Engagement record / Conversations show single owner)

**implementationProblem:**  
Email and SMS attempts can fire in parallel “to improve reach.” Criteria windows conflict; Engagement record cannot show who owns the flow.

**implementation:**  
On **Engagement record**, you can now see exactly one owning channel for the active sequence instance.  
On **Firm operations bind**, Armed / Active runners refuse dual-owner schedules.  
On **Agent / sequence editor**, channel rulesets author forward handoff — not parallel owners.

**implementationAdds:** `["single-channel-owner", "owner-nested-attempts"]`

---

### agent-08 — Happy-path handoff is forward-only when criteria are met

**Question:** When may the runtime move from the current owner to the next channel in the authored order?  
**References:**
- OPERATOR-REVISIONS §5b happy path Text → Email → Form (forward-only when criteria met)
- Seed §5.5 attempt / channel-ownership engine vs campaign day calendar
- Outreach: sequence proceeds by step rules; finished states stop progression — https://support.outreach.io/support/solutions/articles/159000426253-outreach-sequence-states-overview
**Thesis gap:** Prototype criteria exist; product risks bidirectional “try text again after form” loops that re-spam without a new attempt frame.  
**Solution:** Allow channel handoff only forward along the authored owner order when the current owner’s failure/success criteria fire — never backward to a prior owner outside a new local attempt — so that motion remains monotone and auditable.  
**Handoff:** both

**implementationProblem:**  
Runtime “retries” bounce back to earlier channels outside attempt framing, creating loops that look alive but violate forward-only law.

**implementation:**  
On **Agent / sequence editor**, you can now author forward-only owner order for a sequence.  
On **Engagement record**, handoffs show only forward along that order (or a new local attempt under the failed owner).  
On **Firm health** / **Sequence detail**, backward re-entry without a new attempt frame is not offered as healthy motion.

**implementationAdds:** `["forward-only-handoff", "owner-order"]`

---

### agent-09 — Attempts are local retries under the failed channel, not a global Attempt N

**Question:** What does “Attempt 2 / 3” mean in the runtime tree?  
**References:**
- OPERATOR-REVISIONS §5b — attempts are local retries; top-level Attempt spanning all channels deprecated
- Engagement chart Gantt decisions — owner-based nesting, not global Attempt 2
- Sarah nudge reference story (`src/app/data/sarahNudgeTimeline.ts`)
**Thesis gap:** UI prototypes once showed global Attempt rows; if that ships as runtime law, counters and escalations mis-nest and operators misread state.  
**Solution:** Model Attempt N as a fresh retry cycle nested under the channel that failed (e.g. Attempt 2 under Email), so that counters, waits, and escalations stay local to the failing owner.  
**Handoff:** both

**implementationProblem:**  
A global Attempt 2 spanning Text/Email/Form resets the wrong clocks and hides which owner failed. Operators cannot tell what will fire next.

**implementation:**  
On **Engagement record**, you can now see Attempt N nested under the failed owning channel — not as a top-level peer to Text/Email/Form.  
On **Agent / sequence editor**, attempt logic authors local retries under a channel ruleset.  
On **Conversations**, triage context shows the same nested attempt owner when a reply arrives mid-retry.

**implementationAdds:** `["local-attempt", "attempt-under-owner", "no-global-attempt"]`

---

### agent-10 — Criteria windows drive non-reply escalation between owners

**Question:** What signals, other than inbound intent, legitimately move the owner forward?  
**References:**
- OPERATOR-REVISIONS §5b prototype windows (e.g. Text delivered not opened → Email; Email opened link not clicked → next; Form started not submitted → Text re-entry rules)
- guidelines/Reactivation.md open: SMS non-reply escalation (content calendar vs attempt machine — keep distinct)
- Sales-engagement sequence step delays + reply detection (Outreach rulesets)
**Thesis gap:** Hands-free claim depends on non-reply escalation; without explicit criteria events, CTO will hardcode timers that ignore opens/clicks/starts.  
**Solution:** Drive owner escalation from typed criteria events (delivered/opened/clicked/started/submitted + elapsed window) authored in channel rulesets so that non-reply motion is evidence-based, not a blind drip clock.  
**Handoff:** both (PM: criteria vocabulary on Agent / sequence editor; CTO: event→transition runner)

**implementationProblem:**  
Sequences advance on fixed delays regardless of opens, clicks, or form starts. Contacts who are mid-action still get the next channel CEM.

**implementation:**  
On **Agent / sequence editor**, you can now author criteria windows (delivered/opened/clicked/started/submitted + elapsed) per owner.  
On **Engagement record**, you can now examine which criteria event caused the handoff.  
On **Firm operations bind**, Active runners only escalate when those criteria fire and Send gates still allow.

**implementationAdds:** `["criteria-window", "nonreply-escalation", "criteria-event"]`

---

### agent-11 — Live inbound (and live form visit) nullifies in-flight attempts

**Question:** How does a live human signal interact with a scheduled attempt still waiting to fire?  
**References:**
- OPERATOR-REVISIONS §5b priority override — live form visit can nullify in-flight attempt
- World: live inbound can override an in-flight attempt
- Twilio Conversations real-time `onMessageAdded` as the capture trigger — https://www.twilio.com/docs/conversations/conversations-webhooks
**Thesis gap:** Scheduled jobs will still fire after a reply if override is not a hard cancel — classic double-message failure mode in engagement engines.  
**Solution:** On classified inbound (and live form visit), cancel or nullify any in-flight scheduled attempt under the current owner before applying intent policy so that the human signal always wins the race against the timer.  
**Handoff:** cto (primary); pm (Engagement record shows nullified attempt)

**implementationProblem:**  
A contact replies or opens the form while Attempt N is scheduled; the job still sends. Double messages look broken and ignore the human.

**implementation:**  
On **Conversations**, an inbound (or live form visit signal) now nullifies in-flight scheduled attempts before intent policy runs.  
On **Engagement record**, you can now examine attempt-nullified-by-inbound as chronology.  
On **Firm operations bind**, Active runners treat override as hard cancel, not soft preference.

**implementationAdds:** `["priority-override", "nullify-inflight", "inbound-wins-race"]`

---

### agent-12 — Finishing events close the sequence and may arm the next

**Question:** Which outcomes end the current sequence instance, and how does the next sequence become armed?  
**References:**
- OPERATOR-REVISIONS §5b — Form submitted closes nudge and can arm next (e.g. Reactivation scheduled)
- Outreach Finished (Replied) / Finished (No Reply) terminal states — https://support.outreach.io/support/solutions/articles/159000426253-outreach-sequence-states-overview
- Engagement chart: outcome → next sequence causal chain
**Thesis gap:** Product shows armed reactivation ghost rows; without finishing predicates (`booked`, form submitted, terminal no-reply, stop), armed/active semantics stay cosmetic.  
**Solution:** Define finishing predicates (goal met / `booked`, terminal no-reply after last attempt, `stop`, human close) that close the sequence instance and, when authored, arm the next peer sequence so that Armed / Active posture reflects real runtime outcomes.  
**Handoff:** both

**implementationProblem:**  
Sequences never cleanly finish; reactivation arms while the nudge is still “active,” or booked contacts keep receiving attempts.

**implementation:**  
On **Engagement record**, you can now see finishing predicates close the sequence and optionally arm the next peer sequence.  
On **Firm operations bind**, Armed vs Active updates from those finishing events — not from cosmetic toggles alone.  
On **Conversations**, a `booked` intent shows the sequence closed for further automatic attempts.

**implementationAdds:** `["finishing-predicate", "arm-next-sequence", "sequence-closed"]`

---

### agent-13 — Campaign calendar and attempt engine are two layers — do not conflate

**Question:** How should day-ordered campaign content relate to the per-sequence attempt/channel owner machine?  
**References:**
- Seed §5.5 — two sequencing layers (campaign day calendar vs attempt / channel-ownership)
- World: Campaign calendar vs Attempt / channel-ownership engine
- guidelines/Reactivation.md — content order; open SMS non-reply notes belong to the right layer
**Thesis gap:** Authors will stuff attempt retries into calendar days (or calendar copy into attempt counters), producing unmaintainable dual brains.  
**Solution:** Keep campaign calendar as day-ordered content enrollment and the attempt engine as runtime owner/attempt/criteria law inside one enrolled sequence so that copy schedule and channel-ownership never share one control surface.  
**Handoff:** pm (primary product structure); cto (enrollment wires calendar → sequence instance)

**implementationProblem:**  
Operators edit day calendars expecting attempt retries, or edit attempt logic expecting day-N copy changes. Two brains fight; failures are undiagnosable.

**implementation:**  
On **Engagement templates** / **Agent / sequence editor**, you can now see campaign calendar (day content) separate from channel-ownership / attempt rulesets.  
On **Automation workflows**, enrollment selects a sequence instance; the attempt engine runs inside it.  
On **Engagement record**, chronology distinguishes calendar phase from owner/attempt events.

**implementationAdds:** `["calendar-layer", "attempt-layer", "two-sequencing-layers"]`

---

### agent-14 — Decide→act uses constrained tool-use, not free-form LLM sends

**Question:** How should the agent choose and execute the next action after intent classification?  
**References:**
- LangChain tools / tool-calling agents — https://python.langchain.com/docs/concepts/tools/
- LangGraph ReAct-style agent patterns (reason → tool → observe) — https://langchain-ai.github.io/langgraph/concepts/agentic_concepts/
- Google conversation design: intents drive scene logic, not unconstrained generation as control plane — https://developers.google.com/assistant/conversational/build/conversation
**Thesis gap:** “Agentic” invites an LLM that drafts and sends arbitrary messages; Tower’s hard gates and channel ownership require tool-bounded actions.  
**Solution:** Restrict the runtime agent to a closed tool set (classify, cancel attempt, schedule next owner attempt, suppress/stop, open escalation, arm next sequence) whose tools re-enter Send gates so that language models propose structured acts but never free-form bypass the state machine.  
**Handoff:** cto (primary); pm (never-see free-form send as control plane)

**implementationProblem:**  
An LLM “helpfully” composes and sends replies outside channel ownership and Send gates. Audit cannot reconstruct which tool/law authorized the send.

**implementation:**  
On **Agent / sequence editor**, runtime actions are bound to the closed tool set (not free-form send).  
On **Audit trail**, you can now open a Change event showing tool name, intent, owner, and gate result for each act.  
On **Firm operations bind** Send gates, tool-initiated sends fail closed the same as calendar-initiated sends.

**implementationAdds:** `["tool-bounded-runtime", "closed-tool-set", "no-freeform-send"]`

---

### agent-15 — Channel escalation still requires channel-scoped consent and suppression clearance

**Question:** When criteria say “escalate Text → Email/SMS,” what permission checks remain mandatory?  
**References:**
- CASL seat casl-08 channel-scoped consent; casl-02 CEM class
- Capability C1 suppression list consumed by Send gates
- Seed KU #15 channel-order escalations (practice must not outrun consent)
**Thesis gap:** Attempt-engine happy path can be misread as consent to every channel in the tree.  
**Solution:** Allow owner escalation only when Send gates affirm channel-scoped consent and the address is not silenced/suppressed so that attempt-engine forward motion never launders a missing SMS/email grant.  
**Handoff:** both (sync seat 3 + C1)

**implementationProblem:**  
Criteria windows escalate to SMS because Text failed, even when Agree was email-only or the number is suppressed. Capability runtime becomes the consent bug.

**implementation:**  
On **Firm operations bind** Send gates, channel escalation now requires channel-scoped consent + suppression clearance.  
On **Engagement record**, blocked-escalation-for-channel-scope is visible chronology.  
On **Conversations**, operators see why the runtime did not escalate to the next channel.

**implementationAdds:** `["escalation-needs-channel-consent", "suppression-clearance"]`

---

## Focus gap 3 — Human-in-loop escalation → Customer support

### agent-16 — Unsure and policy edge cases open Escalation queue, not silent continue

**Question:** When must the runtime stop acting and ask a human?  
**References:**
- Contact-center practice: confidence / exception queues before bot continues (industry standard; e.g. Google CCAI / Dialogflow escalation to human handoff patterns) — https://cloud.google.com/dialogflow/cx/docs/concept/handler-webhook
- Capability roster C2: agent unsure / hostile / edge → HITL
- LangChain human-in-the-loop / interrupt patterns for tool agents — https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/
**Thesis gap:** Hands-free aspiration pressures “always answer”; without mandatory HITL triggers, unsure and edge replies become hallucinated CEMs.  
**Solution:** Open an Escalation queue item whenever intent is `unsure`, policy edge, or tool preconditions fail, and pause automatic attempts until human resolution so that ambiguity never silently continues the drip.  
**Handoff:** both

**implementationProblem:**  
Edge replies keep the sequence Active with guessed next steps. No human sees the thread until a complaint or desk halt.

**implementation:**  
On **Escalation queue**, you can now open items for unsure / policy-edge / failed tool preconditions.  
On **Conversations**, the thread shows automatic attempts paused pending resolution.  
On **Engagement record**, you can now examine escalation-opened and pause as chronology.

**implementationAdds:** `["escalation-on-unsure", "pause-pending-human", "policy-edge"]`

---

### agent-17 — Hostile intent halts automatic CEMs and escalates immediately

**Question:** What is the required runtime response to hostility, threats, or abuse in a reply?  
**References:**
- Google conversation design / assistant policies: handle abusive input without continuing the task path (practice: stop useful fulfillment; escalate) — https://developers.google.com/assistant/console/policies/general-policies
- Desk-ops seat: refuse illegal/unethical outreach; inhabit must show halt truth
- Contact-center priority escalation for abusive contacts (standard ops practice)
**Thesis gap:** Treating hostility as a “question to defuse” with another firm-branded CEM is a trust and safety failure under the firm’s name.  
**Solution:** On intent `hostile`, immediately suppress automatic CEMs for the contact/sequence, halt further attempts, and open a high-priority Escalation queue item so that humans — not the drip — own the next act.  
**Handoff:** both (sync desk-ops on halt semantics)

**implementationProblem:**  
Hostile replies get a soothing auto-response or the next nudge. Firm reputation and license inhabit take the hit; no priority human path exists.

**implementation:**  
On **Conversations**, hostile intent now halts automatic CEMs on the thread.  
On **Escalation queue**, you can now open a high-priority item with the reply context.  
On **Engagement record** / **Halt outreach** adjacency, you can now examine hostile → halt as chronology the consultant can trust.

**implementationAdds:** `["intent-hostile-halt", "priority-escalation", "suppress-on-hostile"]`

---

### agent-18 — Escalation queue items land in Customer support Ticket queue with engagement context

**Question:** Where do HITL escalations live so house operators can work them without inventing a second ticket system?  
**References:**
- Capability roster C2: HITL escalation → Customer support ticket queue
- Surface vocab: Customer support · Ticket queue · Ticket · Support context
- Contact-center: escalate with full interaction context (transcript, disposition, account)
**Thesis gap:** A floating “agent unsure” list that is not Ticket queue duplicates Customer support and loses Support context / SLA.  
**Solution:** Materialize each runtime escalation as a Customer support Ticket (type: engagement-escalation) carrying Support context (thread, intent, owner, last send, firm/contact ids) so that HITL work uses one queue and one accountability path.  
**Handoff:** both

**implementationProblem:**  
Escalations sit in an unnamed agent inbox. Customer support never sees them; SLAs and Support context do not apply; duplicates spawn.

**implementation:**  
On **Customer support** **Ticket queue**, you can now see engagement-escalation Tickets opened by the runtime.  
On **Ticket**, you can now open Support context with thread, intent, channel owner, and last send.  
On **Escalation queue**, you can now work the same items (view onto Ticket queue — not a second system of record).

**implementationAdds:** `["engagement-escalation-ticket", "support-context-thread", "escalation-is-ticket"]`

---

### agent-19 — Escalation policy carries priority, reason codes, and required context bundle

**Question:** What minimum packet must accompany an escalation so a human can act without reconstructing provider logs?  
**References:**
- Contact-center escalation matrices (priority × reason → SLA) — industry practice; Genesys/Twilio Flex style context attach
- Twilio Conversations: conversation + message attributes as context carriers — https://www.twilio.com/docs/conversations/conversations-webhooks
- Surface vocab Support context
**Thesis gap:** Tickets opened with only “agent unsure” force operators to spelunk Engagement record and ESP consoles — HITL becomes slower than the drip it paused.  
**Solution:** Require every escalation to carry reason code (`unsure` / `hostile` / `stop-review` / `policy-edge` / `tool-failure`), priority, and a context bundle (verbatim reply, classification confidence, sequence id, owner, pending attempt, consent/silence snapshot) so that Ticket work is immediately actionable.  
**Handoff:** both

**implementationProblem:**  
Tickets say “needs review” with no reply text, confidence, or pending attempt. Operators burn time reconstructing state while the sequence stays paused.

**implementation:**  
On **Ticket** / **Support context**, you can now see reason code, priority, verbatim reply, confidence, sequence id, owner, pending attempt, and consent/silence snapshot.  
On **Escalation queue**, list rows show reason + priority for triage sort.  
On **Audit trail**, you can now open the escalation-opened Change event with the same bundle.

**implementationAdds:** `["escalation-reason-code", "escalation-priority", "context-bundle"]`

---

### agent-20 — Human resolution resumes, reclassifies, or closes — never silent drop

**Question:** After a human handles an Escalation queue Ticket, how does the runtime continue?  
**References:**
- LangGraph human-in-the-loop: interrupt → resume with human input — https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/
- Outreach: manual resume from Paused; Finished states are explicit — https://support.outreach.io/support/solutions/articles/159000426253-outreach-sequence-states-overview
- Contact-center: disposition codes drive next-state (continue / close / transfer)
**Thesis gap:** Paused-for-human sequences will stall forever, or auto-resume without the human’s disposition — both break hands-free trust.  
**Solution:** Require an explicit human disposition (reclassify intent, resume owner with policy, close/finish sequence, or keep suppressed) that unpauses the runner so that HITL always returns a durable next state.  
**Handoff:** both

**implementationProblem:**  
Escalated threads stay paused indefinitely, or a timer silently resumes without disposition. Nobody can tell whether a human decided.

**implementation:**  
On **Ticket** / **Escalation queue**, you can now disposition: reclassify, resume owner, close sequence, or keep suppressed.  
On **Conversations**, the thread shows the disposition and resulting runtime state.  
On **Engagement record**, you can now examine human-disposition → resume/close as chronology.

**implementationAdds:** `["human-disposition", "resume-after-hitl", "explicit-unpause"]`

---

## Focus gap 4 — Conversations triage vs Engagement record

### agent-21 — Conversations is the operator reply-triage surface; Engagement record stays chronology

**Question:** What product home owns live reply triage versus the read-only engagement chronology?  
**References:**
- Capability roster C2: Reply inbox/triage **new** → Operator Conversations; distinct from read-only Engagement record
- OPERATOR-REVISIONS §5 — Activity/Engagement chart is record of events already fired; not decision brain
- World: Engagement record does not decide channel order / attempts / escalation
**Thesis gap:** Folding triage into Engagement record either turns chronology into an inbox or leaves operators without a place to work live threads.  
**Solution:** Add Operator **Conversations** as the reply-triage and thread-work surface, and keep Engagement record as read-only chronology of what already fired (including classifications and escalations) so that triage and inhabit/audit jobs do not share one overloading surface.  
**Handoff:** pm (primary surface add); cto (shared event store)

**implementationProblem:**  
Operators hunt replies inside Engagement record or firm email. No Conversations home exists; triage and chronology fight for the same UI job.

**implementation:**  
On **Conversations**, you can now triage live inbound threads (intent, pause state, escalate, disposition).  
On **Engagement record**, you can now examine the same events as read-only chronology — not as an inbox.  
Starting from **Oversight** / firm context, you can now open Conversations for reply work without editing attempt authorship.

**implementationAdds:** `["conversations-surface", "triage-vs-chronology", "engagement-record-readonly"]`

---

### agent-22 — Conversations triage shows intent, owner, gates, and pending attempt

**Question:** What must an operator see on a Conversations thread to triage without opening five other modules?  
**References:**
- Twilio Flex / Conversations agent desktop patterns: conversation + customer context pane
- Google conversation design: user-visible state should match system state (intent/scene clarity)
- Surface plugs: Send gates · Firm operations bind · Engagement record
**Thesis gap:** A naked message list without owner/intent/gate state forces tribal knowledge to operate hands-free fleets.  
**Solution:** Present each Conversations thread with classified intent, active channel owner, Send-gate posture, pending/nullified attempt, and escalation status so that triage decisions are fully informed in one place.  
**Handoff:** pm

**implementationProblem:**  
Thread list shows raw messages only. Operators cannot see whether an attempt will still fire, whether gates block, or whether HITL already owns the case.

**implementation:**  
On **Conversations**, you can now see intent, owning channel, Send-gate posture, pending or nullified attempt, and escalation status on the open thread.  
On **Firm operations bind** Send gates, the same posture is what Conversations mirrors — not a second opinion.  
On **Escalation queue**, deep links open the same Conversations thread with that context.

**implementationAdds:** `["triage-context-pane", "owner-on-thread", "gate-posture-visible"]`

---

### agent-23 — Engagement record must chronicle classifications, overrides, and tool acts

**Question:** What runtime decisions must appear on the Engagement record so consultants and operators can examine motion under the firm name?  
**References:**
- Desk-ops desk-03: Engagement record = chronology + phase outcome; not Automations authorship
- OPERATOR-REVISIONS: Activity = event record; authorship = Agents
- Seed Assump. inhabit / always-on engine accountability
**Thesis gap:** If only “email sent” lands on the record, reply-driven nullifies, classifications, and escalations are invisible — inhabit and Audit fail.  
**Solution:** Append Engagement record events for inbound received, intent classified, attempt nullified, owner handoff, Send-gate deny, escalation opened/disposed, and sequence finished/armed so that the chronology explains hands-free motion without becoming the decision brain.  
**Handoff:** both

**implementationProblem:**  
Engagement record shows outbound sends only. Consultants cannot see why an attempt vanished after a reply or why escalation paused the sequence.

**implementation:**  
On **Engagement record**, you can now examine inbound, intent, nullify, handoff, gate-deny, escalation, and finished/armed events.  
On **Board** / **Client row**, phase signal stays consistent with that chronology.  
On **Conversations**, working a thread does not rewrite authorship — it only adds recordable runtime events.

**implementationAdds:** `["chronicle-classify", "chronicle-nullify", "chronicle-escalation", "chronicle-handoff"]`

---

### agent-24 — Runtime only runs while Firm operations bind is Armed/Active and enrolled

**Question:** What firm-level posture must be true before the reply-reading loop may send or escalate channels?  
**References:**
- World / How: Firm operations bind · Armed / Active
- Desk-ops desk-02: armed = bound-and-ready; active = contact-facing motion
- Capability roster C2 plugs into Firm operations bind (armed/active)
**Thesis gap:** A clever agent loop that runs while the firm is unbound or only armed (no contact-facing authorization) violates inhabit and activation finish-line order.  
**Solution:** Permit outbound tool acts and channel escalations only for sequence instances enrolled under a firm bind in the correct Armed→Active posture (armed: schedule/prepare only; active: contact-facing sends) so that the agentic runtime cannot speak as the firm before posture allows.  
**Handoff:** both

**implementationProblem:**  
Reply handlers and attempt jobs fire for firms that are not Active (or still unbound). Prepared demos and unbound tenancies accidentally CEM real contacts.

**implementation:**  
On **Firm operations bind**, you can now see Armed (prepare/schedule only) vs Active (contact-facing sends allowed) as the runtime posture the agent must obey.  
On **Conversations**, outbound tool acts stay blocked while not Active (escalation Ticket may still open).  
On **Engagement record**, you can now examine posture-blocked attempts as chronology when bind denies.

**implementationAdds:** `["runtime-requires-bind", "armed-prepare-only", "active-contact-facing"]`

---

## Handoff summary (for later HANDOFF.md absorb — awaiting validation)

| Owner | Items |
|---|---|
| **pm** | agent-13 (structure), agent-21, agent-22 |
| **cto** | agent-01 (capture primary), agent-07, agent-11, agent-14 |
| **both** | agent-02–06, agent-08–10, agent-12, agent-15–20, agent-23–24 |

**Cross-cutting watch:** C1 suppression + Send gates (agent-05, agent-15); CASL seat 3 stop/silence/channel scope (agent-03, agent-15); desk-ops inhabit/halt (agent-17, agent-23); C7 messaging event stream (inbound/classify/act metrics); Customer support Ticket queue (agent-18–20).

---

## Counts

| Metric | Count |
|---|---|
| Items (`agent-01`…`agent-24`) | **24** |
| Written (Pass2 + implementationProblem + implementation + implementationAdds) | **24** |
| Focus gaps | **4** — reply capture/classify; attempt/channel state machine; HITL → Customer support; Conversations vs Engagement record |
| Surfaces touched | **Conversations** · **Escalation queue** · **Engagement record** · **Firm operations bind** / **Send gates** · **Customer support** / **Ticket queue** / **Ticket** / **Support context** · **Agent / sequence editor** · **Engagement templates** · **Automation workflows** · **Audit trail** · **Halt outreach** · **Board** / **Client row** · **Firm health** / **Sequence detail** |
| Register integration | **Not done** — paper only, awaiting validation |
