import { useState } from "react";
import { Info, LineChart as LineChartIcon, Zap, ExternalLink } from "lucide-react";
import { JourneyTab } from "./JourneyTab";
import { getClientDetail } from "../data/clients";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, CartesianGrid,
} from "recharts";
import type { Tokens } from "./tokens";
import { usePanel } from "../context/PanelContext";

type Snapshot = {
  date: string; shortDate: string;
  crs: number; canadianWork: number; daysInSystem: number;
  permitStatus: string; permitDaysLeft: number;
  drawThreshold: number; aboveThreshold: boolean;
  event?: string;
};

const HISTORY: Snapshot[] = [
  { date: "14 Mar 2024", shortDate: "Mar '24", crs: 441, canadianWork: 0,  daysInSystem: 0,   permitStatus: "Valid",    permitDaysLeft: 866, drawThreshold: 491, aboveThreshold: false, event: "Onboarded" },
  { date: "01 Apr 2024", shortDate: "Apr '24", crs: 441, canadianWork: 1,  daysInSystem: 18,  permitStatus: "Valid",    permitDaysLeft: 848, drawThreshold: 491, aboveThreshold: false },
  { date: "01 May 2024", shortDate: "May '24", crs: 443, canadianWork: 2,  daysInSystem: 48,  permitStatus: "Valid",    permitDaysLeft: 818, drawThreshold: 489, aboveThreshold: false, event: "1st nudge" },
  { date: "01 Jun 2024", shortDate: "Jun '24", crs: 443, canadianWork: 3,  daysInSystem: 79,  permitStatus: "Valid",    permitDaysLeft: 787, drawThreshold: 487, aboveThreshold: false },
  { date: "01 Aug 2024", shortDate: "Aug '24", crs: 445, canadianWork: 5,  daysInSystem: 140, permitStatus: "Valid",    permitDaysLeft: 726, drawThreshold: 483, aboveThreshold: false },
  { date: "01 Oct 2024", shortDate: "Oct '24", crs: 447, canadianWork: 7,  daysInSystem: 201, permitStatus: "Valid",    permitDaysLeft: 665, drawThreshold: 479, aboveThreshold: false, event: "CRS → 447" },
  { date: "01 Jan 2025", shortDate: "Jan '25", crs: 447, canadianWork: 10, daysInSystem: 293, permitStatus: "Valid",    permitDaysLeft: 573, drawThreshold: 472, aboveThreshold: false },
  { date: "01 Mar 2025", shortDate: "Mar '25", crs: 447, canadianWork: 12, daysInSystem: 352, permitStatus: "Valid",    permitDaysLeft: 514, drawThreshold: 466, aboveThreshold: false },
  { date: "01 Sep 2025", shortDate: "Sep '25", crs: 447, canadianWork: 14, daysInSystem: 536, permitStatus: "Valid",    permitDaysLeft: 331, drawThreshold: 452, aboveThreshold: false },
  { date: "01 Jan 2026", shortDate: "Jan '26", crs: 447, canadianWork: 14, daysInSystem: 658, permitStatus: "Valid",    permitDaysLeft: 208, drawThreshold: 446, aboveThreshold: true },
  { date: "01 Apr 2026", shortDate: "Apr '26", crs: 447, canadianWork: 14, daysInSystem: 748, permitStatus: "Valid",    permitDaysLeft: 118, drawThreshold: 444, aboveThreshold: true },
  { date: "11 Jun 2026", shortDate: "Jun '26", crs: 447, canadianWork: 14, daysInSystem: 819, permitStatus: "Expiring", permitDaysLeft: 47,  drawThreshold: 443, aboveThreshold: true, event: "Activation triggered" },
];

const CHART_DATA = HISTORY.map((s, i) => ({ ...s, idx: i }));

type PanelTab = "read" | "data" | "logs";

const PANEL_CHIPS: { id: PanelTab; label: string; Icon: typeof Info }[] = [
  { id: "read", label: "Information", Icon: Info },
  { id: "data", label: "History",     Icon: LineChartIcon },
  { id: "logs", label: "Activity",    Icon: Zap },
];

const COLLAPSED_H = 0;
const DEFAULT_H   = 420;
const MIN_H       = 140;
const MAX_H       = 700;

