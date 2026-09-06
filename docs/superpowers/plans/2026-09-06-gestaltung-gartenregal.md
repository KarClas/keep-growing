# Gestaltung „Gartenregal" — Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die ganze App bekommt die in `docs/superpowers/specs/2026-09-06-gestaltung-gartenregal-design.md` beschriebene Gestaltung — ein Bausatz aus kanonischen Knöpfen, Feldern und Karten, klare Hierarchie je Seite, ehrliche Bedienzustände — ohne Änderungen an Daten, Berechnungen oder Abläufen.

**Architecture:** Farben/Schrift/Schatten werden einmal als Tailwind-v4-Tokens in `app/globals.css` (`@theme`) definiert; Schriften kommen über `next/font/google` als CSS-Variablen. Ein kleiner Bausatz in `components/bausatz/` (Knopf, Feld, Karte, Regal, Kästchen …) ersetzt die verstreuten Klassenketten; Seiten setzen nur zusammen. Reine Textlogik für Fälligkeiten (`lib/garten/faelligkeit.ts`) ist testbar ohne Datenbank.

**Tech Stack:** Next.js 16 (App Router, Server Actions), React 19 (`useFormStatus`), Tailwind CSS 4 (`@theme`), `next/font/google` (Fraunces, Figtree), Node-Test-Runner (`npm test`).

**Sprache:** Alles Deutsch — Bezeichner, Kommentare, Commits.

**Vorbedingung:** Worktree `serialized-painting-marshmallow`, Zweig `worktree-serialized-painting-marshmallow`, Dev-Server läuft mit `npm run dev -- -p 3010` (Port 3000 gehört dem Hauptordner). `daten/lokal.db` ist eine Kopie von Annes Garten — darf verändert werden.

**Vor jedem Commit:** `npx tsc --noEmit && npm run lint && npm test`. `npm run build` mindestens am Ende (Task 13).

---

## Dateistruktur

| Datei | Verantwortung |
|---|---|
| `app/globals.css` | Design-Tokens (`@theme`), Papierhintergrund, Fokusring, Bewegung |
| `app/layout.tsx` | Schriften laden, Body-Klassen, Abstand für die untere Leiste |
| `lib/garten/faelligkeit.ts` (+ `.test.ts`) | Reine Texte/Gruppen für Fälligkeit, letzte Pflege, Hinweis-Pille, Ermutigung |
| `lib/db/abfragen.ts` | **eine** neue Leseabfrage `zuletztGepflegtAm` |
| `components/bausatz/knopfStil.ts` | Klassen für alle Knopf-Varianten (ohne `'use client'`, damit Server und Client sie teilen) |
| `components/bausatz/Knopf.tsx` | `Knopf`, `PflegeKnopf`, `Spinner` (Client: wartend über `useFormStatus`) |
| `components/bausatz/KnopfLink.tsx` | Link im Knopf-Gewand (`KnopfLink`, `PflegeKnopfLink`) |
| `components/bausatz/Kaestchen.tsx` | Abhak-Kästchen als Absende-Knopf (Client, wartend) |
| `components/bausatz/Feld.tsx` | `Feld`, `Eingabe`, `Textbereich`, `Auswahl` |
| `components/bausatz/Umschalter.tsx` | zweiteiliger Schalter (Radio, reines CSS) |
| `components/bausatz/Karte.tsx` | `Karte`, `Fehlerkasten`, `Leerzustand` |
| `components/bausatz/Titel.tsx` | `Seitentitel`, `Abschnittstitel`, `ZurueckChip` |
| `components/bausatz/Regal.tsx` | `Regalbrett`, `Regal` (dreierweise auf Brettern) |
| `components/UntereNavigation.tsx` | schwebende Pille „Home · Aufgaben · Neu" |
| `components/VerstorbenMarkieren.tsx` | Zwei-Schritt-Rückfrage (Client) |
| `components/TopfMitGesicht.tsx` | nur: `STIMMUNG_BESCHREIBUNG` exportieren |
| `app/page.tsx`, `app/pflanze/[id]/page.tsx`, `app/aufgaben/page.tsx`, `app/pflanze/[id]/ernte/page.tsx`, `app/pflanze/neu/page.tsx`, `app/start/page.tsx`, `app/hinzufuegen/page.tsx`, `app/error.tsx` | Seiten setzen Bausteine zusammen |
| `components/KameraHinzufuegen.tsx`, `components/ProfilSchritt2Form.tsx` | Max' Komponenten: **nur Klassen/Bausteine tauschen**, keine Logikänderung |

---

### Task 1: Fundament — Tokens, Schriften, Hintergrund, Fokus, Bewegung

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: `app/globals.css` vollständig ersetzen**

```css
@import 'tailwindcss';

/*
 * Design-Tokens der Gestaltung „Gartenregal" (docs/superpowers/specs/
 * 2026-09-06-gestaltung-gartenregal-design.md, Abschnitt 6). Jede Farbe gibt
 * es genau hier — Seiten benutzen nur die Namen (bg-papier, text-moos …).
 */
@theme {
  --color-papier: #f5eddc;
  --color-papier-hell: #fffdf7;
  --color-kante: #e4d9c2;
  --color-kante-dunkel: #cbb994;
  --color-tinte: #2f2a22;
  --color-tinte-gedaempft: #6b5e45;
  --color-moos: #3f6b3a;
  --color-moos-hell: #7a9a6c;
  --color-moos-dunkel: #2f5230;
  --color-moos-zart: #e9f2e3;
  --color-terrakotta: #c97b52;
  --color-holz-hell: #c9a074;
  --color-holz-dunkel: #a97b4e;
  --color-wasser: #bfe3f7;
  --color-wasser-kraeftig: #8fcdf0;
  --color-mint: #cdeccb;
  --color-mint-kraeftig: #a6dba3;
  --color-sonne: #ffe58a;
  --color-sonne-kraeftig: #ffd54f;
  --color-gefahr: #b3402e;
  --color-gefahr-zart: #f9e6e1;

  --font-anzeige: var(--font-fraunces), Georgia, 'Times New Roman', serif;
  --font-text: var(--font-figtree), system-ui, sans-serif;

  --shadow-karte: 0 2px 0 #e9dfc9;
  --shadow-schweben: 0 8px 24px rgba(90, 60, 30, 0.16), 0 1px 0 #e9dfc9;
  --shadow-brett: 0 6px 10px rgba(90, 60, 30, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

:root {
  /* Bewusst nur helles Thema — „Gartenregal" ist ein Papier-Thema (Spec, Abschnitt 5). */
  color-scheme: light;
}

html,
body {
  overscroll-behavior-x: none;
}

body {
  /* Warmes Papier mit feiner Linienstruktur und hellem Schein oben. */
  background:
    radial-gradient(120% 40% at 50% -5%, #fff8ea 0%, rgba(255, 248, 234, 0) 60%),
    repeating-linear-gradient(0deg, rgba(120, 90, 50, 0.035) 0 1px, transparent 1px 3px),
    var(--color-papier);
  color: var(--color-tinte);
  font-family: var(--font-text);
}

/* Tastatur-Fokus ist überall sichtbar (Spec, Abschnitt 5). */
:focus-visible {
  outline: 2px solid var(--color-moos);
  outline-offset: 2px;
}

/* Wachsende Pflanzenteile blenden sanft ein, statt abrupt zu erscheinen. */
.wuchs {
  transition:
    opacity 0.8s ease,
    transform 0.8s cubic-bezier(0.2, 1.25, 0.4, 1);
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.wuchs.zu {
  opacity: 0;
  transform: scale(0.35);
}

/* Die Seite blendet beim Laden einmal sanft ein — die einzige Deko-Bewegung. */
@keyframes einblenden {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.einblenden {
  animation: einblenden 0.35s ease-out both;
}

@media (prefers-reduced-motion: reduce) {
  .wuchs {
    transition: none;
  }
  .einblenden {
    animation: none;
  }
}
```

- [ ] **Step 2: `app/layout.tsx` vollständig ersetzen**

```tsx
import type { Metadata, Viewport } from 'next';
import { Fraunces, Figtree } from 'next/font/google';
import './globals.css';
import { UntereNavigation } from '@/components/UntereNavigation';
import { aktiveNutzerId } from '@/lib/session';
import { nutzerMitId } from '@/lib/db/abfragen';

// Beide Schriften werden beim Bauen einmal heruntergeladen und danach von der
// App selbst ausgeliefert — im Betrieb keine Verbindung nach außen (STACK.md).
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'keep-growing',
  description: 'Pflanzenwachstum mit Töpfen, die Gesichter zeigen.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nutzerId = await aktiveNutzerId();
  const angemeldet = nutzerId !== null && nutzerMitId(nutzerId) !== undefined;

  return (
    <html lang="de" className={`${fraunces.variable} ${figtree.variable}`}>
      {/* pb-28: Platz für die schwebende untere Leiste, damit sie nichts verdeckt. */}
      <body className={angemeldet ? 'min-h-screen pb-28' : 'min-h-screen'}>
        <main className="einblenden mx-auto max-w-md px-4 pt-6">{children}</main>
        {angemeldet && <UntereNavigation />}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Prüfen, dass die App startet und die Schriften greifen**

Der Dev-Server auf Port 3010 lädt die Änderung von selbst. Im Browser-Bereich `http://localhost:3010/` öffnen, dann per `javascript_tool`:

```js
[getComputedStyle(document.body).fontFamily, getComputedStyle(document.body).backgroundColor]
```

Erwartet: erster Wert beginnt mit `__Figtree_…` (oder enthält `Figtree`), zweiter Wert ist `rgb(245, 237, 220)`. In `preview_logs`/Terminal keine Fehler „Failed to download font".

- [ ] **Step 4: Typprüfung und Lint**

Run: `npx tsc --noEmit && npm run lint`
Erwartet: keine Ausgabe (tsc), Lint ohne Fehler.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "Gestaltung: Design-Tokens, Schriften Fraunces/Figtree, Papierhintergrund, Fokusring

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Fälligkeits-Texte als reine, getestete Logik

**Files:**
- Create: `lib/garten/faelligkeit.ts`
- Create: `lib/garten/faelligkeit.test.ts`
- Modify: `lib/db/abfragen.ts` (eine Funktion ergänzen, nach `naechsteFaelligkeitDuengen`)

- [ ] **Step 1: Test schreiben (`lib/garten/faelligkeit.test.ts`)**

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  kalendertageBis,
  faelligkeitsgruppe,
  beschreibeFaelligkeit,
  beschreibeLetztePflege,
  hinweisText,
  ermutigungsSatz,
} from './faelligkeit.ts';

// Fester Bezugspunkt: Samstag, 6. September 2026, 14:30 Uhr.
const heute = new Date(2026, 8, 6, 14, 30);
// Ein anderer Tag, immer morgens — damit die Uhrzeit nie das Ergebnis kippt.
const tag = (versatz: number) => new Date(2026, 8, 6 + versatz, 9, 0);

// WARUM: Die Gruppen entscheiden, ob ein Topf in „Heute" steht. Eine
// überfällige Pflanze darf nie aus „Heute" verschwinden, nur weil ihr
// Fälligkeitstag vorbei ist — sonst wird Vergessen unsichtbar.
test('Fälligkeit: gestern fällig zählt weiter als heute', () => {
  assert.equal(faelligkeitsgruppe(tag(-1), heute), 'heute');
});

test('Fälligkeit: heute früh fällig ist heute, auch wenn es schon Nachmittag ist', () => {
  assert.equal(faelligkeitsgruppe(new Date(2026, 8, 6, 8, 0), heute), 'heute');
});

test('Fälligkeit: morgen ist morgen, übermorgen ist später', () => {
  assert.equal(faelligkeitsgruppe(tag(1), heute), 'morgen');
  assert.equal(faelligkeitsgruppe(tag(2), heute), 'spaeter');
});

test('Kalendertage: zählt ganze Tage, keine 24-Stunden-Fenster', () => {
  // 23 Uhr heute bis 1 Uhr morgen sind 2 Stunden, aber ein Kalendertag.
  assert.equal(kalendertageBis(new Date(2026, 8, 7, 1, 0), new Date(2026, 8, 6, 23, 0)), 1);
});

