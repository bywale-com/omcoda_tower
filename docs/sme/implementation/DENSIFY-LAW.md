# Implementation densify law (affordance grain)

**Full method:** [`CLICKPATH-DENSIFICATION.md`](./CLICKPATH-DENSIFICATION.md) (How Clarity grain, containment, requirement-gathering).  
**Criticality (after densify):** [`../../wiring/WIRING-CRITICAL-INTERACTION.md`](../../wiring/WIRING-CRITICAL-INTERACTION.md)

**Why:** Implementations are how committed outcomes get done. Stating them down to the control both (1) scopes wiring (silence = not load-bearing) and (2) hands the CTO per-module requirements. Not polish.

**Disposition:** Prefer **using the architecture already inside** a referenced module over inventing a new shape.
- Workflow canvas → keep the **node / DAG** shape (trigger → condition/rule → action nodes). Add node types or fields; don’t replace the canvas with a form.
- Book readiness Audits → keep **Audit run → Verdict list** (reachable / partial / unreachable). Add check classes inside the run; don’t invent a parallel “validator” module.
- Bind packs → keep **firm-bind index → Bind packs modal → published-only version dropdowns → Bind**.
- Configuration libraries → keep **catalog → editor → Publish version**.

**Grammar**
- **Person acting** (Operator · Consultant · Contact): click-path language only — `click`, `select`, `type`, `confirm`, `hover`, plus the named control. Never “ops runs…”.
- **View-only:** say `view` / chips / rows. Do not invent initiate buttons for autonomous backend.
- **In-app:** grain to the control; name the entity that writes state and the in-app surface that reads it.
- **Past the app edge** (Meta, ESP, Stripe, IRCC, carrier…): stop inventing their UI. State **intent** — what the person would like to achieve there. CTO / capability SME later return the real envelope.
- Prefer existing module shapes; do not invent modules absent from `00-SURFACE-VOCAB.md`.

**Register:** After editing markdown, run `scripts/sync-sme-from-docs.py` and `scripts/sync-capability-sme-from-docs.py` so twins update.
