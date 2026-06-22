import { ChevronDown, CheckSquare, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { SIDEBAR_HEADER_HEIGHT } from "../../constants/layout";
import {
  CONSOLE_NAV_ICON,
  MORE_NAV_ICON,
  PRIMARY_NAV,
} from "../../components/docs/primaryNavigationIcons";
import { docsBranchLabelStyle, docsChildLabelStyle } from "../../components/docs/treeTypography";
import {
  DOCS_TREE_ACTIVE_BORDER,
  DOCS_TREE_CHEVRON_SIZE,
  DOCS_TREE_ICON_SIZE,
  DOCS_TREE_ICON_SLOT,
  DOCS_TREE_LABEL_SIZE,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_LEFT,
  DOCS_TREE_ROW_PAD_X,
  docsTreeChildPadLeft,
  s,
} from "../../components/docs/treeLayout";
import { directoryRowMetaStyle, directoryRowPrimaryStyle } from "../../components/contacts/directoryRowStyles";
import { TowerAppLogo } from "../../components/icons/TowerAppLogo";
import { NotionIcon } from "../../components/icons/NotionIcon";
import type { RegisterSurfaceProps } from "../composer/surfaceTypes";

const NAV_ICON_SIZE = 16;
const NAV_LOGO_OPTICAL_SCALE = 56 / 64;

const CLIENT_ROW_EXEMPLARS = [
  { name: "Sarah Jenkins", phaseIcon: "user" as const, phaseColor: "#2563eb", active: true, showActions: true },
  { name: "Marcus Webb", phaseIcon: "circle-dashed" as const, phaseColor: "#eab308", active: false, showActions: false },
] as const;

const TASK_EXEMPLAR = {
  label: "Follow up on intake form",
  meta: "Sarah Jenkins · Today",
};

function NavIconButton({
  active,
  icon,
  t,
}: {
  active?: boolean;
  icon: Parameters<typeof NotionIcon>[0]["name"];
  t: RegisterSurfaceProps["t"];
}) {
  return (
    <span
      style={{
        width: 28,
        height: 28,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? t.activeRowBg : "transparent",
        borderRadius: 4,
        flexShrink: 0,
      }}
    >
      <NotionIcon name={icon} size={NAV_ICON_SIZE} color={active ? t.accent : t.textMuted} />
    </span>
  );
}

export function PrimaryNavigationSurface({ t, layoutProps }: RegisterSurfaceProps) {
  const activeNav = String(layoutProps?.activeNav ?? "board");

  return (
    <div
      style={{
        height: SIDEBAR_HEADER_HEIGHT,
        display: "flex",
        alignItems: "stretch",
        borderBottom: `1px solid ${t.border}`,
        background: t.boardPanel,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRight: `1px solid ${t.border}`,
          flexShrink: 0,
        }}
      >
        <TowerAppLogo size={NAV_ICON_SIZE} opticalScale={NAV_LOGO_OPTICAL_SCALE} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 2, padding: "0 8px 0 2px" }}>
        <NavIconButton icon={CONSOLE_NAV_ICON} t={t} />
        {PRIMARY_NAV.map(({ id, icon }) => (
          <NavIconButton key={id} icon={icon} active={activeNav === id} t={t} />
        ))}
        <NavIconButton icon={MORE_NAV_ICON} t={t} />
      </div>
    </div>
  );
}

