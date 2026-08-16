/**
 * Reference table draft rows — modular values edited in-grid, published into reference_versions.
 */
import {
  getConstantsForIndustry,
  type AutomationConstantIndustryId,
  type AutomationConstantType,
} from "../../../data/automationConstants";

export type ReferenceDraftRow = {
  key: string;
  label: string;
  value: number | string | boolean;
  type: AutomationConstantType;
};

export function seedReferenceDraft(
  industryId: AutomationConstantIndustryId,
): ReferenceDraftRow[] {
  return getConstantsForIndustry(industryId).map((r) => ({
    key: r.key,
    label: r.label,
    value: r.value,
    type: r.type,
  }));
}

/**
 * Catalog = industry constants. Published payload overlays values by key.
 * Ship/spine tests used to publish a 1-row stub (`cec.min_hours` only); that must
 * not wipe the rest of the immigration criteria from the desk.
 */
export function draftFromPublishedOrSeed(
  industryId: AutomationConstantIndustryId,
  payload: Record<string, unknown> | null | undefined,
): ReferenceDraftRow[] {
  const catalog = seedReferenceDraft(industryId);
  const byKey = new Map(catalog.map((r) => [r.key, { ...r }]));

  const rows = payload?.rows;
  if (Array.isArray(rows)) {
    for (const raw of rows) {
      const r = raw as Record<string, unknown>;
      const key = String(r.key ?? "").trim();
      if (!key) continue;
      const type = (typeof r.type === "string" ? r.type : byKey.get(key)?.type ?? "string") as AutomationConstantType;
      const prev = byKey.get(key);
      byKey.set(key, {
        key,
        label: String(r.label ?? prev?.label ?? key),
        value: (r.value as number | string | boolean) ?? prev?.value ?? "",
        type,
      });
    }
  }

  // Preserve catalog order; append any published-only keys at the end.
  const ordered: ReferenceDraftRow[] = [];
  const seen = new Set<string>();
  for (const row of catalog) {
    const next = byKey.get(row.key);
    if (next) {
      ordered.push(next);
      seen.add(row.key);
    }
  }
  for (const [key, row] of byKey) {
    if (!seen.has(key)) ordered.push(row);
  }
  return ordered;
}

export function parseReferenceCellValue(
  type: AutomationConstantType,
  text: string,
): number | string | boolean {
  if (type === "boolean") {
    const t = text.trim().toLowerCase();
    return t === "true" || t === "1" || t === "yes";
  }
  if (type === "number") {
    const n = Number(text);
    return Number.isFinite(n) ? n : text;
  }
  return text;
}

export function formatReferenceCellValue(value: number | string | boolean): string {
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}
