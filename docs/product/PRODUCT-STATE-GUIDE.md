# Product State Document — Writing Guide

**Project:** Tower  
**Document type:** Meta-guide (how to write PSDs)  
**Version:** Guide v1.0.0  
**Audience:** Product, design, engineering, AI agents extending Tower

---

## 1. What a Product State Document (PSD) is

A **Product State Document** is a **versioned, authoritative snapshot** of what the product **is right now** — not what we wish it were, not a pitch deck, not a backlog.

It answers:

1. **Where are we?** — surfaces, flows, data, mock vs live, limits  
2. **What changed?** — explicit delta from the previous PSD version  
3. **What is still open?** — decisions, debt, next expected moves (brief)

PSDs complement other docs:

| Doc type | Purpose | PSD relationship |
|----------|---------|------------------|
| **Vision / ideas** (`docs/ideas/`) | Direction, options, “why” | PSD cites vision; does not restate it |
| **Decision logs** (`docs/product/*-decisions.md`) | One topic, rationale frozen | PSD links to them; summarizes outcome only |
| **Surface state** (`console-state.md`) | Deep dive on one holon/surface | PSD summarizes + links; surface doc stays canonical for that area |
| **Product log** (`product-log-YYYY-MM-DD.md`) | Narrative diary of a build day | PSD distills durable facts; log is ephemeral color |
| **PSD** | Versioned whole-product (or scoped) truth | **Source of truth for “current state”** |

**Rule:** If engineering and product disagree, **the latest PSD wins** until a newer PSD supersedes it.

---

## 2. Versioning nomenclature

### 2.1 File naming

```
docs/product/psd/{scope}/PSD-{scope}-v{MAJOR}.{MINOR}.{PATCH}.md
```

| Part | Meaning | Examples |
|------|---------|----------|
| `{scope}` | Product slice | `tower` (whole app), `hub-audits`, `console`, `engagement` |
| `MAJOR.MINOR.PATCH` | Semantic product-state version | `0.1.0`, `0.2.0`, `1.0.0` |

**Examples:**

- `docs/product/psd/tower/PSD-tower-v0.1.0.md` — first whole-product baseline  
- `docs/product/psd/tower/PSD-tower-v0.2.0.md` — audits shipped + delta section  
- `docs/product/psd/hub-audits/PSD-hub-audits-v0.1.0.md` — scoped deep PSD (optional)

**Index file (required):** `docs/product/product-state-index.md` — table of all PSD versions, status, one-line summary.

### 2.2 Semantic version rules

Increment when **product truth** changes — not when code refactors with no user-visible effect.

| Bump | When | Examples |
|------|------|----------|
| **MAJOR** | New primary module, breaking mental model, or “we are a different product now” | Firm accounts ship; backend replaces all mocks; Hub becomes primary shell |
| **MINOR** | End-to-end capability on a surface ships or materially changes | Audit create → run → view records; CSV import writes to store |
| **PATCH** | Polish, copy, layout, bug fix, doc correction, non-behavioral tweak | Sticky table headers; checkbox color; PSD typo fix |

**Do not** bump MINOR for mock data edits alone unless the **demo story** changes (e.g. Sarah journey restructured).

### 2.3 Status labels (frontmatter)

Use exactly one:

| Status | Meaning |
|--------|---------|
| `baseline` | First PSD for this scope; no prior version |
| `current` | Latest authoritative version for this scope |
| `superseded` | Replaced by a newer PSD; kept for history |
| `draft` | Not yet indexed as current; do not cite in rules/PRs |

Only **one** PSD per scope may be `current` at a time.

### 2.4 Frontmatter (required)

Every PSD must start with YAML frontmatter:

```yaml
---
psd_id: PSD-tower-v0.2.0
scope: tower
version: 0.2.0
status: current
supersedes: PSD-tower-v0.1.0
as_of: 2026-06-19
authors:
  - Wale Omotayo
build: passing
related:
  - docs/ideas/tower-product-vision.md
  - docs/ideas/audit-module.md
  - docs/product/console-state.md
---
```

