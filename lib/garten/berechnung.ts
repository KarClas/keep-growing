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

export function berechneWuchsstufe(anzahlPflegeAktionen: number): number {
  if (anzahlPflegeAktionen < 0) {
    throw new Error('Anzahl Pflegeaktionen kann nicht negativ sein.');
  }
  return Math.min(anzahlPflegeAktionen, MAX_WUCHSSTUFE);
}
