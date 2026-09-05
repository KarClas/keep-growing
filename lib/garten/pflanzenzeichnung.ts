/**
 * Pflanzen-Silhouetten je Art — angepasst aus dem Zeichensystem der
 * Vorgänger-App ("Annes Pflanzenparadies", lib/garten/portraet.ts), auf
 * ausdrücklichen Wunsch des Teams 1:1 in der Optik übernommen (nicht neu
 * erfunden). Angepasst an keep-growings eigene Wuchsstufen-Skala (0–5 statt
 * 1–7) und Datenmodell — die Formen, Farben und Proportionen sind dieselben.
 */

export interface DarstellungsParameter {
  mindeststufe?: number;
  wuchshoehe?: number;
  dichte?: number;
  blattBonus?: number;
  triebKuerzen?: number;
  sonderfrucht?: 'kaese' | 'biene';
  bluetenGroesse?: number;
  blueht?: boolean;
  verzweigt?: boolean;
  pflanzenImTopf?: number;
  topfMit?: string;
}

export type Pflanzenfamilie =
  | 'frucht'
  | 'busch'
  | 'nadel'
  | 'haenger'
  | 'schwert'
  | 'monstera'
  | 'pilea'
  | 'drachenbaum'
  | 'geldbaum'
  | 'weihnachtskaktus'
  | 'orchidee'
  | 'bluete';

/** Bekannte IDs aus dem Anne-Import bekommen exakt dieselbe Silhouette wie im Original. */
const FAMILIE_NACH_ID: Record<string, Pflanzenfamilie> = {
  ufopflanze: 'pilea',
  zimmerpalme: 'drachenbaum', // historische ID, ist inzwischen ein Drachenbaum
  geldbaum: 'geldbaum',
  weihnachtskaktus: 'weihnachtskaktus',
  orchidee: 'orchidee',
  monstera: 'monstera',
  bogenhanf: 'schwert',
  celosia: 'bluete',
  rosmarin: 'nadel',
  zitronenthymian: 'nadel',
  wasserlilien: 'schwert',
  tomaten: 'frucht',
  'tomaten-2': 'frucht',
  paprika: 'frucht',
  habanero: 'frucht',
  stachelbeere: 'frucht',
  erdbeeren: 'frucht',
  avocados: 'frucht',
  'avocado-saemlinge': 'frucht',
  kartoffeln: 'frucht',
  'kartoffeln-2': 'frucht',
  suesskartoffel: 'haenger',
  efeututen: 'haenger',
  minze: 'haenger',
  grapefruitminze: 'haenger',
  erdbeerminze: 'haenger',
  kaesekraut: 'haenger',
  calibrachoa: 'haenger',
};

/** Neu angelegte Pflanzen (Scanner, von Hand) haben keine bekannte ID — Fallback über Schlüsselwörter/Kategorie. */
const SCHLUESSELWORT_FAMILIE: Array<[string, Pflanzenfamilie]> = [
  ['monstera', 'monstera'],
  ['drachenbaum', 'drachenbaum'],
  ['geldbaum', 'geldbaum'],
  ['weihnachtskaktus', 'weihnachtskaktus'],
  ['orchidee', 'orchidee'],
  ['bogenhanf', 'schwert'],
  ['wasserlilie', 'schwert'],
  ['spathiphyllum', 'schwert'],
  ['pilea', 'pilea'],
  ['ufopflanze', 'pilea'],
  ['rosmarin', 'nadel'],
  ['thymian', 'nadel'],
  ['tomate', 'frucht'],
  ['kartoffel', 'frucht'],
  ['paprika', 'frucht'],
  ['chili', 'frucht'],
  ['habanero', 'frucht'],
  ['erdbeer', 'frucht'],
  ['stachelbeer', 'frucht'],
  ['avocado', 'frucht'],
  ['celosia', 'bluete'],
  ['calibrachoa', 'haenger'],
  ['blume', 'bluete'],
  ['süsskartoffel', 'haenger'],
  ['süßkartoffel', 'haenger'],
  ['efeu', 'haenger'],
  ['minze', 'haenger'],
];

function familieAusKategorie(kategorie: string | null): Pflanzenfamilie {
  // Nur "Blume" weicht vom busche Standardlook ab — das Original kennt sonst
  // keine Kategorie-Vermutung, nur die explizite ID- bzw. Schlüsselwortliste.
  return kategorie === 'Blume' ? 'bluete' : 'busch';
}

export function bestimmeFamilie(id: string, name: string, art: string | null): Pflanzenfamilie {
  if (FAMILIE_NACH_ID[id]) return FAMILIE_NACH_ID[id];
  const text = `${name} ${art ?? ''}`.toLowerCase();
  for (const [wort, familie] of SCHLUESSELWORT_FAMILIE) {
    if (text.includes(wort)) return familie;
  }
  return familieAusKategorie(art);
}

