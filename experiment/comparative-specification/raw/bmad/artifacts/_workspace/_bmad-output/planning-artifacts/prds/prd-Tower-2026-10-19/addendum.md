# PRD addendum — Tower

Mechanism, packet maps, and rejected alternatives. Not FR narrative.

## A. Twelve Story systems (must extract, not reinvent)

1. Acquisition (seed-capture)
2. Provision / forward-deploy
3. Commercial / hard-input
4. Tenancy & access
5. Reachability / audit
6. Consent / suppression
7. Engagement / sequencing — 7a campaign calendar · 7b attempt / channel-ownership
8. Fact-refresh / data-collection
9. Reference-currency
10. Eligibility re-evaluation
11. Signal / motion orchestration
12. Meeting / loop-closer

UI is only **control** (injects a change into an existing state) or **pane** (displays an existing state). Faceless triggers are native to the machine.

## B. SA packet map (as of origin PRs fetched 2026-10-19)

Do not treat packet number as migration number after 012.

| Packet | Intent (short) | Notes |
|--------|----------------|-------|
| 013–015 | import, house graph, **handle** | 015 = `previousWrites`; do not recut |
| 016 | event_write_set + event_test_data | landed as `017_event_test_contract.sql` in SHA docs remap; verify per SQL |
| 017 | available vs N; chainWrites; Get; mappedSlots | no new table |
| 018 | A34 audit mark | UI join; no SQL |
| 019 | If/Switch | walker + plates; no SQL |
| 020 | Operator panes | SHA has `023_operator_panes.sql` |
| 021 | Form occupancy / collectible fields | `018_collectible_fields.sql` in SHA docs remap; SHA also has later files |
| 022 | Objective met is Local event | SHA has `021_objective_local_axis.sql` |
| 023 | Failure = stop spending, keep listening | SHA has `022_pursuit_exhausted.sql` |
| 024–027 | (see PR #86 files) | inspect packet titles on #86 |
| 028 | Wait kind + occupancy | SHA has `024_wait_occupancy.sql`; FACE pickup on #96 |

**Conflict:** SHA `docs/README.md` says Engineer cuts 022 now and migrations `001`–`018`. SHA tree **also contains** `019`–`024` SQL. Specification of *stood-up* vs *docs Current* must quote SQL filenames, not the frozen README remap.

## C. PM packets on PR #96 (intended glass)

GET, Rule Outcomes/Output, Input look, Node interior/place, Test, Run, In-app Action, Add tag, If/Switch, Form class, Trigger select, Mapped box, Contact workspace/upload/uploaded-info, Shell chrome, Workspace until opt-out, Wait note + Approver, Launch terrain, Plate-read, Audit field (hardcoded, not an Action).

Plate-read five buckets live on #96 until merged.

## D. Rejected alternatives (founder-backed)

- 14:58 generated 7-item Agents list including **triggers as Agents interior** — superseded by 15:43.
- Treating Hub as the app.
- Creating agents inside Automations.
- Qualify node between campaigns.
- Channel objectives.
- Audit as two special outputs rather than the module’s write-set.
- Pipe vs this-then-that as the product question (the product is the handle).
- Demo scenery to look finished.

## E. Concern scan (drove adapt-in sections)

Compliance/messaging (CASL/consent), tenancy data, contingent commercial, integration density (CRM, Resend, Twilio, Meta), operational honesty (empty real), open-box modularity, multi-seat chrome. No WCAG/SLA numbers found — recorded as open questions, not invented NFRs.
