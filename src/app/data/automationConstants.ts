/** Industry-scoped policy constants used by conditions (criteria). */

export type AutomationConstantType = "number" | "string" | "boolean" | "list";

export type AutomationConstantIndustryId =
  | "immigration"
  | "legal"
  | "financial_services";

export type AutomationConstantDefinition = {
  key: string;
  label: string;
  type: AutomationConstantType;
  value: number | string | boolean;
  description?: string;
  industry: AutomationConstantIndustryId;
  /** Matrix / source question ids when known */
  sourceRefs?: string[];
};

export type AutomationConstantIndustry = {
  id: AutomationConstantIndustryId;
  label: string;
  description: string;
};

export const AUTOMATION_CONSTANT_INDUSTRIES: AutomationConstantIndustry[] = [
  {
    id: "immigration",
    label: "Immigration",
    description: "Express Entry, CEC, FSW, FST, CRS, OINP, and IRCC criteria",
  },
  {
    id: "legal",
    label: "Legal",
    description: "Legal practice thresholds and filing criteria",
  },
  {
    id: "financial_services",
    label: "Financial services & insurance",
    description: "Financial services and insurance policy criteria",
  },
];

/** Full immigration criteria catalog mined from the eligibility matrix (Table D). */
const IMMIGRATION_CONSTANTS: AutomationConstantDefinition[] = [
  {
    key: "cec.min_hours",
    label: "CEC minimum skilled hours",
    type: "number",
    value: 1560,
    industry: "immigration",
    description: "Minimum Canadian skilled work hours within the eligibility window",
    sourceRefs: ["Q-06", "Q-08"],
  },
  {
    key: "cec.min_years",
    label: "CEC minimum skilled years",
    type: "number",
    value: 1,
    industry: "immigration",
    sourceRefs: ["Q-06"],
  },
  {
    key: "cec.window_years",
    label: "CEC eligibility window (years)",
    type: "number",
    value: 3,
    industry: "immigration",
    sourceRefs: ["Q-06", "Q-08", "Q-11"],
  },
  {
    key: "cec.allowed_teers",
    label: "CEC allowed TEER categories",
    type: "list",
    value: "0,1,2,3",
    industry: "immigration",
    sourceRefs: ["Q-06", "Q-07", "Q-15"],
  },
  {
    key: "cec.exclude_student_work_during_enrollment",
    label: "CEC exclude student work during enrollment",
    type: "boolean",
    value: true,
    industry: "immigration",
    sourceRefs: ["Q-09"],
  },
  {
    key: "cec.excluded_statuses",
    label: "CEC excluded statuses",
    type: "list",
    value: "visitor, no-status",
    industry: "immigration",
    sourceRefs: ["Q-02"],
  },
  {
    key: "cec.min_clb_all",
    label: "CEC minimum CLB (all abilities)",
    type: "number",
    value: 7,
    industry: "immigration",
    sourceRefs: ["Q-18"],
  },
  {
    key: "study.max_hours_per_week_during_study",
    label: "Max work hours / week during study",
    type: "number",
    value: 20,
    industry: "immigration",
    sourceRefs: ["Q-02"],
  },
  {
    key: "fsw.min_foreign_years",
    label: "FSW minimum foreign work years",
    type: "number",
    value: 1,
    industry: "immigration",
    sourceRefs: ["Q-13"],
  },
  {
    key: "fsw.eligibility_window_years",
    label: "FSW eligibility window (years)",
    type: "number",
    value: 10,
    industry: "immigration",
    sourceRefs: ["Q-13", "Q-14"],
  },
  {
    key: "fsw.grid_min_points",
    label: "FSW grid minimum points",
    type: "number",
    value: 67,
    industry: "immigration",
    sourceRefs: ["B-03", "R-FSW-01"],
  },
  {
    key: "fsw.allowed_teers",
    label: "FSW allowed TEER categories",
    type: "list",
    value: "0,1,2,3",
    industry: "immigration",
    sourceRefs: ["Q-13", "Q-15"],
  },
  {
    key: "fsw.min_education",
    label: "FSW minimum education",
    type: "string",
    value: "secondary diploma",
    industry: "immigration",
    sourceRefs: ["Q-22"],
  },
  {
    key: "fsw.min_clb_all",
    label: "FSW minimum CLB (all abilities)",
    type: "number",
    value: 7,
    industry: "immigration",
    sourceRefs: ["Q-18"],
  },
  {
    key: "crs.foreign_exp_points_window_years",
    label: "CRS foreign experience points window (years)",
    type: "number",
    value: 5,
    industry: "immigration",
    sourceRefs: ["Q-14"],
  },
  {
    key: "crs.foreign_exp_max_points",
    label: "CRS foreign experience max points",
    type: "number",
    value: 50,
    industry: "immigration",
    description: "Max points at 3+ years foreign skilled work",
    sourceRefs: ["Q-13"],
  },
  {
    key: "crs.french_bilingual_max_bonus",
    label: "CRS French bilingual max bonus",
    type: "number",
    value: 50,
    industry: "immigration",
    sourceRefs: ["Q-20"],
  },
  {
    key: "crs.sibling_bonus_points",
    label: "CRS sibling bonus points",
    type: "number",
    value: 15,
    industry: "immigration",
    sourceRefs: ["Q-34"],
  },
  {
    key: "crs.lmia_teer_01_bonus",
    label: "CRS LMIA TEER 0/1 bonus",
    type: "number",
    value: 200,
    industry: "immigration",
    sourceRefs: ["Q-25", "Q-30"],
  },
  {
    key: "crs.lmia_teer_23_bonus",
    label: "CRS LMIA TEER 2/3 bonus",
    type: "number",
    value: 50,
    industry: "immigration",
    sourceRefs: ["Q-25", "Q-30"],
  },
  {
    key: "fst.min_foreign_trade_hours",
    label: "FST minimum foreign trade hours",
    type: "number",
    value: 720,
    industry: "immigration",
    sourceRefs: ["Q-16"],
  },
  {
    key: "fst.foreign_trade_window_years",
    label: "FST foreign trade window (years)",
    type: "number",
    value: 5,
    industry: "immigration",
    sourceRefs: ["Q-16"],
  },
  {
    key: "fst.min_clb_listening_reading",
    label: "FST minimum CLB listening / reading",
    type: "number",
    value: 5,
    industry: "immigration",
    sourceRefs: ["Q-18"],
  },
  {
    key: "fst.min_clb_speaking_writing",
    label: "FST minimum CLB speaking / writing",
    type: "number",
    value: 4,
    industry: "immigration",
    sourceRefs: ["Q-18"],
  },
  {
    key: "fst.requires_job_offer_OR_certificate",
    label: "FST requires job offer or certificate",
    type: "boolean",
    value: true,
    industry: "immigration",
    description: "OR gate — job offer or certificate of qualification",
    sourceRefs: ["Q-32"],
  },
  {
    key: "language.test_validity_years",
    label: "Language test validity (years)",
    type: "number",
    value: 2,
    industry: "immigration",
    sourceRefs: ["Q-19"],
  },
  {
    key: "language.retake_urgency_months",
    label: "Language retake urgency (months)",
    type: "number",
    value: 3,
    industry: "immigration",
    sourceRefs: ["Q-19"],
  },
  {
    key: "french.category_min_nclc_all",
    label: "French category minimum NCLC (all)",
    type: "number",
    value: 7,
    industry: "immigration",
    sourceRefs: ["Q-18", "Q-20"],
  },
  {
    key: "eca.validity_years",
    label: "ECA validity (years)",
    type: "number",
    value: 5,
    industry: "immigration",
    sourceRefs: ["Q-24"],
  },
  {
    key: "eca.required_for_foreign_credential",
    label: "ECA required for foreign credential",
    type: "boolean",
    value: true,
    industry: "immigration",
    sourceRefs: ["Q-23", "Q-24"],
  },
  {
    key: "profile.stale_months",
    label: "Profile stale after (months)",
    type: "number",
    value: 6,
    industry: "immigration",
    sourceRefs: ["Q-04"],
  },
  {
    key: "profile.expire_months",
    label: "Profile expires after (months)",
    type: "number",
    value: 12,
    industry: "immigration",
    sourceRefs: ["Q-04"],
  },
  {
    key: "work.fulltime_min_hours_week",
    label: "Full-time minimum hours / week",
    type: "number",
    value: 30,
    industry: "immigration",
    sourceRefs: ["Q-08", "Q-26"],
  },
  {
    key: "province.ontario",
    label: "Province · Ontario gate",
    type: "string",
    value: "ontario",
    industry: "immigration",
    sourceRefs: ["Q-05", "Q-10"],
  },
  {
    key: "province.quebec_excludes_federal_ee",
    label: "Quebec excludes federal Express Entry",
    type: "boolean",
    value: true,
    industry: "immigration",
    sourceRefs: ["Q-05"],
  },
  {
    key: "oinp.employer_min_years_operation",
    label: "OINP employer min years in operation",
    type: "number",
    value: 2,
    industry: "immigration",
    sourceRefs: ["Q-28"],
  },
  {
    key: "oinp.employer_min_ft_staff",
    label: "OINP employer min full-time staff",
    type: "number",
    value: 2,
    industry: "immigration",
    description: "Some streams require 5+",
    sourceRefs: ["Q-28"],
  },
  {
    key: "oinp.employer_min_revenue_cad",
    label: "OINP employer min revenue (CAD)",
    type: "number",
    value: 500000,
    industry: "immigration",
    sourceRefs: ["Q-28"],
  },
  {
    key: "oinp.employer_active_participation_required",
    label: "OINP employer active participation required",
    type: "boolean",
    value: true,
    industry: "immigration",
    sourceRefs: ["Q-29"],
  },
  {
    key: "oinp.employer_streams_require_offer",
    label: "OINP employer streams require job offer",
    type: "boolean",
    value: true,
    industry: "immigration",
    sourceRefs: ["Q-25"],
  },
  {
    key: "oinp.fw_allowed_teers",
    label: "OINP foreign worker allowed TEERs",
    type: "list",
    value: "0,1,2,3",
    industry: "immigration",
    sourceRefs: ["Q-27"],
  },
  {
    key: "oinp.ids_eligible_occupation_list",
    label: "OINP IDS eligible occupation list",
    type: "list",
    value: "versioned · IDS NOCs",
    industry: "immigration",
    description: "Versioned occupation list — update with IRCC/OINP releases",
    sourceRefs: ["Q-27", "Q-33"],
  },
  {
    key: "teer.ineligible",
    label: "Ineligible TEER categories",
    type: "list",
    value: "4,5",
    industry: "immigration",
    sourceRefs: ["Q-07", "Q-15", "Q-27"],
  },
  {
    key: "ee.profile_required_for_ita",
    label: "EE profile required for ITA",
    type: "boolean",
    value: true,
    industry: "immigration",
    sourceRefs: ["Q-03"],
  },
  {
    key: "ee.designated_tests_required",
    label: "EE designated language tests required",
    type: "boolean",
    value: true,
    industry: "immigration",
    sourceRefs: ["Q-17"],
  },
  {
    key: "application.pending_blocks_new_filing",
    label: "Pending application blocks new filing",
    type: "boolean",
    value: true,
    industry: "immigration",
    description: "Risk flag when another application is already pending",
    sourceRefs: ["Q-37"],
  },
  {
    key: "ircc.category_occupation_list",
    label: "IRCC category occupation list",
    type: "list",
    value: "healthcare, STEM, trades…",
    industry: "immigration",
    description: "Versioned category-based draw occupation lists",
    sourceRefs: ["Q-07", "Q-12"],
  },
  {
    key: "ircc.fst_designated_trade_noc_list",
    label: "IRCC FST designated trade NOC list",
    type: "list",
    value: "versioned · trade NOCs",
    industry: "immigration",
    sourceRefs: ["Q-16", "Q-31"],
  },
  {
    key: "score_to_clb_mapping",
    label: "Score → CLB mapping tables",
    type: "list",
    value: "IELTS / CELPIP / TEF / TCF",
    industry: "immigration",
    sourceRefs: ["Q-18"],
  },
  {
    key: "crs_education_points_table",
    label: "CRS education points table",
    type: "list",
    value: "by level + marital status",
    industry: "immigration",
    sourceRefs: ["Q-22", "Q-35"],
  },
  {
    key: "crs_spouse_points_table",
    label: "CRS spouse points table",
    type: "list",
    value: "CLB / education / work",
    industry: "immigration",
    sourceRefs: ["Q-35"],
  },
  {
    key: "prevailing_wage_tables",
    label: "Prevailing wage tables",
    type: "list",
    value: "by NOC + region",
    industry: "immigration",
    sourceRefs: ["Q-26"],
  },
  {
    key: "draw.latest_crs_cutoff",
    label: "Latest CRS draw cutoff",
    type: "number",
    value: 524,
    industry: "immigration",
    description: "External — update after each IRCC draw",
    sourceRefs: ["Q-21", "Q-36"],
  },
  {
    key: "draw.active_category_streams",
    label: "Active category draw streams",
    type: "list",
    value: "general, french, healthcare, STEM, trades…",
    industry: "immigration",
    description: "External — update with active IRCC category streams",
    sourceRefs: ["Q-12", "B-09"],
  },
];