type FruchtTyp = 'tomate' | 'birne' | 'schote' | 'herz' | 'gestreift';

/** Fruchtform je Art — statt immer derselben Kugel, egal was dranhängt. */
const FRUCHTTYP: Array<[string, FruchtTyp, string]> = [
  ['tomaten', 'tomate', '#C4482F'],
  ['paprika', 'birne', '#B8443A'],
  ['habanero', 'schote', '#E08A2E'],
  ['erdbeeren', 'herz', '#C8394B'],
  ['stachelbeer', 'gestreift', '#9BB84A'],
  ['avocado', 'birne', '#5C6B3A'],
];

function bestimmeFruchtTyp(pflanzeId: string): { typ: FruchtTyp; farbe: string } | null {
  for (const [wort, typ, farbe] of FRUCHTTYP) {
    if (pflanzeId.includes(wort)) return { typ, farbe };
  }
  return null;
}

function fruchtRund(x: number, y: number, farbe: string): string {
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="${farbe}"/>
    <circle cx="${(x - 1.6).toFixed(1)}" cy="${(y - 1.8).toFixed(1)}" r="1.4" fill="#fff" opacity=".3"/>`;
}

function fruchtTomate(x: number, y: number, farbe: string): string {
  const kelch = [0, 72, 144, 216, 288]
    .map((a) => {
      const rad = (a * Math.PI) / 180;
      return `<path d="M0 0 L${(Math.sin(rad) * 2.4).toFixed(1)} ${(-Math.cos(rad) * 2.4).toFixed(1)}" stroke="#5C7A3A" stroke-width="1" stroke-linecap="round"/>`;
    })
    .join('');
  return `${fruchtRund(x, y, farbe)}<g transform="translate(${x.toFixed(1)},${(y - 4.3).toFixed(1)})">${kelch}</g>`;
}

function fruchtBirne(x: number, y: number, farbe: string): string {
  return `<path d="M${x.toFixed(1)} ${(y - 5.5).toFixed(1)} C ${(x + 4).toFixed(1)} ${(y - 4).toFixed(1)} ${(x + 4.5).toFixed(1)} ${(y + 3).toFixed(1)} ${x.toFixed(1)} ${(y + 5.5).toFixed(1)} C ${(x - 4.5).toFixed(1)} ${(y + 3).toFixed(1)} ${(x - 4).toFixed(1)} ${(y - 4).toFixed(1)} ${x.toFixed(1)} ${(y - 5.5).toFixed(1)}Z" fill="${farbe}"/>
    <path d="M${x.toFixed(1)} ${(y - 5.5).toFixed(1)} v-2" stroke="#5C7A3A" stroke-width="1.2" stroke-linecap="round"/>`;
}

function fruchtSchote(x: number, y: number, farbe: string, dreh: number): string {
  return `<path d="M0 -5.2 C 2.6 -3 3 2 0.6 5.6 C 0 3 -1 -2 0 -5.2Z" fill="${farbe}" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${dreh})"/>`;
}

function fruchtHerz(x: number, y: number, farbe: string): string {
  const samen = [
    [-1.5, -1],
    [1.5, -1],
    [0, 1.6],
    [-2.1, 1.2],
    [2.1, 1.2],
  ]
    .map(([dx, dy]) => `<circle cx="${(x + dx).toFixed(1)}" cy="${(y + dy).toFixed(1)}" r=".5" fill="#FFE9A8"/>`)
    .join('');
  return `<path d="M${x.toFixed(1)} ${(y + 4.5).toFixed(1)} C ${(x - 5).toFixed(1)} ${(y - 1).toFixed(1)} ${(x - 3).toFixed(1)} ${(y - 5.5).toFixed(1)} ${x.toFixed(1)} ${(y - 2.2).toFixed(1)} C ${(x + 3).toFixed(1)} ${(y - 5.5).toFixed(1)} ${(x + 5).toFixed(1)} ${(y - 1).toFixed(1)} ${x.toFixed(1)} ${(y + 4.5).toFixed(1)}Z" fill="${farbe}"/>${samen}`;
}

function fruchtGestreift(x: number, y: number, farbe: string): string {
  return `${fruchtRund(x, y, farbe)}<path d="M${(x - 2.5).toFixed(1)} ${(y - 3).toFixed(1)} q1 3 0 6 M${x.toFixed(1)} ${(y - 3.6).toFixed(1)} q.5 3.6 0 7.2 M${(x + 2.5).toFixed(1)} ${(y - 3).toFixed(1)} q-1 3 0 6" stroke="#6E8A3A" stroke-width=".6" opacity=".6" fill="none"/>`;
}

