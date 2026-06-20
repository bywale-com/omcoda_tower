import {
  createContext,
  useContext,
  useLayoutEffect,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import type { NotionIconName } from "../../icons/notion-icon-urls";
import type { HolonLucideIconName } from "./holonIcons";
import { useDocsRegistry } from "../../context/DocsRegistryContext";
import { docsTargetHighlight, useIsDocsTarget } from "./docsHighlight";
import type { Tokens } from "../tokens";

const HolonParentContext = createContext<string | null>(null);

export type HolonBoundaryProps = {
  id: string;
  label: string;
  icon?: NotionIconName;
  /** Live Lucide icon — use when the holon surface uses Lucide in the UI */
  lucideIcon?: HolonLucideIconName;
  /** Sort key among siblings — lower first */
  order?: number;
  /** Override inferred parent from ancestor holons */
  parentId?: string | null;
  /** Accent for highlight ring — defaults to theme accent */
  highlightColor?: string;
  /** When false, hover won't draw a ring (holon still appears in tree) */
  highlightWhen?: boolean;
  /** Register in Console tree without rendering a wrapper (for off-screen holons) */
  registerOnly?: boolean;
  /** Override in-view state for Console tree eye indicator */
  inView?: boolean;
  /** Called when user clicks the closed-eye reveal control in the Console tree */
  onFocus?: () => void;
  style?: CSSProperties;
  t: Tokens;
  children: ReactNode;
} & Pick<HTMLAttributes<HTMLDivElement>, "onClick" | "onMouseEnter" | "onMouseLeave">;

export function HolonBoundary({
  id,
  label,
  icon,
  lucideIcon,
  order = 0,
  parentId,
  highlightColor,
  highlightWhen = true,
  registerOnly = false,
  inView: inViewOverride,
  onFocus,
  style,
  t,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: HolonBoundaryProps) {
  const ancestorParentId = useContext(HolonParentContext);
  const resolvedParentId = parentId !== undefined ? parentId : ancestorParentId;
  const { register, unregister, registerFocus, unregisterFocus } = useDocsRegistry();
  const isHighlighted = useIsDocsTarget(id) && highlightWhen;
  const ringColor = highlightColor ?? t.accent;
  const inView = inViewOverride ?? !registerOnly;

  useLayoutEffect(() => {
    register({ id, label, icon, lucideIcon, parentId: resolvedParentId, order, inView });
    return () => unregister(id);
  }, [id, label, icon, lucideIcon, resolvedParentId, order, inView, register, unregister]);

  useLayoutEffect(() => {
    if (!onFocus) return;
    registerFocus(id, onFocus);
    return () => unregisterFocus(id);
  }, [id, onFocus, registerFocus, unregisterFocus]);

  if (registerOnly) {
    return (
      <HolonParentContext.Provider value={id}>
        {children}
      </HolonParentContext.Provider>
    );
  }

  return (
    <HolonParentContext.Provider value={id}>
      <div
        style={{ ...style, ...docsTargetHighlight(isHighlighted, ringColor) }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    </HolonParentContext.Provider>
  );
}
