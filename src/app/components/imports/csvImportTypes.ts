export const IMPORT_TARGET_FIELDS = ["name", "phone", "email"] as const;

export type ImportTargetField = (typeof IMPORT_TARGET_FIELDS)[number];

export const IMPORT_TARGET_LABELS: Record<ImportTargetField, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
};

export type ParsedCsvPreview = {
  fileName: string;
  headers: string[];
  previewRows: Record<string, string>[];
  delimiter: string;
};

export type ColumnMappingRow = {
  csvHeader: string;
  skipped: boolean;
  /** null = not mapped yet */
  target: ImportTargetField | null;
};

export type ConfirmedCsvImport = {
  fileName: string;
  mapping: Record<ImportTargetField, string>;
  previewRows: Record<string, string>[];
};
