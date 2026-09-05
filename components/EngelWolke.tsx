import {
  bestimmeFamilie,
  pflanzenSilhouette,
  ORIGINAL_MITTE,
  ORIGINAL_ERDE,
  type DarstellungsParameter,
} from '@/lib/garten/pflanzenzeichnung';

const POT_FARBE = '#c97b52';
const POT_FARBE_DUNKEL = '#a85f3c';
const LINIE_FARBE = '#3a2418';
const HALO_FARBE = '#f2c94c';

// Dieselbe Topf-Geometrie und derselbe Maßstab wie TopfMitGesicht — die
// Pflanze soll genauso aussehen wie zu Lebzeiten, nur eben mit friedlichem
// statt Pflegestimmungs-Gesicht. HIMMEL/BODEN geben zusätzlich Platz für
// Heiligenschein oben und Wolke unten, die es beim lebenden Topf nicht gibt.
const MITTE = 80;
const RAND = 132;
const HIMMEL = 60;
const BODEN = 250;
const VIEWBOX = `0 ${-HIMMEL} 160 ${BODEN + HIMMEL}`;
const MASSSTAB = 1.95;
const VERSCHIEBUNG_X = MITTE - ORIGINAL_MITTE * MASSSTAB;
const VERSCHIEBUNG_Y = RAND - ORIGINAL_ERDE * MASSSTAB;

function Wolke() {
  return (
    <g transform="translate(-9.25,178) scale(0.75)">
      <path
        d="M10 65 C0 55 0 35 15 28 C18 10 45 -2 68 5 C80 -8 100 -8 112 5 C130 -5 155 -5 168 8 C185 2 205 12 210 28 C225 25 235 40 228 52 C238 60 235 75 220 78 C225 88 205 92 195 80 C185 92 160 95 148 84 C130 94 105 95 95 85 C80 94 55 92 48 80 C35 88 15 82 10 65 Z"
        fill="#ffffff"
        stroke={LINIE_FARBE}
        strokeWidth={3}
      />
      <path d="M55 25 q10 -6 20 -1" stroke={LINIE_FARBE} strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.55} />
      <path d="M130 18 q10 -6 20 -1" stroke={LINIE_FARBE} strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.55} />
    </g>
  );
}

// Geschlossene Augen (kleine Bögen) und ein zufriedenes, sanftes Lächeln —
// bewusst derselbe Strich wie bei den Pflegestimmungs-Gesichtern
// (TopfMitGesicht), keine Wangen: die Pflanze ist gestorben, nicht fröhlich.
function FriedlichesGesicht() {
  return (
    <>
      <path d="M61 160 q4 -5 8 0" stroke={LINIE_FARBE} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M95 160 q4 -5 8 0" stroke={LINIE_FARBE} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M72 172 q10 7 20 0" stroke={LINIE_FARBE} strokeWidth={3} strokeLinecap="round" fill="none" />
    </>
  );
}

export function EngelWolke({
  id,
  wuchsstufe,
  name,
  art,
  darstellung,
}: {
  id: string;
  wuchsstufe: number;
  name: string;
  art?: string | null;
  darstellung?: DarstellungsParameter;
}) {
  const familie = bestimmeFamilie(id, name, art ?? null);
  const pflanzeSvg = pflanzenSilhouette(id, familie, wuchsstufe, darstellung ?? {});

  return (
    <svg viewBox={VIEWBOX} width="100%" height="100%" role="img" aria-label={`${name}, in liebevoller Erinnerung`}>
      <Wolke />
      <g transform={`translate(${VERSCHIEBUNG_X.toFixed(2)},${VERSCHIEBUNG_Y.toFixed(2)}) scale(${MASSSTAB.toFixed(3)})`}>
        <g dangerouslySetInnerHTML={{ __html: pflanzeSvg }} />
      </g>
      <path d="M35 132 H125 L112 190 H48 Z" fill={POT_FARBE} stroke={POT_FARBE_DUNKEL} strokeWidth={2} />
      <rect x="33" y="126" width="94" height="12" rx="4" fill={POT_FARBE_DUNKEL} />
      <FriedlichesGesicht />
      <ellipse cx={MITTE} cy="38" rx="33" ry="7" fill="none" stroke={HALO_FARBE} strokeWidth={3.5} />
    </svg>
  );
}
