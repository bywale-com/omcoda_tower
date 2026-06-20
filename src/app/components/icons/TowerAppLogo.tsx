type TowerAppLogoProps = {
  size?: number;
  title?: string;
  /** Artwork fill within the box (1 = edge-to-edge). Notion nav icons ≈ 44/64. */
  opticalScale?: number;
};

/** Tower app mark — rounded square, inset white border, upper-left triangle. */
export function TowerAppLogo({
  size = 16,
  title = "Tower",
  opticalScale = 1,
}: TowerAppLogoProps) {
  const scale = Math.min(Math.max(opticalScale, 0.01), 1);
  const viewSize = 512 / scale;
  const viewOrigin = (512 - viewSize) / 2;
  const viewBox = `${viewOrigin} ${viewOrigin} ${viewSize} ${viewSize}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="512" height="512" rx="60" fill="#000000" />
      <rect
        x="15"
        y="15"
        width="482"
        height="482"
        rx="45"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="12"
      />
      <path d="M81 80H330L205 263Z" fill="#FFFFFF" />
    </svg>
  );
}
