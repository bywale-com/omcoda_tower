import type { Node } from "@xyflow/react";
import type { Tokens } from "../../components/tokens";
import { REGISTER_VIEWS } from "../views";
import type { RegisterViewPosition } from "./registerViewLayout";
import type { RegisterViewFrameNodeData } from "./RegisterViewFrameNode";

const FRAME_GAP_X = 120;
const FRAME_ORIGIN = { x: 48, y: 48 };

export function createRegisterViewNodes(
  t: Tokens,
  savedPositions: Record<string, RegisterViewPosition> = {},
): Node<RegisterViewFrameNodeData>[] {
  let defaultX = FRAME_ORIGIN.x;

  return REGISTER_VIEWS.map((view) => {
    const saved = savedPositions[view.id];
    const position = saved ?? { x: defaultX, y: FRAME_ORIGIN.y };
    if (!saved) defaultX += view.width + FRAME_GAP_X;

    return {
      id: `view-${view.id}`,
      type: "registerViewFrame",
      position,
      dragHandle: ".register-view-drag-handle",
      draggable: true,
      selectable: true,
      data: {
        viewId: view.id,
        title: view.title,
        subtitle: view.subtitle,
        width: view.width,
        activeNav: view.activeNav,
        t,
      },
    };
  });
}
