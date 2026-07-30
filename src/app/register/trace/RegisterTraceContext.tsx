/**
 * Register focus / hover trace — chip click → reveal CT desk + focus surface on canvas.
 * Must wrap inside RegisterShellProvider (calls revealCt).
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRegisterShell, type CtDeskId } from "../context/RegisterShellContext";
import { getSurfaceByLabel, resolveSurfaceLabel, type SurfaceDesk } from "./surfaceCatalog";

export type RegisterTraceContextValue = {
  focusedSurfaceId: string | null;
  focusSeq: number;
  hoveredSurfaceId: string | null;
  focusSurface: (labelOrId: string) => void;
  setHovered: (surfaceId: string | null) => void;
};

const RegisterTraceContext = createContext<RegisterTraceContextValue | null>(null);

function deskToCt(desk: SurfaceDesk): CtDeskId {
  return desk;
}

export function RegisterTraceProvider({ children }: { children: ReactNode }) {
  const { revealCt } = useRegisterShell();
  const [focusedSurfaceId, setFocusedSurfaceId] = useState<string | null>(null);
  const [focusSeq, setFocusSeq] = useState(0);
  const [hoveredSurfaceId, setHoveredSurfaceId] = useState<string | null>(null);

  const focusSurface = useCallback(
    (labelOrId: string) => {
      const entry =
        getSurfaceByLabel(labelOrId) ?? resolveSurfaceLabel(labelOrId);
      if (!entry) return;
      revealCt(deskToCt(entry.desk));
      setFocusedSurfaceId(entry.id);
      setFocusSeq((n) => n + 1);
    },
    [revealCt],
  );

  const setHovered = useCallback((surfaceId: string | null) => {
    setHoveredSurfaceId(surfaceId);
  }, []);

  const value = useMemo(
    () => ({
      focusedSurfaceId,
      focusSeq,
      hoveredSurfaceId,
      focusSurface,
      setHovered,
    }),
    [focusedSurfaceId, focusSeq, hoveredSurfaceId, focusSurface, setHovered],
  );

  return (
    <RegisterTraceContext.Provider value={value}>{children}</RegisterTraceContext.Provider>
  );
}

export function useRegisterTrace(): RegisterTraceContextValue {
  const ctx = useContext(RegisterTraceContext);
  if (!ctx) throw new Error("useRegisterTrace must be used within a RegisterTraceProvider");
  return ctx;
}

/** Safe when Theory chrome renders outside the trace provider. */
export function useOptionalRegisterTrace(): RegisterTraceContextValue | null {
  return useContext(RegisterTraceContext);
}
