# Consultant — Furnish

**Subject:** Consultant  
**Count:** 20  
**Status:** paper — Register Furnish

### `cons-furnish-01` — Phase chip legend
- **Supporting affordance:** Phase signal legend door
- **SurfaceIds:** ["Board", "Phase signal"]
- **implementationProblem:** Phase chips are inhabited without a firm-desk key for what each chip means.
- **implementation:** Starting from Board, click Phase signal legend (info control beside the list header).  
  On the legend panel, view chip meanings (silent / in motion / meeting-ready / halted) — read-only.  
  Close the panel; Board list unchanged.
- **Does not change Core Function:** Still inhabit-only; no pack authorship or phase editing.

### `cons-furnish-02` — Board search by client name
- **Supporting affordance:** Board client search
- **SurfaceIds:** ["Board"]
- **implementationProblem:** Large books force scroll-scanning Client rows to find one name.
- **implementation:** Starting from Board, click the Search field.  
  Type client name; view filtered Client rows with Phase signal chips.  
  Click a row to open Client workspace as today.
- **Does not change Core Function:** Findability only; handover / receive / halt paths unchanged.

### `cons-furnish-03` — Meetings today strip
- **Supporting affordance:** Today’s meetings strip
- **SurfaceIds:** ["Board", "Meetings"]
- **implementationProblem:** Signed-in landing is Board; next booked meetings are one nav hop away.
- **implementation:** Starting from Board (post-Login landing), view Today’s meetings strip above Client rows.  
  Click a strip row to open Meeting; click Live brief as on Meetings.  
  Click See all to open Meetings.
- **Does not change Core Function:** Receive path still lands on Meetings / Live brief; strip is glance chrome.

### `cons-furnish-04` — Copy Live brief facts
- **Supporting affordance:** Copy brief
- **SurfaceIds:** ["Live brief", "Meeting", "Meetings"]
- **implementationProblem:** Pre-call prep often leaves the desk; facts are view-only with no portable grab.
- **implementation:** Starting from Meetings, click a Meeting row → Meeting.  
  On Live brief, click Copy brief; view copied confirmation.  
  Fact rows stay read-only on the panel.
- **Does not change Core Function:** Brief still re-computes from write-back; copy does not edit facts.

### `cons-furnish-05` — Halt reason retained on workspace
- **Supporting affordance:** Halt reason peek
- **SurfaceIds:** ["Halt outreach", "Client workspace", "Engagement record"]
- **implementationProblem:** Optional Halt reason disappears after Confirm halt; later review has no note.
- **implementation:** Starting from Client workspace, click Halt outreach → type reason → Confirm halt.  
  Re-open Client workspace; view Halt reason under Engagement record / halt banner.  
  Reason is display-only.
- **Does not change Core Function:** Halt commit and runner honor unchanged; reason is retained chrome.

### `cons-furnish-06` — Engagement record newest-first cue
- **Supporting affordance:** Chronology sort cue
- **SurfaceIds:** ["Engagement record", "Client workspace"]
- **implementationProblem:** Chronology rows lack an explicit newest-first cue; consultants re-scan the panel.
- **implementation:** Starting from Board, click Client row → Client workspace.  
  Click Engagement record; view Newest first label and chronology rows.  
  Click a row only to expand detail — no authorship controls.
- **Does not change Core Function:** Record remains view chronology, not a decision brain.

### `cons-furnish-07` — Contacts count + import badge
- **Supporting affordance:** Book size / Imports badge
- **SurfaceIds:** ["Contacts", "Imports"]
- **implementationProblem:** Contacts module gives no glance of book size or pending Imports batches.
- **implementation:** Starting from Contacts, view contact count in the header.  
  Click Imports; view batch rows with pending / confirmed badges.  
  Confirm book for Tower path unchanged when pending.
- **Does not change Core Function:** Handover commit still Authorize / Confirm book for Tower.

### `cons-furnish-08` — Prepared Workspace progress checklist
- **Supporting affordance:** Activation checklist chrome
- **SurfaceIds:** ["Prepared Workspace", "Authorize book", "Accept terms"]
- **implementationProblem:** Two hard inputs feel like separate doors with no shared progress furniture.
- **implementation:** Starting from Prepared Workspace, view checklist rows: Authorize book, Accept terms.  
  Click Authorize book or Accept terms; on return, view checkmarks on completed rows.  
  Primary commits unchanged.
- **Does not change Core Function:** Still the same two hard inputs; checklist is progress chrome.

### `cons-furnish-09` — Login resend code timer
- **Supporting affordance:** Resend code with cooldown
- **SurfaceIds:** ["Login"]
- **implementationProblem:** OTP entry has no clear resend timing; consultants hammer Send code.
- **implementation:** Starting from Login, type Email → Send code.  
  On Login verify, view Resend code with cooldown timer; click Resend when enabled.  
  Type Code → Verify as today.
- **Does not change Core Function:** Passwordless OTP path unchanged; timer is access chrome.

### `cons-furnish-10` — Meeting countdown on Live brief
- **Supporting affordance:** Starts-in cue
- **SurfaceIds:** ["Live brief", "Meeting", "Meetings"]
- **implementationProblem:** Live brief shows facts but not how soon the meeting starts.
- **implementation:** Starting from Meetings, click Meeting row → Meeting.  
  On Live brief header, view Starts in / start time cue beside fact rows.  
  Join path unchanged.
