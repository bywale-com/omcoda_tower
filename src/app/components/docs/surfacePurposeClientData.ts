import type { SurfacePurposeEntry } from "./surfacePurpose";

/**
 * Client Data — the consultant's working file on one client: profile, CRS
 * trend, and engagement history behind one tabbed panel.
 */
export const SURFACE_PURPOSE_CLIENT_DATA: Record<string, SurfacePurposeEntry> = {
  "data-panel-header": {
    holonId: "data-panel-header",
    purpose:
      "Anchors the client's working file — profile, CRS trend, and engagement history — inside one tabbed panel so the consultant never has to leave the client to see the full picture.",
    context:
      "Organizes the record into three lenses the consultant switches between — [[data-panel-tab-read|Information]] for profile facts, [[data-panel-tab-data|History]] for the CRS trend, and [[data-panel-tab-logs|Activity]] for engagement history — plus [[client-data-open-tab|Open in Tab]] to pop the whole panel into its own workspace tab.",
    seat: "consultant",
  },
  "client-data-open-tab": {
    holonId: "client-data-open-tab",
    purpose:
      "Lets the consultant break the client data panel out of the split view into a full workspace tab when they need more room to work the file.",
    seat: "consultant",
  },
  "data-panel-tab-read": {
    holonId: "data-panel-tab-read",
    purpose:
      "Surfaces the client's static profile facts as the default view a consultant lands on when they open the record.",
    context:
      "Holds the [[profile-table|Profile Table]], the read-only field list a consultant scans first to orient on who the client is.",
    seat: "consultant",
  },
  "profile-table": {
    holonId: "profile-table",
    purpose:
      "Lists the client's profile fields in a plain read-only table so the consultant can check facts without risk of editing them by accident.",
    seat: "consultant",
  },
  "data-panel-tab-data": {
    holonId: "data-panel-tab-data",
    purpose:
      "Gives the consultant the client's CRS score history as a second lens on the same record.",
    context:
      "Holds [[crs-history|CRS History]], which pairs a scrubbable score timeline with the stats and chart that explain it.",
    seat: "consultant",
  },
  "crs-history": {
    holonId: "crs-history",
    purpose:
      "Tracks how a client's CRS score has moved over time so the consultant can examine whether they're getting closer to or further from an invitation.",
    context:
      "Combines [[crs-scrubber|CRS Scrubber]] to move through time, [[crs-stats|CRS Stats]] to read the numbers at that point, and [[crs-chart|CRS Chart]] to see the trend at a glance.",
    seat: "consultant",
  },
  "crs-scrubber": {
    holonId: "crs-scrubber",
    purpose:
      "Lets the consultant drag through the client's CRS score history to inspect any point in time.",
    seat: "consultant",
  },
  "crs-stats": {
    holonId: "crs-stats",
    purpose:
      "Shows the CRS score and its components at the scrubber's current position so the consultant can read the numbers behind the trend.",
    seat: "consultant",
  },
  "crs-chart": {
    holonId: "crs-chart",
    purpose:
      "Plots the client's CRS score over time so the consultant can spot the trend before scrubbing into the detail behind it.",
    seat: "consultant",
  },
  "data-panel-tab-logs": {
    holonId: "data-panel-tab-logs",
    purpose:
      "Gives the consultant the client's engagement history as the third lens on the same record.",
    context:
      "Holds [[activity-panel|Engagement Chart]], which lists and charts every touchpoint the firm has had with the client.",
    seat: "consultant",
  },
  "activity-panel": {
    holonId: "activity-panel",
    purpose:
      "Holds the client's engagement event record — sequences, channels, forms, attempts, escalations — so the consultant can examine what actually happened, not decide what should happen next (that logic lives in Agents / Automations).",
    context:
      "Pairs [[engagement-list|Engagement List]], the row-by-row event record, with [[engagement-timeline|Engagement Timeline]], the same events laid out on a shared clock. Opt-in, nudge, and reactivation appear as peer sequences; channel order and attempt logic were composed elsewhere.",
    seat: "consultant",
  },
  "engagement-list": {
    holonId: "engagement-list",
    purpose:
      "Lists every engagement event for the client as rows so the firm has a scannable record of what fired.",
    context:
      "Rows differ by kind: [[engagement-sequence-row|Sequence Row]] groups a campaign's events, [[engagement-channel-row|Channel Row]] records one channel or standalone journey, [[engagement-form-visit-row|Form Visit Row]] records a form visit, [[engagement-event-row|Event Row]] records a discrete event, [[engagement-escalation-row|Escalation Row]] records an escalation, and [[engagement-attempt-row|Attempt Row]] records a single outreach attempt.",
    seat: "consultant",
  },
  "engagement-sequence-row": {
    holonId: "engagement-sequence-row",
    purpose:
      "Groups the events that belong to one sequence so the record shows a campaign as a single expandable row instead of a flat pile of sends.",
    seat: "consultant",
  },
  "engagement-channel-row": {
    holonId: "engagement-channel-row",
    purpose:
      "Records activity on a single channel, or a standalone journey, so the consultant can examine the event history channel by channel.",
    seat: "consultant",
  },
  "engagement-form-visit-row": {
    holonId: "engagement-form-visit-row",
    purpose:
      "Records when the client visited a form so the engagement history includes that self-serve touchpoint.",
    seat: "consultant",
  },
  "engagement-event-row": {
    holonId: "engagement-event-row",
    purpose:
      "Records a discrete event in the client's engagement history so it appears among the surrounding rows.",
    seat: "consultant",
  },
  "engagement-escalation-row": {
    holonId: "engagement-escalation-row",
    purpose:
      "Records when an engagement was escalated so the history shows where the sequence handed off or intensified.",
    seat: "consultant",
  },
  "engagement-attempt-row": {
    holonId: "engagement-attempt-row",
    purpose:
      "Records a single outreach attempt so individual tries sit in the history alongside grouped sequence activity.",
    seat: "consultant",
  },
  "engagement-timeline": {
    holonId: "engagement-timeline",
    purpose:
      "Lays the same engagement event record out on a shared clock so the consultant can examine when touchpoints landed relative to each other.",
    context:
      "Draws the same events as [[engagement-sequence-bar|Sequence Bar]] for grouped sequences, [[engagement-attempt-band|Attempt Band]] for individual tries, [[engagement-segment-bar|Segment Bar]] for channel and form-visit spans, [[engagement-event-marker|Event Marker]] for discrete events, and [[engagement-escalation-band|Escalation Band]] for escalations.",
    seat: "consultant",
  },
  "engagement-sequence-bar": {
    holonId: "engagement-sequence-bar",
    purpose:
      "Draws a sequence as a bar on the timeline so its span is visible next to other recorded activity.",
    seat: "consultant",
  },
  "engagement-attempt-band": {
    holonId: "engagement-attempt-band",
    purpose:
      "Draws a single outreach attempt as a band on the timeline so its timing is visible in the record.",
    seat: "consultant",
  },
  "engagement-segment-bar": {
    holonId: "engagement-segment-bar",
    purpose:
      "Draws a channel or form-visit span on the timeline so those recorded stretches are comparable at a glance.",
    seat: "consultant",
  },
  "engagement-event-marker": {
    holonId: "engagement-event-marker",
    purpose:
      "Marks a discrete recorded event on the timeline so its landing relative to other activity is visible.",
    seat: "consultant",
  },
  "engagement-escalation-band": {
    holonId: "engagement-escalation-band",
    purpose:
      "Draws a recorded escalation as a band on the timeline so when the sequence intensified is visible.",
    seat: "consultant",
  },
};
