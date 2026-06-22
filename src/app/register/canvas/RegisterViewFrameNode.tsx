import type { Node, NodeProps } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import { getRegisterFlowCanvasFocus, viewHasFlowStepFocus } from "../flows/flowFocus";
import { useRegisterSelection } from "../context/RegisterSelectionContext";
import { RegisterViewArtboard } from "./frameChrome";
import { RegisterViewFrameContent } from "./RegisterViewFrameContent";

const FLOW_DIM_OPACITY = 0.28;

export type RegisterViewFrameNodeData = {
  viewId: string;
  title: string;
  subtitle: string;
  width: number;
  activeNav?: string;
  t: Tokens;
};

export function RegisterViewFrameNode({ data }: NodeProps<Node<RegisterViewFrameNodeData>>) {
  const { viewId, title, subtitle, width, t } = data;
  const { activeFlowStepId, activeFlowId } = useRegisterSelection();

  const { holonIds: flowFocusHolonIds } = getRegisterFlowCanvasFocus(activeFlowStepId, activeFlowId);
  const flowFocusActive = flowFocusHolonIds.length > 0;
  const viewInFlowFocus =
    !flowFocusActive || viewHasFlowStepFocus(viewId, flowFocusHolonIds);

  return (
    <div
      style={{
        width,
        opacity: viewInFlowFocus ? 1 : FLOW_DIM_OPACITY,
        transition: "opacity 0.12s ease",
      }}
    >
      <RegisterViewArtboard title={title} subtitle={subtitle} width={width} t={t}>
        <RegisterViewFrameContent viewId={viewId} t={t} />
      </RegisterViewArtboard>
    </div>
  );
}
