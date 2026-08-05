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

/** Click-through design-system mode — DS-I plant vs Ant Design translate. */
export type CtDesignSystem = "dsi" | "ant";

const CT_DS_STORAGE_KEY = "tower-register-ct-ds";

function loadCtDesignSystem(): CtDesignSystem {
  try {
    const v = localStorage.getItem(CT_DS_STORAGE_KEY);
    if (v === "ant" || v === "dsi") return v;
  } catch {
    /* ignore */
  }
  return "dsi";
}

function saveCtDesignSystem(ds: CtDesignSystem) {
  try {
    localStorage.setItem(CT_DS_STORAGE_KEY, ds);
  } catch {
    /* ignore */
  }
}

export type RegisterShellContextValue = {
  railVisible: boolean;
  setRailVisible: (v: boolean) => void;
  theoryVisible: boolean;
  setTheoryVisible: (v: boolean) => void;
  ctVisible: boolean;
  setCtVisible: (v: boolean) => void;
  ctDesk: CtDeskId;
  setCtDesk: (desk: CtDeskId) => void;
  /** CT canvas design system — DS-I (source plant) or Ant Design translate. */
  ctDesignSystem: CtDesignSystem;
  setCtDesignSystem: (ds: CtDesignSystem) => void;
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
  const [ctDesignSystem, setCtDesignSystemState] = useState<CtDesignSystem>(() => loadCtDesignSystem());

  const setCtDesignSystem = useCallback((ds: CtDesignSystem) => {
    setCtDesignSystemState(ds);
    saveCtDesignSystem(ds);
  }, []);

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
      ctDesignSystem,
      setCtDesignSystem,
      revealCt,
      revealTheory,
      revealRail,
    }),
    [
      railVisible,
      theoryVisible,
      ctVisible,
      ctDesk,
      ctDesignSystem,
      setCtDesignSystem,
      revealCt,
      revealTheory,
      revealRail,
    ],
  );

  return <RegisterShellContext.Provider value={value}>{children}</RegisterShellContext.Provider>;
}

export function useRegisterShell(): RegisterShellContextValue {
  const ctx = useContext(RegisterShellContext);
  if (!ctx) throw new Error("useRegisterShell must be used within a RegisterShellProvider");
  return ctx;
}
