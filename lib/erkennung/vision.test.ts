import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseErkennungsAntwort,
  erkenungsErgebnisAusAntwort,
  parseLichtAusgabe,
  parseOrtAusgabe,
  ortZuHintergrundIndex,
  parseTageZahl,
  feldWertBereinigen,
} from './vision.ts';

const GUTE_ANTWORT = JSON.stringify({
  erkannt: true,
  art: 'Rosa chinensis',
  gießrhythmus: 7,
  düngrhythmus: 14,
  erde: '50% Typ-1-Erde, 30% Typ-2-Erde, 20% Typ-3-Erde',
  licht: 'Sonne',
  ort: 'draußen',
  sicherheit: 'hoch',
});

test('sauberes JSON wird zum validierten FotoVorschlag', () => {
  const vorschlag = erkenungsErgebnisAusAntwort(GUTE_ANTWORT);
  assert.ok(vorschlag);
  assert.equal(vorschlag.art, 'Rosa chinensis');
  assert.equal(vorschlag.giessrhythmus, 7);
  assert.equal(vorschlag.duengenrhythmus, 14);
  assert.equal(vorschlag.erde, '50% Typ-1-Erde, 30% Typ-2-Erde, 20% Typ-3-Erde');
  assert.equal(vorschlag.licht, 'Sonne');
  assert.equal(vorschlag.ort, 'draußen');
  assert.equal(vorschlag.sicherheit, 'hoch');
});

test('parseLichtAusgabe liefert deterministisch 3 Optionen', () => {
  assert.equal(parseLichtAusgabe('sun'), 'Sonne');
  assert.equal(parseLichtAusgabe('Sonne'), 'Sonne');
  assert.equal(parseLichtAusgabe('shadow'), 'Schatten');
  assert.equal(parseLichtAusgabe('Schatten'), 'Schatten');
  assert.equal(parseLichtAusgabe('any'), 'Sonne oder Schatten');
  assert.equal(parseLichtAusgabe('both'), 'Sonne oder Schatten');
  assert.equal(parseLichtAusgabe('Sonne oder Schatten'), 'Sonne oder Schatten');
  assert.equal(parseLichtAusgabe('Sonne und Schatten'), 'Sonne oder Schatten');
  assert.equal(parseLichtAusgabe('N/A'), 'Sonne oder Schatten');
  assert.equal(parseLichtAusgabe(null), 'Sonne oder Schatten');
});

test('parseOrtAusgabe liefert deterministisch Drinnen, draußen oder Drinnen oder draußen', () => {
  assert.equal(parseOrtAusgabe('Drinnen'), 'Drinnen');
  assert.equal(parseOrtAusgabe('drinnen'), 'Drinnen');
  assert.equal(parseOrtAusgabe('indoor'), 'Drinnen');
  assert.equal(parseOrtAusgabe('draussen'), 'draußen');
  assert.equal(parseOrtAusgabe('draußen'), 'draußen');
  assert.equal(parseOrtAusgabe('outdoor'), 'draußen');
  assert.equal(parseOrtAusgabe('Drinnen or draussen'), 'Drinnen oder draußen');
  assert.equal(parseOrtAusgabe('drinnen oder draussen'), 'Drinnen oder draußen');
  assert.equal(parseOrtAusgabe('Drinnen oder draußen'), 'Drinnen oder draußen');
  assert.equal(parseOrtAusgabe('both'), 'Drinnen oder draußen');
  assert.equal(parseOrtAusgabe('any'), 'Drinnen oder draußen');
  assert.equal(parseOrtAusgabe('N/A'), 'Drinnen oder draußen');
  assert.equal(parseOrtAusgabe(null), 'Drinnen oder draußen');
});

test('ortZuHintergrundIndex bildet LLM-Ort auf Hintergrund ab: draußen -> 1, drinnen -> 0, Fallback -> 0', () => {
  // draußen -> 1 (Ich bleibe lieber draußen)
  assert.equal(ortZuHintergrundIndex('draußen'), 1);
  assert.equal(ortZuHintergrundIndex('draussen'), 1);
  assert.equal(ortZuHintergrundIndex('outdoor'), 1);
  assert.equal(ortZuHintergrundIndex('Garten'), 1);
  assert.equal(ortZuHintergrundIndex('Balkon'), 1);

  // drinnen -> 0 (Ich bleibe lieber drinnen)
  assert.equal(ortZuHintergrundIndex('Drinnen'), 0);
  assert.equal(ortZuHintergrundIndex('drinnen'), 0);
  assert.equal(ortZuHintergrundIndex('indoor'), 0);
  assert.equal(ortZuHintergrundIndex('inside'), 0);

  // Fallback -> 0 (Ich bleibe lieber drinnen)
  assert.equal(ortZuHintergrundIndex('Drinnen oder draußen'), 0);
  assert.equal(ortZuHintergrundIndex('drinnen oder draussen'), 0);
  assert.equal(ortZuHintergrundIndex('both'), 0);
  assert.equal(ortZuHintergrundIndex('any'), 0);
  assert.equal(ortZuHintergrundIndex('N/A'), 0);
  assert.equal(ortZuHintergrundIndex(''), 0);
  assert.equal(ortZuHintergrundIndex(null), 0);
  assert.equal(ortZuHintergrundIndex(undefined), 0);
});

test('parseTageZahl extrahiert Zahlen korrekt', () => {
  assert.equal(parseTageZahl(7), 7);
  assert.equal(parseTageZahl('7'), 7);
  assert.equal(parseTageZahl('alle 14 Tage'), 14);
  assert.equal(parseTageZahl('N/A'), undefined);
  assert.equal(parseTageZahl(null), undefined);
});

test('feldWertBereinigen filtert N/A und Platzhalter heraus', () => {
  assert.equal(feldWertBereinigen('N/A'), '');
  assert.equal(feldWertBereinigen('none'), '');
  assert.equal(feldWertBereinigen('null'), '');
  assert.equal(feldWertBereinigen('  -  '), '');
  assert.equal(feldWertBereinigen('50% Erde'), '50% Erde');
});

test('ohne Pflanze → null', () => {
  assert.equal(erkenungsErgebnisAusAntwort('{"erkannt": false}'), null);
});

test('kaputtes JSON ohne JSON-Rest → null', () => {
  assert.equal(parseErkennungsAntwort('Ich sehe keine Pflanze.'), null);
  assert.equal(erkenungsErgebnisAusAntwort('Ich sehe keine Pflanze.'), null);
});

test('ART_ANWEISUNG enthält Platzhalter {ART} und korrekte Felder', async () => {
  const { ART_ANWEISUNG } = await import('./vision.ts');
  assert.ok(ART_ANWEISUNG.includes('{ART}'));
  assert.ok(ART_ANWEISUNG.includes('Drinnen'));
  assert.ok(ART_ANWEISUNG.includes('botanischer Nomenklatur'));
});
