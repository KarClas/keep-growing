import type { Pflegestimmung } from '@/lib/garten/berechnung';
import { bestimmeFamilie, bestimmeAkzentfarbe } from '@/lib/garten/pflanzenfamilie';
import { PflanzenZeichnung } from './PflanzenZeichnung';

const POT_FARBE = '#c97b52';
const POT_FARBE_DUNKEL = '#a85f3c';
const LINIE_FARBE = '#3a2418';
const AUGE_GLANZ_FARBE = '#fefaf3';
const WANGE_FARBE = '#e98a9a';
const SCHWEISS_FARBE = '#6fa8dc';

const STIMMUNG_BESCHREIBUNG: Record<Pflegestimmung, string> = {
  sehr_gluecklich: 'sehr glücklich',
  sehr_gluecklich_geerntet: 'sehr glücklich, gerade geerntet',
  zufrieden: 'zufrieden',
  traurig: 'traurig',
  verzweifelt: 'verzweifelt',
  wuetend: 'wütend',
};

// Große, glänzende Augen — nur für die Freude-Auslöser (Gießen, Düngen,
// Ernten). Der Größenunterschied zu den kleinen Punktaugen ist bewusst das
// Signal, kein Zufall.
function Kulleraugen() {
  return (
    <>
      <circle cx="65" cy="156" r="9" fill={LINIE_FARBE} />
      <circle cx="99" cy="156" r="9" fill={LINIE_FARBE} />
      <circle cx="62" cy="153" r="2.8" fill={AUGE_GLANZ_FARBE} />
      <circle cx="96" cy="153" r="2.8" fill={AUGE_GLANZ_FARBE} />
    </>
  );
}

function Punktaugen() {
  return (
    <>
      <circle cx="65" cy="160" r="3.5" fill={LINIE_FARBE} />
      <circle cx="99" cy="160" r="3.5" fill={LINIE_FARBE} />
    </>
  );
}

// Ein Mund, ein Parameter: gleiche Basislinie (x 72–92, y 172) für alle
// Pflegezustands-Gesichter — nur Tiefe und Richtung ändern sich. "traurig"
// ist buchstäblich der an dieser Linie gespiegelte "zufrieden"-Mund.
function Mund({ tiefe, strichstaerke = 3 }: { tiefe: number; strichstaerke?: number }) {
  return (
    <path
      d={`M72 172 q10 ${tiefe} 20 0`}
      stroke={LINIE_FARBE}
      strokeWidth={strichstaerke}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function Wangen() {
  return (
    <>
      <ellipse cx="55" cy="172" rx="9" ry="4.5" fill={WANGE_FARBE} opacity={0.9} />
      <ellipse cx="105" cy="172" rx="9" ry="4.5" fill={WANGE_FARBE} opacity={0.9} />
    </>
  );
}

// Eine Braue, zwei Varianten, gespiegelt um dieselbe Mittelachse wie die
// Augen. "sorge": Innenseite hoch (Sorgenfalte). "wut": Innenseite tief
// (Zornesfalte) — die klassische Richtung für Wut.
function Brauen({ art }: { art: 'sorge' | 'wut' }) {
  const d =
    art === 'wut'
      ? 'M52 146 Q62 150 74 157 M90 157 Q102 150 112 146'
      : 'M52 157 Q62 150 74 145 M90 145 Q102 150 112 157';
  return <path d={d} stroke={LINIE_FARBE} strokeWidth={3} strokeLinecap="round" fill="none" />;
}

function Schweisstropfen() {
  return <path d="M116 130 q7 8 7 14 a3.5 3.5 0 1 1 -7 0 q0 -6 0 -14 Z" fill={SCHWEISS_FARBE} />;
}

function Gesicht({ stimmung }: { stimmung: Pflegestimmung }) {
  switch (stimmung) {
    case 'sehr_gluecklich':
      return (
        <>
          <Kulleraugen />
          <path d="M76 172 q6 12 12 0" stroke={LINIE_FARBE} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </>
      );
    case 'sehr_gluecklich_geerntet':
      return (
        <>
          <Kulleraugen />
          <path d="M76 172 q6 12 12 0" stroke={LINIE_FARBE} strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <Wangen />
        </>
      );
    case 'zufrieden':
      return (
        <>
          <Punktaugen />
          <Mund tiefe={7} />
        </>
      );
    case 'traurig':
      return (
        <>
          <Punktaugen />
          <Mund tiefe={-7} />
        </>
      );
    case 'verzweifelt':
      return (
        <>
          <Punktaugen />
          <Brauen art="sorge" />
          <Mund tiefe={-10} />
          <Schweisstropfen />
        </>
      );
    case 'wuetend':
      return (
        <>
          <Punktaugen />
          <Brauen art="wut" />
          <Mund tiefe={-13} strichstaerke={4} />
        </>
      );
  }
}

export function TopfMitGesicht({
  wuchsstufe,
  stimmung,
  name,
  art,
}: {
  wuchsstufe: number;
  stimmung: Pflegestimmung;
  name?: string;
  art?: string | null;
}) {
  const familie = bestimmeFamilie(name ?? '', art ?? null);
  const akzentfarbe = bestimmeAkzentfarbe(name ?? '', art ?? null);

  return (
    <svg
      viewBox="0 0 160 200"
      width="100%"
      height="100%"
      role="img"
      aria-label={
        name
          ? `${name}, Pflegestimmung: ${STIMMUNG_BESCHREIBUNG[stimmung]}`
          : `Pflegestimmung: ${STIMMUNG_BESCHREIBUNG[stimmung]}`
      }
    >
      <g>
        <PflanzenZeichnung familie={familie} wuchsstufe={wuchsstufe} akzentfarbe={akzentfarbe} />
      </g>

      <path d="M35 132 H125 L112 190 H48 Z" fill={POT_FARBE} stroke={POT_FARBE_DUNKEL} strokeWidth={2} />
      <rect x="33" y="126" width="94" height="12" rx="4" fill={POT_FARBE_DUNKEL} />

      <Gesicht stimmung={stimmung} />
    </svg>
  );
}
