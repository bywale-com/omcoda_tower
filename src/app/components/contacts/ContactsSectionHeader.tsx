import { CONTACTS_SECTION_HOLON } from "../docs/contactsBodyHolons";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import type { Tokens } from "../tokens";
import { DirectorySectionHeader } from "./DirectorySectionHeader";

export function ContactsSectionHeader({
  count,
  t,
}: {
  count: number;
  t: Tokens;
}) {
  return (
    <DirectorySectionHeader
      holonId={CONTACTS_SECTION_HOLON.id}
      holonLabel={CONTACTS_SECTION_HOLON.label}
      holonIcon={CONTACTS_SECTION_HOLON.icon}
      holonOrder={SHELL_HOLON_ORDER["contacts-section"]}
      sectionIcon="user-squares"
      label="Contacts"
      count={count}
      plusTitle="Add contact"
      sortTitle="Sort contacts"
      t={t}
    />
  );
}
