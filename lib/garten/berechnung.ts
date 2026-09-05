export type Pflegestimmung =
  | 'sehr_gluecklich'
  | 'sehr_gluecklich_geerntet'
  | 'zufrieden'
  | 'traurig'
  | 'verzweifelt'
  | 'wuetend';

const MILLISEKUNDEN_PRO_TAG = 24 * 60 * 60 * 1000;

function selberTag(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Wenn eine Pflege noch nie stattfand, zählt die Frist ab `seitWannBeobachten`
// (der Erstellung der Pflanze) statt ab "Anfang der Zeit" — sonst wäre jede
// frisch angelegte Pflanze mit Düngeplan sofort "sehr traurig".
function tageSeit(heute: Date, zeitpunkt: Date | null, seitWannBeobachten: Date): number {
  const basis = zeitpunkt ?? seitWannBeobachten;
  return (heute.getTime() - basis.getTime()) / MILLISEKUNDEN_PRO_TAG;
}

function tageUeberfaellig(
  heute: Date,
  zuletzt: Date | null,
  intervallTage: number | null,
  seitWannBeobachten: Date,
): number {
  if (intervallTage === null) return 0;
  return Math.max(0, tageSeit(heute, zuletzt, seitWannBeobachten) - intervallTage);
}

export function berechnePflegestimmung(input: {
  heute: Date;
  seitWannBeobachten: Date;
  zuletztGegossenAm: Date | null;
  giessIntervallTage: number;
  zuletztGeduengtAm: Date | null;
  duengerIntervallTage: number | null;
  zuletztGeerntetAm: Date | null;
}): Pflegestimmung {
  // Freude-Auslöser gehen der Überfälligkeits-Leiter vor: eine heute gepflegte
  // Pflanze ist unabhängig vom Fälligkeitsstand sehr glücklich. Ernten schlägt
  // Gießen/Düngen (rote Wangen als "mehr Freude"), falls beides am selben Tag war.
  if (input.zuletztGeerntetAm && selberTag(input.heute, input.zuletztGeerntetAm)) {
    return 'sehr_gluecklich_geerntet';
  }
  if (
    (input.zuletztGegossenAm && selberTag(input.heute, input.zuletztGegossenAm)) ||
    (input.zuletztGeduengtAm && selberTag(input.heute, input.zuletztGeduengtAm))
  ) {
    return 'sehr_gluecklich';
  }

  const ueberfaelligTage = Math.max(
    tageUeberfaellig(input.heute, input.zuletztGegossenAm, input.giessIntervallTage, input.seitWannBeobachten),
    tageUeberfaellig(input.heute, input.zuletztGeduengtAm, input.duengerIntervallTage, input.seitWannBeobachten),
  );

  if (ueberfaelligTage <= 1) return 'zufrieden';
  if (ueberfaelligTage <= 2) return 'traurig';
  if (ueberfaelligTage <= 3) return 'verzweifelt';
  return 'wuetend';
}

export const MAX_WUCHSSTUFE = 5;

/**
 * Gießen und Düngen sind häufige Routine-Handlungen — erst fünf davon lassen
 * ein neues Blatt wachsen, sonst wäre eine Pflanze nach wenigen Tagen bereits
 * ausgewachsen. Eine Ernte ist dagegen schon selten genug, um sofort zu
 * zählen (wie bisher).
 */
export const AKTIONEN_PRO_STUFE = 5;

export interface Pflegeaktionen {
  giessen: number;
  duengen: number;
  ernten: number;
}

export function berechneWuchsstufe(aktionen: Pflegeaktionen): number {
  if (aktionen.giessen < 0 || aktionen.duengen < 0 || aktionen.ernten < 0) {
    throw new Error('Anzahl Pflegeaktionen kann nicht negativ sein.');
  }
  const stufen =
    Math.floor(aktionen.giessen / AKTIONEN_PRO_STUFE) +
    Math.floor(aktionen.duengen / AKTIONEN_PRO_STUFE) +
    aktionen.ernten;
  return Math.min(stufen, MAX_WUCHSSTUFE);
}
