# Implementer face pass — copy this, ignore that

**Seat:** Product Manager. Paste this. Product language. Do not invent backend. Do not mint tables.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Desk:** CT Ant `/prototype-ant`, Light. Operator → Configuration libraries → Agents / Automations. Chrome rule: [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md).  
**Captions:** [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md). Teaching copy on older plates is not a node.

Each new plate has **one purpose**. Copy that. Everything else on that PNG is not spec.

---

## C0 — only the Agents settings control

Plate: [`agents-blueprint/C0-agents-global-settings-entry.png`](./agents-blueprint/C0-agents-global-settings-entry.png)

**Copy:** The **Agents settings** control (gear + label) on the Agents catalog, next to **New template**. That is **global** — every sequence starts from these settings unless a sequence or campaign overrides.

**Ignore:** The rest of that PNG. Mock beats. The right editor body. Teaching banners. Catalog-selection drift.

**Opens:** [`C6-agents-settings-global.png`](./agents-blueprint/C6-agents-settings-global.png) — already locked. Do not invent a third Settings surface.

---

## C9 — only the campaign attempt modulators

Plate: [`agents-blueprint/C9-campaign-local-attempt-add-channel.png`](./agents-blueprint/C9-campaign-local-attempt-add-channel.png)

**Copy:** When **Override this** is **on**, the campaign container shows two attempt settings:

- **Attempt count**
- **Distance between attempts**

Those live on the **campaign**, not on a channel. Attempts are cycles of the same channel order.

**Ignore:** Everything else on that PNG. Objective teaching copy. Sequencing chips. Closed channel cards. Launch day. Any leftover qualify caption. **Do not copy + Add channel from this plate** — it is not this plate’s purpose.

---

## C11 — add a variation (this plate was redone)

Plate: [`agents-blueprint/C11-channel-attempt-variation.png`](./agents-blueprint/C11-channel-attempt-variation.png)

**Dead:** Three radios on one composer (“this variation runs on…” locking a single block). That does not work. You cannot add another variation that way.

**Copy:**

1. On the **channel node**, a **+ Add variation** control at the **top** of the node.
2. Clicking it **adds** a variation — another content block on that same channel.
3. **Then** each variation has a control for **how it applies in the attempt cycle** (every attempt / only this attempt / every attempt except this one). That selector lives **on the variation**, after you add it.

Not A/B. Same channel, more than one content, each tied to the attempt cycle.

**Ignore:** Launch window / Launch day teaching. Qualify captions. Anything that is not the + Add variation grain and the per-variation apply control.

---

## C13 — Activity table (keep)

Plate: [`agents-blueprint/C13-sequence-activity.png`](./agents-blueprint/C13-sequence-activity.png)

**Copy:** The **Activity** tab as an Ant **table**. Columns: **Time · Name · Firm · Channel · What happened**. Real names and firms. Search. Pagination. Not `event_kind` + a UUID. Not a numbered list. Not the engagement chart.

---

## Contacts — same table, no new image

Do not need a new PNG. **Contacts** uses the **same table chrome as C13**.

Columns: **Name · Firm · Enrolled date**. Search. Pagination. People and firms, not `contact_id` / “lead 351”.

Add contact remains the **C8 modal** (Every firm / Select from), not a thin popover. Header button still sits with Save / Launch.

Plate for the modal only: [`C8-sequence-contacts-enroll.png`](./agents-blueprint/C8-sequence-contacts-enroll.png). Copy the modal and the table grain. Ignore founder-caption sentences on C8.

---

## Also do (written — not a new plate)

These were asked. They are not “copy from C9/C11.”

| Do | How |
|----|-----|
| **Add a channel** | On the open campaign, **+ Add channel**. Do not stub. Do not change a number first. Not taken from C9. |
| **Channels are not radios** | Opening one channel must not close the others. Any mix of open/closed. |
| **Sequence Settings** | This sequence’s Settings tab = [`C7`](./agents-blueprint/C7-sequence-settings.png). Attempt cycle ≠ channel rules. Channel rules are per medium. |
| **Override toggle** | Lives **above** its modulators. Off = greyed inherit. On = you can edit. Toggling with nothing underneath is not a control. |
| **Global vs sequence** | C0 gear → C6 global. Sequence tab → C7. Then campaign local (C9). Channels nest inside a campaign; they are not a fourth CSS sibling. |
| **Modals scroll** | Every modal and submodal body scrolls. Pervasive today. Fix it. |
| **Action · Agents** | Match [`A12`](./automations-blueprint/A12-form-from-required-data.png) — an actual form from the listing. Assign path [`A14`](./automations-blueprint/A14-action-assign-or-template.png). |
| **Rename nodes** | Click the title, edit in place, same as renaming a campaign in Agents. Including the If / condition node. Same pattern everywhere a name is changed. |
| **Rule Output** | Match [`A11`](./automations-blueprint/A11-rule-output-required-data-listing.png). |

---

## What this is not

- Not the engagement chart. Activity is a table. The chart is a record for later.
- Not Hub chrome.
- Not freezing Launch window / Launch day as types.
- Not a `qualify` node.
- Not three radios as the variation model.
- Not planting from this file into a different module.

**Reports** may stay empty.
