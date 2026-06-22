type RegisterFlowWireStepBadgeProps = {
  order: { step: number; suffix?: string };
  active?: boolean;
  accentColor?: string;
};

function formatLabel(order: { step: number; suffix?: string }): string {
  return `${order.step}${order.suffix ?? ""}`;
}

export function RegisterFlowWireStepBadge({
  order,
  active = false,
  accentColor = "#2563EB",
}: RegisterFlowWireStepBadgeProps) {
  const label = formatLabel(order);
  const width = label.length > 2 ? 24 : 20;

  return (
    <div
      style={{
        width,
        height: 20,
        borderRadius: 999,
        background: "#000000",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: label.length > 2 ? 9 : 10,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-0.02em",
        boxSizing: "border-box",
        border: `2px solid ${active ? accentColor : "transparent"}`,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}
