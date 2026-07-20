# Audit Report: ESPORTARENA TSV

Datum auditu: 2026-04-19  
Cílová URL: `https://esportarena-tsv.vrbajirivrba.workers.dev/`

## Executive Summary

ESPORTARENA TSV působí jako skutečná organizační platforma pro studentský esport turnaj a většina klíčových workflow v UI existuje: registrace kapitána, přihlášení, kapitánský portál, týmová sekce, turnaje, admin dashboard a CMS editace.

Zároveň ale aplikace není ve stavu, kdy by šlo říct, že je produkčně bez zásadních problémů. Největší zjištění jsou:

- všechny testované HTML routy vrací HTTP `500`, i když se UI ve většině případů vykreslí
- citlivé týmové dokumenty byly v části případů stále přístupné přes přímé Storage URL i po deklarované době mazání
- login a registrace zobrazují syrové Firebase chyby
- homepage je zbytečně zatížená třetími stranami a generuje chybový noise
- chybí základní security headers na HTML odpovědích

Celkové hodnocení: **5/10**

## Co Funguje

- role `kapitán` a `admin` jsou funkčně oddělené
- registrace nového kapitána funguje
- login, logout, refresh session a otevření nového tabu fungují
- onboarding guard u nového kapitána funguje: bez dokončeného profilu nelze pokračovat do registrace týmu
- captain flow `profil -> tým -> turnaj` je v aplikaci skutečně přítomný
- captain bez schváleného týmu se nemůže přihlásit do turnaje
- Firestore access control není pouze frontendová: cizí uživatelská data a široké dotazy nad kolekcemi byly serverově blokované

## Co Je Rozbité Nebo Rizikové

### 1. HTML stránky vrací 500

Všechny testované hlavní stránky vracely HTTP `500`, včetně:

- homepage
- login
- registrace
- veřejné turnaje
- kapitánský dashboard
- admin dashboard

UI se často přesto vykreslí, ale z pohledu platformy je to kritický problém. Má dopad na:

- spolehlivost
- monitoring
- SEO/indexaci
- cachování
- důvěryhodnost produkce

### 2. Citlivé dokumenty nejsou bezpečně řízené

Admin detail týmu zobrazuje přímé odkazy na dokumenty hráčů. Během auditu bylo potvrzeno, že část těchto souborů byla přístupná anonymně přes tokenizované Storage URL i po době, kdy už měly být podle UI automaticky smazané.

To je závažný problém z pohledu:

- GDPR
- práce s osobními dokumenty
- data retention
- bezpečnosti dočasných podkladů

### 3. Syrové Firebase chyby v UI

Při duplicate registraci a neúspěšném loginu aplikace zobrazovala syrové chyby typu:

- `auth/email-already-in-use`
- `auth/invalid-credential`

To je slabé jak z UX, tak z bezpečnostního hlediska.

### 4. Homepage je zbytečně těžká

Homepage stahuje těžké Twitch/YouTube embedy, které:

- zvyšují počet requestů
- generují `429`
- produkují warnings/errors v console
- zvyšují blocking time

### 5. Chybí security headers

Na HTML odpovědích chyběly běžné ochranné hlavičky, například:

- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Frame-Options`
- `Referrer-Policy`
- `X-Content-Type-Options`

## Funkčnost A Flow Hodnocení

### Kapitánská část

Stav: **funkčně existuje, ale ne bez výhrad**

Pozitiva:
- flow je logický
- nový účet po registraci spadne do dashboardu
- nedokončený profil správně blokuje založení týmu
- týmová a turnajová navigace je srozumitelná

Výhrady:
- chybové hlášky nejsou user-friendly
- některé formuláře spoléhají hlavně na browser-native validaci
- mobilní navigace je použitelná, ale dost hustá

### Admin část

Stav: **funkčně existuje, ale je potřeba stabilizace**

Pozitiva:
- admin dashboard, týmy, turnaje a CMS routy jsou přístupné a dávají smysl
- admin má provozní přehled nad turnajem a obsahovou správou

Výhrady:
- i admin sekce vrací `500`
- captain při vstupu na admin route nedostane jasný forbidden stav, jen redirect
- admin detail týmů pracuje s citlivými dokumentovými odkazy rizikovým způsobem

## Performance Shrnutí

### Veřejná část

- homepage desktop:
  - TTFB cca `48 ms`
  - FCP cca `1632 ms`
  - LCP cca `2392 ms`
  - vysoký long-task součet kvůli third-party embedům

- homepage mobile:
  - FCP cca `296 ms`
  - LCP cca `900 ms`

### Interní části

- kapitánský dashboard:
  - FCP cca `208 ms`
  - LCP cca `744 ms`

- admin dashboard:
  - FCP cca `128 ms`
  - LCP cca `964 ms`

Hlavní bottleneck není samotný dashboard, ale homepage a obecná nestabilita HTML response vrstvy.

## Security Shrnutí

### Potvrzené problémy

- dlouho platné přímé URL na týmové dokumenty
- nedodržené 48h cleanup tvrzení u dočasných dokumentů
- chybějící security headers
- syrové interní auth chyby v UI

### Co naopak vyšlo dobře

- nepřihlášený uživatel je přesměrován na login
- backend blokoval cizí Firestore data pro captain účty
- route access není čistě frontendový

## UX / UI Shrnutí

UI působí konzistentně a tematicky uceleně. Struktura aplikace odpovídá deklarovanému účelu. Nejslabší část není vizuální styl, ale:

- technická stabilita
- kvalita error handlingu
- ochrana citlivých dokumentů
- čistota veřejného copy

## Prioritní Fix Plan

### Opravit ihned

- odstranit globální `500` na HTML routách
- opravit retention/cleanup dokumentů a revokaci download tokenů
- nahradit syrové Firebase chyby vlastním copy
- doplnit security headers

### Opravit před ostrým používáním

- omezit homepage embedy a third-party noise
- odstranit interní technické poznámky z veřejných oznámení
- zavést jasný forbidden stav pro role bez oprávnění

### Zlepšit později

- zlepšit mobile navigaci
- doplnit lepší form semantics a validace
- zkontrolovat anti-spam ochranu veřejných formulářů

## Přílohy

V balíčku jsou přiloženy jen bezpečné screenshoty bez osobních údajů:

- `evidence/homepage_desktop.png`
- `evidence/admin_dashboard.png`
- `evidence/public_announcements.png`