| Field | Required | Notes |
|-------|----------|-------|
| `psd_id` | Yes | Matches filename without path |
| `scope` | Yes | Same as directory name under `psd/` |
| `version` | Yes | Semver string |
| `status` | Yes | See §2.3 |
| `supersedes` | Yes | Previous `psd_id`, or `none` for baseline |
| `as_of` | Yes | Date the author verified against running app |
| `authors` | Yes | Who signed off on accuracy |
| `build` | Yes | `passing` \| `failing` \| `not-verified` |
| `related` | No | Links to vision, decisions, surface docs |

---

## 3. Markdown writing conventions

### 3.1 Tone and precision

- **Present tense** for current state: “The audit table shows reachability overlays.”  
- **Past tense** only in **Section Δ (Delta)**.  
- **No hedging** in state sections: write “Export button is non-functional” not “Export might not work yet.”  
- **Name surfaces as users see them**: “Hub → Audits”, not `AuditDetailView`.  
- **Component names** belong in **Appendix: Technical inventory**, not in narrative sections.

### 3.2 Formatting rules

| Element | Rule |
|---------|------|
| **Headings** | `#` title only; `##` major sections; `###` subsections; max depth `####` |
| **Tables** | Prefer for inventories (surfaces, checks, tab types, file maps) |
| **Lists** | Use `-` for unordered; numbered only for sequences/steps |
| **Status words** | Bold fixed vocabulary: **Implemented**, **Partial**, **Stub**, **Mock**, **Wired**, **Non-functional** |
| **Paths** | Backticks for file paths: `` `src/app/data/audits.ts` `` |
| **UI locations** | Arrow notation: `Activity bar → Hub → Audits → +` |
| **Mermaid** | Optional for loops/flows; keep diagrams ≤15 nodes |
| **Line length** | Soft wrap ~100 chars; no hard requirement |

### 3.3 Status vocabulary (use consistently)

| Term | Definition |
|------|------------|
| **Implemented** | UI exists and behaves as described for the prototype scope |
| **Partial** | Some paths work; others stub or incomplete |
| **Stub** | Visible placeholder; no real behavior |
| **Mock** | Behaves in UI but data/rules are seed/static, not persisted API |
| **Wired** | User action connects A → B in session state (may still be mock data) |
| **Non-functional** | Control visible; click does nothing or no handler |
| **Deferred** | Explicitly out of scope for this version; may return later |

### 3.4 What to avoid

- Backlog items disguised as state (“we should add export”) → put in **§9 Open** or vision docs  
- Duplicate full Console tree → link `console-state.md`  
- Commit hashes unless debugging a specific regression  

### 3.5 Screen captures

Screenshots belong in the PSD **Appendix D** (and optionally inline in §4 surface subsections). They are **evidence**, not decoration.

**Directory convention:**

```
docs/product/psd/{scope}/screenshots/
  README.md                          ← capture notes (date, theme, entry paths)
  {NN}-{surface-slug}.png            ← ordered, lowercase kebab-case
```

**Filename pattern:** `{two-digit-order}-{surface}-{optional-detail}.png`

Examples: `01-board-sarah-details.png`, `03-hub-audit-detail-records.png`

**Markdown embed** (path relative to PSD file):

```markdown
![Board — Sarah Jenkins details tab](./screenshots/01-board-sarah-details.png)
*Caption: Activity bar → Board. Default tab. Client brief + Client Data Information.*
```

**Caption rules (required under every image):**

1. **Entry path** — how to reach this screen in ≤1 line  
2. **Notable state** — tab open, nav mode, seed entity shown  
3. **Capture meta** — `(light)` / `(dark)` if not default; date only when re-captured  

**When to update screenshots:**

| PSD bump | Screenshots |
|----------|-------------|
| PATCH | Only if visual change in described UI |
| MINOR | Re-capture affected surfaces |
| MAJOR | Full re-capture recommended |

**§Δ requirement:** When screenshots change, add under `Δ.2 Changed`:

```markdown
- `[Doc]` **Appendix D screenshots** — re-captured Hub audit table (sticky header, row height).
```

