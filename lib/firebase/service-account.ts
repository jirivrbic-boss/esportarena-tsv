import { existsSync, readFileSync } from "fs";
import { isAbsolute, resolve } from "path";

export type FirebaseServiceAccount = {
  type?: string;
  project_id?: string;
  private_key_id?: string;
  private_key: string;
  client_email: string;
  client_id?: string;
  auth_uri?: string;
  token_uri?: string;
  auth_provider_x509_cert_url?: string;
  client_x509_cert_url?: string;
  universe_domain?: string;
};

function normalizePrivateKey(key: string): string {
  let pk = key.trim();
  // dotenv / hosting often leave literal \n in the PEM
  if (pk.includes("\\n") && !pk.includes("\n")) {
    pk = pk.replace(/\\n/g, "\n");
  }
  return pk;
}

function parseServiceAccountObject(parsed: unknown): FirebaseServiceAccount {
  if (!parsed || typeof parsed !== "object") {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON není validní JSON objekt.");
  }
  const sa = parsed as Partial<FirebaseServiceAccount>;
  if (!sa.client_email || !sa.private_key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON nemá client_email/private_key.");
  }
  return {
    ...sa,
    client_email: sa.client_email,
    private_key: normalizePrivateKey(sa.private_key),
    project_id: sa.project_id,
    token_uri: sa.token_uri || "https://oauth2.googleapis.com/token",
  };
}

const DEFAULT_LOCAL_SA_FILE = ".firebase-service-account.json";

function loadServiceAccountFromFile(rawPath: string): FirebaseServiceAccount {
  const filePath = isAbsolute(rawPath) ? rawPath : resolve(process.cwd(), rawPath);
  if (!existsSync(filePath)) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_JSON ukazuje na soubor, který neexistuje: ${rawPath}`
    );
  }
  try {
    const fileRaw = readFileSync(filePath, "utf8");
    return parseServiceAccountObject(JSON.parse(fileRaw));
  } catch (e) {
    if (e instanceof Error && e.message.includes("client_email")) throw e;
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_JSON soubor nejde načíst jako JSON (${rawPath}).`
    );
  }
}

/**
 * Načte service account z env:
 * - cesta k .json souboru (doporučeno pro local: `.firebase-service-account.json`)
 * - nebo celý JSON (jeden řádek, ideálně v jednoduchých uvozovkách)
 */
export function readFirebaseServiceAccountFromEnv(
  envValue = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
): FirebaseServiceAccount {
  const raw = envValue?.trim();
  if (!raw) {
    const fallback = resolve(process.cwd(), DEFAULT_LOCAL_SA_FILE);
    if (existsSync(fallback)) {
      return loadServiceAccountFromFile(DEFAULT_LOCAL_SA_FILE);
    }
    throw new Error("Chybí FIREBASE_SERVICE_ACCOUNT_JSON.");
  }

  const looksLikePath =
    raw.endsWith(".json") ||
    raw.startsWith("./") ||
    raw.startsWith("../") ||
    raw.startsWith("/") ||
    (!raw.startsWith("{") && !raw.startsWith("'") && !raw.startsWith('"'));

  if (looksLikePath && !raw.startsWith("{")) {
    return loadServiceAccountFromFile(raw);
  }

  let jsonText = raw;
  if (
    (jsonText.startsWith("'") && jsonText.endsWith("'")) ||
    (jsonText.startsWith('"') && jsonText.endsWith('"'))
  ) {
    jsonText = jsonText.slice(1, -1);
  }

  try {
    return parseServiceAccountObject(JSON.parse(jsonText));
  } catch (e) {
    if (e instanceof Error && e.message.includes("client_email")) throw e;
    // dotenv často „rozbije“ nequotovaný JSON — fallback na lokální soubor
    const fallback = resolve(process.cwd(), DEFAULT_LOCAL_SA_FILE);
    if (existsSync(fallback)) {
      return loadServiceAccountFromFile(DEFAULT_LOCAL_SA_FILE);
    }
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON není validní JSON. Pro local dej cestu k souboru (.firebase-service-account.json) nebo JSON v jednoduchých uvozovkách."
    );
  }
}

export function tryReadFirebaseServiceAccountFromEnv(): FirebaseServiceAccount | null {
  try {
    return readFirebaseServiceAccountFromEnv();
  } catch {
    return null;
  }
}
