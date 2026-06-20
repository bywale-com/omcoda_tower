import {
  IMPORT_TARGET_FIELDS,
  type ColumnMappingRow,
  type ConfirmedCsvImport,
  type ImportTargetField,
  type ParsedCsvPreview,
} from "./csvImportTypes";

export function isImportMappingValid(rows: ColumnMappingRow[]): boolean {
  const active = rows.filter((row) => !row.skipped && row.target != null);
  const targets = active.map((row) => row.target as ImportTargetField);

  if (targets.length !== IMPORT_TARGET_FIELDS.length) return false;
  if (new Set(targets).size !== IMPORT_TARGET_FIELDS.length) return false;

  return IMPORT_TARGET_FIELDS.every((field) => targets.includes(field));
}

export function buildConfirmedImport(
  parsed: ParsedCsvPreview,
  rows: ColumnMappingRow[],
): ConfirmedCsvImport | null {
  if (!isImportMappingValid(rows)) return null;

  const mapping = {} as Record<ImportTargetField, string>;
  for (const row of rows) {
    if (!row.skipped && row.target) {
      mapping[row.target] = row.csvHeader;
    }
  }

  return {
    fileName: parsed.fileName,
    mapping,
    previewRows: parsed.previewRows,
  };
}

export function targetTakenBy(
  rows: ColumnMappingRow[],
  target: ImportTargetField,
  exceptHeader?: string,
): string | null {
  const match = rows.find(
    (row) => !row.skipped && row.target === target && row.csvHeader !== exceptHeader,
  );
  return match?.csvHeader ?? null;
}