- **Does not change Core Function:** Receive + brief only; no calendar authorship.

### `cons-furnish-11` — Client workspace Phase header chip
- **Supporting affordance:** Sticky Phase chip in workspace header
- **SurfaceIds:** ["Client workspace", "Phase signal", "Board"]
- **implementationProblem:** Opening Client workspace buries the Board Phase chip behind Activity tabs.
- **implementation:** Starting from Board, click Client row → Client workspace.  
  View Phase signal chip sticky in the workspace header while clicking Engagement record.  
  Chip remains view-only.
- **Does not change Core Function:** Phase still inhabit result from bound packs.

### `cons-furnish-12` — Empty Meetings empty-state
- **Supporting affordance:** Meetings empty-state copy
- **SurfaceIds:** ["Meetings", "Board"]
- **implementationProblem:** Empty Meetings looks broken rather than “nothing booked yet under bound packs.”
- **implementation:** Starting from Board, click Meetings.  
  When no rows, view empty-state: no meetings booked yet — Board still shows book inhabit.  
  Click Back to Board.
- **Does not change Core Function:** Receive surface still waits on contact booking; no enroll CTA.

### `cons-furnish-13` — Halt scope reminder on confirm
- **Supporting affordance:** Scope confirmation summary
- **SurfaceIds:** ["Halt outreach"]
- **implementationProblem:** Confirm halt can fire without restating This contact vs Firm book.
- **implementation:** Starting from Board or Client workspace, click Halt outreach.  
  Select This contact or Firm book; view summary line restating scope.  
  Optionally type reason → Confirm halt.
- **Does not change Core Function:** Same Halt commit; summary is confirm chrome.

### `cons-furnish-14` — Live brief evaluative chip tooltips
- **Supporting affordance:** Signal chip tooltips
- **SurfaceIds:** ["Live brief", "Meeting"]
- **implementationProblem:** Evaluative signal chips on Live brief lack plain-language expansion.
- **implementation:** Starting from Meetings, open Meeting → Live brief.  
  View evaluative signal chips; hover/focus a chip to view short tooltip meaning.  
  Fact rows stay primary.
- **Does not change Core Function:** Brief content source unchanged; tooltips are read chrome.

### `cons-furnish-15` — Board last-updated stamp
- **Supporting affordance:** Book last-updated stamp
- **SurfaceIds:** ["Board"]
- **implementationProblem:** Board inhabit has no cue when Phase/book last refreshed under the session.
- **implementation:** Starting from Login → Board landing.  
  View Last updated stamp in the Board header.  
  Client rows / Phase signal chips otherwise unchanged.
- **Does not change Core Function:** Stamp is session furniture; no refresh-authoring job.

### `cons-furnish-16` — Accept terms print/download
- **Supporting affordance:** Download accepted terms
- **SurfaceIds:** ["Accept terms", "Escrow terms", "License acknowledgement"]
- **implementationProblem:** License + escrow acceptance has no portable copy for firm records.
- **implementation:** Starting from Prepared Workspace, click Accept terms.  
  View License acknowledgement + Escrow terms; click Download terms (before or after Accept).  
  Accept primary button unchanged.
- **Does not change Core Function:** Hard-input Accept commit unchanged; download is record chrome.

### `cons-furnish-17` — Contacts open-in-workspace
- **Supporting affordance:** Open Client workspace from Contacts
- **SurfaceIds:** ["Contacts", "Client workspace", "Board"]
- **implementationProblem:** Contacts list is disconnected from Client workspace / Engagement record.
- **implementation:** Starting from Contacts, click a contact row.  
  View Client workspace (same pane as from Board) with Engagement record available.  
  Halt outreach entry available as from Board.
- **Does not change Core Function:** Same workspace inhabit; Contacts remains book surface, not pack editor.

### `cons-furnish-18` — Meetings calendar/list toggle
- **Supporting affordance:** Meetings view toggle
- **SurfaceIds:** ["Meetings"]
- **implementationProblem:** Meetings as a flat list only makes week-shaped triage harder.
- **implementation:** Starting from Meetings, click List / Calendar segmented control.  
  On Calendar, view booked blocks; click a block to open Meeting → Live brief.  
  List rows remain the default receive path.
- **Does not change Core Function:** Still receive-only; no sequence enrollment.

### `cons-furnish-19` — Session firm name cue
- **Supporting affordance:** Firm identity in shell
- **SurfaceIds:** ["Board", "Login", "Meetings", "Contacts"]
- **implementationProblem:** After OTP, firm tenancy identity is easy to miss in primary nav.
- **implementation:** Starting from Login → Verify → Board.  
  View firm name in session chrome beside primary nav (Board / Meetings / Contacts).  
  Nav targets unchanged.
- **Does not change Core Function:** Access + land path unchanged; identity is shell chrome.

### `cons-furnish-20` — Engagement record export peek
- **Supporting affordance:** Export chronology
- **SurfaceIds:** ["Engagement record", "Client workspace"]
- **implementationProblem:** Counsel/partner review needs a portable chronology without screen-sharing the desk.
- **implementation:** Starting from Board, open Client workspace → Engagement record.  
  Click Export chronology; view download of visible chronology rows.  
  Panel remains record-only (no authorship).
- **Does not change Core Function:** Chronology is still inhabit history; export does not alter Halt or packs.
