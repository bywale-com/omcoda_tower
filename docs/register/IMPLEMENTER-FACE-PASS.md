# Implementer face pass — copy this, ignore that

**Seat:** Product Manager. Paste this. Product language. Do not invent backend. Do not mint tables.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Desk:** CT Ant `/prototype-ant`, Light. Operator → Configuration libraries → Agents / Automations. Chrome rule: [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md).  
**Captions:** [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md). Teaching copy on older plates is not a node.

Each new plate has **one purpose**. Copy that. Everything else on that PNG is not spec.

**Images keep the design system congruent. The written spec is the product.** Leave nothing big out of the writing. Do not generate a PNG for every channel.

**Literal reading will miss the product.** A plate shows one grain on one example (often Text). If that grain belongs on every channel, or on Email and Call, **build it there**. No extra PNG. C5 / C5b already show Text, Email, and Call composers — those exist. C11 showing Text does not mean Email and Call have no variation and no channel rules.

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

**On every channel.** Text, Email, Call, and any channel you add. The plate is Text so the desk stays congruent. Duplicate the control. Do not wait for an Email plate or a Call plate.

**Ignore:** Launch window / Launch day teaching. Qualify captions. Three radios (dead). Do **not** ignore the **channel rules** node’s **seat** — that extra wire is correct; fill it (next section).

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

## Channel rules — extra node, actual parameters, that channel in that campaign

No new PNG. The **seat** is already on C5 / C11: a **wired node off that channel**. Keep it there.

**Grain (lowest it goes):** channel rules are for **this channel in this campaign**. Not per variation. Not per attempt. Variations share them. Attempts share them.

**Still by channel.** Some parameters are the same family on every medium (within time). Some are specific to the medium (text not delivered · email link not clicked). Either way the row lives **on that channel’s rules node**, not as one global blob.

**Do not ship the teaching sentence as the UI.** “Escalation on this medium (not opened, not clicked, …)” is a caption. The node must show **toggles / fields you can set**, the same family as C6 § Channel rules, local to this channel:

| This channel | Parameters you can toggle (inherit from sequence/global until overridden) |
|--------------|--------------------------------------------------------------------------|
| **Text** | not opened · not delivered · within time |
| **Email** | not opened · link not clicked · within time |
| **Call** | same family for this medium (not answered / not completed · within time). Face is Call (C5). Do not put Form rows on a Call node. |
| **Any channel you add** | same idea: escalation on **that** medium, on **this** campaign |

Fallback still: this campaign’s this channel → sequence Settings (C7) → Agents settings (C6). Override toggle **above** the modulators; off = greyed inherit; on = you can edit.

Look at C6 / C7 for the parameter grain. Look at C5 / C11 for **where** the node sits.

---

## Extrapolate — no extra image

If a grain is true of a channel, it is true of **every** channel on that campaign.

| Grain | Shown on | Also build on |
|-------|----------|----------------|
| Composer + Override content | C5 / C5b — **Text, Email, and Call** | Any channel you add |
| **+ Add variation** + per-variation attempt apply | C11 — Text | Email, Call, any channel you add |
| Channel rules extra node + actual parameters | C5 / C11 seat; C6 / C7 parameters | Every channel on that campaign |
| Channels independently open | Written (not radios) | All channels |
| **+ Add channel** | Written | That campaign, once Override this is on |

Do not skip Email or Call because C11 is a Text picture. That is ridiculous. The written spec is the product.

---

## Also do (written — not a new plate)

These were asked. They are not “copy from C9/C11.”

| Do | How |
|----|-----|
| **Add a channel** | On the open campaign, **+ Add channel**. Do not stub. Do not change a number first. Not taken from C9. |
| **Channels are not radios** | Opening one channel must not close the others. Any mix of open/closed. |
| **Sequence Settings** | This sequence’s Settings tab = [`C7`](./agents-blueprint/C7-sequence-settings.png). Attempt cycle ≠ channel rules. Channel rules in that modal are sequence defaults per medium. Canvas channel-rules node is **this campaign’s this channel**. |
| **Override toggle** | Lives **above** its modulators. Off = greyed inherit. On = you can edit. Toggling with nothing underneath is not a control. |
| **Global vs sequence vs campaign vs channel** | C0 gear → C6 global. Sequence tab → C7. Campaign Override this → C9 attempt count / distance. Channel = composer + variations + channel rules. Channels nest inside a campaign; they are not a fourth CSS sibling of the same kind. |
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
- Not leaving Email / Call / channel rules out because a plate showed Text.
- Not putting attempt-cycle settings on the channel-rules node.
- Not making channel rules per variation.
- Not planting from this file into a different module.

**Reports** may stay empty.
