# PLACEHOLDER → REAL MAP

**Date:** 2026-08-11  
**Status:** living record — Pass A (consultant honesty) + Pass B (operator indexes) + Pass B′ (remaining DEMO densification) done on this branch  
**Contract:** If a product surface exists for consultant / operator / contact, and the fact it shows is machine-owned, then **no rows ⇒ empty UI** and **rows ⇒ personalized to the session firm**. Demo scenery is not “empty.”

---

## Why this map exists

Spine passes (bind, templates, enroll, `meeting_booked`, worker) made tables real while several desks still render plant **seed** files (`clients.ts`, `journeyByClient`, `SEED_MEETINGS`, `DEMO_FIRMS`). That made progress unreadable: the UI looked populated when the firm book was empty.

**Already correct pattern:** Contacts book → `listContactRecords()` → empty until upload.

---

## Vocabulary (use these words)

| Term | Meaning |
|------|---------|
| **Empty real** | Table/API exists; query returns `[]`; UI is honestly empty |
| **Demo scenery** | Hard-coded Sarah/Marcus/Cedar/Harbor rows painted as if live |
| **Copy stub** | Tab exists; body is “will live here” / Empty with no query |
| **Stand-in port** | Wire fake (`VITE_WIRE_REAL=false` or deferred forever) |
| **Deferred** | Escrow / Meta — stand-in by product choice, not unfinished rewire |

Do **not** call demo scenery “empty.” Do **not** call Contacts empty “a placeholder.”

---

## Keying rule (consultant)

| Today (lie) | Target |
|-------------|--------|
| Board / Brief / Journey keyed by seed slugs (`sarah`, `marcus`, …) | One UUID: `contact_records.id` |
| Unknown UUID falls back to Sarah meta/journey | No Sarah fallback — empty or that contact’s rows |
| Default selection `"sarah"` | `null` until book has contacts; else first contact id |

---

## Consultant desk map

| Surface | File | Today | Seed source | Real table/API | End state | Priority | Rewire status |
|---------|------|-------|-------------|----------------|-----------|----------|---------------|
| Contacts list | `ContactsModule.tsx` | Firm book | — | `contact_records` | Empty / personalized | — | **DONE** (reference pattern) |
| Board index | `BoardModule.tsx` | Client table | `data/clients.ts` | `contact_records` | Empty / personalized | **P0** | **DONE** (Pass A) |
| Board today’s meetings | `BoardModule.tsx` | Chips | `SEED_MEETINGS` | `meeting_booked` | Empty / personalized | **P0** | **DONE** (Pass A) |
| Board machine detections | `BoardModule.tsx` | Counts/tables | stand-in if wire off | `eligibility_results`, `signals`, `motion_decisions`, `enrollment` | Empty counts | — | Already wired |
| Client Brief | `ClientWorkspace.tsx` | Seed meta | `getClientMeta` → Sarah fallback | `contact_records` + machine | Sparse / personalized | **P0** | **DONE** (Pass A) |
| Engagement tab | `ClientWorkspace.tsx` | Tree + timeline | `journeyByClient` / Sarah fallback | `engagement_records` (+ attempts) | Empty tree / personalized | **P0** | **DONE** (Pass A) |
| Meetings list | `MeetingsModule.tsx` | Seed list + demo Empty toggle | `SEED_MEETINGS` | `meeting_booked` | Empty / personalized | **P0** | **DONE** (Pass A) |
| Meetings Live brief facts | `MeetingsModule.tsx` | Seed + hydrate | seed copy + `listFactWritebacks` | `fact_writebacks` | Sparse / personalized | **P0** | Prefer machine (seed list removed) |
| Halt | `HaltOutreachModal` + scene | Real | — | `halt_records` | Empty until halt | — | DONE |
| Login | `LoginModule.tsx` | OTP | — | auth | — | — | DONE |
| Prepared Workspace | `PreparedModule.tsx` | Mixed | local terms; `LICENSEES` | `crm_oauth_grants` | Durable terms; real licensees | **P1** | Later |
| Agents Activity / Contacts / Report tabs | `AntAgentWorkbench.tsx` | “will live here” | copy stub | enrollments / engagement | Honest empty or live list | **P0** | **DONE** (Pass A · honest empty) |

