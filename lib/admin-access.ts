import { isSuperAdminEmail } from "@/lib/super-admin";

/** E-maily z ADMIN_EMAILS (server / Edge middleware). */
export function parseAdminEmailsEnv(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Přístup k /admin, /edit a CMS stránkám (cookie session): super admin + ADMIN_EMAILS. */
export function isSiteAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  if (isSuperAdminEmail(email)) return true;
  return parseAdminEmailsEnv().includes(email.toLowerCase());
}
