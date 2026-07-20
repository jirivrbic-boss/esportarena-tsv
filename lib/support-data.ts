export type SupportCategoryId =
  | "updates"
  | "popular"
  | "account"
  | "teams"
  | "technical"
  | "rules";

export type SupportCategory = {
  id: SupportCategoryId;
  label: string;
};

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: "updates", label: "Aktualizace" },
  { id: "popular", label: "Nejčastější dotazy" },
  { id: "account", label: "Účet a přihlášení" },
  { id: "teams", label: "Týmy a registrace" },
  { id: "technical", label: "Technické" },
  { id: "rules", label: "Pravidla a termíny" },
];

export type SupportArticle = {
  id: string;
  categoryId: SupportCategoryId;
  /** Štítek jako na referenční stránce (DUELS apod.) — u nás např. CS2, TÝM */
  tag?: string;
  title: string;
  body: string;
};

export const SUPPORT_ARTICLES: SupportArticle[] = [
  {
    id: "upd-1",
    categoryId: "updates",
    tag: "OBECNÉ",
    title: "Spuštění centra podpory",
    body:
      "Tato sekce slouží jako rychlý přehled častých otázek a novinek k webu studentského turnaje. Obsah budeme doplňovat podle zpětné vazby.",
  },
  {
    id: "pop-1",
    categoryId: "popular",
    tag: "OZNÁMENÍ",
    title: "Kde hledám novinky a termíny?",
    body:
      "Hlavní zdroj je sekce Oznámení na webu — každý příspěvek zveřejníme tady a stejný obsah pošleme i na Discord. Web slouží také k registraci, dokumentům a Centru podpory.",
  },
  {
    id: "pop-2",
    categoryId: "popular",
    tag: "CS2",
    title: "Proč potřebuji stejný nick na Faceitu jako ve formuláři?",
    body:
      "U Counter-Strike 2 se při registraci týmu zadává Faceit přezdívka — podle ní systém tahá ELO pro férové nasazení a odkazuje na kvalifikaci. Nick musí přesně odpovídat účtu na FACEIT.",
  },
  {
    id: "acc-1",
    categoryId: "account",
    tag: "ÚČET",
    title: "Zapomenuté heslo",
    body:
      "Na přihlášení klikni na „Zapomněl jsi heslo?“. Zadej e-mail, vyber účet a zvol Obnovit heslo (odkaz e-mailem) nebo Změna hesla (současné + nové heslo). Pokud e-mail s odkazem nedorazí, zkontroluj spam a že používáš stejnou adresu jako při registraci.",
  },
  {
    id: "acc-2",
    categoryId: "account",
    tag: "ÚČET",
    title: "Profil kapitána není kompletní",
    body:
      "Po přihlášení vyplň povinná pole v sekci profilu (jméno, kontakty, herní identity dle pravidel). Bez dokončeného profilu může být omezená registrace týmu — sleduj nápovědy přímo ve formuláři.",
  },
  {
    id: "team-1",
    categoryId: "teams",
    tag: "TÝM",
    title: "Jak probíhá schválení týmu?",
    body:
      "Po odeslání registrace má tým stav „čeká na schválení“. Administrátor tým zkontroluje a schválí nebo zamítne (u zamítnutí může být uveden důvod). Po schválení můžeš tým přihlásit do konkrétního turnaje v sekci Turnaje.",
  },
  {
    id: "team-2",
    categoryId: "teams",
    tag: "DOKUMENTY",
    title: "Nahrávání průkazu studenta a souhlasu",
    body:
      "Soubory se nahrávají do zabezpečeného úložiště. Formáty jsou typicky obrázek nebo PDF. Po určité době mohou být soubory automaticky smazány v souladu s ochranou osobních údajů — proto při opakované žádosti admina nahraj aktuální verzi.",
  },
  {
    id: "tech-1",
    categoryId: "technical",
    tag: "PROHLÍŽEČ",
    title: "Stránka se nenačítá nebo padá upload",
    body:
      "Zkus jiný prohlížeč (nejnověji Chrome nebo Firefox), vypni blokovače reklam pro tuto doménu a ověř připojení. U nahrávání souborů drž rozumnou velikost souboru a povolené typy (obrázek/PDF).",
  },
  {
    id: "rules-1",
    categoryId: "rules",
    tag: "PRAVIDLA",
    title: "Kde najdu kompletní pravidla soutěže?",
    body:
      "Kompletní pravidla jsou na stránce Pravidla na tomto webu a v oficiálních dokumentech ke stažení. Změny formátu, termíny a výjimky zveřejňujeme v Oznámeních.",
  },
];
