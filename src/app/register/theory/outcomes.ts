/**
 * Personas & Function — outcomes delineated by World seat.
 * Shape mirrors trove-b2b RegisterPersonas: persona → outcomes → optional How graph.
 * Machine twin of World seats + Seed molecular outcomes (where How exists).
 */
import type { WorldPersona } from "./world";

export type Outcome = {
  id: string;
  label: string;
  statement: string;
  core?: boolean;
  /** Opens the How tree / canvas for this outcome. */
  howGraphId?: string;
};

export type OutcomePersona = {
  id: WorldPersona;
  label: string;
  /** One-line purpose from World — why this seat exists in the chain. */
  purpose: string;
  kind: "desk" | "lattice";
  outcomes: Outcome[];
};

/**
 * Order = value-chain read order. Operator last (supply side).
 * How graphs today exist only under Consultant; other seats carry outcome statements for Function scaffolding.
 */
export const OUTCOME_PERSONAS: OutcomePersona[] = [
  {
    id: "consultant",
    label: "Consultant (firm operator)",
    kind: "desk",
    purpose:
      "Engagement contact can be reached, collected, evaluated, and invited to book — so the firm’s core outcome (meeting booked) can close.",
    outcomes: [
      {
        id: "consultant-access",
        label: "Access",
        howGraphId: "consultant-on-tower",
        statement:
          "As Consultant, I can sign in to Tower and land in my firm workspace — so I can run the desk over my book.",
      },
      {
        id: "consultant-core",
        label: "Core",
        core: true,
        howGraphId: "tower-core-outcome",
        statement:
          "As Consultant, I can keep my private contact book reachable, engage through opt-in → nudge → reactivation, refresh Client Data through touchpoints, re-evaluate service eligibility as facts and rules move, and campaign eligible people toward a booked meeting — without rechecking every file by hand.",
      },
    ],
  },
  {
    id: "engagement_contact",
    label: "Engagement contact (Client)",
    kind: "desk",
    purpose: "Provide / confirm facts and eventually book — so Consultant + automation can close Core outcome.",
    outcomes: [
      {
        id: "client-consent",
        label: "Consent",
        statement:
          "As Engagement contact, I can receive a firm-branded consent request and agree or ignore before deeper collection.",
      },
      {
        id: "client-refresh",
        label: "Refresh facts",
        statement:
          "As Engagement contact, I can answer one consolidated form for outstanding self-reportable facts, and reply when my situation changes.",
      },
      {
        id: "client-silence",
        label: "Silence",
        statement: "As Engagement contact, I can silence or opt out at any point in my journey.",
      },
      {
        id: "client-book",
        label: "Book",
        core: true,
        statement:
          "As Engagement contact, I can book a meeting when invited and arrive where the firm already knows my current facts.",
      },
    ],
  },
  {
    id: "operator",
    label: "Operator (Om Coda house)",
    kind: "lattice",
    purpose:
      "Consultant can be acquired within click budget and activated to running without sales-call as peer door and without shrinking the application desk.",
    outcomes: [
      {
        id: "operator-approach",
        label: "Approach supply",
        statement:
          "As Operator, I can run Meta Approach surfaces (feed → ad → capture → continue scroll), keep capture to seed inputs inside the click budget, and instrument don’t-understand vs understand-don’t-tap.",
      },
      {
        id: "operator-activation",
        label: "Activation supply",
        core: true,
        statement:
          "As Operator, I can forward-deploy a no-login prepared workspace from templates + public firm facts, present the walkthrough, and earn database authorization plus escrow before the campaign runs.",
      },
      {
        id: "operator-assisted",
        label: "Assisted door",
        statement:
          "As Operator, I can provision firm and user via seeded manifests and one-time-code sign-in when ALG is not the path — into the same desk.",
      },
    ],
  },
];

export function getOutcomePersona(id: WorldPersona): OutcomePersona | undefined {
  return OUTCOME_PERSONAS.find((p) => p.id === id);
}

export function getOutcomeById(outcomeId: string): Outcome | undefined {
  for (const persona of OUTCOME_PERSONAS) {
    const found = persona.outcomes.find((o) => o.id === outcomeId);
    if (found) return found;
  }
  return undefined;
}

export function getOutcomeByHowGraphId(graphId: string): Outcome | undefined {
  for (const persona of OUTCOME_PERSONAS) {
    const found = persona.outcomes.find((o) => o.howGraphId === graphId);
    if (found) return found;
  }
  return undefined;
}

export function getPersonaForHowGraphId(graphId: string): OutcomePersona | undefined {
  return OUTCOME_PERSONAS.find((p) => p.outcomes.some((o) => o.howGraphId === graphId));
}
