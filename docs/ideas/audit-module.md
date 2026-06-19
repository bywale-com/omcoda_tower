# Audit Module — Ideas Log

**Project:** Tower  
**Surface:** Hub → Audits  
**Status:** Product direction log (June 2026)  
**Related:** `tower-product-vision.md`

---

## 1. Purpose

An audit answers one operational question:

> **Can we reach this contact, and can we start a sequence on them?**

It is the **on-ramp** to Tower’s core loop (contacts → sequence → data collection → rules → nudges). It is **not**:

- A sales “Database Opportunity Assessment” report (PASS/FAIL ceremony, ROI narrative)
- Pathway assignment or CRS scoring
- Activation probability or time-to-first-activation forecasts
- A minimum contact count gate (e.g. “125 contacts”)

External assessment HTML was largely **trust-building / sell-the-audit** collateral. In-app audit is **reachability + sequence eligibility**.

---

## 2. Core checks (v1)

| Check | Why |
|-------|-----|
| **Email valid** | Email sequences, opt-in forms |
| **Phone valid** | SMS / call touchpoints |
| **At least one reachable channel** | Row may have only email or only phone; must match chosen sequence channel |

**Per-row outcomes (conceptual):**

| Verdict | Meaning |
|---------|---------|
| **Reachable** | Can start sequence now |
| **Partial** | One channel OK, one bad — pick sequence channel or fix data |
| **Unreachable** | Fix or exclude from activation batch |

Hub row meta (e.g. “3 open”, “Clear”) should reflect **open reachability issues**, not immigration analytics.

---

## 3. Secondary benefit (not the engine)

When many records fail validation, the firm learns **their database is outdated**. That builds trust but is a **byproduct** of reachability checks, not the audit’s primary job.

---

## 4. Lightweight boosts (still v1-friendly)

No fake math, no provider APIs required for first ship:

| Idea | Value |
|------|--------|
| **Typo / garbage detection** | `gmial.com`, `(000) 000-0000`, placeholder names |
| **Dedupe within batch** | Same email or phone twice → avoid double-activation |
| **Already in Tower** | Overlap with existing contacts / clients |
| **Channel match to sequence** | SMS sequence → flag missing or invalid mobile; email sequence → flag bad email |
| **Consent / silenced** | Opted-out clients not activation-ready even if parseable |
| **Name present** | Merge tags in first touchpoint |

---

## 5. Data provider enrichment (future — not v1)

Optional power **on top of** lean reachability checks. Each layer adds value without bloating the audit verdict.

### Tier 1 — Strengthens audit directly

| Idea | Tower use |
|------|-----------|
| Phone line type (mobile / landline / VoIP) | SMS sequences need mobile |
| Email deliverability (beyond syntax) | Catch-all, disposable, role inboxes |
| Number / email still active | “Stale database” signal |
| Timezone from phone prefix | Send in local window |
| Duplicate & identity match | Fuzzy match across batch + existing contacts |
| WhatsApp / messaging reachability | If firm uses WhatsApp nudges |
| CASL / marketing-consent risk | Legal to initiate, not just technically valid |

### Tier 2 — Fills thin imports

Import today maps **name, phone, email** only. Providers could append or normalize:

- E.164 phone, typo-corrected email
- Structured first / last name
- City / province / country
- Preferred language (use carefully; opt-in form still authoritative)
- Employer / job title (more relevant after client promotion)
- Address / move signals (NCOA-style)

### Tier 3 — Immigration-specific (downstream of audit)

Not audit verdict — **client** value after promotion:

- NOC / TEER from job title
- Credential / regulated occupation hints
- Public draw / CRS threshold feeds (firm-level context)
- Province program fit once province + occupation known

### Tier 4 — Sequence routing (no probability claims)

| Idea | Value |
|------|--------|
| Best channel | Strong email, weak SMS → start email opt-in |
| Shared / role inbox risk | Deprioritize SMS on corporate addresses |
| Stale lead age | Welcome vs reactivation sequence choice |
| Segment tags | “Phone only”, “international number”, etc. |

### Tier 5 — Firm-level intelligence

- Database health score over time (% reachable)
- Trends after each import / audit
- Draw / regulatory calendar context for when to re-audit

**Highest ROI if picking three later:** (1) phone + email verification APIs, (2) dedupe + identity resolution, (3) job title → NOC suggestion on client promotion.

---

## 6. Explicitly out of scope for audit

- Pathway assignment (Express Entry vs PNP) as audit output
- CRS scores from guessed data
- Minimum N contacts or activation probability
- Big ceremonial PASS/FAIL opportunity report
- Document expiry, sequence coverage, CRS drift as **audit** concerns (those belong to **clients**, **agents**, or **automations** once someone is reachable and in-journey)

---

## 7. Plus flow (Hub → Audits → +)

Direction for UI (not implemented):

1. **Scope** — whole contact list, latest import, or user-selected segment
2. **Run** — reachability checks (format-first; enrichment hooks later)
3. **Report** — counts + per-row verdict + fix list
4. **Act** — arm standard sequence on reachable subset (optional)

Fast path into Tower: **import CSV → audit → “N of M can be sequenced” → arm opt-in / welcome on reachable set.**

---

## 8. Mental model

```
Import (thin data)
    → Audit core: email + phone valid
    → Audit+ enrichment (optional): line type, deliverability, dedupe, timezone, compliance
    → Sequence on reachable subset
    → Client promotion + immigration enrichment (separate holon)
```

Audit schema for holon/docs registry (`derives_from`, `invariants`) is **engineering documentation** — not the same as Hub **Audits** product module.
