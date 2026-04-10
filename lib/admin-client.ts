import { isSuperAdminEmail } from "@/lib/super-admin";

/**
 * Které účty po přihlášení přesměrovat na /admin (klient).
 * Super admin je vždy; další adminy z NEXT_PUBLIC_ADMIN_EMAILS (stejný seznam jako ADMIN_EMAILS).
 */
export function isClientAdminEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false;
  if (isSuperAdminEmail(email)) return true;
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
  const list = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}
