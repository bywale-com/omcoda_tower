/** Get is one node kind. Module restamps the three-level selector. */

export type GetModuleId = "contacts" | "firms" | "audits" | "imports" | "agents" | "reference";

export type GetSelect = "every" | "select";

export type GetModuleSpec = {
  id: GetModuleId;
  label: string;
  /** No cascade — validated event, not a write-set we freeze. */
  silent?: boolean;
  /** Level 3 does not exist (Firms stops at firm). */
  silentClass2?: boolean;
  level1Every: string;
  level1Select: string;
  class1Label: string;
  class2Label: string | null;
  writeTable: string;
  class1Table: string;
};

export const GET_MODULES: GetModuleSpec[] = [
  {
    id: "contacts",
    label: "Contacts",
    level1Every: "Every firm",
    level1Select: "Select firm",
    class1Label: "Firm",
    class2Label: "Contact",
    writeTable: "contact_records",
    class1Table: "ct_firms",
  },
  {
    id: "firms",
    label: "Firms",
    silentClass2: true,
    level1Every: "Every firm",
    level1Select: "Select firm",
    class1Label: "Firm",
    class2Label: null,
    writeTable: "ct_firms",
    class1Table: "ct_firms",
  },
  {
    id: "audits",
    label: "Audits",
    level1Every: "Every firm",
    level1Select: "Select firm",
    class1Label: "Firm",
    class2Label: "Audit",
    writeTable: "audit_runs",
    class1Table: "ct_firms",
  },
  {
    id: "imports",
    label: "Imports",
    level1Every: "Every firm",
    level1Select: "Select firm",
    class1Label: "Firm",
    class2Label: "Import",
    writeTable: "import_batch",
    class1Table: "ct_firms",
  },
  {
    id: "agents",
    label: "Agents",
    level1Every: "Every sequence",
    level1Select: "Select sequence",
    class1Label: "Sequence",
    class2Label: "Campaign",
    writeTable: "campaign",
    class1Table: "sequence_template",
  },
  {
    id: "reference",
    label: "Reference",
    silent: true,
    level1Every: "Every firm",
    level1Select: "Select firm",
    class1Label: "Firm",
    class2Label: null,
    writeTable: "reference_versions",
    class1Table: "ct_firms",
  },
];

export function getModuleSpec(id: string | undefined): GetModuleSpec {
  return GET_MODULES.find((row) => row.id === id) ?? GET_MODULES[0];
}

export function previewGetWrites(
  data: {
    getModule?: string;
    getSelect?: string;
    getClass1?: string;
    getClass2?: string[];
    getClass2All?: boolean;
  },
  book: Array<{ id: string; firmId?: string | null }>,
): Array<{ table: string; id: string; contact_id?: string | null }> {
  const spec = getModuleSpec(data.getModule);
  if (spec.silent) return [];
  const every = (data.getSelect ?? "every") === "every";
  if (spec.id === "contacts") {
    const rows = every
      ? book
      : data.getClass1
        ? data.getClass2All !== false && !(data.getClass2?.length)
          ? book.filter((row) => row.firmId === data.getClass1)
          : book.filter((row) => (data.getClass2 ?? []).includes(row.id))
        : [];
    return rows.map((row) => ({ table: "contact_records", id: row.id, contact_id: row.id }));
  }
  if (spec.id === "firms") {
    if (every) {
      const ids = [...new Set(book.map((row) => row.firmId).filter(Boolean))] as string[];
      return ids.map((id) => ({ table: "ct_firms", id }));
    }
    return data.getClass1 ? [{ table: "ct_firms", id: data.getClass1 }] : [];
  }
  if (!every && data.getClass1 && (data.getClass2All !== false && !(data.getClass2?.length))) {
    return [{ table: spec.class1Table, id: data.getClass1 }];
  }
  return (data.getClass2 ?? []).map((id) => ({ table: spec.writeTable, id }));
}

export function formatGetSummary(data: {
  getModule?: string;
  getSelect?: string;
  getClass1?: string;
  getClass2?: string[];
  getClass2All?: boolean;
}): string {
  const spec = getModuleSpec(data.getModule);
  if (spec.silent) return spec.label;
  if ((data.getSelect ?? "every") === "every") return `${spec.label} · ${spec.level1Every}`;
  const all = data.getClass2All !== false && !(data.getClass2?.length);
  if (!data.getClass1) return `${spec.label} · ${spec.level1Select}`;
  if (spec.silentClass2 || !spec.class2Label) return `${spec.label} · firm`;
  if (all) return `${spec.label} · all ${spec.class2Label.toLowerCase()}s`;
  const n = data.getClass2?.length ?? 0;
  return `${spec.label} · ${n} ${spec.class2Label.toLowerCase()}${n === 1 ? "" : "s"}`;
}