**Automation:** Cursor IDE browser MCP can navigate the running dev server and save PNGs; copy from temp to `screenshots/` and commit with the PSD update.

**Do not:** embed huge full-page PNGs inline in §1 snapshot; keep executive section text-only.

---

## 4. Document structure (template)

Copy this skeleton for every new PSD. **Sections 1–8 = current state. Section Δ = delta only.**

```markdown
---
(frontmatter)
---

# {Scope} — Product State v{X.Y.Z}

> One-sentence snapshot: what this product is **today**.

---

## 0. Document control

| Field | Value |
|-------|-------|
| PSD ID | … |
| Supersedes | … |
| As of | … |
| Build | … |

---

## 1. Executive snapshot

**Product:** …  
**Primary user:** …  
**Core loop (today):** …  

### 1.1 Maturity at a glance

| Surface | Maturity | One line |
|---------|----------|----------|
| … | High / Medium / Low | … |

### 1.2 Top 3 truths right now

1. …
2. …
3. …

### 1.3 Top 3 limits right now

1. …
2. …
3. …

---

## 2. Product position

How this state aligns with vision (`tower-product-vision.md`).  
**In scope for this PSD:** …  
**Explicitly not claimed:** …

---

## 3. Shell & navigation

Activity bar modes, layout columns, what each mode shows.

### 3.1 Navigation inventory

(table)

### 3.2 Layout chrome

Console column, board sidebar, workspace, holon detail, status bar.

---

## 4. Surfaces (detailed)

One subsection per major surface. For each:

- **Purpose** (one paragraph)
- **Entry path** (clicks from cold start)
- **States** (empty, loading, error — or N/A if mock)
- **What's implemented**
- **What's mock / stub**
- **Key interactions** (numbered flows)

### 4.1 Board
### 4.2 Workspace & tabs
### 4.3 Client Data
### 4.4 Contacts
### 4.5 Hub
### 4.6 Console
(extend as needed)

---

## 5. Domain modules

Cross-cutting product concepts: Audit, Sequence, Rule engine, Import, etc.

For each module:

| Aspect | Detail |
|--------|--------|
| Purpose | |
| User-facing entry | |
| Data model (conceptual) | |
| Lifecycle / states | |
| Validation / rules | |
| UI surfaces | |
| Mock vs wired | |

---

## 6. Data & persistence

- What is seed data  
- What mutates in session  
- What persists (none / local / API)  
- Key seed files (appendix table)

---

## 7. UX & visual system (product-relevant)

Only what affects product behavior: theme, reachability overlays, tree patterns, typography scale references.  
Link to `.cursor/rules/` for engineering detail.

---

## 8. Known limitations & debt

Honest list. Tag each: `[UX]` `[Data]` `[Arch]` `[Doc]`.

---

## 9. Open decisions

Unresolved product choices. Format:

| ID | Question | Options | Blocking |
|----|----------|---------|----------|

---

## Δ. Changes since {previous version}

**Previous PSD:** `PSD-…-vX.Y.Z`  
**Comparison window:** {date} → {as_of}

### Δ.1 Added
- …

### Δ.2 Changed
- …

### Δ.3 Removed
- …

### Δ.4 Fixed
- …

### Δ.5 Deferred (explicitly not in this version)
- …

### Δ.6 Known regressions
- … (or “None verified.”)

---

## 10. Next expected state (optional, ≤½ page)

Not a roadmap essay. Bullet what **MINOR** or **MAJOR** bump would likely contain.

---

## Appendix A. Technical inventory

File paths, contexts, components — for engineering handoff.

## Appendix B. Verification checklist

Steps author ran to confirm accuracy (e.g. “Create audit from 5 imports → complete → open tab → scroll table”).

## Appendix C. Glossary

Domain terms defined once.

## Appendix D. Screen captures

PNG gallery in `./screenshots/` — see §3.5. One subsection per screen with caption (entry path + notable state).
```

---

## 5. How to write Section Δ (delta) tightly

The delta section is **the most important discipline**. Readers who saw the last PSD should read **only §Δ** plus **§1** snapshot.