function zeichneFrucht(typ: FruchtTyp, x: number, y: number, farbe: string, index: number): string {
  switch (typ) {
    case 'tomate':
      return fruchtTomate(x, y, farbe);
    case 'birne':
      return fruchtBirne(x, y, farbe);
    case 'schote':
      return fruchtSchote(x, y, farbe, index % 2 ? 22 : -22);
    case 'herz':
      return fruchtHerz(x, y, farbe);
    case 'gestreift':
      return fruchtGestreift(x, y, farbe);
  }
}

type BuschBlattTyp = 'blatt' | 'roehre' | 'feder';

const BLATT_TYP_SCHLUESSEL: Record<BuschBlattTyp, string[]> = {
  blatt: ['basilikum', 'kaesekraut', 'brassica', 'rucola'],
  feder: ['koriander'],
  roehre: ['zwiebel', 'fruehlingszwiebel', 'kraehen'],
};

/** Kräuter sehen botanisch sehr verschieden aus — nicht alle als dieselbe Halmform zeichnen. */
function bestimmeBuschBlattTyp(pflanzeId: string): BuschBlattTyp {
  for (const [typ, woerter] of Object.entries(BLATT_TYP_SCHLUESSEL) as [BuschBlattTyp, string[]][]) {
    if (woerter.some((wort) => pflanzeId.includes(wort))) return typ;
  }
  return 'roehre'; // schmaler Halm bleibt der sichere Standardlook
}

function blattRoehre(l: number, farbe: string): string {
  return `<path d="M0 0 C -5 ${(-l * 0.5).toFixed(1)} -3 ${(-l * 0.85).toFixed(1)} 0 ${(-l).toFixed(1)} C 3 ${(-l * 0.85).toFixed(1)} 5 ${(-l * 0.5).toFixed(1)} 0 0Z" fill="${farbe}"/>`;
}

function blattBreit(l: number, farbe: string): string {
  const laenge = l * 0.82;
  return `<path d="M0 0 C -9 ${(-laenge * 0.3).toFixed(1)} -8 ${(-laenge * 0.72).toFixed(1)} 0 ${(-laenge).toFixed(1)} C 8 ${(-laenge * 0.72).toFixed(1)} 9 ${(-laenge * 0.3).toFixed(1)} 0 0Z" fill="${farbe}"/>
    <path d="M0 ${(-laenge * 0.15).toFixed(1)} L0 ${(-laenge * 0.88).toFixed(1)}" stroke="${STIEL}" stroke-width=".5" opacity=".35"/>`;
}

function blattFeder(l: number, farbe: string): string {
  return `<path d="M0 0 C -2.5 ${(-l * 0.5).toFixed(1)} -1.5 ${(-l * 0.85).toFixed(1)} 0 ${(-l).toFixed(1)} C 1.5 ${(-l * 0.85).toFixed(1)} 2.5 ${(-l * 0.5).toFixed(1)} 0 0Z" fill="${farbe}"/>`;
}

function zeichneBuschBlatt(typ: BuschBlattTyp, l: number, farbe: string): string {
  switch (typ) {
    case 'blatt':
      return blattBreit(l, farbe);
    case 'feder':
      return blattFeder(l, farbe);
    case 'roehre':
      return blattRoehre(l, farbe);
  }
}

const BLUETENFARBE: Record<string, string[]> = {
  calibrachoa: ['#D4569A', '#E8B33C', '#E0762F', '#8E5AA8', '#C8394B'],
  celosia: ['#B8397A', '#D4569A'],
  strauchbasilikum: ['#D4569A', '#C0508E', '#E07AB0'],
  orchidee: ['#EBBBD4', '#E4A6C6', '#EBBBD4', '#E4A6C6'],
};

const BLATT = '#6E9B53';
const STIEL = '#4F7038';
const HELL = '#87B268';

// keep-growing zählt Wuchsstufen 0–5; das Original 1–7. Dieselbe Formel-Form
// (Anteil an der Spanne), nur mit unserer eigenen Spannweite.
const MAX_STUFE_ORT = 6;

/**
 * Koordinatensystem des Originals: Topf-Mitte, Erdlinie und Topf-Randbreite
 * in dessen eigenem Maßstab. Alle portierten Pixelwerte (Blattgrößen,
 * Kurven, Radien) bleiben dadurch unverändert — TopfMitGesicht gleicht den
 * Maßstab über eine einzige Skalierung zum größeren keep-growing-Topf aus,
 * statt jede Zahl einzeln neu zu berechnen.
 */
export const ORIGINAL_MITTE = 37;
export const ORIGINAL_ERDE = 78;
export const ORIGINAL_TOPFBREITE = 34;

function mitteZuerst(winkel: number[]) {
  const platz: Record<number, number> = {};
  winkel
    .map((w, i) => ({ w, i }))
    .sort((a, b) => Math.abs(a.w) - Math.abs(b.w))
    .forEach((o, r) => {
      platz[o.i] = r;
    });
  return platz;
}

