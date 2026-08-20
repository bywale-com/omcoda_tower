# Audit field packet — A34 on Contacts. Hardcoded. Not an Action.

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this.  
**When:** Plate 2026-08-19 10:39. Unmixed 18:40. Lock 2026-08-20 10:26. Packet 10:29.  
**Plate:** [`A34-audit-tag-on-contact.png`](./automations-blueprint/A34-audit-tag-on-contact.png). Open it.  
**Law:** [`AUTOMATIONS-FACE.md`](./AUTOMATIONS-FACE.md) **45**.  
**Inventory stays elsewhere:** [`IN-APP-ACTION-PACKET.md`](./IN-APP-ACTION-PACKET.md) **A33**. **Run audit** / Start Audit stays there. Do **not** put “set audit field” on that list.  
**Tag stays elsewhere:** live Tag. Leave it. Do not talk about it. [`ADD-TAG-PACKET.md`](./ADD-TAG-PACKET.md) is not this pocket.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Does not:** plant; recut 015; mint a table from this PNG; automate filling this field; mix this into Tag.

---

## Do not miss

Open [`A34-audit-tag-on-contact.png`](./automations-blueprint/A34-audit-tag-on-contact.png).

| Look at this (the product) | Do not look at this |
|----------------------------|---------------------|
| **Audit** column on Contacts | The missing **Tag** column on this PNG — Tag stays on the live desk. Leave it. |
| **Composite** chips in that one cell (reachable / partial / unreachable · sequence-ready) | One chip as if it were Tag |
| No X. No + add | An ascribe control. An Automations Action that fills this field |
| Populates **when an audit runs** | A second write-button |

If Contacts still has no Audit column, you missed this plate. If you added “set audit field” to A33, you missed law 45. If you painted these chips into Tag, you missed the field. If you recut 015 to create this field, you missed hardcoded.

---

## Paste — engineer

```text
Read docs/register/AUDIT-FIELD-PACKET.md ALL THE WAY THROUGH. Then IN-APP-ACTION-PACKET.md and PLATE-READ.md.

You are building the Audit field on CT Ant Consultant Contacts. Product face = /prototype-ant. Hub is not the app. Do not recut 015. Do not overwrite 15:43. Do not plant.

Open docs/register/automations-blueprint/A34-audit-tag-on-contact.png.

This is not an Automations Action. It is a field on the contact. System control. When Start Audit (Book readiness) or the Run audit action runs for a contact, that field populates. Hardcoded. Same run that already writes reachability_verdicts and sequence_ready.

On the glass:
- Consultant → Contacts.
- New column: Audit.
- Composite: everything that can be true about that person after a verdict, in that one cell. Today: reachable | partial | unreachable, and sequence-ready (yes / no as on the plate). Many chips, one field.
- No X. No + add. Not a picker.
- Empty until an audit has run for that contact.

Leave the live Tag column. Do not talk about Tag. Do not put these chips there.

Do not add “set audit field” / “ascribe audit” to A33. Run audit / Start Audit stays the action. This field is a consequence of that run.

Because it is a field: Get contact includes it. A condition / If can reference it. Same as every other contact field.

Read docs/register/PLATE-READ.md. Chrome: screenshot live Contacts; paint Audit in the table. Do not rebuild the desk from A34’s generated nav. Do not recut 015.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Audit field face is docs/register/AUDIT-FIELD-PACKET.md plus A34. Law 45. Do not recut 015.

Do not mint a table from the PNG. Live executeAuditRun already writes audit_runs, contact_records upsert, reachability_verdicts, sequence_ready. Name the smallest existing store that paints one composite Audit field on Contacts. Silent if silent.

A. Face = one field, many chips. Machine today = two per-person writes (verdict + sequence_ready) plus the run. Do not invent an ascribe action. Hardcoded on that run.

B. Reference: Get contact and If/condition can read it because it is a field. Name how those writes already show on the handle (law 33). Do not invent a parallel Automations-only field.

C. Leave contact_tag / live Tag. Not this pocket.

Stamp SYSTEMS-ANALYST-LOG.
```

---

## Founder comments (preserve)

- Not going to make that audit-centric Tag. Better to **hardcode** it than make it an automation.
- When an audit runs we already know what we are trying to achieve — populate it with those items.
- **Audit field should exist, different from Tag.**
- Run an audit on a contact → that field populates.
- **Composite** of tags, not one tag alone. Sequence-ready, reachability verdicts — everything that can be true about a contact after a verdict lives inside **one Audit field** on Contacts.
- Lots of fields we will add; this one is a **system control**. First critical interaction they **do not want to automate**.
- Can still be **referenced** in a condition, because it is a field. Every field can. They show up whenever you Get contact.
- Will not touch live Tag if it exists. Do not talk about it. Move forward. Hardcode this.
- How else would it be built — need a package.

---

## Law (plain)

**The Audit field is a system control.** Do not automate filling it as its own Action. When an audit runs, it populates. Hardcoded. Composite: one field, many chips. Not Tag. **Run audit** stays the action. A condition can reference it because it is a field.

---

## Click path

Consultant → Contacts.

Run an audit (Operator → Book readiness → **Start Audit**, or Automations **Run audit** on people). Return to Contacts. That person’s **Audit** cell has the chips.

---

## 1. Copy

- Contacts table: **Audit** column.
- Composite chips as **A34**: reachable / partial / unreachable · sequence-ready.
- No X. No + add.
- Fills when audit runs for that contact. Same writes the audit already makes.

## 2. Do not build

- An Automations Action that ascribes this field.
- “Set audit field” on **A33**.
- Painting these chips into **Tag**.
- Deleting live Tag because A34 omitted it.
- Recut 015.
- A picker / ascribe control on the cell.

## 3. Implied

- Empty cell until that contact has been audited.
- Several chips in one cell (composite).
- After a later audit run, the chips update (same field, new verdict).
- Get contact / If can read the field. It works.

## 4. Completes

- Live **Tag** column stays. A34 did not draw it. Leave it.
- **Run audit** / Start Audit already exist. Do not rebuild them in this packet. Wire: those runs populate this field.

## 5. Out of scope this build

A33 inventory. A35 Add tag. Automations node interiors. Recut 015. Desk sider if A34 drifted. Book readiness verdict list (already has the writes — this packet is the Contacts field).

---

## Live vs this packet

| Live today | This packet |
|------------|-------------|
| Contacts: Contact · Phone · **Tag** · Notes · Phase. No Audit column | Same desk **plus** **Audit** column (**A34**) |
| Audit writes exist (`audit_runs` · `reachability_verdicts` · `sequence_ready`). Visible on Book readiness | Those writes also paint the Contacts **Audit** field |
| No ascribe control for this | Still none. Hardcoded on the run |
| Tag column valid / invalid | Leave it. Not this field |

---

## Cousin packets

| Packet | Take | Do not take |
|--------|------|-------------|
| **IN-APP-ACTION** | **Run audit** stays on A33 | Filling this field as a row on A33 |
| **ADD-TAG** | Leave live Tag | Mixing A34 chips into Tag |
| **MAPPED-BOX** | Occupancy elsewhere | A picker on this cell |
| **RUN** | Execute now still writes | Canvas Test as the way this field fills |

---

## Do not

- Recut 015. Overwrite 15:43. Plant.
- Put this on A33. Mix into Tag. Mint a table from the PNG.
