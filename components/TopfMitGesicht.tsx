import type { Pflegestimmung } from '@/lib/garten/berechnung';
import { bestimmeFamilie, bestimmeAkzentfarbe } from '@/lib/garten/pflanzenfamilie';
import { PflanzenZeichnung } from './PflanzenZeichnung';

const POT_FARBE = '#c97b52';
const POT_FARBE_DUNKEL = '#a85f3c';
const LINIE_FARBE = '#3a2418';

function Gesicht({ stimmung }: { stimmung: Pflegestimmung }) {
  switch (stimmung) {
    case 'zufrieden':
      return (
        <g stroke={LINIE_FARBE} strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M62 158 q6 -8 12 0" />
          <path d="M96 158 q6 -8 12 0" />
          <path d="M68 172 q12 12 24 0" />
        </g>
      );
    case 'neutral':
      return (
        <g>
          <circle cx="68" cy="160" r="3.5" fill={LINIE_FARBE} />
          <circle cx="102" cy="160" r="3.5" fill={LINIE_FARBE} />
          <path d="M70 176 h20" stroke={LINIE_FARBE} strokeWidth={3} strokeLinecap="round" fill="none" />
        </g>
      );
    case 'traurig':
      return (
        <g stroke={LINIE_FARBE} strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M62 163 q6 6 12 0" />
          <path d="M96 163 q6 6 12 0" />
          <path d="M68 184 q12 -10 24 0" />
        </g>
      );
    case 'sehr_traurig':
      return (
        <g strokeLinecap="round" fill="none">
          <path d="M60 160 q8 10 14 2" stroke={LINIE_FARBE} strokeWidth={3} />
          <path d="M94 160 q8 10 14 2" stroke={LINIE_FARBE} strokeWidth={3} />
          <path d="M66 188 q14 -14 28 0" stroke={LINIE_FARBE} strokeWidth={3} />
          <path d="M64 166 v10" stroke="#7fb2e0" strokeWidth={2.5} />
          <path d="M104 166 v10" stroke="#7fb2e0" strokeWidth={2.5} />
        </g>
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
      aria-label={name ? `${name}, Pflegestimmung: ${stimmung}` : `Pflegestimmung: ${stimmung}`}
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
