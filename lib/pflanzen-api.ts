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

/**
 * Standard-Eingabedaten ermittelt aus enjoy_05.jpg:
 * 1. id-plant-api (Port 5005) -> ["Rose", "Floribunda Rose", "Shrub Rose", "Hybrid Tea Rose", "Climbing Rose"]
 * 2. plant-details-api (Port 5006) mit "Rose" -> liefert die folgenden Pflegedaten:
 */
export const ENJOY_05_PLANT_DATA: PflanzenErkennungsErgebnis = {
  raw_name: 'Rose',
  identified_name: "Mocha Rose Big Leaf Maple (Acer macrophyllum 'Mocha Rose')",
  Giessrhythmus:
    'The Mocha Rose Big Leaf Maple should be watered deeply once or twice a week, depending on the weather and the amount of sunlight it is receiving.',
  Duengenrhytmus: 'Alle 2–4 Wochen von Frühjahr bis Spätsommer mit handelsüblichem Flüssigdünger',
  Standort: 'anywhere',
  Licht: 'any',
  Erde: 'N/A',
  perenual_id: 24,
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
