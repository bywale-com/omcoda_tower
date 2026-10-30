# Tower — Intended product specification

**Contestant:** 1 — Baseline  
**Source SHA:** `c5bd617b9b1bb9fbd5d73c99da16a973594c6bd7`  
**Kind:** Specification of the *intended* product, derived only from the supplied repository (plus origin git history of that repository).  
**Not:** an implementation plan, a seat prompt, or a claim that the running snapshot already is this product.

## How this spec is organized

| File | Contents |
|------|----------|
| `01-IDENTITY.md` | What Tower is, who it is for, bets, what it is not |
| `02-ACTORS-AND-DESKS.md` | Consultant, Operator, Contact; three desks; Hub/Register status |
| `03-CORE-LOOP-AND-SYSTEMS.md` | Application loop and the twelve systems |
| `04-CONSULTANT-DESK.md` | Firm-desk modules and consultant outcomes |
| `05-OPERATOR-DESK.md` | House-global, per-tenancy, support |
| `06-CONTACT-EXPERIENCE.md` | Firm-branded engagement, workspace seat |
| `07-AGENTS.md` | Outreach authorship |
| `08-AUTOMATIONS.md` | Operations brain |
| `09-ELIGIBILITY-AND-MOTION.md` | Rules, reference, Engine 2, meeting loop-closer |
| `10-DATA-AND-RUNTIME.md` | Tables, walker, send, auth |
| `11-CONSTRAINTS.md` | Must-nots, hard human gates, data-in-tables |
| `12-GLOSSARY.md` | Terms used consistently |
| `13-UNCERTAINTY.md` | Silences, conflicts, not-invented decisions |

Uncertainties are collected in `13-UNCERTAINTY.md` and marked inline as **UNRESOLVED**.

## Authority rules used here

1. **Founder wording on flags is not restated into a generated list.** The Agents flagship is quoted.
2. **Personas/Outcomes beat Seed’s Hub-in-firm seating.** Authorship lives on the Operator. The consultant inhabits the book and meetings.
3. **Phase Two Agents/Automations face beats Seed §5.6’s Hub peer-module sketch** for how those two modules work on the product face — while Seed’s eligibility/Engine 2 laws still stand.
4. **Story silences stay silent.** Named holes are not filled with guesses.
5. **Capability SME paper** (`docs/sme/capability/`) is not absorbed product law. Sending infrastructure exists as a module name on the Operator desk; the 158-item capability roster is not treated as specified product.
6. **Hub is not the app.** Product face = `/prototype-ant`. Hub is an advanced plant / reference for Automations Rules grain.
7. **Register methodology tooling is house-side.** The shipped firm product does not contain Register. A house-global **Register & evolution** module is named for prototype-time house work.

## Honesty about as-built

This snapshot contains a dense prototype: Ant desks, Postgres machine tables, a workflow walker, Resend/Twilio ports, OTP auth. Much of that implements fragments of this spec. The spec describes the *intended* product, not a claim of production completeness. Where live code contradicts later law, the contradiction is named.
