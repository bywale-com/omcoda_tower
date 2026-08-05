/** Configuration libraries catalog — published versions feed Firm operations bind dropdowns. */

export type PackKind = "evaluation" | "automation" | "engagement";
export type PackStatus = "Published" | "Draft";

export type ConfigPack = {
  id: string;
  kind: PackKind;
  name: string;
  versionId: string | null;
  status: PackStatus;
  summary: string;
};

const SEED: ConfigPack[] = [
  {
    id: "eval-alg-v2",
    kind: "evaluation",
    name: "ALG eligibility read-out",
    versionId: "eval-v2.1",
    status: "Published",
    summary: "CRS + trade-category gates against immigration reference v2.4",
  },
  {
    id: "eval-soft-v1",
    kind: "evaluation",
    name: "Soft-open screening",
    versionId: "eval-v1.3",
    status: "Published",
    summary: "Light pathway scoring for Prepared Workspace firms",
  },
  {
    id: "eval-draft",
    kind: "evaluation",
    name: "Provincial nominee draft",
    versionId: null,
    status: "Draft",
    summary: "WIP PNP cutoffs — not selectable in Bind",
  },
  {
    id: "auto-welcome",
    kind: "automation",
    name: "Welcome armer",
    versionId: "auto-v3.0",
    status: "Published",
    summary: "Trigger on import → evaluate → enroll opt-in template",
  },
  {
    id: "auto-book",
    kind: "automation",
    name: "Book armer",
    versionId: "auto-v2.2",
    status: "Published",
    summary: "Post-audit enroll when verdict = reachable",
  },
  {
    id: "auto-draft",
    kind: "automation",
    name: "Reactivation graph draft",
    versionId: null,
    status: "Draft",
    summary: "Experimental reactivation branch — draft only",
  },
  {
    id: "eng-optin",
    kind: "engagement",
    name: "Opt-in Standard",
    versionId: "eng-v4.1",
    status: "Published",
    summary: "Opt-in → nudge → meeting invite sequence",
  },
  {
    id: "eng-nudge",
    kind: "engagement",
    name: "Nudge Standard",
    versionId: "eng-v2.0",
    status: "Published",
    summary: "Nudge-heavy composite for armed firms",
  },
  {
    id: "eng-draft",
    kind: "engagement",
    name: "Re-engage composite draft",
    versionId: null,
    status: "Draft",
    summary: "New channel copy — not in Bind dropdowns",
  },
];

export function seedConfigPacks(): ConfigPack[] {
  return SEED.map((p) => ({ ...p }));
}

export function publishedPacks(kind: PackKind, packs: ConfigPack[]): ConfigPack[] {
  return packs.filter((p) => p.kind === kind && p.status === "Published" && p.versionId);
}

export function packLabel(p: ConfigPack): string {
  return `${p.name} (${p.versionId})`;
}

export function nextVersionId(kind: PackKind, packs: ConfigPack[]): string {
  const prefix = kind === "evaluation" ? "eval" : kind === "automation" ? "auto" : "eng";
  const nums = packs
    .filter((p) => p.kind === kind && p.versionId?.startsWith(prefix))
    .map((p) => parseFloat(p.versionId!.replace(`${prefix}-v`, "")) || 0);
  const next = (Math.max(0, ...nums) + 0.1).toFixed(1);
  return `${prefix}-v${next}`;
}

export type ConfigLibSub = "Evaluation packs" | "Automation workflows" | "Engagement templates";

export const CONFIG_LIB_SUBS: {
  id: ConfigLibSub;
  kind: PackKind;
  newLabel: string;
  navLabel: string;
}[] = [
  { id: "Evaluation packs", kind: "evaluation", newLabel: "New pack", navLabel: "Evaluation packs" },
  { id: "Automation workflows", kind: "automation", newLabel: "New workflow", navLabel: "Automations" },
  { id: "Engagement templates", kind: "engagement", newLabel: "New template", navLabel: "Agents" },
];

export function resolveConfigLibSub(label: string): ConfigLibSub | null {
  if (label === "Evaluation packs" || label === "Evaluation pack editor") return "Evaluation packs";
  if (label === "Automation workflows" || label === "Workflow canvas") return "Automation workflows";
  if (label === "Engagement templates" || label === "Agent / sequence editor")
    return "Engagement templates";
  if (label === "Configuration libraries") return "Evaluation packs";
  return null;
}
