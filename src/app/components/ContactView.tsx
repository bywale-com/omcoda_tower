import { getContact } from "../data/contacts";
import { HolonBoundary } from "./docs/HolonBoundary";
import { SHELL_HOLON_ORDER } from "./docs/shellHolonOrder";
import { docsLabelStyle, DOCS_FONT_PROFILE } from "./docs/treeTypography";
import { ContactIndicatorIcon } from "./contacts/ContactIndicatorIcon";
import { NotionIcon } from "./icons/NotionIcon";
import type { Tokens } from "./tokens";

type ContactViewProps = {
  contactId: string;
  t: Tokens;
};

export function ContactView({ contactId, t }: ContactViewProps) {
  const contact = getContact(contactId);

  if (!contact) {
    return (
      <div style={{ padding: 28, color: t.textDim, fontSize: 13 }}>
        Contact not found.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        background: t.bgPrimary,
      }}
    >
      <HolonBoundary
        id="contact-header"
        label="Contact Header"
        icon="user"
        order={SHELL_HOLON_ORDER["contact-header"]}
        t={t}
        style={{ padding: "24px 28px 10px", flexShrink: 0, background: t.bgPrimary }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ContactIndicatorIcon indicator={contact.indicator} t={t} isRowActive />
          <h1
            style={{
              ...DOCS_FONT_PROFILE,
              fontSize: 28,
              color: t.textPrimary,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {contact.name}
          </h1>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "18px 108px minmax(0, 1fr)",
            alignItems: "center",
            columnGap: 8,
            minHeight: 30,
            padding: "2px 0",
          }}
        >
          <NotionIcon name="cursor-click" size={14} color={t.textDim} />
          <span style={docsLabelStyle(13, t.textMuted)}>Phone</span>
          <span style={{ fontSize: 13, color: t.textPrimary, lineHeight: 1.4 }}>
            {contact.phone}
          </span>
        </div>
      </HolonBoundary>

      <HolonBoundary
        id="contact-record"
        label="Contact Record"
        icon="document"
        order={SHELL_HOLON_ORDER["contact-record"]}
        t={t}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 28px 24px",
          color: t.textDim,
          fontSize: 13,
          lineHeight: 1.55,
        }}
      >
        Contact record sections coming soon.
      </HolonBoundary>
    </div>
  );
}
