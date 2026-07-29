import { getAutomationConstant } from "./automationConstants";
import type { ConditionOperator } from "./automationConditions";
import {
  MATRIX_BILLING_CATALOG,
  MATRIX_FAMILY_LABELS,
  MATRIX_RESULT_CATALOG,
  billingsForResults,
  type MatrixResultFamily,
} from "./immigrationMatrixOutcomes";
import {
  categoryResultsForNoc,
  nocIsDesignatedTrade,
  nocIsOinpIds,
  parseNocCode,
} from "./immigrationReferenceTables";

/**
 * Rules are custom evaluator nodes.
 * Authoring: toggle outcome families (pathway, gaps, ops…).
 * Under the hood: matrix R-* results + constants + input bindings.
 * Output: enriched analysis JSON (narrative, deltas, services, nudge signals).
 */

export type RuleConditionDefinition = {
  id: string;
  label: string;
  version: number;
  leftField: string;
  operator: ConditionOperator;
  constantKey: string;
  description?: string;
};

export type RuleOutcomeDefinition = {
  id: string;
  label: string;
  description: string;
  family: MatrixResultFamily;
  /** Matrix result keys this outcome asserts */
  resultIds: string[];
  defaultEnabled?: boolean;
  conditions: RuleConditionDefinition[];
};

export type RulePackDefinition = {
  id: string;
  label: string;
  description: string;
  industry: "immigration" | "legal" | "financial_services";
  version: number;
  outcomes: RuleOutcomeDefinition[];
};

export type RuleNodeConfig = {
  packId: string;
  enabledOutcomeIds: string[];
};

export type RuleCheckResult = {
  id: string;
  label: string;
  leftField: string;
  leftValue: unknown;
  operator: ConditionOperator;
  constantKey: string;
  rightValue: unknown;
  pass: boolean;
  narrative: string;
};

export type RuleDelta = {
  key: string;
  label: string;
  value: number | string;
  unit?: string;
};

export type RuleServiceRec = {
  id: string;
  label: string;
  service: string;
  reason: string;
};

export type RuleOutcomeStatus = "pass" | "fail" | "gap" | "insufficient_data";

export type RuleOutcomeResult = {
  id: string;
  label: string;
  family: MatrixResultFamily;
  resultIds: string[];
  status: RuleOutcomeStatus;
  pass: boolean;
  narrative: string;
  checks: RuleCheckResult[];
  deltas: RuleDelta[];
  /** Matrix R-* keys asserted or implicated */
  assertedResults: string[];
};

export type RuleNudgeSignal = {
  needed: boolean;
  kind: string | null;
  reason: string;
};

export type RuleReactivationSignal = {
  warranted: boolean;
  reason: string;
};

export type RuleEvaluationSummary = {
  headline: string;
  pass: boolean;
  pathwaySignals: string[];
  gapSignals: string[];
  recommendedServices: RuleServiceRec[];
  nudge: RuleNudgeSignal;
  reactivation: RuleReactivationSignal;
};

export type RuleEvaluationOutput = {
  ruleId: string;
  packId: string;
  label: string;
  version: number;
  evaluatedAt: string;
  summary: RuleEvaluationSummary;
  outcomes: RuleOutcomeResult[];
  pass: boolean;
};

