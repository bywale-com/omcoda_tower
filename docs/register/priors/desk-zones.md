# Priors census — Desk zones (Board → Global CT chrome)

**Scope:** CT plant (`src/app/register/prototype/`) + Ant remake (`src/app/register/prototype-ant/`), deduped.  
**Class:** Priors — entry = control; purposes empty.  
**Marks:** `latticed` | `weak` | `prior`  
**Focus:** Exhaustive **prior** + **weak**. Latticed clusters summarized (not every latticed row).

**Lattice refs:** `docs/register/how/`, `docs/sme/implementation/`, `docs/register/enrichment/`, `docs/register/furnish/`, `src/app/register/theory/`, `src/app/register/trace/surfaceCatalog.ts`

**Related deep slices (not re-listed here):** [`agents-audits-activity.md`](./agents-audits-activity.md) · [`automations.md`](./automations.md)

---

<a id="board"></a>
## Board

Desk seat: Consultant **Board** + Client workspace chrome mounted from Board (plant: `BoardPanel` + `ConsultantClientWorkspace` + Halt modal; Ant: `BoardModule` + `ClientWorkspace` + `HaltOutreachModal`).

### Latticed cluster (summary)

Primary nav Board · Client row open · Phase signal inhabit · Halt outreach / Confirm halt / This contact|Firm book scope · Engagement record tab · Client Brief tab · Board search · Phase signal legend · Today's meetings strip + See all · Accepted terms door (`cons-cant-08`) · Phase filter chips (`cons-cant-05` list filters).

### Prior + weak (exhaustive)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| board-view-as-client | View as Client | plant BoardPanel row ⋯ menu (sarah) | open | prior | | `onViewAsClient` unwired in CT scene — no-op; not in How/SME/Enrichment/Furnish |
| board-row-actions-menu | Client actions ⋯ | plant BoardPanel row menu | menu | prior | | Chrome that hosts Halt / View as Client |
| board-resume-book | Resume book | plant+Ant Board when firm book halted | commit | prior | | Inverse of Halt firm book; not named (same class as Lift halt) |
| board-resume-outreach | Resume outreach | plant BoardPanel row menu when contact halted | commit | prior | | Inverse of Halt outreach; Activity slice also marks Lift halt prior |
| board-lift-halt | Lift halt | plant+Ant Client workspace when halted | commit | prior | | Inverse of Halt; Enrichment `cons-cant-04` names resume/lift-halt Need — control title absent from How/Furnish; keep prior per Activity census |
| board-newest-first | Newest first / Oldest first | Ant BoardModule Segmented | toggle | weak | Furnish `cons-furnish-06` Newest first on **Engagement record** | Mis-seated on Board list sort; lattice cue is chronology, not Board index |
| board-halt-modal-dismiss | Halt outreach dismiss (backdrop / Cancel) | plant+Ant Halt modal | nav | prior | | Modal dismiss unnamed |

---

<a id="contacts"></a>
## Contacts

Desk seat: Consultant **Contacts** (plant: BoardPanel contacts icon + workspace; Ant: `ContactsModule`).

### Latticed cluster (summary)

Contacts module · contact/Client row open → Client workspace (`cons-furnish-17`) · Imports block inhabit · Phase signal on sequenced rows · Confirm book for Tower named in How (assisted path) — **button not planted** (Hint copy only on Ant).

### Prior + weak (exhaustive)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| contacts-search | Search contacts | Ant ContactsModule Input.Search | open | prior | | Plant contacts list has no search; Ant mislabels Surface as **Board search** |
| contacts-confirm-book-absent | Confirm book for Tower | — (named, not interactive on CT) | commit | weak | How `consultant-core` leaf 2a.1; Furnish Imports | Lattice commit exists; CT shows Hint only — no clickable Confirm |

---

<a id="meetings"></a>
## Meetings

Desk seat: Consultant **Meetings** (plant: `MeetingsModule` + `LiveBriefPanel`; Ant: `MeetingsModule`).

### Latticed cluster (summary)

Meetings module · Meeting row · Meeting pane · Live brief · List / Calendar · Copy brief · Starts in cue · Back to Board (empty-state path) · empty-state copy (`cons-furnish-12`).

### Prior + weak (exhaustive)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| meetings-empty-demo | Empty state / Show booked | plant+Ant Meetings header toggle | toggle | prior | | **CT demo flipper** — toggles force-empty; lattice names the empty-state *copy*, not this demo control |
| meetings-brief-close | Close Live brief | plant Live brief panel dismiss (when present) | nav | prior | | Dismiss chrome unnamed |

---

<a id="prepared"></a>
## Prepared

Desk seat: Consultant **Prepared Workspace** (plant: `PreparedWorkspaceModule`; Ant: `PreparedModule`).

### Latticed cluster (summary)

