/**
 * Ant Design seed theme for Tower translate.
 * Only Seed / documented Map overrides — no invented gap tokens.
 * Ambiguity: brand vs Ant default primary — queued; using Ant seed `#1677ff` until human picks Tower brand.
 */
import type { ThemeConfig } from "antd";
import { theme as antTheme } from "antd";

export const TOWER_ANT_THEME_KEY = "tower-prototype-ant-theme";

export type AntThemeMode = "light" | "dark";

export function loadAntThemeMode(): AntThemeMode {
  try {
    const v = localStorage.getItem(TOWER_ANT_THEME_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "light";
}

export function saveAntThemeMode(mode: AntThemeMode) {
  try {
    localStorage.setItem(TOWER_ANT_THEME_KEY, mode);
  } catch {
    /* ignore */
  }
}

/** Seed-only theme; algorithm derives Map/Alias. */
export function buildTowerAntTheme(mode: AntThemeMode): ThemeConfig {
  return {
    algorithm: mode === "dark" ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      // Seed — documented core only
      colorPrimary: "#1677ff", // AMBIGUITY: Tower brand vs Ant default — queued
      borderRadius: 6,
      fontSize: 14,
      controlHeight: 32,
      wireframe: false,
    },
    components: {
      Layout: {
        headerHeight: 56,
        headerPadding: "0 20px",
      },
      Menu: {
        itemBorderRadius: 6,
      },
    },
  };
}
