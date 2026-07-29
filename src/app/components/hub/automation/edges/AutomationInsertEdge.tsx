import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { AutomationEdgeData } from "../../../../data/automationWorkflows";
import { AUTOMATION_EDGE_INSERT_HOLON } from "../../../docs/automationHolons";
import { docsTargetHighlight, useIsDocsTarget } from "../../../docs/docsHighlight";
import { useAutomationEditor } from "../AutomationEditorContext";
import { EdgeInsertMenu } from "./EdgeInsertMenu";

export function AutomationInsertEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: EdgeProps) {
  const { t, onEdgeHover, onInsertBlockOnEdge } = useAutomationEditor();
  const [menuOpen, setMenuOpen] = useState(false);
  const isEdgeInsertHighlighted = useIsDocsTarget(AUTOMATION_EDGE_INSERT_HOLON.id);
  const edgeData = data as AutomationEdgeData | undefined;
  const branchRouted = edgeData?.branchRouted === true;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const emphasized = menuOpen || branchRouted;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        interactionWidth={20}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            zIndex: menuOpen ? 20 : branchRouted ? 12 : 8,
          }}
          onMouseEnter={() => onEdgeHover(id)}
          onMouseLeave={() => {
            if (!menuOpen) {
              onEdgeHover(null);
            }
          }}
        >
          <button
            type="button"
            aria-label="Insert step"
            title="Insert step"
            className="nodrag nopan nowheel"
            onClick={() => {
              setMenuOpen((open) => {
                const next = !open;
                if (next) {
                  onEdgeHover(id);
                }
                return next;
              });
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: `1px solid ${emphasized ? t.accent : t.border}`,
              background: t.bgPrimary,
              color: t.textPrimary,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: branchRouted
                ? `0 0 0 3px ${edgeData?.branchHandle === "false" ? `${t.red}33` : `${t.success}33`}`
                : "0 2px 8px rgba(0,0,0,0.12)",
              padding: 0,
              opacity: emphasized ? 1 : 0.72,
              transform: emphasized ? "scale(1.05)" : "scale(1)",
              transition: "opacity 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease",
              ...docsTargetHighlight(isEdgeInsertHighlighted, t.accent),
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
          {menuOpen && (
            <EdgeInsertMenu
              t={t}
              onSelect={(block) => {
                onInsertBlockOnEdge(id, block);
                setMenuOpen(false);
                onEdgeHover(null);
              }}
              onClose={() => {
                setMenuOpen(false);
                onEdgeHover(null);
              }}
            />
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
