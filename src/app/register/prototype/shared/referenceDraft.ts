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
  return getConstantsForIndustry(industryId)
    .slice(0, 8)
    .map((r) => ({
      key: r.key,
      label: r.label,
      value: r.value,
      type: r.type,
    }));
}

/** Prefer published payload.rows when present; else seed constants. */
export function draftFromPublishedOrSeed(
  industryId: AutomationConstantIndustryId,
  payload: Record<string, unknown> | null | undefined,
): ReferenceDraftRow[] {
  const rows = payload?.rows;
  if (Array.isArray(rows) && rows.length > 0) {
    return rows.map((raw) => {
      const r = raw as Record<string, unknown>;
      const type = (typeof r.type === "string" ? r.type : "string") as AutomationConstantType;
      return {
        key: String(r.key ?? ""),
        label: String(r.label ?? r.key ?? ""),
        value: (r.value as number | string | boolean) ?? "",
        type,
      };
    });
  }
  return seedReferenceDraft(industryId);
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
