# Systems — Trigger select (A26) + Node place (A27 · A28)

**Seat:** Systems Analyst.  
**When:** 2026-08-18 20:20 UTC.  
**What this is:** the plays for PM packets [`TRIGGER-SELECT-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/TRIGGER-SELECT-PACKET.md) + [`NODE-PLACE-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/NODE-PLACE-PACKET.md). Those two go together. Engineer builds the UI to **this** shape. **No new tables. Do not recut 015.** Flag **15:43**.  
**Plates:** A26 (icons are spec) · A27 ⋯ · A28 wire +.  
**Join:** Get cascade family [`SYSTEMS-GET-RULE-ASCRIBE.md`](./SYSTEMS-GET-RULE-ASCRIBE.md) · 012 grain [`SYSTEMS-CHANGE-PACKET-012.md`](./SYSTEMS-CHANGE-PACKET-012.md) (this stamp **revises** A18 persist, not 012 housing).

A19 Contacts stays who is enrolled. **That table does not sit on the trigger.**

---

## Trigger — A. Where it already lives. What is silent on Ant.

| Face | Stood up | Ant |
|------|----------|-----|
| Event vs Schedule | `workflow_trigger.type` `event` \| `schedule` (also `manual` / `webhook` / `constant` — not A26 tabs). Graph: `triggerKind`. Materialize on Save / Activate. | Tabs exist as kinds. **A26 look** (search + icon list + Grain dropdown) is silent. |
| Named event | `workflow_trigger.event_name`. Graph: `triggerEvent`. | Picker rows exist; **not** A26 icons/list. Hub `import.created` still on the type union. Face **Contact import** = `contact_import`. |
| Global / Local | `workflow_trigger.grain` `global` \| `local`. Graph: `grain`. | Radios leftover (A18 prior). Not a dropdown. |
| “This one” | `workflow_trigger.local_ref`. Dispatch matches it for a **short** list only (`fact_writebacks`, `campaign_failure`, `ct_firms`, `consent_records.sequenced`). | A18 “this form” box. **Dead as the only Local UI.** |
| Who hears (tenancy) | `workflow.firm_id` / `workflow_trigger.firm_id` NULL = **house**. Dispatch: writing firm **or** NULL. | Not Grain. |
| Who is enrolled | `workflow.audience_scope` + `audience_contact_ids` (**A19**). Dispatch **after** grain. | Contacts tab. **Not on A26.** |
| Leftover on trigger | `scope` / `scope_contact_ids` — 012 C8 lump. Still materialized from graph. | Do not show. Do not reuse for Local. Stop copying A19 onto them. |

**012 CHECK is now wrong:** `grain = 'global' OR local_ref IS NOT NULL`. Local may stop mid-cascade (instance unspecified). **Drop that CHECK.** Materialize today **forces global** when `local_ref` is empty and only allows Local on four event names. **Stop that.**

`condition` jsonb on the trigger is not the cascade. Do not stuff Firm/Contact/instance into it.

---

## Trigger — B. Global / Local. Per named event on A26.

**Global** = every firm this row is **allowed to hear**, and **every permutation** of this event. All layers unspecified. Persist: `grain='global'`, `local_firm_id` NULL, `local_contact_ids='{}'`, `local_ref` NULL. **No extra combobox.**

Global does **not** rewrite tenancy. House (`workflow.firm_id` NULL) is how an automation hears **every firm**. A firm-bound graph still only hears that firm. Grain Global inside that world = every instance, every contact.

**Local** = specify down the **same** shape, nested, sequential. Same control family as Get (Every / Select → combobox that is also an input). **Not** Get’s Module. Changing the **named event restamps** the cascade.

Two layer families (do not dump both at once):

1. **Firm / contact** — Select-firm primitive (C8b / Get). Select firm → all that firm’s contacts selected; deselect all to pick. **Only where the map says Contact exists.**
2. **Event instance** — this form / this campaign / this pack / this batch. `local_ref` = that row’s id. NULL = every instance.

Stopping mid-cascade = all of the next class, when that default exists.

### Persist (no new table)

```sql
ALTER TABLE workflow_trigger
  DROP CONSTRAINT IF EXISTS workflow_trigger_local_ref;

ALTER TABLE workflow_trigger
  ADD COLUMN IF NOT EXISTS local_firm_id TEXT,
  ADD COLUMN IF NOT EXISTS local_contact_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
```

| Column | Unspecified (every of that class) | Specified |
|--------|-----------------------------------|-----------|
| `grain` | `global` | `local` |
| `local_firm_id` | NULL | `ct_firms.id` (TEXT firm key) |
| `local_contact_ids` | `{}` | selected `contact_records.id` |
| `local_ref` | NULL | instance id (table below) |

Graph node data mirrors those four + `triggerEvent`. Materialize copies them. Dispatch: if an axis is specified, the write must match; if not, skip that test.

Do not put these on `workflow.audience_*`.

House + Local + a firm: `local_firm_id` is that firm. Firm-bound graph: **do not offer Every firm** (tenancy already that firm). Open instance / contact layers only.

### A26 row → `event_name` → cascade (or silent)

Do not invent events. Do not add eligibility / halt / meeting to this list because they dispatch.

Icons: copy A26. Not a systems type.

