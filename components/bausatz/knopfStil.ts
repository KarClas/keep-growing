/**
 * Klassen aller Knopf-Varianten (Spec, Abschnitt 4). Ohne 'use client', damit
 * Server-Komponenten (KnopfLink) und Client-Komponenten (Knopf) dieselben
 * Klassen teilen. Tailwind-Wichtigkeit: `px-0!` überschreibt `px-4` aus BASIS.
 */

export type KnopfVariante = 'primaer' | 'sekundaer' | 'text' | 'gefahr';
export type PflegeVariante = 'wasser' | 'mint' | 'sonne';

const BASIS =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTEN: Record<KnopfVariante, string> = {
  primaer: 'bg-moos text-papier-hell shadow-karte hover:bg-moos-dunkel',
  sekundaer: 'border border-kante bg-papier-hell text-tinte shadow-karte hover:bg-white',
  text: 'min-h-0 px-1 py-1 text-tinte-gedaempft underline-offset-2 hover:underline',
  gefahr: 'min-h-0 px-1 py-1 text-gefahr underline-offset-2 hover:underline',
};

export function knopfKlassen(variante: KnopfVariante, extra = ''): string {
  return `${BASIS} ${VARIANTEN[variante]} ${extra}`.trim();
}

const PFLEGE_BASIS =
  'relative flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-sm font-bold text-tinte shadow-karte transition active:scale-[0.98] disabled:opacity-60';

const PFLEGE_FARBEN: Record<PflegeVariante, { normal: string; faellig: string }> = {
  wasser: { normal: 'bg-wasser hover:bg-wasser-kraeftig', faellig: 'bg-wasser-kraeftig ring-2 ring-tinte/70' },
  mint: { normal: 'bg-mint hover:bg-mint-kraeftig', faellig: 'bg-mint-kraeftig ring-2 ring-tinte/70' },
  sonne: { normal: 'bg-sonne hover:bg-sonne-kraeftig', faellig: 'bg-sonne-kraeftig ring-2 ring-tinte/70' },
};

/** Der heute fällige Knopf ist kräftiger und umrandet — eine Region, eine Hauptaktion. */
export function pflegeKnopfKlassen(variante: PflegeVariante, faellig: boolean, extra = ''): string {
  return `${PFLEGE_BASIS} ${PFLEGE_FARBEN[variante][faellig ? 'faellig' : 'normal']} ${extra}`.trim();
}

export const FAELLIG_ETIKETT_KLASSEN =
  'absolute -top-2 rounded-full bg-tinte px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-papier-hell';
