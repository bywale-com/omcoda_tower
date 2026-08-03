import type { JourneyFlow } from "./types";

/**
 * Core close (ALG-shaped) — verified happy path.
 * Prepared Workspace → hard inputs → operator arm → contact → consultant receives.
 */
export const CORE_CLOSE_FLOW: JourneyFlow = {
  id: "core-close-alg",
  label: "Core close (ALG-shaped)",
  summary:
    "A firm’s campaign is already staged. The consultant opens Prepared Workspace, hands over the book, and accepts license + escrow — then engagement runs without them configuring anything. Reachable contacts get firm-branded consent, refresh facts, and book; the consultant receives the meeting on Board / Meetings with a Live brief. Operator binds packs and arms the campaign between hard inputs and contact motion; contact never sits a Tower desk.",
  steps: [
    {
      id: "core-01-prepared-workspace",
      label: "Prepared Workspace",
      persona: "consultant",
      surfaceLabel: "Prepared Workspace",
      beat: "Staged campaign under the firm’s identity; readiness walkthrough — what’s prepared, what’s still required.",
    },
    {
      id: "core-02-authorize-book",
      label: "Authorize book",
      persona: "consultant",
      surfaceLabel: "Authorize book",
      beat: "Connect / confirm the private book — the hard hand-over that makes the campaign real.",
    },
    {
      id: "core-03-accept-terms",
      label: "Accept terms",
      persona: "consultant",
      surfaceLabel: "Accept terms",
      beat: "License acknowledgement + Escrow terms — accountability and money door.",
    },
    {
      id: "core-04-activation-state",
      label: "Activation state",
      persona: "operator",
      surfaceLabel: "Activation state",
      beat: "Hard inputs landed → campaign can run (operator observes finish line).",
    },
    {
      id: "core-05-firm-bind",
      label: "Firm operations bind",
      persona: "operator",
      surfaceLabel: "Firm operations bind",
      beat: "Bind house packs under this firm identity → Armed / Active (enablement is per-tenancy).",
    },
    {
      id: "core-06-book-readiness",
      label: "Book readiness",
      persona: "operator",
      surfaceLabel: "Book readiness",
      beat: "Reachability audit — only sequence-ready contacts enroll.",
    },
    {
      id: "core-07-consent",
      label: "Consent request",
      persona: "contact",
      surfaceLabel: "Consent request",
      beat: "Firm-branded Agree (no Tower login) before deeper collection.",
    },
    {
      id: "core-08-nudge",
      label: "Nudge message",
      persona: "contact",
      surfaceLabel: "Nudge message",
      beat: "Self-reportable facts refresh — machinery, not consultant craft.",
    },
    {
      id: "core-09-booking",
      label: "Booking",
      persona: "contact",
      surfaceLabel: "Booking",
      beat: "Meeting invitation lands; contact books.",
    },
    {
      id: "core-10-live-brief",
      label: "Live brief",
      persona: "consultant",
      surfaceLabel: "Live brief",
      beat: "Receive what’s booked; take the meeting — still no Automations authorship.",
    },
  ],
};
