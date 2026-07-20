import type { AnnouncementCategory } from "@/lib/announcements";
import { listCollectionDocsRest } from "@/lib/firebase/firestore-rest-admin";

function normalizeEmail(raw: unknown): string | null {
  const email = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!email || !email.includes("@") || email.length > 254) return null;
  return email;
}

/**
 * E-maily kapitánů podle registrovaných týmů:
 * - general → všichni kapitáni s týmem (kromě zamítnutých)
 * - cs2/lol/… → kapitáni týmů dané hry
 */
export async function resolveAnnouncementRecipientEmails(
  category: AnnouncementCategory
): Promise<string[]> {
  const teams = await listCollectionDocsRest("teams", 1000);
  const emails = new Set<string>();

  for (const team of teams) {
    if (String(team.status ?? "") === "rejected") continue;
    const email = normalizeEmail(team.captainEmail);
    if (!email) continue;

    const gameId = String(team.gameId ?? "cs2").trim() || "cs2";
    if (category === "general" || gameId === category) {
      emails.add(email);
    }
  }

  return [...emails].sort();
}
