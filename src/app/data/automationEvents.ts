import type { NotionIconName } from "../icons/notion-icon-urls";

/** Micro events — data entering or changing inside Tower. */
export type DataMutationEvent = "insert" | "update" | "delete";

export type AutomationDataClassId =
  | "client_data"
  | "contact"
  | "constant"
  | "import"
  | "audit";

export type DataClassScopeSelection =
  | { mode: "all" }
  | { mode: "partial"; scopeIds: string[] };

export type EventTriggerConfig = {
  mutationEvents: DataMutationEvent[];
  scopes: Partial<Record<AutomationDataClassId, DataClassScopeSelection>>;
};

/** Manual run: pull selected data classes/scopes for enrollment. */
export type ManualNameFilter = {
  mode: "all" | "partial";
  /** Selected names when mode is partial. */
  values: string[];
};

export type ManualClassFilters = {
  name?: ManualNameFilter;
};

export type ManualTriggerConfig = {
  scopes: Partial<Record<AutomationDataClassId, DataClassScopeSelection>>;
  filters?: Partial<Record<AutomationDataClassId, ManualClassFilters>>;
};

export const DATA_MUTATION_EVENTS: {
  id: DataMutationEvent;
  label: string;
  description: string;
}[] = [
  { id: "insert", label: "Insert", description: "New data enters Tower" },
  { id: "update", label: "Update", description: "Existing data is changed" },
  { id: "delete", label: "Delete", description: "Data is removed from Tower" },
];

export type AutomationDataClass = {
  id: AutomationDataClassId;
  label: string;
  description: string;
  icon: NotionIconName;
  scopes: { id: string; label: string }[];
};

