# REARCHITECTURE — Tower Register plant → Ant Design

**Command:** `ds-translate ant`  
**Source:** `/register` → `src/app/register/prototype/` (READ ONLY)  
**Out:** `/prototype-ant` → `src/app/register/prototype-ant/` + `prototype-ant.html`  
**Why-source:** `docs/register/how/*`, `OUTCOMES.md`, enrichment/furnish, `docs/sme/implementation/*`  
**Composition:** [ant-design-composition-patterns.md](./ant-design-composition-patterns.md)  
**Tokens:** omcoda-hq `ant-design-semantic-tokens`  
**Isolation (standalone):** `/prototype-ant` HTML entry remains for hard-isolated preview.  
**Click-through plant:** Register CT embeds the same Ant scenes via `AntCtHost` + **DS-I | Ant** toggle (`ctDesignSystem`). Ant `ConfigProvider` mounts only while Ant mode is active.

---

## Shell architecture

| Source plant | Ant remake | Why |
| --- | --- | --- |
| Register CT column embeds desk scenes; persona via `ctDesk` tabs | Isolated full-viewport `Layout` Header + Content; persona via Header `Segmented` | Ant product frame; Design-stage translate is its own document |
| Per-desk left aside of text buttons | Light `Layout.Sider` + `Menu` (grouped on Operator) | Ant Layout / Menu grammar |
| DS-I Tokens + inline styles | `ConfigProvider` Seed theme + `theme.algorithm` (own storage key `tower-prototype-ant-theme`) | Hard CSS isolation from source plant |
| Hub BoardPanel / ClientView / AutomationDetailView / AuditDetailView reuse | Ant `Table` + `Drawer` / `Modal` remakes (no Hub chrome import) | Prefer real Ant components over CSS-skinned Hub widgets |

---

## Consolidations / splits (Register-linked)

| Area | Decision | Register link |
| --- | --- | --- |
| Consultant Board + Contacts | Living indexes → `Table` + search toolbar; Client workspace → in-module Tabs (Brief / Engagement) | consultant-core / governance How; Board halt leaves |
| Halt outreach | Custom chrome → danger `Modal` + Radio scope + reason | Halt outreach / Confirm halt leaves |
| Meetings | List\|Calendar Segmented + Live brief `Card` | Meetings / Live brief / Copy brief |
| Prepared Workspace | Hard inputs → `Table` readiness + `Modal` Authorize / Accept (`Steps`-adjacent flow) | Authorize book / Accept terms |
| Login | Inline steps → Ant `Steps` + Form | Login OTP leaves |
| Operator house/tenancy/support | Same module set; indexes → Table; publish/bind/kill → Modal; detail → Drawer | operator-* How trees |
| Config libraries Automations/Agents | Hub detail views → Ant Table catalog + Drawer editor (canvas summarized as content region, not dropped as a door) | Configuration libraries How; wrong-seat Hub note preserved as helper text |
| Book readiness | Hub AuditDetailView → Ant Table + Drawer + verdict Steps | Book readiness How |
| Contact portal | Ten CEM/portal surfaces → Sider Menu + Form/Alert/Result/Modal | contact-* How + Furnish chips |
| Persona switch | Register shell tabs → Ant Header Segmented | THREE-SURFACE-MODEL |

**Not dropped:** Core doors per persona inventory in MATCH-REPORT. Composition rearranges; Function stays.

---

## Ambiguities queued (not silently filled)

1. **Tower brand vs Ant `colorPrimary` `#1677ff`** — remake uses Ant seed until human picks brand. Contact portal may use source firm accent `#1B4F72` as synthesize for portal identity chips only.
2. **Dark theme enumerated hex** — archaeology gap; use `darkAlgorithm` only.
3. **Automations canvas fidelity** — React Flow Hub canvas not ported; door preserved as Drawer “workflow canvas” region + publish/draft. Escalate if CTO requires full node editor in Ant tree before wiring.
4. **wireframe: false** (default) — Modal chrome per Ant default.

---

## Verify isolation

1. Hard-refresh `/register` — DS-I plant unchanged (no Ant CSS).
2. Open `/prototype-ant` — Ant shell + theme.
3. Cycle Consultant → Operator → Contact; walk one deep door each.
4. `src/app/Router.tsx` / `src/main.tsx` must not import `prototype-ant`.
