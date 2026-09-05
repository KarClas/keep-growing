/**
 * Einmaliger Import von Annes bestehenden Pflanzendaten aus
 * "Annes Pflanzenparadies" (dem Vorgängerprojekt) in keep-growing.
 *
 * Quelle (nur lesend, wird nie verändert):
 *   /Users/flowmate/Annes Pflanzenparadies/daten/pflanzen.json
 *   /Users/flowmate/Annes Pflanzenparadies/daten/sicherung-2026-09-04T2011.json
 *
 * Pfade sind bewusst fest verdrahtet — dieses Skript läuft genau einmal auf
 * diesem Rechner, siehe DATEN.md ("Einmaliger, sorgfältiger Vorgang, keine
 * laufende Synchronisation").
 *
 * Ehrlichkeit statt Erfindung: Die Quelle kennt für Gießen/Düngen nur einen
 * laufenden Zähler plus letzten Zeitpunkt, keine Einzeltermine (siehe deren
 * eigene DATEN.md: "nur Summen geführt, keine Einzeltermine"). Statt das zu
 * verwerfen oder frei erfundene Einzeltermine einzusetzen, wird genau EIN
 * echter Aktivitäts-Eintrag mit dem letzten bekannten Datum angelegt, und der
 * Rest der historischen Handlungen fließt als ehrlicher Sockel
 * (`wuchsstufe_sockel`) in die Wuchsstufe ein — analog zum "Sockel + Anzahl
 * echter Ereignisse"-Ansatz, den das Referenzprojekt für genau dieses Problem
 * beschreibt. Ernten haben dagegen echte Einzeltermine und werden 1:1
 * übernommen, inklusive ursprünglicher ID (vermeidet Dubletten bei einem
 * späteren Abgleich).
 *
 * Ausführen mit: node --experimental-strip-types daten/anne-import.ts
 */
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { db } from '../lib/db/index.ts';
import { nutzerListe, nutzerAnlegen, gartenAnlegen, type DrinnenDraussen } from '../lib/db/abfragen.ts';

const QUELLE_PFLANZEN = '/Users/flowmate/Annes Pflanzenparadies/daten/pflanzen.json';
const QUELLE_SICHERUNG = '/Users/flowmate/Annes Pflanzenparadies/daten/sicherung-2026-09-04T2011.json';
const NUTZER_NAME = 'Anne';
const GARTEN_NAME = 'Balkon';

interface QuellPflanze {
  id: string;
  name: string;
  standort: 'drinnen' | 'draussen';
  kategorie: string;
  duengen: 'ja' | 'nein';
  duenger?: string;
  duenge_intervall_tage?: number;
  giess_intervall_tage: number;
  licht?: string;
  erde?: string;
  notizen?: string;
}

interface QuellAktivitaet {
  n_gegossen: number;
  gegossen: string;
  n_geduengt?: number;
  geduengt?: string;
}

interface QuellErnte {
  eid: number;
  pflanzeId: string;
  datum: string;
  menge: string;
  notiz: string;
}

function ladeJson<T>(pfad: string): T {
  if (!fs.existsSync(pfad)) {
    throw new Error(`Quelldatei fehlt: ${pfad}`);
  }
  return JSON.parse(fs.readFileSync(pfad, 'utf-8')) as T;
}

