export type Tokens = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textMuted: string;
  textDim: string;
  /** Sidebar client-tree labels — brighter than textMuted for nav legibility */
  textSidebar: string;
  /** Trigger-style neutral badge tile (light fill, dark letter) */
  sidebarBadgeBg: string;
  sidebarBadgeFg: string;
  sidebarBadgeBorder: string;
  border: string;
  borderLight: string;
  accent: string;
  accentBg: string;
  amber: string;
  amberBg: string;
  green: string;
  success: string;
  red: string;
  tagNeutralBg: string;
  liveViewerBg: string;
  browserDot: string;
  activityBar: string;
  activityBarIcon: string;
  activityBarIconActive: string;
  boardPanel: string;
  tabActiveBg: string;
  tabInactiveBg: string;
  hoverBg: string;
  activeRowBg: string;
  cardBg: string;
  towerWorkingBg: string;
};

export const dark: Tokens = {
  bgPrimary: "#000000",
  bgSecondary: "#000000",
  bgTertiary: "#000000",
  textPrimary: "#d4d4d4",
  textMuted: "#8a8a8a",
  textDim: "#666666",
  textSidebar: "#b0b0b0",
  sidebarBadgeBg: "#5c5c5c",
  sidebarBadgeFg: "#1a1a1a",
  sidebarBadgeBorder: "#737373",
  border: "rgba(255, 255, 255, 0.22)",
  borderLight: "rgba(255, 255, 255, 0.12)",
  accent: "#4A7BF7",
  accentBg: "rgba(74, 123, 247, 0.18)",
  amber: "#8B6CF6",
  amberBg: "rgba(139, 108, 246, 0.18)",
  green: "#4A7BF7",
  success: "#16a34a",
  red: "#ef4444",
  tagNeutralBg: "#000000",
  liveViewerBg: "#000000",
  browserDot: "rgba(255, 255, 255, 0.35)",
  activityBar: "#000000",
  activityBarIcon: "#7a7a7a",
  activityBarIconActive: "#d4d4d4",
  boardPanel: "#000000",
  tabActiveBg: "#000000",
  tabInactiveBg: "#000000",
  hoverBg: "rgba(255,255,255,0.06)",
  activeRowBg: "rgba(74, 123, 247, 0.18)",
  cardBg: "#000000",
  towerWorkingBg: "#000000",
};

export const light: Tokens = {
  bgPrimary: "#ffffff",
  bgSecondary: "#ffffff",
  bgTertiary: "#ffffff",
  textPrimary: "#1e1e1e",
  textMuted: "#6e6e6e",
  textDim: "#aaaaaa",
  textSidebar: "#525252",
  sidebarBadgeBg: "#e8e8e8",
  sidebarBadgeFg: "#2d2d2d",
  sidebarBadgeBorder: "#d0d0d0",
  border: "#e0e0e0",
  borderLight: "#ececec",
  accent: "#4A7BF7",
  accentBg: "rgba(74, 123, 247, 0.08)",
  amber: "#8B6CF6",
  amberBg: "rgba(139, 108, 246, 0.12)",
  green: "#4A7BF7",
  success: "#16a34a",
  red: "#dc2626",
  tagNeutralBg: "#ffffff",
  liveViewerBg: "#ffffff",
  browserDot: "#d1d5db",
  activityBar: "#2c2c2c",
  activityBarIcon: "#858585",
  activityBarIconActive: "#cccccc",
  boardPanel: "#ffffff",
  tabActiveBg: "#ffffff",
  tabInactiveBg: "#ffffff",
  hoverBg: "rgba(0,0,0,0.04)",
  activeRowBg: "rgba(74, 123, 247, 0.07)",
  cardBg: "#ffffff",
  towerWorkingBg: "#ffffff",
};
