import type { Tokens } from "../../components/tokens";
import type { UiKind } from "./types";

export function uiKindStyle(t: Tokens, kind: UiKind): { color: string; bg: string; label: string } {
  switch (kind) {
    case "module":
      return { color: t.accent, bg: `${t.accent}1F`, label: "Module" };
    case "modal":
      return { color: "#0F766E", bg: "rgba(13,148,136,0.12)", label: "Modal" };
    case "block":
      return { color: "#7C3AED", bg: "rgba(139,92,246,0.12)", label: "Block" };
    case "submodal":
      return { color: "#B45309", bg: "rgba(217,119,6,0.12)", label: "Submodal" };
  }
}

export const UI_KIND_ORDER: UiKind[] = ["module", "modal", "block", "submodal"];
