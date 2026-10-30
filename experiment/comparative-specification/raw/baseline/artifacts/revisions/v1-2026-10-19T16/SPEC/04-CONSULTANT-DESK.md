# 4. Consultant desk

Product face: `/prototype-ant` → Consultant. Persistent left nav. Modules revealed up front.

## 4.1 Modules

| Module | Job |
|--------|-----|
| **Board** | Client list with **Phase signal** chips (opt-in / re-engagement / reactivation / silenced). Entry to **Client workspace**. Inhabit only — not pack authorship. |
| **Contacts** | Private book directory; **Imports**; **Confirm book for Tower** on an assisted import batch (same handover as Authorize book). |
| **Meetings** | Booked rows; **Live brief** (recomputed); copy brief / starts-in chrome as named. |
| **Prepared Workspace** | Activation artifact (shared / not everyday nav chrome in the ALG story). **Authorize book** and **Accept terms**. |
| **Login** | Passwordless OTP: email → send code → verify. Fallback when magic link is not used. |

Client workspace (from a Board row) holds **Client Brief** / Information, **History**, and **Activity** (engagement record / chart). Activity is a **tree of outreach** — chronology of what already fired. It does **not** connect left to the Automations trigger that assigned the agent. Lineage is a different, queryable thing (Automations law 29).

## 4.2 Activation on this desk

On Prepared Workspace:

1. **Authorize book** — Connect CRM / grant database access, or Upload / confirm assisted import, then **Authorize**. Writes book-handover read by Book readiness and Activation state.
2. **Accept terms** — License acknowledgement (licensee identity) + Escrow terms panel + acknowledgment + **Accept**. Writes license+escrow acceptance read by Commercial and Activation state.

Those two commits are the hard inputs. The consultant does not open Configuration libraries to complete activation.

Assisted path: Contacts → Imports → batch → **Confirm book for Tower**.

## 4.3 Governance: Halt outreach

From Board or Client workspace: **Halt outreach**. Scope: **This contact** or **Firm book**. Optional reason. **Confirm halt** writes halt/silence that runners and send gates honor. Halt is refusal under the consultant’s license — not editing a house template.

**Lift halt** is named in surface vocab.

## 4.4 What the consultant sees of engagement

- Phase chips: what is in motion (armed vs active as inhabited result).
- Engagement record: events that already fired (channels, attempts, escalations). Record only.
- Live brief on a meeting: current analysis, outstanding facts, secondary signals as agenda when reactivation fired.
- Board may show today’s meetings, search, newest-first, export chronology as named chrome.

The consultant does **not** author sequences, rules, or automations on this desk.

## 4.5 Client Data (inside Client workspace)

Profile, Q&A, forms, eligibility-related facts. Facts come from the book and from touchpoint write-backs. CRS/pathway charts exist in the older prototype story; intended data source is tables (`fact_writebacks`, eligibility results), not painted scenery.

**Honesty law:** records that show in a module come from tables. Empty book = empty module. Do not hard-code demo people into the SPA.

## 4.6 Access paths

- OTP login → Board for that session’s firm.
- Magic link `/a/<token>` → redeem → session → `/prototype-ant`.
- Session firm **is** the provisioned firm (one UUID across auth and machine). A freshly provisioned firm lands on an empty book until import/connect.

**UNRESOLVED:** Cedar-class vs Apex-class density is a prototype honesty issue, not a product type. Multi-consultant sharing of one firm desk is unnamed.
