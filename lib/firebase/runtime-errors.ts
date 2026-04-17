export function isFirebaseAdminRuntimeError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? "");
  const normalized = msg.toLowerCase();
  return (
    normalized.includes("failed to load external module firebase-admin") ||
    normalized.includes("no such module \"firebase-admin") ||
    normalized.includes("string did not match the expected pattern")
  );
}

export function firebaseAdminUnavailableMessage(): string {
  return "Serverová Firebase vrstva (firebase-admin) není v tomto Cloudflare runtime dostupná.";
}