export const IMMIGRATION_SERVICE_ELIGIBILITY_PACK: RulePackDefinition = {
  id: "immigration-service-eligibility",
  label: "Immigration · Service eligibility",
  description:
    "Toggle matrix outcome families. Each expands to R-* results, conditions, constants, and service recommendations.",
  industry: "immigration",
  version: 3,
  outcomes: [
    {
      id: "pathway",
      label: MATRIX_FAMILY_LABELS.pathway,
      family: "pathway",
      description: "Which immigration pathways this client can clear — pass if any one asserts.",
      resultIds: ["R-CEC-01", "R-FSW-01", "R-FST-01", "R-PNP-01", "R-PNP-02", "R-PNP-03"],
      defaultEnabled: true,
      conditions: [
        {
          id: "cec-skilled-hours",
          label: "CEC skilled hours met",
          version: 1,
          leftField: "client_data.information.canadian_skilled_hours",
          operator: "gte",
          constantKey: "cec.min_hours",
        },
        {
          id: "cec-clb",
          label: "CEC language CLB met",
          version: 1,
          leftField: "client_data.crs.language_clb",
          operator: "contains",
          constantKey: "cec.min_clb_all",
        },
        {
          id: "teer-eligible",
          label: "TEER not ineligible",
          version: 1,
          leftField: "client_data.crs.teer_category",
          operator: "not_contains",
          constantKey: "teer.ineligible",
        },
        {
          id: "fsw-foreign-years",
          label: "FSW foreign work years met",
          version: 1,
          leftField: "client_data.information.foreign_work_years",
          operator: "gte",
          constantKey: "fsw.min_foreign_years",
        },
        {
          id: "fsw-clb",
          label: "FSW language CLB met",
          version: 1,
          leftField: "client_data.crs.language_clb",
          operator: "contains",
          constantKey: "fsw.min_clb_all",
        },
        {
          id: "fst-trade-hours",
          label: "FST foreign trade hours met",
          version: 1,
          leftField: "client_data.information.foreign_trade_hours",
          operator: "gte",
          constantKey: "fst.min_foreign_trade_hours",
        },
        {
          id: "pnp-ontario-offer",
          label: "OINP Ontario job offer present",
          version: 1,
          leftField: "client_data.information.has_ontario_job_offer",
          operator: "eq",
          constantKey: "oinp.employer_streams_require_offer",
        },
        {
          id: "pnp-student-context",
          label: "OINP international student context",
          version: 1,
          leftField: "client_data.information.oinp_student_context",
          operator: "eq",
          constantKey: "ee.profile_required_for_ita",
        },
      ],
    },
    {
      id: "gaps",
      label: MATRIX_FAMILY_LABELS.gap,
      family: "gap",
      description: "Shortfalls that block or delay eligibility — hours, language, ECA, profile freshness, foreign work.",
      resultIds: ["R-GAP-01", "R-GAP-02", "R-GAP-03", "R-GAP-04", "R-GAP-05", "R-GAP-06", "R-GAP-07"],
      defaultEnabled: true,
      conditions: [
        {
          id: "hours-vs-cec",
          label: "Hours relative to CEC minimum",
          version: 1,
          leftField: "client_data.information.canadian_skilled_hours",
          operator: "gte",
          constantKey: "cec.min_hours",
        },
        {
          id: "language-present",
          label: "Language band present",
          version: 1,
          leftField: "client_data.crs.language_clb",
          operator: "exists",
          constantKey: "cec.min_clb_all",
        },
        {
          id: "foreign-work-vs-fsw",
          label: "Foreign work vs FSW minimum",
          version: 1,
          leftField: "client_data.information.foreign_work_years",
          operator: "gte",
          constantKey: "fsw.min_foreign_years",
        },
        {
          id: "eca-status",
          label: "ECA status present",
          version: 1,
          leftField: "client_data.information.eca_status",
          operator: "exists",
          constantKey: "eca.required_for_foreign_credential",
        },
        {
          id: "ee-profile-updated",
          label: "EE profile last updated present",
          version: 1,
          leftField: "client_data.information.ee_profile_last_updated",
          operator: "exists",
          constantKey: "profile.stale_months",
        },
      ],
    },
    {
      id: "ops",
      label: MATRIX_FAMILY_LABELS.ops,
      family: "ops",
      description: "Profile presence, Express Entry freshness, work-permit urgency, and filing conflict signals.",
      resultIds: ["R-OPS-01", "R-OPS-02", "R-OPS-03", "R-OPS-04", "R-OPS-05", "R-OPS-06"],
      defaultEnabled: true,
      conditions: [
        {
          id: "profile-meta-exists",
          label: "Profile metadata present",
          version: 1,
          leftField: "client_data.information.days_in_system",
          operator: "exists",
          constantKey: "profile.stale_months",
        },
        {
          id: "ee-profile-exists",
          label: "Express Entry profile exists",
          version: 1,
          leftField: "client_data.information.ee_profile_exists",
          operator: "eq",
          constantKey: "ee.profile_required_for_ita",
        },
        {
          id: "ee-profile-fresh",
          label: "EE profile last updated present",
          version: 1,
          leftField: "client_data.information.ee_profile_last_updated",
          operator: "exists",
          constantKey: "profile.expire_months",
        },
        {
          id: "work-permit-warn",
          label: "Work permit urgency",
          version: 1,
          leftField: "client_data.crs.work_permit_warn",
          operator: "eq",
          constantKey: "ee.profile_required_for_ita",
        },
        {
          id: "status-present",
          label: "Client status present",
          version: 1,
          leftField: "client_data.information.status",
          operator: "exists",
          constantKey: "application.pending_blocks_new_filing",
        },
      ],
    },
    {
      id: "category",
      label: MATRIX_FAMILY_LABELS.category,
      family: "category",
      description: "Whether the client’s NOC fits an active IRCC category-based draw stream.",
      resultIds: ["R-CAT-01", "R-CAT-02", "R-CAT-03", "R-CAT-04", "R-CAT-05"],
      defaultEnabled: true,
      conditions: [
        {
          id: "noc-present",
          label: "NOC present for category lookup",
          version: 1,
          leftField: "client_data.crs.noc",
          operator: "exists",
          constantKey: "ircc.category_occupation_list",
        },
      ],
    },
    {
      id: "draw",
      label: MATRIX_FAMILY_LABELS.draw,
      family: "draw",
      description: "Whether the client’s CRS clears the latest draw cutoff.",
      resultIds: ["R-DRAW-01"],
      defaultEnabled: true,
      conditions: [
        {
          id: "crs-vs-cutoff",
          label: "CRS at or above latest cutoff",
          version: 1,
          leftField: "client_data.crs.score",
          operator: "gte",
          constantKey: "draw.latest_crs_cutoff",
        },
      ],
    },
  ],
};

