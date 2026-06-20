import type { Tokens } from "../tokens";

/** Bridge Tower `t` tokens → shadcn CSS variables + `.dark` on `<html>`. */
export function syncShadcnTheme(t: Tokens, isDark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);

  root.style.setProperty("--background", t.bgPrimary);
  root.style.setProperty("--foreground", t.textPrimary);
  root.style.setProperty("--card", t.boardPanel);
  root.style.setProperty("--card-foreground", t.textPrimary);
  root.style.setProperty("--popover", t.boardPanel);
  root.style.setProperty("--popover-foreground", t.textPrimary);
  root.style.setProperty("--muted", t.hoverBg);
  root.style.setProperty("--muted-foreground", t.textMuted);
  root.style.setProperty("--accent", t.hoverBg);
  root.style.setProperty("--accent-foreground", t.textPrimary);
  root.style.setProperty("--border", t.border);
  root.style.setProperty("--input", t.border);
  root.style.setProperty("--input-background", t.bgSecondary);
  root.style.setProperty("--primary", t.accent);
  root.style.setProperty("--primary-foreground", "#ffffff");
  root.style.setProperty("--secondary", t.hoverBg);
  root.style.setProperty("--secondary-foreground", t.textPrimary);
  root.style.setProperty("--destructive", t.red);
  root.style.setProperty("--destructive-foreground", "#ffffff");
  root.style.setProperty("--ring", t.accent);
  root.style.setProperty("--switch-background", isDark ? "#5c5c5c" : "#cbced4");
  root.style.setProperty("--sidebar", t.boardPanel);
  root.style.setProperty("--sidebar-foreground", t.textPrimary);
  root.style.setProperty("--sidebar-accent", t.hoverBg);
  root.style.setProperty("--sidebar-accent-foreground", t.textPrimary);
  root.style.setProperty("--sidebar-border", t.border);
}