function importieren() {
  if (nutzerListe().some((n) => n.name === NUTZER_NAME)) {
    throw new Error(
      `Ein Nutzer namens "${NUTZER_NAME}" existiert bereits. Zweiter Import-Lauf wäre ein Duplikat, ` +
        `kein Abgleich — Abbruch (siehe DATEN.md). Lokale Datenbank zurücksetzen, falls das ein Testlauf war.`,
    );
  }

  const pflanzenDaten = ladeJson<{ pflanzen: QuellPflanze[] }>(QUELLE_PFLANZEN);
  const sicherung = ladeJson<{
    gesichert: string;
    daten: { 'garten:aktivitaet': Record<string, QuellAktivitaet>; 'garten:ernte': QuellErnte[] };
  }>(QUELLE_SICHERUNG);

  const aktivitaetProPflanze = sicherung.daten['garten:aktivitaet'];
  const ernten = sicherung.daten['garten:ernte'];

  const nutzer = nutzerAnlegen(NUTZER_NAME);
  const garten = gartenAnlegen(nutzer.id, GARTEN_NAME);

  const insertPflanze = db.prepare(`
    INSERT INTO pflanze
      (id, garten_id, name, art, erde, licht, drinnen_draussen, giess_intervall_tage,
       duenger_intervall_tage, duenger_typ, notiz, wuchsstufe_sockel)
    VALUES
      (@id, @gartenId, @name, @art, @erde, @licht, @drinnenDraussen, @giessIntervallTage,
       @duengerIntervallTage, @duengerTyp, @notiz, @wuchsstufeSockel)
  `);

  const insertAktivitaet = db.prepare(`
    INSERT INTO aktivitaet (id, pflanze_id, typ, menge, notiz, datum)
    VALUES (@id, @pflanzeId, @typ, @menge, @notiz, @datum)
  `);

  let importierteGiessMarkierungen = 0;
  let importierteDuengeMarkierungen = 0;

  for (const p of pflanzenDaten.pflanzen) {
    const akt = aktivitaetProPflanze[p.id];
    if (!akt) {
      throw new Error(`Keine Aktivitäts-Daten für Pflanze "${p.id}" in der Sicherung gefunden.`);
    }

    const geduengtVorhanden = akt.n_geduengt !== undefined && akt.geduengt !== undefined;
    const sockel = Math.max(0, akt.n_gegossen - 1) + Math.max(0, (akt.n_geduengt ?? 0) - (geduengtVorhanden ? 1 : 0));

    insertPflanze.run({
      id: p.id,
      gartenId: garten.id,
      name: p.name,
      art: p.kategorie ?? null,
      erde: p.erde ?? null,
      licht: p.licht ?? null,
      drinnenDraussen: p.standort as DrinnenDraussen,
      giessIntervallTage: p.giess_intervall_tage,
      duengerIntervallTage: p.duengen === 'ja' ? (p.duenge_intervall_tage ?? null) : null,
      duengerTyp: p.duengen === 'ja' ? (p.duenger ?? null) : null,
      notiz: p.notizen ?? '',
      wuchsstufeSockel: sockel,
    });

    insertAktivitaet.run({
      id: randomUUID(),
      pflanzeId: p.id,
      typ: 'giessen',
      menge: null,
      notiz: 'Übernommen aus altem Stand (letzter bekannter Zeitpunkt, keine Einzeltermine verfügbar).',
      datum: akt.gegossen,
    });
    importierteGiessMarkierungen++;

    if (geduengtVorhanden) {
      insertAktivitaet.run({
        id: randomUUID(),
        pflanzeId: p.id,
        typ: 'duengen',
        menge: null,
        notiz: 'Übernommen aus altem Stand (letzter bekannter Zeitpunkt, keine Einzeltermine verfügbar).',
        datum: akt.geduengt,
      });
      importierteDuengeMarkierungen++;
    }
  }

  for (const e of ernten) {
    insertAktivitaet.run({
      id: String(e.eid),
      pflanzeId: e.pflanzeId,
      typ: 'ernten',
      menge: e.menge ?? null,
      notiz: e.notiz ?? null,
      datum: e.datum,
    });
  }

  console.log(`Import fertig (Stand der Quelle: ${sicherung.gesichert}).`);
  console.log(`Nutzer: ${nutzer.name} (${nutzer.id})`);
  console.log(`Garten: ${garten.name} (${garten.id})`);
  console.log(`Pflanzen importiert: ${pflanzenDaten.pflanzen.length}`);
  console.log(`Gieß-Markierungen (letzter bekannter Termin): ${importierteGiessMarkierungen}`);
  console.log(`Dünge-Markierungen (letzter bekannter Termin): ${importierteDuengeMarkierungen}`);
  console.log(`Ernten importiert (mit echten Einzeldaten): ${ernten.length}`);
}

importieren();