// WARUM: Der Text steht in jeder Aufgaben-Zeile. Ein falscher Plural
// („seit 1 Tagen") wirkt wie ein Tippfehler in der ganzen App.
test('Fälligkeitstext: Einzahl bei einem Tag', () => {
  assert.equal(beschreibeFaelligkeit(tag(-1), heute), 'seit 1 Tag überfällig');
});

test('Fälligkeitstext: Mehrzahl, heute, morgen, später', () => {
  assert.equal(beschreibeFaelligkeit(tag(-3), heute), 'seit 3 Tagen überfällig');
  assert.equal(beschreibeFaelligkeit(tag(0), heute), 'heute fällig');
  assert.equal(beschreibeFaelligkeit(tag(1), heute), 'morgen fällig');
  assert.equal(beschreibeFaelligkeit(tag(4), heute), 'in 4 Tagen');
});

// WARUM: Das Schild am Topf sagt „zuletzt gegossen …". „noch nie" muss
// ehrlich so heißen, nicht „vor 20000 Tagen".
test('Letzte Pflege: noch nie, heute, gestern, vor N Tagen', () => {
  assert.equal(beschreibeLetztePflege(null, heute), 'noch nie');
  assert.equal(beschreibeLetztePflege(new Date(2026, 8, 6, 8, 0), heute), 'heute');
  assert.equal(beschreibeLetztePflege(tag(-1), heute), 'gestern');
  assert.equal(beschreibeLetztePflege(tag(-2), heute), 'vor 2 Tagen');
});

// WARUM: Die Hinweis-Pille auf Home ist der Einstieg in die Hauptaufgabe.
// Sie darf Töpfe nicht doppelt zählen, wenn eine Pflanze Wasser UND Dünger braucht.
test('Hinweis: nur Wasser, Einzahl und Mehrzahl', () => {
  assert.equal(hinweisText({ wasser: 1, duenger: 0, pflanzen: 1 }), '1 Topf wartet heute auf Wasser');
  assert.equal(hinweisText({ wasser: 2, duenger: 0, pflanzen: 2 }), '2 Töpfe warten heute auf Wasser');
});

test('Hinweis: nur Dünger', () => {
  assert.equal(hinweisText({ wasser: 0, duenger: 1, pflanzen: 1 }), '1 Topf wartet heute auf Dünger');
});

test('Hinweis: Wasser und Dünger — Töpfe zählen, nicht Aufgaben', () => {
  assert.equal(hinweisText({ wasser: 2, duenger: 2, pflanzen: 3 }), '3 Töpfe brauchen heute Pflege');
});

test('Hinweis: nichts fällig ist eine gute Nachricht', () => {
  assert.equal(hinweisText({ wasser: 0, duenger: 0, pflanzen: 0 }), 'Heute sind alle Töpfe versorgt.');
});

// WARUM: Die Ermutigung soll nach dem ersten Schritt kommen, nicht vorwurfsvoll
// vor dem ersten. Ohne erledigte Aufgabe gibt es keinen Satz.
test('Ermutigung: nichts erledigt → kein Satz', () => {
  assert.equal(ermutigungsSatz(0, 3), null);
  assert.equal(ermutigungsSatz(0, 0), null);
});

test('Ermutigung: teilweise erledigt nennt Fortschritt', () => {
  assert.equal(ermutigungsSatz(1, 2), '1 von 3 heute erledigt — weiter so!');
});

test('Ermutigung: alles erledigt feiert', () => {
  assert.equal(ermutigungsSatz(3, 0), 'Alles erledigt — die Töpfe strahlen.');
});
```

- [ ] **Step 2: Test laufen lassen, muss scheitern**

Run: `node --test --experimental-strip-types lib/garten/faelligkeit.test.ts`
Erwartet: Fehler `Cannot find module … faelligkeit.ts`.

- [ ] **Step 3: `lib/garten/faelligkeit.ts` anlegen**

```ts
/**
 * Reine Textlogik rund um Fälligkeiten — ohne Datenbank, damit sie billig
 * testbar ist (REGELN.md, Abschnitt 4). Die Fälligkeits-Zeitpunkte selbst
 * kommen aus lib/db/abfragen.ts (naechsteFaelligkeitGiessen/…Duengen).
 */

const MILLISEKUNDEN_PRO_TAG = 24 * 60 * 60 * 1000;

export type Faelligkeitsgruppe = 'heute' | 'morgen' | 'spaeter';

function tagesanfang(datum: Date): number {
  return new Date(datum.getFullYear(), datum.getMonth(), datum.getDate()).getTime();
}

/** Ganze Kalendertage von `heute` bis `datum` — negativ, wenn `datum` vorbei ist. */
export function kalendertageBis(datum: Date, heute: Date): number {
  return Math.round((tagesanfang(datum) - tagesanfang(heute)) / MILLISEKUNDEN_PRO_TAG);
}

/** Überfälliges bleibt in „heute" — Vergessen darf nicht aus der Liste fallen. */
export function faelligkeitsgruppe(faelligAm: Date, heute: Date): Faelligkeitsgruppe {
  const tage = kalendertageBis(faelligAm, heute);
  if (tage <= 0) return 'heute';
  if (tage === 1) return 'morgen';
  return 'spaeter';
}

export function beschreibeFaelligkeit(faelligAm: Date, heute: Date): string {
  const tage = kalendertageBis(faelligAm, heute);
  if (tage < -1) return `seit ${-tage} Tagen überfällig`;
  if (tage === -1) return 'seit 1 Tag überfällig';
  if (tage === 0) return 'heute fällig';
  if (tage === 1) return 'morgen fällig';
  return `in ${tage} Tagen`;
}

export function beschreibeLetztePflege(zuletzt: Date | null, heute: Date): string {
  if (!zuletzt) return 'noch nie';
  const tage = -kalendertageBis(zuletzt, heute);
  if (tage <= 0) return 'heute';
  if (tage === 1) return 'gestern';
  return `vor ${tage} Tagen`;
}

/** Ob eine Pflege heute schon passiert ist (für blasse „erledigt"-Zeilen). */
export function istHeute(zeitpunkt: Date | null, heute: Date): boolean {
  return zeitpunkt !== null && kalendertageBis(zeitpunkt, heute) === 0;
}

/**
 * Text der Hinweis-Pille auf Home. `pflanzen` ist die Zahl der Töpfe, die
 * heute irgendetwas brauchen — nicht die Summe der Aufgaben.
 */
export function hinweisText(bedarf: { wasser: number; duenger: number; pflanzen: number }): string {
  const { wasser, duenger, pflanzen } = bedarf;
  if (pflanzen === 0) return 'Heute sind alle Töpfe versorgt.';
  if (duenger === 0) return wasser === 1 ? '1 Topf wartet heute auf Wasser' : `${wasser} Töpfe warten heute auf Wasser`;
  if (wasser === 0) return duenger === 1 ? '1 Topf wartet heute auf Dünger' : `${duenger} Töpfe warten heute auf Dünger`;
  return pflanzen === 1 ? '1 Topf braucht heute Pflege' : `${pflanzen} Töpfe brauchen heute Pflege`;
}

/** Ermutigung erst nach dem ersten erledigten Schritt — kein Vorwurf davor. */
export function ermutigungsSatz(erledigt: number, offen: number): string | null {
  if (erledigt === 0) return null;
  if (offen === 0) return 'Alles erledigt — die Töpfe strahlen.';
  return `${erledigt} von ${erledigt + offen} heute erledigt — weiter so!`;
}
```

- [ ] **Step 4: Test laufen lassen, muss bestehen**

Run: `npm test`
Erwartet: alle bisherigen 34 Tests plus die 15 neuen bestehen, `fail 0`.

- [ ] **Step 5: `zuletztGepflegtAm` in `lib/db/abfragen.ts` ergänzen**

Direkt nach `naechsteFaelligkeitDuengen` (Zeile 322) einfügen:

```ts
/**
 * Letzter Zeitpunkt einer Pflegeart, für „zuletzt gegossen vor 2 Tagen" und
 * blasse „heute schon erledigt"-Zeilen. Wie naechsteFaelligkeit*: die
 * übergebene Pflanze stammt aus einer bereits eigentümergeprüften Abfrage.
 */
export function zuletztGepflegtAm(pflanze: Pflanze, typ: AktivitaetTyp): Date | null {
  const zuletzt = letzteAktivitaet(pflanze.id, typ);
  return zuletzt ? new Date(zuletzt) : null;
}
```

- [ ] **Step 6: Typprüfung, Lint, Commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Erwartet: alles grün.

```bash
git add lib/garten/faelligkeit.ts lib/garten/faelligkeit.test.ts lib/db/abfragen.ts
git commit -m "Fälligkeits-Texte als reine Logik: Gruppen, Überfällig-Text, Hinweis-Pille, Ermutigung

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Bausatz I — Knöpfe und Kästchen

**Files:**
- Create: `components/bausatz/knopfStil.ts`
- Create: `components/bausatz/Knopf.tsx`
- Create: `components/bausatz/KnopfLink.tsx`
- Create: `components/bausatz/Kaestchen.tsx`

- [ ] **Step 1: `components/bausatz/knopfStil.ts`**

```ts
/**
 * Klassen aller Knopf-Varianten (Spec, Abschnitt 4). Ohne 'use client', damit
 * Server-Komponenten (KnopfLink) und Client-Komponenten (Knopf) dieselben
 * Klassen teilen. Tailwind-Wichtigkeit: `px-0!` überschreibt `px-4` aus BASIS.
 */

export type KnopfVariante = 'primaer' | 'sekundaer' | 'text' | 'gefahr';
export type PflegeVariante = 'wasser' | 'mint' | 'sonne';

const BASIS =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTEN: Record<KnopfVariante, string> = {
  primaer: 'bg-moos text-papier-hell shadow-karte hover:bg-moos-dunkel',
  sekundaer: 'border border-kante bg-papier-hell text-tinte shadow-karte hover:bg-white',
  text: 'min-h-0 px-1 py-1 text-tinte-gedaempft underline-offset-2 hover:underline',
  gefahr: 'min-h-0 px-1 py-1 text-gefahr underline-offset-2 hover:underline',
};

export function knopfKlassen(variante: KnopfVariante, extra = ''): string {
  return `${BASIS} ${VARIANTEN[variante]} ${extra}`.trim();
}

const PFLEGE_BASIS =
  'relative flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-sm font-bold text-tinte shadow-karte transition active:scale-[0.98] disabled:opacity-60';

const PFLEGE_FARBEN: Record<PflegeVariante, { normal: string; faellig: string }> = {
  wasser: { normal: 'bg-wasser hover:bg-wasser-kraeftig', faellig: 'bg-wasser-kraeftig ring-2 ring-tinte/70' },
  mint: { normal: 'bg-mint hover:bg-mint-kraeftig', faellig: 'bg-mint-kraeftig ring-2 ring-tinte/70' },
  sonne: { normal: 'bg-sonne hover:bg-sonne-kraeftig', faellig: 'bg-sonne-kraeftig ring-2 ring-tinte/70' },
};

/** Der heute fällige Knopf ist kräftiger und umrandet — eine Region, eine Hauptaktion. */
export function pflegeKnopfKlassen(variante: PflegeVariante, faellig: boolean, extra = ''): string {
  return `${PFLEGE_BASIS} ${PFLEGE_FARBEN[variante][faellig ? 'faellig' : 'normal']} ${extra}`.trim();
}

export const FAELLIG_ETIKETT_KLASSEN =
  'absolute -top-2 rounded-full bg-tinte px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-papier-hell';
```

- [ ] **Step 2: `components/bausatz/Knopf.tsx`**

```tsx
'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import {
  knopfKlassen,
  pflegeKnopfKlassen,
  FAELLIG_ETIKETT_KLASSEN,
  type KnopfVariante,
  type PflegeVariante,
} from './knopfStil';

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} inline-block animate-spin rounded-full border-2 border-current border-t-transparent`}
    />
  );
}

type KnopfProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: KnopfVariante;
  /** Erzwingt „wartend" von außen (z. B. beim Nachladen ohne Formular). */
  wartend?: boolean;
  children: ReactNode;
};

/**
 * Ein Knopf für alle Seiten. Als Absende-Knopf zeigt er von selbst „wartend"
 * (Spinner, gesperrt), solange die Server-Aktion läuft — ehrlicher Status
 * statt Doppelklick ins Leere (REGELN.md, Abschnitt 1).
 */
export function Knopf({
  variante = 'primaer',
  wartend,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: KnopfProps) {
  const { pending } = useFormStatus();
  const laeuft = wartend ?? (type === 'submit' && pending);
  return (
    <button
      type={type}
      disabled={disabled || laeuft}
      aria-busy={laeuft || undefined}
      className={knopfKlassen(variante, className)}
      {...rest}
    >
      {laeuft && <Spinner />}
      {children}
    </button>
  );
}

type PflegeKnopfProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variante: PflegeVariante;
  faellig?: boolean;
  symbol: ReactNode;
  children: ReactNode;
};

/** Gießen/Düngen als Absende-Knopf im Formular; Symbol oben, Wort unten. */
export function PflegeKnopf({ variante, faellig = false, symbol, className = '', children, ...rest }: PflegeKnopfProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={pflegeKnopfKlassen(variante, faellig, className)}
      {...rest}
    >
      {faellig && <span className={FAELLIG_ETIKETT_KLASSEN}>fällig</span>}
      <span className="flex h-7 w-7 items-center justify-center">{pending ? <Spinner className="h-5 w-5" /> : symbol}</span>
      {children}
    </button>
  );
}
```

- [ ] **Step 3: `components/bausatz/KnopfLink.tsx`**

```tsx
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { knopfKlassen, pflegeKnopfKlassen, type KnopfVariante, type PflegeVariante } from './knopfStil';

type LinkProps = ComponentProps<typeof Link>;

/** Ein Link, der wie ein Knopf aussieht (Navigation, kein Speichern). */
export function KnopfLink({ variante = 'sekundaer', className = '', ...rest }: LinkProps & { variante?: KnopfVariante }) {
  return <Link className={knopfKlassen(variante, className)} {...rest} />;
}

/** Ernten führt zum Formular — deshalb ein Link im Gewand des Pflege-Knopfs. */
export function PflegeKnopfLink({
  variante,
  symbol,
  className = '',
  children,
  ...rest
}: LinkProps & { variante: PflegeVariante; symbol: ReactNode; children: ReactNode }) {
  return (
    <Link className={pflegeKnopfKlassen(variante, false, className)} {...rest}>
      <span className="flex h-7 w-7 items-center justify-center">{symbol}</span>
      {children}
    </Link>
  );
}
```

- [ ] **Step 4: `components/bausatz/Kaestchen.tsx`**

```tsx
'use client';

import { useFormStatus } from 'react-dom';
import { IconErledigt } from '@/components/Symbole';
import { Spinner } from './Knopf';

/**
 * Abhak-Kästchen der Aufgabenseite (Team-Entscheidung: Kästchen statt Knopf).
 * Tippfläche 44 px, sichtbares Kästchen 28 px. Erledigte Zeilen sind gesperrt —
 * ein Abhaken lässt sich nicht zurücknehmen, das ist ehrlich so.
 */
export function Kaestchen({ label, erledigt = false }: { label: string; erledigt?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={erledigt || pending}
      aria-label={label}
      aria-busy={pending || undefined}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl disabled:cursor-default"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 border-moos transition-colors ${
          erledigt ? 'bg-moos text-papier-hell' : 'bg-papier-hell text-transparent'
        }`}
      >
        {pending ? <Spinner className="h-3.5 w-3.5 text-moos" /> : <IconErledigt className="h-4 w-4" />}
      </span>
    </button>
  );
}
```

- [ ] **Step 5: Typprüfung, Lint, Commit**

Run: `npx tsc --noEmit && npm run lint`
Erwartet: grün (die Bausteine werden noch nirgends benutzt; Lint meldet keine unbenutzten Dateien).

```bash
git add components/bausatz/knopfStil.ts components/bausatz/Knopf.tsx components/bausatz/KnopfLink.tsx components/bausatz/Kaestchen.tsx
git commit -m "Bausatz: Knopf-Varianten, Pflege-Knöpfe mit fällig-Etikett, Kästchen mit Wartezustand

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Bausatz II — Feld, Umschalter, Karte, Titel, Regal

**Files:**
- Create: `components/bausatz/Feld.tsx`
- Create: `components/bausatz/Umschalter.tsx`
- Create: `components/bausatz/Karte.tsx`
- Create: `components/bausatz/Titel.tsx`
- Create: `components/bausatz/Regal.tsx`

- [ ] **Step 1: `components/bausatz/Feld.tsx`**

```tsx
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const EINGABE =
  'w-full rounded-2xl border border-kante bg-papier-hell px-3.5 py-3 text-base text-tinte outline-none transition placeholder:text-tinte-gedaempft/60 focus:border-moos focus:ring-2 focus:ring-moos/30 disabled:bg-papier disabled:text-tinte-gedaempft';

/** Beschriftung oben, Eingabe in der Mitte, Hinweis oder Fehler darunter. */
export function Feld({
  label,
  hinweis,
  fehler,
  children,
}: {
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-tinte">{label}</span>
      {children}
      {fehler ? (
        <span role="alert" className="mt-1.5 block text-sm text-gefahr">
          {fehler}
        </span>
      ) : hinweis ? (
        <span className="mt-1.5 block text-xs text-tinte-gedaempft">{hinweis}</span>
      ) : null}
    </label>
  );
}

export function Eingabe({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${EINGABE} ${className}`} {...rest} />;
}

export function Textbereich({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${EINGABE} ${className}`} {...rest} />;
}

export function Auswahl({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${EINGABE} ${className}`} {...rest} />;
}
```

- [ ] **Step 2: `components/bausatz/Umschalter.tsx`**

```tsx
/**
 * Zweiteiliger Schalter (z. B. Drinnen/Draußen) als Radiogruppe — reines CSS,
 * funktioniert in Formularen ohne JavaScript und ist per Tastatur bedienbar.
 */
export function Umschalter({
  name,
  legende,
  optionen,
  vorgabe,
}: {
  name: string;
  legende: string;
  optionen: { wert: string; label: string }[];
  vorgabe: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold text-tinte">{legende}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full border border-kante bg-papier-hell p-1 shadow-karte">
        {optionen.map((o) => (
          <label key={o.wert} className="relative">
            <input type="radio" name={name} value={o.wert} defaultChecked={o.wert === vorgabe} className="peer sr-only" />
            <span className="flex min-h-10 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold text-tinte-gedaempft transition peer-checked:bg-moos peer-checked:text-papier-hell peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-moos">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 3: `components/bausatz/Karte.tsx`**

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export function Karte({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-kante bg-papier-hell shadow-karte ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** Sichtbarer Fehler auf Deutsch, mit Handlungsmöglichkeit (REGELN.md, Abschnitt 1). */
export function Fehlerkasten({
  titel = 'Etwas ist schiefgegangen.',
  text,
  aktionen,
}: {
  titel?: ReactNode;
  text?: ReactNode;
  aktionen?: ReactNode;
}) {
  return (
    <div role="alert" className="rounded-2xl border border-gefahr/30 bg-gefahr-zart p-4 text-gefahr">
      <p className="font-semibold">{titel}</p>
      {text && <p className="mt-1 text-sm">{text}</p>}
      {aktionen && <div className="mt-3 flex flex-wrap gap-2">{aktionen}</div>}
    </div>
  );
}

/** Ein Satz, höchstens ein Knopf — kein leerer Kasten ohne Ausweg. */
export function Leerzustand({ text, aktion }: { text: ReactNode; aktion?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-kante-dunkel px-5 py-6 text-center">
      <p className="text-sm text-tinte-gedaempft">{text}</p>
      {aktion && <div className="mt-3 flex justify-center">{aktion}</div>}
    </div>
  );
}
```

- [ ] **Step 4: `components/bausatz/Titel.tsx`**

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconZurueck } from '@/components/Symbole';

/** Seitenüberschrift in Fraunces; ein <em> darin wird kursiv und moosgrün. */
export function Seitentitel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={`font-anzeige text-3xl font-medium leading-none tracking-tight text-moos-dunkel [&_em]:italic [&_em]:text-moos-hell ${className}`}
    >
      {children}
    </h1>
  );
}

export function Abschnittstitel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`mb-2 flex items-center gap-1.5 font-anzeige text-base italic text-tinte-gedaempft ${className}`}>
      {children}
    </h2>
  );
}

export function ZurueckChip({ href, children = 'Zurück' }: { href: string; children?: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-kante bg-papier-hell pl-2 pr-3.5 text-sm font-semibold text-tinte-gedaempft shadow-karte transition hover:text-tinte"
    >
      <IconZurueck className="h-4 w-4" />
      {children}
    </Link>
  );
}
```

- [ ] **Step 5: `components/bausatz/Regal.tsx`**

```tsx
import type { ReactNode } from 'react';

/** Holzbrett, auf dem Töpfe stehen. */
export function Regalbrett({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`h-2.5 rounded-[3px] bg-linear-to-b from-holz-hell to-holz-dunkel shadow-brett ${className}`} />
  );
}

export interface RegalEintrag {
  schluessel: string;
  topf: ReactNode;
  beschriftung: ReactNode;
}

