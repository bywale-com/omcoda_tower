import { AGENTS_SECTION_HOLON } from "../docs/hubBodyHolons";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import { s } from "../docs/treeLayout";
import type { Tokens } from "../tokens";
import { DirectorySectionHeader } from "../contacts/DirectorySectionHeader";

export function AgentsSectionHeader({
  count,
  t,
}: {
  count: number;
  t: Tokens;
}) {
  return (
    <DirectorySectionHeader
      holonId={AGENTS_SECTION_HOLON.id}
      holonLabel={AGENTS_SECTION_HOLON.label}
      holonIcon={AGENTS_SECTION_HOLON.icon}
      holonOrder={SHELL_HOLON_ORDER["agents-section"]}
      sectionIcon="cursor-click"
      label="Agents"
      count={count}
      plusTitle="Add agent"
      sortTitle="Sort agents"
      marginTop={s(4)}
      t={t}
    />
  );
}
