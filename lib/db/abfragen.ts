import { randomUUID } from 'node:crypto';
import { db } from './index.ts';
import { berechnePflegestimmung, berechneWuchsstufe, type Pflegestimmung } from '../garten/berechnung.ts';
import type { DarstellungsParameter } from '../garten/pflanzenzeichnung.ts';

export class KeinZugriff extends Error {
  constructor(meldung = 'Kein Zugriff auf fremde Daten.') {
    super(meldung);
    this.name = 'KeinZugriff';
  }
}

export type Lebenszustand = 'lebend' | 'verstorben';
export type AktivitaetTyp = 'giessen' | 'duengen' | 'ernten';
export type DrinnenDraussen = 'drinnen' | 'draussen';

export interface Nutzer {
  id: string;
  name: string;
}

export interface Garten {
  id: string;
  nutzerId: string;
  name: string;
}

export interface Pflanze {
  id: string;
  gartenId: string;
  name: string;
  art: string | null;
  erde: string | null;
  licht: string | null;
  drinnenDraussen: DrinnenDraussen;
  giessIntervallTage: number;
  duengerIntervallTage: number | null;
  duengerTyp: string | null;
  notiz: string;
  lebenszustand: Lebenszustand;
  fotoUrl: string | null;
  sockelGiessen: number;
  sockelDuengen: number;
  darstellung: DarstellungsParameter;
  erstelltAm: string;
}

export interface Aktivitaet {
  id: string;
  pflanzeId: string;
  typ: AktivitaetTyp;
  menge: string | null;
  notiz: string | null;
  datum: string;
}

function zeileZuNutzer(zeile: any): Nutzer {
  return { id: zeile.id, name: zeile.name };
}

function zeileZuGarten(zeile: any): Garten {
  return { id: zeile.id, nutzerId: zeile.nutzer_id, name: zeile.name };
}

function zeileZuPflanze(zeile: any): Pflanze {
  return {
    id: zeile.id,
    gartenId: zeile.garten_id,
    name: zeile.name,
    art: zeile.art,
    erde: zeile.erde,
    licht: zeile.licht,
    drinnenDraussen: zeile.drinnen_draussen,
    giessIntervallTage: zeile.giess_intervall_tage,
    duengerIntervallTage: zeile.duenger_intervall_tage,
    duengerTyp: zeile.duenger_typ,
    notiz: zeile.notiz,
    lebenszustand: zeile.lebenszustand,
    fotoUrl: zeile.foto_url,
    sockelGiessen: zeile.sockel_giessen,
    sockelDuengen: zeile.sockel_duengen,
    darstellung: zeile.darstellung ? JSON.parse(zeile.darstellung) : {},
    erstelltAm: zeile.erstellt_am,
  };
}

function zeileZuAktivitaet(zeile: any): Aktivitaet {
  return {
    id: zeile.id,
    pflanzeId: zeile.pflanze_id,
    typ: zeile.typ,
    menge: zeile.menge,
    notiz: zeile.notiz,
    datum: zeile.datum,
  };
}

// --- Nutzer -----------------------------------------------------------

export function nutzerAnlegen(name: string): Nutzer {
  const id = randomUUID();
  db.prepare('INSERT INTO nutzer (id, name) VALUES (?, ?)').run(id, name);
  return { id, name };
}

export function nutzerListe(): Nutzer[] {
  const zeilen = db.prepare('SELECT id, name FROM nutzer ORDER BY erstellt_am ASC').all();
  return zeilen.map(zeileZuNutzer);
}

export function nutzerMitId(nutzerId: string): Nutzer | undefined {
  const zeile = db.prepare('SELECT id, name FROM nutzer WHERE id = ?').get(nutzerId);
  return zeile ? zeileZuNutzer(zeile) : undefined;
}

// --- Garten -------------------------------------------------------------

export function gartenGehoertNutzer(gartenId: string, nutzerId: string): boolean {
  const zeile = db.prepare('SELECT 1 FROM garten WHERE id = ? AND nutzer_id = ?').get(gartenId, nutzerId);
  return zeile !== undefined;
}

