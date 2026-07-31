import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import {
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_X,
} from "../../components/docs/treeLayout";
import { docsBranchLabelStyle } from "../../components/docs/treeTypography";
import type { Tokens } from "../../components/tokens";
import type { RegisterPassId } from "../passes/registerPasses";
import { useRegisterSelection } from "../context/RegisterSelectionContext";

type RegisterPassSectionProps = {
  passId: RegisterPassId;
  label: string;
  hint?: string;
  hasTree: boolean;
  open: boolean;
  onToggleOpen: () => void;
  /** Called when the pass row is activated (e.g. reveal theory if retracted). */
  onSelectPass?: () => void;
  children?: ReactNode;
  t: Tokens;
};

export function RegisterPassSection({
  passId,
  label,
  hint,
  hasTree,
  open,
  onToggleOpen,
  onSelectPass,
  children,
  t,
}: RegisterPassSectionProps) {
  const { registerPassId, selectRegisterPass } = useRegisterSelection();
  const isActive = registerPassId === passId;

  const activate = () => {
    selectRegisterPass(passId);
    onSelectPass?.();
  };

  return (
    <section style={{ marginBottom: 2 }}>
      <div
        role="button"
        tabIndex={0}
        onClick={activate}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minHeight: DOCS_TREE_ROW_H,
          padding: `6px ${DOCS_TREE_ROW_PAD_X}px 4px`,
          cursor: "pointer",
          userSelect: "none",
          background: isActive ? t.activeRowBg : "transparent",
          borderRadius: 4,
          margin: "0 4px",
        }}
      >
        {hasTree ? (
          <button
            type="button"
            aria-label={open ? "Collapse section" : "Expand section"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleOpen();
              if (!isActive) activate();
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <ChevronDown
              size={DOCS_TREE_CHEVRON_SIZE}
              color={t.textMuted}
              strokeWidth={2}
              style={{
                transform: open ? "rotate(0deg)" : "rotate(-90deg)",
                transition: "transform 0.12s ease",
              }}
            />
          </button>
        ) : (
          <span style={{ width: DOCS_TREE_CHEVRON_SIZE, flexShrink: 0 }} />
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              ...docsBranchLabelStyle(11, isActive ? t.textPrimary : t.textDim, true),
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </div>
          {hint && isActive ? (
            <div style={{ fontSize: 11, color: t.textMuted, lineHeight: 1.3, marginTop: 2 }}>{hint}</div>
          ) : null}
        </div>
      </div>
      {hasTree && open ? <div style={{ paddingBottom: 4 }}>{children}</div> : null}
    </section>
  );
}
