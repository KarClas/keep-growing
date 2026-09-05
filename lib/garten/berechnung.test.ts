import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berechnePflegestimmung, berechneWuchsstufe, MAX_WUCHSSTUFE } from './berechnung.ts';

const HEUTE = new Date('2026-09-05T12:00:00Z');
const tageVorHeute = (tage: number) => new Date(HEUTE.getTime() - tage * 24 * 60 * 60 * 1000);

test('Pflegestimmung: alles rechtzeitig gegossen und gedüngt -> zufrieden', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 3,
    zuletztGeduengtAm: tageVorHeute(2),
    duengerIntervallTage: 14,
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
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Pflegestimmung: 1-2 Tage überfällig -> neutral', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(5),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
  });
  assert.equal(stimmung, 'neutral');
});

test('Pflegestimmung: 3-5 Tage überfällig -> traurig', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(7),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
  });
  assert.equal(stimmung, 'traurig');
});

test('Pflegestimmung: mehr als 5 Tage überfällig -> sehr_traurig', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(20),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
  });
  assert.equal(stimmung, 'sehr_traurig');
});

test('Pflegestimmung: seit Anlage nie gegossen, Frist längst abgelaufen -> sehr_traurig', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(20),
    zuletztGegossenAm: null,
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
  });
  assert.equal(stimmung, 'sehr_traurig');
});

test('Pflegestimmung: gerade erst angelegt, noch nie gegossen -> zufrieden (Frist läuft erst)', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: HEUTE,
    zuletztGegossenAm: null,
    giessIntervallTage: 7,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Regression: frisch angelegt mit Düngeplan, gerade gegossen, noch nie gedüngt -> zufrieden', () => {
  // Bug gefunden beim manuellen Testen: "noch nie gedüngt" wurde wie
  // "unendlich überfällig" behandelt statt ab Anlage der Pflanze zu zählen.
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: HEUTE,
    zuletztGegossenAm: HEUTE,
    giessIntervallTage: 7,
    zuletztGeduengtAm: null,
    duengerIntervallTage: 14,
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
  });
  assert.equal(stimmung, 'sehr_traurig');
});

test('Pflegestimmung: kein Düngeplan (null) darf nicht fälschlich als überfällig zählen', () => {
  const stimmung = berechnePflegestimmung({
    heute: HEUTE,
    seitWannBeobachten: tageVorHeute(30),
    zuletztGegossenAm: tageVorHeute(1),
    giessIntervallTage: 3,
    zuletztGeduengtAm: null,
    duengerIntervallTage: null,
  });
  assert.equal(stimmung, 'zufrieden');
});

test('Wuchsstufe: steigt mit jeder Aktion, deckelt bei MAX_WUCHSSTUFE', () => {
  assert.equal(berechneWuchsstufe(0), 0);
  assert.equal(berechneWuchsstufe(1), 1);
  assert.equal(berechneWuchsstufe(MAX_WUCHSSTUFE), MAX_WUCHSSTUFE);
  assert.equal(berechneWuchsstufe(MAX_WUCHSSTUFE + 10), MAX_WUCHSSTUFE);
});

test('Wuchsstufe: negative Eingabe ist ein Programmfehler, keine stille 0', () => {
  assert.throws(() => berechneWuchsstufe(-1));
});