function bluete(x: number, y: number, farbe: string, gr: number) {
  const bl = Array.from(
    { length: 5 },
    (_, i) => `<ellipse cx="0" cy="-3.1" rx="2.05" ry="3.1" fill="${farbe}" transform="rotate(${i * 72})"/>`,
  ).join('');
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${gr})">${bl}<circle r="1.25" fill="#FFE9A8"/></g>`;
}

function orchidbluete(x: number, y: number, gr: number, farbe: string, lippe: string) {
  const bl = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="0" cy="-4" rx="2.5" ry="4" fill="${farbe}" transform="rotate(${a})"/>`)
    .join('');
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${gr})">${bl}
    <path d="M0 1.6 c -2.6 0 -3.6 2 -2.6 3.6 c 1 1.6 4.2 1.6 5.2 0 c 1 -1.6 0 -3.6 -2.6 -3.6Z" fill="${lippe}"/>
    <circle r="1.2" fill="#FFF3D0"/></g>`;
}

function biene(x: number, y: number, gr: number, dreh: number) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${dreh}) scale(${gr})">
    <ellipse cx="-1.4" cy="-2.6" rx="3.1" ry="1.9" fill="#F2F6FF" opacity=".8" transform="rotate(-24 -1.4 -2.6)"/>
    <ellipse cx="1.6" cy="-2.8" rx="2.7" ry="1.7" fill="#F2F6FF" opacity=".8" transform="rotate(20 1.6 -2.8)"/>
    <ellipse rx="3.6" ry="2.5" fill="#E8B33C"/>
    <path d="M-1.1 -2.3 v4.6 M1.1 -2.1 v4.2" stroke="#3A2E12" stroke-width="1.1" stroke-linecap="round"/>
    <circle cx="-3.2" cy="-.4" r="1.1" fill="#3A2E12"/>
  </g>`;
}

function kaese(x: number, y: number, gr: number, dreh: number) {
  return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${dreh}) scale(${gr})">
    <path d="M-5 3.4 L4.6 3.4 L4.6 -1 Q-0.6 -4.2 -5 -1 Z" fill="#E8C34A" stroke="#C9A02E" stroke-width=".8" stroke-linejoin="round"/>
    <circle cx="-1.6" cy="1.4" r="1.15" fill="#C9A02E" opacity=".75"/>
    <circle cx="2.2" cy="0.2" r=".8" fill="#C9A02E" opacity=".75"/>
  </g>`;
}

/**
 * Zeichnet die Pflanze (ohne Topf) als SVG-Fragment im Koordinatensystem des
 * Originals (ORIGINAL_MITTE/ORIGINAL_ERDE) — unveränderte Pixelwerte, exakt
 * wie dort. Die aufrufende Stelle skaliert das Ergebnis auf die Größe von
 * keep-growings eigenem Topf (siehe ORIGINAL_TOPFBREITE).
 */
