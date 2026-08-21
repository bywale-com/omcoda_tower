# Shell chrome packet — Consultant ▾ · Operator · Contact ▾

**Seat:** Product Manager. For the **engineer** and the **Systems Analyst**. One pocket. Do not lose this.  
**When:** Locked 2026-08-21. Light recut. Marks first, packet now.  
**Law / marks:** [`SHELL-CHROME.md`](./SHELL-CHROME.md). Plates **T1–T4** in `docs/register/shell-blueprint/`.  
**Cousins:** Contact seat interior [`CONTACT-WORKSPACE-PACKET.md`](./CONTACT-WORKSPACE-PACKET.md). Upload [`CONTACT-UPLOAD-PACKET.md`](./CONTACT-UPLOAD-PACKET.md). Live shell today: `PrototypeAntApp.tsx` Header (leftover firm `Dropdown` **to the left** of Segmented `Consultant | Operator | Contact`) + `viewAsContext.tsx`.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite. Read: [`PLATE-READ.md`](./PLATE-READ.md). Chrome: live `/prototype-ant` header.  
**Does not:** plant; recut 015; mint tables; give a consultant person Contact ▾ of the book; give a real contact the Operator switcher; list the whole book in Contact ▾; recut Now / History / Upload interiors here.

---

## Do not miss

Live drifted: a **selector to the left** of Consultant / Operator / Contact. Previously the **Consultant toggle itself was the dropdown**. That is the recut. Not extensive.

**Operator (admin) only:** one control — **`Consultant ▾ | Operator | Contact ▾`**. No extra firm chip to the left.

- **Consultant ▾** — pick a consultant workspace (firm). Select = that consultant desk.
- **Operator** — Operator desk. No chevron.
- **Contact ▾** — after a consultant workspace is selected: that firm’s contacts who **opted in** and **have a workspace**. Select = that contact seat (Now · History · Upload). Operator chrome stays on top (view-as).

**Consultant person:** Consultant only. Their workspace. No Operator. No Contact picker.

**Contact person:** themselves. Their workspace. No Tower switcher.

Harbor / Alex / firm emails = **example**.

---

## Paste — engineer

```text
Read docs/register/SHELL-CHROME-PACKET.md ALL THE WAY THROUGH. Then SHELL-CHROME.md, PLATE-READ.md, CONTACT-WORKSPACE-PACKET.md (the seat you land on when Contact ▾ is picked — do not recut that interior here).

You are recutting the /prototype-ant Header switcher. Product face = /prototype-ant. Hub is not the app. Do not recut 015. Do not overwrite 15:43. Do not plant. Do not mint tables.

Open T1 T2 T3 T4 in docs/register/shell-blueprint/. Copy the control. Ignore teaching captions, example firm names, example people.

Kill the leftover firm Dropdown to the left of the Segmented in PrototypeAntApp.tsx. The Consultant slot IS the dropdown (viewAs listConsultants — already there). Operator slot has no chevron. Contact slot is a dropdown of that selected firm’s contacts who opted in AND have a contact workspace — not the whole book, not listConsultants.

Operator / platform-admin / auth-bypass modeling shell: Consultant ▾ | Operator | Contact ▾.
Signed-in consultant (not admin): Consultant only. No chevron of other firms unless they already have that as their one workspace. No Operator. No Contact ▾.
A real contact (token / their seat): no this switcher. Firm-branded workspace from CONTACT-WORKSPACE-PACKET.md.

Picking Consultant ▾ shows ConsultantAntScene for that firm. Picking Operator shows OperatorAntScene. Picking Contact ▾ shows the contact workspace for that person (not the 10-item CONTACT_SURFACES flipper).

Read docs/register/PLATE-READ.md. Five buckets are in this file.
```

## Paste — Systems Analyst

```text
You are Tower’s Systems Analyst. Identity: docs/README.md § Systems Analyst. Log: docs/register/SYSTEMS-ANALYST-LOG.md. 15:43 stands. Shell face is docs/register/SHELL-CHROME-PACKET.md plus SHELL-CHROME.md. Contact seat is CONTACT-WORKSPACE-PACKET.md. Do not recut 015.

Do not mint tables from T1–T4. Do not freeze Harbor / Alex. Do not invent a view-as table if session firm + consent already cover it.

Short:

A. Who is Operator/admin today (isPlatformAdminEmail / auth bypass / PrototypeAntApp isAdmin)? Who is “consultant person” vs “contact person”? Silent if silent.

B. Consultant ▾ already has listConsultants + setActiveFirmId. Map. Do not mint.

C. Contact ▾ = that firm’s contacts who opted in AND have a workspace. Quote consent / workspace / token already in SQL. What is silent so the list is not the whole book?

D. Operator viewing a contact seat vs the contact’s own /a/<token> land — same workspace, different chrome (Tower switcher vs none). Name the split. Silent if silent.

Stamp SYSTEMS-ANALYST-LOG.
```

---

## Five buckets (PLATE-READ)

1. **Copy:** One header control for Operator: **Consultant ▾ | Operator | Contact ▾** (**T1**). Consultant slot opens firm/workspace list (**T2**). Contact slot opens opted-in + has-workspace people of the **selected** firm (**T3**). Who sees it (**T4**): Operator both dropdowns; consultant person Consultant only; contact person no switcher.
2. **Do not build:** Teaching captions. Extra firm picker to the left of the segment. Example names as types. Whole book in Contact ▾. Contact flipper 10-item sider. PREPARE / MANAGE / OPERATE if it leaked on T2. Giving consultants Contact ▾. Giving contacts Operator.
3. **Implied:** Operator slot still switches the Operator desk. Chevrons only on Consultant and Contact. Selecting a firm restamps Contact ▾ to that firm. Empty Contact ▾ when no opted-in workspace exists — still the slot, not a fake person.
4. **Completes:** Closed vs open of both dropdowns (T1 is closed; T2/T3 open). Switching desk without re-picking if a selection already exists. Auth-bypass modeling shell stays admin-shaped (APP-ELEVATION-GAP). No extra PNG for empty lists.
5. **Out of scope this build:** Now / History / Upload interiors (workspace + upload packets). Automations listen. Design-system recut of Harbor paint. Minting stores. Recutting 015.

---

## Founder comments (preserve)

- Light recut. Not extensive.
- Selector to the left of Consultant / Operator / Contact — previously the Consultant toggle **itself** was the dropdown. Want that again.
- When a consultant workspace is selected, Contact is also a dropdown: that firm’s contacts, the ones that **opted in** that **have a contact workspace**.
- **Only Operator** has this ability.
- In consultants there is only consultants. In contact, only themselves and their workspace.
- Easy UI mark. Packet now.

---

## Do not

- Plant. Recut 015. Overwrite 15:43. Mint tables.
- Keep the leftover left-of-segment firm chip.
- Contact ▾ = whole book.
- Consultant person gets Contact ▾.
- Contact person gets the Tower switcher.
- Recut the contact workspace modules in this packet.
