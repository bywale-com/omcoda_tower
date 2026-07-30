/**
 * Operator desk scene for Register Prototype Canvas.
 * Step 2: densified shell IA + Configuration libraries / Book readiness re-homes.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Tokens } from "../../components/tokens";
import { AuditDetailView } from "../../components/hub/AuditDetailView";
import { AgentDetailView } from "../../components/hub/agent/AgentDetailView";
import { AutomationDetailView } from "../../components/hub/automation/AutomationDetailView";
import { AuditProvider, useAudits } from "../../context/AuditContext";
import { AutomationProvider } from "../../context/AutomationContext";
import { getAllAgentDefinitions } from "../../data/agentDefinitions";
import { getAllWorkflowDefinitions } from "../../data/automationWorkflows";
import {
  OPERATOR_HOUSE_MODULES,
  OPERATOR_SUPPORT_MODULES,
  OPERATOR_TENANCY_MODULES,
  SURFACE_CATALOG,
  getSurfaceByLabel,
  type RegisterSurfaceEntry,
} from "../trace/surfaceCatalog";
import { HiFiEmptyModule } from "./HiFiEmptyModule";
import {
  RegisterSurfaceMount,
  navBtnStyle,
  sectionLabelStyle,
} from "./registerSurfaceChrome";

type OperatorPrototypeSceneProps = {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
};

type ConfigLibSub =
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

function resolveConfigLibSub(entry: RegisterSurfaceEntry | null): ConfigLibSub | null {
  if (!entry || entry.module !== "Configuration libraries") return null;
  for (const sub of CONFIG_LIB_SUBS) {
    if (sub.surfaceLabels.includes(entry.label) || entry.label === sub.id) return sub.id;
  }
  if (entry.label === "Configuration libraries") return "Evaluation packs";
  return null;
}

function panelShell(t: Tokens, title: string, badge: ReactNode, children: ReactNode) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: t.bgPrimary,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: 35,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "0 14px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgSecondary,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: t.textPrimary,
          }}
        >
          {title}
        </span>
        {badge}
      </header>
      {children}
    </div>
  );
}

function statusChip(t: Tokens, label: string, tone: "accent" | "amber" | "muted" = "accent") {
  const color = tone === "amber" ? t.amber : tone === "muted" ? t.textMuted : t.accent;
  const bg = tone === "amber" ? t.amberBg : tone === "muted" ? t.hoverBg : t.accentBg;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color,
        background: bg,
        padding: "2px 6px",
        borderRadius: 3,
      }}
    >
      {label}
    </span>
  );
}

function ConfigurationLibrariesPanel({
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
          <div data-register-surface="Automation workflows" style={{ flex: 1, minHeight: 0, display: "flex" }}>
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
        <div data-register-surface="Engagement templates" style={{ flex: 1, minHeight: 0, display: "flex" }}>
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
        <div data-register-surface="Evaluation pack editor" style={{ flex: 1, minHeight: 0, display: "flex" }}>
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

function BookReadinessAuditList({
  t,
  isDark,
  selectedId,
  onSelect,
}: {
  t: Tokens;
  isDark: boolean;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { audits } = useAudits();

  return (
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
        <div style={sectionLabelStyle(t)}>Audits</div>
        <div data-register-surface="Audits">
          {audits.map((audit) => (
            <button
              key={audit.id}
              type="button"
              onClick={() => onSelect(audit.id)}
              style={navBtnStyle(t, audit.id === selectedId)}
            >
              <div style={{ fontWeight: 600 }}>{audit.label}</div>
              <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>{audit.meta}</div>
            </button>
          ))}
        </div>
        <div style={{ padding: "10px 12px" }}>
          <div data-register-surface="Verdict list" style={{ fontSize: 11, color: t.textMuted }}>
            Verdict list — open an audit run for gate outcomes
          </div>
        </div>
      </aside>
      <div
        data-register-surface="Audit run"
        style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex" }}
      >
        <AuditDetailView auditId={selectedId} t={t} isDark={isDark} />
      </div>
    </div>
  );
}

function BookReadinessPanel({
  t,
  isDark,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  isDark: boolean;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const [selectedId, setSelectedId] = useState("audit-crs-drift");
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;
  const focused =
    Boolean(focusedEntry) && focusedEntry!.module === "Book readiness";
  const hovered =
    Boolean(hoveredEntry) && hoveredEntry!.module === "Book readiness";

  return (
    <RegisterSurfaceMount label="Book readiness" focused={focused} hovered={hovered} t={t}>
      {panelShell(
        t,
        "Book readiness",
        statusChip(t, "wrong-seat", "amber"),
        <AuditProvider>
          <BookReadinessAuditList
            t={t}
            isDark={isDark}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </AuditProvider>,
      )}
    </RegisterSurfaceMount>
  );
}

function FirmOperationsBindPanel({
  t,
  focusedEntry,
  hoveredId,
}: {
  t: Tokens;
  focusedEntry: RegisterSurfaceEntry | null;
  hoveredId: string | null;
}) {
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;
  const focused =
    Boolean(focusedEntry) && focusedEntry!.module === "Firm operations bind";
  const hovered =
    Boolean(hoveredEntry) && hoveredEntry!.module === "Firm operations bind";

  const block = (
    label: string,
    title: string,
    body: string,
    extra?: ReactNode,
  ) => {
    const blockFocused = focusedEntry?.label === label;
    const blockHovered = hoveredEntry?.label === label;
    return (
      <RegisterSurfaceMount
        label={label}
        focused={blockFocused}
        hovered={blockHovered}
        t={t}
        style={{
          flex: "unset",
          minHeight: 0,
          border: `1px solid ${t.border}`,
          borderRadius: 6,
          background: t.bgSecondary,
          padding: 14,
          outlineOffset: 0,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 6 }}>
          {title}
        </div>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>{body}</p>
        {extra}
      </RegisterSurfaceMount>
    );
  };

  return (
    <RegisterSurfaceMount label="Firm operations bind" focused={focused} hovered={hovered} t={t}>
      {panelShell(
        t,
        "Firm operations bind",
        statusChip(t, "per-tenancy"),
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          }}
        >
          {block(
            "Bind packs",
            "Bind packs",
            "Select house-authored Evaluation pack, Automation pack, and Engagement template versions and bind them under this firm identity.",
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Evaluation pack · v2", "Automation · Welcome armer", "Engagement · Opt-in Standard"].map(
                (pack) => (
                  <span
                    key={pack}
                    style={{
                      fontSize: 11,
                      color: t.textPrimary,
                      background: t.bgPrimary,
                      border: `1px solid ${t.border}`,
                      borderRadius: 4,
                      padding: "4px 8px",
                    }}
                  >
                    {pack}
                  </span>
                ),
              )}
            </div>,
          )}
          {block(
            "Armed / Active",
            "Armed / Active",
            "Armed = template ready under this identity. Active = executing. Consultant Board shows inhabited motion only — no pack editor on the firm desk.",
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: t.amber,
                  background: t.amberBg,
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                Armed
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: t.accent,
                  background: t.accentBg,
                  borderRadius: 4,
                  padding: "4px 8px",
                }}
              >
                Active
              </span>
            </div>,
          )}
          <div
            data-register-surface="Send gates"
            style={{
              border: `1px solid ${t.border}`,
              borderRadius: 6,
              background: t.bgSecondary,
              padding: 14,
              outline:
                focusedEntry?.label === "Send gates"
                  ? `2px solid ${t.accent}`
                  : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>Send gates</span>
              {statusChip(t, "consent", "muted")}
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
              Consent ledger and send-gate configuration live here — never on the consultant desk.
              Placeholder until Step 6 densifies the gate controls.
            </p>
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}

export function OperatorPrototypeScene({
  t,
  isDark,
  focusedEntry,
  hoveredId,
}: OperatorPrototypeSceneProps) {
  const [module, setModule] = useState<string>(OPERATOR_HOUSE_MODULES[0]);
  const [configSub, setConfigSub] = useState<ConfigLibSub>("Evaluation packs");

  useEffect(() => {
    if (!focusedEntry || focusedEntry.desk !== "operator") return;
    setModule(focusedEntry.module);
    const sub = resolveConfigLibSub(focusedEntry);
    if (sub) setConfigSub(sub);
  }, [focusedEntry]);

  const entry = getSurfaceByLabel(focusedEntry?.label ?? module) ?? focusedEntry;
  const title = focusedEntry?.label ?? module;
  const hoveredEntry = hoveredId
    ? SURFACE_CATALOG.find((e) => e.id === hoveredId) ?? null
    : null;

  let main: ReactNode;
  if (module === "Configuration libraries") {
    main = (
      <ConfigurationLibrariesPanel
        t={t}
        isDark={isDark}
        focusedEntry={focusedEntry}
        hoveredId={hoveredId}
        sub={configSub}
        onSubChange={setConfigSub}
      />
    );
  } else if (module === "Book readiness") {
    main = (
      <BookReadinessPanel
        t={t}
        isDark={isDark}
        focusedEntry={focusedEntry}
        hoveredId={hoveredId}
      />
    );
  } else if (module === "Firm operations bind") {
    main = (
      <FirmOperationsBindPanel t={t} focusedEntry={focusedEntry} hoveredId={hoveredId} />
    );
  } else {
    main = (
      <RegisterSurfaceMount
        label={title}
        focused={Boolean(focusedEntry)}
        hovered={hoveredEntry?.module === module || hoveredEntry?.label === title}
        t={t}
      >
        <HiFiEmptyModule
          title={title}
          t={t}
          status={entry?.status ?? "new"}
          hint={
            entry?.status === "wrong-seat"
              ? "Re-homing from firm Hub — Configuration libraries / Book readiness destination"
              : undefined
          }
        />
      </RegisterSurfaceMount>
    );
  }

  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>
      <aside
        style={{
          width: 188,
          flexShrink: 0,
          borderRight: `1px solid ${t.border}`,
          background: t.bgSecondary,
          overflowY: "auto",
        }}
      >
        <div style={sectionLabelStyle(t)}>House-global</div>
        {OPERATOR_HOUSE_MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            style={navBtnStyle(t, module === id)}
          >
            {id}
          </button>
        ))}
        <div style={sectionLabelStyle(t)}>Per-tenancy</div>
        {OPERATOR_TENANCY_MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            style={navBtnStyle(t, module === id)}
          >
            {id}
          </button>
        ))}
        <div style={sectionLabelStyle(t)}>Support</div>
        {OPERATOR_SUPPORT_MODULES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setModule(id)}
            style={navBtnStyle(t, module === id)}
          >
            {id}
          </button>
        ))}
      </aside>

      <div style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 12, display: "flex" }}>
        {main}
      </div>
    </div>
  );
}
