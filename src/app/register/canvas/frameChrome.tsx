import type { CSSProperties, ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import {
  getRegisterFlowCanvasFocus,
  holonContainsFlowStepFocus,
  isHolonInFlowStepFocus,
} from "../flows/flowFocus";
import { useRegisterSelection } from "../context/RegisterSelectionContext";

const FLOW_DIM_OPACITY = 0.28;

export function RegisterHolonRegion({
  holonId,
  t,
  style,
  children,
}: {
  holonId: string;
  t: Tokens;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const {
    selectedHolonId,
    hoveredHolonId,
    activeFlowStepId,
    activeFlowId,
    selectHolon,
    setHoveredHolonId,
    setHoveredFlowStepId,
    setHoveredFlowId,
  } = useRegisterSelection();

  const { holonIds: flowFocusHolonIds } = getRegisterFlowCanvasFocus(activeFlowStepId, activeFlowId);
  const flowFocusActive = flowFocusHolonIds.length > 0;
  const inFlowFocus = flowFocusActive && isHolonInFlowStepFocus(holonId, flowFocusHolonIds);
  const dimmedByFlow =
    flowFocusActive && !holonContainsFlowStepFocus(holonId, flowFocusHolonIds);

  const highlighted =
    selectedHolonId === holonId || hoveredHolonId === holonId || inFlowFocus;

  return (
    <div
      className="nodrag nopan"
      data-register-holon={holonId}
      onClick={(event) => {
        event.stopPropagation();
        selectHolon(holonId);
      }}
      onMouseEnter={() => {
        setHoveredFlowStepId(null);
        setHoveredFlowId(null);
        setHoveredHolonId(holonId);
      }}
      onMouseLeave={() => setHoveredHolonId(null)}
      style={{
        boxSizing: "border-box",
        cursor: "pointer",
        borderRadius: 4,
        opacity: dimmedByFlow ? FLOW_DIM_OPACITY : 1,
        boxShadow: highlighted ? `inset 0 0 0 2px ${t.accent}` : undefined,
        transition: "box-shadow 0.12s ease, opacity 0.12s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function RegisterViewArtboard({
  title,
  subtitle,
  width,
  t,
  children,
}: {
  title: string;
  subtitle: string;
  width: number;
  t: Tokens;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        borderRadius: 8,
        border: `1px solid ${t.border}`,
        background: t.cardBg,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        className="register-view-drag-handle"
        style={{
          padding: "8px 10px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
          cursor: "grab",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 11,
            lineHeight: 1.3,
            color: t.textMuted,
          }}
        >
          {subtitle}
        </div>
      </div>
      {children}
    </div>
  );
}
