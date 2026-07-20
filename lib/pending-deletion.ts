import type { Timestamp } from "firebase/firestore";
import type { CaptainProfile } from "@/lib/types";

/** Datum konce odkladu smazání nebo null. */
export function getPendingDeletionDeadline(
  profile: CaptainProfile | null
): Date | null {
  const raw = profile?.pendingDeletionExpiresAt;
  if (!raw) return null;
  if (
    typeof raw === "object" &&
    raw !== null &&
    "toDate" in raw &&
    typeof (raw as Timestamp).toDate === "function"
  ) {
    return (raw as Timestamp).toDate();
  }
  return null;
}

/** Je aktivní naplánované smazání a lhůta ještě neuplynula? */
export function isDeletionGracePeriodActive(profile: CaptainProfile | null): boolean {
  const d = getPendingDeletionDeadline(profile);
  if (!d) return false;
  return d.getTime() > Date.now();
}
