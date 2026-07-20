# ESPORTARENA TSV Bug List

Datum: 2026-04-19  
Testováno na: `https://esportarena-tsv.vrbajirivrba.workers.dev/`

## P0

### BUG-001: Všechny HTML routy vrací HTTP 500
- Priorita: P0
- Severity: Critical
- Modul: Platforma / Public / Captain / Admin
- Dopad: celý web běží ve stavu server-side chyby, i když se UI často vykreslí
- Reprodukce:
  1. Otevři `/`, `/prihlaseni`, `/registrace`, `/dashboard`, `/admin`, `/turnaje`
  2. Zkontroluj HTTP status
- Očekávané chování: `200 OK`
- Skutečné chování: všechny testované HTML routy vrací `500`
- Poznámka: UI je často použitelné, ale z technického hlediska je aplikace v error stavu
- Pravděpodobná oblast fixu: SSR / OpenNext / route rendering / error boundary

### BUG-002: Týmové dokumenty jsou veřejně dostupné přes přímé Storage URL i po deklarované době mazání
- Priorita: P0
- Severity: Critical
- Modul: Dokumenty / Security / GDPR
- Dopad: únik citlivých dokumentů hráčů
- Reprodukce:
  1. Otevři admin detail týmu
  2. Zkopíruj Storage URL dokumentu hráče
  3. Otevři ji anonymně mimo aplikaci
- Očekávané chování: dokument není dostupný bez oprávnění nebo už je smazaný
- Skutečné chování: část dokumentů byla dostupná anonymně s `200`
- Poznámka: UI zároveň tvrdí, že se mají mazat po 48 h
- Pravděpodobná oblast fixu: Storage token management / cleanup job / retention policy

## P1

### BUG-003: Uložení profilu sice funguje, ale notifikační e-mail se neodešle
- Priorita: P1
- Severity: High
- Modul: Profil kapitána / Notifikace
- Dopad: workflow po uložení profilu je nekompletní
- Reprodukce:
  1. Přihlas se jako nový test kapitán
  2. Vyplň profil a nahraj dokument
  3. Klikni `Uložit profil`
- Očekávané chování: profil se uloží a potvrzovací e-mail odejde, nebo se tato akce vůbec neslibuje
- Skutečné chování: UI ukáže hlášku o chybějící Resend konfiguraci
- Pravděpodobná oblast fixu: backend env / Resend integration / graceful fallback

### BUG-004: Login a registrace ukazují syrové Firebase chyby
- Priorita: P1
- Severity: High
- Modul: Auth
- Dopad: špatné UX, únik interních technických detailů
- Reprodukce:
  1. Na `/registrace` zadej existující e-mail
  2. Na `/prihlaseni` zadej špatné heslo nebo neexistující účet
- Očekávané chování: srozumitelná lokalizovaná hláška
- Skutečné chování:
  - `Firebase: Error (auth/email-already-in-use)`
  - `Firebase: Error (auth/invalid-credential)`
- Pravděpodobná oblast fixu: auth error mapping ve frontendu

### BUG-005: Chybí základní security headers na HTML odpovědích
- Priorita: P1
- Severity: High
- Modul: Security / Platforma
- Dopad: zbytečně slabý baseline hardening
- Reprodukce:
  1. Udělej `curl -I /`
  2. Zkontroluj response headers
- Očekávané chování: přítomné např. `Strict-Transport-Security`, `Content-Security-Policy`, `Referrer-Policy`, `X-Content-Type-Options`
- Skutečné chování: testované HTML odpovědi je nemají
- Pravděpodobná oblast fixu: edge middleware / worker response headers

## P2

### BUG-006: Admin formulář pro vytvoření turnaje má slabou validaci
- Priorita: P2
- Severity: Medium
- Modul: Admin / Turnaje
- Dopad: formulář působí hotově, ale nevede uživatele dobře při chybě
- Reprodukce:
  1. Otevři `/admin/turnaje`
  2. Klikni `Vytvořit turnaj` bez vyplnění polí
- Očekávané chování: invalid field state nebo jasná field-level validace
- Skutečné chování: jen obecná textová hláška `Vyplň název turnaje a hru`
- Pravděpodobná oblast fixu: client-side form validation

### BUG-007: Captain při vstupu na admin/CMS route nedostane jasný forbidden stav
- Priorita: P2
- Severity: Medium
- Modul: Role / UX
- Dopad: ochrana funguje, ale UX je matoucí
- Reprodukce:
  1. Přihlas se jako captain
  2. Otevři `/admin` nebo `/edit`
- Očekávané chování: `403` nebo stránka s vysvětlením
- Skutečné chování: redirect na homepage bez vysvětlení
- Pravděpodobná oblast fixu: route guard UX / forbidden page

### BUG-008: Veřejná oznámení obsahují interní technické poznámky
- Priorita: P2
- Severity: Medium
- Modul: Oznámení / CMS
- Dopad: veřejný obsah působí nehotově a leakují se interní workflow poznámky
- Reprodukce:
  1. Otevři `/oznameni`
  2. Přečti intro text
- Očekávané chování: čistě user-facing text
- Skutečné chování: text zmiňuje interní skripty a Firestore index
- Pravděpodobná oblast fixu: CMS content cleanup

### BUG-009: Homepage je zbytečně těžká kvůli Twitch/YouTube embedům
- Priorita: P2
- Severity: Medium
- Modul: Performance / Public web
- Dopad: zbytečné requesty, 429, console noise, vyšší blocking time
- Reprodukce:
  1. Otevři homepage na desktopu
  2. Sleduj network a console
- Očekávané chování: lehčí initial load bez request stormu
- Skutečné chování: heavy third-party load, autoplay warnings, `429`
- Pravděpodobná oblast fixu: lazy-load / deferred embeds / placeholder strategy

## P3

### BUG-010: Auth formuláře nemají loading/disabled stav při submitu
- Priorita: P3
- Severity: Low
- Modul: Auth / UX
- Dopad: uživatel může mít pocit, že kliknutí neproběhlo
- Reprodukce:
  1. Odeslat login nebo registraci
  2. Sleduj stav submit buttonu
- Očekávané chování: tlačítko se dočasně deaktivuje nebo zobrazí loading
- Skutečné chování: tlačítko zůstává aktivní
- Pravděpodobná oblast fixu: submit state handling

### BUG-011: Formuláře napříč aplikací často nemají `name` atributy
- Priorita: P3
- Severity: Low
- Modul: Form semantics / A11y / UX
- Dopad: slabší autofill, tooling a obecná robustnost formulářů
- Reprodukce:
  1. Otevři login, registraci, profil nebo týmový formulář
  2. Zkontroluj atributy inputů
- Očekávané chování: každý field má stabilní `name`
- Skutečné chování: většina inputů má `name: null`
- Pravděpodobná oblast fixu: shared form components

## Poznámky k test scope
- Destruktivní akce jako mazání týmu, mazání turnaje nebo approve/reject reálných týmů nebyly spuštěny.
- U reálného týmu nebyly ukládány změny do soupisky.
- Přihlášení reálného týmu do reálného turnaje nebylo provedeno, aby nevznikl produkční zásah.
