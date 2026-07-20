import { SUPPORT_ARTICLES } from "@/lib/support-data";
import type { SupportFaqRow } from "@/lib/support-firestore";

/** Základní články z kódu + položky z Firestore (adminem přidané). */
export function mergeSupportArticles(extras: SupportFaqRow[]): SupportFaqRow[] {
  const sortedExtras = [...extras].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );
  return [...SUPPORT_ARTICLES, ...sortedExtras];
}
