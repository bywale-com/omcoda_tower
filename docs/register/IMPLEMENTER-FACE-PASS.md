# Implementer face pass — copy this, ignore that

**Seat:** Product Manager. Paste this. Product language. Do not invent backend. Do not mint tables.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Desk:** CT Ant `/prototype-ant`, Light. Operator → Configuration libraries → Agents / Automations. Chrome rule: [`PLATE-CHROME-RULE.md`](./PLATE-CHROME-RULE.md).  
**Captions:** [`IMAGE-CAPTION-AUDIT.md`](./IMAGE-CAPTION-AUDIT.md). Teaching copy on older plates is not a node. **Locked pocket:** [`PLATE-READ.md`](./PLATE-READ.md) — copy / do not build / implied / completes / out of scope.

Each new plate has **one purpose**. Copy that. Everything else on that PNG is not spec.

**Images keep the design system congruent. The written spec is the product.** Leave nothing big out of the writing. Do not generate a PNG for every channel.

**Literal reading will miss the product.** A plate shows one grain on one example (often Text). If that grain belongs on every channel, or on Email and Call, **build it there**. No extra PNG. C5 / C5b already show Text, Email, and Call composers — those exist. C11 showing Text does not mean Email and Call have no variation and no channel rules.

**This pass also drew (so they cannot miss it):** C8b Select from list · C14 sequence Settings · C15 channel-rules one timer · A18 trigger Global/Local · A19 Automations Contacts. Allude to C8 / C6 / A5 when the look already exists.

**UI tests:** [`IMPLEMENTER-UI-TESTS.md`](./IMPLEMENTER-UI-TESTS.md) — **visual.** Click Add contact → must look like C8. Click Select from → must look like C8b. Automations → A19. If it does not look like the plate, it failed. Not how to build. Principles stay in this file.

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

## C14 — sequence Settings, same quality as Agents settings

Plate: [`agents-blueprint/C14-sequence-settings-channel-rules.png`](./agents-blueprint/C14-sequence-settings-channel-rules.png)

**Copy:** This sequence’s Settings. Same four families as [`C6`](./agents-blueprint/C6-agents-settings-global.png). Each family has **Override**. When Channel rules Override is **on**, the **rows underneath** match C6: toggles per medium + **one** Within time per channel (Text / Email / Call). Not a naked Override. Not the live tab that dumps `rule_attempt_criteria`.

[`C7-sequence-settings.png`](./agents-blueprint/C7-sequence-settings.png) is **prior**. C7’s channel-rules family was only a time dropdown. That is why it looked empty next to C6. **C14 is canon for sequence Settings.**

**Ignore:** Teaching “Fall back up like CSS” as a banner. Inherit behavior is law.

---

## Contacts — Agents table, Select from list, same thing in Automations

**Contacts tab (Agents)** uses the **same table chrome as C13**. Columns: **Name · Firm · Enrolled date**. Search. Pagination. People and firms, not `contact_id` / “lead 351”. Not the empty “No contacts enrolled for this agent yet.” when rows exist.

Add contact remains in the **header** with Save / Launch. Modal is **Every firm** / **Select from**, not a thin popover.

Plate for the radios: [`C8-sequence-contacts-enroll.png`](./agents-blueprint/C8-sequence-contacts-enroll.png).

**Tests (pass/fail):** visual. Click → must look like C8 / C8b / A19. [`IMPLEMENTER-UI-TESTS.md`](./IMPLEMENTER-UI-TESTS.md).

### C8b — Select from actually opens the list (fix the modal)

Plate: [`C8b-select-from-list.png`](./agents-blueprint/C8b-select-from-list.png)

**Copy:** Click **Select from** → the modal **shows the contact list**. Everyone is **already selected**. Deselect, then pick. Search. The list **scrolls inside the modal**. That is the old “this contact” option. No third radio.

**Ignore:** Teaching footer on C8 (“starts the mission now”) as a banner. The **behavior** is law. Agents enroll **does** start the mission now.

### A19 — Automations Contacts is the same look

Plate: [`A19-automations-contacts.png`](./automations-blueprint/A19-automations-contacts.png)

**Copy:** Automations has **Contacts** the **exact same way** Agents does. Same tab. Same table (Name · Firm · Enrolled date). Same **Add contact** in the header. Same modal: Every firm / Select from (and C8b when Select from is on).

**One difference (law, not a different-looking modal):** Automations does **not** start a mission now. Who this automation applies to is Contacts. Global vs local of the **event** is a different control (A18). Do not collapse those.

Live Automations today is Workflow · Runs · Settings — **no Contacts**. Build it. Do not skip because A1–A17 never showed the tab.

---

## Channel rules — extra node, actual parameters, that channel in that campaign

**Grain (lowest it goes):** channel rules are for **this channel in this campaign**. Not per variation. Not per attempt. Variations share them. Attempts share them.

