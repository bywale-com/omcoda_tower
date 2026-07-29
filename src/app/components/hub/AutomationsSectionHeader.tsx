import { AUTOMATIONS_SECTION_HOLON } from "../docs/hubBodyHolons";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import { s } from "../docs/treeLayout";
import type { Tokens } from "../tokens";
import { DirectorySectionHeader } from "../contacts/DirectorySectionHeader";

export function AutomationsSectionHeader({
  count,
  onAddAutomation,
  t,
}: {
  count: number;
  onAddAutomation?: () => void;
  t: Tokens;
}) {
  return (
    <DirectorySectionHeader
      holonId={AUTOMATIONS_SECTION_HOLON.id}
      holonLabel={AUTOMATIONS_SECTION_HOLON.label}
      holonIcon={AUTOMATIONS_SECTION_HOLON.icon}
      holonOrder={SHELL_HOLON_ORDER["automations-section"]}
      sectionIcon="lightning-bolt"
      label="Automations"
      count={count}
      plusTitle="Add automation"
      sortTitle="Sort automations"
      marginTop={s(4)}
      onPlusClick={onAddAutomation}
      t={t}
    />
  );
}
