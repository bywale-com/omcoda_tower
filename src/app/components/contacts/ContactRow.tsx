import { useState } from "react";
import type { Contact } from "../../data/contacts";
import { CONTACT_ROW_HOLON } from "../docs/contactsBodyHolons";
import { docsTargetHighlight, useIsDocsTarget } from "../docs/docsHighlight";
import {
  DOCS_TREE_ACTIVE_BORDER,
  DOCS_TREE_ROW_GAP,
  DOCS_TREE_ROW_H,
  DOCS_TREE_ROW_PAD_X,
  docsTreeChildPadLeft,
} from "../docs/treeLayout";
import type { Tokens } from "../tokens";
import { ContactIndicatorIcon } from "./ContactIndicatorIcon";
import { directoryRowMetaStyle, directoryRowPrimaryStyle } from "./directoryRowStyles";

export function ContactRow({
  contact,
  isActive,
  t,
  onContactClick,
}: {
  contact: Contact;
  isActive: boolean;
  t: Tokens;
  onContactClick: (id: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isDocsHighlighted = useIsDocsTarget(CONTACT_ROW_HOLON.id);

  return (
    <div
      onClick={() => onContactClick(contact.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: DOCS_TREE_ROW_GAP,
        height: DOCS_TREE_ROW_H,
        padding: `0 ${DOCS_TREE_ROW_PAD_X}px`,
        paddingLeft: docsTreeChildPadLeft(isActive),
        cursor: "pointer",
        background: isActive ? t.activeRowBg : hovered ? t.hoverBg : "transparent",
        borderLeft: isActive ? `${DOCS_TREE_ACTIVE_BORDER}px solid ${t.accent}` : `${DOCS_TREE_ACTIVE_BORDER}px solid transparent`,
        borderRadius: 4,
        boxSizing: "border-box",
        ...docsTargetHighlight(isDocsHighlighted, t.accent),
      }}
    >
      <ContactIndicatorIcon indicator={contact.indicator} t={t} isRowActive={isActive} />

      <span style={directoryRowPrimaryStyle(t.textPrimary)} title={contact.name}>
        {contact.name}
      </span>

      <span style={directoryRowMetaStyle(t)}>{contact.phone}</span>
    </div>
  );
}
