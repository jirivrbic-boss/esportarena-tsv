/** Jediný Super Admin – plný přístup k /admin, CMS a /edit režimu. */
export const SUPER_ADMIN_EMAIL = "jiri@esportarena.cz";

export function isSuperAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  return (
    email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.trim().toLowerCase()
  );
}
