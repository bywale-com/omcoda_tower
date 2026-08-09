import type { CoverageIssue, SystemMapModel } from "./types";

/** §5 coverage checks — runnable against map data. */
export function runCoverageChecks(model: SystemMapModel): CoverageIssue[] {
  const issues: CoverageIssue[] = [];
  const inboundByTarget = new Map<string, typeof model.edges>();
  for (const e of model.edges) {
    const list = inboundByTarget.get(e.target) ?? [];
    list.push(e);
    inboundByTarget.set(e.target, list);
  }

  for (const node of model.nodes) {
    const nonUiOrigins = node.transitions.filter(
      (t) => t.origin === "faceless" || t.origin === "chain" || t.origin === "pure-source",
    );
    const anyInbound = node.transitions.length > 0 || (inboundByTarget.get(node.id)?.length ?? 0) > 0;

    if (node.faceless) {
      const hasFacelessTransition = node.transitions.some((t) => t.origin === "faceless");
      const hasFacelessEdge = (inboundByTarget.get(node.id) ?? []).some((e) => e.faceless);
      if (!hasFacelessTransition && !hasFacelessEdge && nonUiOrigins.length === 0) {
        issues.push({
          code: "faceless-missing-non-ui-origin",
          nodeId: node.id,
          detail: "★ node has no faceless/chain/non-UI origin modeled",
        });
        continue;
      }
    }

    if (!anyInbound && node.transitions.every((t) => t.origin !== "pure-source")) {
      // Allow pure sources: approach_impression / reference house updates etc. already have transitions
      const onlyHardOrControl = node.transitions.every(
        (t) => t.origin === "control" || t.origin === "hard-gate",
      );
      if (node.transitions.length === 0) {
        issues.push({
          code: "dead-node",
          nodeId: node.id,
          detail: "Nothing can change this node (no transitions, no inbound edges)",
        });
        continue;
      }
      if (onlyHardOrControl && !node.faceless) {
        // OK — control/hard-gate fed
      }
    }

    issues.push({ code: "ok", nodeId: node.id, detail: "passes coverage" });
  }

  return issues;
}

export function coverageSummary(issues: CoverageIssue[]) {
  const bugs = issues.filter((i) => i.code !== "ok");
  const ok = issues.filter((i) => i.code === "ok");
  return { ok: ok.length, bugs, total: issues.length };
}
