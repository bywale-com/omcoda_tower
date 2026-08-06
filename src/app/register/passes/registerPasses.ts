/**
 * Register pass ids — left panel section order (omcoda methodology).
 * See docs/register/THREE-SURFACE-MODEL.md
 */
export type RegisterPassId =
  | "seed"
  | "world"
  | "personas-function"
  | "sme"
  | "enrichment"
  | "furnish"
  | "priors"
  | "flows"
  | "wiring"
  | "components"
  | "ct-plant";

export type RegisterPassMeta = {
  id: RegisterPassId;
  label: string;
  /** Short note under section header in left panel */
  hint?: string;
  /** Has expandable tree content in left panel */
  hasTree: boolean;
};

/** Authoritative pass order for Register left panel. */
export const REGISTER_PASSES: RegisterPassMeta[] = [
  {
    id: "seed",
    label: "Seed",
    hint: "Complete product brief before World",
    hasTree: false,
  },
  {
    id: "world",
    label: "World",
    hint: "Personas, admission, shared objects",
    hasTree: false,
  },
  {
    id: "personas-function",
    label: "Personas & Function",
    hint: "How Analysis — outcomes by persona",
    hasTree: true,
  },
  {
    id: "sme",
    label: "SME",
    hint: "Practice + capability · Implementation",
    hasTree: true,
  },
  {
    id: "enrichment",
    label: "Enrichment",
    hint: "Can'ts — 20 × 3 subjects",
    hasTree: true,
  },
  {
    id: "furnish",
    label: "Furnish",
    hint: "Supporting affordances — 20 × 3",
    hasTree: true,
  },
  {
    id: "priors",
    label: "Priors",
    hint: "Full-app — no lattice click-path (111)",
    hasTree: true,
  },
  {
    id: "flows",
    label: "Flows",
    hint: "Persona journeys — play on click-through",
    hasTree: true,
  },
  {
    id: "wiring",
    label: "Wiring",
    hint: "Paper Function traces · Can'ts · nodes",
    hasTree: true,
  },
  {
    id: "components",
    label: "Components",
    hint: "Live holon inventory",
    hasTree: true,
  },
  {
    id: "ct-plant",
    label: "CT Plant",
    hint: "Lo-fi click-through — coming soon",
    hasTree: false,
  },
];

export function getRegisterPass(id: RegisterPassId): RegisterPassMeta | undefined {
  return REGISTER_PASSES.find((pass) => pass.id === id);
}

export function registerPassCanvasTitle(passId: RegisterPassId | null): string {
  switch (passId) {
    case "seed":
      return "Seed";
    case "world":
      return "World";
    case "personas-function":
      return "Personas & Function";
    case "sme":
      return "SME";
    case "enrichment":
      return "Enrichment";
    case "furnish":
      return "Furnish";
    case "priors":
      return "Priors";
    case "flows":
      return "Flows";
    case "wiring":
      return "Wiring";
    case "components":
      return "Components";
    case "ct-plant":
      return "CT Plant";
    default:
      return "Register";
  }
}
