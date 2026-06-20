import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  ChevronRight,
  Link2,
  ListChecks,
  Play,
  Upload,
} from "lucide-react";
import type { ContactImport } from "../../data/imports";
import { DOCS_TREE_ICON_SIZE, DOCS_TREE_ICON_SLOT } from "../docs/treeLayout";
import { NotionIcon } from "../icons/NotionIcon";
import type { Tokens } from "../tokens";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import {
  TOWER_POPOVER_CONTENT_CLASS,
  TOWER_POPOVER_ICON_BUTTON_CLASS,
  TOWER_POPOVER_MENU_ITEM_CLASS,
  TOWER_POPOVER_MENU_META_CLASS,
  TOWER_POPOVER_PRIMARY_ACTION_CLASS,
  TOWER_POPOVER_SUBMENU_CLASS,
  TOWER_POPOVER_TOOLBAR_CLASS,
} from "../ui/towerChrome";
import { cn } from "../ui/utils";

const HOVER_CLOSE_DELAY_MS = 120;

type SubmenuId = "select-data" | "add-data";

type AddAuditFlowProps = {
  t: Tokens;
  imports: ContactImport[];
  onContinueWithImports?: (importIds: string[]) => void;
};

export function AddAuditFlow({ t, imports, onContinueWithImports }: AddAuditFlowProps) {
  const closeTimerRef = useRef<number | null>(null);
  const [triggerHovered, setTriggerHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<SubmenuId | null>(null);
  const [selectedImportIds, setSelectedImportIds] = useState<Set<string>>(new Set());

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleSubmenuClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveSubmenu(null);
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const openSubmenu = useCallback(
    (id: SubmenuId) => {
      clearCloseTimer();
      setActiveSubmenu(id);
    },
    [clearCloseTimer],
  );

  const resetState = useCallback(() => {
    setActiveSubmenu(null);
    setSelectedImportIds(new Set());
    clearCloseTimer();
  }, [clearCloseTimer]);

  function onMenuOpenChange(open: boolean) {
    setMenuOpen(open);
    if (!open) resetState();
  }

  const allSelected = imports.length > 0 && selectedImportIds.size === imports.length;
  const someSelected = selectedImportIds.size > 0;

  const selectedCountLabel = useMemo(() => {
    if (selectedImportIds.size === 0) return null;
    return `${selectedImportIds.size} selected`;
  }, [selectedImportIds.size]);

  function toggleImport(id: string) {
    setSelectedImportIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedImportIds(new Set());
      return;
    }
    setSelectedImportIds(new Set(imports.map((item) => item.id)));
  }

  function handleContinue() {
    if (!someSelected) return;
    onContinueWithImports?.([...selectedImportIds]);
    setMenuOpen(false);
    resetState();
  }

  return (
    <Popover open={menuOpen} onOpenChange={onMenuOpenChange}>
      <PopoverAnchor asChild>
        <button
          type="button"
          title="Add audit"
          aria-label="Add audit"
          aria-expanded={menuOpen}
          onMouseEnter={() => setTriggerHovered(true)}
          onMouseLeave={() => setTriggerHovered(false)}
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((open) => !open);
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
            background: triggerHovered || menuOpen ? t.hoverBg : "transparent",
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
        className={cn(TOWER_POPOVER_CONTENT_CLASS, "w-44 p-1")}
        onClick={(e) => e.stopPropagation()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SubmenuRow
          label="Select Data"
          isActive={activeSubmenu === "select-data"}
          onEnter={() => openSubmenu("select-data")}
          onLeave={scheduleSubmenuClose}
        >
          {activeSubmenu === "select-data" && (
            <div
              className={cn(TOWER_POPOVER_SUBMENU_CLASS, "w-72")}
              onMouseEnter={() => openSubmenu("select-data")}
              onMouseLeave={scheduleSubmenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={TOWER_POPOVER_TOOLBAR_CLASS}>
                <button
                  type="button"
                  title="Select all"
                  aria-label="Select all"
                  className={TOWER_POPOVER_ICON_BUTTON_CLASS}
                  onClick={toggleSelectAll}
                >
                  <ListChecks size={14} strokeWidth={2} />
                </button>
                <span className={cn(TOWER_POPOVER_MENU_META_CLASS, "min-w-0 flex-1 truncate px-1 text-left")}>
                  {selectedCountLabel ?? `${imports.length} imports`}
                </span>
                <button
                  type="button"
                  title="Run audit with selected imports"
                  aria-label="Run audit with selected imports"
                  disabled={!someSelected}
                  className={cn(
                    TOWER_POPOVER_PRIMARY_ACTION_CLASS,
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center p-0",
                  )}
                  onClick={handleContinue}
                >
                  <Play size={14} strokeWidth={2} className="fill-current" />
                </button>
              </div>

              <div className="max-h-56 overflow-y-auto py-0.5">
                {imports.length === 0 ? (
                  <p className={cn(TOWER_POPOVER_MENU_META_CLASS, "px-2 py-2")}>No imports yet.</p>
                ) : (
                  imports.map((item) => {
                    const checked = selectedImportIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          TOWER_POPOVER_MENU_ITEM_CLASS,
                          "gap-2",
                          checked && "bg-accent/60",
                        )}
                        onClick={() => toggleImport(item.id)}
                      >
                        <span
                          className={cn(
                            "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border",
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/40 bg-background",
                          )}
                          aria-hidden
                        >
                          {checked && (
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                              <path
                                d="M2.5 6.5L5 9l4.5-5.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                        <span className={TOWER_POPOVER_MENU_META_CLASS}>{item.importedAt}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </SubmenuRow>

        <SubmenuRow
          label="Add Data"
          isActive={activeSubmenu === "add-data"}
          onEnter={() => openSubmenu("add-data")}
          onLeave={scheduleSubmenuClose}
        >
          {activeSubmenu === "add-data" && (
            <div
              className={cn(TOWER_POPOVER_SUBMENU_CLASS, "w-48")}
              onMouseEnter={() => openSubmenu("add-data")}
              onMouseLeave={scheduleSubmenuClose}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className={TOWER_POPOVER_MENU_ITEM_CLASS}>
                <Upload size={14} strokeWidth={2} className="text-muted-foreground" />
                Add Import
              </button>
              <button type="button" className={TOWER_POPOVER_MENU_ITEM_CLASS}>
                <Link2 size={14} strokeWidth={2} className="text-muted-foreground" />
                Add Connection
              </button>
              <button type="button" className={TOWER_POPOVER_MENU_ITEM_CLASS}>
                <Activity size={14} strokeWidth={2} className="text-muted-foreground" />
                Connect Data Stream
              </button>
            </div>
          )}
        </SubmenuRow>
      </PopoverContent>
    </Popover>
  );
}

function SubmenuRow({
  label,
  isActive,
  onEnter,
  onLeave,
  children,
}: {
  label: string;
  isActive: boolean;
  onEnter: () => void;
  onLeave: () => void;
  children?: ReactNode;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        className={cn(
          TOWER_POPOVER_MENU_ITEM_CLASS,
          "justify-between",
          isActive && "bg-accent text-accent-foreground",
        )}
      >
        <span>{label}</span>
        <ChevronRight size={14} strokeWidth={2} className="shrink-0 text-muted-foreground" />
      </button>
      {children}
    </div>
  );
}
