import type { ClientStatus } from "../data/clients";

const statusColor: Record<ClientStatus, string> = {
  teal:  "#4A7BF7",
  amber: "#C17D11",
  grey:  "#6B7280",
};

type ClientIconProps = {
  initials: string;
  status: ClientStatus;
  size?: number;
};

/**
 * VS Code–style file icon: document shape with folded top-right corner.
 * Used in the Explorer sidebar rows and in the tab strip.
 */
export function ClientIcon({ initials, status, size = 14 }: ClientIconProps) {
  const color = statusColor[status];
  const w = size;
  const h = Math.round(size * (16 / 14));
  const fold = Math.round(size * (4 / 14));
  // First letter only, cleaner at small sizes
  const letter = initials.charAt(0);

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 14 16`}
      fill="none"
      style={{ flexShrink: 0, display: "block" }}
    >
      {/* Document body */}
      <path
        d={`M0 1.5C0 0.67 0.67 0 1.5 0H9L14 5V14.5C14 15.33 13.33 16 12.5 16H1.5C0.67 16 0 15.33 0 14.5V1.5Z`}
        fill={color}
        fillOpacity="0.15"
      />
      {/* Document outline */}
      <path
        d={`M0.5 1.5C0.5 0.95 0.95 0.5 1.5 0.5H8.79L13.5 5.21V14.5C13.5 15.05 13.05 15.5 12.5 15.5H1.5C0.95 15.5 0.5 15.05 0.5 14.5V1.5Z`}
        stroke={color}
        strokeOpacity="0.6"
        strokeWidth="0.8"
        fill="none"
      />
      {/* Fold triangle */}
      <path
        d={`M9 0.5L13.5 5H9.5C9.22 5 9 4.78 9 4.5V0.5Z`}
        fill={color}
        fillOpacity="0.35"
      />
      {/* Fold border line */}
      <path
        d={`M9 0.5V4.5C9 4.78 9.22 5 9.5 5H13.5`}
        stroke={color}
        strokeOpacity="0.5"
        strokeWidth="0.8"
        fill="none"
      />
      {/* Initial letter */}
      <text
        x="7"
        y="12"
        textAnchor="middle"
        fontSize="7"
        fontWeight="700"
        fontFamily="Poppins, sans-serif"
        fill={color}
        fillOpacity="0.9"
      >
        {letter}
      </text>
    </svg>
  );
}
