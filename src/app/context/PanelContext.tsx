import { createContext, useContext, type ReactNode } from "react";

type PanelContextValue = {
  isPanelOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
};

const PanelContext = createContext<PanelContextValue | null>(null);

export function PanelProvider({
  isPanelOpen,
  togglePanel,
  openPanel,
  children,
}: PanelContextValue & { children: ReactNode }) {
  return (
    <PanelContext.Provider value={{ isPanelOpen, togglePanel, openPanel }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("usePanel must be used within PanelProvider");
  }
  return ctx;
}
