import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { WORKFLOW_PALETTE_BLOCKS, type PaletteBlock } from "../../../../data/automationWorkflows";
import { WireAddMenu } from "./WireAddMenu";

export function PlateInsertEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  blocks,
  onInsert,
}: EdgeProps & {
  hasTrigger?: boolean;
  blocks?: PaletteBlock[];
  onInsert: (edgeId: string, block: PaletteBlock) => void;
}) {
  const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  const palette = blocks ?? WORKFLOW_PALETTE_BLOCKS;

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
          <WireAddMenu
            onPick={(block) => {
              const resolved = palette.find((row) => row.id === block.id) ?? block;
              onInsert(id, resolved);
            }}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
