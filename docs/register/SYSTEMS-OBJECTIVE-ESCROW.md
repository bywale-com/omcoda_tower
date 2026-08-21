# Systems — objectives are the billable unit (escrow / contingent pricing)

**Seat:** Systems Analyst.
**Status:** Founder expansion **2026-08-21**. Direction, explicitly **not a build order**: *“I'm not saying building right now, I'm just saying that's where we're going.”* Same grade as [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) / OPERATOR-REVISIONS — denser than Seed/World, **not law until Story 3 is promoted**.
**Why this file exists:** log rule — durable founder expansions get excerpts **and** a register markdown, so the wording is not left in the background. This is the *reason* the failure mode is shaped the way it is.
**Does not:** mint a table; build escrow; overwrite the Agents flagship (15:43); extract Requirements.
**Join:** [`SYSTEMS-GOAL.md`](./SYSTEMS-GOAL.md) · [`SYSTEMS-CHANGE-PACKET-022.md`](./SYSTEMS-CHANGE-PACKET-022.md) (objective met is a Local event) · [`SYSTEMS-CHANGE-PACKET-023.md`](./SYSTEMS-CHANGE-PACKET-023.md) (failure = stop spending, keep listening) · [`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) §3.

---

## Founder excerpts (do not paraphrase away)

Spoken 2026-08-21, in answer to “what does failure *do*.”

> the failure mode is simple — it just means we're not gonna waste resources on trying to make that objective happen. But if it happens, if it clears, then of course it's still a win.

> it just means we're not wasting any resources to make it happen — that's the difference. But if it happens all the same, the objective is met.

> this just matters because once we build the escrow, you know, contingent pricing into it — because that's the angle ultimately, is that we get paid on objectives met.

> reactivation is like an objective that we get paid on.

> as long as there's money in the system, when that objective is met, that objective is counted and we get paid.

> while that sequence is running, the person can't take their money out, and that objective can't be retracted.

> that's where we're going. I'm not saying building right now.

> if we couldn't meet the objective in their attempts, tries or whatever — whenever the objective is met it still counts and we get paid. However, they cannot take out their money.

> once they do that, then that whole objective is nullified totally. So even if they submit afterwards, even if they book a meeting afterwards — they can't book a meeting. Essentially that link for the meeting is done. Nullified.

---

## The systems reading (alignment, not a substitute flag)

**The objective is the billable unit.** Not the send, not the attempt, not the sequence. That is why the objective needed a real identity and a real match (022) before any of this is possible: **you cannot bill on a fact you cannot attribute.** A completion that cannot be traced to the objective that asked for it is not invoiceable.

Three states of a pursuit, and money reads all three:

| State | Outbound | Inbound | Money |
|---|---|---|---|
| **Pursuing** | spending | listening | held, cannot be withdrawn, objective cannot be retracted |
| **Exhausted** | stopped | **listening** | still held, still claimable — *“it still counts and we get paid”* |
| **Nullified** | stopped | **refused** | withdrawn. The objective is void even if the contact acts afterwards |

The load-bearing asymmetry: **exhaustion is ours, nullification is theirs.** We stop spending; only the firm pulling money stops the listening.

## What 022 + 023 already protect (why the direction is not foreclosed)

Neither packet builds escrow. Both were shaped so escrow stays buildable:

| Escrow will need | Already true after 022 / 023 |
|---|---|
| Attribute a completion to one objective | 022 stamps the ask (`campaign_objective_id` on the send / form / meeting) and matches Local, fail-closed |
| Detect a completion **after** we stopped spending | 022 detects on the completion INSERT, not inside the tick's open-attempt loop |
| Not lose the win when we give up | 023 forbids closing the door on exhaustion; a completion on an exhausted pursuit is a normal win |
| Adjudicate **ordering** (met before or after withdrawal) | the completion row and the `objective_met` append both carry timestamps and the objective id |
| One claim, not many | met **is** the cursor advance — once by construction (022 §2.3) |

Had failure been cut as “close the enrollment,” every row above would be false and this angle would have needed a rewrite.

## What it will still demand (named, not built, not minted)

1. **A claim ledger.** Money is the one place a derived read is not enough. “Was this objective claimable at the instant it completed?” cannot be recomputed later — the withdrawal timestamp versus the completion timestamp *is* the payment question, and current balances move. That is a **new fact**, not a copy of the completion (which says only *“Daniel submitted CRS”*) and not a copy of the cursor. Expect one row per **objective × contact**: satisfied-at, claimable, priced, paid. This is the one mint this direction requires, and it is **not** authorized yet.
2. **Escrow as stood up is thin and not live.** `escrow_acceptances` is `firm_id` PK + `accepted` + `terms` + `accepted_at` — firm-level acceptance only. **No balance, no per-objective price, no withdrawal, no release.** The `escrow` port is a **stand-in**; escrow fulfillment is on V2-BACKLOG. Do not call it the system. (Packet 020 separately adds `status` to that table — unrelated to this.)
3. **Withdrawal is a new operation.** It has no write today. It must nullify **live** objectives, and 023 §3.4 reserves the word: `active_attempts.status='nullified'` already means *“they responded — a win.”* Do not overload it.
4. **Nullified must be enforced at the door, not at the tally.** *“They can't book a meeting… that link is done.”* The refusal is at ingress. `access_links` already has `invalidated_at` / `consumed_at` — that mechanism exists; the booking and form doors would need the same check. Refusing to *count* a completion while still *accepting* it is not what was said.
5. **Pricing is per objective kind.** *“Reactivation is like an objective that we get paid on”* implies not every objective carries the same price, and possibly not every objective is billable. Unspecified. Do not invent a price column.

## Story — this partially fills a named silence

[`SYSTEMS-STORY.md`](./SYSTEMS-STORY.md) §3 silence: **“Escrow release trigger / outcome definition (`Seed §7, §13.1`)”** — also in the master silence list as *Escrow release definition*.

The founder has now given the **trigger**: release is on **objective met**. Not on sequence completion, not on a meeting alone, not on a subscription period.

Constraints already in Story §3 that this must respect (they are musts, not silences): commercial terms are **firm ↔ Om Coda**; Tower holds **no** immigrant settlement funds; the end-client pays Tower nothing; escrow is the **peer door** at activation. So the money in question is the **firm's**, held against objectives — never the contact's.

**Not filled:** the *outcome* half of that silence — pricing, which objectives are billable, withdrawal terms, and what nullification does to already-claimed objectives.

**Requirements must not extract a claim state from this file until Story §3 carries a promoted must.** Naming the trigger is not the promotion.

## Do not

- Build escrow, pricing, or a claim ledger from this file.
- Treat exhaustion as an ending, or gate completion detection on `pursuit_state`.
- Reuse `active_attempts.status='nullified'` for a nullified objective.
- Let a nullified objective be merely uncounted — the door refuses.
- Overwrite 15:43. Recut 015 / 019.
