import type { SurfacePurposeEntry } from "./surfacePurpose";

/**
 * Contacts — the firm's wider contact directory, upstream of the Board:
 * the people who aren't yet an active client but who a firm can bring in,
 * sequence, or hold as reachable, silenced, or unsequenced.
 */
export const SURFACE_PURPOSE_CONTACTS: Record<string, SurfacePurposeEntry> = {
  "contacts-section": {
    holonId: "contacts-section",
    purpose:
      "Marks the switch from the client book to the wider contact directory — the raw list a firm brings in before anyone becomes an active client on the Board.",
    context:
      "This is where a firm's contact universe lives before or alongside active client work — the directory of people who might become a client or campaign target. It carries the section header and count above [[contacts-body|Contacts Body]], which holds the actual directory rows and their import source.",
    seat: "consultant",
  },
  "contacts-body": {
    holonId: "contacts-body",
    purpose:
      "Holds the scrollable directory of contacts so the consultant can see who is reachable, silenced, or unsequenced without opening each person's record.",
    context:
      "Each [[contact-row|Contact Row]] is one entry in the firm's contact universe, carrying enough of an at-a-glance read — name and reachability indicator — that the consultant can examine who is worth sequencing next without leaving the list.",
    seat: "consultant",
  },
  "contact-row": {
    holonId: "contact-row",
    purpose:
      "Represents one contact with just enough signal — name and reachability state — for the consultant to examine whether they're sequence-ready without opening the record.",
    seat: "consultant",
  },
  "imports-section": {
    holonId: "imports-section",
    purpose:
      "Gives the firm a way to bring outside contact lists into Tower, since the directory is only as useful as the lists a firm actually gets in.",
    context:
      "Imports is how a firm's existing lists — CRM exports, spreadsheets, old leads — become part of the contact directory rather than sitting dormant outside Tower. [[add-import-control|Add Import]] starts that motion, and each [[import-row|Import Row]] tracks one list as it moves from upload toward becoming reachable contacts.",
    seat: "consultant",
  },
  "add-import-control": {
    holonId: "add-import-control",
    purpose:
      "Starts the import flow directly from the section a firm is already looking at, so bringing in a list doesn't require hunting for the right entry point elsewhere.",
    seat: "consultant",
  },
  "import-row": {
    holonId: "import-row",
    purpose:
      "Tracks one imported list as its own unit so the consultant can tell which lists have landed and which are still mid-import, instead of only ever seeing the contacts that result.",
    seat: "consultant",
  },
};
