# Systems — change packet 027 (Rule compare left is a chip into the person write)

**Seat:** Systems Analyst.  
**When:** 2026-08-23 16:55 UTC.  
**What this is:** the cut so Rule Outcomes compares the same way If already does. Implementer **only implements**. No analysis.  
**Why:** Founder on the Rule node: left of the comparison is the data you have (dragged from Input / output schema); right is what you compare it to. Live left is a typed string (`label` / Hub `client_data.*` path). “C language” / Language CLB showing as **text** is wrong — that box should hold a **chip**. Same law on Get and every open box: left-side writes drop in. Then: which tables house those per-client values (work permit urgency, profile metadata present, CRS vs cutoff).  
**Join:** A29 Input look · A31 mapped box · 017 `mappedSlots` / `chainWrites` · 019 Compare `Operand` (landed PR #107 — **do not recut**) · [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md) · 021 `collectible_fields` (landed PR #108). Face: `git fetch origin pull/96/head`.  
**Flag:** 15:43 untouched. **Do not recut 015 / 017 / 019.** No new mapping table.  
**Instructions:** founder only.

---

## What this is / is not

| This | Not this |
|------|----------|
| Rule condition **left and right** = same `MappedSlot` / chip-or-text as If `CompareOperand` | Plain `<Input>` of a Hub path or a condition **label** |
| Left chip = pointer at a write this run (`chainWrites` / `mappedSlots`). Person fact = `fact_writebacks.field_key` | A frozen `client_data.crs.*` catalog in the SPA. A second field map table |
| Right = typed constant **or** a dropped write (`constants_packs` / `reference_versions`) | A second client table of “what we compare to” |
| Name silences (work-permit urgency, profile metadata) | Invent those columns so the pack looks full |

---

## Live (quote `origin/main` — do not guess)

| Live | Gap |
|------|-----|
| If/Switch `CompareOperand.tsx` + `MappedSlot` accept `HANDLE_CHIP_MIME`. Occupied chip **is** the value (A31). | **Rule Outcomes does not use it.** |
| `RuleOutcomesPane.tsx`: left `<Input value={condition.label \|\| condition.leftField}>`. Right `<Input value={formatConstantEnvName(condition.constantKey)}>`. | That is why Language / “C language” is **text**. Editing the label writes `leftField` as the same string. No drop target. |
| `evaluateCondition` → `readPathFromInput(input, condition.leftField)` then `getAutomationConstant(constantKey)` from SPA `automationConstants.ts`. | Hub object shape. Not `fact_writebacks.value`. |
| Get Firm / Contact already wrap `MappedSlot` (`GetParametersPane.tsx`). | Module / Every / Select are **chrome** (GET-PACKET), not value slots. Do not recut the cascade. |
| `collectible_fields` (`018_collectible_fields.sql`): `field_key` includes `language_clb`, `crs_score`, `noc`, `teer_category`, `canadian_skilled_hours`, `foreign_work_years`, `foreign_trade_hours`, `ee_profile_exists`, `ee_profile_last_updated`, `eca_status`, `has_ontario_job_offer`, … | **No** `work_permit_warn`, `days_in_system`, `work_permit_expiry`, `oinp_student_context`, `status`, `province`. |
| `fact_writebacks` (`004`): `id`, `firm_id`, `contact_id`, `field_key`, `value` JSONB. | This **is** the per-client value store. |
| `missing_fact_signals` (`004`): same person + `field_key`. | Required-data **ask**, not the value. |
| `constants_packs` (`004`) + seed `003_canonical_workflows.sql`: three Hub packs (`pack.crs.defaults` cutoff 480, `pack.eligibility.scope`, `pack.firm.cedar`). | Pack `constantKey`s (`cec.min_clb_all`, `draw.latest_crs_cutoff`, …) live in the **SPA catalog**, not those payloads. |
| `reference_versions` (`004`): versioned `key` + `payload`. | Cutoff *can* live here; do not freeze `rv_01HZ…` as schema (Get/Rule ascribe). |
| `rule_eligibility_pathway` (`004`): `label`, `enabled`, `when_clause`, `condition_clause`, `set_value`. | Pathway **enable / label** rows. **Not** the client’s language or CRS. |

`client_data.crs.*` / `client_data.information.*` is **not a Postgres table**. It is the Hub pull shape the SPA pack still walks.

---

## Founder examples → store (do not invent)

| Glass / pack label | Pack `leftField` today | Person value (Postgres) | Right (what you compare to) |
|--------------------|------------------------|-------------------------|-----------------------------|
| CEC / FSW language CLB (“C language”) | `client_data.crs.language_clb` | `fact_writebacks` where `field_key = 'language_clb'` | Pack key e.g. `cec.min_clb_all` — **should** resolve from `constants_packs.payload` (live = SPA) |
| CRS at or above latest cutoff | `client_data.crs.score` | `fact_writebacks` `field_key = 'crs_score'` | `draw.latest_crs_cutoff` — same constant store; versioned cousin = `reference_versions` |
| Work permit urgency | `client_data.crs.work_permit_warn` | **Silent.** No `collectible_fields` row. No first-class column. Hub paints it. | Pack constant (today wrongly `ee.profile_required_for_ita`) |
| Profile metadata present | `client_data.information.days_in_system` | **Silent.** Same. | `profile.stale_months` |
| Express Entry profile exists | `client_data.information.ee_profile_exists` | `fact_writebacks` `ee_profile_exists` | pack constant |
| NOC present | `client_data.crs.noc` | `fact_writebacks` `noc` | pack constant |

Names of fields the pack **may** ask = `collectible_fields`. Values per client = `fact_writebacks`. Missing asks = `missing_fact_signals`. Do not collapse those three.

---

## Hard decisions

### 1. No new table

Chips persist on the node’s graph `data` (`mappedSlots` + 019 `Operand`). Do **not** mint `rule_condition`, `client_data`, or a field-map table. Do **not** freeze `client_data.crs.*` as schema.

### 2. Rule Outcomes uses the If compare box

`RuleOutcomesPane` condition row: **left** `CompareOperandBox` · operator Select · **right** `CompareOperandBox`. Same occupancy as If (A31). Drag from Input (any row, including top-level) into **either** side. Chip **is** the value. X clears. Type is still allowed (019: always text).

The condition **label** is chrome (the row’s name). It is **not** the left operand. Stop writing `leftField` from the label Input.

Persist per condition (on `workflow.graph` node data, same place `outcomeConditions` already lives):

```ts
type Operand =
  | { mode: "chip"; slot: string }
  | { mode: "text"; value: string };

type RuleConditionAuthored = {
  id: string;
  label?: string;          // chrome only
  operator: ConditionOperator;
  left: Operand;
  right: Operand;
};
```

Reuse 019 `Operand`. Do not invent a third shape. Legacy `leftField` + `constantKey`: treat as text fallback until a chip is dropped (left text may be a `field_key`; right text may be a constant key or a literal). New interiors write operands.

### 3. Left resolves from writes this run — not Hub paths

Walker / rule eval, same as If:

- **chip:** `mappedSlotWrites` → `loadWriteField`. Occupied chip is the value.
- **text:** the string. If it equals a `collectible_fields.field_key`, load that key’s `fact_writebacks.value` for the person this node is on. Else compare the string (typed literal).
- Empty left (no chip, no text) → that check **fails closed** (insufficient / false). Honest. Do not guess Hub `client_data`.

Person fact write: `{ table: "fact_writebacks", id, contact_id }` plus field `field_key` / `value`. A chip of the write **or** of that field is valid. `N` stays 017 (person-verb loops unique `contact_id`s).

Seeded pack rows that **have** a `collectible_fields` key start as a **chip pointing at that `field_key`** (or text fallback of that key — not `client_data.crs.language_clb`). Map:

| Pack `leftField` | `field_key` |
|------------------|-------------|
| `client_data.crs.language_clb` | `language_clb` |
| `client_data.crs.score` | `crs_score` |
| `client_data.crs.noc` | `noc` |
| `client_data.crs.teer_category` | `teer_category` |
| `client_data.information.canadian_skilled_hours` | `canadian_skilled_hours` |
| `client_data.information.foreign_work_years` | `foreign_work_years` |
| `client_data.information.foreign_trade_hours` | `foreign_trade_hours` |
| `client_data.information.eca_status` | `eca_status` |
| `client_data.information.ee_profile_exists` | `ee_profile_exists` |
| `client_data.information.ee_profile_last_updated` | `ee_profile_last_updated` |
| `client_data.information.has_ontario_job_offer` | `has_ontario_job_offer` |
| `client_data.information.has_qualifying_job_offer` | `has_qualifying_job_offer` |
| `client_data.information.has_trade_certificate` | `has_trade_certificate` |

Do **not** keep `readPathFromInput(..., "client_data.…")` as the live left.

### 4. Silent lefts — do not invent

These pack lefts have **no** `collectible_fields` row and **no** first-class column. Leave the left empty / fail-closed until a write exists. Do **not** add SPA paths to fake them. Do **not** mint tables from the glass labels.

- `client_data.crs.work_permit_warn` — Work permit urgency  
- `client_data.information.days_in_system` — Profile metadata present  
- `client_data.crs.work_permit_expiry`  
- `client_data.information.oinp_student_context`  
- `client_data.information.status`  
- `client_data.crs.province`  

If the founder later names a store for those, that is a **new packet**. Not this one.

### 5. Right is a constant write or typed text — not a second client table

- **chip:** that write’s field this run (Constants node → `constants_packs`; versioned ref → `reference_versions`).
- **text:** literal, **or** lookup `constants_packs.payload` by key (then `reference_versions.payload` for the same key if the pack row has no value).

SPA `automationConstants.ts` / `getAutomationConstant` is **leftover paint**. Stop using it as the live right once the pack keys are in `constants_packs`.

**Seed (no new table):** one `constants_packs` row (platform `firm_id` NULL, or extend `pack.crs.defaults`) whose `payload` holds the keys the immigration pack already names (`cec.min_clb_all`, `cec.min_hours`, `draw.latest_crs_cutoff`, `fsw.min_clb_all`, `teer.ineligible`, `profile.stale_months`, …). Same count as today’s SPA catalog for that pack — not a thick world. Evaluator reads the table.

`rule_eligibility_pathway` stays pathway enable/label. Do not stuff CLB / CRS into `set_value`.

### 6. Get and every other open box

A29 already: drag any Input row into **any** open box (Parameters, Outcomes, any variable slot). Get Firm / Contact already have `MappedSlot`. If a drop still fails there, occupancy is broken — fix that box; do **not** recut 017 or the Get cascade. Module / Every firm / Select firm are not value slots.

Do not recut If/Switch interiors (019). They already have this widget. Wire Rule to the **same** widget.

### 7. Required-data write unchanged

When a left chip / `field_key` has no `fact_writebacks` row this run, Rule still INSERTs `missing_fact_signals` (Get/Rule ascribe + 021). That write **is** required-data. Do not paint `COLLECTIBLE_FIELDS` as the listing.

---

## Files

| File | Why |
|------|-----|
| `src/app/register/prototype-ant/operator/automationPlates/RuleOutcomesPane.tsx` | Left/right `CompareOperandBox`. Kill label-as-left Input. |
| `src/app/data/automationRules.ts` | Authored `Operand`s. Eval from writes / `field_key`. Drop `readPathFromInput` Hub paths as live left. |
| `server/wire-service/workflowWalk.ts` | Rule eval sees `chainWrites` + `mappedSlots` (same resolve as If). Do not recut the walker into a second machine. |
| `supabase/seeds/` (existing constants pack) | Fold pack constant keys into `constants_packs.payload`. No new migration table. |

No `019_…sql`. No recut of `018_collectible_fields.sql`.

---

## Verify

1. Open a Rule with Input writes visible. Drag `language_clb` (or the Get/person field) into the **left** of a language condition → **chip**, not the label string. Compare still runs against that person’s `fact_writebacks.value`.
2. Same drop into a Get Firm / Contact box still occupies (A31). Drop into Rule **right** occupies; typed constant still works.
3. Work permit urgency / Profile metadata present: left empty or fail-closed. No Hub path painted as if it were a column.
4. `rule_eligibility_pathway` rows did not become the client’s CRS.

---

## What this packet does not do

- Recut 015, 017, 019, 021, 026.
- Mint `work_permit_warn` / `days_in_system` / a `client_data` table.
- Freeze Hub `client_data.crs.*` as schema.
- Treat `rule_eligibility_pathway` as the value store.
- Plant Hub. Overwrite 15:43.