export type ClientDataContentProps = {
  clientId: string;
  t: Tokens;
  isDark: boolean;
  defaultTab?: PanelTab;
  fullPage?: boolean;
  onOpenFullPage?: () => void;
};

export function ClientDataContent({
  clientId,
  t,
  isDark,
  defaultTab = "read",
  fullPage = false,
  onOpenFullPage,
}: ClientDataContentProps) {
  const [activeTab, setActiveTab] = useState<PanelTab>(defaultTab);
  const [scrubIdx, setScrubIdx] = useState(HISTORY.length - 1);

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      minHeight: 0,
    }}>
      <div style={{ flexShrink: 0, padding: fullPage ? "20px 28px 0" : "10px 28px 0", background: t.bgPrimary }}>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: t.textPrimary, margin: 0 }}>
            Client Data
          </span>
          {!fullPage && onOpenFullPage && (
            <button
              type="button"
              title="Open Client Data in new tab"
              onClick={onOpenFullPage}
              style={{
                width: 22,
                height: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                border: "none",
                borderRadius: 4,
                background: "transparent",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.hoverBg; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <ExternalLink size={14} color={t.accent} strokeWidth={2} />
            </button>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingBottom: 14 }}>
          {PANEL_CHIPS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "0 8px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 400,
                  lineHeight: 1.4,
                  color: t.textPrimary,
                  background: isActive ? t.accentBg : "transparent",
                }}
              >
                <Icon size={12} color={t.textPrimary} strokeWidth={1.75} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {activeTab === "read" && <InformationTab clientId={clientId} t={t} />}
        {activeTab === "data" && <CrsHistoryTab scrubIdx={scrubIdx} setScrubIdx={setScrubIdx} t={t} isDark={isDark} />}
        {activeTab === "logs" && <JourneyTab t={t} clientId={clientId} />}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, t }: { active?: boolean; payload?: { payload: Snapshot }[]; t: Tokens }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div style={{ background: t.bgPrimary, border: `1px solid ${t.border}`, padding: "6px 10px", fontSize: 11, color: t.textPrimary, borderRadius: 4 }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{d.date}</div>
      <div style={{ color: t.accent }}>CRS {d.crs}</div>
      <div style={{ color: t.textMuted }}>Threshold {d.drawThreshold}</div>
      {d.event && <div style={{ color: t.amber, marginTop: 2 }}>↑ {d.event}</div>}
    </div>
  );
}

