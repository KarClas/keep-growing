export interface PflanzenErkennungsErgebnis {
  raw_name: string;
  identified_name: string;
  Giessrhythmus: string;
  Duengenrhytmus: string;
  Standort: string;
  Licht: string;
  Erde: string;
  perenual_id?: number;
}

export type LichtOption = 'Sonne' | 'Schatten' | 'Sonne oder Schatten';

export const LICHT_OPTIONEN: readonly LichtOption[] = [
  'Sonne',
  'Schatten',
  'Sonne oder Schatten',
] as const;

/**
 * Parst das Licht-Feld aus der get-plant-details API (feature/get-plant-details-api):
 * Format der API: "sun", "shadow", "any" oder "N/A"
 *
 * Deterministische Abbildung auf die drei geforderten Optionen:
 * - "sun" -> "Sonne"
 * - "shadow" -> "Schatten"
 * - "any" -> "Sonne oder Schatten"
 * - "N/A" / nicht vorhanden -> "Sonne oder Schatten"
 */
export function parseLichtAusgabe(lichtWert?: string | null): LichtOption {
  if (!lichtWert) return 'Sonne oder Schatten';
  const val = lichtWert.trim().toLowerCase();

  if (val === 'sun' || val === 'sonne') {
    return 'Sonne';
  }
  if (val === 'shadow' || val === 'schatten' || val === 'shade') {
    return 'Schatten';
  }
  if (
    val === 'any' ||
    val === 'all' ||
    val === 'both' ||
    val === 'sonne oder schatten' ||
    val === 'sonne/schatten'
  ) {
    return 'Sonne oder Schatten';
  }

  const hasSun = val.includes('sun') || val.includes('sonne');
  const hasShade = val.includes('shad') || val.includes('schatt');
  if (hasSun && hasShade) {
    return 'Sonne oder Schatten';
  }
  if (hasShade) {
    return 'Schatten';
  }
  if (hasSun) {
    return 'Sonne';
  }

  return 'Sonne oder Schatten';
}

/**
 * Standard-Eingabedaten ermittelt aus enjoy_05.jpg:
 * 1. id-plant-api (Port 5005) -> ["Rosa chinensis", "Rosa × hybrida", "Rosa gallica", "Rosa × damascena", "Rosa moschata"]
 * 2. plant-details-api (Port 5006) mit "Rosa chinensis" -> liefert die folgenden Pflegedaten:
 */
export const ENJOY_05_PLANT_DATA: PflanzenErkennungsErgebnis = {
  raw_name: 'Rosa chinensis',
  identified_name: 'Rosa chinensis',
  Giessrhythmus: 'Bedarfsgerecht bei angetrockneter Erdoberfläche gießen (ca. alle 7–10 Tage)',
  Duengenrhytmus: 'Alle 2–4 Wochen von Frühjahr bis Spätsommer mit handelsüblichem Flüssigdünger',
  Standort: 'N/A',
  Licht: 'N/A',
  Erde: 'N/A',
};

export async function holeDetailsFuerPflanze(pflanzenName: string): Promise<PflanzenErkennungsErgebnis> {
  try {
    const res = await fetch('http://127.0.0.1:5006/get-plant-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: pflanzenName }),
      next: { revalidate: 60 },
    });
    if (res.ok) {
      return (await res.json()) as PflanzenErkennungsErgebnis;
    }
  } catch {
    // Fallback auf Default-Daten
  }
  return ENJOY_05_PLANT_DATA;
}