The **seat** is the extra wired node off that channel (C5 / C11 / **C15**). Keep it. **C15 is the filled node** — copy that, not the teaching caption on C5.

**Still by channel.** Some parameters are the same family on every medium (within time). Some are specific to the medium (text not delivered · email link not clicked). Either way the row lives **on that channel’s rules node**, not as one global blob.

**Do not ship the teaching sentence as the UI.** “Escalation on this medium (not opened, not clicked, …)” is a caption. The node must show **toggles / fields you can set**, the same family as C6 § Channel rules, local to this channel:

| This channel | Parameters you can toggle (inherit from sequence/global until overridden) |
|--------------|--------------------------------------------------------------------------|
| **Text** | not opened · not delivered · within time |
| **Email** | not opened · link not clicked · within time |
| **Call** | same family for this medium (not answered / not completed · within time). Face is Call (C5). Do not put Form rows on a Call node. |
| **Any channel you add** | same idea: escalation on **that** medium, on **this** campaign |

Fallback still: this campaign’s this channel → sequence Settings (C14) → Agents settings (C6). Override toggle **above** the modulators; off = greyed inherit; on = you can edit.

Look at C6 / C14 for the parameter grain. Look at C5 / C11 / **C15** for **where** the node sits.

### One timer (confirm)

Plate: [`C15-channel-rules-one-timer.png`](./agents-blueprint/C15-channel-rules-one-timer.png)

**Copy this node:** **Override this channel** on → the **toggles** (not opened · not delivered · … for that medium) → **one** **Within time** field (example 30 minutes).

Every rule you toggle **on** uses **that** timer. Not a timer per toggle. Same on every channel. Same in sequence Settings (C14) and global (C6). The helper sentence on the PNG need not ship; the **one field** is the spec.

**Ignore:** The rest of that PNG (composers, Launch window teaching). **Do not ignore the scrollbar** — that canvas must scroll (next section).

---

## Extrapolate — no extra image

If a grain is true of a channel, it is true of **every** channel on that campaign.

| Grain | Shown on | Also build on |
|-------|----------|----------------|
| Composer + Override content | C5 / C5b — **Text, Email, and Call** | Any channel you add |
| **+ Add variation** + per-variation attempt apply | C11 — Text | Email, Call, any channel you add |
| Channel rules extra node + actual parameters + **one timer** | C15 (Text) · C14 · C6 | Email, Call, any channel you add |
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
| **Sequence Settings** | This sequence’s Settings = [`C14`](./agents-blueprint/C14-sequence-settings-channel-rules.png) (revises C7). Same **quality** as [`C6`](./agents-blueprint/C6-agents-settings-global.png). Override **on** for channel rules → the **same rows** as C6 underneath (toggles + **one** within-time per channel). A naked Override is not a control. C7 stays as prior. Live Settings tab dumping `rule_attempt_criteria` is the **wrong surface**. |
| **Override toggle** | Lives **above** its modulators. Off = greyed inherit. On = you can edit. Toggling with nothing underneath is not a control. |
| **Global vs sequence vs campaign vs channel** | C0 gear → C6 global. Sequence tab → C14. Campaign Override this → C9 attempt count / distance. Channel = composer + variations + channel rules (C15). Channels nest inside a campaign; they are not a fourth CSS sibling of the same kind. |
| **Scroll — canvas and modals** | Not only modals. **Agents canvas must scroll.** Override-this, added channels, Call, channel-rules hang below the fold — you have to reach them. Automations canvas is already fine. Sequence Settings body scrolls (C14). Select from list scrolls (C8b). Every panel that has content underneath the fold scrolls. Live Settings already cuts off channel ownership. Fix it. |
| **Action · Agents** | Match [`A12`](./automations-blueprint/A12-form-from-required-data.png) — an actual form from the listing. Assign path [`A14`](./automations-blueprint/A14-action-assign-or-template.png). |
| **Rename nodes** | Click the title, edit in place, same as renaming a campaign in Agents. Including the If / condition node. Same pattern everywhere a name is changed. |
| **Rule Output** | Packet [`RULE-OUTPUT-PACKET.md`](./RULE-OUTPUT-PACKET.md). Match [`A20`](./automations-blueprint/A20-rule-output-select-preview.png). A11 is prior. |
| **Rule Outcomes** | Packet [`RULE-OUTCOMES-PACKET.md`](./RULE-OUTCOMES-PACKET.md). Match [`A21`](./automations-blueprint/A21-rule-outcomes-pane.png). A2 / A3 / A4 are prior. Do not build giant GUI/Custom. Do not build teaching captions. |
| **Node interior** | Shared vs kind: [`NODE-INTERIOR.md`](./NODE-INTERIOR.md). **Input** (A23 left) and **Output** (A20) on every node that has those panes. Get **Parameters** (A23 right) only on Get. Rule **Outcomes** (A21) only on Rule. |
| **Get** | Packet [`GET-PACKET.md`](./GET-PACKET.md). Canvas [`A22`](./automations-blueprint/A22-get-canvas.png). Parameters [`A23`](./automations-blueprint/A23-get-input-parameters.png) right. Input look [`A29`](./automations-blueprint/A29-variable-chip.png) · [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md). Kind, not Action, not Audit. |
| **Click vs Switch** | Law 38. Click = configure. Packets [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md) · [`NODE-PLACE-PACKET.md`](./NODE-PLACE-PACKET.md). **A26** · **A27** · **A28**. |
| **Test / Run / Launch** | Law 39 · 43. Test data **on the trigger** ([`TEST-PACKET.md`](./TEST-PACKET.md)). Canvas **Save · Run · Launch**. Run = execute now. Launch = arm. Packet [`RUN-PACKET.md`](./RUN-PACKET.md). **A30** Test is prior. |
| **Variables / mapped box** | Law 40. [`INPUT-LOOK-PACKET.md`](./INPUT-LOOK-PACKET.md) · [`MAPPED-BOX-PACKET.md`](./MAPPED-BOX-PACKET.md). **A29** tree. **A31** chip **is** the box. **A32** close Input / resize. |
| **In-app Action** | Law 41. [`IN-APP-ACTION-PACKET.md`](./IN-APP-ACTION-PACKET.md). After **A7** in-app: module write-buttons, grouped by module. Look **A33**. **Add tag** Parameters: **A35** (contact import prior; Contact occupied, Tag picker). Live three-row picker is the first pass, not the inventory. Same pass completes **A31 / A32**. Tail: not every CI needs a button. Audit mark on the contact is **A34**. |

