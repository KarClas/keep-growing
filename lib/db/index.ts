import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_PFAD = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'daten', 'lokal.db');

fs.mkdirSync(path.dirname(DB_PFAD), { recursive: true });

export const db = new Database(DB_PFAD, { timeout: 5000 });
db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS nutzer (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    erstellt_am TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS garten (
    id TEXT PRIMARY KEY,
    nutzer_id TEXT NOT NULL REFERENCES nutzer(id),
    name TEXT NOT NULL,
    erstellt_am TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_garten_nutzer ON garten(nutzer_id);

  CREATE TABLE IF NOT EXISTS pflanze (
    id TEXT PRIMARY KEY,
    garten_id TEXT NOT NULL REFERENCES garten(id),
    name TEXT NOT NULL,
    art TEXT,
    erde TEXT,
    licht TEXT,
    drinnen_draussen TEXT NOT NULL DEFAULT 'drinnen' CHECK (drinnen_draussen IN ('drinnen', 'draussen')),
    giess_intervall_tage INTEGER NOT NULL DEFAULT 7,
    duenger_intervall_tage INTEGER,
    duenger_typ TEXT,
    notiz TEXT NOT NULL DEFAULT '',
    lebenszustand TEXT NOT NULL DEFAULT 'lebend' CHECK (lebenszustand IN ('lebend', 'verstorben')),
    foto_url TEXT,
    wuchsstufe_sockel INTEGER NOT NULL DEFAULT 0,
    erstellt_am TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_pflanze_garten ON pflanze(garten_id);

  CREATE TABLE IF NOT EXISTS aktivitaet (
    id TEXT PRIMARY KEY,
    pflanze_id TEXT NOT NULL REFERENCES pflanze(id),
    typ TEXT NOT NULL CHECK (typ IN ('giessen', 'duengen', 'ernten')),
    menge TEXT,
    notiz TEXT,
    datum TEXT NOT NULL,
    erstellt_am TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_aktivitaet_pflanze ON aktivitaet(pflanze_id, typ);
`);

// Leichtgewichtige Nachrüstung für Datenbanken, die vor `wuchsstufe_sockel`
// angelegt wurden (SQLite kennt kein "ADD COLUMN IF NOT EXISTS").
const pflanzeSpalten = db.prepare('PRAGMA table_info(pflanze)').all() as { name: string }[];
if (!pflanzeSpalten.some((spalte) => spalte.name === 'wuchsstufe_sockel')) {
  db.exec('ALTER TABLE pflanze ADD COLUMN wuchsstufe_sockel INTEGER NOT NULL DEFAULT 0');
}
