/**
 * Shared Operator prototype chrome — panel shell, chips, surface blocks.
 */
import type { CSSProperties, ReactNode } from "react";
import type { Tokens } from "../../../components/tokens";
import { getModuleShape, recordShapeLabel } from "../../trace/moduleShapes";
import { SURFACE_CATALOG, type RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { RegisterSurfaceMount } from "../registerSurfaceChrome";

export type OperatorModuleProps = {
  t: Tokens;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
};

export function resolveHoveredEntry(hoveredId: string | null): RegisterSurfaceEntry | null {
  if (!hoveredId) return null;
  return SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null;
}

export function moduleFocus(
  module: string,
  focusedEntry: RegisterSurfaceEntry | null,
  hoveredEntry: RegisterSurfaceEntry | null,
) {
  return {
    focused: Boolean(focusedEntry) && focusedEntry!.module === module,
    hovered: Boolean(hoveredEntry) && hoveredEntry!.module === module,
    labelFocused: (label: string) => focusedEntry?.label === label,
    labelHovered: (label: string) => hoveredEntry?.label === label,
  };
}

export function statusChip(
  t: Tokens,
  label: string,
  tone: "accent" | "amber" | "muted" | "success" | "danger" = "accent",
) {
  const color =
    tone === "amber"
      ? t.amber
      : tone === "muted"
        ? t.textMuted
        : tone === "success"
          ? t.success
          : tone === "danger"
            ? t.red
            : t.accent;
  const bg =
    tone === "amber"
      ? t.amberBg
      : tone === "muted"
        ? t.hoverBg
        : tone === "success"
          ? "rgba(22, 163, 74, 0.14)"
          : tone === "danger"
            ? "rgba(239, 68, 68, 0.14)"
            : t.accentBg;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
        background: bg,
        padding: "2px 6px",
        borderRadius: 3,
      }}
    >
      {label}
    </span>
  );
}

export function panelShell(t: Tokens, title: string, badge: ReactNode, children: ReactNode) {
  const shape = getModuleShape(title);
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          minHeight: 35,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "6px 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          {title}
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {shape ? (
            <>
              {statusChip(t, recordShapeLabel(shape.recordShape), "amber")}
              {statusChip(t, shape.scope, "muted")}
            </>
          ) : null}
          {badge}
        </span>
      </header>
      {shape ? <ModuleShapeBanner t={t} module={title} /> : null}
      {children}
    </div>
  );
}

/** Visible cardinality contract under the module header. */
export function ModuleShapeBanner({ t, module }: { t: Tokens; module: string }) {
  const shape = getModuleShape(module);
  if (!shape) return null;
  return (
    <div
      data-module-shape={shape.recordShape}
      style={{
        flexShrink: 0,
        padding: "8px 14px",
        borderBottom: `1px solid ${t.border}`,
        background: t.hoverBg,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <div style={{ fontSize: 11, lineHeight: 1.45, color: t.textPrimary }}>
        <span style={{ fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: t.textDim }}>
          Shape
        </span>
        {" · "}
        <strong>{recordShapeLabel(shape.recordShape)}</strong>
        {" · "}
        {shape.scope}
        {" — "}
        {shape.shapeNote}
      </div>
      <div style={{ fontSize: 11, lineHeight: 1.4, color: t.textDim }}>
        Seed: {shape.seedExpectation}
      </div>
    </div>
  );
}

export function surfaceBlock(
  t: Tokens,
  label: string,
  focused: boolean,
  hovered: boolean,
  children: ReactNode,
  style?: CSSProperties,
) {
  return (
    <RegisterSurfaceMount
      label={label}
      focused={focused}
      hovered={hovered}
      t={t}
      style={{
        flex: "unset",
        minHeight: 0,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        background: t.bgSecondary,
        padding: 14,
        outlineOffset: 0,
        ...style,
      }}
    >
      {children}
    </RegisterSurfaceMount>
  );
}

export function filterSelectStyle(t: Tokens): CSSProperties {
  return {
    fontSize: 12,
    fontFamily: "inherit",
    color: t.textPrimary,
    background: t.bgPrimary,
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    padding: "5px 8px",
    minWidth: 140,
  };
}

export function primaryBtnStyle(t: Tokens, disabled = false): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    color: disabled ? t.textDim : "#fff",
    background: disabled ? t.hoverBg : t.accent,
    border: "none",
    borderRadius: 4,
    padding: "7px 12px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  };
}

export function secondaryBtnStyle(t: Tokens): CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    color: t.textPrimary,
    background: t.bgPrimary,
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    padding: "7px 12px",
    cursor: "pointer",
  };
}

export const DEMO_FIRMS = [
  { id: "firm-northwind", name: "Northwind Immigration", stage: "Running", health: "Healthy" },
  { id: "firm-cedar", name: "Cedar Pathways", stage: "Prepared Workspace", health: "Watch" },
  { id: "firm-harbor", name: "Harbor RCIC Desk", stage: "Escrow held", health: "Healthy" },
  { id: "firm-atlas", name: "Atlas Mobility", stage: "Approach capture", health: "At risk" },
] as const;

/** Centered modal overlay for operator prototype surfaces (Change event, Kill-switch, Gap, Sequence detail). */
export function operatorModal(
  t: Tokens,
  surfaceLabel: string,
  title: string,
  focused: boolean,
  hovered: boolean,
  onClose: () => void,
  children: ReactNode,
  footer?: ReactNode,
) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15, 18, 28, 0.45)",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 480, maxHeight: "90%", display: "flex", flexDirection: "column" }}
      >
        <RegisterSurfaceMount
          label={surfaceLabel}
          focused={focused}
          hovered={hovered}
          t={t}
          style={{
            flex: "unset",
            minHeight: 0,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
            outlineOffset: 0,
          }}
        >
        <header
          style={{
            height: 40,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "0 16px",
            borderBottom: `1px solid ${t.border}`,
            background: t.bgSecondary,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary }}>{title}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 12,
              fontFamily: "inherit",
              color: t.textMuted,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            Close
          </button>
        </header>
        <div style={{ padding: 16, overflowY: "auto" }}>{children}</div>
        {footer ? (
          <footer
            style={{
              flexShrink: 0,
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              padding: "12px 16px",
              borderTop: `1px solid ${t.border}`,
              background: t.bgSecondary,
            }}
          >
            {footer}
          </footer>
        ) : null}
        </RegisterSurfaceMount>
      </div>
    </div>
  );
}

export function chipTone(
  label: string,
): "accent" | "amber" | "muted" | "success" | "danger" {
  if (label === "Healthy" || label === "Released") return "success";
  if (label === "Watch" || label === "Held") return "amber";
  if (label === "At risk" || label === "Disputed" || label === "Stuck") return "danger";
  return "muted";
}
