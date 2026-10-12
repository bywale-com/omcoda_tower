# tower-light — Tower construction vocabulary

This folder is an **inventory and coverage design**, not an application yet.

**Objective:** the smallest independently functioning teaching application that exercises Tower’s *construction vocabulary* at least once — not every Tower feature, not a Tower clone.

Domain: **ONE BIT** — a shared light that is ON or OFF. Engineering surface grows; domain does not.

## What is here

| File | Job |
|---|---|
| [`SOURCE_MANIFEST.md`](./SOURCE_MANIFEST.md) | Every listed path on `origin/main` @ `48d4511` and scan status |
| [`SYNTAX_INVENTORY.md`](./SYNTAX_INVENTORY.md) | Language, TypeScript, JSX, SQL, CSS, HTML, runtime |
| [`API_INVENTORY.md`](./API_INVENTORY.md) | Imported libraries, contracts, unused declarations |
| [`CONFIG_INVENTORY.md`](./CONFIG_INVENTORY.md) | Scripts, Vite, env, CI, architecture patterns |
| [`COVERAGE_MATRIX.md`](./COVERAGE_MATRIX.md) | Every catalogue ID → ONE BIT lesson or explicit exclusion |
| [`APPLICATION.md`](./APPLICATION.md) | Proposed teaching-app architecture (not implemented) |
| [`GAPS.md`](./GAPS.md) | What the scan could not honestly claim |
| [`evidence/`](./evidence/) | Machine-auditable JSON |
| [`tools/`](./tools/) | AST scan + inventory generator |

**Catalogue size:** 285 IDs. **Parse failures:** 0. **Do not claim 100% completeness** — see GAPS.

## Method

- Product tree scanned: `origin/main` commit `48d4511` (1081 listed files). Recon holds this folder; it does not hold Tower `src/`.
- JS/TS/TSX: TypeScript 5.8 AST (`createSourceFile`), not grep-only.
- Imports vs type-only imports distinguished.
- SQL / CSS / HTML / JSON-YAML-env scanned as text patterns.
- Third-party *implementations* in `node_modules` excluded. Observed **imports and calls** recorded.
- Repeated icons, extra Ant widgets, renamed variables: **not** new constructions.
- Semantic variations (`??` vs `||`, `map` vs `reduce`, `getCookie` vs a bare function call): **are**.

## Law for the future app

1. Coverage of distinct constructions.
2. Minimal domain (one light).
3. Observable transformations.
4. Causal tracing.
5. Incremental implementation — the app runs after every stage.
6. No dependency whose contribution cannot be demonstrated.
7. Continue from any existing local ONE BIT React work; do not discard it.
8. Do not implement until this inventory is accepted.

Related but separate: `construction/` is the long Tower Construction book (TC-0…). This folder is the **vocabulary audit** that can later sequence lessons. Do not mix school (`cois_1020`) into recon.
