/**
 * Acquisition & ads — Approach campaigns editor + instrumentation (How leaves 1.1–1.2).
 */
import { useEffect, useState } from "react";
import {
  CT_DEMO,
  useWireTick,
  wirePorts,
  type MetaCampaignState,
  type MetaDeliveryState,
  type MetaReviewState,
} from "../../../wire";
import { RegisterSurfaceMount, sectionLabelStyle } from "../registerSurfaceChrome";
import {
  filterSelectStyle,
  moduleFocus,
  panelShell,
  primaryBtnStyle,
  resolveHoveredEntry,
  secondaryBtnStyle,
  statusChip,
  surfaceBlock,
  type OperatorModuleProps,
} from "./operatorChrome";

const REVIEW_STATES: MetaReviewState[] = ["draft", "in_review", "approved", "rejected"];
const DELIVERY_STATES: MetaDeliveryState[] = ["not_started", "scheduled", "active", "paused", "ended"];

function reviewTone(review: MetaReviewState): "success" | "amber" | "muted" | "danger" {
  if (review === "approved") return "success";
  if (review === "rejected") return "danger";
  if (review === "in_review") return "amber";
  return "muted";
}

function deliveryTone(delivery: MetaDeliveryState): "success" | "amber" | "muted" | "danger" {
  if (delivery === "active") return "success";
  if (delivery === "paused") return "danger";
  if (delivery === "scheduled") return "amber";
  return "muted";
}

type CampaignStatus = "Live" | "Paused" | "Draft";

type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  budget: string;
  captures: number;
  feedCreative: string;
  adCopy: string;
  captureName: string;
  captureWebsite: string;
  captureChannel: string;
};

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-q3",
    name: "Approach · Q3 RCIC pilots",
    status: "Live",
    budget: "≤ 3 clicks / lead",
    captures: 42,
    feedCreative: "RCIC desk · one-tap firm capture",
    adCopy: "Run your immigration desk on Tower — name + site in one tap.",
    captureName: "Priya Desai, RCIC",
    captureWebsite: "cedarpathways.ca",
    captureChannel: "WhatsApp",
  },
  {
    id: "camp-retarget",
    name: "Warm retarget · site visitors",
    status: "Paused",
    budget: "≤ 2 clicks / lead",
    captures: 18,
    feedCreative: "Still evaluating Tower?",
    adCopy: "Return to your captured firm seed — continue in one tap.",
    captureName: "Harbor RCIC Desk",
    captureWebsite: "harborrcic.ca",
    captureChannel: "Email",
  },
  {
    id: "camp-assist",
    name: "Assisted OLG mirror (non-Meta)",
    status: "Draft",
    budget: "Operator-led",
    captures: 0,
    feedCreative: "Operator-assisted onboarding mirror",
    adCopy: "Same desk as ALG — assisted door only.",
    captureName: "",
    captureWebsite: "",
    captureChannel: "Email",
  },
];

const INSTRUMENTATION_BY_CAMPAIGN: Record<
  string,
  { dontUnderstand: number; understandDontTap: number; continueScroll: number }
> = {
  "camp-q3": { dontUnderstand: 1240, understandDontTap: 380, continueScroll: 2100 },
  "camp-retarget": { dontUnderstand: 420, understandDontTap: 95, continueScroll: 680 },
  "camp-assist": { dontUnderstand: 0, understandDontTap: 0, continueScroll: 0 },
};

