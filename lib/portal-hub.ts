export type PortalHubItem = {
  href: string;
  label: string;
  description: string;
  icon: string;
};

export type PortalNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  matchPrefix?: string;
};

export const ADMIN_HUB_SECTIONS: PortalHubItem[] = [
  {
    href: "/admin/sezony",
    label: "Sezóny",
    description: "Zápis do sezóny, kvalifikace, pavouk a seed S4.",
    icon: "📅",
  },
  {
    href: "/admin/turnaje",
    label: "Správa turnajů",
    description: "Vytváření, úprava a publikace turnajů podle her.",
    icon: "🏆",
  },
  {
    href: "/admin/tymy",
    label: "Všechny týmy",
    description: "Přehled všech týmů, stav, zprávy a detail soupisky.",
    icon: "👥",
  },
  {
    href: "/admin/kapitani",
    label: "Správa kapitánů",
    description: "Profily kapitánů, e-mail, heslo a propojené týmy.",
    icon: "🎖️",
  },
  {
    href: "/admin/podpora",
    label: "Centrum podpory",
    description: "Tickety a FAQ pro veřejnou stránku podpory.",
    icon: "💬",
  },
  {
    href: "/admin/hledam",
    label: "Hledám tým / hráče",
    description: "Správa inzerátů looking for team/player na nástěnce.",
    icon: "🔎",
  },
  {
    href: "/admin/oznameni",
    label: "Oznámení",
    description: "Publikace novinek na web i Discord.",
    icon: "📢",
  },
  {
    href: "/admin/cekajici-tymy",
    label: "Čekající týmy",
    description: "Schvalování a zamítání nových registrací týmů.",
    icon: "⏳",
  },
  {
    href: "/admin/edit",
    label: "Úpravy stránek",
    description: "CMS texty úvodní stránky, pravidel a oznámení.",
    icon: "✏️",
  },
];

export const CAPTAIN_HUB_SECTIONS: PortalHubItem[] = [
  {
    href: "/dashboard/tymy",
    label: "Týmy",
    description: "Tvoje týmy podle her a registrace nového týmu.",
    icon: "👥",
  },
  {
    href: "/dashboard/turnaje",
    label: "Turnaje",
    description: "Přehled turnajů a přihlášení schváleným týmem.",
    icon: "🏆",
  },
  {
    href: "/dashboard/oznameni",
    label: "Oznámení",
    description: "Novinky od pořadatelů turnaje.",
    icon: "📢",
  },
  {
    href: "/dashboard/pravidla",
    label: "Pravidla · hry",
    description: "Pravidla pro CS2 a League of Legends (Sezóna 4).",
    icon: "📋",
  },
  {
    href: "/dashboard/hledam",
    label: "Hledám tým / hráče",
    description: "Nástěnka inzerátů podle hry.",
    icon: "🔎",
  },
  {
    href: "/dashboard/profil",
    label: "Profil kapitána",
    description: "Kontakty, doklady a nastavení účtu.",
    icon: "🪪",
  },
];

export const CMS_EDIT_PAGES: PortalHubItem[] = [
  {
    href: "/edit",
    label: "Úvodní stránka",
    description: "Hero text, podnadpisy a karty v sekci O turnaji.",
    icon: "🏠",
  },
  {
    href: "/pravidla/edit",
    label: "Pravidla CS2",
    description: "Text pravidel pro Counter-Strike 2 (legacy CMS).",
    icon: "🎯",
  },
  {
    href: "/oznameni/edit",
    label: "Text stránky Oznámení",
    description: "Úvodní odstavec nad seznamem oznámení.",
    icon: "📰",
  },
];

export const ADMIN_SIDEBAR_NAV: PortalNavItem[] = [
  { href: "/admin", label: "Přehled", exact: true },
  { href: "/admin/sezony", label: "Sezóny" },
  { href: "/admin/turnaje", label: "Správa turnajů" },
  { href: "/admin/tymy", label: "Všechny týmy" },
  { href: "/admin/kapitani", label: "Správa kapitánů" },
  { href: "/admin/podpora", label: "Centrum podpory" },
  { href: "/admin/hledam", label: "Hledám tým / hráče" },
  { href: "/admin/oznameni", label: "Oznámení" },
  { href: "/admin/cekajici-tymy", label: "Čekající týmy" },
  { href: "/admin/edit", label: "Úpravy stránek" },
];

export const CAPTAIN_SIDEBAR_NAV: PortalNavItem[] = [
  { href: "/dashboard", label: "Přehled", exact: true },
  { href: "/sezona-4", label: "Sezóna 4" },
  { href: "/dashboard/tymy", label: "Týmy", matchPrefix: "/dashboard/tym" },
  { href: "/dashboard/turnaje", label: "Turnaje" },
  { href: "/dashboard/oznameni", label: "Oznámení" },
  { href: "/dashboard/pravidla", label: "Pravidla · hry" },
  { href: "/dashboard/hledam", label: "Hledám tým / hráče" },
  { href: "/dashboard/profil", label: "Profil kapitána" },
];

export const PUBLIC_SIDEBAR_NAV: PortalNavItem[] = [
  { href: "/", label: "Domů", exact: true },
  { href: "/sezona-4", label: "Sezóna 4" },
  { href: "/hry", label: "Hry" },
  { href: "/turnaje", label: "Turnaje" },
  { href: "/oznameni", label: "Oznámení" },
  { href: "/pravidla", label: "Pravidla" },
  { href: "/dokumenty", label: "Dokumenty" },
  { href: "/hledam", label: "Hledám tým" },
  { href: "/tym/registrace", label: "Registrace týmu" },
  { href: "/o-nas", label: "O nás" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/podpora", label: "Centrum podpory" },
];

export function sidebarNavForPath(pathname: string): {
  items: PortalNavItem[];
  brandHref: string;
  brandTitle: string;
  brandSubtitle: string;
} {
  if (pathname.startsWith("/admin")) {
    return {
      items: ADMIN_SIDEBAR_NAV,
      brandHref: "/admin",
      brandTitle: "ADMIN",
      brandSubtitle: "Portál · S4",
    };
  }
  if (pathname.startsWith("/dashboard")) {
    return {
      items: CAPTAIN_SIDEBAR_NAV,
      brandHref: "/dashboard",
      brandTitle: "KAPITÁN",
      brandSubtitle: "Portál",
    };
  }
  return {
    items: PUBLIC_SIDEBAR_NAV,
    brandHref: "/",
    brandTitle: "ESPORTARENA",
    brandSubtitle: "TSV · S4",
  };
}
