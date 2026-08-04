# Implementation densify law (affordance grain)

**Why:** Implementations are how committed outcomes get done. Stating them down to the control both (1) scopes wiring (silence = not load-bearing) and (2) hands the CTO per-module requirements. Not polish.

**Disposition:** Prefer **using the architecture already inside** a referenced module over inventing a new shape.
- Workflow canvas → keep the **node / DAG** shape (trigger → condition/rule → action nodes). Add node types or fields; don’t replace the canvas with a form.
- Book readiness Audits → keep **Audit run → Verdict list** (reachable / partial / unreachable). Add check classes inside the run; don’t invent a parallel “validator” module.
- Bind packs → keep **firm-bind index → Bind packs modal → published-only version dropdowns → Bind**.
- Configuration libraries → keep **catalog → editor → Publish version**.

**Grammar**
- Initiation: name the control (`click`, `dropdown`, `segmented control`, `primary button`, `canvas node`, `checkbox`).
- View: name the chrome (`panel`, `chip`, `row`, `catalog status`).
- Never stop at “On {Module}, you can now…” without the inner affordance.
- Do not invent modules/surfaces absent from `00-SURFACE-VOCAB.md`.
- Do not chase undocumented app chrome; only densify what implementations already touch.

**Register:** After editing markdown, run `scripts/sync-sme-from-docs.py` and `scripts/sync-capability-sme-from-docs.py` so twins update.