/** Placeholder industries — empty until criteria are authored. */
const LEGAL_CONSTANTS: AutomationConstantDefinition[] = [];
const FINANCIAL_CONSTANTS: AutomationConstantDefinition[] = [];

export const AUTOMATION_SYSTEM_CONSTANTS: AutomationConstantDefinition[] = [
  ...IMMIGRATION_CONSTANTS,
  ...LEGAL_CONSTANTS,
  ...FINANCIAL_CONSTANTS,
];

export function getAutomationConstantIndustry(
  id: string,
): AutomationConstantIndustry | undefined {
  return AUTOMATION_CONSTANT_INDUSTRIES.find((item) => item.id === id);
}

export function getConstantsForIndustry(
  industryId: AutomationConstantIndustryId,
): AutomationConstantDefinition[] {
  return AUTOMATION_SYSTEM_CONSTANTS.filter((item) => item.industry === industryId);
}

export function getAutomationConstant(
  key: string,
): AutomationConstantDefinition | undefined {
  return AUTOMATION_SYSTEM_CONSTANTS.find((item) => item.key === key);
}

export function formatConstantValue(constant: AutomationConstantDefinition): string {
  if (constant.type === "boolean") return constant.value ? "true" : "false";
  return String(constant.value);
}

export function constantsIndustryTabId(industryId: AutomationConstantIndustryId): string {
  return `hub-constants-${industryId}`;
}
