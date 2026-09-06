import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textEnthaeltVerboten, normalisiereText, verbotenenTextPruefen } from './textsperre.ts';

/**
 * Prüft die Sperre gegen (unter anderem) rassistische Begriffe — auch in
 * Umlaut-/Leerzeichen-/Leetspeak-Varianten — UND dass normale deutsche
 * Pflanzen- und Alltagstexte durchkommen.
 */

test('rassistische Begriffe werden erkannt (Kleinschreibung, Großbuchstaben)', () => {
  assert.equal(textEnthaeltVerboten('Nazi'), true);
  assert.equal(textEnthaeltVerboten('NAZI-PFLANZE'), true);
  assert.equal(textEnthaeltVerboten('mein_hitler_rose'), true);
  assert.equal(textEnthaeltVerboten('Ich bin ein n1gger'), true);
  assert.equal(textEnthaeltVerboten('Sieg Heil Pflanze'), true);
});

test('Umlaut- und Trennzeichen-Varianten werden erkannt', () => {
  assert.equal(textEnthaeltVerboten('N-A-Z-I'), true);
  assert.equal(textEnthaeltVerboten('N3w Hitl3r'), true);
  assert.equal(textEnthaeltVerboten('sieg   heil'), true);
});

test('normale Pflanzennamen und Notizen bleiben erlaubt', () => {
  for (const text of [
    'Rote Rose (Rosa chinensis)',
    'Meine Schatzi',
    'Monstera (Monstera deliciosa)',
    'Vorsicht: Hund darf von der Distel nichts fressen, die Nessel beißt.',
    'Straße nach Süden,Grüße an Nachbarn',
    'Maß volles Glas Gießen',
    'Racine (Piper nigrum)',
    'Papaver somniferum',
    'Narbe der Narzenne',
    'Große Koan-Collection',
  ]) {
    assert.equal(textEnthaeltVerboten(text), false, `erwartet erlaubt: ${text}`);
  }
});

test('Piper nigrum (Schwarzer Pfeffer) ist und bleibt erlaubt', () => {
  // Das lateinische "nigrum" enthält "nigr" — darf NICHT als n-Wort durchgehen.
  assert.equal(textEnthaeltVerboten('Schwarzer Pfeffer (Piper nigrum)'), false);
  assert.equal(textEnthaeltVerboten('nigrum'), false);
});

test('normalisiereText löst Umlaute auf', () => {
  assert.equal(normalisiereText('Straße ÜRÜCK'), 'strasse uruck');
  assert.equal(normalisiereText('Café'), 'cafe');
});

test('verbotenenTextPruefen wirft mit sichtbarer Feldmeldung', () => {
  assert.throws(() => verbotenenTextPruefen('Name', 'nazi'), /Feld „Name“/);
  assert.doesNotThrow(() => verbotenenTextPruefen('Name', 'Anne’s Monstera'));
  assert.doesNotThrow(() => verbotenenTextPruefen('Name', ''));
});
