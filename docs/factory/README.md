# Tower software factory

This is the development system that investigates, specifies, implements, and verifies Tower. It is not a customer module. The product face remains `/prototype-ant`.

PR [#135](https://github.com/bywale-com/omcoda_tower/pull/135) stays open. Its specification and journals are a read-only source. This tree does not merge or rewrite `docs/specification-pass/`.

The controller is **inactive**. Cursor Automations for these prompts are **not** activated. The label actuator is **not** wired.

## Read this order

1. [ARCHITECTURE.md](./ARCHITECTURE.md) — stages, units, authority
2. [STATE-MACHINE.md](./STATE-MACHINE.md) — the transitions the code enforces
3. [OPERATING-PROTOCOL.md](./OPERATING-PROTOCOL.md) — sessions, gates, release
4. [TRAVIS-ADOPTION.md](./TRAVIS-ADOPTION.md) — what was kept, changed, or rejected
5. [SECRETS.md](./SECRETS.md) — what activation would require, and what is not set
6. [PR-135-MAP.md](./PR-135-MAP.md) — how the existing investigation sits in this architecture

Prompts ready to paste, and not activated:

- [prompts/architect.prompt.md](./prompts/architect.prompt.md)
- [prompts/systems-analyst.prompt.md](./prompts/systems-analyst.prompt.md)
- [prompts/engineer.prompt.md](./prompts/engineer.prompt.md)

Machine state lives in `.factory/manifests/`. Human reasoning lives in `docs/factory/`. The manifests win for transitions. The Markdown wins for product requirements. Do not keep a second status story in prose.

## Check

```bash
npm run factory:check
```

That command runs the state machine, the click-attribution oracle, and the guards that keep dispatch inactive. It does not call GitHub or Cursor.

## Current handoff

[handoffs/FACTORY.md](./handoffs/FACTORY.md)
