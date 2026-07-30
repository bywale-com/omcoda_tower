/**
 * Configuration libraries — Evaluation packs / Automation / Engagement templates.
 */
import { useMemo, type ReactNode } from "react";
import type { Tokens } from "../../../components/tokens";
import { AgentDetailView } from "../../../components/hub/agent/AgentDetailView";
import { AutomationDetailView } from "../../../components/hub/automation/AutomationDetailView";
import { AutomationProvider } from "../../../context/AutomationContext";
import { getAllAgentDefinitions } from "../../../data/agentDefinitions";
import { getAllWorkflowDefinitions } from "../../../data/automationWorkflows";
import { SURFACE_CATALOG, type RegisterSurfaceEntry } from "../../trace/surfaceCatalog";
import { HiFiEmptyModule } from "../HiFiEmptyModule";
import { RegisterSurfaceMount, navBtnStyle, sectionLabelStyle } from "../registerSurfaceChrome";
import { panelShell, statusChip } from "./operatorChrome";

export type ConfigLibSub =
  | "Evaluation packs"
  | "Automation workflows"
  | "Engagement templates";

const CONFIG_LIB_SUBS: {
  id: ConfigLibSub;
  label: string;
  surfaceLabels: string[];
}[] = [
  {
    id: "Evaluation packs",
    label: "Evaluation packs",
    surfaceLabels: ["Evaluation packs", "Evaluation pack editor"],
  },
  {
    id: "Automation workflows",
    label: "Automation workflows (Workflow canvas)",
    surfaceLabels: ["Automation workflows", "Workflow canvas"],
  },
  {
    id: "Engagement templates",
    label: "Engagement templates / Agent / sequence editor",
    surfaceLabels: ["Engagement templates", "Agent / sequence editor"],
  },
];

const DEMO_AUTOMATION_ID = getAllWorkflowDefinitions()[0]?.id ?? "auto-welcome";

const DEMO_AGENT_ID =
  getAllAgentDefinitions().find((a) => a.stepCount > 0)?.id ??
  getAllAgentDefinitions()[0]?.id ??
  "agent-nudge";

export function resolveConfigLibSub(entry: RegisterSurfaceEntry | null): ConfigLibSub | null {
  if (!entry || entry.module !== "Configuration libraries") return null;
  for (const sub of CONFIG_LIB_SUBS) {
    if (sub.surfaceLabels.includes(entry.label) || entry.label === sub.id) return sub.id;
  }
  if (entry.label === "Configuration libraries") return "Evaluation packs";
  return null;
}

export function ConfigurationLibrariesPanel({
  t,
  isDark,
  focusedEntry,
  hoveredId,
  sub,
  onSubChange,
}: {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
  sub: ConfigLibSub;
  onSubChange: (sub: ConfigLibSub) => void;
}) {
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  const activeSurfaceLabel = useMemo(() => {
    if (focusedEntry && focusedEntry.module === "Configuration libraries") {
      return focusedEntry.label;
    }
    if (sub === "Automation workflows") return "Workflow canvas";
    if (sub === "Engagement templates") return "Agent / sequence editor";
    return "Evaluation packs";
  }, [focusedEntry, sub]);

  const mountFocused =
    Boolean(focusedEntry) &&
    (focusedEntry!.module === "Configuration libraries" ||
      CONFIG_LIB_SUBS.some((s) => s.surfaceLabels.includes(focusedEntry!.label)));

  const mountHovered =
    Boolean(hoveredEntry) &&
    (hoveredEntry!.module === "Configuration libraries" ||
      CONFIG_LIB_SUBS.some((s) => s.surfaceLabels.includes(hoveredEntry!.label)));

  let body: ReactNode;
  if (sub === "Automation workflows") {
    body = (
      <AutomationProvider>
        <RegisterSurfaceMount
          label="Workflow canvas"
          focused={
            mountFocused &&
            (activeSurfaceLabel === "Workflow canvas" ||
              activeSurfaceLabel === "Automation workflows")
          }
          hovered={
            mountHovered &&
            (hoveredEntry?.label === "Workflow canvas" ||
              hoveredEntry?.label === "Automation workflows")
          }
          t={t}
        >
          <div
            data-register-surface="Automation workflows"
            style={{ flex: 1, minHeight: 0, display: "flex" }}
          >
            <AutomationDetailView automationId={DEMO_AUTOMATION_ID} t={t} isDark={isDark} />
          </div>
        </RegisterSurfaceMount>
      </AutomationProvider>
    );
  } else if (sub === "Engagement templates") {
    body = (
      <RegisterSurfaceMount
        label="Agent / sequence editor"
        focused={
          mountFocused &&
          (activeSurfaceLabel === "Agent / sequence editor" ||
            activeSurfaceLabel === "Engagement templates")
        }
        hovered={
          mountHovered &&
          (hoveredEntry?.label === "Agent / sequence editor" ||
            hoveredEntry?.label === "Engagement templates")
        }
        t={t}
      >
        <div
          data-register-surface="Engagement templates"
          style={{ flex: 1, minHeight: 0, display: "flex" }}
        >
          <AgentDetailView agentId={DEMO_AGENT_ID} t={t} isDark={isDark} />
        </div>
      </RegisterSurfaceMount>
    );
  } else {
    body = (
      <RegisterSurfaceMount
        label="Evaluation packs"
        focused={
          mountFocused &&
          (activeSurfaceLabel === "Evaluation packs" ||
            activeSurfaceLabel === "Evaluation pack editor" ||
            activeSurfaceLabel === "Configuration libraries")
        }
        hovered={
          mountHovered &&
          (hoveredEntry?.label === "Evaluation packs" ||
            hoveredEntry?.label === "Evaluation pack editor")
        }
        t={t}
      >
        <div
          data-register-surface="Evaluation pack editor"
          style={{ flex: 1, minHeight: 0, display: "flex" }}
        >
          <HiFiEmptyModule
            title="Evaluation packs"
            t={t}
            status="wrong-seat"
            hint="Rule / analysis authorship re-homes here — pack editor densifies in a later step"
          />
        </div>
      </RegisterSurfaceMount>
    );
  }

  return (
    <RegisterSurfaceMount
      label="Configuration libraries"
      focused={mountFocused && focusedEntry?.label === "Configuration libraries"}
      hovered={hoveredEntry?.label === "Configuration libraries"}
      t={t}
    >
      {panelShell(
        t,
        "Configuration libraries",
        statusChip(t, "authorship home"),
        <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
          <aside
            style={{
              width: 200,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Libraries</div>
            {CONFIG_LIB_SUBS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSubChange(item.id)}
                style={navBtnStyle(t, sub === item.id)}
              >
                {item.label}
              </button>
            ))}
          </aside>
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}>{body}</div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
