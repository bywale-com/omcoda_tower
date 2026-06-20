import type { ContactImport } from "../../data/imports";
import { AUDITS_SECTION_HOLON } from "../docs/hubBodyHolons";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import type { Tokens } from "../tokens";
import { DirectorySectionHeader } from "../contacts/DirectorySectionHeader";
import { AddAuditFlow } from "./AddAuditFlow";

export function AuditsSectionHeader({
  count,
  imports,
  t,
  onAuditImportsContinue,
}: {
  count: number;
  imports: ContactImport[];
  t: Tokens;
  onAuditImportsContinue?: (importIds: string[]) => void;
}) {
  return (
    <DirectorySectionHeader
      holonId={AUDITS_SECTION_HOLON.id}
      holonLabel={AUDITS_SECTION_HOLON.label}
      holonIcon={AUDITS_SECTION_HOLON.icon}
      holonOrder={SHELL_HOLON_ORDER["audits-section"]}
      sectionIcon="magnifying-glass"
      label="Audits"
      count={count}
      plusTitle="Add audit"
      sortTitle="Sort audits"
      plusButton={
        <AddAuditFlow
          t={t}
          imports={imports}
          onContinueWithImports={onAuditImportsContinue}
        />
      }
      t={t}
    />
  );
}