export const AUTOMATION_RULE_PACKS: RulePackDefinition[] = [
  IMMIGRATION_SERVICE_ELIGIBILITY_PACK,
];

export type RuleDefinition = RulePackDefinition;
export const AUTOMATION_RULE_CATALOG: RulePackDefinition[] = AUTOMATION_RULE_PACKS;

export function getRulePack(id: string): RulePackDefinition | undefined {
  return AUTOMATION_RULE_PACKS.find((pack) => pack.id === id);
}

export function getRuleDefinition(id: string): RulePackDefinition | undefined {
  if (
    id === "pathway-detection" ||
    id === "service-detection" ||
    id === "eligibility-check" ||
    id === "pathway" ||
    id === "gaps" ||
    id === "ops" ||
    id === "draw"
  ) {
    return IMMIGRATION_SERVICE_ELIGIBILITY_PACK;
  }
  return getRulePack(id);
}

export function emptyRuleNodeConfig(packId = IMMIGRATION_SERVICE_ELIGIBILITY_PACK.id): RuleNodeConfig {
  const pack = getRulePack(packId) ?? IMMIGRATION_SERVICE_ELIGIBILITY_PACK;
  return {
    packId: pack.id,
    enabledOutcomeIds: pack.outcomes
      .filter((outcome) => outcome.defaultEnabled)
      .map((outcome) => outcome.id),
  };
}

export function formatRuleSummary(config?: RuleNodeConfig): string {
  const pack = getRulePack(config?.packId ?? "") ?? IMMIGRATION_SERVICE_ELIGIBILITY_PACK;
  const enabled = config?.enabledOutcomeIds ?? [];
  if (enabled.length === 0) return `${pack.label} · no outcomes`;
  const labels = pack.outcomes
    .filter((outcome) => enabled.includes(outcome.id))
    .map((outcome) => outcome.label);
  if (labels.length <= 2) return labels.join(" · ");
  return `${labels.slice(0, 2).join(" · ")} +${labels.length - 2}`;
}

export function isRuleConfigured(config?: RuleNodeConfig): boolean {
  return Boolean(config?.packId && (config.enabledOutcomeIds?.length ?? 0) > 0);
}

function readPathFromInput(input: unknown, path: string): unknown {
  if (!path.trim() || input == null) return undefined;
  if (typeof input === "object" && "items" in (input as object)) {
    const pull = input as { items: unknown[] };
    if (!Array.isArray(pull.items) || pull.items.length === 0) return undefined;
    return readPathFromItem(pull.items[0], path);
  }
  return readPathFromItem(input, path);
}