Prepared Workspace shell · Authorize book · Authorize · Accept terms · Accept · License acknowledgement expand · Escrow terms · Download terms · Connect CRM / Upload assisted path · activation checklist chrome.

### Prior + weak (exhaustive)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| prepared-modal-close | Close Authorize / Accept modal | plant+Ant Prepared modals | nav | prior | | Dismiss / Cancel unnamed |
| prepared-licensee-select | Licensee identity dropdown | plant+Ant Accept terms | select | weak | How leaf 2a.2 “identity dropdown” | Control exists; How names the act, not a Title Case surface |

---

<a id="login"></a>
## Login

Desk seat: Consultant **Login** (plant: `RegisterLoginScene`; Ant: `LoginModule`).

### Latticed cluster (summary)

Login · Email field · Send code · Code field · Verify · Resend code (+ cooldown).

### Prior + weak (exhaustive)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| login-change-email | Change email | plant+Ant verify step | nav | prior | | Returns to email step; not in How/Furnish |
| login-demo-failure-codes | Demo OTP failure codes (000000 / 111111) | plant+Ant Code field helper | — | prior | | CT demo protocol via typed codes — not a labeled flipper control |

---

<a id="contact-desk"></a>
## Contact desk

Desk seat: Engagement contact **Client portal** (plant: `ContactPrototypeScene`; Ant: `ContactAntScene`).

### Latticed cluster (summary)

Opt-in / Consent request / Agree / Ignore / Channel scope / After-Agree / CASL+PIPEDA purpose panels / Not me · Nudge message/form · Continue draft · Self-reportable fields · Submit · Silence / Opt out + confirmation · Meeting invitation · Booking · Slot picker · Confirm booking · Reschedule / Cancel · Consultant host · Meeting purpose · Update facts · Loop-closer · Touchpoint footer · Link state **page** · On whose behalf / send-platform disclosure · purpose chips (client vs prepared-workspace).

### Prior + weak (exhaustive)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| contact-portal-surface-nav | Client portal surface nav (10 touchpoints) | plant+Ant Contact aside | nav | prior | | CT scene flipper among Opt-in…Link state; not a contact-facing control |
| contact-link-state-flipper | Link state · Valid / Expired / Already used / Wrong purpose | plant+Ant Link state page Segmented/buttons | toggle | prior | | **CT demo flipper** to preview Link state outcomes; Furnish names the states as redeem results, not desk toggles |
| contact-link-state-continue | Continue (Valid path) | plant+Ant Link state | nav | weak | Furnish `contact-furnish-10` Valid continues to purpose surface | Stub continue; does not route into Consent/Nudge/Booking in CT |
| contact-purpose-chip-pair | Client vs Prepared purpose chips (contrast) | plant+Ant Link state footer | — | weak | Furnish purpose chips | Display contrast pair; not independently actionable |

---

<a id="operator"></a>
## Operator

Desk seat: Operator house / tenancy / support modules (plant: `OperatorPrototypeScene` + `operator/*`; Ant: `OperatorAntScene` + `operator/*`).

**Deep prior/weak already censused:** Agents · Audits · Activity → [`agents-audits-activity.md`](./agents-audits-activity.md); Automations → [`automations.md`](./automations.md). Do not duplicate those rows here.

### Latticed clusters (summary)

- **Chrome / nav:** House-global + per-tenancy + Support module nav (Acquisition & ads → Activation state) — How trees per module.
- **Acquisition & ads:** Approach campaigns · editor · Capture strip · Save/Publish · Approach instrumentation · Waiting-for-hydrate · Kill / hold criteria (`op-cant-01`).
- **Activation & forward-deploy:** In-flight · Forward-deploy · Hydrate · Template version · Staging chips · Readiness walkthrough · Hard-input status (`op-cant-02`) · Progress Jump.
- **Reference data:** Reference tables · Import criteria · Publish version · Dual-check glance · Ingestion stage rail.
- **Configuration libraries:** Libraries nav · Evaluation packs · Publish version · Compare versions (`op-cant-18`) · Published/Draft — plus Agents/Automations deep slices.
- **Oversight / Firm health:** Fleet health · Firm row · Unhealthy count · Sequence/Engagement health · Sequence detail · Open support context · Firm-filter chip.
- **Audit trail:** Change event list · Firm/Actor/Operation filters (`op-cant-19`) · Filter chips · Affected-surface chips · Jump to affected surface (`op-cant-13`).
- **Register & evolution:** Gaps · Gap · Gap firm/source (`op-cant-14`) · Save gap · Regenerate handoff.
- **Founder & agency:** Agency policy · Bounds · Save policy · Last-saved · Kill-switch · Kill-switch confirmation.
- **Customer support:** Ticket queue · Ticket · Support context · Context tab badge · Jump / linked per-tenancy · Resolve.
- **Provision / Commercial / Bind / Book readiness / Activation state:** New firm · Provision complete · Copy Login path / Send invite · Progress glance · Escrow status · Release control · Evidence glance · Bind packs · Armed/Active · Bind-completeness (`op-cant-05`) · Audits/Audit run/Verdict list · Verdict filter + Re-audit (`op-cant-06`) · Progress + Jump.

