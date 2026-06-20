import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import {
  TOWER_DIALOG_BODY_TEXT_CLASS,
  TOWER_DIALOG_HINT_CLASS,
  TOWER_DIALOG_MENU_ITEM_CLASS,
  TOWER_DIALOG_TITLE_CLASS,
} from "../ui/towerChrome";
import { cn } from "../ui/utils";
import {
  IMPORT_TARGET_FIELDS,
  IMPORT_TARGET_LABELS,
  type ColumnMappingRow,
  type ConfirmedCsvImport,
  type ImportTargetField,
  type ParsedCsvPreview,
} from "./csvImportTypes";
import { buildConfirmedImport, isImportMappingValid, targetTakenBy } from "./csvImportValidation";

const UNMAPPED_VALUE = "__unmapped__";

type CsvImportColumnMappingDialogProps = {
  open: boolean;
  parsed: ParsedCsvPreview | null;
  rows: ColumnMappingRow[];
  onRowsChange: (rows: ColumnMappingRow[]) => void;
  onOpenChange: (open: boolean) => void;
  onConfirm: (confirmed: ConfirmedCsvImport) => void;
};

export function CsvImportColumnMappingDialog({
  open,
  parsed,
  rows,
  onRowsChange,
  onOpenChange,
  onConfirm,
}: CsvImportColumnMappingDialogProps) {
  const canConfirm = useMemo(() => isImportMappingValid(rows), [rows]);

  const previewSample = useMemo(() => {
    if (!parsed || parsed.previewRows.length === 0) return null;
    return parsed.previewRows[0];
  }, [parsed]);

  function updateRow(csvHeader: string, patch: Partial<ColumnMappingRow>) {
    onRowsChange(
      rows.map((row) => (row.csvHeader === csvHeader ? { ...row, ...patch } : row)),
    );
  }

  function handleConfirm() {
    if (!parsed) return;
    const confirmed = buildConfirmedImport(parsed, rows);
    if (!confirmed) return;
    onConfirm(confirmed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(85vh,640px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="border-b px-4 py-3 text-left">
          <DialogTitle className={TOWER_DIALOG_TITLE_CLASS}>Map columns</DialogTitle>
          <DialogDescription className={TOWER_DIALOG_HINT_CLASS}>
            {parsed
              ? `${parsed.fileName} — match Name, Phone, and Email.`
              : "Match file columns to contact fields."}
          </DialogDescription>
        </DialogHeader>

        <div className={cn("grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] gap-2 border-b px-4 py-2", TOWER_DIALOG_HINT_CLASS)}>
          <span>Column</span>
          <span>Sample</span>
          <span>Maps to</span>
          <span className="text-right">Skip</span>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-0.5 px-2 py-2">
            {rows.map((row) => {
              const selectValue = row.skipped || !row.target ? UNMAPPED_VALUE : row.target;
              const sample = previewSample?.[row.csvHeader] ?? "—";

              return (
                <div
                  key={row.csvHeader}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_auto] items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent/50"
                >
                  <p
                    className={cn("truncate", TOWER_DIALOG_BODY_TEXT_CLASS)}
                    title={row.csvHeader}
                  >
                    {row.csvHeader}
                  </p>

                  <p className={cn("truncate", TOWER_DIALOG_HINT_CLASS)} title={sample}>
                    {sample || "—"}
                  </p>

                  <Select
                    value={selectValue}
                    disabled={row.skipped}
                    onValueChange={(value) => {
                      if (value === UNMAPPED_VALUE) {
                        updateRow(row.csvHeader, { target: null });
                        return;
                      }
                      updateRow(row.csvHeader, {
                        target: value as ImportTargetField,
                        skipped: false,
                      });
                    }}
                  >
                    <SelectTrigger size="sm" className="h-8 w-full text-xs">
                      <SelectValue placeholder="Choose field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNMAPPED_VALUE} className="text-xs">
                        Not mapped
                      </SelectItem>
                      {IMPORT_TARGET_FIELDS.map((field) => {
                        const takenBy = targetTakenBy(rows, field, row.csvHeader);
                        return (
                          <SelectItem
                            key={field}
                            value={field}
                            disabled={Boolean(takenBy)}
                            className="text-xs"
                          >
                            {IMPORT_TARGET_LABELS[field]}
                            {takenBy ? ` · ${takenBy}` : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-end">
                    <Label htmlFor={`skip-${row.csvHeader}`} className="sr-only">
                      Skip {row.csvHeader}
                    </Label>
                    <Switch
                      id={`skip-${row.csvHeader}`}
                      checked={row.skipped}
                      onCheckedChange={(checked) => {
                        updateRow(row.csvHeader, {
                          skipped: checked,
                          target: checked ? null : row.target,
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-row justify-end gap-1 border-t px-2 py-1.5 sm:justify-end">
          <button
            type="button"
            className={cn(TOWER_DIALOG_MENU_ITEM_CLASS, "text-muted-foreground")}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            className={cn(
              TOWER_DIALOG_MENU_ITEM_CLASS,
              "font-medium text-foreground",
              canConfirm && "text-primary",
            )}
            onClick={handleConfirm}
          >
            Confirm import
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
