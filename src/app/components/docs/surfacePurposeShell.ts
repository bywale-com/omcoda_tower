import type { SurfacePurposeEntry } from "./surfacePurpose";

/**
 * Shell — the chrome everyone shares before reaching a client or contact:
 * login, primary navigation, workspace tabs, headers, and the Console
 * registry itself.
 */
export const SURFACE_PURPOSE_SHELL: Record<string, SurfacePurposeEntry> = {
  "login-form": {
    holonId: "login-form",
    purpose:
      "Gates entry to Tower behind an email and one-time code so only the intended person opens a workspace.",
    context:
      "Chains the sign-in steps behind one [[login-form-banner|Login Form Banner]]: an [[login-email-field|Email Field]] and [[login-submit-control|Log In]] control to request a code, then a [[login-verify-code-field|Verification Code Field]] and [[login-verify-submit-control|Verify Email Address]] control to confirm it.",
    seat: "shared",
  },
  "login-form-banner": {
    holonId: "login-form-banner",
    purpose:
      "Tells whoever is signing in which step they're on and surfaces any error before they retry.",
    seat: "shared",
  },
  "login-email-field": {
    holonId: "login-email-field",
    purpose: "Captures the email address a one-time code will be sent to.",
    seat: "shared",
  },
  "login-submit-control": {
    holonId: "login-submit-control",
    purpose: "Sends the one-time code to the entered email and advances to the verification step.",
    seat: "shared",
  },
  "login-verify-code-field": {
    holonId: "login-verify-code-field",
    purpose: "Captures the one-time code so it can be checked against the one just emailed.",
    seat: "shared",
  },
  "login-verify-submit-control": {
    holonId: "login-verify-submit-control",
    purpose: "Confirms the entered code and opens the workspace once it matches.",
    seat: "shared",
  },
  "primary-navigation": {
    holonId: "primary-navigation",
    purpose:
      "Switches which section fills the sidebar so the team can move between Board, Contacts, and Hub without losing the open workspace tabs.",
    context:
      "Sits beside the Console toggle, swapping the sidebar section — such as [[board-body|Board Body]] — while the [[docs-registry|Console Registry]] can stay open alongside it.",
    seat: "shared",
  },
  "tab-bar": {
    holonId: "tab-bar",
    purpose:
      "Keeps every open client, contact, or hub tool as a tab so the team can jump between them without losing their place.",
    context:
      "Highlights the [[workspace-tab|Workspace Tab]] that's currently active among the open tabs, and sits above the [[breadcrumb|Breadcrumb]] that spells out where that tab leads.",
    seat: "shared",
  },
  "workspace-tab": {
    holonId: "workspace-tab",
    purpose:
      "Represents one open client, contact, or hub tool so the person working it can switch back to it without reopening it from scratch.",
    seat: "shared",
  },
  "breadcrumb": {
    holonId: "breadcrumb",
    purpose:
      "Spells out the path to the active tab's content so the team always knows which client, contact, or tool they're looking at.",
    seat: "shared",
  },
  "workspace-empty": {
    holonId: "workspace-empty",
    purpose:
      "Tells the team the workspace is empty and prompts them to open a client from the board rather than showing a blank pane.",
    seat: "shared",
  },
  "client-header": {
    holonId: "client-header",
    purpose:
      "Identifies which client the consultant is looking at and surfaces their key properties above the narrative underneath.",
    context:
      "Sits above [[client-brief|Client Brief]], the narrative body the header's properties summarize at a glance.",
    seat: "consultant",
  },
  "client-brief": {
    holonId: "client-brief",
    purpose:
      "Tells the client's story in narrative form so the consultant can catch up on the file faster than scanning raw fields.",
    seat: "consultant",
  },
  "contact-header": {
    holonId: "contact-header",
    purpose:
      "Identifies which contact the consultant is looking at, distinct from the clients they may be linked to.",
    context:
      "Sits above [[contact-record|Contact Record]], the detail body the header identifies at a glance.",
    seat: "consultant",
  },
  "contact-record": {
    holonId: "contact-record",
    purpose:
      "Holds the contact's own details separately from any client record, since a contact can exist without being a client.",
    seat: "consultant",
  },
  "docs-header": {
    holonId: "docs-header",
    purpose:
      "Titles the Console panel so the team always knows they're looking at the surface registry, not the app itself.",
    seat: "shared",
  },
  "docs-registry": {
    holonId: "docs-registry",
    purpose:
      "Gives the team a single tree of every documented surface in Tower so they can find, inspect, and jump to any holon.",
    context:
      "Splits the tree into [[docs-home-branch|Home]] for orientation and [[docs-panels-branch|Panels]] for every registered surface, each rendered as a [[docs-outline-row|Console Outline Row]] the team can inspect.",
    seat: "shared",
  },
  "docs-home-branch": {
    holonId: "docs-home-branch",
    purpose: "Orients the team in the Console before they drill into the full panel tree.",
    seat: "shared",
  },
  "docs-panels-branch": {
    holonId: "docs-panels-branch",
    purpose: "Lists every registered surface in Tower as a browsable tree of panels.",
    seat: "shared",
  },
  "docs-outline-row": {
    holonId: "docs-outline-row",
    purpose:
      "Represents one holon in the Console tree so the team can identify it, see if it's live, and act on it.",
    context:
      "Packs a row's [[docs-row-name|Row Name]], [[docs-inview-indicator|In-View Indicator]], and [[docs-row-actions|Row Actions]] into one line so the team can identify, locate, and act on a holon without opening anything else.",
    seat: "shared",
  },
  "docs-row-name": {
    holonId: "docs-row-name",
    purpose: "Labels the holon a Console row represents.",
    seat: "shared",
  },
  "docs-inview-indicator": {
    holonId: "docs-inview-indicator",
    purpose:
      "Shows whether the holon a row represents is currently visible on screen so the team knows before they click to reveal it.",
    seat: "shared",
  },
  "docs-row-actions": {
    holonId: "docs-row-actions",
    purpose:
      "Offers the row's actions — like viewing details or focusing the surface — behind one menu instead of cluttering the row.",
    seat: "shared",
  },
  "status-bar": {
    holonId: "status-bar",
    purpose:
      "Holds firm-wide status at the bottom of the window so the team can check it without leaving whatever tab they're on.",
    seat: "shared",
  },
  "holon-detail-header": {
    holonId: "holon-detail-header",
    purpose:
      "Identifies which holon's article is open when the team reads a Console holon's details.",
    seat: "shared",
  },
  "holon-detail-body": {
    holonId: "holon-detail-body",
    purpose:
      "Holds the written explanation of a holon so the team can read what a surface is for beyond its name.",
    seat: "shared",
  },
};
