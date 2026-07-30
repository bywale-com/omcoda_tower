/**
 * Personas & Function — machine twin of docs/register/OUTCOMES.md
 * How graphs: docs/register/how/*.md → howAnalysis/*
 */
import type { WorldPersona } from "./world";

export type Outcome = {
  id: string;
  label: string;
  statement: string;
  core?: boolean;
  /** Opens the How tree for this outcome (howAnalysis graph id). */
  howGraphId?: string;
};

export type OutcomePersona = {
  id: WorldPersona;
  label: string;
  purpose: string;
  kind: "desk" | "lattice";
  outcomes: Outcome[];
};

/**
 * Order = value-chain read order. Operator last (supply side).
 * Statements verbatim from OUTCOMES.md (clean rewrite).
 */
export const OUTCOME_PERSONAS: OutcomePersona[] = [
  {
    id: "consultant",
    label: "Consultant (firm operator)",
    kind: "desk",
    purpose:
      "Hand over the book, authorize under license, receive booked meetings — so the firm’s core outcome can close without the consultant configuring engagement.",
    outcomes: [
      {
        id: "consultant-core",
        label: "Core",
        core: true,
        howGraphId: "consultant-core",
        statement:
          "As Consultant, I can hand my private book to Tower and authorize it to work under my license, and get eligible clients booked onto my calendar — without setting up, configuring, or running any of the engagement myself — so that an eligible contact arrives at a booked meeting already re-engaged and current.",
      },
      {
        id: "consultant-governance",
        label: "Governance",
        howGraphId: "consultant-governance",
        statement:
          "As Consultant, I can keep everything running under my license and halt anything I won't stand behind — so that the book is worked lawfully in my name.",
      },
      {
        id: "consultant-access",
        label: "Access",
        howGraphId: "consultant-access",
        statement:
          "As Consultant, I can sign in and land in my firm workspace to see what's being done in my name and take the meetings booked for me.",
      },
    ],
  },
  {
    id: "engagement_contact",
    label: "Engagement contact (Client)",
    kind: "desk",
    purpose:
      "Referenced participant — closes the Consultant so-that loop (consent → facts → silence → book).",
    outcomes: [
      {
        id: "contact-consent",
        label: "Consent",
        howGraphId: "contact-consent",
        statement:
          "As Engagement contact, I can receive a firm-branded consent request and agree or ignore before any deeper collection.",
      },
      {
        id: "contact-refresh",
        label: "Refresh facts",
        howGraphId: "contact-refresh",
        statement:
          "As Engagement contact, I can answer one consolidated form for outstanding self-reportable facts, and reply when my situation changes.",
      },
      {
        id: "contact-silence",
        label: "Silence",
        howGraphId: "contact-silence",
        statement: "As Engagement contact, I can silence or opt out at any point.",
      },
      {
        id: "contact-book",
        label: "Book",
        howGraphId: "contact-book",
        statement:
          "As Engagement contact, I can book a meeting when invited and arrive where the firm already knows my current facts — so that the Consultant takes the meeting with a live brief.",
      },
    ],
  },
  {
    id: "operator",
    label: "Operator (Om Coda house)",
    kind: "lattice",
    purpose:
      "One house human, many surfaces — acquire, activate, author, bind, oversee — so Consultants reach and stay running.",
    outcomes: [
      {
        id: "operator-acquisition",
        label: "Acquisition & ads",
        howGraphId: "operator-acquisition",
        statement:
          "As Operator, I can run the firm-acquisition Approach (feed → ad → capture, inside the click budget) and read who understood-but-didn't-tap versus didn't-understand — so that a captured firm can be staged for activation.",
      },
      {
        id: "operator-activation",
        label: "Activation & forward-deploy",
        howGraphId: "operator-activation",
        statement:
          "As Operator, I can stage a no-login prepared workspace for a captured firm from house templates and public facts, walk the firm through readiness, and secure its database authorization and escrow — so that the Consultant reaches a running desk.",
      },
      {
        id: "operator-reference-data",
        label: "Reference data",
        howGraphId: "operator-reference-data",
        statement:
          "As Operator, I can keep the immigration reference tables versioned and current as data, without a code deploy — so that house-authored evaluation packs score eligibility on today's rules.",
      },
      {
        id: "operator-configuration-libraries",
        label: "Configuration libraries",
        howGraphId: "operator-configuration-libraries",
        statement:
          "As Operator, I can author and version the evaluation packs, automation workflows, and engagement templates that run the product — so that a firm's operations can be bound from house-authored packs rather than built per firm.",
      },
      {
        id: "operator-oversight",
        label: "Oversight",
        howGraphId: "operator-oversight",
        statement:
          "As Operator, I can watch engagement and sequence health across every firm and drill into any one — so that a failing tenancy is caught before the Consultant loses meetings.",
      },
      {
        id: "operator-audit-trail",
        label: "Audit trail",
        howGraphId: "operator-audit-trail",
        statement:
          "As Operator, I can see who changed which operation, when, and on which firm — so that support and founder oversight can account for every change over real client books.",
      },
      {
        id: "operator-register-evolution",
        label: "Register & evolution",
        howGraphId: "operator-register-evolution",
        statement:
          "As Operator, I can document friction from running firms and regenerate the methodology into house build tooling — so that the next authored operations reach the configuration libraries.",
      },
      {
        id: "operator-founder-controls",
        label: "Founder & agency controls",
        howGraphId: "operator-founder-controls",
        statement:
          "As Operator, I can set cross-firm bounds, kill-switches, and agency policy — so that many tenancies are overseen without leaking controls into any firm's workspace.",
      },
      {
        id: "operator-provision",
        label: "Provision (assisted door)",
        howGraphId: "operator-provision",
        statement:
          "As Operator, I can provision a firm and its user through the assisted door — so that the Consultant reaches the same desk when ALG isn't the path.",
      },
      {
        id: "operator-commercial",
        label: "Commercial (escrow)",
        howGraphId: "operator-commercial",
        statement:
          "As Operator, I can hold and oversee a firm's escrow and contingent terms — so that the Consultant can accept the terms and reach running.",
      },
      {
        id: "operator-firm-bind",
        label: "Firm operations bind",
        howGraphId: "operator-firm-bind",
        statement:
          "As Operator, I can bind house-authored evaluation, automation, and campaign packs under a firm's identity — so that the Consultant's book is worked without the firm authoring anything.",
      },
      {
        id: "operator-book-readiness",
        label: "Book readiness",
        howGraphId: "operator-book-readiness",
        statement:
          "As Operator, I can run the reachability gate over a firm's book — so that only reachable contacts enter engagement.",
      },
      {
        id: "operator-firm-health",
        label: "Firm health",
        howGraphId: "operator-firm-health",
        statement:
          "As Operator, I can see engagement health scoped to one firm — so that support can restore it and the Consultant keeps getting meetings.",
      },
      {
        id: "operator-activation-state",
        label: "Activation state",
        howGraphId: "operator-activation-state",
        statement:
          "As Operator, I can see a firm's forward-deploy and hard-input progress toward running — so that a stalled firm is moved to a running desk.",
      },
      {
        id: "operator-support",
        label: "Keep the firm running",
        howGraphId: "operator-support",
        statement:
          "As Operator, I can answer a running firm's questions and work its tickets with that firm's bind, health, and commercial context — so that the Consultant's firm keeps running.",
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