function ProfileTable({ rows, t }: { rows: { label: string; value: string; valueColor?: string }[]; t: Tokens }) {
  if (rows.length === 0) {
    return (
      <div style={{ padding: "32px 28px", fontSize: 12, color: t.textDim }}>
        No records yet.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px" }}>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
        {rows.map((row, i) => (
          <div
            key={row.label}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(140px, 1fr) minmax(180px, 1.6fr)",
              borderBottom: i < rows.length - 1 ? `1px solid ${t.borderLight}` : "none",
            }}
          >
            <div style={{
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: t.textPrimary,
              lineHeight: 1.4,
              borderRight: `1px solid ${t.borderLight}`,
            }}>
              {row.label}
            </div>
            <div style={{
              padding: "10px 14px",
              fontSize: 13,
              color: row.valueColor ?? t.textPrimary,
              lineHeight: 1.4,
            }}>
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InformationTab({ clientId, t }: { clientId: string; t: Tokens }) {
  const client = getClientDetail(clientId);
  const statusColor = client.status === "eligible" ? t.accent : client.status === "close" ? t.amber : t.textMuted;

  const rows = [
    { label: "Name", value: client.name },
    { label: "Pathway", value: client.pathway },
    { label: "Status", value: client.statusLabel, valueColor: statusColor },
    { label: "CRS", value: String(client.crs) },
    { label: "Work permit", value: client.workPermitExpiry, valueColor: client.workPermitWarn ? t.amber : undefined },
    { label: "Days in system", value: client.daysInSystem },
    ...Object.entries(client.profile).map(([label, value]) => ({ label, value })),
  ];

  return <ProfileTable rows={rows} t={t} />;
}

function CrsHistoryTab({ scrubIdx, setScrubIdx, t, isDark }: { scrubIdx: number; setScrubIdx: (i: number) => void; t: Tokens; isDark: boolean }) {
  const snap = HISTORY[scrubIdx];
  const gridColor = isDark ? t.borderLight : t.borderLight;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 10,
        padding: "8px 28px",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 10, color: t.textDim }}>{HISTORY[0].shortDate}</span>
        <input
          type="range"
          min={0}
          max={HISTORY.length - 1}
          value={scrubIdx}
          onChange={(e) => setScrubIdx(Number(e.target.value))}
          style={{ width: 140, accentColor: t.accent, cursor: "pointer" }}
        />
        <span style={{ fontSize: 10, color: t.textDim }}>{HISTORY[HISTORY.length - 1].shortDate}</span>
        <span style={{ fontSize: 10, background: t.accentBg, color: t.accent, padding: "2px 8px", borderRadius: 3, fontWeight: 500 }}>
          {snap.date}
        </span>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        <div style={{ width: 160, flexShrink: 0, padding: "16px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["CRS score", String(snap.crs), t.accent],
            ["Draw threshold", String(snap.drawThreshold), t.textPrimary],
            ["Permit days left", String(snap.permitDaysLeft), snap.permitDaysLeft < 90 ? t.amber : t.textPrimary],
            ["Days in system", String(snap.daysInSystem), t.textPrimary],
          ].map(([label, value, color]) => (
            <div key={label as string}>
              <div style={{ fontSize: 10, color: t.textDim, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 13, color: color as string }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1, padding: "12px 16px 8px 0", overflow: "hidden", minWidth: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA} margin={{ top: 6, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid stroke={gridColor} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="shortDate" tick={{ fontSize: 9, fill: t.textDim }} tickLine={false} axisLine={{ stroke: gridColor }} interval={2} />
              <YAxis tick={{ fontSize: 9, fill: t.textDim }} tickLine={false} axisLine={false} domain={[430, 500]} width={36} />
              <Tooltip content={<CustomTooltip t={t} />} />
              <Line type="monotone" dataKey="drawThreshold" stroke={t.borderLight} strokeWidth={1} dot={false} strokeDasharray="4 3" />
              <Line type="monotone" dataKey="crs" stroke={t.accent} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: t.accent, strokeWidth: 0 }} />
              <ReferenceLine x={CHART_DATA[scrubIdx]?.shortDate} stroke={t.amber} strokeWidth={1.5} strokeDasharray="3 3" label={{ value: "▼", position: "top", fill: t.amber, fontSize: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

type DataPanelProps = {
  clientId: string;
  t: Tokens;
  isDark: boolean;
  onOpenFullPage?: () => void;
};

export function DataPanel({ clientId, t, isDark, onOpenFullPage }: DataPanelProps) {
  const { isPanelOpen: isOpen } = usePanel();
  const [panelH, setPanelH] = useState(DEFAULT_H);
  const [isResizing, setIsResizing] = useState(false);

  const onDragHandleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = panelH;

    const handleMove = (ev: MouseEvent) => {
      const delta = startY - ev.clientY;
      setPanelH(Math.min(MAX_H, Math.max(MIN_H, startH + delta)));
    };

    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    setIsResizing(true);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const currentH = isOpen ? panelH : COLLAPSED_H;

  return (
    <div style={{
      flexShrink: 0,
      background: t.bgPrimary,
      height: currentH,
      overflow: "hidden",
      display: isOpen ? "flex" : "none",
      flexDirection: "column",
      transition: isResizing ? "none" : "height 0.15s ease",
      userSelect: isResizing ? "none" : "auto",
      borderTop: isOpen ? `1px solid ${t.borderLight}` : "none",
    }}>

      {isOpen && (
        <div
          onMouseDown={onDragHandleMouseDown}
          style={{
            height: 4,
            flexShrink: 0,
            cursor: "ns-resize",
            background: isResizing ? t.accent : "transparent",
            transition: "background 0.1s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = t.accent + "55"; }}
          onMouseLeave={(e) => { if (!isResizing) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        />
      )}

      {isOpen && (
        <ClientDataContent clientId={clientId} t={t} isDark={isDark} onOpenFullPage={onOpenFullPage} />
      )}
    </div>
  );
}
