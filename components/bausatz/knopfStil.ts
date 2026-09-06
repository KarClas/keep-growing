/**
 * Klassen aller Knopf-Varianten (Spec, Abschnitt 4). Ohne 'use client', damit
 * Server-Komponenten (KnopfLink) und Client-Komponenten (Knopf) dieselben
 * Klassen teilen. Tailwind-Wichtigkeit: `px-0!` überschreibt `px-4` aus BASIS.
 */

export type KnopfVariante = 'primaer' | 'sekundaer' | 'text' | 'gefahr';

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

/*
 * Pflege-Knöpfe (Gießen/Düngen/Ernten) — Team-Entscheidung „Papierkarten":
 * alle drei papierweiß wie die Karten, Symbol in Moos; der heute fällige Knopf
 * bekommt eine zart grüne Fläche und einen grünen Rand — eine Region, eine
 * Hauptaktion.
 */
const PFLEGE_BASIS =
  'relative flex min-h-[4.5rem] w-full flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2.5 text-sm font-bold text-tinte shadow-karte transition active:scale-[0.98] disabled:opacity-60';

const PFLEGE_RUHE = 'border-kante bg-papier-hell hover:bg-white';
const PFLEGE_FAELLIG = 'border-moos bg-moos-zart hover:bg-moos-zart';

export function pflegeKnopfKlassen(faellig: boolean, extra = ''): string {
  return `${PFLEGE_BASIS} ${faellig ? PFLEGE_FAELLIG : PFLEGE_RUHE} ${extra}`.trim();
}

/** Symbolfarbe der Pflege-Knöpfe — immer Moos, unabhängig vom Zustand. */
export const PFLEGE_SYMBOL_KLASSEN = 'flex h-7 w-7 items-center justify-center text-moos';

export const FAELLIG_ETIKETT_KLASSEN =
  'absolute -top-2 rounded-full bg-tinte px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-papier-hell';
