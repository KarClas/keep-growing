/**
 * Einmaliger Import von Annes bestehenden Pflanzendaten direkt aus der
 * laufenden Postgres-Datenbank von "Annes Pflanzenparadies" (Vorgängerprojekt).
 *
 * Nur lesend (SELECT), nichts an der Quelle wird verändert oder geschrieben.
 * Verbindung ist bewusst fest verdrahtet — dieses Skript läuft genau einmal
 * auf diesem Rechner (siehe DATEN.md: "Einmaliger, sorgfältiger Vorgang").
 *
 * Frühere Fassung dieses Skripts las nur die JSON-Sicherung
 * (daten/sicherung-*.json) mit aggregierten Zählern ohne Einzeltermine. Die
 * Live-Datenbank führt seit dem 27.7.2026 aber echte Einzeltermine in der
 * Tabelle `aktivitaeten` — die werden jetzt 1:1 mit echtem Zeitpunkt
 * übernommen (keine Rekonstruktion mehr nötig). Nur für die Zeit VOR dem
 * 27.7. gibt es ausschließlich Summen (Tabelle `basis_pflege`, aus der
 * Artefakt-Zeit) — dafür bleibt der ehrliche Sockel-Ansatz
 * (`sockel_giessen`/`sockel_duengen`) bestehen, jetzt aber nur noch für
 * diese kurze Vorlaufzeit statt für fast die gesamte Historie.
 *
 * Ausführen mit: node --experimental-strip-types daten/anne-import.ts
 */
import { execFileSync } from 'node:child_process';
import { db } from '../lib/db/index.ts';
import { nutzerListe, nutzerAnlegen, gartenAnlegen, type DrinnenDraussen } from '../lib/db/abfragen.ts';
import type { DarstellungsParameter } from '../lib/garten/pflanzenzeichnung.ts';

const POSTGRES_URL = 'postgres://flowmate@localhost:5432/pflanzenparadies';
const NUTZER_NAME = 'Anne';
const GARTEN_NAME = 'Balkon';

interface PgPflanze {
  id: string;
  name: string;
  standort: 'drinnen' | 'draussen';
  kategorie: string;
  duengen: 'ja' | 'kaum' | 'selten' | 'nein' | null;
  duenger: string | null;
  duenge_intervall_tage: number | null;
  giess_intervall_tage: number | null;
  licht: string | null;
  erde: string | null;
  notizen: string | null;
  darstellung: Record<string, number | string | boolean> | null;
  aktiv: boolean;
}

interface PgBasisPflege {
  pflanze_id: string;
  n_gegossen: number;
  n_geduengt: number;
}

interface PgAktivitaet {
  id: number;
  pflanze_id: string;
  art: 'gegossen' | 'geduengt';
  zeitpunkt: string;
  notiz: string | null;
}

interface PgErnte {
  id: number;
  pflanze_id: string;
  datum: string;
  menge: string | null;
  notiz: string | null;
}

function pgAbfrage<T>(sql: string): T[] {
  const ausgabe = execFileSync(
    'psql',
    [POSTGRES_URL, '-t', '-A', '-c', `SELECT COALESCE(json_agg(row_to_json(t)), '[]') FROM (${sql}) t;`],
    { encoding: 'utf-8', maxBuffer: 20 * 1024 * 1024 },
  );
  return JSON.parse(ausgabe.trim()) as T[];
}

function darstellungUebersetzen(roh: Record<string, any>): DarstellungsParameter {
  return {
    mindeststufe: roh.mindeststufe,
    wuchshoehe: roh.wuchshoehe,
    dichte: roh.dichte,
    blattBonus: roh.blatt_bonus,
    triebKuerzen: roh.trieb_kuerzen,
    sonderfrucht: roh.sonderfrucht,
    bluetenGroesse: roh.bluete_groesse,
    blueht: roh.blueht,
    verzweigt: roh.verzweigt,
    pflanzenImTopf: roh.pflanzen_im_topf,
    topfMit: roh.topf_mit,
  };
}

