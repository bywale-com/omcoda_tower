/** Sole platform admin — may view-as any firm via x-firm-id. */
export const PLATFORM_ADMIN_EMAIL = "admin@try-tower.com";

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === PLATFORM_ADMIN_EMAIL;
}
