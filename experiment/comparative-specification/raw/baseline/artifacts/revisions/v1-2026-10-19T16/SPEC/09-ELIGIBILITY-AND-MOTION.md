# 9. Eligibility, Engine 2, and the meeting loop

## 9.1 Evaluation packs (open box)

House authors inspectable rules against **Constants** (versioned industry criteria) and **Reference tables**. V1 pack is Immigration · Service eligibility.

Outcome families (toggleable; Hub plant):

- Pathway detection
- Gaps
- Profile & operations
- Category draws
- Draw competitiveness

Pathway pass = **any** of CEC / FSW / FST / PNP-* asserting — not CEC-only.

Example fields that unlock gaps/ops (not an exhaustive catalog): `eca_status`, `ee_profile_exists`, `ee_profile_last_updated`, `foreign_work_years`, plus language/TEER-style gates, CRS/draw constants.

**Analysis readout** (pane): headlines, deltas, service candidates (B-*), nudge/reactivation hints, narratives. Machine JSON retained underneath.

A reference version publish re-evaluates affected contacts without a code deploy.

**UNRESOLVED:** rule-pack IP / liability; Constants packs beyond Immigration.

## 9.2 Collectible field classification

| Flag | Meaning | Downstream |
|------|---------|------------|
| Self-reportable | Client knows offhand | Forms / pre-meeting capture |
| Document-dependent | Paperwork | Never a form; tracked work items |
| Employer-directed | Aimed at the firm | Separate routing |

Required-data listings on rule output must be the source of form questions. Deterministic — no AI to decide what data is required. If that ever stops being true, say so.

## 9.3 Engine 2 (motion)

Signals are recorded when found. Outreach is a separate decision. Precedence in §3.2 system 11.

**UNRESOLVED:** reactivation-worthy criteria. Without that, the machine cannot close “when do we invite to a meeting vs ask for data?” as a complete rule.

## 9.4 Attempt engine vs Engine 2

Engine 2 chooses **which sequence motion** (reactivation vs nudge). The attempt engine runs **inside** the chosen sequence (channel ownership, retries). Neither replaces the other.

## 9.5 Objective met and failure (packets 022 / 023)

**Met:** completion write (click → messaging event on a stamped send; form → `fact_writebacks` with form/objective axis; meeting → `meeting_booked` with objective axis) matches the campaign that asked. Global “any meeting this person ever booked” is the bug 022 forbids.

**Failure / exhausted:** stop outbound spending; **keep listening**. Attempt status `exhausted`; enrollment `pursuit_state` pursuing | exhausted. Do not null `campaign_id`, do not consume access links, do not disable booking/form doors on exhaustion.

**Nullified:** escrow-era only — firm pulls money; inbound refused. Not built. Direction: objectives are the billable unit (`SYSTEMS-OBJECTIVE-ESCROW.md`) — **not Story-promoted, not a build order**.

## 9.6 Meeting loop-closer

Human books (hard gate) → `meeting_booked` → pending capture if facts outstanding → write-back → immediate re-eval → **live brief** on Consultant Meetings.

D-01 / D-02 remain silences (§3.2 system 12).
