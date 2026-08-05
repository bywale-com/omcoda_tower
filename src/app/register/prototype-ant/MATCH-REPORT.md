# MATCH-REPORT — Tower → Ant Design

Orchestrator dispositions for Design-stage population. Target skills: `ant-design-semantic-tokens` + Tower `ant-design-composition-patterns.md`.

Legend: **matched** · **matched-partial** · **synthesize** · **blocked-pending-human-decision**

---

## Shell / chrome

| Concept | Disposition | Ant | Notes |
| --- | --- | --- | --- |
| Product frame | matched | `Layout` Header + Content | |
| Persona switch | matched | `Segmented` | Product choice; not a named Ant “persona” pattern |
| Theme toggle | matched | `Switch` + `ConfigProvider` algorithm | Isolated storage key |
| Cross-link to source plant | matched | `<a href="/register">` | Full document nav |
| Brand primary color | blocked-pending-human-decision | Seed `colorPrimary` | Queued: Ant default vs Tower brand |
| Dark palette values | blocked-pending-human-decision | `darkAlgorithm` only | Archaeology: no enumerated dark table |

---

## Consultant

| Concept | Disposition | Ant |
| --- | --- | --- |
| Desk nav | matched | `Sider` + `Menu` |
| Board / Contacts index | matched | `Table` + `Input.Search` |
| Phase signal | matched | `Tag` |
| Client workspace | matched-partial | `Tabs` + Tables | Engagement chronology as Table (not Hub Activity chrome) |
| Halt outreach confirm | matched | Danger `Modal` + `Radio` + `Input.TextArea` |
| Meetings list/calendar | matched-partial | `Segmented` + `Table` / calendar cells | Calendar is composed, not Ant Calendar full app |
| Live brief / Copy brief | matched | `Card` + `Button` |
| Authorize / Accept terms | matched | `Modal` + `Form` + `Checkbox` + `Select` |
| Login OTP | matched | `Steps` + `Form` + `Input` |

---

## Operator

| Concept | Disposition | Ant |
| --- | --- | --- |
| Grouped module nav | matched | `Menu` with group titles |
| Campaign / activation / ref / audit / oversight / tickets / firms indexes | matched | `Table` + filter `Select` toolbar |
| Publish / Bind / Kill / Gap / Import | matched | `Modal` (+ danger for Kill) |
| Detail panes | matched | `Drawer` |
| Ingestion / verdict / readiness rails | matched | `Steps` |
| Status chips | matched | `Tag` / `Badge` |
| Armed / Active | matched | `Segmented` |
| Evaluation packs editor | matched-partial | Form + Drawer | |
| Automations Hub canvas | synthesize | Ant header + Build palette + `@xyflow/react` canvas + node Drawer | Re-pass: full workbench (not Table stub) |
| Agents Hub sequence editor | synthesize | Ant header + Editor tabs + step toolbar + sequence Cards | Re-pass: full workbench |
| Book readiness / Audits | matched-partial | Split Audits list + Audit run (checks + records Table + reachability) | Re-pass: matches plant composition |
| Client Activity / Journey | synthesize | Dual-pane Tree + day-axis timeline | Re-pass: not flat activation-log Table |
| CT DS toggle | matched | DS-I \| Ant on Register CT header | Plants Ant inside connected click-through |

---

## Contact

| Concept | Disposition | Ant |
| --- | --- | --- |
| Portal surface nav | matched | `Sider` + `Menu` |
| CEM channel toggle | matched | `Segmented` / `Radio` |
| Consent Agree + channel scope | matched | `Checkbox` + `Radio.Group` |
| Forms (nudge / loop / update) | matched | `Form` + `Input` |
| Silence confirm | matched | `Modal` + `Result` |
| Booking slots | matched | `Radio.Group` + Buttons |
| Link state kinds | matched | `Segmented` |
| Firm portal accent `#1B4F72` | synthesize | Inline accent on chips/CTAs | Not an Ant seed token; logged |
| Furnish chips (purpose, STOP, on whose behalf, …) | matched-partial | `Tag` / `Alert` / Typography | Presentation only; Function preserved |

---

## Tokens used (Seed / documented only)

- Seed: `colorPrimary`, `borderRadius`, `fontSize`, `controlHeight`, `wireframe: false`
- Algorithms: `defaultAlgorithm` / `darkAlgorithm`
- Consumed via components (Alias/Map derived): `colorBgLayout`, `colorBgContainer`, `colorSplit`, text tiers, status Tags

**Not fabricated:** dual-focus tokens, invented dark hex tables, gap elevation ladders.

---

## Parity checklist (Phase 5)

- [x] Hub → all three personas (Header Segmented)
- [x] In-desk module switch (Sider Menu) per persona
- [x] Consultant: Board, Contacts, Meetings, Prepared, Login + Halt/Authorize/Accept/OTP
- [x] Operator: all 15 modules with primary doors
- [x] Contact: all 10 surfaces + consent→booking→silence walk
- [x] Theme toggle isolated storage key
- [x] Hard isolation verified (separate HTML; main Router has no translate imports; antd only in prototype-ant chunk)
- [x] Automations / Agents / Audits / Activity re-pass (workbench resemblance)
- [x] Ant planted in Register CT with DS-I \| Ant toggle
- [ ] Human: pick Tower `colorPrimary` brand
