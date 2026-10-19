# Off-snapshot origin evidence (inspected, not merged)

HEAD remained `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`.

This SHA’s `docs/README.md` and `PHASE-TWO-LOG.md` Current pointer say living PM packets are on PR #96 and SA ascribes on #86 / #110. Those refs were fetched for read-only inspection.

| Ref | SHA | Role |
|-----|-----|------|
| `origin pull/96/head` | `d6f3a17e4be15847502195739466c4b61fb4ac12` | PM packets / plates |
| `origin pull/86/head` | `55b658fe534bfe3b91a7d2e82dd8f8a328c01165` | SA ascribes / packets 012–028 |
| `origin pull/110/head` | `f9711319fc946cfc1273f00ba2c436a6b38c1cda` | SA Current pointer bump |

## Folded into OpenSpec (selected laws)

From #96 into `automations-orchestration` and `contact-touchpoints`:

- If / Switch as two node kinds; paths are wires; ⋯ Switch ≠ Switch node (`IF-SWITCH-PACKET.md`)
- Test data on the trigger; two doors; no Test tab (`TEST-PACKET.md`)
- Save · Run · Launch; Run now vs Launch arm (`RUN-PACKET.md`)
- Get is a node kind (`GET-PACKET.md`)
- In-app action = existing module affordance (`IN-APP-ACTION-PACKET.md`, denser Primitives)
- Extra named events: new contact; reference pack updated; contact uploaded (`PRIMITIVES.md`, `CONTACT-UPLOADED-EVENT-PACKET.md`)

## Not fully restated as OpenSpec requirements (chrome / ascribe remaining)

Packet files present on #96 and not on HEAD include, among others:

- `FORM-CLASS-PACKET.md`, `INPUT-LOOK-PACKET.md`, `MAPPED-BOX-PACKET.md`, `NODE-INTERIOR.md`, `NODE-PLACE-PACKET.md`
- `ADD-TAG-PACKET.md`, `AUDIT-FIELD-PACKET.md`, `TRIGGER-SELECT-PACKET.md`
- `WAIT-NOTE-PACKET.md`, `WAIT-NOTE-APPROVER-PACKET.md`, `WAIT-NOTE-PLATES.md`
- `CONTACT-FACE.md`, `CONTACT-UI-BLUEPRINT.md`, `CONTACT-WORKSPACE-PACKET.md`, `CONTACT-UPLOAD-PACKET.md`
- `PLATE-READ.md`, `SHELL-CHROME.md`, `SHELL-CHROME-PACKET.md`
- `RULE-OUTCOMES-PACKET.md`, `RULE-OUTPUT-PACKET.md`
- Launch terrain / staged plates / confirm-ready deferred notes

SA ascribes on #86 (packets 012–028, Get/Rule/Test/Run ascribes, operator modules) were listed, not individually inlined. Where this SHA already had migrations `018`–`024` and packets 022/023 markdown, those as-built cuts were used.

No application files were checked out from these PRs.
