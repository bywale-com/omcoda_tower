# Wire — Halt outreach

**Implementation:** Confirm halt (contact | firm book) · Lift / Resume  
**How:** `docs/register/how/consultant-governance.md`  
**Stand-ins:** `haltStore` · `auditTrail` (`src/app/wire/standins/`)

## Critical commits

| Control | Port call |
|---|---|
| Confirm halt | `wirePorts.haltStore.commit({ consultantId, firmId, contactId?, scope, reason? })` — audit append inside stand-in |
| Lift halt / Resume | `wirePorts.haltStore.lift(haltId)` |

## CT entry

- Plant: `ConsultantPrototypeScene.tsx` (+ `HaltRetention.haltId` on workspace)
- Ant: `ConsultantAntScene.tsx` (+ `shared.ts` HaltRetention)

## Demo ids

`src/app/wire/demoIds.ts` — consultant / firm; contact = active client id.

## Notes

Scene hydrates `listActive(firmId)` on mount (dual-write with UI state). No real DB.