---

## A18 — trigger grain: Global or Local

Plate: [`A18-trigger-global-local.png`](./automations-blueprint/A18-trigger-global-local.png)

**Copy:** When you select a **trigger event**, you set **Global** or **Local**. Not Settings. Not “who this applies to” (that is Contacts / A19).

- **Global** = **every firm** + **every permutation** of this event. No extra boxes (A26).
- **Local** = nested dropdowns of **that event’s existing shape**. Firm/contact Select-firm primitive is one layer. Event instance (this form, this campaign, this pack, this batch) is another. Sequential — not a dump. Stopping mid-cascade = all of the next class when that default exists.

A18 radios + disabled “this form” are **prior**. Canon look + shape: **A26** · [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md).

**Idea for SA (do not invent UI):** some events may have **no instance axis**. An **audit** is a one-time event. Map which events have which layers. Do not drop the idea. Do not invent events.

**Ignore:** The rest of A18 (which workflow is selected in the catalog). Copy the **modal**.

Allude: [`A5-inside-trigger.png`](./automations-blueprint/A5-inside-trigger.png) is inside-trigger Event vs Schedule. **A18 adds the grain** as radios — **prior**. **A26** is canon: named-event list + grain **dropdown** + Local nested shape. Packet [`TRIGGER-SELECT-PACKET.md`](./TRIGGER-SELECT-PACKET.md).

**Click vs Switch (law 38):** body click = configure. **⋯** = Duplicate · Add node · Switch · Delete (**A27**). Wire **+** = **A28** (no Trigger on the wire). Packet [`NODE-PLACE-PACKET.md`](./NODE-PLACE-PACKET.md).

---

## Seed the connected tables (SA + implementer)

Not a thick seed. Not fake rows painted into an empty-state component.

**SA:** seed the tables that **already exist** and are **already connected**. Then Save. The desk shows people.

Named (do not mint new tables from this sentence):

| Surface | What you should see | Already-there tables (SA maps the rows) |
|---------|---------------------|------------------------------------------|
| Agents **Contacts** / Select from (C8b) | Names, firms, enrolled dates | `contact_records` + `enrollment` |
| Agents **Activity** (C13) | Time · Name · Firm · Channel · What happened | `engagement_records` (and the enrollment those rows hang off) |
| Automations **Contacts** (A19) | Same people grain | same enroll/contact rows for that workflow |
| Automations **Runs** | Runs exist | `workflow_run` |

Today Contacts is empty (“No contacts enrolled…”) because those rows are not in the seed. `002_machine_tables` / `003_canonical_workflows` bind templates and workflows. They do **not** put people on them. That is the gap.

**Implementer:** do not hard-code Marita Patel in the SPA. Read the connected rows. If the seed is right, the table fills. If Select from is right, the list fills.

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
- Not skipping Automations Contacts because Agents already has C8.
- Not putting Global/Local on Contacts, or Contacts on the trigger.
- Not a timer per toggle.
- Not seeding fake UI strings. Seed the tables.

**Reports** may stay empty.