export function gaertenFuerNutzer(nutzerId: string): Garten[] {
  const zeilen = db
    .prepare('SELECT id, nutzer_id, name FROM garten WHERE nutzer_id = ? ORDER BY erstellt_am ASC')
    .all(nutzerId);
  return zeilen.map(zeileZuGarten);
}

export function gartenAnlegen(nutzerId: string, name: string): Garten {
  const id = randomUUID();
  db.prepare('INSERT INTO garten (id, nutzer_id, name) VALUES (?, ?, ?)').run(id, nutzerId, name);
  return { id, nutzerId, name };
}

// --- Pflanze --------------------------------------------------------------

function pflanzeGehoertNutzer(pflanzeId: string, nutzerId: string): boolean {
  const zeile = db
    .prepare(
      `SELECT 1 FROM pflanze
       JOIN garten ON garten.id = pflanze.garten_id
       WHERE pflanze.id = ? AND garten.nutzer_id = ?`,
    )
    .get(pflanzeId, nutzerId);
  return zeile !== undefined;
}

export function pflanzenFuerGarten(gartenId: string, nutzerId: string): Pflanze[] {
  if (!gartenGehoertNutzer(gartenId, nutzerId)) throw new KeinZugriff();
  const zeilen = db
    .prepare('SELECT * FROM pflanze WHERE garten_id = ? ORDER BY erstellt_am ASC')
    .all(gartenId);
  return zeilen.map(zeileZuPflanze);
}

export function pflanzenFuerNutzer(nutzerId: string): Pflanze[] {
  const zeilen = db
    .prepare(
      `SELECT pflanze.* FROM pflanze
       JOIN garten ON garten.id = pflanze.garten_id
       WHERE garten.nutzer_id = ?
       ORDER BY pflanze.erstellt_am ASC`,
    )
    .all(nutzerId);
  return zeilen.map(zeileZuPflanze);
}

export function pflanzeMitId(pflanzeId: string, nutzerId: string): Pflanze {
  if (!pflanzeGehoertNutzer(pflanzeId, nutzerId)) throw new KeinZugriff();
  const zeile = db.prepare('SELECT * FROM pflanze WHERE id = ?').get(pflanzeId);
  if (!zeile) throw new KeinZugriff();
  return zeileZuPflanze(zeile);
}

export interface NeuePflanzeDaten {
  name: string;
  art?: string | null;
  erde?: string | null;
  licht?: string | null;
  drinnenDraussen?: DrinnenDraussen;
  giessIntervallTage?: number;
  duengerIntervallTage?: number | null;
  duengerTyp?: string | null;
  notiz?: string;
  fotoUrl?: string | null;
  sockelGiessen?: number;
  sockelDuengen?: number;
  darstellung?: DarstellungsParameter;
}

export function pflanzeAnlegen(gartenId: string, nutzerId: string, daten: NeuePflanzeDaten): Pflanze {
  if (!gartenGehoertNutzer(gartenId, nutzerId)) throw new KeinZugriff();
  const id = randomUUID();
  db.prepare(
    `INSERT INTO pflanze
      (id, garten_id, name, art, erde, licht, drinnen_draussen, giess_intervall_tage, duenger_intervall_tage, duenger_typ, notiz, foto_url, sockel_giessen, sockel_duengen, darstellung)
     VALUES (@id, @gartenId, @name, @art, @erde, @licht, @drinnenDraussen, @giessIntervallTage, @duengerIntervallTage, @duengerTyp, @notiz, @fotoUrl, @sockelGiessen, @sockelDuengen, @darstellung)`,
  ).run({
    id,
    gartenId,
    name: daten.name,
    art: daten.art ?? null,
    erde: daten.erde ?? null,
    licht: daten.licht ?? null,
    drinnenDraussen: daten.drinnenDraussen ?? 'drinnen',
    giessIntervallTage: daten.giessIntervallTage ?? 7,
    duengerIntervallTage: daten.duengerIntervallTage ?? null,
    duengerTyp: daten.duengerTyp ?? null,
    notiz: daten.notiz ?? '',
    fotoUrl: daten.fotoUrl ?? null,
    sockelGiessen: daten.sockelGiessen ?? 0,
    sockelDuengen: daten.sockelDuengen ?? 0,
    darstellung: daten.darstellung ? JSON.stringify(daten.darstellung) : null,
  });
  return pflanzeMitId(id, nutzerId);
}