export function AcquisitionAdsModule({ t, focusedEntry, hoveredId }: OperatorModuleProps) {
  const hoveredEntry = resolveHoveredEntry(hoveredId);
  const focus = moduleFocus("Acquisition & ads", focusedEntry, hoveredEntry);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [selectedId, setSelectedId] = useState(INITIAL_CAMPAIGNS[0].id);
  const [instrFilterId, setInstrFilterId] = useState(INITIAL_CAMPAIGNS[0].id);
  const [actionNote, setActionNote] = useState<string | null>(null);
  const [waitingHydrateJump, setWaitingHydrateJump] = useState<string | null>(null);
  const [killThreshold, setKillThreshold] = useState("400");
  const [killAction, setKillAction] = useState<"hold" | "kill">("hold");
  const [killApplied, setKillApplied] = useState<string | null>(null);
  const [metaState, setMetaState] = useState<MetaCampaignState | null>(null);
  const wireTick = useWireTick();

  const waitingForHydrate = 7;

  useEffect(() => {
    let cancelled = false;
    void wirePorts.metaAds.getCampaign(CT_DEMO.firmId).then((s) => {
      if (!cancelled) setMetaState(s);
    });
    return () => {
      cancelled = true;
    };
  }, [wireTick]);

  async function setReview(review: MetaReviewState) {
    const next = await wirePorts.metaAds.setReview(CT_DEMO.firmId, review);
    setMetaState(next);
  }

  async function setDelivery(delivery: MetaDeliveryState) {
    const next = await wirePorts.metaAds.setDelivery(CT_DEMO.firmId, delivery);
    setMetaState(next);
  }

  useEffect(() => {
    if (!focusedEntry || focusedEntry.module !== "Acquisition & ads") return;
    if (
      focusedEntry.label === "Approach campaigns" ||
      focusedEntry.label === "Capture strip" ||
      focusedEntry.label === "Approach campaign editor" ||
      focusedEntry.label === "Save / Publish campaign"
    ) {
      setSelectedId(INITIAL_CAMPAIGNS[0].id);
    }
    if (focusedEntry.label === "Approach instrumentation") {
      setInstrFilterId(INITIAL_CAMPAIGNS[0].id);
    }
  }, [focusedEntry]);

  const selected = campaigns.find((c) => c.id === selectedId) ?? campaigns[0];
  const instr = INSTRUMENTATION_BY_CAMPAIGN[instrFilterId] ?? INSTRUMENTATION_BY_CAMPAIGN["camp-q3"];

  const patchSelected = (patch: Partial<Campaign>) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, ...patch } : c)),
    );
  };

  const patchSelectedStatus = (id: string, status: CampaignStatus) => {
    setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const newCampaign = () => {
    const id = `camp-${Date.now().toString().slice(-5)}`;
    const camp: Campaign = {
      id,
      name: "New Approach campaign",
      status: "Draft",
      budget: "≤ 3 clicks / lead",
      captures: 0,
      feedCreative: "",
      adCopy: "",
      captureName: "",
      captureWebsite: "",
      captureChannel: "Email",
    };
    setCampaigns((prev) => [...prev, camp]);
    setSelectedId(id);
    setActionNote("New campaign draft created");
  };

  const fieldLabel = { fontSize: 10, color: t.textDim, marginBottom: 4 };
  const textInput = {
    width: "100%",
    fontSize: 12,
    fontFamily: "inherit" as const,
    padding: "7px 9px",
    border: `1px solid ${t.border}`,
    borderRadius: 4,
    background: t.bgPrimary,
    color: t.textPrimary,
    boxSizing: "border-box" as const,
  };

  return (
    <RegisterSurfaceMount
      label="Acquisition & ads"
      focused={focus.focused && focusedEntry?.label === "Acquisition & ads"}
      hovered={hoveredEntry?.label === "Acquisition & ads"}
      t={t}
    >
      {panelShell(
        t,
        "Acquisition & ads",
        statusChip(t, "house-global"),
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            overflow: "hidden",
            background: `linear-gradient(165deg, ${t.bgPrimary} 0%, ${t.hoverBg} 55%, ${t.bgSecondary} 100%)`,
          }}
        >
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: `1px solid ${t.border}`,
              background: t.bgSecondary,
              overflowY: "auto",
            }}
          >
            <div style={sectionLabelStyle(t)}>Approach campaigns</div>
            <div data-register-surface="Approach campaigns">
              {campaigns.map((camp) => (
                <button
                  key={camp.id}
                  type="button"
                  onClick={() => setSelectedId(camp.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 12px",
                    border: "none",
                    borderLeft:
                      camp.id === selectedId ? `3px solid ${t.accent}` : "3px solid transparent",
                    background: camp.id === selectedId ? t.accentBg : "transparent",
                    color: t.textPrimary,
                    fontSize: 12,
                    fontFamily: "inherit",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{camp.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
                    {camp.status} · {camp.captures} captures
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={newCampaign}
              style={{
                ...secondaryBtnStyle(t),
                width: "calc(100% - 24px)",
                margin: "8px 12px 12px",
              }}
            >
              New campaign
            </button>
            <p
              style={{
                margin: "0 12px 12px",
                fontSize: 10,
                lineHeight: 1.45,
                color: t.textDim,
              }}
            >
              Meta ad supply is external intent — Tower configures what to send; no Meta UI in
              Tower.
            </p>
          </aside>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              overflowY: "auto",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {surfaceBlock(
              t,
              "Approach campaign editor",
              focus.labelFocused("Approach campaign editor") ||
                focus.labelFocused("Capture strip") ||
                focus.labelFocused("Save / Publish campaign"),
              focus.labelHovered("Approach campaign editor") ||
                focus.labelHovered("Capture strip"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Approach campaign editor
                  </span>
                  {statusChip(
                    t,
                    selected.status === "Live" ? "live" : selected.status.toLowerCase(),
                    selected.status === "Live" ? "success" : "muted",
                  )}
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Feed → ad → Capture strip inside click budget ({selected.budget}). Captured seed
                  writes state read by Activation & forward-deploy In-flight activations.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <label>
                    <div style={fieldLabel}>Feed creative</div>
                    <input
                      value={selected.feedCreative}
                      onChange={(e) => patchSelected({ feedCreative: e.target.value })}
                      style={textInput}
                    />
                  </label>
                  <label>
                    <div style={fieldLabel}>Ad copy</div>
                    <textarea
                      value={selected.adCopy}
                      onChange={(e) => patchSelected({ adCopy: e.target.value })}
                      rows={2}
                      style={{ ...textInput, resize: "vertical" }}
                    />
                  </label>
                </div>

                <div
                  data-register-surface="Capture strip"
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: `1px solid ${t.border}`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                    Capture strip
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <label>
                      <div style={fieldLabel}>Name</div>
                      <input
                        value={selected.captureName}
                        onChange={(e) => patchSelected({ captureName: e.target.value })}
                        placeholder="Firm / consultant name"
                        style={textInput}
                      />
                    </label>
                    <label>
                      <div style={fieldLabel}>Website</div>
                      <input
                        value={selected.captureWebsite}
                        onChange={(e) => patchSelected({ captureWebsite: e.target.value })}
                        placeholder="firm.ca"
                        style={textInput}
                      />
                    </label>
                    <label>
                      <div style={fieldLabel}>Channel</div>
                      <select
                        value={selected.captureChannel}
                        onChange={(e) => patchSelected({ captureChannel: e.target.value })}
                        style={textInput}
                      >
                        <option value="Email">Email</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
                  <button
                    type="button"
                    style={secondaryBtnStyle(t)}
                    onClick={() => setActionNote(`Saved draft · ${selected.name}`)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    data-register-surface="Save / Publish campaign"
                    style={primaryBtnStyle(t)}
                    onClick={() => {
                      patchSelected({ status: "Live" });
                      setActionNote(`Published · ${selected.name} live for capture`);
                    }}
                  >
                    Publish campaign
                  </button>
                  {actionNote ? (
                    <span style={{ fontSize: 11, color: t.accent }}>{actionNote}</span>
                  ) : null}
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Meta campaign review & delivery",
              focus.labelFocused("Campaign review state") || focus.labelFocused("Campaign delivery state"),
              focus.labelHovered("Campaign review state") || focus.labelHovered("Campaign delivery state"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Meta campaign review &amp; delivery
                  </span>
                  {statusChip(t, "outbound: deferred", "muted")}
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  Chip contract only — bound to wirePorts.metaAds. Ads go-live stays deferred;
                  outbound-ready reads dark/false regardless of review/delivery state below.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div data-register-surface="Campaign review state">
                    <div style={fieldLabel}>Review state</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {statusChip(
                        t,
                        metaState?.review ?? "draft",
                        reviewTone(metaState?.review ?? "draft"),
                      )}
                      <select
                        value={metaState?.review ?? "draft"}
                        onChange={(e) => void setReview(e.target.value as MetaReviewState)}
                        style={{ ...textInput, width: "auto" }}
                      >
                        {REVIEW_STATES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div data-register-surface="Campaign delivery state">
                    <div style={fieldLabel}>Delivery state</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {statusChip(
                        t,
                        metaState?.delivery ?? "not_started",
                        deliveryTone(metaState?.delivery ?? "not_started"),
                      )}
                      <select
                        value={metaState?.delivery ?? "not_started"}
                        onChange={(e) => void setDelivery(e.target.value as MetaDeliveryState)}
                        style={{ ...textInput, width: "auto" }}
                      >
                        {DELIVERY_STATES.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: `1px solid ${t.border}`,
                    fontSize: 11,
                    color: t.textDim,
                  }}
                >
                  Outbound-ready:{" "}
                  <strong style={{ color: t.textMuted }}>
                    {metaState?.outboundReady ? "live" : "dark (deferred)"}
                  </strong>{" "}
                  — Arm ads stays disabled until near-real-time lead pull → first agent text ships.
                </div>
              </>,
            )}

            {surfaceBlock(
              t,
              "Waiting-for-hydrate",
              focus.labelFocused("Waiting-for-hydrate"),
              focus.labelHovered("Waiting-for-hydrate"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Staging queue
                  </span>
                  {statusChip(t, "capture → hydrate", "muted")}
                </div>
                <button
                  type="button"
                  data-register-surface="Waiting-for-hydrate"
                  onClick={() =>
                    setWaitingHydrateJump(
                      `Jump to In-flight activations · filter not-yet-hydrated · ${waitingForHydrate} rows`,
                    )
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    fontFamily: "inherit",
                    background: t.bgPrimary,
                    border: `1px solid ${t.border}`,
                    borderRadius: 4,
                    padding: "12px 14px",
                    cursor: "pointer",
                    color: t.textPrimary,
                  }}
                >
                  <div style={{ fontSize: 10, color: t.textDim }}>Waiting-for-hydrate</div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 650,
                      letterSpacing: "-0.02em",
                      marginTop: 4,
                    }}
                  >
                    {waitingForHydrate}
                  </div>
                  <div style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>
                    Captures not yet hydrated — open In-flight activations
                  </div>
                </button>
                {waitingHydrateJump ? (
                  <div style={{ marginTop: 8, fontSize: 11, color: t.accent }}>{waitingHydrateJump}</div>
                ) : null}
              </>,
            )}

            {surfaceBlock(
              t,
              "Approach instrumentation",
              focus.labelFocused("Approach instrumentation"),
              focus.labelHovered("Approach instrumentation"),
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary }}>
                    Approach instrumentation
                  </span>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: t.textDim }}>Campaign</span>
                    <select
                      value={instrFilterId}
                      onChange={(e) => setInstrFilterId(e.target.value)}
                      style={filterSelectStyle(t)}
                    >
                      {campaigns.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: t.textMuted }}>
                  View-only stream aggregates — distinguishes understood-but-didn&apos;t-tap vs
                  didn&apos;t-understand. Kill / hold marks unscoreable without leaving Ads.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    {
                      label: "don't-understand",
                      value: instr.dontUnderstand.toLocaleString(),
                      note: "Disbelief · copy unclear",
                    },
                    {
                      label: "understand-don't-tap",
                      value: instr.understandDontTap.toLocaleString(),
                      note: "Understood · no tap",
                    },
                    {
                      label: "continue-scroll",
                      value: instr.continueScroll.toLocaleString(),
                      note: "Scroll past capture",
                    },
                  ].map((card) => (
                    <div
                      key={card.label}
                      style={{
                        background: t.bgPrimary,
                        border: `1px solid ${t.border}`,
                        borderRadius: 4,
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ fontSize: 10, color: t.textDim }}>{card.label}</div>
                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 650,
                          color: t.textPrimary,
                          marginTop: 4,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {card.value}
                      </div>
                      <div style={{ fontSize: 10, color: t.textMuted, marginTop: 2 }}>{card.note}</div>
                    </div>
                  ))}
                </div>

                <div
                  data-register-surface="Kill / hold criteria"
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: `1px solid ${t.border}`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>
                    Kill / hold criteria
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: 8,
                      alignItems: "end",
                    }}
                  >
                    <label>
                      <div style={fieldLabel}>understand-don&apos;t-tap threshold</div>
                      <input
                        value={killThreshold}
                        onChange={(e) => setKillThreshold(e.target.value)}
                        style={textInput}
                      />
                    </label>
                    <label>
                      <div style={fieldLabel}>Action</div>
                      <select
                        value={killAction}
                        onChange={(e) => setKillAction(e.target.value as "hold" | "kill")}
                        style={textInput}
                      >
                        <option value="hold">Hold spend</option>
                        <option value="kill">Kill variant</option>
                      </select>
                    </label>
                    <button
                      type="button"
                      style={secondaryBtnStyle(t)}
                      onClick={() => {
                        const camp =
                          campaigns.find((c) => c.id === instrFilterId)?.name ?? "campaign";
                        if (killAction === "kill") {
                          patchSelectedStatus(instrFilterId, "Paused");
                        }
                        setKillApplied(
                          `${killAction === "kill" ? "Killed" : "Held"} · ${camp} · threshold ${killThreshold}`,
                        );
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {killApplied ? (
                    <div style={{ marginTop: 8, fontSize: 11, color: t.accent }}>{killApplied}</div>
                  ) : null}
                </div>
              </>,
            )}
          </div>
        </div>,
      )}
    </RegisterSurfaceMount>
  );
}