### Prior + weak (exhaustive — zone chrome & module leftovers not in Agents/Audits/Automations slices)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| op-module-nav | Operator module sider nav | plant+Ant Operator scene Menu/aside | nav | weak | How names each Module as Starting-from | Nav chrome itself unnamed; destinations latticed |
| op-section-house-tenancy-support | House-global / Per-tenancy / Support section headers | plant+Ant Operator sider | nav | prior | | CT grouping chrome |
| op-modal-close | Generic modal Close / Cancel / Back | plant+Ant across operator modals | nav | prior | | Dismiss chrome (Gap, Kill, Publish, Compare, Change event, Import…) |
| op-audit-export-csv | Download records CSV | Ant Book readiness | download | prior | | Also in Audits slice as prior |
| op-audit-inspect-first | Inspect first record | Ant Book readiness | inspect | prior | | Also in Audits slice as prior |
| op-audit-sort-records | Sort records | plant+Ant Audit records | toggle | prior | | Also in Audits slice |
| op-ads-save-draft | Save draft (campaign) | Ant AcquisitionAds | commit | weak | How Save / Publish campaign | Draft-save label not in How (Publish is) |
| op-ads-staging-queue | Staging queue | Ant AcquisitionAds | nav | weak | Furnish Waiting-for-hydrate / In-flight | Shortcut label not Title Case lattice |
| op-gap-new | + New gap | Ant Register evolution | commit | weak | How Save gap / Gaps | Create affordance unnamed as **New gap** |
| op-gap-edit | Edit gap | Ant Register evolution | open | prior | | Edit control unnamed |
| op-kill-confirm-halt-motion | Confirm Halt motion | Ant Founder kill-switch | commit | weak | How Kill-switch; Furnish confirmation | Confirm label variant of Halt motion |
| op-hifi-empty-fallback | HiFi empty module shell | plant OperatorPrototypeScene fallback | — | prior | | Empty Title Case shell when module missing |

---

<a id="global-ct"></a>
## Global CT chrome

Desk seat: Register click-through host + Ant standalone shell (not persona product lattice).

### Latticed cluster

None — these are Register / translate tooling.

### Prior + weak (exhaustive)

| id | title | where | kind | mark | latticeHint | notes |
|---|---|---|---|---|---|---|
| ct-ds-toggle | DS-I \| Ant toggle | `RegisterClickThroughPanel` header | toggle | prior | | Switches plant vs Ant translate host |
| ct-desk-tabs | Consultant / Operator / Contact desk tabs | `RegisterClickThroughPanel` header | nav | prior | | CT desk switcher |
| ct-theme-switch | Light / Dark theme switch | Ant `PrototypeAntApp` Switch; main `Workspace` theme toggle feeds `isDark` into AntCtHost | toggle | prior | | RegisterPage hardcodes `isDark=false` for plant; Ant standalone persists theme |
| ct-view-as-client | View as Client | plant Board row menu inside CT | open | prior | | Same control as Board zone; global demo affordance |
| ct-meetings-empty-demo | Empty state / Show booked | plant+Ant Meetings | toggle | prior | | Same as Meetings zone demo flipper |
| ct-link-state-flipper | Link state Valid/Expired/Already used/Wrong purpose | plant+Ant Contact Link state | toggle | prior | | Same as Contact desk demo flipper |
| ct-journey-prev-next | Journey Prev / Next / Play | `RegisterClickThroughPanel` flows mode | nav | prior | | Flows pass chrome |
| ct-show-hide-columns | Show register / Show theory / Hide CT | Register shell chrome | toggle | prior | | Column restore/hide |
| ct-ant-source-plant-link | Source plant link | Ant `PrototypeAntApp` header | nav | prior | | Full-document nav back to `/register` |

---

## Counts (this slice)

| Zone | Prior rows | Weak rows | Notes |
|---|---:|---:|---|
| Board | 6 | 1 | + latticed cluster summarized |
| Contacts | 1 | 1 | Confirm book absent |
| Meetings | 2 | 0 | |
| Prepared | 1 | 1 | |
| Login | 2 | 0 | |
| Contact desk | 2 | 2 | |
| Operator (leftovers) | 7 | 5 | Excludes Agents/Audits/Automations deep priors |
| Global CT chrome | 9 | 0 | |
| **Listed prior+weak** | **30** | **10** | |

Activity / Agents / Automations deep **prior** counts remain in their own files (large prior mass on agent/automation editors).
