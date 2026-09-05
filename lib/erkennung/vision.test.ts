import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseErkennungsAntwort, erkenungsErgebnisAusAntwort } from './vision.ts';

/**
 * Testet die Antwort-Validierung — den Teil, der erdachte oder kaputte
 * Modellantworten abfangen muss, bevor sie als Pflanze in der DB landen.
 */

const ROSANTEWORT = JSON.stringify({
  erkannt: true,
  name: 'Rote Rose',
  art: 'Rote Rose (Rosa spec.)',
  hinweis: 'Dazu Schleierkraut (Gypsophila paniculata) und ein überhängendes Ziergras.',
  sicherheit: 'hoch',
  erde: 'Nährstoffreiche, durchlässige Erde',
  licht: 'Sonnig bis halbschattig',
  giessIntervallTage: 3,
  duengerIntervallTage: 30,
  duengerTyp: 'Rosendünger',
  drinnenDraussen: 'draussen',
});

test('sauberes JSON wird zum validierten Vorschlag', () => {
  const vorschlag = erkenungsErgebnisAusAntwort(ROSANTEWORT);
  assert.ok(vorschlag);
  assert.equal(vorschlag.art, 'Rote Rose (Rosa spec.)');
  assert.equal(vorschlag.nameVorschlag, 'Rote Rose');
  assert.match(vorschlag.hinweis ?? '', /Schleierkraut/);
  assert.equal(vorschlag.sicherheit, 'hoch');
  assert.equal(vorschlag.giessIntervallTage, 3);
  assert.equal(vorschlag.drinnenDraussen, 'draussen');
});

test('JSON im ```zaun wird ebenfalls erkannt', () => {
  const vorschlag = erkenungsErgebnisAusAntwort('Hier das Ergebnis:\n```json\n' + ROSANTEWORT + '\n```\nFertig!');
  assert.ok(vorschlag);
  assert.equal(vorschlag.art, 'Rote Rose (Rosa spec.)');
});

test('ohne Pflanze → null (ehrliche Absage)', () => {
  assert.equal(erkenungsErgebnisAusAntwort('{"erkannt": false}'), null);
});

test('kaputtes JSON ohne JSON-Rest → null', () => {
  assert.equal(parseErkennungsAntwort('Ich sehe keine Pflanze auf dem Bild.'), null);
  assert.equal(erkenungsErgebnisAusAntwort('Ich sehe keine Pflanze auf dem Bild.'), null);
});

test('erkannt ohne Art/Name → null, nicht halb befüllt', () => {
  assert.equal(erkenungsErgebnisAusAntwort('{"erkannt": true, "erde": "Erde"}'), null);
});

test('unbekannte Sicherheit und fehlende Zahlen werden defensiv ausgelesen', () => {
  const vorschlag = erkenungsErgebnisAusAntwort(
    '{"erkannt": true, "name": "Basilikum", "art": "Basilikum (Ocimum basilicum)", "sicherheit": "sehr hoch", "giessIntervallTage": "2", "duengerIntervallTage": null}',
  );
  assert.ok(vorschlag);
  assert.equal(vorschlag.sicherheit, 'mittel');
  assert.equal(vorschlag.giessIntervallTage, 2);
  assert.ok(vorschlag.duengerIntervallTage == null); // null oder undefined — beides heißt „kein Düngen geplant“
  assert.equal(vorschlag.drinnenDraussen, 'drinnen');
});