export const AUTOMATION_DATA_CLASSES: AutomationDataClass[] = [
  {
    id: "client_data",
    label: "Client data",
    description: "Client records and workspace surfaces",
    icon: "people",
    scopes: [
      { id: "information", label: "Information" },
      { id: "history", label: "History" },
      { id: "activity", label: "Activity" },
      { id: "engagement", label: "Engagement" },
      { id: "crs", label: "CRS" },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    description: "Directory contacts and sequencing state",
    icon: "user",
    scopes: [
      { id: "identity", label: "Identity" },
      { id: "sequences", label: "Sequences" },
      { id: "imports", label: "Import links" },
      { id: "indicators", label: "Indicators" },
    ],
  },
  {
    id: "constant",
    label: "Constants",
    description: "System and client constants",
    icon: "gear",
    scopes: [
      { id: "system", label: "System constants" },
      { id: "client", label: "Client constants" },
      { id: "workflow", label: "Workflow constants" },
    ],
  },
  {
    id: "import",
    label: "Import",
    description: "Contact import batches",
    icon: "document",
    scopes: [
      { id: "batch", label: "Import batch" },
      { id: "mapping", label: "Column mapping" },
      { id: "records", label: "Records" },
    ],
  },
  {
    id: "audit",
    label: "Audit",
    description: "Data quality audits",
    icon: "magnifying-glass",
    scopes: [
      { id: "records", label: "Records" },
      { id: "checks", label: "Gate checks" },
      { id: "results", label: "Results" },
    ],
  },
];

export function emptyEventTriggerConfig(): EventTriggerConfig {
  return { mutationEvents: [], scopes: {} };
}

export function emptyManualTriggerConfig(): ManualTriggerConfig {
  return { scopes: {}, filters: {} };
}

function hasConfiguredScopes(
  scopes: Partial<Record<AutomationDataClassId, DataClassScopeSelection>>,
): boolean {
  return Object.values(scopes).some((selection) => {
    if (!selection) return false;
    if (selection.mode === "all") return true;
    return selection.scopeIds.length > 0;
  });
}

export function isEventTriggerConfigured(config?: EventTriggerConfig): boolean {
  if (!config) return false;
  if (config.mutationEvents.length === 0) return false;
  return hasConfiguredScopes(config.scopes);
}

export function isManualTriggerConfigured(config?: ManualTriggerConfig): boolean {
  if (!config) return false;
  return hasConfiguredScopes(config.scopes);
}

function formatMutationEvents(events: DataMutationEvent[]): string {
  const labels = DATA_MUTATION_EVENTS.filter((item) => events.includes(item.id)).map(
    (item) => item.label,
  );
  return labels.join(", ");
}

function formatClassScope(
  dataClass: AutomationDataClass,
  selection: DataClassScopeSelection,
): string {
  if (selection.mode === "all") {
    return dataClass.label;
  }
  const scopeLabels = dataClass.scopes
    .filter((scope) => selection.scopeIds.includes(scope.id))
    .map((scope) => scope.label);
  if (scopeLabels.length === 0) {
    return dataClass.label;
  }
  if (scopeLabels.length <= 2) {
    return `${dataClass.label} · ${scopeLabels.join(", ")}`;
  }
  return `${dataClass.label} · ${scopeLabels.length} scopes`;
}

function formatScopeSummary(
  scopes: Partial<Record<AutomationDataClassId, DataClassScopeSelection>>,
): string[] {
  return AUTOMATION_DATA_CLASSES.flatMap((dataClass) => {
    const selection = scopes[dataClass.id];
    if (!selection) return [];
    if (selection.mode === "partial" && selection.scopeIds.length === 0) return [];
    return [formatClassScope(dataClass, selection)];
  });
}

export function formatEventTriggerSummary(config: EventTriggerConfig): string {
  const eventPart = formatMutationEvents(config.mutationEvents);
  const classParts = formatScopeSummary(config.scopes);
  if (!eventPart && classParts.length === 0) {
    return "Add configuration";
  }
  if (!eventPart) {
    return classParts.join(" · ");
  }
  if (classParts.length === 0) {
    return eventPart;
  }
  return `${eventPart} · ${classParts.join(" · ")}`;
}

export function formatManualTriggerSummary(config: ManualTriggerConfig): string {
  const classParts = formatScopeSummary(config.scopes);
  if (classParts.length === 0) {
    return "Add enrollment criteria";
  }
  return classParts.join(" · ");
}

/** Demo-scale enrollment pool sizes per data class (preview counts). */
export const DATA_CLASS_ENROLLMENT_SIZES: Record<AutomationDataClassId, number> = {
  client_data: 2568,
  contact: 1840,
  constant: 42,
  import: 128,
  audit: 64,
};

export type ManualEnrollmentClassRow = {
  classId: AutomationDataClassId;
  label: string;
  size: number;
  scopeSummary: string;
  hasNameFilter: boolean;
};

export function getDataClassEnrollmentSize(
  dataClass: AutomationDataClass,
  selection: DataClassScopeSelection,
  nameFilter?: ManualNameFilter,
): number {
  const base = DATA_CLASS_ENROLLMENT_SIZES[dataClass.id];
  const scoped =
    selection.mode === "all"
      ? base
      : (() => {
          const totalScopes = dataClass.scopes.length;
          if (totalScopes === 0) return base;
          return Math.max(1, Math.round((base * selection.scopeIds.length) / totalScopes));
        })();

  if (!nameFilter || nameFilter.mode === "all") {
    return scoped;
  }
  if (nameFilter.values.length === 0) {
    return 0;
  }
  return Math.min(scoped, nameFilter.values.length);
}

export function getManualEnrollmentBreakdown(
  config: ManualTriggerConfig,
): { rows: ManualEnrollmentClassRow[]; total: number } {
  const rows: ManualEnrollmentClassRow[] = [];
  for (const dataClass of AUTOMATION_DATA_CLASSES) {
    const selection = config.scopes[dataClass.id];
    if (!selection) continue;
    if (selection.mode === "partial" && selection.scopeIds.length === 0) continue;
    const nameFilter = config.filters?.[dataClass.id]?.name;
    const size = getDataClassEnrollmentSize(dataClass, selection, nameFilter);
    rows.push({
      classId: dataClass.id,
      label: dataClass.label,
      size,
      scopeSummary: formatClassScope(dataClass, selection),
      hasNameFilter: nameFilter?.mode === "partial",
    });
  }
  const total = rows.reduce((sum, row) => sum + row.size, 0);
  return { rows, total };
}

export function formatEnrollmentCount(n: number): string {
  return n.toLocaleString();
}

export function emptyManualNameFilter(): ManualNameFilter {
  return { mode: "all", values: [] };
}

export function getManualClassNameFilter(
  config: ManualTriggerConfig,
  classId: AutomationDataClassId,
): ManualNameFilter {
  return config.filters?.[classId]?.name ?? emptyManualNameFilter();
}

export function setManualClassNameFilter(
  config: ManualTriggerConfig,
  classId: AutomationDataClassId,
  nameFilter: ManualNameFilter,
): ManualTriggerConfig {
  const nextFilters = { ...config.filters };
  const classFilters = { ...nextFilters[classId] };
  const isDefault = nameFilter.mode === "all" && nameFilter.values.length === 0;
  if (isDefault) {
    delete classFilters.name;
  } else {
    classFilters.name = nameFilter;
  }
  if (Object.keys(classFilters).length === 0) {
    delete nextFilters[classId];
  } else {
    nextFilters[classId] = classFilters;
  }
  return {
    ...config,
    filters: Object.keys(nextFilters).length > 0 ? nextFilters : {},
  };
}

export function getDataClassScopeIds(dataClass: AutomationDataClass): string[] {
  return dataClass.scopes.map((scope) => scope.id);
}

export function resolveSelectedScopeIds(
  dataClass: AutomationDataClass,
  selection: DataClassScopeSelection | undefined,
): string[] {
  if (!selection) return [];
  if (selection.mode === "all") {
    return getDataClassScopeIds(dataClass);
  }
  return selection.scopeIds;
}
