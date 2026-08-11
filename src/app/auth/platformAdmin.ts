/** Sole platform admin — full Operator shell with consultant dropdown. */
export const PLATFORM_ADMIN_EMAIL = "admin@try-tower.com";

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;
}
