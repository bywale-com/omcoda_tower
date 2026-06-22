import type { ContentChildHolon } from "../components/docs/clientDataHolons";
import { HolonBoundary } from "../components/docs/HolonBoundary";
import { HOLON_CATALOG_ROOTS } from "../components/docs/holonCatalogTree";
import type { Tokens } from "../components/tokens";

function CatalogHolonBranch({
  holon,
  parentId,
  t,
}: {
  holon: ContentChildHolon;
  parentId: string | null;
  t: Tokens;
}) {
  return (
    <HolonBoundary
      id={holon.id}
      label={holon.label}
      icon={holon.icon}
      lucideIcon={holon.lucideIcon}
      order={holon.order}
      parentId={parentId}
      registerOnly
      inView={false}
      t={t}
    >
      {holon.children?.map((child) => (
        <CatalogHolonBranch key={child.id} holon={child} parentId={holon.id} t={t} />
      ))}
    </HolonBoundary>
  );
}

/** Seeds the shared holon registry from the static catalog (used on /register). */
export function RegisterHolonCatalogBootstrap({ t }: { t: Tokens }) {
  return (
    <>
      {HOLON_CATALOG_ROOTS.map((holon) => (
        <CatalogHolonBranch key={holon.id} holon={holon} parentId={null} t={t} />
      ))}
    </>
  );
}
