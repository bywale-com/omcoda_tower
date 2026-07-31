/**
 * Register Prototype Canvas — hi-fi Tower desk host (replaces lo-fi CT stub).
 * Step 4: Contact-facing CEM / portal touchpoints on contact desk.
 */
import { useEffect, useMemo } from "react";
import type { Tokens } from "../../components/tokens";
import { useRegisterShell } from "../context/RegisterShellContext";
import { useRegisterTrace } from "../trace/RegisterTraceContext";
import { SURFACE_CATALOG } from "../trace/surfaceCatalog";
import { ConsultantPrototypeScene } from "./ConsultantPrototypeScene";
import { ContactPrototypeScene } from "./ContactPrototypeScene";
import { OperatorPrototypeScene } from "./OperatorPrototypeScene";

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
    return (
      <ContactPrototypeScene
        t={t}
        isDark={isDark}
        focusedEntry={focusedEntry}
        hoveredId={hoveredSurfaceId}
        focusSeq={focusSeq}
      />
    );
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
