/**
 * Reine Textlogik rund um Fälligkeiten — ohne Datenbank, damit sie billig
 * testbar ist (REGELN.md, Abschnitt 4). Die Fälligkeits-Zeitpunkte selbst
 * kommen aus lib/db/abfragen.ts (naechsteFaelligkeitGiessen/…Duengen).
 */

const MILLISEKUNDEN_PRO_TAG = 24 * 60 * 60 * 1000;

export type Faelligkeitsgruppe = 'heute' | 'morgen' | 'spaeter';

function tagesanfang(datum: Date): number {
  return new Date(datum.getFullYear(), datum.getMonth(), datum.getDate()).getTime();
}

/** Ganze Kalendertage von `heute` bis `datum` — negativ, wenn `datum` vorbei ist. */
export function kalendertageBis(datum: Date, heute: Date): number {
  return Math.round((tagesanfang(datum) - tagesanfang(heute)) / MILLISEKUNDEN_PRO_TAG);
}

/** Überfälliges bleibt in „heute" — Vergessen darf nicht aus der Liste fallen. */
export function faelligkeitsgruppe(faelligAm: Date, heute: Date): Faelligkeitsgruppe {
  const tage = kalendertageBis(faelligAm, heute);
  if (tage <= 0) return 'heute';
  if (tage === 1) return 'morgen';
  return 'spaeter';
}

export function beschreibeFaelligkeit(faelligAm: Date, heute: Date): string {
  const tage = kalendertageBis(faelligAm, heute);
  if (tage < -1) return `seit ${-tage} Tagen überfällig`;
  if (tage === -1) return 'seit 1 Tag überfällig';
  if (tage === 0) return 'heute fällig';
  if (tage === 1) return 'morgen fällig';
  return `in ${tage} Tagen`;
}

export function beschreibeLetztePflege(zuletzt: Date | null, heute: Date): string {
  if (!zuletzt) return 'noch nie';
  const tage = -kalendertageBis(zuletzt, heute);
  if (tage <= 0) return 'heute';
  if (tage === 1) return 'gestern';
  return `vor ${tage} Tagen`;
}

/** Ob eine Pflege heute schon passiert ist (für blasse „erledigt"-Zeilen). */
export function istHeute(zeitpunkt: Date | null, heute: Date): boolean {
  return zeitpunkt !== null && kalendertageBis(zeitpunkt, heute) === 0;
}

/**
 * Text der Hinweis-Pille auf Home. `pflanzen` ist die Zahl der Töpfe, die
 * heute irgendetwas brauchen — nicht die Summe der Aufgaben.
 */
export function hinweisText(bedarf: { wasser: number; duenger: number; pflanzen: number }): string {
  const { wasser, duenger, pflanzen } = bedarf;
  if (pflanzen === 0) return 'Heute sind alle Töpfe versorgt.';
  if (duenger === 0) return wasser === 1 ? '1 Topf wartet heute auf Wasser' : `${wasser} Töpfe warten heute auf Wasser`;
  if (wasser === 0) return duenger === 1 ? '1 Topf wartet heute auf Dünger' : `${duenger} Töpfe warten heute auf Dünger`;
  return pflanzen === 1 ? '1 Topf braucht heute Pflege' : `${pflanzen} Töpfe brauchen heute Pflege`;
}

/** Ermutigung erst nach dem ersten erledigten Schritt — kein Vorwurf davor. */
export function ermutigungsSatz(erledigt: number, offen: number): string | null {
  if (erledigt === 0) return null;
  if (offen === 0) return 'Alles erledigt — die Töpfe strahlen.';
  return `${erledigt} von ${erledigt + offen} heute erledigt — weiter so!`;
}
