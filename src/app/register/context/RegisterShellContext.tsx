/**
 * Register shell — CT is its own panel (default on); theory lives in a fixed-width
 * strip beside it (HQ RegisterWorkspace hierarchy). Tower keeps its own tokens/fonts.
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
  ctVisible: boolean;
  setCtVisible: (v: boolean) => void;
  ctDesk: CtDeskId;
  setCtDesk: (desk: CtDeskId) => void;
  /** Reveal CT and optionally switch desk — used by leaf inhabit later. */
  revealCt: (desk?: CtDeskId) => void;
};

const RegisterShellContext = createContext<RegisterShellContextValue | null>(null);

export function RegisterShellProvider({ children }: { children: ReactNode }) {
  const [ctVisible, setCtVisible] = useState(true);
  const [ctDesk, setCtDesk] = useState<CtDeskId>("consultant");

  const revealCt = useCallback((desk?: CtDeskId) => {
    if (desk) setCtDesk(desk);
    setCtVisible(true);
  }, []);

  const value = useMemo(
    () => ({ ctVisible, setCtVisible, ctDesk, setCtDesk, revealCt }),
    [ctVisible, ctDesk, revealCt],
  );

  return <RegisterShellContext.Provider value={value}>{children}</RegisterShellContext.Provider>;
}

export function useRegisterShell(): RegisterShellContextValue {
  const ctx = useContext(RegisterShellContext);
  if (!ctx) throw new Error("useRegisterShell must be used within a RegisterShellProvider");
  return ctx;
}
