/**
 * Register shell — three retractable columns (rail · theory · click-through).
 * Any column can hide so the canvas can go full-bleed; restore chrome lives on
 * remaining headers + a slim left dock when rail/theory are both away.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CtDeskId = "consultant" | "operator" | "contact";

export type RegisterShellContextValue = {
  railVisible: boolean;
  setRailVisible: (v: boolean) => void;
  theoryVisible: boolean;
  setTheoryVisible: (v: boolean) => void;
  ctVisible: boolean;
  setCtVisible: (v: boolean) => void;
  ctDesk: CtDeskId;
  setCtDesk: (desk: CtDeskId) => void;
  /** Reveal CT and optionally switch desk — used by leaf inhabit / chips. */
  revealCt: (desk?: CtDeskId) => void;
  /** Reveal theory strip (e.g. when a rail pass is selected while theory is hidden). */
  revealTheory: () => void;
  /** Reveal register rail. */
  revealRail: () => void;
};

const RegisterShellContext = createContext<RegisterShellContextValue | null>(null);

export function RegisterShellProvider({ children }: { children: ReactNode }) {
  const [railVisible, setRailVisible] = useState(true);
  const [theoryVisible, setTheoryVisible] = useState(true);
  const [ctVisible, setCtVisible] = useState(true);
  const [ctDesk, setCtDesk] = useState<CtDeskId>("consultant");

  const revealCt = useCallback((desk?: CtDeskId) => {
    if (desk) setCtDesk(desk);
    setCtVisible(true);
  }, []);

  const revealTheory = useCallback(() => {
    setTheoryVisible(true);
  }, []);

  const revealRail = useCallback(() => {
    setRailVisible(true);
  }, []);

  const value = useMemo(
    () => ({
      railVisible,
      setRailVisible,
      theoryVisible,
      setTheoryVisible,
      ctVisible,
      setCtVisible,
      ctDesk,
      setCtDesk,
      revealCt,
      revealTheory,
      revealRail,
    }),
    [railVisible, theoryVisible, ctVisible, ctDesk, revealCt, revealTheory, revealRail],
  );

  return <RegisterShellContext.Provider value={value}>{children}</RegisterShellContext.Provider>;
}

export function useRegisterShell(): RegisterShellContextValue {
  const ctx = useContext(RegisterShellContext);
  if (!ctx) throw new Error("useRegisterShell must be used within a RegisterShellProvider");
  return ctx;
}
