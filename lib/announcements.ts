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
  createdAt: { toMillis?: () => number; toDate?: () => Date } | Date;
};

export function parseAnnouncementCategory(input: unknown): AnnouncementCategory {
  const value = String(input ?? "").trim() as AnnouncementCategory;
  return ANNOUNCEMENT_CATEGORIES.includes(value) ? value : "general";
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

export function toAnnouncementExcerpt(content: string, maxLen = 180): string {
  const oneLine = content.replace(/\s+/g, " ").trim();
  if (oneLine.length <= maxLen) return oneLine;
  return `${oneLine.slice(0, maxLen).trimEnd()}…`;
}
