import type { ReactNode } from "react";
import type { ComposedHolonNode } from "../../components/docs/registerMeta";
import { getPatternInstanceCount } from "../../components/docs/registerMeta";
import type { Tokens } from "../../components/tokens";
import { RegisterHolonRegion } from "../canvas/frameChrome";
import { getRegisterSurface } from "./surfaceRegistry";
import type { RegisterSurfaceProps } from "./surfaceTypes";

type HolonComposerNodeProps = {
  node: ComposedHolonNode;
  viewId: string;
  t: Tokens;
  layoutProps?: Record<string, unknown>;
  instanceIndex?: number;
  /** Prevents pattern holons from re-expanding inside their own instances. */
  suppressPatternExpansion?: boolean;
};

export function HolonComposerNode({
  node,
  viewId,
  t,
  layoutProps,
  instanceIndex = 0,
  suppressPatternExpansion = false,
}: HolonComposerNodeProps) {
  const { meta, children } = node;
  const patternCount = getPatternInstanceCount(meta, viewId);

  if (!suppressPatternExpansion && patternCount > 1 && meta.patternInstances?.[viewId]) {
    return (
      <>
        {Array.from({ length: patternCount }, (_, index) => (
          <HolonComposerNode
            key={`${meta.id}-${index}`}
            node={node}
            viewId={viewId}
            t={t}
            layoutProps={layoutProps}
            instanceIndex={index}
            suppressPatternExpansion
          />
        ))}
      </>
    );
  }

  if (meta.id === "login-form") {
    return renderLoginFormNode({ node, viewId, t, layoutProps, instanceIndex });
  }

  const Surface = getRegisterSurface(meta.render);
  if (!Surface) {
    return (
      <RegisterHolonRegion holonId={meta.id} t={t}>
        <div style={{ padding: 8, fontSize: 11, color: t.textMuted }}>
          Missing surface: {meta.render ?? meta.id}
        </div>
      </RegisterHolonRegion>
    );
  }

  const childNodes = renderChildNodes(children, viewId, t, layoutProps, instanceIndex);

  const regionStyle =
    meta.id === "client-name" || meta.id === "task-label"
      ? { flex: 1, minWidth: 0, display: "flex" as const }
      : undefined;

  return (
    <RegisterHolonRegion holonId={meta.id} t={t} style={regionStyle}>
      <Surface t={t} viewId={viewId} layoutProps={layoutProps} instanceIndex={instanceIndex}>
        {childNodes}
      </Surface>
    </RegisterHolonRegion>
  );
}

function renderLoginFormNode({
  node,
  viewId,
  t,
  layoutProps,
  instanceIndex,
}: HolonComposerNodeProps & { node: ComposedHolonNode }) {
  const banner = node.children.find((child) => child.meta.id === "login-form-banner");
  const bodyChildren = node.children.filter((child) => child.meta.id !== "login-form-banner");
  const step = layoutProps?.step ?? (viewId === "login-verify" ? "verify" : "email");
  const formClass = step === "verify" ? "login-form login-form--verify" : "login-form";

  return (
    <RegisterHolonRegion holonId={node.meta.id} t={t}>
      <div className="login-card">
        {banner && (
          <HolonComposerNode
            node={banner}
            viewId={viewId}
            t={t}
            layoutProps={layoutProps}
            instanceIndex={instanceIndex}
          />
        )}
        <div className="login-card__body">
          <div className={formClass}>
            {renderChildNodes(bodyChildren, viewId, t, layoutProps, instanceIndex)}
          </div>
        </div>
      </div>
    </RegisterHolonRegion>
  );
}

function renderChildNodes(
  children: ComposedHolonNode[],
  viewId: string,
  t: Tokens,
  layoutProps: Record<string, unknown> | undefined,
  instanceIndex: number,
): ReactNode {
  return children.map((child) => (
    <HolonComposerNode
      key={child.meta.id}
      node={child}
      viewId={viewId}
      t={t}
      layoutProps={layoutProps}
      instanceIndex={instanceIndex}
    />
  ));
}
