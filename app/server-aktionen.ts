'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  nutzerListe,
  nutzerAnlegen,
  gaertenFuerNutzer,
  gartenAnlegen,
  pflanzeAnlegen,
  pflanzeAusErkennungAnlegen,
  aktivitaetHinzufuegen,
  pflanzeAlsVerstorbenMarkieren,
  type AktivitaetTyp,
  type DrinnenDraussen,
} from '@/lib/db/abfragen';
import { nutzerWaehlen, gartenWaehlen, aktiveNutzerId, aktiveGartenId, abmelden } from '@/lib/session';
import { fotoSpeichern } from '@/lib/fotos';

function textFeld(formData: FormData, feld: string): string {
  const wert = formData.get(feld);
  if (typeof wert !== 'string' || wert.trim() === '') {
    throw new Error(`Feld "${feld}" fehlt oder ist leer.`);
  }
  return wert.trim();
}

function optionalesTextFeld(formData: FormData, feld: string): string | null {
  const wert = formData.get(feld);
  if (typeof wert !== 'string' || wert.trim() === '') return null;
  return wert.trim();
}

function optionaleZahl(formData: FormData, feld: string): number | null {
  const wert = formData.get(feld);
  if (typeof wert !== 'string' || wert.trim() === '') return null;
  const zahl = Number(wert);
  if (Number.isNaN(zahl)) throw new Error(`Feld "${feld}" muss eine Zahl sein.`);
  return zahl;
}

function angemeldetenNutzer(nutzerId: string | null): string {
  if (!nutzerId) throw new Error('Kein angemeldeter Nutzer. Bitte zuerst unter /start auswählen.');
  return nutzerId;
}

export async function nutzerAnlegenAction(formData: FormData) {
  const name = textFeld(formData, 'name');
  const nutzer = nutzerAnlegen(name);
  const garten = gartenAnlegen(nutzer.id, 'Mein Garten');
  await nutzerWaehlen(nutzer.id);
  await gartenWaehlen(garten.id);
  redirect('/');
}

export async function nutzerWaehlenAction(formData: FormData) {
  const nutzerId = textFeld(formData, 'nutzerId');
  await nutzerWaehlen(nutzerId);
  const gaerten = gaertenFuerNutzer(nutzerId);
  if (gaerten.length > 0) {
    await gartenWaehlen(gaerten[0].id);
  }
  redirect('/');
}

export async function gartenAnlegenAction(formData: FormData) {
  const nutzerId = angemeldetenNutzer(await aktiveNutzerId());
  const name = textFeld(formData, 'name');
  const garten = gartenAnlegen(nutzerId, name);
  await gartenWaehlen(garten.id);
  redirect('/');
}

export async function gartenWaehlenAction(formData: FormData) {
  const gartenId = textFeld(formData, 'gartenId');
  await gartenWaehlen(gartenId);
  redirect('/');
}

export async function abmeldenAction() {
  await abmelden();
  redirect('/start');
}

export async function pflanzeAnlegenAction(formData: FormData) {
  const nutzerId = angemeldetenNutzer(await aktiveNutzerId());
  const gartenId = await aktiveGartenId();
  if (!gartenId) throw new Error('Kein aktiver Garten.');

  const pflanze = pflanzeAnlegen(gartenId, nutzerId, {
    name: textFeld(formData, 'name'),
    art: optionalesTextFeld(formData, 'art'),
    erde: optionalesTextFeld(formData, 'erde'),
    licht: optionalesTextFeld(formData, 'licht'),
    drinnenDraussen: (formData.get('drinnenDraussen') as DrinnenDraussen) ?? 'drinnen',
    giessIntervallTage: optionaleZahl(formData, 'giessIntervallTage') ?? 7,
    duengerIntervallTage: optionaleZahl(formData, 'duengerIntervallTage'),
    duengerTyp: optionalesTextFeld(formData, 'duengerTyp'),
    notiz: optionalesTextFeld(formData, 'notiz') ?? '',
  });

  redirect(`/pflanze/${pflanze.id}`);
}

/**
 * Bis das Scanner-Team die Foto-Erkennung liefert, wird die Art hier von Hand
 * eingetragen. Die Schnittstelle (pflanzeAusErkennungAnlegen) ist dieselbe,
 * die später den echten Erkennungswert bekommt.
 */
export async function pflanzeAusScannerAction(formData: FormData) {
  const nutzerId = angemeldetenNutzer(await aktiveNutzerId());
  const gartenId = await aktiveGartenId();
  if (!gartenId) throw new Error('Kein aktiver Garten.');

  const foto = formData.get('foto');
  const fotoUrl = foto instanceof File && foto.size > 0 ? await fotoSpeichern(foto) : null;

  const pflanze = pflanzeAusErkennungAnlegen(
    gartenId,
    nutzerId,
    {
      art: textFeld(formData, 'art'),
      erde: optionalesTextFeld(formData, 'erde'),
      licht: optionalesTextFeld(formData, 'licht'),
      fotoUrl,
    },
    {
      name: textFeld(formData, 'name'),
      drinnenDraussen: (formData.get('drinnenDraussen') as DrinnenDraussen) ?? 'drinnen',
      aktuelleGroesse: optionalesTextFeld(formData, 'aktuelleGroesse') ?? undefined,
    },
  );

  redirect(`/pflanze/${pflanze.id}`);
}

