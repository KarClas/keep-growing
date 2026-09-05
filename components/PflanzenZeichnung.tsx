import type { Pflanzenfamilie } from '@/lib/garten/pflanzenfamilie';

const STIEL_FARBE = '#4a7c4a';
const BLATT_FARBE = '#5f9e5f';
const BLATT_HELL = '#7fc17f';
const STAMM_FARBE = '#9a7b52';
const BLUETE_FARBEN = ['#d4569a', '#e8b33c', '#8e5aa8', '#e0762f'];

const MITTE = 80;
const RAND = 132; // Topfrand / Erdlinie

function hoeheFuerStufe(stufe: number): number {
  return 16 + stufe * 12;
}

function Stiel({ bisY }: { bisY: number }) {
  return <path d={`M${MITTE} ${RAND} V ${bisY}`} stroke={STIEL_FARBE} strokeWidth={4} strokeLinecap="round" fill="none" />;
}

function Blatt({ x, y, seite, farbe = BLATT_FARBE }: { x: number; y: number; seite: 1 | -1; farbe?: string }) {
  return (
    <ellipse cx={x} cy={y} rx={12} ry={7} fill={farbe} transform={`rotate(${seite * -25} ${x} ${y})`} />
  );
}

function Frucht({ familie, stufe }: { familie: 'busch'; stufe: number }) {
  const h = hoeheFuerStufe(stufe);
  const bisY = RAND - h;
  const paare = Array.from({ length: stufe }, (_, i) => i);
  return (
    <>
      {stufe > 0 && <Stiel bisY={bisY} />}
      {paare.map((i) => {
        const y = 122 - i * 12;
        const seite = i % 2 === 0 ? 1 : -1;
        return <Blatt key={i} x={MITTE + seite * 14} y={y} seite={seite} farbe={i % 2 ? BLATT_FARBE : BLATT_HELL} />;
      })}
      {stufe === 0 && <ellipse cx={MITTE} cy={122} rx={6} ry={4} fill={BLATT_FARBE} />}
    </>
  );
}

function BuschZeichnung({ stufe }: { stufe: number }) {
  return <Frucht familie="busch" stufe={stufe} />;
}

function FruchtZeichnung({ stufe, akzentfarbe }: { stufe: number; akzentfarbe: string }) {
  const anzahlFruechte = Math.max(0, Math.min(3, stufe - 1));
  const fruechte = Array.from({ length: anzahlFruechte }, (_, i) => i);
  return (
    <>
      <BuschZeichnung stufe={stufe} />
      {fruechte.map((i) => {
        const x = MITTE + (i % 2 ? 11 : -11);
        const y = RAND - 26 - i * 11;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={5.4} fill={akzentfarbe} />
            <circle cx={x - 1.7} cy={y - 1.8} r={1.5} fill="#fff" opacity={0.35} />
          </g>
        );
      })}
    </>
  );
}

