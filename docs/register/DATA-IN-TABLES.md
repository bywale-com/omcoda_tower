# Data in tables — standing law

**Seat:** Founder → implementer (and Systems Analyst when the store is missing).  
**When:** 2026-08-19 18:44 UTC.  
**Flag:** [`PHASE-TWO-LOG.md`](./PHASE-TWO-LOG.md) **15:43 UTC** — do not overwrite.  
**Prior:** 2026-08-16 18:53 — seed the tables; do not seed data in the app. [`IMPLEMENTER-FACE-PASS.md`](./IMPLEMENTER-FACE-PASS.md). Table-first: [`system-map/BUILD-system-map-v2-table-inventory.md`](./system-map/BUILD-system-map-v2-table-inventory.md).  
**Cloud agents read this from** repo-root [`AGENTS.md`](../../AGENTS.md).

---

## The law

**Records that show inside a module come from tables.** A reasonable count of rows in the requisite tables — not a thick fake world, not an empty module.

**Never hard-code data into the app.** Not in a React table. Not in a painted empty-state that pretends there are people. Not a name, a tag, a verdict, a run, a firm, a contact baked into the component so the screen looks full.

When we **mint** a table or a field (and as we go, where that mint is already stood up): **populate the seed** (`supabase/seeds/`) so the module that reads it has records. The desk shows what the query returns.

---

## If the table or field is missing

Chrome can be specified. PM specifies the face. That is not a store.

If the **table** is missing, or the **field** is missing, or it is unspecified what to write — that is a **Systems Analyst** problem. Name it. **Do not build** until SA has ascribed what the row is, so you know what to do.

Do not invent the table in the SPA to finish the plate. Do not fill the plate with hard-coded rows while you wait.

---

## Where data lives

| Lives here | Does not live here |
|------------|--------------------|
| Postgres tables · `supabase/migrations/` · `supabase/seeds/` | `src/app/**` UI components |
| Walker / wire **reading** those rows | Arrays of demo people inside a module |
| Stand-in ports only as a mirror of that shape when the wire is off | A second invented catalog in the client |

---

## Do not

- Hard-code data into the app.
- Mint a table from a picture.
- Recut 015. Overwrite 15:43. Plant.
- Paint Marita Patel (or anyone) into the SPA so Contacts is not empty.
