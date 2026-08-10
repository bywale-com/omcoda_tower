# ANALYSIS — Prototype cohesion (2026-08-10)

**Status:** Locked analysis feeding [`PROTOTYPE-COHESION-PLAN.md`](./PROTOTYPE-COHESION-PLAN.md).  
**Context:** Post–machine tables (#60), actuation (#61), mistaken Hub Automations/Agents wire (#63 direction). Founder correction: **the product is the Register prototype.**

---

## 1. Product framing (corrected)

| Wrong assumption | Correction |
|------------------|------------|
| Hub SPA is “the app”; prototype is CT demo | **Prototype / CT is the product face** we have been building |
| Wire Hub Automations/Agents first | Authorship seat = operator **Configuration libraries**; consultant Board **inhabits** only |
| Mixed CT stand-ins + Hub machineApi | **One wire**, one face |

Register doctrine already said Hub Automations/Agents are **existing-wrong-seat** (`how/operator-configuration-libraries.md`, `how/00-INDEX.md` law 4). Analysis that treated Hub as destination was operator error.

**Three-surface model reminder:** Register theory workspace ≠ shipped Register; CT plant is the clickable product proof; Translation `/` is later hi-fi. For this initiative, **CT prototype modules are what must work.**

---

## 2. Spine that must work (founder story)

```text
Operator provisions firm
  → firm receives access (invite / OTP login link → their workspace/Board)
  → contacts uploaded into the book
  → Automations + Agents (sequences) authored in Config libraries
  → Action nodes call those sequences
  → Bind Active + sequence-ready → sequences kick in (live send)
```

That is most of the real product loop. Tables/runtime largely exist; **faces and cohesion** do not.

---

## 3. Hard decisions (H1–H4)

Resolved 2026-08-10 — wiring must not invent otherwise:

### H1 — Halt vs Kill vs in-flight motion
- **Halt** = suppression only: stop **new** enrollments and **new** sends immediately.  
- Leave **in-flight attempts** alone (finish naturally).  
- **Kill** = same mechanism, firm-wide (and permanent in founder posture).  
- Do **not** block Active on Gap #2 mid-motion-abort. Refine abort later if ever needed.

### H2 — Book handover
- **Authorize book** = single handover write (CRM/book grant).  
- **Confirm book** under Imports = **alias** to the same fact — one commit, one row.

### H3 — Firm brand
- Consultant/operator “Cedar Pathways” vs contact “Tower Immigration” = **label bug**, same `firm_id`.  
- Fix portal (and all chrome) to read brand from that firm. Not two demos.

### H4 — Bind “versions” → existing tables
- Automation version → `workflow` id(s)  
- Engagement version → `sequence_template` + `firm_sequence_binding`  
- Evaluation version → pin `reference_version` id + ruleset / `evaluation_ruleset` id  
- **No new Evaluation-pack table.**

---

## 4. Live send (not dry-run)

**Dry-run** = full path runs but Resend/Twilio are not called; a “would send” record is written.  
**Live** = message actually leaves.

Dry-run only stood in at the **outbound message** step. Enrollment, attempts, criteria windows, channel ladder were already real.

Founder posture for this initiative: **live send**. Sequencing rules (“email not opened → escalate”, etc.) are already in `rule_attempt_criteria` and consumed by the tick worker; live means when a rule fires, the next channel **actually sends**.

Gate today: `SEND_MODE` + `SEND_TEST_COHORT` (fail-closed). Plan execute must flip product default to live for Active firms (exact env/gate change in implement PR).

---

## 5. Attempt / sequence rules — UI gap

| Layer | Status |
|-------|--------|
| Tables seeded (`rule_attempt_criteria`, `seq_channel_ownership_order`, …) | Yes |
| Worker reads rows and escalates | Yes |
| Prototype UI to toggle/edit them | **No** (Settings tabs are placeholders) |

This is why Settings/Evaluation are first-class in the plan — table-first requires a modulator face.

---

## 6. Reverse inventory — modular tables → UI face

### Natural authorship homes (tabs already exist, mostly empty)

| Face | Tabs | Meant for |
|------|------|-----------|
| Automations | Workflow · Runs · **Settings** | Graph + runs + schedule/enrollment |
| Agents | Editor · Contacts · Activity · Report · **Settings** | Steps + **attempt/channel rules** |
| Evaluation packs | Pack editor | Pathways / motion / field-class vs Reference |

How-doc: attempt/channel-ownership engines sit under engagement templates as machinery — Agent **Settings**, not a new module.

### Tables with a named UI home (once wired)

`workflow*`, `workflow_trigger`, `workflow_run`, `action`, `sequence_template`, `firm_sequence_binding`, `enrollment`, `reference_versions`, `constants_packs`, `rule_eligibility_pathway`, `rule_reachability_checks` (Book and/or Evaluation), `contact_records`, `reachability_verdicts`, `sequence_ready`, `audit_runs`, `campaign_states`, `prepared_workspaces`, `halt_records`, `consent_records`, eligibility/signal/motion (runtime + Board read), `active_attempts` / `engagement_records` (Activity / Firm health), fact writebacks, CRM grant, sending pool tables.

### Modular tables with **no** UI modulator today (must gain Settings/Evaluation)

| Table | Natural face |
|-------|----------------|
| `rule_attempt_criteria` | Agents → Settings |
| `seq_channel_ownership_order` | Agents → Settings |
| `rule_motion_precedence` | Evaluation / Agents Settings |
| `rule_field_class_routing` | Evaluation / Agents Settings |
| `rule_cohort_scoring` | Agents Settings / Evaluation |
| `rule_metrics_thresholds` | Agents Settings / Oversight config |
| `seq_phase_order` | Agents Settings / Evaluation |
| `seq_eligibility_pipeline` | Automations Settings / Evaluation |

Deferred by founder: escrow acceptances (prototype), Meta campaign go-live.

---

## 7. What was already CT-wired vs machine-faceless

**Already on CT ports (older path):** Login OTP, crmOAuth Authorize, sending pool/warmup/ip, sendGate/ESP probe, metaAds chips, consultant haltStore.

**Machine tables mostly fixture/Hub-only until this initiative:** workflow*, enrollments, templates/bindings, contacts/audit/ready, campaign_states, reference cascade, eligibility/motion, attempt criteria editors, etc.

**Broken cohesion examples:** Commercial UI local vs Activation reading `escrow`; Config Publish state ≠ Bind dropdown source; Provision chrome vs OTP mint claim; Jump-to = notes not navigation.

---

## 8. Capability contract (what “everything works” means)

Deferred **only:** Meta go-live · Register & evolution · Escrow.

All other module capabilities in the prototype must commit or read real state — including:

- **Operator house:** Acquisition (persist campaigns + chips + handoff), Activation & forward-deploy, Reference Publish, Config libraries (Eval + Automations + Agents + Settings), Sending, Oversight, Audit trail, Founder Kill, Support  
- **Operator tenancy:** Provision + invite, Commercial (except escrow deferred → Commercial escrow stays prototype per founder), Bind Armed/Active, Book readiness upload/audit, Firm health, Activation state checklist  
- **Consultant:** Login, Prepared Authorize (+ Confirm book alias), Board inhabit, Halt H1, Client workspace, Meetings ← Booking, Live brief  
- **Contact:** Consent/Silence, nudge/facts/loop-closer, Booking → Meetings, firm brand H3  

(Full per-capability tables were agreed in chat 2026-08-10; execute PR checks them off.)

---

## 9. Prior mistaken work (context only)

- PRs #60/#61: machine materialize + actuation — **keep** (runtime/tables).  
- Automations/Agents “alive” aimed at Hub (#63 direction): **wrong face**; reusable walk/ports, wrong product seat.  
- Journey wire toward Hub Board: same correction — Book readiness / consultant desk in prototype own the contact path.

---

## 10. Soft questions withdrawn

Founder rejected soft questions answerable from how-docs (Provision mint, Prepared vs forward-deploy, Armed vs Active, Publish→Bind, etc.). Those are treated as **resolved by corpus**, not open. Only H1–H4 required founder lock.

---

## 11. Index

| Doc | Role |
|-----|------|
| [`PROTOTYPE-COHESION-PLAN.md`](./PROTOTYPE-COHESION-PLAN.md) | Executable initiative plan (locked, not started) |
| This file | Analysis + decisions that produced the plan |
| [`how/operator-configuration-libraries.md`](./how/operator-configuration-libraries.md) | Authorship seat doctrine |
| [`how/operator-firm-bind.md`](./how/operator-firm-bind.md) | Bind / Armed / Active |
| [`system-map/FROZEN-TABLES-v1.md`](./system-map/FROZEN-TABLES-v1.md) | Table inventory |
| [`system-map/ACTUATION-REPORT.md`](./system-map/ACTUATION-REPORT.md) | Worker + send gate (historical dry-run default) |
| [`SYSTEM-COMPONENT-MAP.md`](./SYSTEM-COMPONENT-MAP.md) | Halt Gap #2 parked; H1 chooses suppression-only |
