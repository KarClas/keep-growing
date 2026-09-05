/**
 * Ernte-Symbole als Kategorie, nicht als Emoji-Zeichen — der Rendering-Code
 * (components/Symbole.tsx, ErnteSymbol) wählt daraus ein Linien-SVG.
 */

export type ErnteKategorie = 'frucht' | 'kraut' | 'blume' | 'keimling';

const KATEGORIE_NACH_STICHWORT: Array<[string, ErnteKategorie]> = [
  ['tomate', 'frucht'],
  ['erdbeere', 'frucht'],
  ['paprika', 'frucht'],
  ['chili', 'frucht'],
  ['gurke', 'frucht'],
  ['zitrone', 'frucht'],
  ['apfel', 'frucht'],
  ['kraut', 'kraut'],
  ['basilikum', 'kraut'],
  ['minze', 'kraut'],
  ['salat', 'kraut'],
  ['blume', 'blume'],
];

export function ernteKategorie(pflanzeName: string, art: string | null): ErnteKategorie {
  const text = `${pflanzeName} ${art ?? ''}`.toLowerCase();
  for (const [stichwort, kategorie] of KATEGORIE_NACH_STICHWORT) {
    if (text.includes(stichwort)) return kategorie;
  }
  return 'keimling';
}
