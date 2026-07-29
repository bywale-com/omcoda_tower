import {
  AUTOMATION_DATA_CLASSES,
  resolveSelectedScopeIds,
  type AutomationDataClassId,
  type DataClassScopeSelection,
  type ManualTriggerConfig,
} from "./automationEvents";
import { getDataClassNameOptions } from "./automationDataClassNames";
import { getClientDetail, getClientMeta, type ClientDetail } from "./clients";
import { getContact } from "./contacts";
import { getImport } from "./imports";
import { getInitialAudits } from "./audits";
import { getAutomationConstant } from "./automationConstants";

/** One enrolled entity per run item — keyed by data class id. */
export type AutomationPullItem = Partial<Record<AutomationDataClassId, Record<string, unknown>>>;

export type AutomationPullOutput = {
  items: AutomationPullItem[];
  itemCount: number;
  pulledAt: string;
};

function parseCanadianWorkMonths(profile: Record<string, string>): number | null {
  const raw = profile["Canadian work exp."];
  if (!raw) return null;
  const match = raw.match(/(\d+(?:\.\d+)?)\s*month/i);
  if (match) return Number.parseFloat(match[1]);
  const yearMatch = raw.match(/(\d+(?:\.\d+)?)\s*year/i);
  if (yearMatch) return Number.parseFloat(yearMatch[1]) * 12;
  return null;
}

function monthsToSkilledHours(months: number): number {
  return Math.round((months / 12) * 1560);
}

function buildClientDataScopes(
  clientId: string,
  scopeIds: string[],
): Record<string, unknown> {
  const detail: ClientDetail = getClientDetail(clientId);
  const meta = getClientMeta(clientId);
  const scopes: Record<string, unknown> = {};

  for (const scopeId of scopeIds) {
    switch (scopeId) {
      case "information":
        scopes.information = {
          client_id: detail.id,
          name: detail.name,
          initials: detail.initials,
          pathway: detail.pathway,
          status: detail.status,
          status_label: detail.statusLabel,
          added_date: detail.addedDate,
          days_in_system: detail.daysInSystem,
          billing_ref: detail.billingRef,
          narrative: detail.narrative,
          profile: detail.profile,
          opted_in: meta?.optedIn ?? false,
          canadian_work_experience_months: parseCanadianWorkMonths(detail.profile),
          canadian_skilled_hours: (() => {
            const months = parseCanadianWorkMonths(detail.profile);
            return months != null ? monthsToSkilledHours(months) : null;
          })(),
          eca_status: detail.eligibility.eca_status,
          ee_profile_exists: detail.eligibility.ee_profile_exists,
          ee_profile_last_updated: detail.eligibility.ee_profile_last_updated,
          foreign_work_years: detail.eligibility.foreign_work_years,
          foreign_trade_hours: detail.eligibility.foreign_trade_hours,
          has_qualifying_job_offer: detail.eligibility.has_qualifying_job_offer,
          has_trade_certificate: detail.eligibility.has_trade_certificate,
          has_ontario_job_offer: detail.eligibility.has_ontario_job_offer,
          oinp_student_context: detail.eligibility.oinp_student_context,
        };
        break;
      case "crs":
        scopes.crs = {
          score: detail.crs,
          work_permit_expiry: detail.workPermitExpiry,
          work_permit_warn: detail.workPermitWarn,
          teer_category: detail.profile["TEER category"] ?? null,
          language_clb: detail.profile["Language"] ?? null,
          province: detail.profile["Province"] ?? null,
          noc: detail.profile["NOC"] ?? null,
          eca_status: detail.eligibility.eca_status,
          ee_profile_exists: detail.eligibility.ee_profile_exists,
          ee_profile_last_updated: detail.eligibility.ee_profile_last_updated,
          foreign_work_years: detail.eligibility.foreign_work_years,
        };
        break;
      case "history":
        scopes.history = {
          nudges: detail.nudges.map((nudge) => ({
            id: nudge.id,
            date: nudge.date,
            trigger: nudge.trigger,
            channels: nudge.channel,
            success: nudge.success,
            next_step: nudge.nextStep,
          })),
        };
        break;
      case "activity":
        scopes.activity = {
          activation_logs: detail.activationLogs,
        };
        break;
      case "engagement":
        scopes.engagement = meta
          ? {
              reactivation_phase: meta.reactivationPhase,
              nudge_active: meta.nudge.active,
              nudge_label: meta.nudge.label ?? null,
              phase_snapshot: meta.phaseSnapshot ?? null,
            }
          : null;
        break;
    }
  }

  return scopes;
}

