/** Jediný Super Admin – plný přístup k /admin, CMS a /edit režimu. */
export const SUPER_ADMIN_EMAIL = "jiri@esportarena.cz";

export function isSuperAdminEmail(email: string | undefined): boolean {
  return email?.toLowerCase() === SUPER_ADMIN_EMAIL;
}
