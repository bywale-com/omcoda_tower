import type { CSSProperties } from "react";
import type { WorkflowNodeRunStatus } from "../../../data/automationNodeRuntime";
import type { Tokens } from "../../tokens";

type WorkflowNodeRunChromeProps = {
  runStatus?: WorkflowNodeRunStatus;
  t: Tokens;
};

/** Animated perimeter while running; solid success/fail handled by shell border. */
export function WorkflowNodeRunChrome({ runStatus, t }: WorkflowNodeRunChromeProps) {
  if (runStatus !== "running") return null;

  return (
    <div
      className="tower-workflow-node-run-ring"
      style={
        {
          ["--tower-run-color"]: t.success,
          ["--tower-run-inner-bg"]: t.bgPrimary,
        } as CSSProperties
      }
      aria-hidden
    />
  );
}