export async function profilSchritt2AnlegenAction(formData: FormData) {
  let nutzerId = await aktiveNutzerId();
  if (!nutzerId) {
    const alleNutzer = nutzerListe();
    if (alleNutzer.length > 0) {
      nutzerId = alleNutzer[0].id;
      await nutzerWaehlen(nutzerId);
    } else {
      const n = nutzerAnlegen('Anne');
      nutzerId = n.id;
      await nutzerWaehlen(nutzerId);
    }
  }

  let gartenId = await aktiveGartenId();
  if (!gartenId) {
    const gaerten = gaertenFuerNutzer(nutzerId);
    if (gaerten.length > 0) {
      gartenId = gaerten[0].id;
      await gartenWaehlen(gartenId);
    } else {
      const g = gartenAnlegen(nutzerId, 'Mein Garten');
      gartenId = g.id;
      await gartenWaehlen(gartenId);
    }
  }

  const art = optionalesTextFeld(formData, 'art') ?? '';
  const roherName = formData.get('name');
  let name = typeof roherName === 'string' ? roherName.trim() : '';
  if (!name) {
    name = art ? `Meine ${art}` : 'Meine Pflanze';
  }

  const giessrhythmus =
    optionalesTextFeld(formData, 'giessrhythmus') ??
    optionalesTextFeld(formData, 'giessenrhythmus') ??
    '';
  const duengenrhythmus = optionalesTextFeld(formData, 'duengenrhythmus') ?? '';
  const erde = optionalesTextFeld(formData, 'erde') ?? '';
  const licht = optionalesTextFeld(formData, 'licht') ?? '';
  const nutzerNotiz = optionalesTextFeld(formData, 'notiz') ?? '';

  let giessTage = 7;
  if (giessrhythmus) {
    const tageMatch =
      giessrhythmus.match(/(\d+)\s*[-–bis]\s*(\d+)\s*Tage/i) ||
      giessrhythmus.match(/(\d+)\s*Tage/i);
    if (tageMatch) {
      giessTage = parseInt(tageMatch[1], 10);
    } else if (
      giessrhythmus.toLowerCase().includes('week') ||
      giessrhythmus.toLowerCase().includes('woche')
    ) {
      giessTage = 7;
    }
  }

  let duengerTage: number | null = null;
  if (duengenrhythmus) {
    const wochenMatch =
      duengenrhythmus.match(/(\d+)\s*[-–bis]\s*(\d+)\s*Wochen/i) ||
      duengenrhythmus.match(/(\d+)\s*Wochen/i);
    if (wochenMatch) {
      duengerTage = parseInt(wochenMatch[1], 10) * 7;
    } else {
      duengerTage = 14;
    }
  }

  const pflegeDetails: string[] = [];
  if (nutzerNotiz) pflegeDetails.push(nutzerNotiz);
  if (giessrhythmus) pflegeDetails.push(`Gießrhythmus: ${giessrhythmus}`);
  if (duengenrhythmus) pflegeDetails.push(`Düngrhythmus: ${duengenrhythmus}`);
  const notiz = pflegeDetails.join('\n\n');

  const pflanze = pflanzeAnlegen(gartenId, nutzerId, {
    name,
    art: art || null,
    erde: erde || null,
    licht: licht || null,
    drinnenDraussen: 'drinnen',
    giessIntervallTage: giessTage,
    duengerIntervallTage: duengerTage,
    notiz,
  });

  revalidatePath('/');
  revalidatePath('/hinzufuegen');
  redirect(`/pflanze/${pflanze.id}`);
}

export async function aktivitaetAction(formData: FormData) {
  const nutzerId = angemeldetenNutzer(await aktiveNutzerId());
  const pflanzeId = textFeld(formData, 'pflanzeId');
  const typ = textFeld(formData, 'typ') as AktivitaetTyp;
  const menge = optionalesTextFeld(formData, 'menge');
  const notiz = optionalesTextFeld(formData, 'notiz');

  aktivitaetHinzufuegen(pflanzeId, nutzerId, typ, { menge, notiz });
  revalidatePath(`/pflanze/${pflanzeId}`);
  revalidatePath('/');
  revalidatePath('/aktionen');
}

export async function ernteEintragenAction(formData: FormData) {
  const nutzerId = angemeldetenNutzer(await aktiveNutzerId());
  const pflanzeId = textFeld(formData, 'pflanzeId');
  const menge = optionalesTextFeld(formData, 'menge');
  const notiz = optionalesTextFeld(formData, 'notiz');
  const datumEingabe = optionalesTextFeld(formData, 'datum');
  const datum = datumEingabe ? new Date(datumEingabe).toISOString() : undefined;

  aktivitaetHinzufuegen(pflanzeId, nutzerId, 'ernten', { menge, notiz, datum });
  redirect(`/pflanze/${pflanzeId}`);
}

export async function alsVerstorbenAction(formData: FormData) {
  const nutzerId = angemeldetenNutzer(await aktiveNutzerId());
  const pflanzeId = textFeld(formData, 'pflanzeId');
  pflanzeAlsVerstorbenMarkieren(pflanzeId, nutzerId);
  redirect('/');
}