---

## Operator desk map

| Surface | File | Today | Seed | Real API | Priority | Status |
|---------|------|-------|------|----------|----------|--------|
| Provision | `ProvisionModule.tsx` | Real mint | — | `ct_firms` / users / access | — | DONE |
| Firm bind Active path | `FirmOperationsBindModule.tsx` | Real activate | — | workflow / bindings / campaign | — | DONE |
| Firm bind **index** | same | Session / listConsultants firms | — (was `DEMO_FIRMS`) | session + `listConsultants` | **P0** | **DONE** (Pass B) |
| Book readiness list | `BookReadinessModule.tsx` | Empty until upload / Start Audit | — (was `SEED_AUDITS`) | `createAuditRun` (no list API) | **P0** | **DONE** (Pass B) |
| Firm health picker + nested | `FirmHealthModule.tsx` | Session / real firms; empty collections | — (was DEMO fill) | templates / enrollments / attempts | **P0** | **DONE** (Pass B) |
| Oversight fleet | `OversightModule.tsx` | Real firms or empty | — (was `DEMO_FLEET`) | session + machine health | **P0** | **DONE** (Pass B) |
| Activation state index | `ActivationStateModule.tsx` | Session / real firms; live gates | — (was `DEMO_FIRMS`) | crmOAuth / escrow / campaign | **P0** | **DONE** (Pass B) |
| Activation forward-deploy | `ActivationForwardDeployModule.tsx` | Session / real firms | — (was `DEMO_FIRMS`) | primaryStore hydrate | **P0** | **DONE** (Pass B) |
| Customer support tickets | `CustomerSupportModule.tsx` | Empty until tickets persist | — (was DEMO tickets) | primaryStore | **P1** | **DONE** (Pass B′) |
| Founder kill targets | `FounderAgencyControlsModule.tsx` | Session / real firms | — (was `DEMO_FIRMS`) | haltStore | **P1** | **DONE** (Pass B′) |
| Sending infrastructure picker | `SendingInfrastructureModule.tsx` | Session / real firms | — (was `DEMO_FIRMS`) | sending pool | **P1** | **DONE** (Pass B′) |
| Audit trail firm filter | `AuditTrailModule.tsx` | Session / real firms; empty trail | — (was DEMO filter + DEMO_AUDIT fallback) | auditTrail | **P1** | **DONE** (Pass B′) |
| Config libraries catalogs | Agents/Automations/Packs | Seed catalogs | `SEED_*` | templates / workflows / pins | **P1** | Later |
| Commercial / Meta | `CommercialModule`, `AcquisitionAdsModule` | Honest empty / session shells; campaigns empty | — (was DEMO held rows / Live campaigns) | deferred stand-in | **P2** | **DONE** honesty (Pass B′ · still deferred product) |
| Register & evolution gaps | `RegisterEvolutionModule.tsx` | Empty gaps; firm picker session/real | — (was `SEED_GAPS` + `DEMO_FIRMS`) | local | **P1** | **DONE** (Pass B′) |
| Agents binding firm_name | `AntAgentWorkbench.tsx` | Session firm name | — (was `"Cedar Immigration"`) | bindings | **P0** | **DONE** (Pass B′) |

---

## Contact desk map

| Surface | File | Today | Priority | Status |
|---------|------|-------|----------|--------|
| Identity | `ContactAntScene.tsx` | Empty until `?contactId=` / `?demoContact=1` | **P0** | **Honest empty** (no Sarah paint); full token Pass C later |
| Consent / silence / book / facts | same | APIs real when token present | **P0** | Wire OK once id is real |

