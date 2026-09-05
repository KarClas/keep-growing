const SYMBOL_NACH_STICHWORT: Array<[string, string]> = [
  ['tomate', '🍅'],
  ['erdbeere', '🍓'],
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
];

export function ernteSymbol(pflanzeName: string, art: string | null): string {
  const text = `${pflanzeName} ${art ?? ''}`.toLowerCase();
  for (const [stichwort, symbol] of SYMBOL_NACH_STICHWORT) {
    if (text.includes(stichwort)) return symbol;
  }
  return '🌱';
}
