const SYMBOL_NACH_STICHWORT: Array<[string, string]> = [
  ['tomate', '🍅'],
  ['erdbeere', '🍓'],
  ['beere', '🫐'],
  ['paprika', '🫑'],
  ['chili', '🌶️'],
  ['gurke', '🥒'],
  ['kraut', '🌿'],
  ['basilikum', '🌿'],
  ['minze', '🌿'],
  ['salat', '🥬'],
  ['zitrone', '🍋'],
  ['apfel', '🍎'],
  ['blume', '🌸'],
  ['süßkartoffel', '🍠'],
  ['kartoffel', '🥔'],
  ['zwiebel', '🧅'],
];

export function ernteSymbol(pflanzeName: string, art: string | null): string {
  const text = `${pflanzeName} ${art ?? ''}`.toLowerCase();
  for (const [stichwort, symbol] of SYMBOL_NACH_STICHWORT) {
    if (text.includes(stichwort)) return symbol;
  }
  return '🌱';
}

const ESSBARE_ARTEN = ['gemüse', 'obst', 'kraut', 'salat'];

export function istEssbar(art: string | null): boolean {
  if (!art) return false;
  const text = art.toLowerCase();
  return ESSBARE_ARTEN.some((essbareArt) => text.includes(essbareArt));
}
