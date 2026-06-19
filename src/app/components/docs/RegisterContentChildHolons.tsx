import { HolonBoundary } from "./HolonBoundary";
import type { ContentChildHolon } from "./clientDataHolons";
import type { Tokens } from "../tokens";

/** Register tab content child holons without live DOM (inactive tab bodies) */
export function RegisterContentChildHolons({
  holons,
  inView,
  inViewById,
  onFocus,
  t,
}: {
  holons: ContentChildHolon[];
  inView: boolean;
  /** Per-holon inView override — used for pattern holons with dynamic visibility */
  inViewById?: Record<string, boolean>;
  onFocus?: () => void;
  t: Tokens;
}) {
  return (
    <>
      {holons.map((child) => (
        <HolonBoundary
          key={child.id}
          id={child.id}
          label={child.label}
          icon={child.icon}
          lucideIcon={child.lucideIcon}
          order={child.order}
          registerOnly
          inView={inViewById?.[child.id] ?? inView}
          onFocus={onFocus}
          t={t}
        >
          {child.children?.length ? (
            <RegisterContentChildHolons
              holons={child.children}
              inView={inView}
              inViewById={inViewById}
              onFocus={onFocus}
              t={t}
            />
          ) : null}
        </HolonBoundary>
      ))}
    </>
  );
}

export function RegisterContentChildHolonsFromConfig({
  children,
  inView,
  inViewById,
  onFocus,
  t,
}: {
  children?: ContentChildHolon[];
  inView: boolean;
  inViewById?: Record<string, boolean>;
  onFocus?: () => void;
  t: Tokens;
}) {
  if (!children?.length) return null;
  return (
    <RegisterContentChildHolons
      holons={children}
      inView={inView}
      inViewById={inViewById}
      onFocus={onFocus}
      t={t}
    />
  );
}