export function pflanzeAlsVerstorbenMarkieren(pflanzeId: string, nutzerId: string): void {
  if (!pflanzeGehoertNutzer(pflanzeId, nutzerId)) throw new KeinZugriff();
  db.prepare("UPDATE pflanze SET lebenszustand = 'verstorben' WHERE id = ?").run(pflanzeId);
}

/**
 * Schnittstelle für den Scanner (Foto -> Art + Pflegevorschlag), gebaut vom
 * übrigen Team. Diese Funktion ist unabhängig von der KI-Erkennung nutzbar.
 */
export interface ErkennungsErgebnis {
  art: string;
  erde?: string | null;
  licht?: string | null;
  giessIntervallTage?: number;
  duengerIntervallTage?: number | null;
  duengerTyp?: string | null;
  fotoUrl?: string | null;
  /** Satz zu Begleitpflanzen/Bestandteilen aus der Foto-Erkennung (ergänzt die Notiz, Regel: nur ergänzen). */
  hinweis?: string | null;
}

export interface ErkennungsRueckfragen {
  name: string;
  drinnenDraussen: DrinnenDraussen;
  aktuelleGroesse?: string;
}

export function pflanzeAusErkennungAnlegen(
  gartenId: string,
  nutzerId: string,
  erkennung: ErkennungsErgebnis,
  rueckfragen: ErkennungsRueckfragen,
): Pflanze {
  const notiz = [
    erkennung.hinweis ? `Aus der Foto-Erkennung: ${erkennung.hinweis}` : null,
    rueckfragen.aktuelleGroesse ? `Größe beim Anlegen: ${rueckfragen.aktuelleGroesse}` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return pflanzeAnlegen(gartenId, nutzerId, {
    name: rueckfragen.name,
    art: erkennung.art,
    erde: erkennung.erde,
    licht: erkennung.licht,
    drinnenDraussen: rueckfragen.drinnenDraussen,
    giessIntervallTage: erkennung.giessIntervallTage,
    duengerIntervallTage: erkennung.duengerIntervallTage,
    duengerTyp: erkennung.duengerTyp,
    notiz,
    fotoUrl: erkennung.fotoUrl,
  });
}

// --- Aktivitäten (Gießen, Düngen, Ernten) ----------------------------------

function letzteAktivitaet(pflanzeId: string, typ: AktivitaetTyp): string | null {
  const zeile = db
    .prepare('SELECT datum FROM aktivitaet WHERE pflanze_id = ? AND typ = ? ORDER BY datum DESC LIMIT 1')
    .get(pflanzeId, typ) as { datum: string } | undefined;
  return zeile?.datum ?? null;
}

function anzahlAktivitaetNachTyp(pflanzeId: string, typ: AktivitaetTyp): number {
  const zeile = db
    .prepare('SELECT COUNT(*) AS anzahl FROM aktivitaet WHERE pflanze_id = ? AND typ = ?')
    .get(pflanzeId, typ) as { anzahl: number };
  return zeile.anzahl;
}

export function wuchsstufeFuerPflanze(pflanze: Pflanze): number {
  return berechneWuchsstufe({
    giessen: pflanze.sockelGiessen + anzahlAktivitaetNachTyp(pflanze.id, 'giessen'),
    duengen: pflanze.sockelDuengen + anzahlAktivitaetNachTyp(pflanze.id, 'duengen'),
    ernten: anzahlAktivitaetNachTyp(pflanze.id, 'ernten'),
  });
}

export function pflegestimmungFuerPflanze(pflanze: Pflanze, heute: Date = new Date()): Pflegestimmung {
  const zuletztGegossen = letzteAktivitaet(pflanze.id, 'giessen');
  const zuletztGeduengt = letzteAktivitaet(pflanze.id, 'duengen');
  const zuletztGeerntet = letzteAktivitaet(pflanze.id, 'ernten');
  return berechnePflegestimmung({
    heute,
    seitWannBeobachten: new Date(pflanze.erstelltAm),
    zuletztGegossenAm: zuletztGegossen ? new Date(zuletztGegossen) : null,
    giessIntervallTage: pflanze.giessIntervallTage,
    zuletztGeduengtAm: zuletztGeduengt ? new Date(zuletztGeduengt) : null,
    duengerIntervallTage: pflanze.duengerIntervallTage,
    zuletztGeerntetAm: zuletztGeerntet ? new Date(zuletztGeerntet) : null,
  });
}

export function naechsteFaelligkeitGiessen(pflanze: Pflanze): Date {
  const zuletzt = letzteAktivitaet(pflanze.id, 'giessen');
  const basis = zuletzt ? new Date(zuletzt) : new Date(pflanze.erstelltAm);
  return new Date(basis.getTime() + pflanze.giessIntervallTage * 24 * 60 * 60 * 1000);
}

export function naechsteFaelligkeitDuengen(pflanze: Pflanze): Date | null {
  if (pflanze.duengerIntervallTage === null) return null;
  const zuletzt = letzteAktivitaet(pflanze.id, 'duengen');
  const basis = zuletzt ? new Date(zuletzt) : new Date(pflanze.erstelltAm);
  return new Date(basis.getTime() + pflanze.duengerIntervallTage * 24 * 60 * 60 * 1000);
}

export function aktivitaetHinzufuegen(
  pflanzeId: string,
  nutzerId: string,
  typ: AktivitaetTyp,
  daten: { menge?: string | null; notiz?: string | null; datum?: string } = {},
): Aktivitaet {
  if (!pflanzeGehoertNutzer(pflanzeId, nutzerId)) throw new KeinZugriff();
  const id = randomUUID();
  const datum = daten.datum ?? new Date().toISOString();
  db.prepare(
    'INSERT INTO aktivitaet (id, pflanze_id, typ, menge, notiz, datum) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(id, pflanzeId, typ, daten.menge ?? null, daten.notiz ?? null, datum);
  return { id, pflanzeId, typ, menge: daten.menge ?? null, notiz: daten.notiz ?? null, datum };
}

export function aktivitaetenFuerPflanze(pflanzeId: string, nutzerId: string): Aktivitaet[] {
  if (!pflanzeGehoertNutzer(pflanzeId, nutzerId)) throw new KeinZugriff();
  const zeilen = db
    .prepare('SELECT * FROM aktivitaet WHERE pflanze_id = ? ORDER BY datum DESC')
    .all(pflanzeId);
  return zeilen.map(zeileZuAktivitaet);
}

export interface ErnteEintrag {
  id: string;
  pflanzeId: string;
  pflanzeName: string;
  pflanzeArt: string | null;
  menge: string | null;
  notiz: string | null;
  datum: string;
}

export function ernteListeFuerNutzer(nutzerId: string): ErnteEintrag[] {
  const zeilen = db
    .prepare(
      `SELECT aktivitaet.id, aktivitaet.pflanze_id, pflanze.name AS pflanze_name, pflanze.art AS pflanze_art, aktivitaet.menge, aktivitaet.notiz, aktivitaet.datum
       FROM aktivitaet
       JOIN pflanze ON pflanze.id = aktivitaet.pflanze_id
       JOIN garten ON garten.id = pflanze.garten_id
       WHERE garten.nutzer_id = ? AND aktivitaet.typ = 'ernten'
       ORDER BY aktivitaet.datum DESC`,
    )
    .all(nutzerId) as any[];
  return zeilen.map((z) => ({
    id: z.id,
    pflanzeId: z.pflanze_id,
    pflanzeName: z.pflanze_name,
    pflanzeArt: z.pflanze_art,
    menge: z.menge,
    notiz: z.notiz,
    datum: z.datum,
  }));
}

export function aktivitaetLoeschen(aktivitaetId: string, nutzerId: string): void {
  const eigentuemer = db
    .prepare(
      `SELECT 1 FROM aktivitaet
       JOIN pflanze ON pflanze.id = aktivitaet.pflanze_id
       JOIN garten ON garten.id = pflanze.garten_id
       WHERE aktivitaet.id = ? AND garten.nutzer_id = ?`,
    )
    .get(aktivitaetId, nutzerId);
  if (!eigentuemer) throw new KeinZugriff();
  db.prepare('DELETE FROM aktivitaet WHERE id = ?').run(aktivitaetId);
}