export function pflanzenSilhouette(
  pflanzeId: string,
  familie: Pflanzenfamilie,
  wuchsstufe: number,
  darstellung: DarstellungsParameter,
): string {
  const mitte = ORIGINAL_MITTE;
  const erde = ORIGINAL_ERDE;
  const st = wuchsstufe + 1; // unsere Skala ist 0-basiert, das Original 1-basiert
  const h = (27 + (44 * (st - 1)) / (MAX_STUFE_ORT - 1)) * (darstellung.wuchshoehe || 1);
  const oben = erde - h;

  const teil = (stufe: number, inhalt: string) => `<g class="wuchs${st < stufe ? ' zu' : ''}">${inhalt}</g>`;
  const teilWenn = (da: boolean, inhalt: string) => `<g class="wuchs${da ? '' : ' zu'}">${inhalt}</g>`;

  const silhouette = (): string => {
    let pflanze = '';

    if (familie === 'frucht') {
      pflanze += `<path d="M${mitte} ${erde} L${mitte} ${oben}" stroke="${STIEL}" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
      for (let i = 0; i < st + 1; i++) {
        const y = erde - 8 - (i * (h - 10)) / (st + 1);
        const s = 0.85 - i * 0.07;
        pflanze += teil(
          i,
          `<path d="M${mitte} ${y} c -6 -7 -15 -8 -20 -3 c 5 6 14 7 20 3Z" fill="${BLATT}" transform="scale(${s}) translate(${mitte * (1 / s - 1)},${y * (1 / s - 1)})"/>
        <path d="M${mitte} ${y} c 6 -7 15 -8 20 -3 c -5 6 -14 7 -20 3Z" fill="${HELL}" transform="scale(${s}) translate(${mitte * (1 / s - 1)},${y * (1 / s - 1)})"/>`,
        );
      }
      if (darstellung.verzweigt && st >= 5) {
        for (const dir of [-1, 1]) {
          const y0 = oben + h * 0.3,
            ex = mitte + dir * 17,
            ey = oben + h * 0.04;
          pflanze += teil(
            5,
            `<path d="M${mitte} ${y0.toFixed(1)} Q ${mitte + dir * 11} ${(y0 - 7).toFixed(1)} ${ex} ${ey.toFixed(1)}"
          stroke="${STIEL}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
          );
          for (let k = 0; k < 3; k++) {
            const tt = (k + 1) / 3.3;
            const bx = mitte + dir * 17 * tt,
              by = y0 + (ey - y0) * tt;
            pflanze += teil(
              5 + (k > 1 ? 1 : 0),
              `<path d="M${bx.toFixed(1)} ${by.toFixed(1)} c ${dir * 5} -7 ${dir * 13} -8 ${dir * 17} -3 c ${-dir * 5} 6 ${-dir * 13} 7 ${-dir * 17} 3Z"
                  fill="${k % 2 ? BLATT : HELL}"/>`,
            );
          }
        }
      }
      const fruchtInfo = bestimmeFruchtTyp(pflanzeId);
      for (let i = 0; fruchtInfo && i < 3; i++) {
        const y = erde - 20 - i * 12,
          x = mitte + (i % 2 ? 9 : -9);
        pflanze += teil(3 + (i > 1 ? 1 : 0), zeichneFrucht(fruchtInfo.typ, x, y, fruchtInfo.farbe, i));
      }
    } else if (familie === 'busch') {
      const blattTyp = bestimmeBuschBlattTyp(pflanzeId);
      // Breite Blätter (Basilikum & Co.) wirken als dichter Halm-Tuff überladen
      // — als wenige, große Blätter statt vieler schmaler sehen sie botanisch
      // richtiger aus.
      const dichteBasis = blattTyp === 'blatt' ? 9 : blattTyp === 'feder' ? 15 : 13;
      const N = Math.round(dichteBasis * (darstellung.dichte || 1));
      const sichtbar = Math.max(
        3,
        Math.min(
          N,
          Math.round(N * (0.23 + (0.77 * (st - 1)) / (MAX_STUFE_ORT - 1))) + (darstellung.blattBonus || 0),
        ),
      );
      // Schmaler als im Original (80°): bei keep-growings Kartengröße würde
      // ein so breiter Fächer bei voller Wuchsstufe über den Bildrand
      // hinausragen. 35° hält die Fächerform, bleibt aber innerhalb des Rahmens.
      const faecher = (darstellung.pflanzenImTopf || 1) > 1 ? 30 : 35;
      const grenze = (darstellung.pflanzenImTopf || 1) > 1 ? 30 : 33;
      const winkel = Array.from({ length: N }, (_, i) => {
        const w = -faecher + ((2 * faecher) / (N - 1)) * i;
        return Math.max(-grenze, Math.min(grenze, w));
      });
      const platz = mitteZuerst(winkel);
      for (let i = 0; i < N; i++) {
        const w = winkel[i];
        const l = h * (0.56 + 0.44 * Math.cos((w * Math.PI) / 200));
        const zu = platz[i] >= sichtbar;
        pflanze += `<g class="wuchs${zu ? ' zu' : ''}">
        <g transform="translate(${mitte},${erde}) rotate(${w})">
        ${zeichneBuschBlatt(blattTyp, l, i % 2 ? BLATT : HELL)}</g></g>`;

        const bogen = (w * Math.PI) / 180;
        const sx = mitte + l * Math.sin(bogen),
          sy = erde - l * Math.cos(bogen);
        const farben = BLUETENFARBE[pflanzeId];
        if (farben)
          pflanze += `<g class="wuchs${zu ? ' zu' : ''}">${bluete(sx, sy, farben[i % farben.length], darstellung.bluetenGroesse || 0.9)}</g>`;
        if (darstellung.sonderfrucht === 'kaese' && !zu && i % 2 === 0) pflanze += teil(3, kaese(sx, sy + 2, 0.9, w * 0.4));
        if (darstellung.sonderfrucht === 'biene' && i % 3 === 1) pflanze += teil(3, biene(sx + (i % 2 ? 5 : -5), sy - 5, 0.95, w * 0.3));
      }
    } else if (familie === 'haenger') {
      pflanze += `<path d="M${mitte} ${erde} L${mitte} ${erde - 10}" stroke="${STIEL}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
      const kuerzer = darstellung.triebKuerzen || 0;
      const anzahlBlatt = Math.max(1, st + 1 - kuerzer);
      for (const dir of [-1, 1]) {
        const len = 12 + st * 9;
        // 16/20 statt 16/22: minimal enger, damit der äußerste Trieb bei
        // voller Wuchsstufe mit Sicherheitsabstand innerhalb des Rahmens bleibt.
        const bahn = (tt: number): [number, number] => [mitte + dir * (16 * tt + 20 * tt * tt), erde - 16 + len * tt * tt + 6 * tt];
        const tEnde = anzahlBlatt / (st + 2);
        let d = `M ${mitte} ${erde - 8}`;
        for (let n = 1; n <= 14; n++) {
          const [px, py] = bahn((tEnde * n) / 14);
          d += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
        }
        pflanze += teil(1, `<path d="${d}" stroke="${STIEL}" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
        const farben = BLUETENFARBE[pflanzeId];
        for (let i = 0; i < anzahlBlatt; i++) {
          const t = (i + 1) / (st + 2);
          const [x, y] = bahn(t);
          pflanze += teil(
            i,
            `<ellipse cx="${x}" cy="${y}" rx="6.2" ry="4.4" fill="${i % 2 ? BLATT : HELL}" transform="rotate(${dir * 34} ${x} ${y})"/>`,
          );
          if (farben) {
            const versatz = dir < 0 ? 0 : farben.length - 2;
            pflanze += teil(i, bluete(x + dir * 7, y - 4, farben[(i + versatz) % farben.length], darstellung.bluetenGroesse || 0.95));
          }
          if (darstellung.sonderfrucht === 'kaese' && i >= 1) {
            pflanze += teil(i + 2, kaese(x + dir * 7.5, y + 3, 0.92, dir * 12 + (i % 2 ? -8 : 6)));
          }
        }
        if (BLUETENFARBE[pflanzeId])
          pflanze += teil(1, bluete(mitte + dir * 5, erde - 14, BLUETENFARBE[pflanzeId][dir < 0 ? 1 : 3], (darstellung.bluetenGroesse || 0.95) * 1.1));
      }
    } else if (familie === 'monstera') {
      for (let i = 0; i < st; i++) {
        const dir = i % 2 ? 1 : -1,
          // Enger gestaffelt als im Original (dort +4/+0.13 je Blatt): bei
          // sechs Blättern in voller Größe ragte das äußerste sonst seitlich
          // über den Bildrand hinaus.
          gr = 0.5 + i * 0.1;
        const x = mitte + dir * (5 + i * 2.5),
          y = erde - 12 - i * (h / (st + 1));
        pflanze += teil(
          i,
          `<path d="M${mitte} ${erde} Q ${mitte + dir * 6} ${y + 8} ${x} ${y}" stroke="${STIEL}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <g transform="translate(${x},${y}) scale(${gr})">
          <path d="M0 0 C -16 -4 -20 -18 -12 -26 C -4 -33 10 -31 16 -22 C 21 -14 14 -2 0 0Z" fill="${BLATT}"/>
          <path d="M-9 -8 L-3 -12 M-13 -18 L-6 -20 M-4 -25 L2 -22 M8 -24 L6 -17" stroke="${STIEL}" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>
        </g>`,
        );
      }
    } else if (familie === 'pilea') {
      const N = Math.max(2, Math.min(5, Math.round((3 + st) * (darstellung.dichte || 1)) - 2));
      for (let i = 0; i < N; i++) {
        const dir = i % 2 ? 1 : -1;
        const gr = 0.46 + (i % 3) * 0.08;
        const x = mitte + dir * (4 + i * 2.3);
        const y = erde - 12 - i * (h / (N + 0.5));
        pflanze += teil(
          Math.ceil((i + 1) / 2.2),
          `<path d="M${mitte} ${erde} Q ${mitte + dir * 6} ${(y + 8).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" stroke="${STIEL}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${gr.toFixed(2)})">
          <path d="M0 0 C -16 -4 -20 -18 -12 -26 C -4 -33 10 -31 16 -22 C 21 -14 14 -2 0 0Z" fill="${i % 2 ? BLATT : HELL}"/>
          <circle cx="0.5" cy="-15" r="1.8" fill="${STIEL}" opacity=".45"/>
        </g>`,
        );
      }
    } else if (familie === 'drachenbaum') {
      const stammH = h * 0.48,
        kopfY = erde - stammH;
      pflanze += `<path d="M${mitte} ${erde} C ${mitte - 4} ${(erde - stammH * 0.35).toFixed(1)}, ${mitte + 4} ${(erde - stammH * 0.72).toFixed(1)}, ${mitte} ${kopfY.toFixed(1)}"
      stroke="#9A7B52" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      const N = Math.round(9 * (darstellung.dichte || 1));
      const sichtbar = Math.max(4, Math.min(N, Math.round(N * (0.4 + (0.6 * (st - 1)) / (MAX_STUFE_ORT - 1)))));
      const winkel = Array.from({ length: N }, (_, i) => -80 + (160 / (N - 1)) * i);
      const platz = mitteZuerst(winkel);
      for (let i = 0; i < N; i++) {
        const w = winkel[i],
          b = (w * Math.PI) / 180;
        const l = h * 0.62 * (0.72 + 0.28 * Math.cos(b));
        const ex = mitte + Math.sin(b) * l,
          ey = kopfY - Math.cos(b) * l * 0.5;
        pflanze += `<g class="wuchs${platz[i] >= sichtbar ? ' zu' : ''}">
        <path d="M${mitte} ${kopfY.toFixed(1)} Q ${(mitte + Math.sin(b) * l * 0.55).toFixed(1)} ${(kopfY - Math.cos(b) * l * 0.8).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}"
          stroke="${i % 2 ? BLATT : HELL}" stroke-width="2.5" fill="none" stroke-linecap="round"/></g>`;
      }
    } else if (familie === 'geldbaum') {
      pflanze += `<path d="M${mitte} ${erde} L${mitte} ${(oben + 3).toFixed(1)}" stroke="#9A8468" stroke-width="2.4" stroke-linecap="round" fill="none"/>`;
      const paare = Math.max(3, Math.round((2 + st) * (darstellung.dichte || 1)));
      for (let i = 0; i < paare; i++) {
        const y = erde - 7 - (i * (h - 10)) / paare;
        const gr = 0.6 + (i / paare) * 0.3;
        const dx = 5 * gr,
          rx = 5.2 * gr,
          ry = 3.4 * gr;
        pflanze += teil(
          Math.ceil((i + 1) / 2),
          `<ellipse cx="${(mitte - dx).toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${HELL}" transform="rotate(-17 ${(mitte - dx).toFixed(1)} ${y.toFixed(1)})"/>
        <ellipse cx="${(mitte + dx).toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${BLATT}" transform="rotate(17 ${(mitte + dx).toFixed(1)} ${y.toFixed(1)})"/>`,
        );
      }
    } else if (familie === 'weihnachtskaktus') {
      const ketten = Math.max(3, Math.round((2 + st) * (darstellung.dichte || 1)));
      const glieder = Math.min(5, 2 + Math.floor(st / 2));
      for (let k = 0; k < ketten; k++) {
        const dir = k % 2 ? 1 : -1;
        const spreiz = 17 + (k % 3) * 7;
        const hoch = h * (0.38 + (k % 3) * 0.09);
        for (let g = 0; g < glieder; g++) {
          const t = glieder > 1 ? g / (glieder - 1) : 0;
          const x = mitte + dir * spreiz * t;
          const y = erde - 5 - hoch * Math.sin(Math.PI * t * 0.55) + 16 * t * t;
          const dreh = dir * (10 + t * 70);
          pflanze += teil(
            1 + g,
            `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${dreh.toFixed(0)})">
          <rect x="-3.1" y="-5" width="6.2" height="10" rx="3" fill="${g % 2 ? BLATT : HELL}"/>
          <path d="M0 -4 L0 4" stroke="${STIEL}" stroke-width=".7" opacity=".45"/></g>`,
          );
        }
      }
    } else if (familie === 'orchidee') {
      const blueht = darstellung.blueht !== false;
      for (let i = 0; i < 2; i++) {
        const dir = i % 2 ? 1 : -1;
        const bx = mitte + dir * 9,
          by = erde - 3;
        pflanze += teil(1, `<ellipse cx="${bx}" cy="${by}" rx="11.5" ry="5.2" fill="${i % 2 ? BLATT : HELL}" transform="rotate(${dir * 10} ${bx} ${by})"/>`);
      }
      if (!blueht) return pflanze;
      const farben = BLUETENFARBE[pflanzeId] || ['#E4A6C6'];
      const P0 = [mitte - 3, erde - 8],
        P1 = [mitte - 12, erde - h * 0.8],
        P2 = [mitte + 19, erde - h];
      const bahn = (t: number): [number, number] => [
        (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0],
        (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1],
      ];
      pflanze += teil(1, `<path d="M${P0[0]} ${P0[1]} Q ${P1[0].toFixed(1)} ${P1[1].toFixed(1)} ${P2[0]} ${P2[1].toFixed(1)}" stroke="${STIEL}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`);
      [0.42, 0.6, 0.76, 0.92].forEach((t, i) => {
        const [bx, by] = bahn(t);
        pflanze += teil(i + 1, orchidbluete(bx, by, (darstellung.bluetenGroesse || 1) * (1 - i * 0.06), farben[i % farben.length], '#B4477F'));
      });
    } else if (familie === 'schwert') {
      const N = Math.round(7 * (darstellung.dichte || 1));
      const sichtbar = Math.max(3, Math.min(N, Math.round(N * (0.28 + (0.72 * (st - 1)) / (MAX_STUFE_ORT - 1))) + (darstellung.blattBonus || 0)));
      const winkel = Array.from({ length: N }, (_, i) => -34 + (68 / (N - 1)) * i);
      const platz = mitteZuerst(winkel);
      for (let i = 0; i < N; i++) {
        const w = winkel[i],
          l = h * (0.7 + 0.3 * Math.cos((w * Math.PI) / 90));
        pflanze += teilWenn(
          platz[i] < sichtbar,
          `<g transform="translate(${mitte},${erde}) rotate(${w})">
        <path d="M-3.4 0 C -2 ${-l * 0.6} -1.6 ${-l * 0.9} 0 ${-l} C 1.6 ${-l * 0.9} 2 ${-l * 0.6} 3.4 0Z" fill="${i % 2 ? BLATT : HELL}"/>
        <path d="M0 -4 L0 ${-l + 3}" stroke="#D8C97A" stroke-width="1" opacity=".55"/></g>`,
        );
      }
    } else if (familie === 'nadel') {
      pflanze += `<path d="M${mitte} ${erde} L${mitte} ${oben}" stroke="#6C7A4A" stroke-width="2" stroke-linecap="round" fill="none"/>`;
      for (let i = 0; i < st * 3; i++) {
        const y = erde - 6 - (i * (h - 6)) / (st * 3);
        pflanze += teil(
          Math.ceil((i + 1) / 3),
          `<path d="M${mitte} ${y} l -9 -5 M${mitte} ${y} l 9 -5" stroke="${i % 2 ? BLATT : '#8AA46A'}" stroke-width="1.7" stroke-linecap="round" fill="none"/>`,
        );
      }
    } else {
      // bluete — mehrere Federbüschen (z. B. Celosia)
      const farben = BLUETENFARBE[pflanzeId] || ['#B8397A', '#D4569A'];
      const busch = (x: number, y: number, gr: number, farbe: string) =>
        `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)}) scale(${gr})">
      <path d="M0 0 c -8 -4 -9 -13 -5 -17 c 2 4 4 3 5 0 c 1 3 3 4 5 0 c 4 4 3 13 -5 17Z" fill="${farbe}"/>
      <path d="M0 -2 c -5 -3 -5 -8 -3 -11 c 1 3 2 2 3 0 c 1 2 2 3 3 0 c 2 3 2 8 -3 11Z" fill="#fff" opacity=".18"/></g>`;

      pflanze += `<path d="M${mitte} ${erde} L${mitte} ${(oben + h * 0.2).toFixed(1)}" stroke="${STIEL}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`;
      for (let i = 0; i < 4; i++) {
        const y = erde - h * (0.12 + i * 0.17),
          dir = i % 2 ? 1 : -1;
        pflanze += teil(
          Math.ceil((i + 1) / 1.6),
          `<path d="M${mitte} ${y.toFixed(1)} c ${dir * 7} -6 ${dir * 14} -6 ${dir * 18} -1 c ${-dir * 5} 5 ${-dir * 13} 5 ${-dir * 18} 1Z" fill="${i % 2 ? BLATT : HELL}"/>`,
        );
      }
      const skala = Math.min(1, 0.55 + h / 140);
      const nebenBusch: [number, number, number, number][] = [
        [-13, 0.38, 0.62, 2],
        [14, 0.48, 0.66, 3],
        [-11, 0.66, 0.58, 4],
        [12, 0.74, 0.6, 5],
      ];
      for (const [dx, anteil, gr, abStufe] of nebenBusch) {
        const x = mitte + dx,
          y = erde - h * (1 - anteil);
        pflanze += teil(
          abStufe,
          `<path d="M${mitte} ${(y + h * 0.16).toFixed(1)} Q ${mitte + dx * 0.6} ${(y + h * 0.08).toFixed(1)} ${x} ${y.toFixed(1)}" stroke="${STIEL}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        ${busch(x, y, gr * skala, farben[Math.abs(dx) % farben.length])}`,
        );
      }
      pflanze += teil(1, busch(mitte, oben + h * 0.24, 0.85 * skala, farben[0]));
      pflanze += teil(2, busch(mitte, oben + h * 0.08, 1.0 * skala, farben[1 % farben.length]));
    }

    return pflanze;
  };

  const anzahl = darstellung.pflanzenImTopf || 1;
  if (anzahl <= 1) return silhouette();

  const sichtbar = Math.max(Math.min(anzahl, 3), Math.round(anzahl * (0.3 + (0.7 * (st - 1)) / (MAX_STUFE_ORT - 1))));
  const exemplare = Array.from({ length: anzahl }, (_, k) => {
    const t = k / (anzahl - 1);
    const spanne = Math.min(24, 4 + h * 0.22);
    return { k, dx: (t - 0.5) * spanne, sk: 0.6 + ((k * 5) % 4) * 0.085, dreh: -6 + ((k * 7) % 5) * 3 };
  }).sort((a, b) => a.sk - b.sk);

  return exemplare
    .map((e) => {
      const tx = (e.dx + mitte * (1 - e.sk)).toFixed(1);
      const ty = (erde * (1 - e.sk) - 3).toFixed(1);
      return `<g class="wuchs${e.k < sichtbar ? '' : ' zu'}"><g transform="translate(${tx},${ty}) scale(${e.sk.toFixed(2)}) rotate(${e.dreh.toFixed(1)} ${mitte} ${erde})">${silhouette()}</g></g>`;
    })
    .join('');
}
