/**
 * Shared meetings store — contact booking appends; consultant Meetings/Board read.
 */
import { useSyncExternalStore } from "react";
import { wirePorts } from "../../../wire";
import type { FactWritebackRow } from "../../../wire/machineTypes";

export type LiveBriefFact = {
  label: string;
  value: string;
  signal: string;
  signalHint?: string;
};

export type StoredMeeting = {
  id: string;
  clientId: string;
  contactName: string;
  time: string;
  status: "Upcoming" | "Tentative" | "In progress";
  phase: string;
  purpose: string;
  highlight?: string;
  startsIn?: string;
  asOf?: string;
  overview: string;
  pathway: string;
  observation: string;
  facts?: LiveBriefFact[];
};

const SEED_MEETINGS: StoredMeeting[] = [
  {
    id: "m1",
    clientId: "sarah",
    contactName: "Sarah Chen",
    time: "Thu 2:00 PM",
    status: "Upcoming",
    phase: "Meeting-ready",
    purpose: "Discovery · Express Entry / CEC",
    highlight: "Work permit · 47 days",
    startsIn: "in 2h 14m",
    asOf: "As of · write-back 11:02",
    overview:
      "Sarah is a software engineer on a Canadian work permit pursuing PR through Express Entry CEC. File is clean; CRS sits above the recent CEC draw line. Activation window is now.",
    pathway:
      "Qualifies under CEC on 12+ months skilled work (TEER 1), CLB 9, and valid TR status. Primary risk is timing — permit lapse before ITA would break CEC eligibility until status is renewed.",
    observation:
      "Meeting-grade brief for take-meeting. Close the loop on permit timing; she does not need chasing — she needs a consultant decision in session.",
    facts: [
      {
        label: "Work permit end",
        value: "Sep 15, 2026",
        signal: "Timing risk",
        signalHint: "Permit window may close before ITA",
      },
      {
        label: "CRS estimate",
        value: "487",
        signal: "Above CEC line",
        signalHint: "Score above recent CEC draw cutoff",
      },
      {
        label: "CLB lowest",
        value: "CLB 9",
        signal: "Language met",
        signalHint: "Language threshold satisfied",
      },
      {
        label: "EE pool",
        value: "In pool · Jan refresh",
        signal: "Current",
        signalHint: "Profile refreshed in current pool window",
      },
    ],
  },
  {
    id: "m2",
    clientId: "james",
    contactName: "James Okonkwo",
    time: "Fri 10:30 AM",
    status: "Upcoming",
    phase: "Meeting-ready",
    purpose: "Pathway review · FSW → CEC",
    highlight: "CRS 421 · below recent FSW",
    startsIn: "Fri · 10:30 AM",
    asOf: "As of · write-back yesterday",
    overview:
      "James is accumulating Canadian work experience toward the 12-month CEC mark. Current FSW CRS sits below recent draws; stream switch is the forward path.",
    pathway:
      "Language meets both streams. TEER-eligible occupation. Reassessment triggers at the work-history milestone — not a chase activation today.",
    observation:
      "Use the session to confirm documentation readiness for the stream switch and set expectations on timing. No illegal/unethical motion on this file.",
    facts: [
      {
        label: "Canadian work months",
        value: "9 of 12",
        signal: "CEC pending",
        signalHint: "CEC eligibility pending work months",
      },
      {
        label: "CRS (FSW)",
        value: "421",
        signal: "Below FSW draw",
        signalHint: "Below recent FSW cutoffs",
      },
      {
        label: "Language",
        value: "CLB 8",
        signal: "Meets both streams",
        signalHint: "Language meets FSW and CEC",
      },
    ],
  },
  {
    id: "m3",
    clientId: "priya",
    contactName: "Priya Nair",
    time: "Next week · TBD",
    status: "Tentative",
    phase: "In motion",
    purpose: "Brief follow-up · PNP nomination",
    highlight: "Nomination under review",
    startsIn: "Next week · TBD",
    asOf: "As of · pre-book snapshot",
    overview:
      "Priya's provincial nomination remains under review. Federal profile alone is not competitive; nomination is the critical path item.",
    pathway:
      "Monitor nomination decision. Language reassessment (CLB step-up) is the hedge if processing continues to slip.",
    observation:
      "Tentative booking — confirm attendance before deep prep. Live brief still loads so the desk can refuse or proceed with eyes open.",
    facts: [
      {
        label: "PNP status",
        value: "Under review",
        signal: "Critical path",
        signalHint: "Nomination is the blocking item",
      },
      {
        label: "Federal CRS alone",
        value: "Not competitive",
        signal: "Needs nomination",
        signalHint: "Federal score needs nomination lift",
      },
    ],
  },
];

