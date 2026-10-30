# 3. Core loop and twelve systems

## 3.1 Application loop

```
Contacts / import
  → Audit (reachability / sequence-start gate)
  → Engagement sequence (opt-in → re-engagement nudges → reactivation)
  → Collect & refresh facts via touchpoints
  → Eligibility re-evaluation (rules + versioned reference)
  → Engine 2 chooses one motion (reactivation | nudge | none)
  → Meeting booked (loop-closer)
  → (repeat as facts and rules move)
```

Causal authorship ring (Phase Two Type A):

**Book in → firm-bound agent (rules / sequence / content) ↔ automations (when / motion / structured output) → enroll / attempt → what goes out → Activity / Board → meeting booked.**

Dual entry into an agent:

| Entry | Meaning |
|-------|---------|
| From Automations | An event/graph action hands contacts into a sequence |
| From Agents itself | Operator enrolls / launches the mission **now** (Contacts on that sequence) |

Agents is both a **library** the machine can call and a **place to start engagement**. Automations does **not** start a mission right now.

## 3.2 The twelve systems

Each is an initiation engine. They must stay non-conflatable.

### 1. Acquisition (seed-capture)

Capture firm/consultant **name**, **website**, and **one channel** (phone or email) from a Meta Approach in V1 (LinkedIn deferred). One click as design constraint. Make one-tap output **legible**, never persuade. After capture, continue the stranger’s scroll — no thank-you dashboard. Instrument continue-scroll without tap as a first-class non-action (*did not understand* vs *understood and did not tap*). Persist capture as fulfillment, not agent presentation.

Must not pull database authorization or escrow into the click budget. Must not treat forward-deploy as acquisition. Must not use cold email as V1 Approach. Engagement contacts are never acquired via Approach.

### 2. Provision / forward-deploy

On seed land: scrape **public** firm facts; instantiate Om Coda methodology templates (launch → re-engagement → reactivation); serve a **no-login prepared workspace** under firm identity as branding, not as a claim Tower already holds their clients. Must not derive the campaign from the private book before authorization.

### 3. Commercial / hard-input

Land **database authorization** and **escrow acceptance**; flip campaign to **running**. Escrow is firm↔Om Coda. Tower holds no immigrant funds. Credits / sales-call are not peer doors at this moment.

**UNRESOLVED:** escrow release definition; concrete shape of “database authorization” per practice stack.

Direction (not Story-promoted, not a build order): objectives become the billable unit; money held while pursuing or exhausted; only firm withdrawal **nullifies** the objective (see §9 / packet 023).

### 4. Tenancy & access

Provision firms/users; OTP sessions; same desk either door. See §2.8.

### 5. Reachability / audit

One question: can we reach this contact, and can we start a sequence? Checks: email valid, phone valid, ≥1 channel matching the **intended** sequence, typo/garbage, dedupe, already-in-Tower, consent/silenced, name present; external validation where needed. Verdicts: **reachable / partial / unreachable**. Passed contacts are **sequence-ready**.

Must not: pathway/CRS scoring, ROI forecasts, minimum contact-count gates, sales PASS/FAIL, or marketing DOA HTML.

**UNRESOLVED:** import fully mutating the living list; CRM bidirectional sync.

### 6. Consent / suppression

Opt-in phase: firm→client consent and first channel open. Contacts are sequenced / silenced / unsequenced; **silenced when not opted in** and when opted out. Firm DB authorization does **not** skip end-client consent. Deep collection gated on opt-in.

**UNRESOLVED:** CASL/SMS consent regimes by geography (firm→client and first agent→consultant text).

### 7. Engagement / sequencing (two engines — never conflated)

Shared phases: **Opt-in → Re-engagement (nudges) → Reactivation**. Reactivation may be **armed** (ghost, nothing sending) or **active**. Sequences are ordered channel + copy. Composing = configuration; sending = automation/Wiring. The **engagement record** is chronology only — it authors nothing.

