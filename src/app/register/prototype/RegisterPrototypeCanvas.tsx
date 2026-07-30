/**
 * Register Prototype Canvas — hi-fi Tower desk host (replaces lo-fi CT stub).
 * Step 3: Meetings densify · Prepared Workspace · Login · consultant router.
 */
import { useEffect, useMemo } from "react";
import type { Tokens } from "../../components/tokens";
import { useRegisterShell } from "../context/RegisterShellContext";
import { useRegisterTrace } from "../trace/RegisterTraceContext";
import { SURFACE_CATALOG, type RegisterSurfaceEntry } from "../trace/surfaceCatalog";
import { ConsultantPrototypeScene } from "./ConsultantPrototypeScene";
import { HiFiEmptyModule } from "./HiFiEmptyModule";
import { OperatorPrototypeScene } from "./OperatorPrototypeScene";
import { RegisterSurfaceMount } from "./registerSurfaceChrome";

type RegisterPrototypeCanvasProps = {
  t: Tokens;
  isDark: boolean;
};

function findSurfaceEl(label: string): HTMLElement | null {
  const nodes = document.querySelectorAll<HTMLElement>("[data-register-surface]");
  let last: HTMLElement | null = null;
  for (const el of nodes) {
    if (el.getAttribute("data-register-surface") === label) last = el;
  }
  return last;
}

function clearSurfaceRings() {
  document.querySelectorAll<HTMLElement>("[data-register-surface-ring]").forEach((el) => {
    el.removeAttribute("data-register-surface-ring");
    el.style.outline = "";
    el.style.outlineOffset = "";
  });
}

function applySurfaceRing(el: HTMLElement, accent: string) {
  el.setAttribute("data-register-surface-ring", "1");
  el.style.outline = `2px solid ${accent}`;
  el.style.outlineOffset = "-2px";
}

function ContactDeskScene({
  t,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const title = focusedEntry?.label ?? "Client portal";
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  return (
    <div style={{ flex: 1, minHeight: 0, padding: 12, display: "flex" }}>
      <RegisterSurfaceMount
        label={title}
        focused={Boolean(focusedEntry)}
        hovered={Boolean(hoveredEntry)}
        t={t}
      >
        <HiFiEmptyModule
          title={title}
          t={t}
          status={focusedEntry?.status ?? "new"}
          hint="Contact-facing scene — portal / CEM surfaces land in a later step"
        />
      </RegisterSurfaceMount>
    </div>
  );
}

export function RegisterPrototypeCanvas({ t, isDark }: RegisterPrototypeCanvasProps) {
  const { ctDesk } = useRegisterShell();
  const { focusedSurfaceId, focusSeq, hoveredSurfaceId } = useRegisterTrace();

  const focusedEntry = useMemo(() => {
    if (!focusedSurfaceId) return null;
    return SURFACE_CATALOG.find((e) => e.id === focusedSurfaceId) ?? null;
  }, [focusedSurfaceId]);

  useEffect(() => {
    if (!focusedEntry || focusSeq === 0) {
      clearSurfaceRings();
      return;
    }
    const label = focusedEntry.label;
    const module = focusedEntry.module;
    const id = window.setTimeout(() => {
      clearSurfaceRings();
      const el = findSurfaceEl(label) ?? findSurfaceEl(module);
      if (!el) return;
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (el.getAttribute("data-register-surface") === label) {
        applySurfaceRing(el, t.accent);
      }
    }, 60);
    return () => {
      window.clearTimeout(id);
      clearSurfaceRings();
    };
  }, [focusedEntry, focusSeq, t.accent]);

  if (ctDesk === "operator") {
    return (
      <OperatorPrototypeScene
        t={t}
        isDark={isDark}
        focusedEntry={focusedEntry}
        hoveredId={hoveredSurfaceId}
      />
    );
  }
  if (ctDesk === "contact") {
    return <ContactDeskScene t={t} focusedEntry={focusedEntry} hoveredId={hoveredSurfaceId} />;
  }
  return (
    <ConsultantPrototypeScene
      t={t}
      isDark={isDark}
      focusedEntry={focusedEntry}
      hoveredId={hoveredSurfaceId}
      focusSeq={focusSeq}
    />
  );
}
