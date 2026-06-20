import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import { useState } from "react";
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
}: EdgeProps) {
  const { t, isDark, hoveredEdgeId, onEdgeHover, onInsertBlockOnEdge } = useAutomationEditor();
  const [menuOpen, setMenuOpen] = useState(false);
  const isEdgeInsertHighlighted = useIsDocsTarget(AUTOMATION_EDGE_INSERT_HOLON.id);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const showControl = hoveredEdgeId === id || menuOpen;

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {showControl && (
          <div
            className="nodrag nopan nowheel"
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
              zIndex: menuOpen ? 20 : 10,
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
                border: `1px solid ${isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.12)"}`,
                background: "#ffffff",
                color: "#111111",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                padding: 0,
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
        )}
      </EdgeLabelRenderer>
    </>
  );
}