function importieren() {
  if (nutzerListe().some((n) => n.name === NUTZER_NAME)) {
    throw new Error(
      `Ein Nutzer namens "${NUTZER_NAME}" existiert bereits. Zweiter Import-Lauf wäre ein Duplikat, ` +
        `kein Abgleich — Abbruch (siehe DATEN.md). Lokale Datenbank zurücksetzen, falls das ein Testlauf war.`,
    );
  }

  const pflanzenQuelle = pgAbfrage<PgPflanze>('SELECT * FROM pflanzen');
  const basisPflege = pgAbfrage<PgBasisPflege>('SELECT * FROM basis_pflege');
  const aktivitaeten = pgAbfrage<PgAktivitaet>('SELECT * FROM aktivitaeten ORDER BY zeitpunkt ASC');
  const ernten = pgAbfrage<PgErnte>('SELECT * FROM ernten ORDER BY datum ASC');

  const sockelNachPflanze = new Map(basisPflege.map((b) => [b.pflanze_id, b]));

  const nutzer = nutzerAnlegen(NUTZER_NAME);
  const garten = gartenAnlegen(nutzer.id, GARTEN_NAME);

  const insertPflanze = db.prepare(`
    INSERT INTO pflanze
      (id, garten_id, name, art, erde, licht, drinnen_draussen, giess_intervall_tage,
       duenger_intervall_tage, duenger_typ, notiz, lebenszustand, sockel_giessen, sockel_duengen, darstellung)
    VALUES
      (@id, @gartenId, @name, @art, @erde, @licht, @drinnenDraussen, @giessIntervallTage,
       @duengerIntervallTage, @duengerTyp, @notiz, @lebenszustand, @sockelGiessen, @sockelDuengen, @darstellung)
  `);

  const insertAktivitaet = db.prepare(`
    INSERT INTO aktivitaet (id, pflanze_id, typ, menge, notiz, datum)
    VALUES (@id, @pflanzeId, @typ, @menge, @notiz, @datum)
  `);

  for (const p of pflanzenQuelle) {
    const sockel = sockelNachPflanze.get(p.id);
    // "kaum"/"selten" heißt seltener düngen, nicht gar nicht — nur "nein"
    // (und fehlende Angabe) bedeutet wirklich kein Düngeplan.
    const hatDuengeplan = p.duengen !== null && p.duengen !== 'nein';

    insertPflanze.run({
      id: p.id,
      gartenId: garten.id,
      name: p.name,
      art: p.kategorie ?? null,
      erde: p.erde ?? null,
      licht: p.licht ?? null,
      drinnenDraussen: p.standort as DrinnenDraussen,
      giessIntervallTage: p.giess_intervall_tage ?? 7,
      duengerIntervallTage: hatDuengeplan ? (p.duenge_intervall_tage ?? null) : null,
      duengerTyp: hatDuengeplan ? (p.duenger ?? null) : null,
      notiz: p.notizen ?? '',
      lebenszustand: p.aktiv ? 'lebend' : 'verstorben',
      sockelGiessen: sockel?.n_gegossen ?? 0,
      sockelDuengen: sockel?.n_geduengt ?? 0,
      darstellung: JSON.stringify(darstellungUebersetzen(p.darstellung ?? {})),
    });
  }

  for (const a of aktivitaeten) {
    insertAktivitaet.run({
      id: `pgparadies-akt-${a.id}`,
      pflanzeId: a.pflanze_id,
      typ: a.art === 'gegossen' ? 'giessen' : 'duengen',
      menge: null,
      notiz: a.notiz,
      datum: a.zeitpunkt,
    });
  }

  for (const e of ernten) {
    insertAktivitaet.run({
      id: String(e.id),
      pflanzeId: e.pflanze_id,
      typ: 'ernten',
      menge: e.menge,
      notiz: e.notiz,
      datum: e.datum,
    });
  }

  console.log('Import fertig — direkt aus der Live-Datenbank von Annes Pflanzenparadies gelesen.');
  console.log(`Nutzer: ${nutzer.name} (${nutzer.id})`);
  console.log(`Garten: ${garten.name} (${garten.id})`);
  console.log(`Pflanzen importiert: ${pflanzenQuelle.length}`);
  console.log(`Einzelne Gieß-/Düngeeinträge mit echtem Zeitpunkt: ${aktivitaeten.length}`);
  console.log(`Ernten importiert: ${ernten.length}`);
  console.log(`Historischer Sockel (vor Beginn der Einzelprotokollierung am 27.7.2026) für ${basisPflege.length} Pflanzen übernommen.`);
}

importieren();
