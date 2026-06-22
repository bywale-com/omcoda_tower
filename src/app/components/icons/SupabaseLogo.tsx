type SupabaseLogoProps = {
  size?: number;
  title?: string;
};

/** Supabase brand mark — compact for register system pills. */
export function SupabaseLogo({ size = 16, title = "Supabase" }: SupabaseLogoProps) {
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
      <path
        d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 10.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-10.261.401-.562a1.04 1.04 0 0 0-.836-1.66z"
        fill="#3ECF8E"
      />
    </svg>
  );
}
