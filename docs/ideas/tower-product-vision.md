# Tower — Product Vision

**Project:** Tower  
**Audience:** Immigration consultancies (B2B)  
**Status:** Product direction log (June 2026)  
**Scope:** Core loop and value prop. Hub Agents and Automations are a fuller vision — noted briefly, not specified here.

---

## 1. What Tower is

Tower is a **proactive eligibility engine wrapped in engagement** for immigration firms.

The firm gives Tower **contacts** (CRM export, spreadsheet, lead list). Tower does not wait for a consultant to manually chase each person. It runs a continuous loop:

1. **Check reachability** — can we contact this person? (Audit)
2. **Run a standard immigration engagement sequence** — firm → client, free value-add (opt-in, then nudges)
3. **Collect and refresh client data** through those touchpoints (forms, replies, profile updates)
4. **Re-run rules against live data** — CRS, permits, draw thresholds, pathway fit, etc., as rules and client facts change
5. **Push outcomes back into the app** — next nudges, escalations, reactivation, eligibility signals

Tower is **not** a reactive CRM (“what should we do when someone emails?”). It is **always-on**: sequence → data in → rules out → next nudge. Immigration rules change; client situations change; Tower keeps **re-crunching** and **re-engaging**.

**Value prop (one line):** Give us your contacts; we engage them, keep their immigration picture current, and surface when eligibility changes — without manually rechecking every file.

---

## 2. The core loop

```
Contacts / import
    → Audit (reachability)
    → Standard sequence (opt-in → nudges → …)
    → Collect data via touchpoints
    → Rule engine (re-evaluate eligibility)
    → Nudges / alerts / reactivation
    → (repeat)
```

**Nudges are not spam.** They are the **data collection mechanism** — each touchpoint can ask for or infer facts that affect eligibility (work history, language, permit expiry, province, job change, etc.).

**The rule engine is central.** When IRCC moves a draw threshold, someone hits a work milestone, or a permit nears expiry, Tower recalculates what they qualify for *now* and decides what to send next.

**Reactivation** applies when someone went quiet but their profile became interesting again under updated rules or new data.

---

## 3. Engagement phases (product model)

| Phase | Purpose |
|-------|---------|
| **Opt-in** | Firm → client; consent and first channel open |
| **Re-engagement (nudges)** | Ongoing touchpoints; collect and refresh data |
| **Reactivation** | Re-engage dormant contacts when rules or data warrant it |

Standard sequences are **immigration-specific** and offered as a **free value-add** from the firm to the client. Staying informed changes eligibility; Tower treats **fresh information** as the product, not a one-time assessment.

---

## 4. How this maps to the prototype (today)

| Concept | Tower examples |
|---------|----------------|
| Contacts from the firm | Contacts sidebar, CSV import (name / phone / email) |
| Reachability gate | Hub → Audits (see `audit-module.md`) |
| Standard sequence | `journeyTree.ts`, opt-in / nudges / reactivation journey data |
| Data via engagement | Form visits, nudge briefings, live form / Q&A in client data |
| Rules + escalation | `JourneyEscalation`, EventsTab eligibility signals |
| Crunch numbers | Client CRS, pathway, profile, CRS history |
| Feed back → nudges | Client badges, nudge state, activation logs |
| Consultant visibility | Board, Activity, engagement calendar, Journey tab |

**Not built yet:** live rule engine + runtime that evaluates every client on rule/data changes and fires sequences automatically. Shape exists in data and UI; execution is largely mock/static.

---

## 5. Hub (partial scope)

| Section | Role in the core loop |
|---------|------------------------|
| **Audits** | Gate and hygiene on contact data before or at sequence start |
| **Agents** | Fuller vision — not specified in this doc |
| **Automations** | Fuller vision — not specified in this doc |

Agents and Automations belong in the same product story (triage, compose, arm sequences on triggers) but are intentionally deferred.

---

## 6. Sales vs product

Some external materials (e.g. a “Database Opportunity Assessment” HTML report) were **onboarding / trust-building sales**, not the in-app audit spec:

- Pitch narrative, minimum contact counts, activation forecasts → **marketing**
- Reachability checks, sequence eligibility, operational counts → **product**

In-app surfaces should feel **operational**, not ceremonial.

---

## 7. Related docs

- `audit-module.md` — audit purpose, checks, enrichment ideas, out of scope
- `../product/console-state.md` — Console / holon register
- `../product/engagement-chart-gantt-decisions.md` — engagement projection decisions