let meetings: StoredMeeting[] = [...SEED_MEETINGS];
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

export function subscribeMeetings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMeetings(): readonly StoredMeeting[] {
  return meetings;
}

export function addMeeting(meeting: StoredMeeting): void {
  meetings = [...meetings, meeting];
  emit();
}

export function useMeetings(): readonly StoredMeeting[] {
  return useSyncExternalStore(subscribeMeetings, getMeetings, getMeetings);
}

export type TodayMeetingChip = {
  id: string;
  contactName: string;
  time: string;
  clientId: string;
};

export function selectConsultantTodayMeetings(rows: readonly StoredMeeting[]): TodayMeetingChip[] {
  return rows
    .filter((m) => m.status === "Upcoming")
    .map((m) => ({
      id: m.id,
      contactName: m.contactName,
      time: m.time,
      clientId: m.clientId,
    }));
}

export function selectMeetingReadyClientIds(rows: readonly StoredMeeting[]): Set<string> {
  return new Set(rows.filter((m) => m.phase === "Meeting-ready").map((m) => m.clientId));
}

function labelToFieldKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function writebackRowToFact(row: FactWritebackRow): LiveBriefFact | null {
  const raw = row.value;
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.label === "string" && typeof obj.value === "string" && typeof obj.signal === "string") {
      return {
        label: obj.label,
        value: obj.value,
        signal: obj.signal,
        signalHint: typeof obj.signalHint === "string" ? obj.signalHint : undefined,
      };
    }
  }
  if (row.field_key) {
    return {
      label: row.field_key.replace(/_/g, " "),
      value: raw == null ? "" : String(raw),
      signal: "Write-back",
      signalHint: "Machine fact write-back",
    };
  }
  return null;
}

function writebacksToFacts(writebacks: FactWritebackRow[]): LiveBriefFact[] {
  const byKey = new Map<string, FactWritebackRow>();
  for (const row of writebacks) {
    const key = row.field_key ?? row.id;
    const prev = byKey.get(key);
    if (!prev || row.created_at > prev.created_at) byKey.set(key, row);
  }
  const facts: LiveBriefFact[] = [];
  for (const row of byKey.values()) {
    const fact = writebackRowToFact(row);
    if (fact) facts.push(fact);
  }
  return facts;
}

export function mergeFactsPreferMachine(machine: LiveBriefFact[], snapshot: LiveBriefFact[]): LiveBriefFact[] {
  const machineLabels = new Set(machine.map((f) => f.label.toLowerCase()));
  const kept = snapshot.filter((f) => !machineLabels.has(f.label.toLowerCase()));
  return [...machine, ...kept];
}