function NadelZeichnung({ stufe }: { stufe: number }) {
  const h = hoeheFuerStufe(stufe);
  const bisY = RAND - h;
  const anzahl = stufe * 3;
  const nadeln = Array.from({ length: anzahl }, (_, i) => i);
  return (
    <>
      {stufe > 0 && <Stiel bisY={bisY} />}
      {nadeln.map((i) => {
        const y = RAND - 8 - (i * (h - 8)) / Math.max(1, anzahl);
        return (
          <path
            key={i}
            d={`M${MITTE} ${y} l -9 -5 M${MITTE} ${y} l 9 -5`}
            stroke={i % 2 ? BLATT_FARBE : BLATT_HELL}
            strokeWidth={1.8}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
    </>
  );
}

function HaengerZeichnung({ stufe }: { stufe: number }) {
  const laenge = 14 + stufe * 10;
  const anzahlBlatt = Math.max(1, stufe);
  return (
    <>
      <path d={`M${MITTE} ${RAND} L${MITTE} ${RAND - 8}`} stroke={STIEL_FARBE} strokeWidth={2.4} strokeLinecap="round" fill="none" />
      {[-1, 1].map((seite) => {
        const bahn = (t: number): [number, number] => [MITTE + seite * (18 * t + 14 * t * t), RAND - 8 + laenge * t * t];
        let d = `M ${MITTE} ${RAND - 8}`;
        for (let n = 1; n <= 10; n++) {
          const [px, py] = bahn(n / 10);
          d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        }
        return (
          <g key={seite}>
            <path d={d} stroke={STIEL_FARBE} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {Array.from({ length: anzahlBlatt }, (_, i) => {
              const t = (i + 1) / (anzahlBlatt + 1);
              const [x, y] = bahn(t);
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx={5.6}
                  ry={4}
                  fill={i % 2 ? BLATT_FARBE : BLATT_HELL}
                  transform={`rotate(${seite * 30} ${x} ${y})`}
                />
              );
            })}
          </g>
        );
      })}
    </>
  );
}

function SchwertZeichnung({ stufe }: { stufe: number }) {
  const anzahl = Math.max(3, Math.min(7, 3 + stufe));
  const h = hoeheFuerStufe(stufe);
  const blaetter = Array.from({ length: anzahl }, (_, i) => i);
  return (
    <>
      {blaetter.map((i) => {
        const w = -34 + (68 / (anzahl - 1)) * i;
        const laenge = h * (0.75 + 0.25 * Math.cos((w * Math.PI) / 90));
        return (
          <g key={i} transform={`translate(${MITTE},${RAND}) rotate(${w})`}>
            <path
              d={`M-3.2 0 C -1.8 ${(-laenge * 0.6).toFixed(1)} -1.4 ${(-laenge * 0.9).toFixed(1)} 0 ${(-laenge).toFixed(1)} C 1.4 ${(-laenge * 0.9).toFixed(1)} 1.8 ${(-laenge * 0.6).toFixed(1)} 3.2 0Z`}
              fill={i % 2 ? BLATT_FARBE : BLATT_HELL}
            />
          </g>
        );
      })}
    </>
  );
}

function MonsteraZeichnung({ stufe }: { stufe: number }) {
  const anzahl = Math.max(1, Math.min(3, stufe - 1));
  const h = hoeheFuerStufe(stufe);
  const blaetter = Array.from({ length: anzahl }, (_, i) => i);
  return (
    <>
      {stufe === 0 && <ellipse cx={MITTE} cy={122} rx={6} ry={4} fill={BLATT_FARBE} />}
      {blaetter.map((i) => {
        const seite = i % 2 ? 1 : -1;
        const x = MITTE + seite * (8 + i * 5);
        const y = RAND - 14 - (i * h) / (anzahl + 1);
        return (
          <g key={i}>
            <path
              d={`M${MITTE} ${RAND} Q ${MITTE + seite * 6} ${y + 8} ${x} ${y}`}
              stroke={STIEL_FARBE}
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
            />
            <g transform={`translate(${x},${y}) scale(${0.7 + i * 0.15})`}>
              <path
                d="M0 0 C -16 -4 -20 -18 -12 -26 C -4 -33 10 -31 16 -22 C 21 -14 14 -2 0 0Z"
                fill={i % 2 ? BLATT_FARBE : BLATT_HELL}
              />
              <path
                d="M-9 -8 L-3 -12 M-13 -18 L-6 -20 M-4 -25 L2 -22"
                stroke={STIEL_FARBE}
                strokeWidth={1.4}
                opacity={0.5}
                strokeLinecap="round"
              />
            </g>
          </g>
        );
      })}
    </>
  );
}

function BaumartigZeichnung({ stufe }: { stufe: number }) {
  const h = hoeheFuerStufe(stufe);
  const kopfY = RAND - h * 0.8;
  const canopy = Math.max(1, Math.min(5, stufe));
  return (
    <>
      <path
        d={`M${MITTE} ${RAND} C ${MITTE - 4} ${(RAND - h * 0.3).toFixed(1)}, ${MITTE + 4} ${(RAND - h * 0.6).toFixed(1)}, ${MITTE} ${kopfY.toFixed(1)}`}
        stroke={STAMM_FARBE}
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
      />
      {Array.from({ length: canopy }, (_, i) => {
        const seite = i % 2 ? 1 : -1;
        const x = MITTE + seite * (4 + i * 4);
        const y = kopfY - i * 3;
        return <ellipse key={i} cx={x} cy={y} rx={11} ry={8} fill={i % 2 ? BLATT_FARBE : BLATT_HELL} />;
      })}
    </>
  );
}

function BlueteZeichnung({ stufe, akzentfarbe }: { stufe: number; akzentfarbe: string }) {
  const h = hoeheFuerStufe(stufe);
  const bisY = RAND - h;
  const anzahlBluete = Math.max(0, Math.min(4, stufe));
  const farben = [akzentfarbe, ...BLUETE_FARBEN];
  return (
    <>
      {stufe > 0 && <Stiel bisY={bisY} />}
      {stufe > 0 && <Blatt x={MITTE - 12} y={RAND - 12} seite={-1} />}
      {stufe > 0 && <Blatt x={MITTE + 12} y={RAND - 12} seite={1} />}
      {Array.from({ length: anzahlBluete }, (_, i) => {
        const seite = i % 2 ? 1 : -1;
        const x = MITTE + seite * 10;
        const y = bisY + 8 + i * 10;
        const farbe = farben[i % farben.length];
        return (
          <g key={i} transform={`translate(${x},${y})`}>
            {[0, 72, 144, 216, 288].map((winkel) => (
              <ellipse key={winkel} cx={0} cy={-3.4} rx={2.4} ry={3.4} fill={farbe} transform={`rotate(${winkel})`} />
            ))}
            <circle r={1.4} fill="#ffe9a8" />
          </g>
        );
      })}
    </>
  );
}

function KaktusZeichnung({ stufe }: { stufe: number }) {
  const ketten = Math.max(1, Math.min(4, stufe));
  return (
    <>
      {Array.from({ length: ketten }, (_, k) => {
        const seite = k % 2 ? 1 : -1;
        const spreiz = 16 + (k % 3) * 6;
        const hoch = 14 + k * 6;
        const glieder = Math.min(4, 2 + Math.floor(stufe / 2));
        return (
          <g key={k}>
            {Array.from({ length: glieder }, (_, g) => {
              const t = glieder > 1 ? g / (glieder - 1) : 0;
              const x = MITTE + seite * spreiz * t;
              const y = RAND - 6 - hoch * Math.sin((Math.PI * t) / 2) + 10 * t * t;
              const dreh = seite * (10 + t * 60);
              return (
                <rect
                  key={g}
                  x={-3.2}
                  y={-5}
                  width={6.4}
                  height={10}
                  rx={3}
                  fill={g % 2 ? BLATT_FARBE : BLATT_HELL}
                  transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${dreh.toFixed(0)})`}
                />
              );
            })}
          </g>
        );
      })}
    </>
  );
}

export function PflanzenZeichnung({
  familie,
  wuchsstufe,
  akzentfarbe,
}: {
  familie: Pflanzenfamilie;
  wuchsstufe: number;
  akzentfarbe: string;
}) {
  switch (familie) {
    case 'frucht':
      return <FruchtZeichnung stufe={wuchsstufe} akzentfarbe={akzentfarbe} />;
    case 'nadel':
      return <NadelZeichnung stufe={wuchsstufe} />;
    case 'haenger':
      return <HaengerZeichnung stufe={wuchsstufe} />;
    case 'schwert':
      return <SchwertZeichnung stufe={wuchsstufe} />;
    case 'monstera':
      return <MonsteraZeichnung stufe={wuchsstufe} />;
    case 'baumartig':
      return <BaumartigZeichnung stufe={wuchsstufe} />;
    case 'bluete':
      return <BlueteZeichnung stufe={wuchsstufe} akzentfarbe={akzentfarbe} />;
    case 'kaktus':
      return <KaktusZeichnung stufe={wuchsstufe} />;
    case 'busch':
    default:
      return <BuschZeichnung stufe={wuchsstufe} />;
  }
}
