import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bestimmeFamilie } from './pflanzenfamilie.ts';

test('erkennt bekannte Arten an Name oder Art, unabhängig von Groß-/Kleinschreibung', () => {
  assert.equal(bestimmeFamilie('Monstera', null), 'monstera');
  assert.equal(bestimmeFamilie('Tomaten I', 'Gemüse'), 'frucht');
  assert.equal(bestimmeFamilie('Drachenbaum (Dracaena marginata)', 'Zimmerpflanze'), 'baumartig');
  assert.equal(bestimmeFamilie('Weihnachtskaktus (Schlumbergera)', 'Zimmerpflanze'), 'kaktus');
  assert.equal(bestimmeFamilie('Bogenhanf (Sansevieria)', 'Zimmerpflanze'), 'schwert');
  assert.equal(bestimmeFamilie('Rosmarin (Ableger)', 'Kraut'), 'nadel');
});

test('fällt ohne Schlüsselwort auf die grobe Kategorie zurück', () => {
  assert.equal(bestimmeFamilie('Meine Pflanze', 'Gemüse'), 'frucht');
  assert.equal(bestimmeFamilie('Meine Pflanze', 'Obst'), 'frucht');
  assert.equal(bestimmeFamilie('Meine Pflanze', 'Blume'), 'bluete');
  assert.equal(bestimmeFamilie('Meine Pflanze', 'Kraut'), 'busch');
});

test('ganz ohne Anhaltspunkt: busch als niedrigschwelliger Standardlook', () => {
  assert.equal(bestimmeFamilie('Irgendwas Unbekanntes', null), 'busch');
});

test('funktioniert auch für frei eingetragene Arten, nicht nur importierte Kategorien', () => {
  // Manuell hinzugefügte Pflanze, deren Nutzer "Feigenbaum" als Namen und
  // "Feige" als Art eingetragen hat — keine der 36 importierten IDs.
  assert.equal(bestimmeFamilie('Feigenbaum', 'Feige'), 'busch');
  assert.equal(bestimmeFamilie('Meine Orchidee', 'Phalaenopsis'), 'bluete');
});