**7a Campaign calendar:** day-ordered content for a phase, under Engine 2 precedence. Does not decide runtime channel ownership.

**7b Attempt / channel-ownership engine:** one owning channel at a time; waits/attempts nest under the owner that failed; escalate forward when criteria met; live inbound can override an in-flight attempt; finishing event closes the sequence and can arm the next.

Operator-revisions (denser than Seed; **not Story law until promoted**): Text delivered not opened in 30 min → Email; Email opened, link not clicked in 24 h → next attempt; Form started not submitted in 24 h → Text; re-entries do not reset the clock; attempts are local retries under the failed owner; live form visit can open the next step; form submitted closes the nudge.

**Channel ladder conflict — UNRESOLVED as a founder lock:** Story/Seed/prototype chart use **Text → Email → Form**. Agents face later shows **text → email → call** (ElevenLabs) and says do not silently drop form from the machine. SQL `campaign_channel.token` CHECK is `'text'|'email'|'call'`. Specify both until Story is recut: **form remains a data-collection medium**; **call is on the Agents face**; which ladder is default sequencing is not closed.

### 8. Fact-refresh

Nudges ask for or infer eligibility-affecting facts. Field classes:

| Class | Route |
|-------|--------|
| Self-reportable | Forms / pre-meeting capture |
| Document-dependent | **Never** a form; tracked work items |
| Employer-directed | Ask the **firm**, not the client |

Any write-back initiates immediate re-evaluation. A missing fact is a signal.

### 9. Reference-currency

Versioned reference tables as data; a reference move is a **faceless** trigger that re-evaluates affected contacts. No code deploy to update law-side facts.

### 10. Eligibility re-evaluation

Private to the firm book. Pathway pass = **any** pathway assertion (CEC or FSW or FST or PNP-*), not one favoured pathway. Produce Analysis (headlines, deltas, service candidates, nudge/reactivation hints) with machine output retained. Every determination, including missing-data, is a signal. Open-box: inspectable/changeable without deploy.

Must not cold-detect strangers from public databases as Core Function.

### 11. Signal / motion (Engine 2)

Record every detection. Decide outreach separately:

1. **Reactivation first**, whenever anything is reactivation-worthy.
2. **Nudge only** when nothing is.
3. A nudge consolidates **every** outstanding self-reportable need into **one** form.
4. When reactivation fires, secondary signals attach as **agenda** on the pre-meeting brief — never parallel outreach.
5. **One client, one motion, ever.**

**UNRESOLVED:** what makes a signal **reactivation-worthy**; D-01 / D-02 builder placement.

### 12. Meeting / loop-closer

**Meeting booked** is the success event. Outstanding self-reportable fields open a capture form pending the meeting. Write-back → immediate re-evaluation. Pre-meeting brief is **live**, not a snapshot.

**UNRESOLVED D-01:** pre-meeting capture as tail of reactivation vs standalone `meeting_booked` sequence.  
**UNRESOLVED D-02:** in-meeting fallback surface for unresolved form gaps.

## 3.3 Cross-system trigger web

| From | Event | To |
|------|-------|-----|
| 1 Acquisition | seed inputs land | 2 Provision |
| 3 Commercial | running | Application 5–12 open |
| 5 Audit | sequence-ready | 7 enrollment |
| 7b | finishing event | 7 arms next |
| 7 | nudge fires | 8 fact-ask |
| 8 | write-back | 10 Eligibility |
| 9 | reference move | 10 Eligibility |
| 10 | every determination | 11 Engine 2 |
| 11 | chosen motion | 7 Engagement |
| 12 | meeting_booked capture write-back | 10 Eligibility |

## 3.4 Hard human gates (must not be automated away)

- Seed capture (stranger action)
- Firm/user provision (OLG) and OTP verify
- Database authorization
- Escrow accept
- Client opt-in / not silenced
- Meeting booking (human commitment)
- Firm responsibility to refuse illegal/unethical outreach
