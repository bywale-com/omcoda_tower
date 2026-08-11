# Client Data bind (Ant)

**Date:** 2026-08-11  
**Branch:** `cursor/client-data-bind-6565`  
**Scope:** The real Client Data panel gaps — not Board/halt/meetings/Brief honesty (already shipped).

## What shipped

### Consultant Client Data (`ClientWorkspace` → `ClientDataPanel`)

| Tab | Bound to | Behavior |
|-----|----------|----------|
| **Information** | contact identity + `fact_writebacks` + `missing_fact_signals` | Profile table; empty facts stay blank |
| **History** | writebacks whose `field_key` matches CRS/score/threshold/permit | Table + chart when ≥2 numeric points; else empty |
| **Activity** | `engagement_records` + `active_attempts` | Projected rows (send / window / cell / form_visit / inbound / …); click opens inspect drawer |

### Look-inside (`ActivityInspectDrawer`)

- Overview: milestones from attempt state, decision/criteria/wait window, replay body when payload has `subject` / `bodyText` / `bodyHtml`
- Metadata: event ids, attempt, message, raw payload
- Prev/next across Activity rows

### Worker write enrichment

- `009_outbound_message_content.sql` — `subject`, `body_text`, `body_html`, `content` on `outbound_messages`
- Cascade send paths write `subject` / `bodyText` / `criteriaLabel` onto `engagement_records.payload` so dry-run and live both replay without seed HTML

### Agents (real gaps only)

- Launch enrolls the **first contact in the firm book** (blocks with honest message if book empty) — no `board-selected-or-book` fake id
- Contacts / Activity tabs list enrollments + engagement for this template (honest empty)
- Save binding `firm_name` uses session firm label, not Cedar

### Not in this pass

- Hub JourneyTab gantt / zoom / seed embed (would reintroduce Sarah)
- Automations graph persist (already works when `VITE_WIRE_REAL`)
- Board filter chrome / Accepted terms / Brief Pass A (already done)

## Manual check

1. Open consultant → contact with no engagement → Client Data → Activity empty.
2. Enroll / tick → Activity rows appear; click row → inspector; send rows show subject/body when written.
3. Write a CRS/score fact → History populates; Information lists the field.
4. Agent Launch with empty book → warning; with contacts → enrollment on first contact; Contacts tab lists it.
