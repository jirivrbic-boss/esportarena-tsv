/**
 * Absolutní URL webu (pro odkazy v e-mailech). Priorita env, jinak Host z requestu (např. při deploy / localhost).
 */
export function getSitePublicUrl(request?: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ??
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  if (request) {
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto =
      request.headers.get("x-forwarded-proto") ??
      (host?.includes("localhost") ? "http" : "https");
    if (host) return `${proto}://${host}`;
  }

  return "http://localhost:3000";
}
