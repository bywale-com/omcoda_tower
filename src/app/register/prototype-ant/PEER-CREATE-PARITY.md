# Design translate gap — peer primary-create asymmetry

## Finding (user-reported)

Configuration libraries: Automations showed a catalog **New**; Agents and Evaluation packs did not (or Evaluation’s create was only in a crowded module header, not beside the catalog like Automations).

## Where it was dropped

| Layer | Status |
| --- | --- |
| How / Outcomes | Present — New pack / New workflow / New template expected on each catalog |
| DS-I plant (`ConfigurationLibrariesPanel`) | Present — **one** `onNew` + `subMeta.newLabel` for **all three** siblings |
| Ant thin stub (first translate) | Partial / inconsistent |
| Ant **workbench remake** (Automations/Agents synthesize) | **Drop site** |

Plant always rendered `{subMeta.newLabel}` for every library sub. The Ant workbench remake:

1. Wired Automations catalog `CatalogShell.actions` → `createAutomation()` labeled **New**
2. Left Evaluation create only on the **module header**, gated `sub === "Evaluation packs"` (not in catalog)
3. Replaced Agents catalog actions with a decorative **Templates** Tag — `onCreatePack` only synced the selected seed agent

So this was **not** missing from the get-go. It was **lost in Design-stage remake** when siblings were no longer treated as one peer set.

## Systemic class

**Peer primary-create parity (Design composition / translate):**  
When a plant (or How) gives the **same primary create door** to a sibling set (here: Evaluation packs · Automations · Agents), a Design remake must keep that door **equally discoverable in the same composition slot** for every peer. Remaking one sibling into a richer workbench must not demote or delete create for the others.

Infer from this class: any sibling catalog/index in Ant that shares a plant `newLabel` / shared New control should be audited together — not per-file.

## Operator scan (same class)

Outside Config libraries, plant primary creates (New campaign, New gap, Provision, Import, Bind, Hydrate) were present in Ant. The asymmetry was **Config libraries siblings only**.

## Prepared Workspace (separate class)

Authorize book / Accept terms used Ant `Button block` wrapping multi-line Typography → title/subtitle collided with button chrome. Plant used a custom ghost action row with explicit padding. Fix: titled action surfaces with inset, not nested text inside default Button.

## Fix in this pass

- Catalog **New pack** / **New workflow** / **New template** on all three CatalogShell headers
- Agents: local draft template create + workbench accepts `AgentDefinition` (not seed-id-only)
- Prepared: ghost action rows with 14×16 inset