| A26 | `event_name` | Dispatch today | Local order (next opens after Select) | Instance `local_ref` = | Mid-cascade default | Silent |
|-----|--------------|----------------|----------------------------------------|------------------------|---------------------|--------|
| Form submitted | `fact_writebacks` | Yes | **Firm** → **this form** | `fact_writebacks` / form node id already stamped `payload.form_ref` | Firm filled, form closed = **all forms at that firm** | **Contact** — people are the write; A19 filters the walk |
| Campaign failed | `campaign_failure` | Yes | **Firm** → **this campaign** | `campaign.id` (`campaign_id` on the row) | All failures of that firm’s campaigns | **Contact** |
| Opted out / unsubscribed | `consent_records.opt_out` | Yes | **Firm** → **Contact** | `contact_id` on that consent row | Firm filled, Contact closed = **all opt-outs at that firm** | No separate form/campaign instance |
| Firm created / provisioned | `ct_firms` | Yes | **this firm** (Every firm / Select firm only) | `ct_firms.id` | Global already covers every new firm | **Contact**. Do not nest Firm then Firm |
| Audit finished | `audit.completed` | Yes | **Firm** only | — **none** (one-time). Do not invent “this audit” as a Local instance | House: this firm’s audits vs all firms this graph hears | **Contact**. 012 hid Local entirely — **wrong now**. Local may be firm-only, never empty-of-idea |
| Contact import | `contact_import` | Yes | **Firm** → **this batch** | `import_batch.id` (`import_batch_id` / payload) | All contact-file imports at that firm | **Contact** on the trigger. People are the handle after the event. Not A19 |
| New contact | `contact.created` | **No** | **Firm** → **Contact** | that `contact_records.id` | All new contacts at that firm | **Do not merge with import.** Import upserts; this event is that person. Picker row stays. Walk will not wake until something **dispatches** this name — named gap, not a reason to drop the row |
| Reference pack updated | — | **No** | **Silent** | — | — | **No validated write-set.** Do not freeze `reference_versions`. Do not mint a pack-update event to make the row true. Row may show; Local cascade has **nothing to map**. Do not invent dropdowns |

`localRefFromPayload` today misses `contact_import` and `consent_records.opt_out`. Add those keys. Do not add a pack key.

**Not on A26 (do not sneak in):** `eligibility.changed`, `halt_records`, `meeting_booked`, `audit.failed`, `consent_records.sequenced`, Hub `import.created`.

**Schedule** tab: `type='schedule'`. No Local cascade. Grain does not apply.

---

## Node place — A. Click / Hub / Ant.

| Move | Hub | Ant today | This packet |
|------|-----|-----------|-------------|
| Body click | Oscillates configure vs switch (the bug) | Selects the node (`onNodeClick`) | **Configure** that kind (Input / Parameters / Outcomes / Output). Title-rename on click may stay. **Not A26.** |
| ⋯ options | Spoken: duplicate, add, reposition | **Silent.** Delete exists (Backspace / Remove). | **A27:** Duplicate · Add node · Switch · Delete |
| Switch | Mixed with click | Silent | **⋯ only.** Trigger → **A26**. |
| Wire + | Insert on the connection | Silent | **A28:** Get · Rule · Action · Condition (If) · Exit. **No Trigger.** |
| Palette Trigger | Start | Exists | Start / empty canvas only. Not on the wire. |
| Get on canvas | — | Not a kind | Palette + A28. |

No new graph store. `workflow.graph` nodes + edges. Same Save / materialize.

---

## Node place — B. Switch / Duplicate / insert.

| ⋯ / wire | Play | Silent? |
|----------|------|---------|
| **Duplicate** | Copy that node on the canvas (new node id, same `type` + `data`). Edges not auto-cloned unless the editor already copies a selection that way. | Ant silent today. No table. |
| **Add node** (⋯) | Same kind list as A28. Insert **after** this node (or from it). Trigger **not** in this list when a start already exists. | |
| **Switch (Trigger)** | Same node. Change `triggerEvent` / grain / Local cascade. Rematerialize **the same** `workflow_trigger` row (`UNIQUE (workflow_id, node_id)`). | |
| **Switch (Action)** | Retarget `actionType` — list already named (Call agent / Audit / Ascribe tag / …). Same node. | Do not invent a second picker. |
| **Switch (Get / Rule / If / Exit)** | **Silent.** No plate. Do not invent a Module/event modal. ⋯ may hide Switch on those kinds until a plate exists. | |
| **Delete** | Already: drop node + edges, Save graph. Follow existing Ant destructive confirm if one exists; do not invent a new one. | |
| **Wire +** | Insert kind **on that edge** (split the wire), select it, then configure (body click). End-of-chain + is the same menu. | No Trigger. Get is on this menu. |
| **Drag** | Reposition. Not a menu row. | |

Do not recut 015. Inserting Get / Rule does not change the handle type.

---

## Engineer pickup (together with the PM pastes)

1. A26 **icons and list** as drawn. Search searches **this** list. Grain dropdown Global · Local. Global = no extra boxes.
2. Local = nested Every/Select + comboboxes **from the cascade table above**, restamped on event change. Same family as Get; not Get Parameters on the trigger.
3. Persist `grain` / `local_firm_id` / `local_contact_ids` / `local_ref`. Drop the 012 CHECK. Stop forcing global when instance is unspecified. Stop limiting Local to four names.
4. Dispatch matches specified axes only. Add `contact_import` → `import_batch_id` and opt-out → `contact_id` to `localRefFromPayload`.
5. **A19 stays off this modal.**
6. A27 / A28 are graph chrome. Click = configure. Switch on Trigger = A26. No Trigger on the wire. No new table.
7. New contact and pack-update **rows** may exist; only the first has a token (`contact.created`) and it **does not fire yet**. Pack is silent. Do not mint to fill them.

**Do not:** recut 015; mint an events table; mint a Local catalog table; freeze `reference_versions`; collapse Local with A19; overwrite 15:43.
