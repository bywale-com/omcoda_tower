# Systems — change packet 025 (Shell chrome — Consultant ▾ | Operator | Contact ▾)

**Seat:** Systems Analyst.
**When:** 2026-08-21 12:03 UTC.
**What this is:** the cut for PM [`SHELL-CHROME-PACKET.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/SHELL-CHROME-PACKET.md) · [`SHELL-CHROME.md`](https://github.com/bywale-com/omcoda_tower/blob/cursor/node-interior-a11-4b9f/docs/register/SHELL-CHROME.md) on PR [#96](https://github.com/bywale-com/omcoda_tower/pull/96). Implementer **only implements**. No analysis left.
**Why:** Live drifted a firm chip **to the left** of Segmented Consultant | Operator | Contact. Founder: the Consultant **slot** is the dropdown again. Contact ▾ is that firm’s people who still have a workspace — **everyone until they opt out of the workspace**, not “opted in.” **Only Operator** has this.
**Join:** `PrototypeAntApp.tsx` Header · `viewAsContext.tsx` · `isPlatformAdminEmail` · `listConsultants` (`users`⋈`firms`) · `consent_records.workspace_opted_out` (024). Face: `git fetch origin pull/96/head` · T1–T4.
**Flag:** 15:43 untouched. **Do not recut 015 / 024 Now-History-Upload interiors / A26.**
**Instructions:** founder only.

---

## What this is / is not

| This | Not this |
|------|----------|
| One header control: **Consultant ▾ \| Operator \| Contact ▾** | Extra `Dropdown` to the left of Segmented |
| Consultant ▾ = existing `listConsultants` + `setActiveFirmId` | A view-as table. A second firm picker |
| Contact ▾ = that **selected** firm’s contacts who **have not opted out of the workspace** | “Opted in.” Token-required. Consultant person gets this list |
| Who sees it: Operator both dropdowns; consultant person Consultant only; contact person **no** this switcher | Contact token land keeps Tower Segmented. Consultant sees Operator |

---

## Live (quote `origin/main`)

| Live | Gap |
|------|-----|
| **Operator / admin:** `viewAsContext` `isAdmin = isAuthDisabled() \|\| isPlatformAdminEmail(user?.email)`. Sole admin email `admin@try-tower.com`. Auth-bypass (`VITE_AUTH_DISABLED`) **is** the modeling shell — admin-shaped (APP-ELEVATION-GAP). | Contact person is **not** this. `/a/<token>` is consultant redeem (`008`). Contact land is 024 `/c/<token>` — no session. |
| **Consultant person:** authenticated, not admin. Header already Segmented **Consultant only**. `setActiveFirmId(user.firmId)`. | Do not add Operator or Contact ▾. |
| **Consultant ▾ list:** `GET /machine/consultants` — `users` ⋈ `firms`, skip the admin email. `selectConsultant` → `setActiveFirmId`. | Wired. The list is a **separate** `Dropdown` to the **left** of Segmented. That is the drift. |
| **Contact desk:** `ContactAntScene` 10-item flipper. Header still shows when `desk==='contact'` (no Log out). | Interior is **024**. This packet only **who** opens it and **whether** the Tower switcher is on. |
| **Opted in:** `consent_records.basis IN ('express','implied')`. | **Wrong filter for this list.** The opt-in **is** a Now state on the workspace. Requiring it here pollutes the idea. |
| **Has a workspace:** every `contact_records` row at that firm, until `workspace_opted_out`. Token (`contact_access_links`) is how **they** arrive from C16, not whether the seat exists. | 025 first cut required the token + express consent. **Retracted.** |
| `silenced` / `handleConsentSilence` | Send halt (email opt-out, **not designed**). Do not use for Contact ▾. |

No new table. Session firm + `workspace_opted_out` cover it.

---

## Hard decisions

### 1. Kill the leftover chip. Consultant slot **is** the dropdown.

`PrototypeAntApp.tsx`: remove the `Dropdown` that sits left of `Segmented`. The **Consultant** option of the segmented control opens `consultantMenuItems` (same `listConsultants` map). Operator option: no chevron, sets `desk='operator'`. Contact option: chevron, opens Contact ▾ (decision 2), sets `desk='contact'` **only after** a contact is chosen (or keeps last chosen).

Selecting a consultant restamps Contact ▾ to that firm and clears a contact selection that is not on the new firm.

### 2. Contact ▾ is a query, not a catalog.

New read (admin only), same grain as the consultant book — **session / selected `firmId`**, not a UUID↔TEXT invent:

```
SELECT cr.id, cr.name, cr.email
  FROM contact_records cr
  LEFT JOIN consent_records cons
    ON cons.contact_id = cr.id AND cons.firm_id = cr.firm_id
 WHERE cr.firm_id = $1
   AND COALESCE(cons.workspace_opted_out, false) = false
 ORDER BY cr.name
```

No consent row → they **have** a workspace (Agree has not happened yet; that is the point). Ignore (`source='ignored'`) still listed. Token not required.

Wire: `GET /machine/contact-workspaces`. 403 unless admin (same gate as `handleConsultantsList`). Auth-bypass standin: **that filter**. Empty only when the book is empty or everyone has foot-opted-out — still the slot, no fake person.

**024 column not landed yet:** list the firm’s `contact_records` (same as “no one has opted out”). Do **not** filter to `basis IN ('express','implied')`. Do not require `contact_access_links`.

Client: `selectContact(contactId)` on view-as (React state, not a table). Pass into the **024** workspace. Do not recut Now / History / Upload here.

### 3. Who sees the switcher (T4) — already almost true; lock it

| Who | Detection | Header |
|-----|-----------|--------|
| Operator / modeling shell | `isAdmin` (decision live) | Consultant ▾ · Operator · Contact ▾ |
| Consultant person | authenticated `!isAdmin` | Consultant only. No chevron of other firms unless `listConsultants` would already be their one workspace (it is not — that endpoint is admin-only). Their firm is session. |
| Contact person | **no** `users` session: 024 `/c/<token>` route | **No** `PrototypeAntApp` Segmented. Firm-branded workspace only. |

Operator **viewing** a contact = same 024 workspace **inside** the Operator shell (switcher stays). Contact **being** themselves = `/c/` without that chrome. Same seat, different shell.

Do **not** send a contact through `/a/<token>` (consultant). Do not show Hub / Source plant as product on the contact’s own land (out of scope to strip Operator Hub links this packet — do not add them to `/c/`).

### 4. No SQL file if 024 already created `contact_access_links`

This packet is Header + one SELECT. The `workspace_opted_out` column is **024**. **Do not mint** `view_as` / `shell_state`.

---

## Verify

`npm run build`. `/prototype-ant`:

1. Admin / auth-bypass: **no** firm chip to the left of the segment. Consultant ▾ opens firms. Operator has no chevron. Contact ▾ lists that firm’s book **minus** `workspace_opted_out` — including people who have not Agreed yet. Not “opted in.” Not token-only.
2. Pick another consultant → Contact ▾ restamps. Empty firm → empty Contact ▾, still the slot.
3. Signed-in consultant (not admin): Consultant only. No Operator. No Contact ▾.
4. `/c/<token>`: workspace, **no** Tower Consultant/Operator/Contact switcher.
5. Contact ▾ pick opens 024 Now · History · Upload, **not** the 10-item flipper. Do not recut those interiors in this PR.

---

## What this packet does not do

- Recut 015, 024 Now/History/Upload modules, 022, A26.
- Mint tables.
- Filter Contact ▾ to express consent or to tokens.
- Give consultants Contact ▾ or contacts the Operator switcher.
- Freeze Harbor / Alex.
- Build the email unsubscribe button.
- Unify UUID `firms` vs TEXT `contact_records.firm_id` (session firm already used by the consultant book — reuse it).