/** Ordnet Einträge dreierweise: Töpfe, darunter das Brett, darunter die Namen. */
export function Regal({ eintraege }: { eintraege: RegalEintrag[] }) {
  const reihen: RegalEintrag[][] = [];
  for (let i = 0; i < eintraege.length; i += 3) reihen.push(eintraege.slice(i, i + 3));

  return (
    <div className="space-y-7">
      {reihen.map((reihe, i) => (
        <div key={i}>
          <div className="grid grid-cols-3 gap-x-3 px-1">
            {reihe.map((e) => (
              <div key={e.schluessel} className="drop-shadow-[0_6px_4px_rgba(90,60,30,0.18)]">
                {e.topf}
              </div>
            ))}
          </div>
          <Regalbrett className="-mx-1 -mt-1" />
          <div className="grid grid-cols-3 gap-x-3 px-1 pt-2">
            {reihe.map((e) => (
              <div key={e.schluessel} className="min-w-0">
                {e.beschriftung}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Typprüfung, Lint, Commit**

Run: `npx tsc --noEmit && npm run lint`
Erwartet: grün.

```bash
git add components/bausatz/Feld.tsx components/bausatz/Umschalter.tsx components/bausatz/Karte.tsx components/bausatz/Titel.tsx components/bausatz/Regal.tsx
git commit -m "Bausatz: Feld, Umschalter, Karte/Fehlerkasten/Leerzustand, Titel, Regal

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Untere Leiste „Home · Aufgaben · Neu"

**Files:**
- Modify: `components/UntereNavigation.tsx` (Zeilen 59–92)

- [ ] **Step 1: `ZIELE` und `UntereNavigation` ersetzen** (die drei Icon-Funktionen oben bleiben unverändert)

```tsx
const ZIELE: { href: string; label: string; icon: (props: { aktiv: boolean }) => ReactNode }[] = [
  { href: '/', label: 'Home', icon: IconHeim },
  { href: '/aufgaben', label: 'Aufgaben', icon: IconAufgaben },
  { href: '/hinzufuegen', label: 'Neu', icon: IconPlus },
];

export function UntereNavigation() {
  const pfad = usePathname();

  return (
    <nav aria-label="Hauptnavigation" className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <ul className="mx-auto flex max-w-md justify-around rounded-full border border-kante bg-papier-hell/95 px-2 py-1.5 shadow-schweben backdrop-blur">
        {ZIELE.map((ziel) => {
          // Pflanzenseiten gehören zum Garten — Home bleibt dort markiert.
          const aktiv = ziel.href === '/' ? pfad === '/' || pfad.startsWith('/pflanze') : pfad.startsWith(ziel.href);
          const Icon = ziel.icon;
          return (
            <li key={ziel.href} className="flex-1">
              <Link
                href={ziel.href}
                aria-current={aktiv ? 'page' : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                  aktiv ? 'text-moos' : 'text-tinte-gedaempft hover:text-tinte'
                }`}
              >
                <Icon aktiv={aktiv} />
                {ziel.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 2: Im Browser prüfen**

`http://localhost:3010/` (als Anne angemeldet): Leiste schwebt als Pille, „Home" moosgrün, Beschriftungen „Home · Aufgaben · Neu". Auf `/pflanze/<id>` bleibt Home markiert. Bei 375 px Breite kein seitliches Scrollen (`document.documentElement.scrollWidth <= window.innerWidth`).

- [ ] **Step 3: Commit**

```bash
npx tsc --noEmit && npm run lint
git add components/UntereNavigation.tsx
git commit -m "Untere Leiste: schwebende Pille mit Home · Aufgaben · Neu

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Startseite „Mein Garten"

**Files:**
- Modify: `app/page.tsx` (komplett)

- [ ] **Step 1: `app/page.tsx` vollständig ersetzen**

```tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { aktuelleSitzung } from '@/lib/session';
import {
  pflanzenFuerGarten,
  pflegestimmungFuerPflanze,
  wuchsstufeFuerPflanze,
  ernteListeFuerNutzer,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
} from '@/lib/db/abfragen';
import { faelligkeitsgruppe, hinweisText } from '@/lib/garten/faelligkeit';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { EngelWolke } from '@/components/EngelWolke';
import { ernteSymbol } from '@/lib/garten/symbole';
import { IconTropfen, IconErledigt } from '@/components/Symbole';
import { Seitentitel, Abschnittstitel } from '@/components/bausatz/Titel';
import { Regal } from '@/components/bausatz/Regal';
import { Leerzustand } from '@/components/bausatz/Karte';
import { KnopfLink } from '@/components/bausatz/KnopfLink';

export default async function Home() {
  const sitzung = await aktuelleSitzung();
  if (!sitzung) redirect('/start');
  const { nutzerId, gartenId } = sitzung;

  const pflanzen = pflanzenFuerGarten(gartenId, nutzerId);
  const lebend = pflanzen.filter((p) => p.lebenszustand === 'lebend');
  const verstorben = pflanzen.filter((p) => p.lebenszustand === 'verstorben');
  const ernten = ernteListeFuerNutzer(nutzerId);
  // Älteste zuerst, damit die Vitrine mit jeder neuen Ernte nach rechts wächst.
  const ernteChronologisch = [...ernten].reverse();

  // Bedarf für die Hinweis-Pille: Töpfe zählen, nicht Aufgaben.
  const heute = new Date();
  let wasser = 0;
  let duenger = 0;
  let pflegebeduerftig = 0;
  for (const p of lebend) {
    const brauchtWasser = faelligkeitsgruppe(naechsteFaelligkeitGiessen(p), heute) === 'heute';
    const duengenAm = naechsteFaelligkeitDuengen(p);
    const brauchtDuenger = duengenAm !== null && faelligkeitsgruppe(duengenAm, heute) === 'heute';
    if (brauchtWasser) wasser++;
    if (brauchtDuenger) duenger++;
    if (brauchtWasser || brauchtDuenger) pflegebeduerftig++;
  }
  const allesVersorgt = pflegebeduerftig === 0;

  return (
    <div className="space-y-8 pb-6">
      <header className="space-y-3">
        <Seitentitel>
          Mein <em>Garten</em>
        </Seitentitel>
        {lebend.length > 0 && (
          <Link
            href="/aufgaben"
            className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-karte transition hover:bg-white ${
              allesVersorgt ? 'border-moos/20 bg-moos-zart text-moos-dunkel' : 'border-kante bg-papier-hell text-tinte'
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${allesVersorgt ? 'bg-mint' : 'bg-wasser'}`}>
              {allesVersorgt ? <IconErledigt className="h-3.5 w-3.5" /> : <IconTropfen className="h-3.5 w-3.5" />}
            </span>
            {hinweisText({ wasser, duenger, pflanzen: pflegebeduerftig })}
          </Link>
        )}
      </header>

      <section>
        <Abschnittstitel>Meine Töpfe</Abschnittstitel>
        {lebend.length === 0 ? (
          <Leerzustand
            text="Hier ist noch Platz für die erste Pflanze."
            aktion={
              <KnopfLink href="/hinzufuegen" variante="primaer">
                Erste Pflanze anlegen
              </KnopfLink>
            }
          />
        ) : (
          <Regal
            eintraege={lebend.map((p) => ({
              schluessel: p.id,
              topf: (
                <Link href={`/pflanze/${p.id}`} className="block active:opacity-70">
                  <div className="aspect-[8/13]">
                    <TopfMitGesicht
                      id={p.id}
                      wuchsstufe={wuchsstufeFuerPflanze(p)}
                      stimmung={pflegestimmungFuerPflanze(p)}
                      name={p.name}
                      art={p.art}
                      darstellung={p.darstellung}
                    />
                  </div>
                </Link>
              ),
              // Der Topf-Link trägt bereits Name und Stimmung (aria-label im SVG);
              // die Beschriftung ist nur der sichtbare Zweitweg, kein zweiter Tab-Stopp.
              beschriftung: (
                <Link href={`/pflanze/${p.id}`} tabIndex={-1} aria-hidden="true" className="block truncate text-center text-sm font-semibold text-tinte">
                  {p.name}
                </Link>
              ),
            }))}
          />
        )}
      </section>

      <section>
        <Abschnittstitel>Ernte-Vitrine</Abschnittstitel>
        {ernteChronologisch.length === 0 ? (
          <p className="text-sm text-tinte-gedaempft">Noch nichts geerntet.</p>
        ) : (
          <div className="rounded-2xl border border-white/90 border-b-[3px] border-b-kante-dunkel bg-linear-to-b from-white/60 to-white/20 px-4 pb-3 pt-2.5">
            <div className="flex flex-wrap gap-3 text-2xl">
              {ernteChronologisch.map((e, i) => {
                const datum = new Date(e.datum).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
                const titel = `${e.pflanzeName} · ${datum}${e.menge ? ' · ' + e.menge : ''}${e.notiz ? ' — ' + e.notiz : ''}`;
                return (
                  <span key={i} title={titel}>
                    {ernteSymbol(e.pflanzeName, e.pflanzeArt)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {verstorben.length > 0 && (
        <section>
          <Abschnittstitel>In liebevoller Erinnerung</Abschnittstitel>
          <div className="grid grid-cols-3 gap-3">
            {verstorben.map((p) => (
              <div key={p.id}>
                <div className="aspect-square">
                  <EngelWolke id={p.id} wuchsstufe={wuchsstufeFuerPflanze(p)} name={p.name} art={p.art} darstellung={p.darstellung} />
                </div>
                <p className="mt-1 truncate text-center text-sm font-medium text-tinte-gedaempft">{p.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

Hinweis: Die Engel-Wolken schweben — sie bekommen bewusst **kein** Brett (die Wolke ist ihr Boden).

- [ ] **Step 2: Im Browser prüfen**

`http://localhost:3010/`: Überschrift „Mein *Garten*" in Fraunces, kein „Nutzer wechseln", kein Tagesgruß. Hinweis-Pille zeigt eine plausible Zahl und führt beim Antippen zu `/aufgaben`. Töpfe stehen dreierweise auf Brettern, Namen darunter. Bei 375 px kein seitliches Scrollen. Screenshot machen.

- [ ] **Step 3: Commit**

```bash
npx tsc --noEmit && npm run lint
git add app/page.tsx
git commit -m "Home: Töpfe auf Regalbrettern, Hinweis-Pille zu den Aufgaben, Vitrine als Glasbord

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Pflanzenseite mit fälligem Knopf und Rückfrage

**Files:**
- Modify: `components/TopfMitGesicht.tsx:35` (`const` → `export const`)
- Create: `components/VerstorbenMarkieren.tsx`
- Modify: `app/pflanze/[id]/page.tsx` (komplett)

- [ ] **Step 1: Stimmungstexte exportieren**

In `components/TopfMitGesicht.tsx` Zeile 35 ändern von
`const STIMMUNG_BESCHREIBUNG: Record<Pflegestimmung, string> = {`
zu
`export const STIMMUNG_BESCHREIBUNG: Record<Pflegestimmung, string> = {`

- [ ] **Step 2: `components/VerstorbenMarkieren.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { alsVerstorbenAction } from '@/app/server-aktionen';
import { Knopf } from '@/components/bausatz/Knopf';

/**
 * Zwei Schritte statt einem Tipp: „Als verstorben markieren" wirkt sofort und
 * lässt sich nicht rückgängig machen — deshalb erst die Rückfrage.
 */
export function VerstorbenMarkieren({ pflanzeId }: { pflanzeId: string }) {
  const [nachfrage, setNachfrage] = useState(false);

  if (!nachfrage) {
    return (
      <div className="pt-4 text-center">
        <Knopf variante="gefahr" className="text-xs" onClick={() => setNachfrage(true)}>
          Als verstorben markieren
        </Knopf>
      </div>
    );
  }

  return (
    <form action={alsVerstorbenAction} className="mt-4 rounded-2xl border border-gefahr/30 bg-gefahr-zart p-4 text-center">
      <input type="hidden" name="pflanzeId" value={pflanzeId} />
      <p className="text-sm font-semibold text-gefahr">Wirklich? Die Pflanze wandert dann zu „In liebevoller Erinnerung".</p>
      <div className="mt-3 flex justify-center gap-2">
        <Knopf variante="sekundaer" onClick={() => setNachfrage(false)}>
          Abbrechen
        </Knopf>
        <Knopf type="submit" variante="sekundaer" className="border-gefahr/40 text-gefahr">
          Ja, sie ist gestorben
        </Knopf>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: `app/pflanze/[id]/page.tsx` vollständig ersetzen**

```tsx
import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/session';
import {
  pflanzeMitId,
  pflegestimmungFuerPflanze,
  wuchsstufeFuerPflanze,
  aktivitaetenFuerPflanze,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
  zuletztGepflegtAm,
} from '@/lib/db/abfragen';
import { faelligkeitsgruppe, beschreibeLetztePflege } from '@/lib/garten/faelligkeit';
import { TopfMitGesicht, STIMMUNG_BESCHREIBUNG } from '@/components/TopfMitGesicht';
import { VerstorbenMarkieren } from '@/components/VerstorbenMarkieren';
import { aktivitaetAction } from '@/app/server-aktionen';
import { IconTropfen, IconBlatt, IconKorb } from '@/components/Symbole';
import { ZurueckChip, Abschnittstitel } from '@/components/bausatz/Titel';
import { Karte } from '@/components/bausatz/Karte';
import { Regalbrett } from '@/components/bausatz/Regal';
import { PflegeKnopf } from '@/components/bausatz/Knopf';
import { PflegeKnopfLink } from '@/components/bausatz/KnopfLink';

const AKTIVITAET_LABEL: Record<string, string> = {
  giessen: 'Gegossen',
  duengen: 'Gedüngt',
  ernten: 'Geerntet',
};

// Farbpunkte im Verlauf tragen dieselben Farben wie die Pflege-Knöpfe.
const PUNKT_FARBE: Record<string, string> = {
  giessen: 'bg-wasser-kraeftig',
  duengen: 'bg-mint-kraeftig',
  ernten: 'bg-sonne-kraeftig',
};

export default async function PflanzenDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzerId = await aktuellerNutzer();
  if (!nutzerId) redirect('/start');

  const pflanze = pflanzeMitId(id, nutzerId);
  const stimmung = pflegestimmungFuerPflanze(pflanze);
  const wuchsstufe = wuchsstufeFuerPflanze(pflanze);
  const verlauf = aktivitaetenFuerPflanze(pflanze.id, nutzerId).slice(0, 10);

  const heute = new Date();
  const giessenFaellig = faelligkeitsgruppe(naechsteFaelligkeitGiessen(pflanze), heute) === 'heute';
  const duengenAm = naechsteFaelligkeitDuengen(pflanze);
  const duengenFaellig = duengenAm !== null && faelligkeitsgruppe(duengenAm, heute) === 'heute';
  const zuletztGegossen = beschreibeLetztePflege(zuletztGepflegtAm(pflanze, 'giessen'), heute);

  const untertitel = [pflanze.art, pflanze.drinnenDraussen === 'drinnen' ? 'drinnen' : 'draußen'].filter(Boolean).join(' · ');
  const lebt = pflanze.lebenszustand === 'lebend';

  return (
    <div className="space-y-6 pb-6">
      <ZurueckChip href="/">Mein Garten</ZurueckChip>

      <div className="relative">
        <div className="mx-auto w-36 aspect-[8/13] drop-shadow-[0_8px_6px_rgba(90,60,30,0.2)]">
          <TopfMitGesicht
            id={pflanze.id}
            wuchsstufe={wuchsstufe}
            stimmung={stimmung}
            name={pflanze.name}
            art={pflanze.art}
            darstellung={pflanze.darstellung}
          />
        </div>
        <Regalbrett className="mx-6 -mt-1" />
        {lebt && (
          <Karte className="absolute right-0 top-3 px-3 py-2 text-xs leading-snug text-tinte-gedaempft">
            <span className="block font-anzeige text-sm italic text-moos">{STIMMUNG_BESCHREIBUNG[stimmung]}</span>
            zuletzt gegossen
            <br />
            {zuletztGegossen}
          </Karte>
        )}
      </div>

      <div className="text-center">
        <h1 className="font-anzeige text-3xl font-medium leading-none tracking-tight text-moos-dunkel">{pflanze.name}</h1>
        {untertitel && <p className="mt-1.5 text-sm text-tinte-gedaempft">{untertitel}</p>}
      </div>

      {lebt ? (
        <div className="grid grid-cols-3 gap-2 pt-1">
          <form action={aktivitaetAction}>
            <input type="hidden" name="pflanzeId" value={pflanze.id} />
            <input type="hidden" name="typ" value="giessen" />
            <PflegeKnopf variante="wasser" faellig={giessenFaellig} symbol={<IconTropfen className="h-6 w-6" />}>
              Gießen
            </PflegeKnopf>
          </form>
          <form action={aktivitaetAction}>
            <input type="hidden" name="pflanzeId" value={pflanze.id} />
            <input type="hidden" name="typ" value="duengen" />
            <PflegeKnopf variante="mint" faellig={duengenFaellig} symbol={<IconBlatt className="h-6 w-6" />}>
              Düngen
            </PflegeKnopf>
          </form>
          <PflegeKnopfLink href={`/pflanze/${pflanze.id}/ernte`} variante="sonne" symbol={<IconKorb className="h-6 w-6" />}>
            Ernten
          </PflegeKnopfLink>
        </div>
      ) : (
        <Karte className="p-3 text-center text-sm text-tinte-gedaempft">
          Diese Pflanze ist von uns gegangen und ruht in liebevoller Erinnerung.
        </Karte>
      )}

      <section>
        <Abschnittstitel>Steckbrief</Abschnittstitel>
        <Karte className="p-4 text-sm">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Erde</dt>
              <dd>{pflanze.erde ?? '–'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Licht</dt>
              <dd>{pflanze.licht ?? '–'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Gießen</dt>
              <dd>alle {pflanze.giessIntervallTage} Tage</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Dünger</dt>
              <dd>
                {pflanze.duengerIntervallTage === null
                  ? 'kein Düngeplan'
                  : `alle ${pflanze.duengerIntervallTage} Tage${pflanze.duengerTyp ? ` · ${pflanze.duengerTyp}` : ''}`}
              </dd>
            </div>
          </dl>
          {pflanze.notiz && <p className="mt-3 whitespace-pre-wrap border-t border-kante pt-3 text-tinte-gedaempft">{pflanze.notiz}</p>}
        </Karte>
      </section>

      {verlauf.length > 0 && (
        <section>
          <Abschnittstitel>Verlauf</Abschnittstitel>
          <ol className="ml-2 border-l-2 border-kante pl-4 text-sm">
            {verlauf.map((a) => (
              <li key={a.id} className="relative flex justify-between gap-3 py-1.5">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[1.45rem] top-2.5 h-3 w-3 rounded-full ring-4 ring-papier ${PUNKT_FARBE[a.typ] ?? 'bg-kante'}`}
                />
                <span>
                  {AKTIVITAET_LABEL[a.typ] ?? a.typ}
                  {a.menge ? ` · ${a.menge}` : ''}
                </span>
                <span className="shrink-0 text-tinte-gedaempft">
                  {new Date(a.datum).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {lebt && <VerstorbenMarkieren pflanzeId={pflanze.id} />}
    </div>
  );
}
```

- [ ] **Step 4: Im Browser prüfen**

Eine Pflanze öffnen: großer Topf auf Brett, Schild rechts oben mit Stimmung und „zuletzt gegossen …", **kein** „Wuchsstufe". Drei Pastell-Knöpfe: Himmelblau, Mint, Gelb; bei einer heute fälligen Pflanze trägt der passende Knopf das Etikett „fällig" und ist kräftiger. „Gießen" antippen → Knopf zeigt Spinner, danach wächst die Pflanze sichtbar (bestehende Animation), Schild sagt „heute". „Als verstorben markieren" antippen → Rückfrage erscheint, „Abbrechen" schließt sie wieder. **Nicht** bestätigen (Kopie-Datenbank, aber unnötig).

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add components/TopfMitGesicht.tsx components/VerstorbenMarkieren.tsx "app/pflanze/[id]/page.tsx"
git commit -m "Pflanzenseite: Topf auf Brett mit Stimmungsschild, fälliger Pflege-Knopf hervorgehoben, Rückfrage vor verstorben

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Aufgabenseite „Heute dran"

**Files:**
- Modify: `app/aufgaben/page.tsx` (komplett)

- [ ] **Step 1: `app/aufgaben/page.tsx` vollständig ersetzen**

```tsx
import { redirect } from 'next/navigation';
import { aktuelleSitzung } from '@/lib/session';
import {
  pflanzenFuerGarten,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
  zuletztGepflegtAm,
  pflegestimmungFuerPflanze,
  wuchsstufeFuerPflanze,
  ernteListeFuerNutzer,
  type Pflanze,
  type AktivitaetTyp,
} from '@/lib/db/abfragen';
import { faelligkeitsgruppe, beschreibeFaelligkeit, istHeute, ermutigungsSatz, type Faelligkeitsgruppe } from '@/lib/garten/faelligkeit';
import { ernteSymbol, istEssbar } from '@/lib/garten/symbole';
import { aktivitaetAction, ernteEintragenAction, ernteLoeschenAction } from '@/app/server-aktionen';
import { IconTropfen, IconBlatt, IconKorb, IconErledigt, IconX } from '@/components/Symbole';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { Seitentitel, Abschnittstitel } from '@/components/bausatz/Titel';
import { Karte, Leerzustand } from '@/components/bausatz/Karte';
import { Kaestchen } from '@/components/bausatz/Kaestchen';
import { Knopf } from '@/components/bausatz/Knopf';
import { KnopfLink } from '@/components/bausatz/KnopfLink';
import { Feld, Eingabe, Auswahl } from '@/components/bausatz/Feld';

interface PlanZeile {
  pflanze: Pflanze;
  faelligAm: Date;
  gruppe: Faelligkeitsgruppe;
  heuteErledigt: boolean;
}

function planZeilen(pflanzen: Pflanze[], typ: 'giessen' | 'duengen', heute: Date): PlanZeile[] {
  const zeilen: PlanZeile[] = [];
  for (const pflanze of pflanzen) {
    const faelligAm = typ === 'giessen' ? naechsteFaelligkeitGiessen(pflanze) : naechsteFaelligkeitDuengen(pflanze);
    if (faelligAm === null) continue; // kein Düngeplan
    zeilen.push({
      pflanze,
      faelligAm,
      gruppe: faelligkeitsgruppe(faelligAm, heute),
      heuteErledigt: istHeute(zuletztGepflegtAm(pflanze, typ), heute),
    });
  }
  return zeilen;
}

function Zeile({ zeile, typ, heute, zusatz }: { zeile: PlanZeile; typ: AktivitaetTyp; heute: Date; zusatz?: string | null }) {
  const { pflanze, heuteErledigt } = zeile;
  const status = heuteErledigt ? 'heute schon erledigt' : beschreibeFaelligkeit(zeile.faelligAm, heute);
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border border-kante bg-papier-hell py-1.5 pl-2 pr-1.5 shadow-karte ${
        heuteErledigt ? 'opacity-60' : ''
      }`}
    >
      <div className="h-12 w-8 shrink-0">
        <TopfMitGesicht
          id={pflanze.id}
          wuchsstufe={wuchsstufeFuerPflanze(pflanze)}
          stimmung={pflegestimmungFuerPflanze(pflanze)}
          name={pflanze.name}
          art={pflanze.art}
          darstellung={pflanze.darstellung}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{pflanze.name}</p>
        <p className="truncate text-xs text-tinte-gedaempft">
          {status}
          {zusatz ? ` · ${zusatz}` : ''}
        </p>
      </div>
      <form action={aktivitaetAction}>
        <input type="hidden" name="pflanzeId" value={pflanze.id} />
        <input type="hidden" name="typ" value={typ} />
        <Kaestchen label={`${pflanze.name}: ${typ === 'giessen' ? 'Gießen' : 'Düngen'} erledigt`} erledigt={heuteErledigt} />
      </form>
    </li>
  );
}

function Gruppe({ titel, zeilen, typ, heute, zusatz }: { titel: string; zeilen: PlanZeile[]; typ: AktivitaetTyp; heute: Date; zusatz?: (p: Pflanze) => string | null }) {
  return (
    <div>
      <p className="mb-1.5 ml-1 text-[10px] font-bold uppercase tracking-[0.12em] text-tinte-gedaempft">{titel}</p>
      {zeilen.length === 0 ? (
        <p className="ml-1 text-sm italic text-tinte-gedaempft">Nichts offen.</p>
      ) : (
        <ul className="space-y-1.5">
          {zeilen.map((z) => (
            <Zeile key={z.pflanze.id} zeile={z} typ={typ} heute={heute} zusatz={zusatz?.(z.pflanze)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Runde({
  titel,
  symbol,
  zeilen,
  typ,
  heute,
  zusatz,
}: {
  titel: string;
  symbol: React.ReactNode;
  zeilen: PlanZeile[];
  typ: AktivitaetTyp;
  heute: Date;
  zusatz?: (p: Pflanze) => string | null;
}) {
  const offenHeute = zeilen.filter((z) => z.gruppe === 'heute' && !z.heuteErledigt);
  const erledigtHeute = zeilen.filter((z) => z.heuteErledigt);
  const morgen = zeilen.filter((z) => z.gruppe === 'morgen' && !z.heuteErledigt);
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <Abschnittstitel className="mb-0!">
          {symbol} {titel}
        </Abschnittstitel>
        <span className="text-xs font-semibold text-tinte-gedaempft">{offenHeute.length} offen</span>
      </div>
      <div className="space-y-4">
        {/* Erledigte bleiben blass sichtbar unter den offenen — der Fortschritt bleibt sichtbar. */}
        <Gruppe titel="Heute" zeilen={[...offenHeute, ...erledigtHeute]} typ={typ} heute={heute} zusatz={zusatz} />
        <Gruppe titel="Morgen" zeilen={morgen} typ={typ} heute={heute} zusatz={zusatz} />
      </div>
    </section>
  );
}

export default async function AufgabenSeite() {
  const sitzung = await aktuelleSitzung();
  if (!sitzung) redirect('/start');
  const { nutzerId, gartenId } = sitzung;

  const pflanzen = pflanzenFuerGarten(gartenId, nutzerId).filter((p) => p.lebenszustand === 'lebend');
  const essbarePflanzen = pflanzen.filter((p) => istEssbar(p.art));

  const heute = new Date();
  const giessplan = planZeilen(pflanzen, 'giessen', heute);
  const duengeplan = planZeilen(pflanzen, 'duengen', heute);

  const alle = [...giessplan, ...duengeplan];
  const erledigt = alle.filter((z) => z.heuteErledigt).length;
  const offen = alle.filter((z) => z.gruppe === 'heute' && !z.heuteErledigt).length;
  const ermutigung = ermutigungsSatz(erledigt, offen);

  const heuteISO = heute.toISOString().slice(0, 10);
  const datumText = heute.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const ernten = ernteListeFuerNutzer(nutzerId);

  return (
    <div className="space-y-8 pb-6">
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tinte-gedaempft">{datumText}</p>
        <Seitentitel>
          Heute <em>dran</em>
        </Seitentitel>
        {ermutigung && (
          <div className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-moos-zart to-papier px-3.5 py-2.5 text-sm font-semibold text-moos-dunkel">
            <IconErledigt className="h-4 w-4" /> {ermutigung}
          </div>
        )}
      </header>

      {pflanzen.length === 0 ? (
        <Leerzustand
          text="Noch keine Pflanze da."
          aktion={
            <KnopfLink href="/hinzufuegen" variante="primaer">
              Erste Pflanze anlegen
            </KnopfLink>
          }
        />
      ) : (
        <>
          <Runde titel="Gießen" symbol={<IconTropfen className="h-4 w-4 text-wasser-kraeftig" />} zeilen={giessplan} typ="giessen" heute={heute} />
          <Runde
            titel="Düngen"
            symbol={<IconBlatt className="h-4 w-4 text-moos-hell" />}
            zeilen={duengeplan}
            typ="duengen"
            heute={heute}
            zusatz={(p) => p.duengerTyp}
          />
        </>
      )}

      <section>
        <Abschnittstitel>
          <IconKorb className="h-4 w-4" /> Erntetagebuch
        </Abschnittstitel>

        {essbarePflanzen.length === 0 ? (
          <p className="text-sm text-tinte-gedaempft">Noch keine essbare Pflanze da.</p>
        ) : (
          <Karte className="mb-4 p-4">
            <form action={ernteEintragenAction} className="space-y-3">
              <input type="hidden" name="zurueck" value="/aufgaben" />
              <Feld label="Pflanze">
                <Auswahl name="pflanzeId" required>
                  {essbarePflanzen.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Auswahl>
              </Feld>
              <div className="grid grid-cols-2 gap-3">
                <Feld label="Datum">
                  <Eingabe type="date" name="datum" defaultValue={heuteISO} />
                </Feld>
                <Feld label="Menge">
                  <Eingabe name="menge" placeholder="z. B. 500 g, 6 Stück" />
                </Feld>
              </div>
              <Feld label="Notiz">
                <Eingabe name="notiz" placeholder="Wie war's?" />
              </Feld>
              <Knopf type="submit" variante="primaer" className="w-full">
                Eintragen
              </Knopf>
            </form>
          </Karte>
        )}

        {ernten.length === 0 ? (
          <p className="text-sm text-tinte-gedaempft">Noch nichts geerntet.</p>
        ) : (
          <ul className="space-y-1.5">
            {ernten.map((e) => {
              const datum = new Date(e.datum).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' });
              return (
                <li key={e.id} className="flex items-start justify-between gap-3 rounded-2xl border border-kante bg-papier-hell px-3 py-2.5 shadow-karte">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="text-lg leading-6">{ernteSymbol(e.pflanzeName, e.pflanzeArt)}</span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{e.pflanzeName}</span>
                        {e.menge && <span className="ml-1.5 font-semibold text-moos">{e.menge}</span>}
                        <span className="ml-1.5 text-xs text-tinte-gedaempft">{datum}</span>
                      </p>
                      {e.notiz && <p className="mt-0.5 text-sm italic text-tinte-gedaempft">{e.notiz}</p>}
                    </div>
                  </div>
                  <form action={ernteLoeschenAction}>
                    <input type="hidden" name="aktivitaetId" value={e.id} />
                    <Knopf type="submit" variante="text" aria-label="Eintrag löschen" className="h-9 w-9 shrink-0 px-0!">
                      <IconX className="h-4 w-4" />
                    </Knopf>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Im Browser prüfen**

`http://localhost:3010/aufgaben`: Datumszeile, „Heute *dran*". Gießen/Düngen mit Zeilen (kleiner Topf, Name, „seit N Tagen überfällig"/„heute fällig", Kästchen). Ein Kästchen antippen → Spinner, danach rutscht die Zeile blass mit gefülltem Kästchen ans Ende von „Heute", Ermutigungszeile erscheint („1 von N heute erledigt — weiter so!"). Erntetagebuch-Formular in Karte, Liste darunter. Tippfläche des Kästchens: per `javascript_tool` `document.querySelector('button[aria-label$="erledigt"]').getBoundingClientRect().height` ≥ 44.

- [ ] **Step 3: Commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add app/aufgaben/page.tsx
git commit -m "Aufgaben: Heute dran mit Ermutigung, Zeilen mit Topf und Überfällig-Text, Kästchen mit Wartezustand

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Formulare — Ernte eintragen, Neu anlegen, Start

**Files:**
- Modify: `app/pflanze/[id]/ernte/page.tsx` (komplett)
- Modify: `app/pflanze/neu/page.tsx` (komplett)
- Modify: `app/start/page.tsx` (komplett)

- [ ] **Step 1: `app/pflanze/[id]/ernte/page.tsx` vollständig ersetzen**

```tsx
import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/session';
import { pflanzeMitId } from '@/lib/db/abfragen';
import { ernteEintragenAction } from '@/app/server-aktionen';
import { IconKorb } from '@/components/Symbole';
import { Seitentitel, ZurueckChip } from '@/components/bausatz/Titel';
import { Karte } from '@/components/bausatz/Karte';
import { Feld, Eingabe, Textbereich } from '@/components/bausatz/Feld';
import { Knopf } from '@/components/bausatz/Knopf';

export default async function ErnteEintragen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzerId = await aktuellerNutzer();
  if (!nutzerId) redirect('/start');

  const pflanze = pflanzeMitId(id, nutzerId);
  const heute = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-6">
      <ZurueckChip href={`/pflanze/${pflanze.id}`}>{pflanze.name}</ZurueckChip>

      <header className="space-y-1">
        <Seitentitel>
          Ernte <em>eintragen</em>
        </Seitentitel>
        <p className="flex items-center gap-1.5 text-sm text-tinte-gedaempft">
          <IconKorb className="h-4 w-4" /> {pflanze.name}
        </p>
      </header>

      <Karte className="p-4">
        <form action={ernteEintragenAction} className="space-y-4">
          <input type="hidden" name="pflanzeId" value={pflanze.id} />
          <Feld label="Datum">
            <Eingabe type="date" name="datum" defaultValue={heute} />
          </Feld>
          <Feld label="Menge" hinweis="Frei formuliert, zum Beispiel 500 g oder 6 Stück">
            <Eingabe name="menge" placeholder="z. B. 500 g, 6 Stück" />
          </Feld>
          <Feld label="Notiz">
            <Textbereich name="notiz" rows={3} placeholder="Wie war's?" />
          </Feld>
          <Knopf type="submit" variante="primaer" className="w-full">
            Eintragen
          </Knopf>
        </form>
      </Karte>
    </div>
  );
}
```

- [ ] **Step 2: `app/pflanze/neu/page.tsx` vollständig ersetzen**

```tsx
import { pflanzeAnlegenAction } from '@/app/server-aktionen';
import { Seitentitel, ZurueckChip, Abschnittstitel } from '@/components/bausatz/Titel';
import { Karte } from '@/components/bausatz/Karte';
import { Feld, Eingabe, Textbereich } from '@/components/bausatz/Feld';
import { Umschalter } from '@/components/bausatz/Umschalter';
import { Knopf } from '@/components/bausatz/Knopf';

export default function NeuePflanze() {
  return (
    <div className="space-y-6 pb-6">
      <ZurueckChip href="/hinzufuegen" />

      <Seitentitel>
        Pflanze von Hand <em>anlegen</em>
      </Seitentitel>

      <form action={pflanzeAnlegenAction} className="space-y-6">
        <Karte className="space-y-4 p-4">
          <Feld label="Name *">
            <Eingabe name="name" required placeholder="z. B. Tomate Sunny" />
          </Feld>
          <Feld label="Art">
            <Eingabe name="art" placeholder="z. B. Cocktailtomate" />
          </Feld>
          <Umschalter
            name="drinnenDraussen"
            legende="Standort"
            vorgabe="drinnen"
            optionen={[
              { wert: 'drinnen', label: 'Drinnen' },
              { wert: 'draussen', label: 'Draußen' },
            ]}
          />
        </Karte>

        <section>
          <Abschnittstitel>Pflege</Abschnittstitel>
          <Karte className="space-y-4 p-4">
            <Feld label="Erde">
              <Eingabe name="erde" />
            </Feld>
            <Feld label="Licht">
              <Eingabe name="licht" />
            </Feld>
            <div className="grid grid-cols-2 gap-3">
              <Feld label="Gießen alle … Tage">
                <Eingabe type="number" name="giessIntervallTage" min={1} defaultValue={7} inputMode="numeric" />
              </Feld>
              <Feld label="Düngen alle … Tage" hinweis="leer = kein Düngeplan">
                <Eingabe type="number" name="duengerIntervallTage" min={1} inputMode="numeric" />
              </Feld>
            </div>
            <Feld label="Dünger">
              <Eingabe name="duengerTyp" placeholder="z. B. Tomatendünger" />
            </Feld>
            <Feld label="Notiz">
              <Textbereich name="notiz" rows={3} />
            </Feld>
          </Karte>
        </section>

        <Knopf type="submit" variante="primaer" className="w-full">
          Pflanze anlegen
        </Knopf>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: `app/start/page.tsx` vollständig ersetzen**

```tsx
import { nutzerListe, gaertenFuerNutzer } from '@/lib/db/abfragen';
import { aktiveNutzerId, aktiveGartenId } from '@/lib/session';
import { nutzerAnlegenAction, nutzerWaehlenAction, gartenAnlegenAction, gartenWaehlenAction } from '@/app/server-aktionen';
import { Seitentitel, Abschnittstitel } from '@/components/bausatz/Titel';
import { Knopf } from '@/components/bausatz/Knopf';
import { KnopfLink } from '@/components/bausatz/KnopfLink';
import { Eingabe } from '@/components/bausatz/Feld';

export default async function StartSeite() {
  const nutzer = nutzerListe();
  const nutzerIdAusCookie = await aktiveNutzerId();
  const gartenIdAusCookie = await aktiveGartenId();
  const aktiverNutzer = nutzer.some((n) => n.id === nutzerIdAusCookie) ? nutzerIdAusCookie : null;
  const gaerten = aktiverNutzer ? gaertenFuerNutzer(aktiverNutzer) : [];
  const aktiverGarten = gaerten.some((g) => g.id === gartenIdAusCookie) ? gartenIdAusCookie : null;

  // Gewählter Eintrag: moosgrüner Rand und zarter Grünton, alles andere Papier.
  const auswahlKlassen = (gewaehlt: boolean) =>
    `w-full justify-start! ${gewaehlt ? 'border-moos bg-moos-zart text-moos-dunkel' : ''}`;

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-1">
        <Seitentitel>
          keep-<em>growing</em>
        </Seitentitel>
        <p className="text-sm text-tinte-gedaempft">Töpfe mit Gesichtern, die zeigen, wie es ihnen geht.</p>
      </header>

      <section>
        <Abschnittstitel>Wer bist du?</Abschnittstitel>
        {nutzer.length === 0 && <p className="text-sm text-tinte-gedaempft">Noch niemand angelegt.</p>}
        <ul className="space-y-2">
          {nutzer.map((n) => (
            <li key={n.id}>
              <form action={nutzerWaehlenAction}>
                <input type="hidden" name="nutzerId" value={n.id} />
                <Knopf type="submit" variante="sekundaer" aria-pressed={aktiverNutzer === n.id} className={auswahlKlassen(aktiverNutzer === n.id)}>
                  {n.name}
                </Knopf>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Abschnittstitel>Neu hier?</Abschnittstitel>
        <form action={nutzerAnlegenAction} className="flex gap-2">
          <Eingabe name="name" required placeholder="Dein Name" aria-label="Dein Name" />
          <Knopf type="submit" variante="primaer" className="shrink-0">
            Loslegen
          </Knopf>
        </form>
      </section>

      {aktiverNutzer && gaerten.length > 0 && (
        <section>
          <Abschnittstitel>Welcher Garten?</Abschnittstitel>
          <ul className="space-y-2">
            {gaerten.map((g) => (
              <li key={g.id}>
                <form action={gartenWaehlenAction}>
                  <input type="hidden" name="gartenId" value={g.id} />
                  <Knopf type="submit" variante="sekundaer" aria-pressed={aktiverGarten === g.id} className={auswahlKlassen(aktiverGarten === g.id)}>
                    {g.name}
                  </Knopf>
                </form>
              </li>
            ))}
          </ul>
          <form action={gartenAnlegenAction} className="mt-2 flex gap-2">
            <Eingabe name="name" required placeholder="Neuer Garten" aria-label="Name des neuen Gartens" />
            <Knopf type="submit" variante="sekundaer" className="shrink-0">
              Anlegen
            </Knopf>
          </form>
        </section>
      )}

      {aktiverNutzer && aktiverGarten && (
        <KnopfLink href="/" variante="primaer" className="w-full">
          Weiter zu meinem Garten
        </KnopfLink>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Im Browser prüfen**

`/start`: „keep-*growing*", Nutzer als Papierknöpfe, gewählter grün umrandet. `/pflanze/neu`: zwei Karten, Umschalter Drinnen/Draußen (Klick wechselt sichtbar, Tab + Pfeiltaste ebenso). `/pflanze/<id>/ernte`: Karte mit drei Feldern, „Eintragen" zeigt beim Absenden den Spinner, danach Rücksprung zur Pflanze mit Ernte im Verlauf und roten Wangen am Topf.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit && npm run lint
git add "app/pflanze/[id]/ernte/page.tsx" app/pflanze/neu/page.tsx app/start/page.tsx
git commit -m "Formulare aus dem Bausatz: Ernte eintragen, Pflanze von Hand anlegen, Start

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Max' Kamera-Seite — nur die optische Schicht

**Files:**
- Modify: `app/hinzufuegen/page.tsx` (komplett)
- Modify: `components/KameraHinzufuegen.tsx` (nur Zeilen 1–6 Imports und 160–273 JSX; **Logik oben unverändert**)

- [ ] **Step 1: `app/hinzufuegen/page.tsx` vollständig ersetzen**

```tsx
import { KameraHinzufuegen } from '@/components/KameraHinzufuegen';
import { Seitentitel } from '@/components/bausatz/Titel';

export default function HinzufuegenSeite() {
  return (
    <div className="space-y-4 pb-6">
      <Seitentitel>
        Neue <em>Pflanze</em>
      </Seitentitel>
      <KameraHinzufuegen />
    </div>
  );
}
```

- [ ] **Step 2: Imports in `components/KameraHinzufuegen.tsx` erweitern** (Zeilen 3–6)

```tsx
import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { FotoVorschlag } from '@/lib/erkennung/typ';
import { Knopf } from '@/components/bausatz/Knopf';
import { KnopfLink } from '@/components/bausatz/KnopfLink';
import { Fehlerkasten } from '@/components/bausatz/Karte';
import { IconBlitz, IconKamera } from '@/components/Symbole';
```

(`import Link from 'next/link'` entfällt — `KnopfLink` übernimmt.)

- [ ] **Step 3: Das `return (…)` ab Zeile 160 vollständig ersetzen** — Zustände, Handler und Ablauf bleiben exakt wie sie sind.

```tsx
  return (
    <div className="space-y-3">
      {/* Fehlermeldung bei nicht erkannter Pflanze oder API-Fehler */}
      {erkennungsFehler && (
        <Fehlerkasten
          titel={erkennungsFehler}
          aktionen={
            <>
              <Knopf variante="sekundaer" onClick={() => setErkennungsFehler(null)}>
                Neues Foto versuchen
              </Knopf>
              <KnopfLink
                variante="primaer"
                href={`/hinzufuegen/schritt-2${letztesFotoUrl ? `?fotoUrl=${encodeURIComponent(letztesFotoUrl)}` : ''}`}
              >
                Manuell fortfahren
              </KnopfLink>
            </>
          }
        />
      )}

      {/* Navigation oben: Manuell eintragen oder Datei wählen */}
      <div className="grid grid-cols-2 gap-2">
        <KnopfLink href="/hinzufuegen/schritt-2" variante="sekundaer">
          Manuell eintragen
        </KnopfLink>
        <Knopf variante="sekundaer" disabled={analysiert} onClick={() => dateiInputRef.current?.click()}>
          Datei hinzufügen
        </Knopf>
      </div>

      {/* Sucher-Fenster */}
      <div
        className="relative overflow-hidden rounded-[1.75rem] border-4 border-papier-hell bg-tinte shadow-schweben"
        style={{ height: '58vh' }}
      >
        {kameraFehler ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-kante">
            <IconKamera className="h-10 w-10" />
            <p className="text-sm">{kameraFehler}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        )}

        {/* Sucher-Ecken */}
        {!kameraFehler && !analysiert && (
          <div className="pointer-events-none absolute inset-6">
            {[
              'left-0 top-0 border-l-2 border-t-2 rounded-tl-xl',
              'right-0 top-0 border-r-2 border-t-2 rounded-tr-xl',
              'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl',
              'right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl',
            ].map((klassen) => (
              <span key={klassen} className={`absolute h-10 w-10 border-papier-hell/80 ${klassen}`} />
            ))}
          </div>
        )}

        {/* Blitz oben links */}
        {blitzMoeglich && !kameraFehler && !analysiert && (
          <button
            type="button"
            onClick={blitzUmschalten}
            aria-label={blitzAn ? 'Blitz ausschalten' : 'Blitz einschalten'}
            aria-pressed={blitzAn}
            className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur ${
              blitzAn ? 'bg-sonne text-tinte' : 'bg-black/40 text-papier-hell'
            }`}
          >
            <IconBlitz className="h-5 w-5" />
          </button>
        )}

        {/* Overlay während der Analyse */}
        {analysiert && (
          <div
            role="status"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 px-6 text-center text-papier-hell backdrop-blur-sm"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-transparent" />
            <p className="font-semibold">Pflanze wird analysiert…</p>
            <p className="text-xs text-kante">Art und Pflegeparameter werden ermittelt</p>
          </div>
        )}
      </div>

      {/* Runder Auslöser darunter, mittig */}
      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={aufnehmen}
          disabled={!bereit || analysiert}
          aria-label="Foto aufnehmen"
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-kante bg-papier-hell shadow-schweben transition active:scale-95 disabled:opacity-40"
        >
          <span className="h-11 w-11 rounded-full bg-moos" />
        </button>
      </div>

      {/* Verstecktes File-Input */}
      <input
        ref={dateiInputRef}
        type="file"
        name="foto"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => dateiAuswaehlen(e.target.files?.[0] ?? null)}
      />
    </div>
  );
```

- [ ] **Step 4: Im Browser prüfen**

`/hinzufuegen`: Titel „Neue *Pflanze*", zwei Papierknöpfe nebeneinander, Sucher mit hellem Rahmen (am Rechner ohne Kamera: Kamerasymbol + Satz statt Video), Auslöser weiß mit Moos-Kern. „Datei hinzufügen" öffnet den Dateidialog (nur Dialog prüfen, nicht hochladen). Kein seitliches Scrollen bei 375 px.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit && npm run lint
git add app/hinzufuegen/page.tsx components/KameraHinzufuegen.tsx
git commit -m "Kamera-Seite: Bausatz-Knöpfe und Fehlerkasten, Sucher im Papierrahmen — Ablauf unverändert

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Max' Profil-Schritt 2 — nur die optische Schicht

**Files:**
- Modify: `components/ProfilSchritt2Form.tsx` (Imports Zeilen 3–8 und JSX ab Zeile 116; **Zustände, Handler, Namen der Formularfelder unverändert**)

- [ ] **Step 1: Imports erweitern** (nach Zeile 8 einfügen)

```tsx
import { Knopf } from '@/components/bausatz/Knopf';
import { Feld, Eingabe, Textbereich } from '@/components/bausatz/Feld';
import { IconNeu } from '@/components/Symbole';
```

- [ ] **Step 2: Das `return (…)` ab Zeile 116 vollständig ersetzen**

```tsx
  return (
    <div className="space-y-6 pb-10">
      {/* 3.a Titel */}
      <h1 className="text-center font-anzeige text-3xl font-medium leading-none tracking-tight text-moos-dunkel">
        Einstellung des Profils
      </h1>

      {/* 3.b Vorschau-Bereich: Profil-Bilderrahmen zentriert */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-3">
          {/* Linker Pfeil */}
          <Knopf
            variante="sekundaer"
            onClick={vorherigerHintergrund}
            aria-label="Vorheriger Hintergrund (Ich bleibe lieber drinnen / Ich bleibe lieber draußen)"
            title="Hintergrund wechseln"
            className="h-11 w-11 px-0!"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Knopf>

          {/* Profil-Bilderrahmen (h-44 w-44) */}
          <div
            className="relative h-44 w-44 select-none overflow-hidden rounded-3xl border-4 border-papier-hell shadow-schweben"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Gleitende Hintergrund-Ebene mit weicher Wisch-Animation */}
            <div
              className="absolute inset-0 flex h-full w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
              style={{ transform: `translateX(-${hintergrundIndex * 100}%)` }}
            >
              <div className="h-full w-full shrink-0">
                <LittleHomeBackground />
              </div>
              <div className="h-full w-full shrink-0">
                <LittleGardenBackground />
              </div>
            </div>

            {/* Vordergrund: TopfMitGesicht sitzt stabil auf dem Boden */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
              <TopfMitGesicht id="vorschau" wuchsstufe={2} stimmung="zufrieden" name={art || 'Pflanze'} art={art} />
            </div>
          </div>

          {/* Rechter Pfeil */}
          <Knopf
            variante="sekundaer"
            onClick={naechsterHintergrund}
            aria-label="Nächster Hintergrund (Ich bleibe lieber drinnen / Ich bleibe lieber draußen)"
            title="Hintergrund wechseln"
            className="h-11 w-11 px-0!"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Knopf>
        </div>

        {/* Dezente Umschaltanzeige */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
              hintergrundIndex === 0 ? 'w-4 bg-moos' : 'w-1.5 bg-kante-dunkel'
            }`}
          />
          <span
            className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
              hintergrundIndex === 1 ? 'w-4 bg-moos' : 'w-1.5 bg-kante-dunkel'
            }`}
          />
          <span className="ml-1 text-[11px] font-semibold text-tinte-gedaempft">
            {hintergrundIndex === 0 ? 'Ich bleibe lieber drinnen' : 'Ich bleibe lieber draußen'}
          </span>
        </div>
      </div>

      {/* 3.c Felder prüfen und editieren (nur der Endzustand wird gespeichert) */}
      <form action={profilSchritt2AnlegenAction} className="space-y-4">
        {fotoUrl ? <input type="hidden" name="fotoUrl" value={fotoUrl} /> : null}
        {/* Ort und Licht werden visuell gesteuert und per Hidden-Input übermittelt */}
        <input type="hidden" name="ort" value={hintergrundIndex === 1 ? 'draußen' : 'Drinnen'} />
        <input type="hidden" name="licht" value={licht} />

        {/* c.1: Name (Pflichtfeld mit Ghost-Text "Meine Schatzi", immer initial leer) mit Licht-Symbol rechts */}
        <Feld label="Name *">
          <div className="flex gap-2">
            <Eingabe
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meine Schatzi"
            />
            <button
              type="button"
              onClick={naechstesLicht}
              title={`Lichtbedarf: ${licht}`}
              aria-label={`Lichtbedarf: ${licht}`}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-moos-dunkel transition hover:opacity-80 active:scale-95"
            >
              <LichtSymbol licht={licht} className="h-9 w-9" />
            </button>
          </div>
        </Feld>

        {/* c.2: Art (Pflichtfeld) mit Reload-Button daneben */}
        <Feld label="Art *" fehler={detailsFehler}>
          <div className="flex gap-2">
            <Eingabe
              type="text"
              name="art"
              required
              value={art}
              onChange={(e) => setArt(e.target.value)}
              placeholder="z. B. Monstera deliciosa"
            />
            <Knopf
              variante="primaer"
              onClick={artDetailsNeuLaden}
              disabled={!istArtVeraendert || laedtDetails}
              wartend={laedtDetails}
              title={istArtVeraendert ? 'Pflegedaten für diese Art neu abfragen' : 'Art ändern, um neue Daten abzurufen'}
              aria-label="Pflegedaten neu laden"
              className="h-12 w-12 shrink-0 rounded-2xl px-0!"
            >
              {!laedtDetails && <IconNeu className="h-5 w-5" />}
            </Knopf>
          </div>
        </Feld>

        {/* c.3 & c.4: Gießrhythmus und Düngrhythmus in einer Zeile nebeneinander */}
        <div className="grid grid-cols-2 gap-3">
          <Feld label="Gießrhythmus">
            <div className="relative">
              <Eingabe
                type="number"
                min={1}
                name="giessrhythmus"
                value={giessrhythmus}
                onChange={(e) => setGiessrhythmus(e.target.value)}
                placeholder="7"
                inputMode="numeric"
                className="pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-tinte-gedaempft">Tagen</span>
            </div>
          </Feld>

          <Feld label="Düngrhythmus">
            <div className="relative">
              <Eingabe
                type="number"
                min={1}
                name="duengenrhythmus"
                value={duengenrhythmus}
                onChange={(e) => setDuengenrhythmus(e.target.value)}
                placeholder="28"
                inputMode="numeric"
                className="pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-tinte-gedaempft">Tagen</span>
            </div>
          </Feld>
        </div>

        {/* c.5: Erde (Erdmischung) */}
        <Feld label="Erde (Erdmischung)">
          <Eingabe type="text" name="erde" value={erde} onChange={(e) => setErde(e.target.value)} />
        </Feld>

        {/* c.8: Notiz (immer initial leer, nur durch den Nutzer editierbar) */}
        <Feld label="Notiz">
          <Textbereich name="notiz" rows={3} value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="Freie Notiz..." />
        </Feld>

        {/* Am Ende steht: Das Profil anlegen */}
        <div className="pt-2">
          <Knopf type="submit" variante="primaer" className="w-full">
            Das Profil anlegen
          </Knopf>
        </div>
      </form>
    </div>
  );
```

- [ ] **Step 3: Sicherstellen, dass keine Logik verloren ging**

Run: `git diff --stat components/ProfilSchritt2Form.tsx` und `git diff components/ProfilSchritt2Form.tsx | grep '^-' | grep -E 'useState|function |setArt\(|artDetailsAction|handleTouch|ortZuHintergrundIndex'`
Erwartet: zweiter Befehl liefert **keine** Zeilen (keine Handler/Zustände entfernt). Alle `name="…"`-Attribute (`name`, `art`, `giessrhythmus`, `duengenrhythmus`, `erde`, `notiz`, `ort`, `licht`, `fotoUrl`) sind weiterhin vorhanden: `grep -c 'name="' components/ProfilSchritt2Form.tsx` ≥ 9.

- [ ] **Step 4: Im Browser prüfen**

`/hinzufuegen/schritt-2?art=Monstera%20deliciosa&giessrhythmus=7&duengenrhythmus=28&erde=Blumenerde&licht=Sonne%20oder%20Schatten&ort=Drinnen`: Rahmen mit Topf, Pfeile als runde Papierknöpfe wechseln den Hintergrund, Felder im Bausatz-Stil, „Tagen" steht rechts in den Zahlfeldern. Art ändern → Nachlade-Knopf wird aktiv; antippen → Spinner im Knopf (der Aufruf kann ohne Netz scheitern → Fehlertext rot unter dem Feld, das ist korrekt). Name eingeben, „Das Profil anlegen" → Spinner, dann Pflanzenseite.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit && npm run lint && npm test
git add components/ProfilSchritt2Form.tsx
git commit -m "Profil-Schritt 2: Felder und Knöpfe aus dem Bausatz — Max' Logik und Feldnamen unverändert

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: Fehlerseite

**Files:**
- Modify: `app/error.tsx` (komplett)

- [ ] **Step 1: `app/error.tsx` vollständig ersetzen**

```tsx
'use client';

import { Fehlerkasten } from '@/components/bausatz/Karte';
import { Knopf } from '@/components/bausatz/Knopf';

export default function Fehler({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mt-10">
      <Fehlerkasten
        text={error.message}
        aktionen={
          <Knopf variante="sekundaer" onClick={reset}>
            Nochmal versuchen
          </Knopf>
        }
      />
    </div>
  );
}
```

- [ ] **Step 2: Im Browser prüfen**

`http://localhost:3010/pflanze/gibt-es-nicht` aufrufen → Fehlerkasten „Etwas ist schiefgegangen." mit Meldung „Kein Zugriff auf fremde Daten." und Knopf. (Das ist die sichtbare Mandanten-Blockade aus `REGELN.md`, Abschnitt 5 — sie muss weiterhin sichtbar sein, kein leerer Bildschirm.)

- [ ] **Step 3: Commit**

```bash
npx tsc --noEmit && npm run lint
git add app/error.tsx
git commit -m "Fehlerseite im Bausatz-Stil

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: Gesamtprüfung (Spec, Abschnitt 8)

**Files:** keine neuen; bei Befunden die jeweilige Datei.

- [ ] **Step 1: Alle vier Prüfbefehle**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Erwartet: alle grün; `build` ohne Warnung zu Schriften. Nach dem Build den Dev-Server weiterlaufen lassen (er nutzt `.next/dev`, der Build `.next` — kein Konflikt).

- [ ] **Step 2: Drei Breiten je Seite**

Für jede Seite (`/`, `/aufgaben`, `/pflanze/<id>`, `/pflanze/<id>/ernte`, `/pflanze/neu`, `/hinzufuegen`, `/hinzufuegen/schritt-2`, `/start`) mit `resize_window` 375 × 812, 768 × 1024, dann `desktop` (1440):

```js
({ breite: window.innerWidth, ueberlauf: document.documentElement.scrollWidth > window.innerWidth })
```

Erwartet: `ueberlauf: false` überall. Screenshot je Seite bei 375 px zur Abnahme. Untere Leiste verdeckt keinen Knopf: auf `/pflanze/<id>` bis ganz unten scrollen — „Als verstorben markieren" ist vollständig sichtbar.

- [ ] **Step 3: Tastatur**

Auf `/aufgaben` mit `computer key Tab` durchgehen: Reihenfolge Leiste → Ermutigung/… → Kästchen von oben nach unten; jeder Fokus hat den Moosring (Screenshot bei fokussiertem Kästchen). Auf `/pflanze/neu`: mit Tab zum Umschalter, Pfeiltaste wechselt Drinnen/Draußen sichtbar.

- [ ] **Step 4: Kontrast messen**

Per `javascript_tool` die Paare aus Spec Abschnitt 6 rechnen:

```js
const lum = (hex) => { const [r,g,b] = hex.match(/\w\w/g).map(h => parseInt(h,16)/255).map(c => c <= 0.03928 ? c/12.92 : ((c+0.055)/1.055)**2.4); return 0.2126*r+0.7152*g+0.0722*b; };
const k = (a,b) => { const [h,l] = [lum(a),lum(b)].sort((x,y)=>y-x); return ((h+0.05)/(l+0.05)).toFixed(2); };
({ tinteAufPapier: k('#2f2a22','#f5eddc'), gedaempftAufPapier: k('#6b5e45','#f5eddc'), gedaempftAufPapierHell: k('#6b5e45','#fffdf7'), papierHellAufMoos: k('#fffdf7','#3f6b3a'), tinteAufWasser: k('#2f2a22','#bfe3f7'), tinteAufMint: k('#2f2a22','#cdeccb'), tinteAufSonne: k('#2f2a22','#ffe58a'), gefahrAufZart: k('#b3402e','#f9e6e1') })
```

Erwartet: jeder Wert ≥ 4.5. Fällt einer darunter, den Token in `app/globals.css` nachdunkeln und erneut messen.

- [ ] **Step 5: Zustände auslösen**

- Wartend: auf `/aufgaben` ein Kästchen antippen und sofort Screenshot → Spinner sichtbar.
- Fehler: Dev-Server kurz mit `Ctrl+C` stoppen, im Browser „Gießen" antippen → Next zeigt Netzwerkfehler in der Fehlerseite; Server wieder starten (`npm run dev -- -p 3010`). Alternativ: `/pflanze/gibt-es-nicht` (Fehlerkasten).
- Leerzustände: auf `/start` neuen Nutzer „Test" anlegen → `/` zeigt leeres Brett mit „Erste Pflanze anlegen", `/aufgaben` ebenso. Danach wieder Anne wählen.
- Rückfrage: auf einer Pflanzenseite „Als verstorben markieren" → Rückfrage, „Abbrechen".

- [ ] **Step 6: Barrierefreiheit (axe)**

Im Browser-Bereich auf `/aufgaben` per `javascript_tool`:

```js
await new Promise((ok, nein) => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js'; s.onload = ok; s.onerror = nein; document.head.appendChild(s); });
const r = await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
r.violations.filter(v => ['serious','critical'].includes(v.impact)).map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length, ziel: v.nodes[0]?.target }))
```

Erwartet: leeres Array. Wiederholen für `/`, `/pflanze/<id>`, `/pflanze/neu`. Lädt das Skript nicht (Netz), das im Abschlussbericht **benennen**, nicht verschweigen.

- [ ] **Step 7: Aufräumen und Abschluss-Commit**

Run: `git status --short` — nur beabsichtigte Dateien. Unbenutzte Importe hat Lint schon gemeldet. `npx tsc --noEmit && npm run lint && npm test` ein letztes Mal.

```bash
git add -A app components lib
git commit -m "Gesamtprüfung Gestaltung Gartenregal: Breiten, Tastatur, Kontrast, Zustände

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

(Nur committen, wenn Step 7 tatsächlich Änderungen ergab; sonst entfällt der Commit.)

- [ ] **Step 8: Zwischenstand ans Team** — fertig / geprüft / offen, inklusive allem, was in Step 6 nicht messbar war. Nicht pushen, bis das Team es sagt.

---

## Selbstprüfung gegen die Spec

| Spec-Abschnitt | Task |
|---|---|
| 2 Home (Pille → Aufgaben, Regal, Vitrine, Erinnerung, kein Gruß, kein Nutzerwechsel, Leerzustand) | 6 |
| 2 Pflanzenseite (Schild, fälliger Knopf, keine Wuchsstufe, Steckbrief, Zeitstrahl, Rückfrage) | 7 |
| 2 Aufgaben (Datum, Ermutigung, Zeilen mit Topf/Text/Kästchen, blass erledigt, Erntetagebuch) | 8 |
| 2 Formulare (Bausteine, Umschalter, ein Hauptknopf; Max' Schritt 2 funktional unverändert) | 9, 10, 11 |
| 2 Untere Leiste | 5 |
| 3 Weg/Zusammen (Zurück-Chip überall) | 6–11 |
| 4 Bausatz | 3, 4 |
| 5 Bedienvertrag (wartend, Fokus, Kontrast, Bewegung, 44 px, nur hell) | 1, 3, 13 |
| 6 Farben und Schrift | 1 |
| 7 Nichts an Daten/Berechnung; einzige Ergänzung `zuletztGepflegtAm` (lesend) | 2 |
| 8 Prüfung | 13 |
