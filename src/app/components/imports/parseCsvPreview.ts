import Papa from "papaparse";
import type { ColumnMappingRow, ImportTargetField, ParsedCsvPreview } from "./csvImportTypes";

const PREVIEW_ROW_LIMIT = 5;
const ACCEPTED_EXTENSIONS = [".csv", ".tsv"] as const;

export function isAcceptedImportFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function delimiterForFile(file: File): string {
  return file.name.toLowerCase().endsWith(".tsv") ? "\t" : ",";
}

function parseCsvFile(
  file: File,
  options: { previewLimit?: number },
): Promise<{ headers: string[]; rows: Record<string, string>[]; delimiter: string }> {
  return new Promise((resolve, reject) => {
    if (!isAcceptedImportFile(file)) {
      reject(new Error("Only .csv and .tsv files are supported."));
      return;
    }

    const delimiter = delimiterForFile(file);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      delimiter,
      skipEmptyLines: true,
      ...(options.previewLimit != null ? { preview: options.previewLimit } : {}),
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(results.errors[0]?.message ?? "Failed to parse file."));
          return;
        }

        const headers = (results.meta.fields ?? []).filter((field) => field.length > 0);
        if (headers.length === 0) {
          reject(new Error("No column headers found in the first row."));
          return;
        }

        const rows = results.data.map((row) => {
          const normalized: Record<string, string> = {};
          for (const header of headers) {
            normalized[header] = row[header]?.trim() ?? "";
          }
          return normalized;
        });

        resolve({ headers, rows, delimiter });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export function parseCsvPreview(file: File): Promise<ParsedCsvPreview> {
  return parseCsvFile(file, { previewLimit: PREVIEW_ROW_LIMIT }).then((parsed) => ({
    fileName: file.name,
    headers: parsed.headers,
    previewRows: parsed.rows,
    delimiter: parsed.delimiter,
  }));
}

/** Full-file parse for persistence (no preview limit). */
export function parseCsvAll(file: File): Promise<{
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  delimiter: string;
}> {
  return parseCsvFile(file, {}).then((parsed) => ({
    fileName: file.name,
    headers: parsed.headers,
    rows: parsed.rows,
    delimiter: parsed.delimiter,
  }));
}

export function guessTargetForHeader(header: string): ImportTargetField | null {
  const normalized = header.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  if (/\b(e ?mail|email address)\b/.test(normalized)) return "email";
  if (/\b(phone|mobile|tel|cell)\b/.test(normalized)) return "phone";
  if (/\b(full name|contact name|client name|name)\b/.test(normalized)) return "name";

  return null;
}

export function buildInitialColumnMappings(headers: string[]): ColumnMappingRow[] {
  const used = new Set<string>();

  return headers.map((csvHeader) => {
    const guess = guessTargetForHeader(csvHeader);
    const target = guess && !used.has(guess) ? guess : null;
    if (target) used.add(target);
    return { csvHeader, skipped: false, target };
  });
}
