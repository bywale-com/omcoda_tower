/**
 * Import batch naming: `IMP-{YYYY-MM-DD}-{seq} · {source}`
 * — date = upload day, seq = daily batch number, source = human-readable origin
 */
export type ContactImport = {
  id: string;
  /** Full label shown in the directory (ellipsizes when long) */
  label: string;
  /** Compact date shown on the right of the row */
  importedAt: string;
};

export const importList: ContactImport[] = [
  {
    id: "imp-2026-06-12-01",
    label: "IMP-2026-06-12-01 · Workshop roster",
    importedAt: "12 Jun",
  },
  {
    id: "imp-2026-05-28-01",
    label: "IMP-2026-05-28-01 · LinkedIn lead export",
    importedAt: "28 May",
  },
  {
    id: "imp-2026-04-03-01",
    label: "IMP-2026-04-03-01 · Referral partner CSV from West Coast Immigration Partners",
    importedAt: "3 Apr",
  },
  {
    id: "imp-2026-03-15-02",
    label: "IMP-2026-03-15-02 · Manual entry batch",
    importedAt: "15 Mar",
  },
  {
    id: "imp-2026-02-01-01",
    label: "IMP-2026-02-01-01 · Legacy CRM migration",
    importedAt: "1 Feb",
  },
];

export function getImport(importId: string): ContactImport | undefined {
  return importList.find((item) => item.id === importId);
}
