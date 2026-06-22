type ResendLogoProps = {
  size?: number;
  title?: string;
};

/** Resend brand mark — compact for register system pills. */
export function ResendLogo({ size = 16, title = "Resend" }: ResendLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path
        d="M7.5 7.5H14.2L10.85 12L14.2 16.5H11.1L8.4 12.75V16.5H7.5V7.5ZM11.1 13.5L13.1 16.5H12.15L10.2 13.5H11.1Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
