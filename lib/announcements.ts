export const ANNOUNCEMENT_CATEGORIES = [
  "cs2",
  "lol",
  "brawl_stars",
  "fc26",
  "general",
] as const;

export type AnnouncementCategory = (typeof ANNOUNCEMENT_CATEGORIES)[number];

export const ANNOUNCEMENT_CATEGORY_LABEL: Record<AnnouncementCategory, string> = {
  cs2: "Counter Strike 2",
  lol: "League of Legends",
  brawl_stars: "Brawl Stars",
  fc26: "EA SPORTS FC 26",
  general: "Obecné",
};

export type AnnouncementDocument = {
  title: string;
  content: string;
  highlightedContent?: string;
  imageUrl: string | null;
  authorName: string;
  category: AnnouncementCategory;
  source?: string;
  createdAt:
    | { toMillis?: () => number; toDate?: () => Date; seconds?: number }
    | Date
    | string
    | number
    | null
    | undefined;
};

export function parseAnnouncementCategory(input: unknown): AnnouncementCategory {
  const value = String(input ?? "").trim() as AnnouncementCategory;
  return ANNOUNCEMENT_CATEGORIES.includes(value) ? value : "general";
}

/** Firestore Timestamp, ISO string (REST admin) nebo Date/number → ms. */
export function announcementCreatedAtMs(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof value === "object") {
    const ts = value as {
      toMillis?: () => number;
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    };
    if (typeof ts.toMillis === "function") {
      try {
        const ms = ts.toMillis();
        return Number.isFinite(ms) ? ms : 0;
      } catch {
        /* fall through */
      }
    }
    if (typeof ts.toDate === "function") {
      try {
        const ms = ts.toDate().getTime();
        return Number.isFinite(ms) ? ms : 0;
      } catch {
        /* fall through */
      }
    }
    const seconds = ts.seconds ?? ts._seconds;
    if (typeof seconds === "number" && Number.isFinite(seconds)) {
      return seconds * 1000;
    }
  }
  return 0;
}

export function formatAnnouncementDate(ms: number): string {
  if (!ms) return "";
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "long",
  }).format(new Date(ms));
}

const IMPORTANT_PATTERNS: RegExp[] = [
  /\b(registrace|přihlášky|deadline|uzávěrka|finále|play[- ]?off|kvalifikace)\b/gi,
  /\b(\d{1,2}\.\s?\d{1,2}\.\s?\d{2,4}|\d{1,2}:\d{2})\b/g,
  /\b(CS2|Counter[- ]?Strike|League of Legends|LoL|Brawl Stars|EA SPORTS FC ?26|Faceit)\b/gi,
];

export function autoHighlightImportantText(input: string): string {
  let out = input;
  for (const pattern of IMPORTANT_PATTERNS) {
    out = out.replace(pattern, (m) => `**${m}**`);
  }
  return out;
}

/** Odstraní značky tučného / kurzívy / odkazů pro výpis v seznamu. */
export function stripAnnouncementMarkup(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1");
}

export function toAnnouncementExcerpt(content: string, maxLen = 180): string {
  const oneLine = stripAnnouncementMarkup(content).replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen).trimEnd()}…`;
}
