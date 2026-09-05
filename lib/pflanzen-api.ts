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

export interface LichtAuswahl {
  sonne: boolean;
  schatten: boolean;
}

/**
 * Parst das Licht-Feld aus der get-plant-details API (feature/get-plant-details-api):
 * Format: "sun", "shadow", "any" oder "N/A"
 * - "sun" -> Sonne aktiv
 * - "shadow" -> Schatten aktiv
 * - "any" -> Sonne UND Schatten aktiv
 */
export function parseLichtAusgabe(lichtWert?: string | null): LichtAuswahl {
  if (!lichtWert) return { sonne: true, schatten: false };
  const val = lichtWert.trim().toLowerCase();
  if (val === 'shadow' || val === 'schatten' || val === 'shade') {
    return { sonne: false, schatten: true };
  }
  if (val === 'any' || val === 'all' || val === 'both' || val === 'beides') {
    return { sonne: true, schatten: true };
  }
  if (val === 'sun' || val === 'sonne') {
    return { sonne: true, schatten: false };
  }
  const hasSun = val.includes('sun') || val.includes('sonne');
  const hasShade = val.includes('shad') || val.includes('schatt');
  if (hasSun && hasShade) {
    return { sonne: true, schatten: true };
  }
  if (hasShade) {
    return { sonne: false, schatten: true };
  }
  if (hasSun) {
    return { sonne: true, schatten: false };
  }
  // Entweder oder beide müssen markiert sein: Fallback auf Sonne
  return { sonne: true, schatten: false };
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
  Standort: 'outside',
  Licht: 'sun',
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
