export type Pflegestimmung = 'zufrieden' | 'neutral' | 'traurig' | 'sehr_traurig';

const MILLISEKUNDEN_PRO_TAG = 24 * 60 * 60 * 1000;

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
}): Pflegestimmung {
  const ueberfaelligTage = Math.max(
    tageUeberfaellig(input.heute, input.zuletztGegossenAm, input.giessIntervallTage, input.seitWannBeobachten),
    tageUeberfaellig(input.heute, input.zuletztGeduengtAm, input.duengerIntervallTage, input.seitWannBeobachten),
  );

  if (ueberfaelligTage <= 0) return 'zufrieden';
  if (ueberfaelligTage <= 2) return 'neutral';
  if (ueberfaelligTage <= 5) return 'traurig';
  return 'sehr_traurig';
}

export const MAX_WUCHSSTUFE = 5;

export function berechneWuchsstufe(anzahlPflegeAktionen: number): number {
  if (anzahlPflegeAktionen < 0) {
    throw new Error('Anzahl Pflegeaktionen kann nicht negativ sein.');
  }
  return Math.min(anzahlPflegeAktionen, MAX_WUCHSSTUFE);
}