function buildContactScopes(contactId: string, scopeIds: string[]): Record<string, unknown> {
  const contact = getContact(contactId);
  if (!contact) return {};
  const scopes: Record<string, unknown> = {};

  for (const scopeId of scopeIds) {
    switch (scopeId) {
      case "identity":
        scopes.identity = {
          contact_id: contact.id,
          name: contact.name,
          phone: contact.phone,
          client_id: contact.clientId ?? null,
        };
        break;
      case "sequences":
        scopes.sequences = {
          indicator: contact.indicator,
        };
        break;
      case "imports":
        scopes.imports = { linked: false };
        break;
      case "indicators":
        scopes.indicators = {
          sequenced: contact.indicator === "sequenced",
          silenced: contact.indicator === "silenced",
        };
        break;
    }
  }
  return scopes;
}

function buildImportScopes(importId: string, scopeIds: string[]): Record<string, unknown> {
  const batch = getImport(importId);
  if (!batch) return {};
  const scopes: Record<string, unknown> = {};
  for (const scopeId of scopeIds) {
    switch (scopeId) {
      case "batch":
        scopes.batch = {
          import_id: batch.id,
          label: batch.label,
          imported_at: batch.importedAt,
        };
        break;
      case "mapping":
        scopes.mapping = { columns: [] };
        break;
      case "records":
        scopes.records = { count: 0 };
        break;
    }
  }
  return scopes;
}

function buildAuditScopes(auditId: string, scopeIds: string[]): Record<string, unknown> {
  const audit = getInitialAudits().find((item) => item.id === auditId);
  if (!audit) return {};
  const scopes: Record<string, unknown> = {};
  for (const scopeId of scopeIds) {
    switch (scopeId) {
      case "records":
        scopes.records = { import_ids: audit.importIds };
        break;
      case "checks":
        scopes.checks = { enabled: audit.enabledChecks };
        break;
      case "results":
        scopes.results = {
          status: audit.status,
          gate_steps: audit.gateSteps,
        };
        break;
    }
  }
  return scopes;
}

function buildConstantScopes(constantKey: string, scopeIds: string[]): Record<string, unknown> {
  const constant = getAutomationConstant(constantKey);
  if (!constant) return {};
  const scopes: Record<string, unknown> = {};
  for (const scopeId of scopeIds) {
    scopes[scopeId] = {
      key: constant.key,
      label: constant.label,
      type: constant.type,
      value: constant.value,
    };
  }
  return scopes;
}

function resolveEntityIds(
  classId: AutomationDataClassId,
  config: ManualTriggerConfig,
): { id: string; name: string }[] {
  const nameFilter = config.filters?.[classId]?.name;
  const options = getDataClassNameOptions(classId);
  if (!nameFilter || nameFilter.mode === "all") return options;
  return options.filter((option) => nameFilter.values.includes(option.name));
}

/**
 * Build run output from enrollment config.
 * Each item is one entity; only selected classes + scopes are included.
 */
export function buildManualPullOutput(config: ManualTriggerConfig): AutomationPullOutput {
  const items: AutomationPullItem[] = [];

  for (const dataClass of AUTOMATION_DATA_CLASSES) {
    const selection = config.scopes[dataClass.id];
    if (!selection) continue;
    if (selection.mode === "partial" && selection.scopeIds.length === 0) continue;

    const scopeIds = resolveSelectedScopeIds(dataClass, selection);
    const entities = resolveEntityIds(dataClass.id, config);

    for (const entity of entities) {
      let classPayload: Record<string, unknown> = {};

      switch (dataClass.id) {
        case "client_data":
          classPayload = buildClientDataScopes(entity.id, scopeIds);
          break;
        case "contact":
          classPayload = buildContactScopes(entity.id, scopeIds);
          break;
        case "import":
          classPayload = buildImportScopes(entity.id, scopeIds);
          break;
        case "audit":
          classPayload = buildAuditScopes(entity.id, scopeIds);
          break;
        case "constant":
          classPayload = buildConstantScopes(entity.id, scopeIds);
          break;
      }

      if (Object.keys(classPayload).length === 0) continue;

      // Merge into existing item if same entity across classes (rare); usually one class per config
      const existing = items.find((item) => {
        const block = item[dataClass.id];
        return block && JSON.stringify(block) === JSON.stringify(classPayload);
      });
      if (existing) {
        existing[dataClass.id] = classPayload;
      } else {
        items.push({ [dataClass.id]: classPayload });
      }
    }
  }

  return {
    items,
    itemCount: items.length,
    pulledAt: new Date().toISOString(),
  };
}

/** Flat path read for conditions — e.g. client_data.information.canadian_skilled_hours */
export function readPullPath(items: AutomationPullItem[], path: string): unknown {
  if (!path.trim() || items.length === 0) return undefined;
  const parts = path.split(".").filter(Boolean);
  if (parts.length === 0) return undefined;

  const classId = parts[0] as AutomationDataClassId;
  const item = items.find((entry) => entry[classId] != null);
  if (!item) return undefined;

  let current: unknown = item[classId];
  for (let i = 1; i < parts.length; i++) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[parts[i]];
  }
  return current;
}
