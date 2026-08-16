# Implementer UI tests — Add contact (specimen)

**Seat:** Product Manager. These are **UI tests**. Product language. Not Playwright. Not backend. Do not mint tables.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Why:** Execution underbuilds the spec. Specs can be skimmed. A test is pass or fail. You cannot ship this slice until every test here passes.  
**Desk:** CT Ant `/prototype-ant`, Light. Operator → Configuration libraries.  
**Plates:** [`C8`](./agents-blueprint/C8-sequence-contacts-enroll.png) · [`C8b`](./agents-blueprint/C8b-select-from-list.png) · [`A19`](./automations-blueprint/A19-automations-contacts.png) · table chrome [`C13`](./agents-blueprint/C13-sequence-activity.png).  
**Packet:** [`IMPLEMENTER-FACE-PASS.md`](./IMPLEMENTER-FACE-PASS.md).

This file is the specimen. Same format for the rest of the packet next. More tests than the spec sentences is fair — that is the point.

**How to read one test:** Sit where it says. Do what it says. **Pass** is the only legal glass. **Fail** is every underbuild we have already seen. If any test fails, the slice is not done.

---

## Suite AC — Add contact modal

### T-AC-01 — Add contact is on the header row

**Sit:** Agents → open a sequence (any of Opt-in / Nudge / Reactivation).

**Do:** Look at the top of the sequence, same row as Save and Launch agent.

**Pass:** A control labeled **Add contact** is on that row.

**Fail:** Missing. Only inside the Contacts tab body. Buried in More actions. A different label that is not Add contact.

---

### T-AC-02 — Add contact opens the C8 modal, not a popover

**Sit:** Same sequence. Add contact is on the header.

**Do:** Click **Add contact**.

**Pass:** A modal titled **Add contact** opens. It has two radios: **Every firm** and **Select from**. Footer has **Add to sequence**.

**Fail:** A thin popover. A drawer. An inline dropdown. No modal. A different title. One radio. Three radios.

---

### T-AC-03 — Every firm is the default

**Sit:** Add contact modal just opened.

**Do:** Look at the radios. Do not click yet.

**Pass:** **Every firm** is selected. Helper: all contacts, every firm.

**Fail:** Select from is selected on open. Neither selected. A third radio (this firm / this contact) is present.

---

### T-AC-04 — Only two radios

**Sit:** Add contact modal.

**Do:** Count the scope choices.

**Pass:** Two. **Every firm**. **Select from**. Nothing else.

**Fail:** This firm. This contact. A contact in every firm. Any third choice.

---

### T-AC-05 — Select from opens the list inside the modal

**Sit:** Add contact modal.

**Do:** Click **Select from**.

**Pass:** The **same modal** now shows a contact list. Names and firms. Checkboxes. Search. You did not leave the modal.

**Fail:** Radios only — no list. A new screen. An empty box. “No contacts” when people exist in the book. A popover of names with no checkboxes.

Plate: C8b.

---

### T-AC-06 — The list opens with everyone selected

**Sit:** Select from is on. The list is visible.

**Do:** Look at the checkboxes. Do not click yet.

**Pass:** Every row is already checked. A count that matches (example: 25 selected).

**Fail:** None selected. Only the first row. You have to click “select all” to get everyone. Random subset.

---

### T-AC-07 — Deselect, then pick one

**Sit:** Select from. Everyone is checked.

**Do:** Uncheck all. Check one contact. Click **Add to sequence**.

**Pass:** That one contact is enrolled. The modal closes. Contacts table shows that person (Name · Firm · Enrolled date).

**Fail:** You cannot uncheck. Picking one still enrolls everyone. Add to sequence does nothing. The table still empty / still UUIDs.

---

### T-AC-08 — Search the list

**Sit:** Select from. List open.

**Do:** Type a name that is on the list. Then type a name that is not.

**Pass:** The list filters to matches. No match → empty list inside the modal, not a crash, not a different page.

**Fail:** No search. Search does nothing. Search closes the modal.

---

### T-AC-09 — The list scrolls inside the modal

**Sit:** Select from. More contacts than fit in the modal.

**Do:** Scroll the list. Then try to scroll the page behind.

**Pass:** The **list inside the modal** moves. You can reach the last row without closing the modal.

**Fail:** The list is clipped. The page behind scrolls and the modal stays stuck. You cannot reach the last row.

---

### T-AC-10 — Contacts tab is a table of people

**Sit:** Same sequence. Close the modal. Open the **Contacts** tab.

**Do:** Look at the body.

**Pass:** An Ant table. Columns **Name · Firm · Enrolled date**. Search. Pagination. Real names and firms.

**Fail:** Empty copy “No contacts enrolled for this agent yet.” when rows exist. `contact_id`. UUID. “lead 351”. A numbered list. The engagement chart.

---

### T-AC-11 — Automations has the same Contacts and the same modal

**Sit:** Automations → open a workflow.

**Do:** Look at the tabs and the header. Click **Contacts**. Click **Add contact**. Click **Select from**.

**Pass:** Tabs include **Contacts**. Header has **Add contact**. Table is Name · Firm · Enrolled date. Modal is the same as Agents: Every firm / Select from. Select from opens the list, everyone selected, list scrolls. T-AC-01 through T-AC-10 all pass here too, on this module.

**Fail:** No Contacts tab (Workflow · Runs · Settings only). No Add contact. A different modal. “Skip it because Agents already has C8.”

Plate: A19.

---

### T-AC-12 — Automations does not start a mission now

**Sit:** Automations → Add contact → Every firm or Select from → Add to sequence.

**Do:** Watch what happens after add.

**Pass:** Those people are who this automation applies to. Outreach does **not** start. You are still on Automations. Launch agent did not fire.

**Fail:** It starts the mission now. It launches an agent. Same footer/behavior as Agents C8.

---

### T-AC-13 — Agents does start the mission now

**Sit:** Agents → Add contact → Add to sequence.

**Do:** Watch what happens after add.

**Pass:** Those people are enrolled on this sequence and the mission starts now. It does not wait on an event.

**Fail:** Nothing enrolls. It waits on an automation event. Same as A19.

---

### T-AC-14 — Data comes from the connected tables, not painted empty-state

**Sit:** After SA has seeded `contact_records` + `enrollment` (not a thick seed, not fake strings in the component). Open Agents Contacts. Open Add contact → Select from. Open Automations Contacts.

**Pass:** Names and firms appear in all three places. Select from list is those people, already selected.

**Fail:** Empty state with hardcoded “No contacts enrolled…”. Marita Patel typed into the SPA. UUIDs. Select from list empty while Contacts table has rows, or the reverse.

---

## Cannot ship

If any T-AC-01 … T-AC-14 fails, Add contact is not done. Do not call the slice done because C8 exists as a picture. Do not call it done because Every firm is there but Select from has no list. Do not call Automations done because Agents has the modal.
