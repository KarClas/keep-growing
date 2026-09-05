import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berechnePflegestimmung, berechneWuchsstufe, MAX_WUCHSSTUFE } from './berechnung.ts';

const HEUTE = new Date('2026-09-05T12:00:00Z');
const tageVorHeute = (tage: number) => new Date(HEUTE.getTime() - tage * 24 * 60 * 60 * 1000);

test('Pflegestimmung: heute gegossen -> sehr_gluecklich, unabhängig vom Fälligkeitsstand', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: HEUTE,
    giessIntervallTage: 3,
    zuletztGeduengtAm: tageVorHeute(60),
    duengerIntervallTage: 14,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'sehr_gluecklich');
});

test('Pflegestimmung: heute gedüngt (nicht gegossen) -> auch sehr_gluecklich', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 3,
    zuletztGeduengtAm: HEUTE,
    duengerIntervallTage: 14,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'sehr_gluecklich');
});

test('Pflegestimmung: heute geerntet -> sehr_gluecklich_geerntet, auch wenn das Gießen überfällig ist', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(10),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: HEUTE,
  });
  assert.equal(stimmung, 'sehr_gluecklich_geerntet');
});

test('Pflegestimmung: heute gegossen UND geerntet -> Ernte gewinnt (mehr Freude als reines Gießen)', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: HEUTE,
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: HEUTE,
  });
  assert.equal(stimmung, 'sehr_gluecklich_geerntet');
});

test('Pflegestimmung: gestern geerntet zählt nicht mehr als "heute" -> fällt zurück auf die Fälligkeits-Leiter', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: tageVorHeute(1),
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Pflegestimmung: alles rechtzeitig gegossen und gedüngt, nicht heute -> zufrieden', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 3,
    zuletztGeduengtAm: tageVorHeute(2),
    duengerIntervallTage: 14,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Pflegestimmung: genau am Fälligkeitstag -> zufrieden, noch nicht überfällig', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(3),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Pflegestimmung: 1 Tag überfällig -> noch zufrieden (Ruhezustand)', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(4),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Pflegestimmung: 2 Tage überfällig -> traurig', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(5),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'traurig');
});

test('Pflegestimmung: 3 Tage überfällig -> verzweifelt', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(6),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'verzweifelt');
});

test('Pflegestimmung: 4 Tage überfällig -> wuetend', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(7),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'wuetend');
});

test('Pflegestimmung: sehr lange überfällig -> bleibt wuetend, wird nicht schlimmer', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(20),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'wuetend');
});

test('Pflegestimmung: seit Anlage nie gegossen, Frist längst abgelaufen -> wuetend', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(20),
    zuletztGegossenAm: null,
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'wuetend');
});

test('Pflegestimmung: gerade erst angelegt, noch nie gegossen -> zufrieden (Frist läuft erst)', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: HEUTE,
    zuletztGegossenAm: null,
    giessIntervallTage: 7,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Regression: frisch angelegt mit Düngeplan, kürzlich gegossen, noch nie gedüngt -> zufrieden', () => {
  // Bug gefunden beim manuellen Testen: "noch nie gedüngt" wurde wie
  // "unendlich überfällig" behandelt statt ab Anlage der Pflanze zu zählen.
  // zuletztGegossenAm bewusst nicht HEUTE, sonst würde der neue
  // Freude-Auslöser greifen statt der hier geprüfte Fälligkeits-Fall.
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: HEUTE,
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 7,
    zuletztGeduengtAm: null,
    duengerIntervallTage: 14,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Pflegestimmung: Gießen pünktlich, aber Düngen stark überfällig -> zählt trotzdem', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(90),
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 3,
    zuletztGeduengtAm: tageVorHeute(60),
    duengerIntervallTage: 14,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'wuetend');
});

test('Pflegestimmung: kein Düngeplan (null) darf nicht fälschlich als überfällig zählen', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
    zuletztGeerntetAm: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Wuchsstufe: noch nichts getan -> 0', () => {
  assert.equal(berechneWuchsstufe({ giessen: 0, duengen: 0, ernten: 0 }), 0);
});

test('Wuchsstufe: unter 5 Gießen bringt noch kein neues Blatt', () => {
  assert.equal(berechneWuchsstufe({ giessen: 4, duengen: 0, ernten: 0 }), 0);
});

test('Wuchsstufe: genau 5 Gießen -> eine Stufe', () => {
  assert.equal(berechneWuchsstufe({ giessen: 5, duengen: 0, ernten: 0 }), 1);
});

test('Wuchsstufe: Gießen und Düngen zählen getrennt, nicht gemeinsam gegen die 5er-Schwelle', () => {
  // 3 Gießen + 3 Düngen macht zusammen 6 Aktionen, aber keine der beiden
  // Sorten erreicht für sich allein 5 — also noch keine neue Stufe.
  assert.equal(berechneWuchsstufe({ giessen: 3, duengen: 3, ernten: 0 }), 0);
});

test('Wuchsstufe: 5 Gießen und 5 Düngen -> zwei Stufen', () => {
  assert.equal(berechneWuchsstufe({ giessen: 5, duengen: 5, ernten: 0 }), 2);
});

test('Wuchsstufe: eine Ernte zählt sofort, ohne 5er-Schwelle', () => {
  assert.equal(berechneWuchsstufe({ giessen: 0, duengen: 0, ernten: 1 }), 1);
});

test('Wuchsstufe: deckelt bei MAX_WUCHSSTUFE, auch bei viel mehr Aktionen', () => {
  assert.equal(berechneWuchsstufe({ giessen: 500, duengen: 500, ernten: 500 }), MAX_WUCHSSTUFE);
});

test('Wuchsstufe: negative Eingabe ist ein Programmfehler, keine stille 0', () => {
  assert.throws(() => berechneWuchsstufe({ giessen: -1, duengen: 0, ernten: 0 }));
});
