# Launch §1 — Nothing → opt-in (expanded)

**Seat:** Product Manager.  
**What this is:** expansion of commence **§1**. Not an engineer packet yet. Recut = new packet when this pocket locks for build.  
**Summary (stays tight):** new contact exists + consultant Start → assign **opt-in** → Agents. Nothing new.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Cousins:** [`LAUNCH-TERRAIN.md`](./LAUNCH-TERRAIN.md) · confirm **look** plates [`WAIT-NOTE-PLATES.md`](./WAIT-NOTE-PLATES.md) (not a packet) · reminder [`CONFIRM-READY-DEFERRED.md`](./CONFIRM-READY-DEFERRED.md) · Audit field [`AUDIT-FIELD-PACKET.md`](./AUDIT-FIELD-PACKET.md) · Agents assign [`FORM-CLASS-PACKET.md`](./FORM-CLASS-PACKET.md) A14 (do not recut A40 here — this slice does **not** create a data-request form) · import vs new contact [`PRIMITIVES.md`](./PRIMITIVES.md) · workspace foot [`WORKSPACE-UNTIL-OPT-OUT-PACKET.md`](./WORKSPACE-UNTIL-OPT-OUT-PACKET.md).  
**Does not:** plant; recut 015; mint tables; packet Confirm until they agree with the plates; batches; escrow; §2 sequence-complete; occupy Form; Get-everyone; a sequence picker of three.

---

## What this slice is

From **nothing** (people just arrived in the book) to **lodged in the opt-in sequence**. After that it is **Agents** — campaigns, channels, attempt/channel rules, content. This slice does not author those. The opt-in sequence **already exists** (two campaigns inside; prior teaching names Launch window / Launch day; operator can rename). Everything begins from opt-in. Start’s sequence **is** opt-in — not a picker.

Getting on the platform / a workspace existing does **not** start this. **Upload is when it starts.**

---

## Two canvases. Do not collapse.

Wait is not this canvas waiting for the consultant. One canvas cannot be “new contact fires **and** wait for the consultant.” Two automations, existing kinds:

### Canvas A — people arrived → first evaluation (audit)

**Trigger (one of these events; do not collapse them):**

| Event | When | Notes |
|-------|------|--------|
| **Contact file imported** | They upload a file (one or a thousand) | Batch. Live import does not also fire new-contact per row. Hang **bulk** evaluation on import. |
| **New contact** | That person exists | With or without an import. Own event. |

**Then:** in-app **Run audit** (who = those contact writes). Audit field populates (hardcoded, law 45) — sequence-ready / reachability. Not “set audit field” as an Action.

**Then:** **If** sequence-ready. True: they are eligible for Start. False: stop. Do not assign opt-in from this canvas.

This is how we **know who is valid**. Confirm/Start is only eligible for those people. Confirm **look** is plates-first ([`WAIT-NOTE-PLATES.md`](./WAIT-NOTE-PLATES.md)) — do not block this canvas on that modal.

### Canvas B — consultant Start → lodge into opt-in

**Trigger:** consultant **Start** (the operation). Manual / in-app — not “new contact waited.” New contact **already exists** as the who.  
**Who:** those contacts that are sequence-ready (audited). Not the whole book. Not silenced as outreach-valid if Audit already failed them.  
**Action:** Agents — **assign existing** opt-in sequence (or from that template). Select agent = the **whole sequence**. Nothing further on that row. **Do not** declare a data-request Form here. **Do not** occupy A40. Campaigns and their objectives already live **on** that sequence.  
**Then:** Agents. No more Automations on this path until **§2** (sequence complete).

---

## What must already be true (not built in this slice)

- Opt-in **sequence template** exists and is built (two campaigns). Per firm or default + overrides live on Agents — send **obeys** them when Agents runs. This automation does not set channel rules.
- Consultant has a workspace. Book can receive an upload. Contact **seat** (Now / History / Upload) is other packets. Foot opt-out of the workspace ≠ this enroll.
- Run audit and the Audit field already specified.

---

## Footnotes — named, not this expansion’s build

- **Batches** (50 this week, next 50): named. Do not design here.
- **Escrow:** founder said not talking.
- **Confirm look:** plates exist; packet only if they agree. Start as **operation** still this slice.
- **Email unsubscribe:** not designed. Validity here is Audit / sequence-ready.

---

## Specified and clear

Two canvases; import ≠ new contact; audit then If sequence-ready; Start assigns opt-in only; then Agents; no new node kind; no form occupancy.

## Specified but not clear (do not invent)

- Exact Start **event** name in the picker (Manual vs an in-app “started” write). SA maps. Do not mint.
- Whether Canvas A is one workflow with two trigger variants (import **or** new contact) or two workflows that share the rest. Same shape either way.
- Sequence-complete grain is **§2**, not here.

---

## Do not

- Hang enroll on firm created / workspace created.
- One canvas that both fires on new contact and waits for the consultant to Start.
- Assign from Canvas A (skip Start).
- Filter Contact ▾ as the enroll list.
- Recut A40 / consent form into this automation.
- Recut 015. Overwrite 15:43. Plant. Mint tables. Packet Confirm until they agree.
