import { SignJWT, importPKCS8 } from "jose";
import { resolveFirebaseProjectIdForServer } from "@/lib/firebase/resolve-firebase-project-id";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
  project_id?: string;
};

type FirestoreValue =
  | { stringValue: string }
  | { booleanValue: boolean }
  | { timestampValue: string }
  | { nullValue: null };

type FirestoreDoc = {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
};

let cachedToken: { value: string; expiresAtMs: number } | null = null;

function readServiceAccount(): ServiceAccount {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) {
    throw new Error("Chybí FIREBASE_SERVICE_ACCOUNT_JSON.");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON není validní JSON.");
  }
  const sa = parsed as Partial<ServiceAccount>;
  if (!sa.client_email || !sa.private_key) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON nemá client_email/private_key.");
  }
  return {
    client_email: sa.client_email,
    private_key: sa.private_key,
    token_uri: sa.token_uri || "https://oauth2.googleapis.com/token",
    project_id: sa.project_id,
  };
}

async function getGoogleAccessToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAtMs - 60_000 > now) {
    return cachedToken.value;
  }

  const sa = readServiceAccount();
  const privateKey = await importPKCS8(sa.private_key, "RS256");
  const iat = Math.floor(now / 1000);
  const exp = iat + 3600;

  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/datastore",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience(sa.token_uri!)
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(privateKey);

  const tokenRes = await fetch(sa.token_uri!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!tokenRes.ok) {
    const t = await tokenRes.text().catch(() => "");
    throw new Error(`OAuth token request failed (${tokenRes.status}): ${t.slice(0, 300)}`);
  }
  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!tokenJson.access_token) {
    throw new Error("OAuth token response neobsahuje access_token.");
  }
  cachedToken = {
    value: tokenJson.access_token,
    expiresAtMs: now + (tokenJson.expires_in ?? 3600) * 1000,
  };
  return tokenJson.access_token;
}

function firestoreBaseUrl(): string {
  const sa = readServiceAccount();
  const projectId = resolveFirebaseProjectIdForServer() || sa.project_id;
  if (!projectId) {
    throw new Error("Nelze určit Firebase project ID.");
  }
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function parseDocId(fullName: string): string {
  const parts = fullName.split("/");
  return parts[parts.length - 1] ?? "";
}

function getString(fields: Record<string, FirestoreValue> | undefined, key: string): string {
  const value = fields?.[key];
  if (!value || !("stringValue" in value)) return "";
  return value.stringValue;
}

function getBool(fields: Record<string, FirestoreValue> | undefined, key: string): boolean {
  const value = fields?.[key];
  if (!value || !("booleanValue" in value)) return false;
  return value.booleanValue;
}

function getTimestampMs(fields: Record<string, FirestoreValue> | undefined, key: string): number | null {
  const value = fields?.[key];
  if (!value || !("timestampValue" in value)) return null;
  const ms = Date.parse(value.timestampValue);
  return Number.isFinite(ms) ? ms : null;
}

export type RestTournamentRow = {
  id: string;
  name: string;
  gameId: string;
  backgroundImageUrl: string;
  startsAtMs: number | null;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
  published: boolean;
  createdAtMs: number | null;
  updatedAtMs: number | null;
};

function mapTournamentDoc(doc: FirestoreDoc): RestTournamentRow {
  const f = doc.fields;
  return {
    id: parseDocId(doc.name),
    name: getString(f, "name"),
    gameId: getString(f, "gameId") || "cs2",
    backgroundImageUrl: getString(f, "backgroundImageUrl"),
    startsAtMs: getTimestampMs(f, "startsAt"),
    prizePoolText: getString(f, "prizePoolText"),
    rulesText: getString(f, "rulesText"),
    faceitUrl: getString(f, "faceitUrl"),
    published: getBool(f, "published"),
    createdAtMs: getTimestampMs(f, "createdAt"),
    updatedAtMs: getTimestampMs(f, "updatedAt"),
  };
}

function authHeader(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function listTournamentsAdminRest(): Promise<RestTournamentRow[]> {
  const token = await getGoogleAccessToken();
  const res = await fetch(`${firestoreBaseUrl()}/tournaments?pageSize=200`, {
    headers: authHeader(token),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Firestore list failed (${res.status}): ${t.slice(0, 300)}`);
  }
  const data = (await res.json()) as { documents?: FirestoreDoc[] };
  return (data.documents ?? [])
    .map(mapTournamentDoc)
    .sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
}

export async function listPublishedTournamentsRest(): Promise<RestTournamentRow[]> {
  const all = await listTournamentsAdminRest();
  return all.filter((t) => t.published).slice(0, 100);
}

export async function createTournamentRest(input: {
  name: string;
  gameId: string;
  backgroundImageUrl: string;
  startsAt: string;
  prizePoolText: string;
  rulesText: string;
  faceitUrl: string;
  published: boolean;
}): Promise<{ id: string }> {
  const token = await getGoogleAccessToken();
  const body = {
    fields: {
      name: { stringValue: input.name },
      gameId: { stringValue: input.gameId },
      backgroundImageUrl: { stringValue: input.backgroundImageUrl },
      startsAt: input.startsAt
        ? { timestampValue: new Date(input.startsAt).toISOString() }
        : { nullValue: null },
      prizePoolText: { stringValue: input.prizePoolText },
      rulesText: { stringValue: input.rulesText },
      faceitUrl: { stringValue: input.faceitUrl },
      published: { booleanValue: input.published },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() },
    },
  };
  const res = await fetch(`${firestoreBaseUrl()}/tournaments`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Firestore create failed (${res.status}): ${t.slice(0, 300)}`);
  }
  const doc = (await res.json()) as FirestoreDoc;
  return { id: parseDocId(doc.name) };
}
