/**
 * Permanent corpus source set for System Map resolution + modularity audits.
 * v3 closes the guidelines/ gap.
 */
export const CORPUS_SOURCES = [
  { id: "seed", path: "docs/register/SEED.md", role: "product law" },
  { id: "world", path: "docs/register/WORLD.md", role: "ecosystem law" },
  { id: "systems-story", path: "docs/register/SYSTEMS-STORY.md", role: "machine substance" },
  {
    id: "systems-requirements-filled",
    path: "docs/register/SYSTEMS-REQUIREMENTS-FILLED.md",
    role: "state/transition skeleton",
  },
  {
    id: "operator-revisions",
    path: "docs/register/OPERATOR-REVISIONS.md",
    role: "founder clarifiers (e.g. attempt windows)",
  },
  {
    id: "guidelines-reactivation",
    path: "guidelines/Reactivation.md",
    role: "canonical campaign law — opt-in launch + reactivation (v3 added)",
  },
  {
    id: "guidelines-activity",
    path: "guidelines/Activity.md",
    role: "canonical campaign law (v3 added)",
  },
  {
    id: "guidelines-guidelines",
    path: "guidelines/Guidelines.md",
    role: "canonical campaign law (v3 added)",
  },
] as const;

/**
 * Existence check (v3 §C): no-login client eligibility view.
 * Prepared-workspace no-login exists (firm readiness). Client-facing read-only
 * eligibility view described in guidelines/Reactivation.md is NOT found as a
 * shipped Tower surface — deferred; do not create state.no_login_client_view yet.
 */
export const NO_LOGIN_CLIENT_VIEW_CHECK = {
  sought: "Client-facing read-only eligibility / profile view (no account)",
  foundInCode: false,
  relatedExisting: [
    "Prepared Workspace no-login (firm-facing readiness) — not the client eligibility view",
    "guidelines/Reactivation.md describes the view + open product decision",
  ],
  disposition: "deferred-pending-existence-check",
  note: "seq.reactivation_calendar references the view link as a template slot only — no backing state table asserted.",
} as const;
