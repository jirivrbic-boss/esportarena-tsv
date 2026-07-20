import { createHash, randomBytes } from "crypto";

/** Token do e-mailu: `uid.náhodný_hex` — UID z Firebase neobsahuje `.` */
export function createRecoveryToken(uid: string): string {
  const secret = randomBytes(24).toString("hex");
  return `${uid}.${secret}`;
}

export function hashRecoveryToken(fullToken: string): string {
  return createHash("sha256").update(fullToken, "utf8").digest("hex");
}

/** Vrátí UID z platného formátu tokenu nebo null. */
export function parseUidFromRecoveryToken(fullToken: string): string | null {
  const i = fullToken.indexOf(".");
  if (i <= 0) return null;
  const uid = fullToken.slice(0, i);
  return uid.length > 0 ? uid : null;
}
