# V2 backlog — Automations free-form graph walk

**v1 (shipped):** runtime recognizes and walks the **validated shape** only:

`Trigger → Constants → Conditions/Branch → Rules → Action → Exit`

The canvas is the editor for that shape’s parameters. Every drawable workflow in v1 is guaranteed runnable by construction when it follows this pipeline.

## Deferred to v2

- Walk **arbitrary** graphs (cycles, parallel fan-out/fan-in, multiple Actions, orphan islands).
- Full server-side evaluation of If/Rule expressions with the same fidelity as the client `resolveUpstreamInput` preview (v1 uses eligibility/context heuristics for Branch).
- Multi-trigger workflows with independent start nodes and join semantics.
- Visual debugger that steps node-by-node against live `workflow_run.node_status` mid-flight.
- Compiling non-validated shapes into a safe intermediate representation before execute.

Until then: reject or no-op graphs that are not validated shape (walker returns an error on `workflow_run`).
