# Priors — Consultant desk

**Zone:** Consultant (Board · Contacts · Meetings · Prepared · Login · Client Brief · Engagement record)  
**Count:** 42 priors  
**Purposes:** empty (`—`)

| id | title | where | kind | notes | purposes |
|---|---|---|---|---|---|
| board-view-as-client | View as Client | plant BoardPanel row ⋯ menu (sarah) | open | Unwired no-op in CT scene; Ant has no row menu | — |
| board-row-actions-menu | Client actions ⋯ | plant BoardPanel row menu | menu | Hosts Halt / Resume / View as Client; plant only | — |
| board-resume-book | Resume book | plant+Ant Board when firm book halted | commit | Inverse of Halt firm book; not named in How/Furnish | — |
| board-resume-outreach | Resume outreach | plant BoardPanel row menu when contact halted | commit | Inverse of Halt outreach; plant only | — |
| board-lift-halt | Lift halt | plant+Ant Client workspace (also Engagement record seat) | commit | Inverse of Halt; Enrichment cons-cant-04 Need + surfaceCatalog label only — no How/SME/Furnish click-path | — |
| board-halt-modal-dismiss | Halt outreach dismiss (backdrop / Cancel) | plant+Ant Halt modal | nav | Modal dismiss unnamed | — |
| board-view-in-activity | View in Activity | plant PhaseTooltip on Client row | open | Opens Engagement record; title absent from How/Furnish/Enrichment/SME | — |
| board-clients-collapse | Clients section expand / collapse | plant BoardPanel ClientsSectionHeader | toggle | Section chrome; plant only | — |
| board-tasks-collapse | Tasks section expand / collapse | plant BoardPanel TasksBody | toggle | Tasks absent from consultant How/Furnish | — |
| board-task-row | Task row open | plant BoardPanel TaskRow | open | onTaskClick noop in CT scene | — |
| board-task-status | Task status toggle | plant BoardPanel TaskStatusToggle | commit | Completes/reopens task; not latticed | — |
| board-holon-inspect | Inspect holons (logo) | plant ActivityBarHeader | toggle | CT/docs tooling on consultant Board | — |
| board-console-toggle | Console | plant ActivityBarHeader | toggle | Wired to noop onToggleConsole in CT scene | — |
| board-more-views | More views menu | plant ActivityBarHeader | menu | Opens overflow nav | — |
| board-more-clients | More views → Clients | plant ActivityBarHeader more menu | nav | Unwired stub id | — |
| board-more-account | More views → Account | plant ActivityBarHeader more menu | nav | Unwired stub id | — |
| board-more-settings | More views → Settings | plant ActivityBarHeader more menu | nav | Unwired stub id | — |
| board-list-workspace-resize | Pane resize (Board/Contacts list ↔ workspace) | Ant BoardModule + ContactsModule Splitter | resize | Ant only; layout chrome unnamed | — |
| contacts-search | Search contacts | Ant ContactsModule Input.Search | open | Plant contacts list has no search; Ant mislabels Surface as Board search | — |
| contacts-add-contact | Add contact | plant ContactsSectionHeader + | commit | Stub button (no handler) | — |
| contacts-sort-contacts | Sort contacts | plant ContactsSectionHeader sort | toggle | Stub button (no handler) | — |
| contacts-add-import | Add import | plant ImportsSectionHeader + | commit | Stub button (no handler) | — |
| contacts-sort-imports | Sort imports | plant ImportsSectionHeader sort | toggle | Stub button (no handler) | — |
| meetings-empty-demo | Empty state / Show booked | plant+Ant Meetings header | toggle | CT demo flipper; lattice names empty-state copy, not this control | — |
| meetings-brief-close | Close / toggle Live brief | plant MeetingsModule Live brief button | nav | Open path latticed; dismiss/toggle-off unnamed | — |
| meetings-list-detail-resize | Pane resize (Meetings list ↔ detail) | Ant MeetingsModule Splitter | resize | Ant only | — |
| prepared-modal-close | Close Authorize / Accept modal | plant+Ant Prepared modals (× / Cancel / backdrop) | nav | Dismiss chrome unnamed | — |
| login-change-email | Change email | plant+Ant Login verify step | nav | Returns to email step; not in How/Furnish | — |
| brief-open-client-data | Open Client Data in new tab | plant ClientView DataPanel (Client Brief) | open | External-link control; not in lattice | — |
| ac-client-data-information | Client Data → Information tab | plant ClientDataContent (Brief + Engagement record mounts) | tab | Product holon tab; not consultant How/Furnish | — |
| ac-client-data-history | Client Data → History tab | plant ClientDataContent (Brief + Engagement record mounts) | tab | Product holon tab; not consultant How/Furnish | — |
| ac-crs-history-scrub | CRS History scrubber | plant ClientDataContent History tab | toggle | Scrub index on CRS chart; plant only | — |
| ac-show-reasoning | Show / Hide reasoning | plant JourneyTab ReasoningToggle | toggle | Plant only | — |
| ac-inspector-tabs | Node inspector Overview / Metadata tabs | plant EngagementNodePanel | tab | Plant only | — |
| ac-inspector-close | Close node inspector | plant EngagementNodePanel | nav | Plant only | — |
| ac-inspector-prev-next | Node inspector Prev / Next | plant EngagementNodePanel | nav | Plant only | — |
| ac-zoom-in | Zoom in (day axis) | plant JourneyTab + Ant ActivityTimeline | zoom | Product gantt chrome | — |
| ac-zoom-out | Zoom out (day axis) | plant JourneyTab + Ant ActivityTimeline | zoom | Product gantt chrome | — |
| ac-scroll-today | Scroll to today / Today | plant JourneyTab Today button | scroll | Plant only | — |
| ac-pane-resize | Pane resize (list ↔ timeline) | plant JourneyTab drag handle + Ant Splitter | resize | Engagement record dual-pane | — |
| ac-gantt-segment | Timeline segment / marker click | plant JourneyTab NudgeGantt segments | open | Ant bars are tooltips only (non-click) | — |
| ac-reveal-thought | Reveal escalation thought | plant JourneyTab nudge escalation row | toggle | Plant only | — |
