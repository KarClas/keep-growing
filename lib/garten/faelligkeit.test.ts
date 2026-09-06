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
