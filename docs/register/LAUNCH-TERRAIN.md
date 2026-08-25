# Launch terrain — commence order (not a packet)

**Seat:** Product Manager.  
**Not a packet.** Do not hand this to the engineer until a pocket locks as a packet. No plates from this file.  
**Sprint:** all **core automations** and **agent sequences** required for launch.  
**Planning:** done 2026-08-25. Founder: communicate the work-through **in full** so they can walk it back. Then commence.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Does not:** plant; recut 015; mint tables; start parked pockets (confirm look, request task, in-flight pause-queue, brief vs hardcoded) until that pocket is next.

---

## What must **exist** (agent sequences)

| Sequence | Objective grain | Notes |
|----------|-----------------|--------|
| **Opt-in** | Two campaigns inside (prior names: launch window · launch day — operator can rename) | Built / ready. Lodging people **into** it is the first automation. Then Agents. |
| **Re-engagement** | Data request most of the time | Not a random campaign name. First time: after opt-in complete. Again: pack / put-in / schedule. |
| **Reactivation** | Book a meeting | **Not** a sequence that sits “between” re-engagement and meeting. It is a **Rule condition** (reactivation signal on) that assigns this sequence. |

---

## Work through — in this order

### 1. Nothing → opt-in

**Triggers:** new contact exists · consultant **Start / confirm** (look deferred: [`CONFIRM-READY-DEFERRED.md`](./CONFIRM-READY-DEFERRED.md)).  
**Middle:** conditions we already walked (sequence-ready / audited so Start is eligible).  
**Action:** assign **opt-in** sequence.  
**Then:** Agents. No more Automations until the sequence completes.  
**New nodes / stores:** none. Existing kinds.

### 2. Opt-in complete → first re-engagement

**Trigger:** **opt-in sequence complete** (all objectives met). Must exist and be referenceable. Campaign-to-campaign stays Agents. Automations hears the **sequence**, not each campaign. Grain (sequence vs last campaign vs failure) was named as a discussion — do not invent a new node kind.  
**Middle:** **Rule** as it exists. Usually negative for everything. Required-data **listing** occupies Form (A40). Law 25 still the named hole (listing as a write) — stand up, not a new kind.  
**Action:** assign **re-engagement**.  
**Need:** Rule outputs **legible** in If / Switch / Action (reactivation signal, listing, …). Lattice already named. Do not invent extra classes.

### 3. After they complete the ask → reactivation (or more data)

**Trigger:** form submitted / that objective met.  
**Middle:** Rule **again**. Reactivation is **not a new in-between sequence**. It is a **condition on Rule output**: signal on → assign **reactivation**. Still need data → another data request (same re-engagement grain).  
**Neither** (no listing, no reactivation): don’t lose them → **§4**.  
**Both signals at once:** not this slice. §6.

### 4. Re-engagement again (ongoing)

Not in a sequence (or not the first). Conditions in the middle (cooldown on **Rule** vs **assign** — two bars; Schedule does **not** assign mid-flight).

| Trigger | What we know |
|---------|----------------|
| **Pack update** | Known. Precedence above everything, including in-flight. Different workflow. Work the canvas: Get → Rule → same Switch as §3. What pack update *produces* still a gap — don’t overbuild. |
| **Contact uploaded information** | Workspace Put in. [`CONTACT-UPLOADED-EVENT-PACKET.md`](./CONTACT-UPLOADED-EVENT-PACKET.md). Local = **this kind**. May not fire a sequence every time. |
| **Schedule** | The rest. Not built yet. Heartbeat trigger, not the condition. |

### 5. Mid-flight override (parked — same sprint later)

Only **pack update** overrides a **running** sequence (same situations that override cooldown). Schedule + conditions → mid-flight does **not** get a new sequence. May restamp the **form underneath**, or pause/queue the running sequence for priority. **Do not build first.**

### 6. Both reactivation + data request (talk when we get here)

Law 21 already. Not first-answer queue. After reactivate-agent objective completes: in-app Action, drop listing like Form onto a **request task** (consultant workspace). Consultant triggers → on-click form. Desk must afford the task (law 41). Do not recut A33 until this pocket.

### 7. Open, not this commence slice

- Confirm **look** (popup → Start / later).  
- Meeting booked → brief / display: automation vs hardcoded.  
- Canvas chain on sequence complete if not already possible (law 28 / 32).  
- Sequence-complete trigger grain vs failure.

---

## Do not

- Objective-less outreach.
- Fourth sequence class.
- Wait node.
- Get-everyone on Schedule with no conditions.
- Build §5–§7 before §1–§4.
- Recut 015. Overwrite 15:43. Plant. Mint tables.
