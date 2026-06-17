import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type TouchpointFocusContextValue = {
  focusTouchpointId: string | null;
  setFocusTouchpointId: (id: string | null) => void;
};

const TouchpointFocusContext = createContext<TouchpointFocusContextValue | null>(null);

export function TouchpointFocusProvider({ children }: { children: ReactNode }) {
  const [focusTouchpointId, setFocusTouchpointId] = useState<string | null>(null);

  const setFocus = useCallback((id: string | null) => {
    setFocusTouchpointId(id);
  }, []);

  return (
    <TouchpointFocusContext.Provider value={{ focusTouchpointId, setFocusTouchpointId: setFocus }}>
      {children}
    </TouchpointFocusContext.Provider>
  );
}

export function useTouchpointFocus() {
  const ctx = useContext(TouchpointFocusContext);
  if (!ctx) {
    throw new Error("useTouchpointFocus must be used within TouchpointFocusProvider");
  }
  return ctx;
}
