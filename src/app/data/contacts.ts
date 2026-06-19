import { clientList, type ClientMeta } from "./clients";

export type ContactIndicator = "sequenced" | "silenced" | "unsequenced";

export type Contact = {
  id: string;
  name: string;
  phone: string;
  indicator: ContactIndicator;
  /** Set when this contact maps to an onboarded client */
  clientId?: string;
};

const EXTRA_CONTACTS: Omit<Contact, "indicator">[] = [
  { id: "elena-vasquez", name: "Elena Vasquez", phone: "(604) 555-0142" },
  { id: "tom-okada", name: "Tom Okada", phone: "(416) 555-0198" },
  { id: "nina-patel", name: "Nina Patel", phone: "(403) 555-0167" },
  { id: "omar-hassan", name: "Omar Hassan", phone: "(780) 555-0133" },
  { id: "rachel-kim", name: "Rachel Kim", phone: "(236) 555-0181" },
];

const CLIENT_PHONES: Record<string, string> = {
  sarah: "(604) 555-0101",
  marcus: "(604) 555-0102",
  mark: "(416) 555-0103",
  aisha: "(403) 555-0104",
  priya: "(604) 555-0105",
  daniel: "(647) 555-0106",
  fatima: "(403) 555-0107",
  james: "(416) 555-0108",
  lin: "(604) 555-0109",
  task: "(604) 555-0110",
};

export function contactIndicatorFromClient(client: ClientMeta): ContactIndicator {
  if (!client.optedIn) return "silenced";
  return "sequenced";
}

function contactFromClient(client: ClientMeta): Contact {
  return {
    id: client.id,
    name: client.name,
    phone: CLIENT_PHONES[client.id] ?? "(555) 555-0100",
    indicator: contactIndicatorFromClient(client),
    clientId: client.id,
  };
}

export const contactList: Contact[] = [
  ...clientList.map(contactFromClient),
  ...EXTRA_CONTACTS.map((contact) => ({
    ...contact,
    indicator: "unsequenced" as const,
  })),
];

export function getContact(contactId: string): Contact | undefined {
  return contactList.find((contact) => contact.id === contactId);
}

export function contactTabId(contactId: string): string {
  return `contact-${contactId}`;
}
