import type { SurfacePurposeEntry } from "./surfacePurpose";

/**
 * Board — the consultant's desk over the firm's own client book: phases on
 * the meeting path, always-on eligibility signals, and the follow-ups that
 * come out of working that book day to day.
 */
export const SURFACE_PURPOSE_BOARD: Record<string, SurfacePurposeEntry> = {
  "clients-section": {
    holonId: "clients-section",
    purpose:
      "Exists so the consultant can see how many clients are in play and fold the book away without losing their place, before ever opening a row.",
    context:
      "Frames the top of the Board as the firm's own book of clients rather than a generic list — this is the desk a consultant lands on to see who is in play today. It carries the client count and the open/collapse control for [[board-body|Board Body]] below it, which is where every client row, phase signal, and row action actually lives.",
    seat: "consultant",
  },
  "board-body": {
    holonId: "board-body",
    purpose:
      "Holds the scrollable run of client rows so the consultant can scan the whole book — phase by phase — without opening any single client's file.",
    context:
      "This is where the firm's book becomes a working list: each [[client-row|Client Row]] carries a client's [[phase-signal|Phase Signal]], [[client-name|Client Name]], and [[row-actions|Row Actions]] so the consultant can triage the meeting path — who is ready, who is stalled, who needs a nudge — before choosing who to open.",
    seat: "consultant",
  },
  "client-row": {
    holonId: "client-row",
    purpose:
      "Represents one client at their current point on the meeting/eligibility path, giving the consultant a single scannable line instead of a file they'd have to open to get the same read.",
    context:
      "Each row exists to answer three questions at a glance: where is this client in the phase ([[phase-signal|Phase Signal]]), who are they ([[client-name|Client Name]]), and what can the consultant do about it right now ([[row-actions|Row Actions]]) — without leaving the list.",
    seat: "consultant",
  },
  "phase-signal": {
    holonId: "phase-signal",
    purpose:
      "Shows where a client sits on the meeting/eligibility path so the consultant can tell who's ready, who's stalled, and who needs attention without opening the file.",
    seat: "consultant",
  },
  "client-name": {
    holonId: "client-name",
    purpose:
      "Anchors the row to a real, named client so every phase signal and action on that row is unambiguous about whose file it belongs to.",
    seat: "consultant",
  },
  "row-actions": {
    holonId: "row-actions",
    purpose:
      "Puts the next move — open, message, escalate — right on the row the consultant is already scanning, so triage doesn't require a detour to find the control.",
    seat: "consultant",
  },
  "tasks-section": {
    holonId: "tasks-section",
    purpose:
      "Separates what the consultant still owes attention to today from the client list itself, so open work doesn't get lost inside the book it came from.",
    context:
      "Tasks surface the follow-ups the desk still owes — the reminders, callbacks, and preps that came out of the client book but need to be tracked on their own. Each [[task-row|Task Row]] carries a [[task-status-toggle|Status Toggle]], a [[task-label|Task Label]], and [[task-meta|Task Meta]] so the consultant can clear or reprioritize work without hunting through Client Data for it.",
    seat: "consultant",
  },
  "task-row": {
    holonId: "task-row",
    purpose:
      "Represents one outstanding piece of follow-up work as a single line the consultant can clear or defer without reopening the client it came from.",
    context:
      "Each row exists to let the consultant act on a task in place: see what it is ([[task-label|Task Label]]), see when and why it matters ([[task-meta|Task Meta]]), and close it out ([[task-status-toggle|Status Toggle]]) — all without leaving the Tasks list.",
    seat: "consultant",
  },
  "task-status-toggle": {
    holonId: "task-status-toggle",
    purpose:
      "Lets the consultant mark a task done in one click, right where they see it, so clearing follow-ups doesn't require opening anything else.",
    seat: "consultant",
  },
  "task-label": {
    holonId: "task-label",
    purpose:
      "States what the task actually is, so a bare checkbox in the list doesn't leave the consultant guessing which follow-up it belongs to.",
    seat: "consultant",
  },
  "task-meta": {
    holonId: "task-meta",
    purpose:
      "Adds the timing or context a task needs — due date, related client, reason it exists — so the consultant can judge urgency without opening it.",
    seat: "consultant",
  },
};
