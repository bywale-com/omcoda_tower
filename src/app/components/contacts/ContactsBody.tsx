import type { Contact } from "../../data/contacts";
import type { ContactImport } from "../../data/imports";
import {
  CONTACT_ROW_HOLON,
  CONTACTS_BODY_HOLON,
  IMPORT_ROW_HOLON,
} from "../docs/contactsBodyHolons";
import { HolonBoundary } from "../docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "../docs/shellHolonOrder";
import type { Tokens } from "../tokens";
import { ContactRow } from "./ContactRow";
import { ImportRow } from "./ImportRow";
import { ImportsSectionHeader } from "./ImportsSectionHeader";

export function ContactsBody({
  contacts,
  imports,
  activeContactId,
  onContactClick,
  t,
  registerMode = false,
}: {
  contacts: Contact[];
  imports: ContactImport[];
  activeContactId: string | null;
  onContactClick: (id: string) => void;
  t: Tokens;
  registerMode?: boolean;
}) {
  const contactsInView = contacts.length > 0;
  const importsInView = imports.length > 0;

  return (
    <div
      data-register-surface={registerMode ? "Contacts" : undefined}
      style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      <HolonBoundary
        id={CONTACTS_BODY_HOLON.id}
        label={CONTACTS_BODY_HOLON.label}
        icon={CONTACTS_BODY_HOLON.icon}
        order={SHELL_HOLON_ORDER["contacts-body"]}
        t={t}
        style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
      >
        <HolonBoundary
          id={CONTACT_ROW_HOLON.id}
          label={CONTACT_ROW_HOLON.label}
          icon={CONTACT_ROW_HOLON.icon}
          order={CONTACT_ROW_HOLON.order}
          registerOnly
          inView={contactsInView}
          t={t}
        >
          {null}
        </HolonBoundary>

        {contacts.map((contact) => (
          <ContactRow
            key={contact.id}
            contact={contact}
            isActive={activeContactId === contact.id}
            t={t}
            onContactClick={onContactClick}
          />
        ))}

        <div data-register-surface={registerMode ? "Imports" : undefined}>
          <ImportsSectionHeader count={imports.length} t={t} />

          <HolonBoundary
            id={IMPORT_ROW_HOLON.id}
            label={IMPORT_ROW_HOLON.label}
            icon={IMPORT_ROW_HOLON.icon}
            order={IMPORT_ROW_HOLON.order}
            registerOnly
            inView={importsInView}
            t={t}
          >
            {null}
          </HolonBoundary>

          {imports.map((item) => (
            <ImportRow key={item.id} item={item} t={t} />
          ))}
        </div>
      </HolonBoundary>
    </div>
  );
}
