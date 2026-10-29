# Architecture

Locked 2026-10-29 from the factory mandate and the continuation note of the same date. Travis (`bywale-com/travis`, default branch as of 2026-10-18) is a source of machinery. It is not a runtime dependency.

## One production system

Investigation, specification, systems analysis, engineering, and verification are stages of one initiative. They are not five products and they are not automatically five cloud agents.

```text
Initiative controller
  scope, state, dependencies, budget, ownership
        |
        v
1  Investigation and product specification   Technical Product Architect
        |  packets released (explicit)
        v
2  Systems change                            Systems Analyst
        |  change specified (signed packet)
        v
3  Engineering                               Engineer
        |  candidate SHA
        v
4  Verification                              deterministic checks
        |  pass / fail / blocked, bound to that SHA
        v
5  Integration and reconciliation            controller plus the merging seat
        v
   next eligible work
```

Spend model use on reasoning, specification, and engineering. Spend ordinary software on orchestration, bookkeeping, transitions, and routine verification.

## Four levels

| Level | What it is | What an ending means |
| --- | --- | --- |
| Module | A lasting area of Tower, such as Agents | Nothing, by itself, about a capability |
| Initiative | The development of one capability | Not “the agent run finished” |
| Packet | One bounded implementation change | Not “the initiative is done” |
| Agent execution | One run that performs a stage | Not “the packet is done” |

## Roles

Three seats. No fourth seat for packet writing, looking, or controlling.

| Seat | Owns | Does not own |
| --- | --- | --- |
| Technical Product Architect | What Tower must do, why, and when a behavior is complete enough to packet | Migrations, production implementation, label dispatch |
| Systems Analyst | How the current architecture must change so the released packet is true | Unrelated modules, product invention, `src/` and `server/` plants |
| Engineer | The plant, the tests, and the record of the SHA that was checked | Product ambiguity, unapproved contracts |

The Architect investigates and writes packets in one sustained role. The Analyst receives a released packet, or a batch of released packets that share a contract, and still keeps their identities separate. The Engineer implements an authorized batch. The default is one branch per bounded change. Sharing a branch is an optimization when the packets touch the same subsystem, their dependencies are met, their requirements agree, and each acceptance check still stands alone.

## Controller

GitHub Actions is the event-driven controller. Cursor Automations, later and only after authorization, are the workers. An always-on model is not the controller.

Durable identities are git-tracked manifests. Specs and journals are Markdown. Atomic transition rules live in `.factory/controller/machine.ts`. GitHub concurrency groups are not a job queue. The first version does not add a database. The requirement is atomic, durable, idempotent transitions. If GitHub cannot provide that once the actuator is wired, a small transactional store is the next step. It is not the first step.

## Activation

The logical factory is specified now. Activation is progressive.

| Order | Piece | State in this change |
| --- | --- | --- |
| 1 | Contracts and state machine | Implemented and checked |
| 2 | Initiative, component, and packet manifests | Implemented for the pilot index |
| 3 | Architect protocol and prompt | Written, not automated |
| 4 | Analyst and Engineer contracts and prompts | Written, not automated |
| 5 | Release gates | Implemented in the controller and held on PKT-001 |
| 6 | Deterministic controller | Implemented. Dispatch workflow cannot fire on a pull request |
| 7 | Agent execution adapters | Prompts only. No Cursor automation saved |
| 8 | Verification pipeline | `npm run factory:check` for the factory. Product `verify:ship` is unchanged |
| 9 | Repair, retry, escalation | Implemented as failure classes in the state machine |
| 10 | First production run of a product packet | Not started |
| 11 | Automatic continuation | Not started |

Launch Agent is recorded as `discovered` and is not the pilot. The pilot candidate is PKT-001, the email-click attribution rule from PR #135 claim 3. It is drafted and held.

## Source of truth

| Question | Authority |
| --- | --- |
| May this stage advance? | `.factory/controller/machine.ts` applied to `.factory/manifests/` |
| What must the product do? | The initiative specification and the component contract |
| Why was that decided? | The journal and `docs/factory/decisions/` |
| What did PR #135 conclude? | That pull request, at the SHA named on the initiative |
| Is the factory allowed to boot a cloud agent? | `.factory/manifests/factory.json` `activation`. Current value: `inactive` |
