# Tower docs — front door

This is the whole-repo map for `docs/`. Everything Tower is written down under here; every major subfolder has its own `00-INDEX.md` (or `README.md`) as a local table of contents. Start with the orientation path below, then use the folder map.

---

## Orientation path (read in this order)

1. **`method/00-INDEX.md`** — the method map. Read the two portable docs it names: `method/DECISION-CONSTITUTION.md` and `method/TWO-COLUMN-SYNTHESIS.md`. This is *how we think*.
2. **`sme/DOCTRINE-sme-cto-implementation.md`** — the doctrine spine. The single most important conceptual doc; `method/` and `wiring/` both point back to it.
3. **`build-foundation/`** — *how we build*. Start at `build-foundation/README.md` and `build-foundation/00-rudiments.md`, then the enforced rules in `build-foundation/cursor-rules/*.mdc` (the rules an agent actually obeys).
4. **`register/`** — *what the app is*. Walk its subfolders via their `00-INDEX.md`: `how/`, `enrichment/`, `furnish/`, `priors/`, `weak/`.
5. **`sme/`** — *what expertise shaped it*. The SME passes: `capability/`, `implementation/` (`00-INDEX.md`), `pass2/`.
6. **`wiring/00-INDEX.md`** — *how it's connected and what's live*. Nodes in `paper-trace/`, the 67 externals in `external-models/`, and the as-built record in `wire-log/` — including **`wire-log/GO-CUTOVER.md`**, the record of the real Resend/Twilio/Postgres cutover that shipped.
7. **`product/product-state-index.md`** — current-state snapshot.

---

## Folder map

| Folder | What it is | Entry point |
|---|---|---|
| [`method/`](./method/) | Portable operating doctrine (decision constitution, two-column synthesis) — *how we think* | [`method/00-INDEX.md`](./method/00-INDEX.md) |
| [`build-foundation/`](./build-foundation/) | The build method + enforced `cursor-rules/*.mdc` — *how we build* | [`build-foundation/README.md`](./build-foundation/README.md), [`build-foundation/00-rudiments.md`](./build-foundation/00-rudiments.md) |
| [`register/`](./register/) | The Tower app definition (`how/`, `enrichment/`, `furnish/`, `priors/`, `weak/`) — *what the app is* | `register/WORLD.md`, then each subfolder's `00-INDEX.md` |
| [`sme/`](./sme/) | SME passes and the doctrine spine — *what expertise shaped it* | [`sme/DOCTRINE-sme-cto-implementation.md`](./sme/DOCTRINE-sme-cto-implementation.md) |
| [`wiring/`](./wiring/) | Wiring + cutover: nodes, externals, and the as-built `wire-log/` — *how it's connected and what's live* | [`wiring/00-INDEX.md`](./wiring/00-INDEX.md) |
| [`product/`](./product/) | Current-state snapshots, product decisions, contracts, PSD/screenshots | [`product/product-state-index.md`](./product/product-state-index.md) |
| [`ideas/`](./ideas/) | Product vision and exploratory notes | `ideas/tower-product-vision.md` |

---

## What's live (most recent milestone)

The **GO cutover shipped**: real `Resend`/`Twilio` ports, Postgres CT stores, and webhooks replaced the in-app stand-ins. The record is [`wiring/wire-log/GO-CUTOVER.md`](./wiring/wire-log/GO-CUTOVER.md); the `wire-log/` folder holds the other as-built implementation notes (login OTP, halt outreach, pool-send gates, CRM OAuth chips).

For running the app and the wired backend locally (dev server, auth/wire service, migrations/seeds), see the repo root `README.md` and `AGENTS.md`.
