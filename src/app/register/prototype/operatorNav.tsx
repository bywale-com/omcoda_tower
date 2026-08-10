/**
 * Operator desk Jump-to navigation — resolves jump labels to module ids
 * and provides setModule via context (Ant + Plant scenes).
 */
import { createContext, useCallback, useContext, type ReactNode } from "react";
import {
  OPERATOR_HOUSE_MODULES,
  OPERATOR_SUPPORT_MODULES,
  OPERATOR_TENANCY_MODULES,
} from "../trace/surfaceCatalog";

const ALL_MODULES = [
  ...OPERATOR_HOUSE_MODULES,
  ...OPERATOR_TENANCY_MODULES,
  ...OPERATOR_SUPPORT_MODULES,
] as const;

/** Common Jump labels → known Operator module names. */
const JUMP_ALIASES: Record<string, string> = {
  "Configuration libraries": "Configuration libraries",
  "Sending infrastructure": "Sending infrastructure",
  Commercial: "Commercial",
  "Commercial / escrow": "Commercial",
  "Activation state": "Activation state",
  "Activation & forward-deploy": "Activation & forward-deploy",
  "Firm health": "Firm health",
  "Customer support": "Customer support",
  "Book readiness": "Book readiness",
  "Firm operations bind": "Firm operations bind",
  "Founder & agency controls": "Founder & agency controls",
  "Audit trail": "Audit trail",
  "Reference data": "Reference data",
  Provision: "Provision",
  Oversight: "Oversight",
};

export function resolveOperatorJumpModule(jumpLabel: string): string | null {
  let s = jumpLabel.trim();
  s = s.replace(/^Jump to\s+/i, "");
  s = s.split("·")[0]!.trim();
  // Drop trailing firm filter crumbs like "filter not-yet-hydrated"
  s = s.replace(/\s+filter\b.*$/i, "").trim();

  if (JUMP_ALIASES[s]) return JUMP_ALIASES[s];

  for (const [alias, mod] of Object.entries(JUMP_ALIASES)) {
    if (s === alias || s.startsWith(`${alias} `) || s.startsWith(`${alias}/`)) return mod;
  }

  if ((ALL_MODULES as readonly string[]).includes(s)) return s;
  return null;
}

type OperatorNavValue = {
  /** Navigate when label maps to a known module; returns resolved module or null. */
  jumpTo: (label: string) => string | null;
};

const OperatorNavContext = createContext<OperatorNavValue>({
  jumpTo: () => null,
});

export function OperatorNavProvider({
  setModule,
  children,
}: {
  setModule: (module: string) => void;
  children: ReactNode;
}) {
  const jumpTo = useCallback(
    (label: string) => {
      const target = resolveOperatorJumpModule(label);
      if (target) setModule(target);
      return target;
    },
    [setModule],
  );

  return (
    <OperatorNavContext.Provider value={{ jumpTo }}>{children}</OperatorNavContext.Provider>
  );
}

export function useOperatorNav(): OperatorNavValue {
  return useContext(OperatorNavContext);
}
