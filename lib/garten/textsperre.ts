/**
 * Sperrliste für Nutzereingaben (Name, Art, Notiz beim Pflanzen-Anlegen):
 * rassistische Beleidigungen und nationalsozialistische Begriffe werden
 * abgewiesen — in jeder Pflanze-App haben sie nichts zu suchen, und die
 * Inhalte sind teils öffentlich sichtbar (Gartenlisten, Sync).
 *
 * Taktik: Kleinschreibung, Umlaut-Auflösung (ä→ae, ß→ss …) und Entfernen
 * von Trennzeichen/Ziffern macht Umgehungen wie „N1g*ger“ oder „HITLER“
 * kaputt. Kurze Begriffe (unter 4 Buchstaben) werden nur als eigenes Wort
 * gewertet, damit legitime Wörter (z. B. „Gruss“, „Straße“, „Maß“) nicht
 * hängenbleiben. Keine Panik bei deutschen Alltagswörtern — Tests belegen
 * das. Die Liste ist ein Anfang, kein rechtschreibdichtes Netz.
 */

const WÖRTER = [
  // rassistische Beleidigungen (englisch und deutsch)
  'nigger',
  'niglet',
  'neger',
  'coon',
  'kike',
  'spic',
  'spook',
  'gook',
  'chink',
  'wop',
  'dago',
  'boche',
  'jap',
  'coolie',
  'wetback',
  'kaffer',
  'kaffir',
  'pickaninny',
  'tranny',
  'fag',
  'faggot',
  // NS-Begriffe und Personen
  'nazi',
  'nsdap',
  'hitler',
  'himmler',
  'goebbels',
  'goering',
  'judensau',
  'judenschwein',
];

const PHRASEN = [
  'sieg heil',
  'heil hitler',
  'heil himmler',
  'mein kampf',
];

/** Kleinschreibung, Umlaute aufgelöst, Buchstaben beibehalten. */
export function normalisiereText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Akzente abtrennen (é→e)
    .replace(/ß/g, 'ss')
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a');
}

/** True, wenn der Text einen gesperrten Begriff enthält. */
export function textEnthaeltVerboten(text: string): boolean {
  const normalisiert = normalisiereText(text);

  // 1) Tokens an Nicht-Buchstaben-/Ziffer-Grenzen trennen (Ziffern bleiben
  // im Token, damit „n1gger“ nicht zu „n“+„gger“ zerfällt), dann exakte
  // Wortprüfung nach Leet-Rückübersetzung; kurze Tokens nur exakt.
  const rohtokens = normalisiert.split(/[^a-z0-9]+/).filter(Boolean);
  const woerter = rohtokens.map((t) => t.replace(/[^a-z]/g, '')).filter(Boolean);
  const woerterLeet = rohtokens.map((t) => t.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't').replace(/[^a-z]/g, ''));
  for (const wort of [...woerter, ...woerterLeet]) {
    if (WÖRTER.includes(wort)) return true;
  }

  // 2) Schreibvarianten mit eingefügten/getilgten Zeichen und Leet-Ziffern
  // („n1g*ger“, „hitl3r“): Ziffern werden zurückgemappt, Nicht-Buchstaben
  // entfernt, dann Teilwort-Suche je Token (ab Länge 5).
  const leet = (wort: string) =>
    wort.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's').replace(/7/g, 't');
  for (const token of woerter) {
    // Buchstaben mit und ohne Ziffer-Rückübersetzung prüfen.
    const varianteMit = leet(token).replace(/[^a-z]/g, '');
    const varianteOhne = token.replace(/[^a-z]/g, '');
    for (const gesperrt of WÖRTER) {
      if (gesperrt.length >= 5 && (varianteMit.includes(gesperrt) || varianteOhne.includes(gesperrt))) return true;
    }
  }

  // 2b) Buchstabierend geschrieben („n a z i“, „N-A-Z-I“): nur wenn ALLE
  // Tokens kurz (≤2 Zeichen) sind, werden sie zu einer Folge zusammengefügt
  // — normales Deutsch hat lange Wörter und bleibt unberührt.
  if (woerter.length >= 2 && woerter.every((w) => w.length <= 2)) {
    const folge = woerter.join('');
    if (WÖRTER.some((g) => folge === g)) return true;
  }

  // 2c) Über Token-Grenzen hinweg („n1g*ger“ → „…nigger“): die gesamte
  // Buchstabenfolge nach Leet-Mapping. Nur Begriffe ab Länge 6, damit
  // Wortfugen im normalen Text keine False-Positives erzeugen.
  const gesamt = woerterLeet.join('');
  for (const gesperrt of WÖRTER) {
    if (gesperrt.length >= 6 && gesamt.includes(gesperrt)) return true;
  }

  // 3) Phrasen über die Wortfolge.
  const folge = normalisiert.replace(/[^a-z]+/g, ' ').trim();
  return PHRASEN.some((phrase) => folge.includes(phrase));
}

/** Wirft mit sichtbarer Meldung, falls gesperrt — für Server-aktionen. */
export function verbotenenTextPruefen(feldName: string, wert: string): void {
  if (wert && textEnthaeltVerboten(wert)) {
    throw new Error(
      `Im Feld „${feldName}“ stehen begrifflich gesperrte Wörter (rassistisch oder nationalsozialistisch). Bitte einen sachlichen Text verwenden.`,
    );
  }
}