### 5.1 Rules

1. **Every MINOR+ bump must have a non-empty Δ** (except baseline uses “Initial baseline”).  
2. **One bullet = one observable change** — not “improved audits” but “Audit records table: sticky header row; row padding increased.”  
3. **Tag bullets** with surface prefix: `[Hub/Audits]`, `[Shell]`, `[Docs]`.  
4. **Link PR or commit** optional in appendix, not in bullet text.  
5. **Changed vs Fixed:**  
   - **Changed** = intentional product/design behavior change  
   - **Fixed** = restored intended behavior or bug repair  
6. If nothing changed in an area, omit that area — do not write “No changes to Board.”

### 5.2 Delta bullet template

```markdown
- `[Surface/Module]` **{What}** — {before} → {after}. ({Mock|Wired|UI only})
```

**Example:**

```markdown
- `[Hub/Audits]` **Records table header** — scrolled with body → sticky header within scroll region. (UI)
- `[Hub/Audits]` **Add audit Continue** — text button → play icon; enabled when ≥1 import selected. (UI)
```

### 5.3 Baseline delta (v0.1.0)

```markdown
## Δ. Changes since none

**Previous PSD:** none — initial baseline for scope `tower`.

This document establishes the first authoritative product state snapshot. All surfaces described in §4–§6 are measured against the running prototype as of `{as_of}`.
```

---

## 6. Publication workflow

When shipping a new PSD:

1. **Verify** against running app (`npm run build` + manual checklist in Appendix B).  
2. **Write** new file with incremented version.  
3. **Update** previous PSD frontmatter: `status: superseded`.  
4. **Update** `product-state-index.md`: new row, mark old as superseded.  
5. **Reference** in PR description: “Updates product state to PSD-tower-v0.2.0.”  
6. **Cursor rules** (optional): add one line to relevant rule pointing to current PSD id.

**Frequency guidance:**

| Trigger | Action |
|---------|--------|
| End of meaningful build week | PATCH or MINOR |
| New module E2E in UI | MINOR |
| Strategy / module boundary shift | MAJOR |
| Typo in PSD only | PATCH the PSD file; version bump optional |

---

## 7. Scoped PSDs vs whole-product PSDs

| Approach | When |
|----------|------|
| **Whole-product** (`PSD-tower-v*`) | Default; always maintain |
| **Scoped** (`PSD-hub-audits-v*`) | Module is large enough that tower PSD would duplicate 20+ pages |

Scoped PSDs must include in frontmatter:

```yaml
parent_psd: PSD-tower-v0.2.0
```

Whole-product PSD summarizes scoped module in §5 and links to scoped PSD for depth.

---

## 8. Quality bar (review checklist)

Before marking `status: current`:

- [ ] Frontmatter complete and matches filename  
- [ ] §1 snapshot readable in < 2 minutes  
- [ ] Every nav mode in §3 has Implemented / Partial / Stub  
- [ ] Mock vs wired explicit for each major flow  
- [ ] §8 limitations include at least 5 honest items  
- [ ] §Δ complete with tagged bullets (or baseline statement)  
- [ ] Appendix B verification steps executed on `{as_of}` date  
- [ ] `product-state-index.md` updated  
- [ ] Superseded PSD status updated  

---

## 9. Example index row

```markdown
| PSD ID | Scope | Version | Status | As of | Summary |
|--------|-------|---------|--------|-------|---------|
| PSD-tower-v0.1.0 | tower | 0.1.0 | superseded | 2026-06-19 | Initial baseline: shell, Sarah journey, Hub audits alpha |
| PSD-tower-v0.2.0 | tower | 0.2.0 | current | 2026-07-01 | … |
```

---

## 10. Summary

**PSD = versioned truth + delta.**  
Use **semver filenames**, **fixed vocabulary**, **state sections for depth**, **§Δ for churn**.  
Keep vision in `docs/ideas/`; keep the PSD ruthlessly factual.

When in doubt: *Would an engineer ship the wrong thing if this sentence were wrong?* If yes, it belongs in the PSD.