---

## Wire APIs — consultant usage

| API | Tables | Used by consultant today? |
|-----|--------|---------------------------|
| `listContactRecords` | `contact_records` | Contacts + Board + Meetings names + Brief |
| `listMeetings` | `meeting_booked` | Meetings + Board today strip |
| `listEngagementRecords` | `engagement_records` | Engagement tab |
| `boardDetections` | eligibility / signals / motions / enrollment | Board strip + notes |
| `haltStore` | `halt_records` | Yes |
| `listFactWritebacks` | `fact_writebacks` | Meetings hydrate |

---

## Pass plan

### Pass A — Consultant honesty (this branch)

1. Board rows from `listContactRecords`
2. Meetings from `listMeetings`; remove demo Empty toggle
3. Engagement from `listEngagementRecords` for selected contact; empty when none
4. Brief from contact record fields; no Sarah fallback
5. Default selection = first contact or none
6. Agents Activity tabs: honest empty (no “will live here” theater)

### Pass B — Operator fleet honesty (this branch)

Replace `DEMO_FIRMS` indexes with session firm / `listConsultants` unique firms (no `listCtFirms` API); Book readiness starts empty (no `SEED_AUDITS`); Firm health nested collections empty when machine returns none; Oversight drops `DEMO_FLEET` Healthy theater.

### Pass B′ — Remaining DEMO densification (this branch)

Customer support tickets empty; Founder kill targets / Sending / Audit trail / Register gaps use `operatorFirmIndex`; Audit trail helper returns `[]` (no `DEMO_AUDIT_TRAIL_EVENTS`); Commercial session-firm shells only (no fake held/disputed); Acquisition campaigns start empty; Agents `firm_name` binding uses session firm.

### Pass C — Contact token identity (follow-up)

Access-link / contact id drives portal; drop `DEMO_CONTACT_ID`.

### Pass D — Deferred

Escrow · Meta stay stand-in until product opens them — but UI must not densify DEMO held/Live rows (Pass B′ honesty).

---

## Acceptance (Pass A)

- Fresh provisioned firm, no contacts → Board empty, Meetings empty, no Sarah.
- After book upload → Board lists those contacts only.
- Open a contact with no engagement rows → Engagement empty (not Sarah journey).
- Book a meeting → Meetings list shows it (and Board strip when “today”).
- Agents Activity tabs say empty because no enrollments/activity — not “will live here” as unfinished product.

## Acceptance (Pass B)

- Session firm only → Firm bind / Activation / Oversight / Firm health show that one firm (Armed default on bind), not 4 DEMO_FIRMS.
- No session firm → those indexes empty (not Northwind/Cedar/Harbor/Atlas scenery).
- Book readiness opens with empty audit list; Upload book / Start Audit still write.
- Firm health sequences / engagement metrics empty when machine has no bindings/enrollments (not DEMO_SEQUENCES fill).
- Oversight does not paint DEMO_FLEET Healthy rows for fake ids.

## Acceptance (Pass B′)

- Customer support queue empty (no SUP-184 / Cedar / Harbor tickets).
- Founder kill-switch targets only session/real firms (or disabled when none).
- Sending infrastructure firm picker = session/real firms only.
- Audit trail empty when `auditTrail.list()` is empty — no Northwind/Cedar demo events.
- Commercial shows no fake $2,400 / disputed rows; empty or session-firm shells with `—` held.
- Register gaps start empty; firm picker from session/real firms.
- Acquisition Approach campaigns table empty until New campaign.
- Agents Save binding uses session firm name, not `"Cedar Immigration"`.

---

## Related docs

- `APP-ELEVATION-GAP.md` — UI translation gap called out
- `FIRM-BINDING.md` — Contacts empty-book contract
- `MAGIC-ACCESS-LINK.md` — access entry
- `AUTHOR-RUNTIME-CLOSED.md` — deferred Escrow · Meta