export function ClientsSectionSurface({ t }: RegisterSurfaceProps) {
  return (
    <div
      style={{
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT,
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <NotionIcon name="people" size={DOCS_TREE_ICON_SIZE} color={t.textDim} />
      </span>
      <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, t.textDim, true)}>Clients</span>
      <span style={{ flex: 1, minWidth: 0 }} />
      <ChevronDown size={DOCS_TREE_CHEVRON_SIZE} color={t.textMuted} strokeWidth={2} style={{ flexShrink: 0 }} />
      <span
        style={{
          minWidth: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          padding: "0 5px",
          borderRadius: 999,
          background: t.sidebarBadgeBg,
          color: t.sidebarBadgeFg,
          fontSize: s(10),
          fontWeight: 500,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        2
      </span>
    </div>
  );
}

export function BoardBodySurface({ children }: RegisterSurfaceProps & { children?: ReactNode }) {
  return <div>{children}</div>;
}

export function ClientRowSurface({ t, instanceIndex = 0, children }: RegisterSurfaceProps & { children?: ReactNode }) {
  const exemplar = CLIENT_ROW_EXEMPLARS[instanceIndex] ?? CLIENT_ROW_EXEMPLARS[0];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(exemplar.active),
        background: exemplar.active ? t.activeRowBg : "transparent",
        borderLeft: exemplar.active
          ? `${DOCS_TREE_ACTIVE_BORDER}px solid ${t.accent}`
          : `${DOCS_TREE_ACTIVE_BORDER}px solid transparent`,
        borderRadius: 4,
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export function PhaseSignalSurface({ t, instanceIndex = 0 }: RegisterSurfaceProps) {
  const exemplar = CLIENT_ROW_EXEMPLARS[instanceIndex] ?? CLIENT_ROW_EXEMPLARS[0];
  return (
    <span
      style={{
        width: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <NotionIcon
        name={exemplar.phaseIcon}
        size={DOCS_TREE_ICON_SIZE}
        color={exemplar.phaseColor}
        spin={exemplar.phaseIcon === "circle-dashed"}
      />
    </span>
  );
}

export function ClientNameSurface({ t, instanceIndex = 0 }: RegisterSurfaceProps) {
  const exemplar = CLIENT_ROW_EXEMPLARS[instanceIndex] ?? CLIENT_ROW_EXEMPLARS[0];
  return (
    <span style={{ ...docsChildLabelStyle(DOCS_TREE_LABEL_SIZE, t.textPrimary, t), flex: 1, minWidth: 0 }}>
      {exemplar.name}
    </span>
  );
}

export function RowActionsSurface({ t, instanceIndex = 0 }: RegisterSurfaceProps) {
  const exemplar = CLIENT_ROW_EXEMPLARS[instanceIndex] ?? CLIENT_ROW_EXEMPLARS[0];
  if (!exemplar.showActions) return null;

  return (
    <span
      style={{
        width: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: t.textMuted,
      }}
    >
      <MoreHorizontal size={14} strokeWidth={2} />
    </span>
  );
}

export function TasksSectionSurface({ t }: RegisterSurfaceProps) {
  return (
    <div
      style={{
        height: DOCS_TREE_ROW_H,
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: DOCS_TREE_ROW_PAD_LEFT,
        userSelect: "none",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          width: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <NotionIcon name="checkmark-list" size={DOCS_TREE_ICON_SIZE} color={t.textDim} />
      </span>
      <span style={docsBranchLabelStyle(DOCS_TREE_LABEL_SIZE, t.textDim, true)}>Tasks</span>
      <span style={{ flex: 1, minWidth: 0 }} />
      <ChevronDown size={DOCS_TREE_CHEVRON_SIZE} color={t.textMuted} strokeWidth={2} style={{ flexShrink: 0 }} />
      <span
        style={{
          minWidth: DOCS_TREE_ICON_SLOT,
          height: DOCS_TREE_ICON_SLOT,
          padding: "0 5px",
          borderRadius: 999,
          background: t.sidebarBadgeBg,
          color: t.sidebarBadgeFg,
          fontSize: s(10),
          fontWeight: 500,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        1
      </span>
    </div>
  );
}

export function TaskRowSurface({ t, children }: RegisterSurfaceProps & { children?: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(false),
        borderRadius: 4,
        boxSizing: "border-box",
        paddingBottom: 4,
      }}
    >
      {children}
    </div>
  );
}

export function TaskStatusToggleSurface({ t }: RegisterSurfaceProps) {
  return (
    <span
      style={{
        width: DOCS_TREE_ICON_SLOT,
        height: DOCS_TREE_ICON_SLOT,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: `1px solid ${t.success}44`,
        background: `${t.success}18`,
        borderRadius: 4,
      }}
    >
      <CheckSquare size={DOCS_TREE_ICON_SIZE} color={t.textPrimary} strokeWidth={2} />
    </span>
  );
}

export function TaskLabelSurface({ t }: RegisterSurfaceProps) {
  return (
    <span style={{ ...directoryRowPrimaryStyle(t.textPrimary), flex: 1, minWidth: 0 }}>
      {TASK_EXEMPLAR.label}
    </span>
  );
}

export function TaskMetaSurface({ t }: RegisterSurfaceProps) {
  return <span style={directoryRowMetaStyle(t)}>{TASK_EXEMPLAR.meta}</span>;
}
