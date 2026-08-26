# Launch terrain — commence order (not a packet)

**Seat:** Product Manager.  
**Not a packet.** Do not hand this to the engineer until a pocket locks as a packet. No plates from this file.  
**Sprint:** all **core automations** and **agent sequences** required for launch.  
**Planning:** done 2026-08-25. Summary stays tight. **When we work a section, expand it** so nothing falls through.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Does not:** plant; recut 015; mint tables; start parked pockets until that pocket is next. **No queue** (07:47 recut).

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

**Summary:** new contact exists + consultant Start → assign **opt-in** → Agents. Nothing new.  
**Expanded (working this slice):** [`LAUNCH-1-NOTHING-TO-OPT-IN.md`](./LAUNCH-1-NOTHING-TO-OPT-IN.md). Two canvases (arrive → audit · Start → assign). Confirm look plates [`WAIT-NOTE-PLATES.md`](./WAIT-NOTE-PLATES.md) — not a packet until they agree.

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

**Decouple (why this slice taught us):** a re-evaluate (schedule / event) must not be **discarded** just because of cooldown — it can produce something that has to be addressed **now**. That split **evaluation** (Rule) from **assigning a sequence**. Store/queue of that first half is **retracted** (below).

### 4. Re-engagement again (ongoing)

Not in a sequence (or not the first).

**Can’t wait** (re-evaluate now, even mid-flight / even inside cooldown): **pack update**, or a **specific kind** of contact put-in. Those two only.

**Can wait:** everything else. That trigger is a **schedule**. A schedule is **influenced by running sequences** — mechanism when we work this. Influence is on automations that **have a sequence**, not on every workflow (some automations are not sequence-based; those are not affected). That influence **kills the need for a queue**: we do not store a Rule result to fire later. Schedule simply does not assign (or does not pick) people who are mid-flight.

| Trigger | What we know |
|---------|----------------|
| **Pack update** | Can’t wait. Precedence. Different workflow. Get → Rule → same Switch as §3. |
| **Contact uploaded information** | This kind may be can’t-wait. Packet already. May not fire a sequence every time. |
| **Schedule** | The rest. Can wait. Influenced by running sequences. **Not built yet.** |

### 5. Mid-flight override (parked — same sprint later)

Can’t-wait triggers (pack update; maybe this-kind put-in) vs schedule (waits / is influenced). Pack update may restamp the **form underneath**. **No queue** — do not pause-and-store a running sequence as the design. **Do not build first.**

### 6. Both reactivation + data request (talk when we get here)

Law 21 already. Not a queue. After reactivate-agent objective completes: in-app Action, drop listing like Form onto a **request task** (consultant workspace). Consultant triggers → on-click form. Desk must afford the task (law 41). Do not recut A33 until this pocket.

### 7. Open, not this commence slice

- Confirm **look** — plates [`WAIT-NOTE-PLATES.md`](./WAIT-NOTE-PLATES.md); packet if they agree.  
- Meeting booked → brief / display: automation vs hardcoded.  
- Canvas chain on sequence complete if not already possible (law 28 / 32).  
- Sequence-complete trigger grain vs failure.

---

## Do not

- Objective-less outreach.
- Fourth sequence class.
- A queue / store of Rule output to fire after a gap.
- Get-everyone on Schedule with no conditions.
- Let Schedule-triggered sequence automations ignore running sequences.
- Build §5–§7 before §1–§4.
- Recut 015. Overwrite 15:43. Plant. Mint tables.
