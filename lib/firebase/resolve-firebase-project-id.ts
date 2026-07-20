import { tryReadFirebaseServiceAccountFromEnv } from "@/lib/firebase/service-account";

/**
 * Firebase project ID pro ověření ID tokenu na serveru.
 * Na Netlify může být NEXT_PUBLIC_FIREBASE_PROJECT_ID prázdný v čase buildu (inlining),
 * zatímco runtime env nebo service account už je k dispozici — proto více zdrojů.
 */
export function resolveFirebaseProjectIdForServer(): string | undefined {
  const fromSa = (): string | undefined => {
    const sa = tryReadFirebaseServiceAccountFromEnv();
    return sa?.project_id?.trim() || undefined;
  };

  return (
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ||
    fromSa()
  );
}