function readPathFromItem(item: unknown, path: string): unknown {
  if (!path.trim() || item == null || typeof item !== "object") return undefined;
  const parts = path.split(".").filter(Boolean);
  let current: unknown = item;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function parseClbNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function parseTeerNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function compareValues(left: unknown, operator: ConditionOperator, right: unknown): boolean {
  if (operator === "exists") return left !== undefined && left !== null && left !== "";
  if (operator === "not_exists") return left === undefined || left === null || left === "";

  const lNum = typeof left === "number" ? left : Number(left);
  const rNum = typeof right === "number" ? right : Number(right);
  const bothNumeric = Number.isFinite(lNum) && Number.isFinite(rNum);

  if (bothNumeric) {
    switch (operator) {
      case "gte":
        return lNum >= rNum;
      case "gt":
        return lNum > rNum;
      case "lte":
        return lNum <= rNum;
      case "lt":
        return lNum < rNum;
      case "eq":
        return lNum === rNum;
      case "neq":
        return lNum !== rNum;
      default:
        break;
    }
  }

  if (operator === "contains" && typeof right === "number") {
    const clb = parseClbNumber(left);
    if (clb != null) return clb >= right;
  }

  if (operator === "not_contains" && typeof right === "string") {
    const teer = parseTeerNumber(left);
    const banned = right.split(",").map((part) => part.trim()).filter(Boolean);
    if (teer != null && banned.length > 0) return !banned.includes(String(teer));
  }

  const lStr = left == null ? "" : String(left).toLowerCase();
  const rStr = right == null ? "" : String(right).toLowerCase();

  switch (operator) {
    case "eq":
      return left === right || lStr === rStr;
    case "neq":
      return left !== right && lStr !== rStr;
    case "contains":
      return lStr.includes(rStr);
    case "not_contains":
      return !lStr.includes(rStr);
    default:
      return false;
  }
}

function checkNarrative(check: Omit<RuleCheckResult, "narrative">): string {
  const left = check.leftValue == null ? "missing" : String(check.leftValue);
  const right = check.rightValue == null ? "—" : String(check.rightValue);
  if (check.operator === "exists") {
    return check.pass
      ? `${check.label}: found (${left})`
      : `${check.label}: missing from input`;
  }
  if (check.operator === "gte" || check.operator === "gt" || check.operator === "lte" || check.operator === "lt") {
    return check.pass
      ? `${check.label}: ${left} ${check.operator} ${right} (${check.constantKey})`
      : `${check.label}: ${left} fails ${check.operator} ${right} (${check.constantKey})`;
  }
  return check.pass
    ? `${check.label}: pass (${left} vs ${check.constantKey}=${right})`
    : `${check.label}: fail (${left} vs ${check.constantKey}=${right})`;
}

function evaluateCondition(condition: RuleConditionDefinition, input: unknown): RuleCheckResult {
  const constant = getAutomationConstant(condition.constantKey);
  const leftValue = readPathFromInput(input, condition.leftField);
  const rightValue = constant?.value;
  const pass = compareValues(leftValue, condition.operator, rightValue);
  const base = {
    id: condition.id,
    label: condition.label,
    leftField: condition.leftField,
    leftValue,
    operator: condition.operator,
    constantKey: condition.constantKey,
    rightValue,
    pass,
  };
  return { ...base, narrative: checkNarrative(base) };
}

function monthsSince(isoDate: string | null | undefined, asOf = new Date()): number | null {
  if (!isoDate) return null;
  const then = new Date(isoDate);
  if (Number.isNaN(then.getTime())) return null;
  const months =
    (asOf.getFullYear() - then.getFullYear()) * 12 + (asOf.getMonth() - then.getMonth());
  return Math.max(0, months);
}

function constantNumber(key: string, fallback: number): number {
  const value = getAutomationConstant(key)?.value;
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function isOntarioProvince(value: unknown): boolean {
  return String(value ?? "")
    .toLowerCase()
    .includes("ontario");
}

function teerAllowed(teerRaw: unknown, allowedListKey: string): boolean {
  const teer = parseTeerNumber(teerRaw);
  if (teer == null) return false;
  const raw = getAutomationConstant(allowedListKey)?.value;
  const allowed = String(raw ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (allowed.length === 0) return teer <= 3;
  return allowed.includes(String(teer));
}

function teerNotIneligible(teerRaw: unknown): boolean {
  const teer = parseTeerNumber(teerRaw);
  if (teer == null) return false;
  const banned = String(getAutomationConstant("teer.ineligible")?.value ?? "4,5")
    .split(",")
    .map((part) => part.trim());
  return !banned.includes(String(teer));
}

function clbMeets(left: unknown, constantKey: string): boolean {
  const min = constantNumber(constantKey, 7);
  const clb = parseClbNumber(left);
  return clb != null && clb >= min;
}

function pathwayLabel(resultId: string): string {
  switch (resultId) {
    case "R-CEC-01":
      return "CEC";
    case "R-FSW-01":
      return "FSW";
    case "R-FST-01":
      return "FST";
    case "R-PNP-01":
      return "OINP Foreign Worker";
    case "R-PNP-02":
      return "OINP International Student";
    case "R-PNP-03":
      return "OINP In-Demand Skills";
    default:
      return resultId;
  }
}

function buildPathwayOutcome(
  outcome: RuleOutcomeDefinition,
  checks: RuleCheckResult[],
  input: unknown,
): RuleOutcomeResult {
  const hoursCheck = checks.find((c) => c.id === "cec-skilled-hours");
  const hours = typeof hoursCheck?.leftValue === "number" ? hoursCheck.leftValue : null;
  const minHours = constantNumber("cec.min_hours", 1560);

  const language = readPathFromInput(input, "client_data.crs.language_clb");
  const teer = readPathFromInput(input, "client_data.crs.teer_category");
  const foreignYearsRaw = readPathFromInput(input, "client_data.information.foreign_work_years");
  const foreignYears =
    typeof foreignYearsRaw === "number"
      ? foreignYearsRaw
      : foreignYearsRaw != null
        ? Number(foreignYearsRaw)
        : null;
  const tradeHoursRaw = readPathFromInput(input, "client_data.information.foreign_trade_hours");
  const tradeHours =
    typeof tradeHoursRaw === "number"
      ? tradeHoursRaw
      : tradeHoursRaw != null
        ? Number(tradeHoursRaw)
        : null;
  const hasOffer = readPathFromInput(input, "client_data.information.has_qualifying_job_offer") === true;
  const hasCert = readPathFromInput(input, "client_data.information.has_trade_certificate") === true;
  const hasOntarioOffer =
    readPathFromInput(input, "client_data.information.has_ontario_job_offer") === true;
  const studentContext =
    readPathFromInput(input, "client_data.information.oinp_student_context") === true;
  const province = readPathFromInput(input, "client_data.crs.province");
  const noc = readPathFromInput(input, "client_data.crs.noc");
  const ontario = isOntarioProvince(province);

  const cecPass =
    hours != null &&
    hours >= minHours &&
    clbMeets(language, "cec.min_clb_all") &&
    teerNotIneligible(teer);

  const fswMinYears = constantNumber("fsw.min_foreign_years", 1);
  const fswPass =
    foreignYears != null &&
    Number.isFinite(foreignYears) &&
    foreignYears >= fswMinYears &&
    clbMeets(language, "fsw.min_clb_all") &&
    teerNotIneligible(teer);

  const fstMinHours = constantNumber("fst.min_foreign_trade_hours", 720);
  const fstOfferOrCert = hasOffer || hasCert;
  const fstHoursOk = tradeHours != null && tradeHours >= fstMinHours;
  const fstPass =
    nocIsDesignatedTrade(noc) &&
    clbMeets(language, "fst.min_clb_speaking_writing") &&
    (fstHoursOk || fstOfferOrCert);

  const pnp01 =
    ontario &&
    hasOntarioOffer &&
    teerAllowed(teer, "oinp.fw_allowed_teers") &&
    clbMeets(language, "cec.min_clb_all");
  const pnp02 = ontario && studentContext && clbMeets(language, "cec.min_clb_all");
  const pnp03 = ontario && hasOntarioOffer && nocIsOinpIds(noc);

  const asserted: string[] = [];
  if (cecPass) asserted.push("R-CEC-01");
  if (fswPass) asserted.push("R-FSW-01");
  if (fstPass) asserted.push("R-FST-01");
  if (pnp01) asserted.push("R-PNP-01");
  if (pnp02) asserted.push("R-PNP-02");
  if (pnp03) asserted.push("R-PNP-03");

  const deltas: RuleDelta[] = [];
  if (hours != null) {
    const delta = hours - minHours;
    deltas.push({
      key: delta >= 0 ? "hours_above_cec_minimum" : "hours_shortfall",
      label: delta >= 0 ? "Hours above CEC minimum" : "Hours shortfall to CEC",
      value: Math.abs(delta),
      unit: "hours",
    });
  }
  if (foreignYears != null && Number.isFinite(foreignYears)) {
    const delta = foreignYears - fswMinYears;
    deltas.push({
      key: delta >= 0 ? "foreign_years_above_fsw" : "foreign_years_shortfall",
      label: delta >= 0 ? "Foreign years above FSW minimum" : "Foreign years shortfall to FSW",
      value: Math.abs(Number(delta.toFixed(1))),
      unit: "years",
    });
  }

  const pathwayPass = asserted.length > 0;
  const labels = asserted.map(pathwayLabel);
  const narrative = pathwayPass
    ? `Pathway signals: ${labels.join(", ")}. Overall pathway pass = any asserting pathway.`
    : `No pathway asserted. CEC/FSW/FST/PNP gates not cleared from available fields.`;

  return {
    id: outcome.id,
    label: outcome.label,
    family: outcome.family,
    resultIds: outcome.resultIds,
    status: pathwayPass ? "pass" : hours == null && foreignYears == null ? "insufficient_data" : "gap",
    pass: pathwayPass,
    narrative,
    checks,
    deltas,
    assertedResults: asserted,
  };
}

function buildGapsOutcome(
  outcome: RuleOutcomeDefinition,
  checks: RuleCheckResult[],
  input: unknown,
): RuleOutcomeResult {
  const hoursCheck = checks.find((c) => c.id === "hours-vs-cec");
  const langCheck = checks.find((c) => c.id === "language-present");
  const asserted: string[] = [];
  const deltas: RuleDelta[] = [];

  if (hoursCheck && !hoursCheck.pass && typeof hoursCheck.leftValue === "number") {
    asserted.push("R-GAP-01");
    const min = typeof hoursCheck.rightValue === "number" ? hoursCheck.rightValue : 1560;
    deltas.push({
      key: "hours_shortfall",
      label: "Hours shortfall to CEC",
      value: min - hoursCheck.leftValue,
      unit: "hours",
    });
  }

  const foreignYearsRaw = readPathFromInput(input, "client_data.information.foreign_work_years");
  const foreignYears =
    typeof foreignYearsRaw === "number"
      ? foreignYearsRaw
      : foreignYearsRaw != null
        ? Number(foreignYearsRaw)
        : null;
  const fswMin = constantNumber("fsw.min_foreign_years", 1);
  if (foreignYears != null && Number.isFinite(foreignYears) && foreignYears < fswMin) {
    asserted.push("R-GAP-02");
    deltas.push({
      key: "foreign_work_shortfall",
      label: "Foreign work shortfall to FSW",
      value: Number((fswMin - foreignYears).toFixed(1)),
      unit: "years",
    });
  }

  if (langCheck && !langCheck.pass) asserted.push("R-GAP-03");

  const eca = String(readPathFromInput(input, "client_data.information.eca_status") ?? "");
  if (eca === "missing" || eca === "expired") {
    asserted.push("R-GAP-04");
  }

  const updated = readPathFromInput(input, "client_data.information.ee_profile_last_updated");
  const months = monthsSince(typeof updated === "string" ? updated : null);
  const staleMonths = constantNumber("profile.stale_months", 6);
  if (months != null && months > staleMonths) {
    asserted.push("R-GAP-05");
    deltas.push({
      key: "profile_stale_months",
      label: "Months since EE profile update",
      value: months,
      unit: "months",
    });
  }

  const hasGap = asserted.length > 0;
  return {
    id: outcome.id,
    label: outcome.label,
    family: outcome.family,
    resultIds: outcome.resultIds,
    status: hasGap ? "gap" : hoursCheck?.leftValue == null && foreignYears == null ? "insufficient_data" : "pass",
    pass: !hasGap,
    narrative: hasGap
      ? `Gaps detected: ${asserted.join(", ")}. These feed gap-analysis and language/ECA services.`
      : "No hour/language/ECA/freshness/foreign-work gaps detected from available pull fields.",
    checks,
    deltas,
    assertedResults: asserted,
  };
}

function buildOpsOutcome(
  outcome: RuleOutcomeDefinition,
  checks: RuleCheckResult[],
  input: unknown,
): RuleOutcomeResult {
  const wp = checks.find((c) => c.id === "work-permit-warn");
  const meta = checks.find((c) => c.id === "profile-meta-exists");
  const asserted: string[] = [];

  if (meta?.pass) asserted.push("R-OPS-01");

  const eeExists = readPathFromInput(input, "client_data.information.ee_profile_exists");
  if (eeExists === false) {
    asserted.push("R-OPS-02");
  }

  const updated = readPathFromInput(input, "client_data.information.ee_profile_last_updated");
  const months = monthsSince(typeof updated === "string" ? updated : null);
  const expireMonths = constantNumber("profile.expire_months", 12);
  const staleMonths = constantNumber("profile.stale_months", 6);
  if (eeExists === true && (months == null || months > expireMonths || months > staleMonths)) {
    if (months != null && months > staleMonths) asserted.push("R-OPS-03");
  }
  if (eeExists === true && months == null) {
    asserted.push("R-OPS-03");
  }

  if (wp?.pass && wp.leftValue === true) {
    asserted.push("R-OPS-05");
  }

  const expiry = readPathFromInput(input, "client_data.crs.work_permit_expiry");
  const parts: string[] = [];
  if (asserted.includes("R-OPS-02")) parts.push("No Express Entry profile on file.");
  if (asserted.includes("R-OPS-03")) {
    parts.push(
      months != null
        ? `EE profile stale/expired (${months} months since update).`
        : "EE profile update date missing — treat as stale.",
    );
  }
  if (wp?.leftValue === true) {
    parts.push(
      `Work-permit urgency is on${expiry ? ` (expiry: ${String(expiry)})` : ""}. Reactivation / nudge sequences are warranted.`,
    );
  }
  if (parts.length === 0) {
    parts.push("Ops signals clear enough for monitoring; no create/stale/urgency flags.");
  }

  const blocking = asserted.includes("R-OPS-02") || asserted.includes("R-OPS-03");
  return {
    id: outcome.id,
    label: outcome.label,
    family: outcome.family,
    resultIds: outcome.resultIds,
    status: blocking ? "gap" : "pass",
    pass: !blocking,
    narrative: parts.join(" "),
    checks,
    deltas:
      months != null
        ? [
            {
              key: "ee_profile_age_months",
              label: "EE profile age",
              value: months,
              unit: "months",
            },
          ]
        : [],
    assertedResults: asserted,
  };
}

function buildCategoryOutcome(
  outcome: RuleOutcomeDefinition,
  checks: RuleCheckResult[],
  input: unknown,
): RuleOutcomeResult {
  const noc = readPathFromInput(input, "client_data.crs.noc");
  const hasNoc = noc != null && String(noc).trim() !== "";
  const asserted = categoryResultsForNoc(noc);
  const frenchMin = constantNumber("french.category_min_nclc_all", 7);
  const language = readPathFromInput(input, "client_data.crs.language_clb");
  // French category (R-CAT-05) needs NCLC — seed uses CLB string; treat CLB≥threshold as proxy when French stream enabled later
  if (hasNoc && clbMeets(language, "french.category_min_nclc_all") && frenchMin > 0) {
    // Do not auto-assert French without explicit French scores; leave for future field
  }

  return {
    id: outcome.id,
    label: outcome.label,
    family: outcome.family,
    resultIds: outcome.resultIds,
    status: !hasNoc ? "insufficient_data" : asserted.length > 0 ? "pass" : "fail",
    pass: asserted.length > 0,
    narrative: !hasNoc
      ? "NOC missing — cannot evaluate category draw fit."
      : asserted.length > 0
        ? `Category fit via versioned IRCC lists: ${asserted.join(", ")} (NOC ${parseNocCode(noc) ?? noc}).`
        : `NOC on file (${String(noc)}) — not on active category occupation lists.`,
    checks,
    deltas: [],
    assertedResults: asserted,
  };
}

function buildDrawOutcome(
  outcome: RuleOutcomeDefinition,
  checks: RuleCheckResult[],
): RuleOutcomeResult {
  const crsCheck = checks[0];
  const crs = typeof crsCheck?.leftValue === "number" ? crsCheck.leftValue : null;
  const cutoff = typeof crsCheck?.rightValue === "number" ? crsCheck.rightValue : null;
  const pass = Boolean(crsCheck?.pass);
  const deltas: RuleDelta[] = [];
  if (crs != null && cutoff != null) {
    deltas.push({
      key: pass ? "crs_above_cutoff" : "crs_shortfall",
      label: pass ? "CRS above cutoff" : "CRS shortfall to cutoff",
      value: Math.abs(crs - cutoff),
      unit: "points",
    });
  }
  return {
    id: outcome.id,
    label: outcome.label,
    family: outcome.family,
    resultIds: outcome.resultIds,
    status: pass ? "pass" : crs == null ? "insufficient_data" : "fail",
    pass,
    narrative:
      crs != null && cutoff != null
        ? pass
          ? `Draw competitive: CRS ${crs} ≥ cutoff ${cutoff}.`
          : `Not draw-competitive: CRS ${crs} is ${cutoff - crs} points below cutoff ${cutoff}.`
        : "CRS or cutoff missing from input/constants.",
    checks,
    deltas,
    assertedResults: pass ? ["R-DRAW-01"] : [],
  };
}

function enrichOutcome(
  outcome: RuleOutcomeDefinition,
  checks: RuleCheckResult[],
  input: unknown,
): RuleOutcomeResult {
  switch (outcome.family) {
    case "pathway":
      return buildPathwayOutcome(outcome, checks, input);
    case "gap":
      return buildGapsOutcome(outcome, checks, input);
    case "ops":
      return buildOpsOutcome(outcome, checks, input);
    case "category":
      return buildCategoryOutcome(outcome, checks, input);
    case "draw":
      return buildDrawOutcome(outcome, checks);
  }
}

function buildSummary(outcomes: RuleOutcomeResult[]): RuleEvaluationSummary {
  const asserted = outcomes.flatMap((o) => o.assertedResults);
  const pathwaySignals = asserted.filter(
    (id) =>
      id.startsWith("R-CEC") ||
      id.startsWith("R-FSW") ||
      id.startsWith("R-FST") ||
      id.startsWith("R-PNP"),
  );
  const gapSignals = asserted.filter((id) => id.startsWith("R-GAP"));
  const services = billingsForResults(asserted).map((billing) => ({
    id: billing.id,
    label: billing.label,
    service: billing.service,
    reason: `Triggered by ${billing.whenResultIds.filter((id) => asserted.includes(id)).join(", ")}`,
  }));

  const draw = outcomes.find((o) => o.family === "draw");
  const pathway = outcomes.find((o) => o.family === "pathway");
  if (draw && !draw.pass && pathway?.pass) {
    const b07 = MATRIX_BILLING_CATALOG.find((b) => b.id === "B-07");
    if (b07 && !services.some((s) => s.id === "B-07")) {
      services.push({
        id: b07.id,
        label: b07.label,
        service: b07.service,
        reason: "Pathway signals strong but CRS below cutoff — gap/timeline strategy",
      });
    }
  }

  const ops = outcomes.find((o) => o.family === "ops");
  const wpUrgent = ops?.assertedResults.includes("R-OPS-05") ?? false;
  const nudge: RuleNudgeSignal = wpUrgent
    ? {
        needed: true,
        kind: "work_permit_urgency",
        reason: "Work-permit warning is active — nudge / escalation sequence indicated",
      }
    : gapSignals.length > 0
      ? {
          needed: true,
          kind: "gap_followup",
          reason: `Gaps asserted (${gapSignals.join(", ")}) — follow-up nudge to close shortfalls`,
        }
      : {
          needed: false,
          kind: null,
          reason: "No urgency or gap nudge indicated from enabled outcomes",
        };

  const reactivation: RuleReactivationSignal = wpUrgent
    ? {
        warranted: true,
        reason: "Work-permit urgency + pathway context supports reactivation arming",
      }
    : {
        warranted: false,
        reason: "No reactivation signal from enabled ops outcomes",
      };

  // Pathway pass = any pathway asserts; overall still requires enabled critical families
  const critical = outcomes.filter((o) => o.family === "pathway" || o.family === "draw");
  const overallPass = critical.length > 0 && critical.every((o) => o.pass);

  const headlineParts: string[] = [];
  if (pathway?.pass) {
    const labels = pathwaySignals.map(pathwayLabel);
    headlineParts.push(
      labels.length > 0 ? `Pathway signals strong (${labels.join(", ")})` : "Pathway signals strong",
    );
  } else if (pathway) {
    headlineParts.push("Pathway not fully cleared");
  }
  if (draw && !draw.pass) headlineParts.push("not draw-competitive");
  else if (draw?.pass) headlineParts.push("draw-competitive");
  if (nudge.needed) headlineParts.push(`nudge: ${nudge.kind}`);

  return {
    headline: headlineParts.join(" · ") || "Evaluation complete",
    pass: overallPass,
    pathwaySignals,
    gapSignals,
    recommendedServices: services,
    nudge,
    reactivation,
  };
}

export function evaluateRulePack(
  config: RuleNodeConfig,
  input: unknown,
): RuleEvaluationOutput {
  const pack = getRulePack(config.packId) ?? IMMIGRATION_SERVICE_ELIGIBILITY_PACK;
  const enabled = new Set(config.enabledOutcomeIds);
  const outcomes: RuleOutcomeResult[] = [];

  for (const outcome of pack.outcomes) {
    if (!enabled.has(outcome.id)) continue;
    const checks = outcome.conditions.map((condition) => evaluateCondition(condition, input));
    outcomes.push(enrichOutcome(outcome, checks, input));
  }

  const summary = buildSummary(outcomes);

  return {
    ruleId: pack.id,
    packId: pack.id,
    label: pack.label,
    version: pack.version,
    evaluatedAt: new Date().toISOString(),
    summary,
    outcomes,
    pass: summary.pass,
  };
}

export function isRuleEvaluationOutput(value: unknown): value is RuleEvaluationOutput {
  return (
    value != null &&
    typeof value === "object" &&
    "summary" in value &&
    "outcomes" in value &&
    "packId" in value
  );
}

// Re-export matrix catalogs for UI
export { MATRIX_RESULT_CATALOG, MATRIX_BILLING_CATALOG, MATRIX_FAMILY_LABELS };
