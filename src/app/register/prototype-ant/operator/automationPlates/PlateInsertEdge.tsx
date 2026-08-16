import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { PlusOutlined } from "@ant-design/icons";
import type { PaletteBlock } from "../../../../data/automationWorkflows";

const INSERT_CHOICES: { id: string; title: string; body: string }[] = [
  { id: "trigger", title: "Trigger", body: "Starts the workflow." },
  { id: "rule-immigration-service-eligibility", title: "Rule", body: "Gate or branch logic." },
  { id: "action-sequence", title: "Action", body: "In the app, or an agent." },
  { id: "condition-if", title: "Condition (If)", body: "Calls from the previous result." },
  { id: "operation-exit", title: "Exit", body: "End the workflow." },
];

export function PlateInsertEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  hasTrigger,
  blocks,
  onInsert,
}: EdgeProps & {
  hasTrigger: boolean;
  blocks: PaletteBlock[];
  onInsert: (edgeId: string, block: PaletteBlock) => void;
}) {
  const [open, setOpen] = useState(false);
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan nowheel"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            zIndex: 12,
          }}
        >
          <button
            type="button"
            aria-label="Add node"
            onClick={() => setOpen((value) => !value)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              border: "1px solid #1677ff",
              background: "#1677ff",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
            }}
          >
            <PlusOutlined />
          </button>
          {open ? (
            <div
              style={{
                position: "absolute",
                left: 28,
                top: -8,
                width: 220,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                padding: 6,
              }}
            >
              {INSERT_CHOICES.map((choice) => {
                const block = blocks.find((row) => row.id === choice.id);
                const disabled = choice.id === "trigger" && hasTrigger;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={disabled || !block}
                    onClick={() => {
                      if (!block) return;
                      onInsert(id, block);
                      setOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 10px",
                      border: "none",
                      borderRadius: 6,
                      background: "transparent",
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{choice.title}</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>{choice.body}</div>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
