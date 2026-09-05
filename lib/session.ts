import { cookies } from 'next/headers';

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

export async function abmelden() {
  const cookieStore = await cookies();
  cookieStore.delete(NUTZER_COOKIE);
  cookieStore.delete(GARTEN_COOKIE);
}
