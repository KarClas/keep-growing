import { cookies } from 'next/headers';
import { nutzerMitId, gartenGehoertNutzer } from './db/abfragen.ts';

const NUTZER_COOKIE = 'aktiver_nutzer_id';
const GARTEN_COOKIE = 'aktiver_garten_id';

export async function aktiveNutzerId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(NUTZER_COOKIE)?.value ?? null;
}

export async function aktiveGartenId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(GARTEN_COOKIE)?.value ?? null;
}

export async function nutzerWaehlen(nutzerId: string) {
  const cookieStore = await cookies();
  cookieStore.set(NUTZER_COOKIE, nutzerId, { httpOnly: true, sameSite: 'lax', path: '/' });
}

export async function gartenWaehlen(gartenId: string) {
  const cookieStore = await cookies();
  cookieStore.set(GARTEN_COOKIE, gartenId, { httpOnly: true, sameSite: 'lax', path: '/' });
}

/**
 * Prüft, ob die Cookies noch auf existierende, zusammengehörige Datensätze
 * zeigen — nicht nur, ob sie gesetzt sind. Ein Cookie kann auf einen Nutzer
 * oder Garten zeigen, der nicht mehr existiert (z. B. nach einem
 * Datenbank-Reset); das ist eine abgelaufene Sitzung, kein Fremdzugriff, und
 * soll deshalb zur Anmeldung zurückführen statt eine Fehlerseite zu zeigen.
 */
export async function aktuellerNutzer(): Promise<string | null> {
  const nutzerId = await aktiveNutzerId();
  if (!nutzerId || !nutzerMitId(nutzerId)) return null;
  return nutzerId;
}

export async function aktuelleSitzung(): Promise<{ nutzerId: string; gartenId: string } | null> {
  const nutzerId = await aktiveNutzerId();
  const gartenId = await aktiveGartenId();
  if (!nutzerId || !gartenId) return null;
  if (!nutzerMitId(nutzerId)) return null;
  if (!gartenGehoertNutzer(gartenId, nutzerId)) return null;
  return { nutzerId, gartenId };
}

export async function abmelden() {
  const cookieStore = await cookies();
  cookieStore.delete(NUTZER_COOKIE);
  cookieStore.delete(GARTEN_COOKIE);
}
