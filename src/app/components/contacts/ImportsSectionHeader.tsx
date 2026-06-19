import { IMPORTS_SECTION_HOLON } from "../docs/contactsBodyHolons";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import { s } from "../docs/treeLayout";
import type { Tokens } from "../tokens";
import { DirectorySectionHeader } from "./DirectorySectionHeader";

export function ImportsSectionHeader({
  count,
  t,
}: {
  count: number;
  t: Tokens;
}) {
  return (
    <DirectorySectionHeader
      holonId={IMPORTS_SECTION_HOLON.id}
      holonLabel={IMPORTS_SECTION_HOLON.label}
      holonIcon={IMPORTS_SECTION_HOLON.icon}
      holonOrder={SHELL_HOLON_ORDER["imports-section"]}
      sectionIcon="documents"
      label="Imports"
      count={count}
      plusTitle="Add import"
      sortTitle="Sort imports"
      marginTop={s(4)}
      t={t}
    />
  );
}
