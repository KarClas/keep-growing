export type Pflanzenfamilie =
  | 'frucht'
  | 'busch'
  | 'nadel'
  | 'haenger'
  | 'schwert'
  | 'monstera'
  | 'baumartig'
  | 'bluete'
  | 'kaktus';

const SCHLUESSELWORT_FAMILIE: Array<[string, Pflanzenfamilie]> = [
  ['monstera', 'monstera'],
  ['drachenbaum', 'baumartig'],
  ['geldbaum', 'baumartig'],
  ['weihnachtskaktus', 'kaktus'],
  ['orchidee', 'bluete'],
  ['bogenhanf', 'schwert'],
  ['wasserlilie', 'schwert'],
  ['spathiphyllum', 'schwert'],
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
  ['calibrachoa', 'bluete'],
  ['blume', 'bluete'],
  ['süsskartoffel', 'haenger'],
  ['süßkartoffel', 'haenger'],
  ['efeu', 'haenger'],
  ['minze', 'busch'],
  ['basilikum', 'busch'],
  ['koriander', 'busch'],
  ['rucola', 'busch'],
  ['zwiebel', 'busch'],
  ['salat', 'busch'],
];

function familieAusKategorie(kategorie: string | null): Pflanzenfamilie {
  switch (kategorie) {
    case 'Gemüse':
    case 'Obst':
      return 'frucht';
    case 'Blume':
      return 'bluete';
    default:
      return 'busch';
  }
}

/**
 * Ordnet eine Pflanze anhand von Name/Art einer Zeichen-Silhouette zu.
 * Erst bekannte Arten-Schlüsselwörter (funktioniert für jede Pflanze, nicht
 * nur importierte), sonst grobe Kategorie, sonst der busche Standardlook.
 */
export function bestimmeFamilie(name: string, art: string | null): Pflanzenfamilie {
  const text = `${name} ${art ?? ''}`.toLowerCase();
  for (const [wort, familie] of SCHLUESSELWORT_FAMILIE) {
    if (text.includes(wort)) return familie;
  }
  return familieAusKategorie(art);
}

const SCHLUESSELWORT_AKZENTFARBE: Array<[string, string]> = [
  ['habanero', '#e08a2e'],
  ['chili', '#e08a2e'],
  ['paprika', '#b8443a'],
  ['tomate', '#c4482f'],
  ['erdbeer', '#c8394b'],
  ['stachelbeer', '#9bb84a'],
  ['avocado', '#5c7a45'],
];

/** Akzentfarbe für Früchte/Blüten — sonst wirken alle "frucht"-Pflanzen gleich rot. */
export function bestimmeAkzentfarbe(name: string, art: string | null): string {
  const text = `${name} ${art ?? ''}`.toLowerCase();
  for (const [wort, farbe] of SCHLUESSELWORT_AKZENTFARBE) {
    if (text.includes(wort)) return farbe;
  }
  return '#c4482f';
}
