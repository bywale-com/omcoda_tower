import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_ICON_SLOT } from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import {
  TOWER_POPOVER_CONTENT_CLASS,
  TOWER_POPOVER_MENU_HINT_CLASS,
  TOWER_POPOVER_MENU_ITEM_CLASS,
} from "../ui/towerChrome";
import { cn } from "../ui/utils";
import { CsvImportColumnMappingDialog } from "./CsvImportColumnMappingDialog";
import type { ColumnMappingRow, ConfirmedCsvImport, ParsedCsvPreview } from "./csvImportTypes";
import { buildInitialColumnMappings, isAcceptedImportFile, parseCsvPreview } from "./parseCsvPreview";

const ACCEPT_ATTR = ".csv,.tsv,text/csv,text/tab-separated-values";
const HOVER_CLOSE_DELAY_MS = 120;

type CsvImportFlowProps = {
  t: Tokens;
  onImportConfirmed?: (result: ConfirmedCsvImport) => void;
};

export function CsvImportFlow({ t, onImportConfirmed }: CsvImportFlowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsed, setParsed] = useState<ParsedCsvPreview | null>(null);
  const [columnRows, setColumnRows] = useState<ColumnMappingRow[]>([]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      if (!mappingOpen) setDropOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer, mappingOpen]);

  const openDrop = useCallback(() => {
    clearCloseTimer();
    setDropOpen(true);
  }, [clearCloseTimer]);

  const resetFlow = useCallback(() => {
    setParsed(null);
    setColumnRows([]);
    setParseError(null);
    setIsParsing(false);
    setIsDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!isAcceptedImportFile(file)) {
      setParseError("Only .csv and .tsv files are supported.");
      return;
    }

    setIsParsing(true);
    setParseError(null);

    try {
      const preview = await parseCsvPreview(file);
      setParsed(preview);
      setColumnRows(buildInitialColumnMappings(preview.headers));
      setDropOpen(false);
      setMappingOpen(true);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Could not parse file.");
    } finally {
      setIsParsing(false);
    }
  }, []);

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function onMappingOpenChange(open: boolean) {
    setMappingOpen(open);
    if (!open) resetFlow();
  }

  function onConfirm(confirmed: ConfirmedCsvImport | null) {
    if (!confirmed) return;
    onImportConfirmed?.(confirmed);
    setMappingOpen(false);
    resetFlow();
  }

  return (
    <>
      <Popover open={dropOpen} onOpenChange={setDropOpen}>
        <PopoverAnchor asChild>
          <button
            type="button"
            title="Add import"
            aria-label="Add import"
            onMouseEnter={() => {
              setHovered(true);
              openDrop();
            }}
            onMouseLeave={() => {
              setHovered(false);
              scheduleClose();
            }}
            onClick={(e) => {
              e.stopPropagation();
              openDrop();
            }}
            style={{
              width: DOCS_TREE_ICON_SLOT,
              height: DOCS_TREE_ICON_SLOT,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              border: "none",
              borderRadius: 4,
              background: hovered || dropOpen ? t.hoverBg : "transparent",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <NotionIcon name="plus" size={DOCS_TREE_ICON_SIZE} color={t.textMuted} />
          </button>
        </PopoverAnchor>

        <PopoverContent
          side="right"
          align="start"
          sideOffset={6}
          className={cn(
            TOWER_POPOVER_CONTENT_CLASS,
            isDragOver && "ring-1 ring-ring",
          )}
          onMouseEnter={openDrop}
          onMouseLeave={scheduleClose}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={onDrop}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            disabled={isParsing}
            className={TOWER_POPOVER_MENU_ITEM_CLASS}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={14} strokeWidth={2} className="text-muted-foreground" />
            {isParsing ? "Parsing…" : "Import file…"}
          </button>
          <p className={TOWER_POPOVER_MENU_HINT_CLASS}>.csv or .tsv</p>
          {parseError && (
            <p className={`${TOWER_POPOVER_MENU_HINT_CLASS} text-destructive`} role="alert">
              {parseError}
            </p>
          )}
        </PopoverContent>
      </Popover>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={onInputChange}
      />

      <CsvImportColumnMappingDialog
        open={mappingOpen}
        parsed={parsed}
        rows={columnRows}
        onRowsChange={setColumnRows}
        onOpenChange={onMappingOpenChange}
        onConfirm={onConfirm}
      />
    </>
  );
}