function applyFactsToMeetingsStore(input: {
  clientId: string;
  source: string;
  facts: LiveBriefFact[];
  cascadeNote?: string;
}): void {
  const now = new Date();
  const asOf = `As of · write-back ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const cascadeSuffix = input.cascadeNote ? ` · ${input.cascadeNote}` : "";
  let touched = false;
  meetings = meetings.map((m) => {
    if (m.clientId !== input.clientId) return m;
    touched = true;
    const kept = (m.facts ?? []).filter((f) => !input.facts.some((nf) => nf.label === f.label));
    return {
      ...m,
      asOf,
      facts: [...kept, ...input.facts],
      observation: `${m.observation} · ${input.source} write-back refreshed Live brief facts.${cascadeSuffix}`,
    };
  });
  if (!touched && input.facts.length > 0) {
    addMeeting({
      id: `m-facts-${input.clientId}`,
      clientId: input.clientId,
      contactName: input.clientId,
      time: "TBD",
      status: "Tentative",
      phase: "In motion",
      purpose: "Facts write-back",
      asOf,
      overview: `${input.source} wrote self-reportable facts before booking.`,
      pathway: "Facts held for Live brief once meeting is confirmed.",
      observation: `${input.source} write-back.${cascadeSuffix}`,
      facts: input.facts,
    });
    return;
  }
  if (touched) emit();
}

/** Read machine write-backs (+ latest eligibility cue) and merge into Live brief facts. */
export async function hydrateFactsFromMachine(clientId: string): Promise<{
  facts: LiveBriefFact[];
  cascadeNote?: string;
  asOf?: string;
}> {
  const writebacks = await wirePorts.machineApi.listFactWritebacks(clientId);
  const facts = writebacksToFacts(writebacks);

  let cascadeNote: string | undefined;
  try {
    const board = await wirePorts.machineApi.boardDetections();
    const latest = board.eligibilityResults
      .filter((r) => r.contact_id === clientId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
    if (latest?.result && (latest.result as { trigger?: string }).trigger === "fact_writeback") {
      cascadeNote = "Cascade re-eval ran after latest fact write-back.";
    }
  } catch {
    // boardDetections optional — facts still hydrate from writebacks
  }

  const latestWriteback = [...writebacks].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const asOf = latestWriteback
    ? `As of · machine write-back ${new Date(latestWriteback.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : undefined;

  return { facts, cascadeNote, asOf };
}

/** Contact portal self-reportable submit — refresh Live brief facts for the client. */
export async function writeBackContactFacts(input: {
  clientId: string;
  source: string;
  facts: LiveBriefFact[];
  /** First writeFact call only — outstanding keys still empty after submit. */
  missingFieldKeys?: string[];
  /** Optional single missing key to signal when Loop-closer leaves gaps. */
  signalMissingFieldKey?: string;
}): Promise<void> {
  let cascadeNote: string | undefined;
  let factsToApply = input.facts;

  try {
    for (let i = 0; i < input.facts.length; i++) {
      const fact = input.facts[i];
      const result = await wirePorts.machineApi.writeFact({
        contactId: input.clientId,
        fieldKey: labelToFieldKey(fact.label),
        value: {
          label: fact.label,
          value: fact.value,
          signal: fact.signal,
          signalHint: fact.signalHint,
        },
        source: input.source,
        missingFieldKeys: i === 0 ? input.missingFieldKeys : undefined,
      });
      cascadeNote = result.note ?? cascadeNote;
    }

    try {
      const writebacks = await wirePorts.machineApi.listFactWritebacks(input.clientId);
      const machineFacts = writebacksToFacts(writebacks);
      if (machineFacts.length > 0) {
        factsToApply = mergeFactsPreferMachine(machineFacts, input.facts);
      }
    } catch {
      // list refresh optional
    }
  } catch {
    // best-effort — still update UI store below
  }

  if (input.signalMissingFieldKey) {
    try {
      await wirePorts.machineApi.signalMissingFact({
        contactId: input.clientId,
        fieldKey: input.signalMissingFieldKey,
      });
    } catch {
      // optional signal path
    }
  }

  applyFactsToMeetingsStore({
    clientId: input.clientId,
    source: input.source,
    facts: factsToApply,
    cascadeNote,
  });
}

/** Contact portal booking confirm — writes durable meeting_booked via machineApi, then mirrors UI store. */
export async function confirmContactBooking(input: {
  contactName: string;
  clientId: string;
  slot: string;
  consultantName: string;
}): Promise<StoredMeeting> {
  let machineId = `m-contact-${Date.now()}`;
  try {
    const row = await wirePorts.machineApi.bookMeeting({
      contactId: input.clientId,
      slot: input.slot,
      consultantName: input.consultantName,
      contactName: input.contactName,
      source: "contact_portal",
    });
    machineId = row.id;
  } catch (err) {
    console.error("meeting_booked.write_failed", err);
    throw err;
  }
  const meeting: StoredMeeting = {
    id: machineId,
    clientId: input.clientId,
    contactName: input.contactName,
    time: input.slot,
    status: "Upcoming",
    phase: "Meeting-ready",
    purpose: "Discovery · Express Entry / CEC",
    highlight: "Contact-confirmed booking",
    startsIn: input.slot,
    asOf: "As of · contact portal confirm",
    overview: `${input.contactName} confirmed a discovery slot with ${input.consultantName}. Live brief loads from held self-reportable facts.`,
    pathway: "Meeting-ready phase — consultant desk receives row on Meetings and Board today strip.",
    observation: "Contact-side Confirm booking wrote meeting_booked (machine row) and stopped open attempts.",
    facts: [
      { label: "Booked slot", value: input.slot, signal: "Confirmed", signalHint: "Contact portal booking" },
      { label: "Host", value: input.consultantName, signal: "Consultant", signalHint: "Discovery host" },
    ],
  };
  addMeeting(meeting);
  return meeting;
}
