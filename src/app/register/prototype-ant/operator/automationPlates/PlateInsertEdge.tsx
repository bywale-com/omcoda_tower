import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from "@xyflow/react";
import { WireAddMenu } from "./WireAddMenu";
import { useCanvasOps } from "./canvasOps";

export function PlateInsertEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
}: EdgeProps) {
  const ops = useCanvasOps();
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
          {ops ? (
            <WireAddMenu onPick={(block) => ops.onInsertOnEdge(id, block.id)} />
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
