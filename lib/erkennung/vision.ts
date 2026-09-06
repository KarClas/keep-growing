/**
 * Foto- und Art-Erkennung mit Vision-/Sprachmodell (Qwen über OpenAI-kompatiblen Endpoint).
 * Analysiert Pflanzenfotos oder Artnamen und liefert Art sowie die angepassten Pflegeparameter.
 */

import type { FotoVorschlag, LichtOption, OrtOption } from './typ.ts';

const BASIS_URL = process.env.ERKENNUNG_API_URL ?? 'http://gx10-473b-1tb-nr2.taildca6a1.ts.net:18300/v1';
const MODELL = process.env.ERKENNUNG_MODELL ?? 'qwen3.8-flash-next';

export const ANWEISUNG = `Du bist die Pflanzen-Erkennung der App "keep-growing".
Analysiere das Foto der Pflanze.
Nenne als "art" zuerst den gängigen deutschen Namen und in Klammern den wissenschaftlichen Artnamen nach botanischer Nomenklatur, z. B. "Rote Rose (Rosa chinensis)", "Monstera (Monstera deliciosa)", "Geigenfeige (Ficus lyrata)".
Antworte ausschließlich mit einem JSON-Objekt, ohne Markdown, mit genau diesen Feldern:
{
  "erkannt": true oder false,
  "art": "Deutscher Name (wissenschaftlicher Artname), z. B. Schlafmohn (Papaver somniferum)",
  "gießrhythmus": Zahl (Tage bis zum nächsten Gießen als reine Zahl, z. B. 7),
  "düngrhythmus": Zahl (Tage bis zum nächsten Düngen als reine Zahl, z. B. 14, oder null),
  "erde": "empfohlener Anteil in der Erdemischung als Prozentangaben gefolgt von Erdetyp, z. B. 50% Typ-1-Erde, 30% Typ-2-Erde, 20% Typ-3-Erde",
  "licht": "Sonne" | "Schatten" | "Sonne oder Schatten",
  "ort": "Drinnen" | "draußen" | "Drinnen oder draußen",
  "sicherheit": "hoch" | "mittel" | "gering"
}
Wenn auf dem Foto keine Pflanze zu sehen ist, antworte {"erkannt": false}.`;

export const ART_ANWEISUNG = `Du bist die Pflanzen-Pflege-Auskunft der App "keep-growing".
Der Nutzer nennt den Namen oder die Art einer Pflanze: "{ART}".
Ermittle die genaue Pflanzenart streng nach botanischer Nomenklatur und nenne sie als deutschen Namen mit dem wissenschaftlichen Artnamen in Klammern, z. B. "Rote Rose (Rosa chinensis)", "Monstera (Monstera deliciosa)", "Geigenfeige (Ficus lyrata)".
Gib die passenden Pflegeparameter an.
Antworte ausschließlich mit einem JSON-Objekt, ohne Markdown, mit genau diesen Feldern:
{
  "erkannt": true oder false,
  "art": "Deutscher Name (wissenschaftlicher Artname), z. B. Schlafmohn (Papaver somniferum)",
  "gießrhythmus": Zahl (Tage bis zum nächsten Gießen als reine Zahl, z. B. 7),
  "düngrhythmus": Zahl (Tage bis zum nächsten Düngen als reine Zahl, z. B. 14, oder null),
  "erde": "empfohlener Anteil in der Erdemischung als Prozentangaben gefolgt von Erdetyp, z. B. 50% Typ-1-Erde, 30% Typ-2-Erde, 20% Typ-3-Erde",
  "licht": "Sonne" | "Schatten" | "Sonne oder Schatten",
  "ort": "Drinnen" | "draußen" | "Drinnen oder draußen",
  "sicherheit": "hoch" | "mittel" | "gering"
}
Wenn der Begriff keine Pflanze ist oder völlig unbekannt ist, antworte {"erkannt": false}.`;

export function feldWertBereinigen(wert?: string | null): string {
  if (!wert) return '';
  const getrimmt = wert.trim();
  const lower = getrimmt.toLowerCase();
  if (
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === '-' ||
    lower === '--'
  ) {
    return '';
  }
  return getrimmt;
}

/**
 * Parst das Licht-Feld deterministisch auf eine der 3 Optionen:
 * - "Sonne"
 * - "Schatten"
 * - "Sonne oder Schatten" (Default bei unklarem Wert oder beiden)
 */
export function parseLichtAusgabe(lichtWert?: string | null): LichtOption {
  if (!lichtWert) return 'Sonne oder Schatten';
  const val = lichtWert.trim().toLowerCase();

  const hatSonne = val.includes('sun') || val.includes('sonne');
  const hatSchatten = val.includes('shad') || val.includes('schatt');

  if (
    (hatSonne && hatSchatten) ||
    val === 'any' ||
    val === 'all' ||
    val === 'both' ||
    val === 'beides' ||
    val.includes('oder') ||
    val.includes('und') ||
    val.includes('/')
  ) {
    return 'Sonne oder Schatten';
  }

  if (hatSchatten) return 'Schatten';
  if (hatSonne) return 'Sonne';

  return 'Sonne oder Schatten';
}

/**
 * Parst das Ort-Feld deterministisch auf eine der 3 Optionen:
 * - "Drinnen"
 * - "draußen"
 * - "Drinnen oder draußen" (Default bei unklarem Wert oder beiden)
 */
export function parseOrtAusgabe(ortWert?: string | null): OrtOption {
  if (!ortWert) return 'Drinnen oder draußen';
  const val = ortWert.trim().toLowerCase();

  const hatDrinnen =
    val.includes('drinn') ||
    val.includes('indoor') ||
    val.includes('inside') ||
    val.includes('zimmer');
  const hatDraussen =
    val.includes('drauss') ||
    val.includes('draußen') ||
    val.includes('outdoor') ||
    val.includes('outside') ||
    val.includes('garten') ||
    val.includes('balkon');

  const hatBeides =
    (hatDrinnen && hatDraussen) ||
    /\b(or|oder)\b/i.test(val) ||
    val.includes('/') ||
    val === 'any' ||
    val === 'all' ||
    val === 'both' ||
    val === 'beides';

  if (hatBeides) {
    return 'Drinnen oder draußen';
  }

  if (hatDraussen) return 'draußen';
  if (hatDrinnen) return 'Drinnen';

  return 'Drinnen oder draußen';
}

/**
 * Bestimmt den Hintergrund-Index anhand des erkannten Ortes:
 * - draußen / outdoor -> 1 („Ich bleibe lieber draußen“)
 * - drinnen / indoor -> 0 („Ich bleibe lieber drinnen“)
 * - Fallback (z. B. unklar, beides oder fehlt) -> 0 („Ich bleibe lieber drinnen“)
 */
export function ortZuHintergrundIndex(ortWert?: string | null): number {
  if (!ortWert) return 0;
  const val = ortWert.trim().toLowerCase();

  const hatDrinnen =
    val.includes('drinn') ||
    val.includes('indoor') ||
    val.includes('inside') ||
    val.includes('zimmer');
  const hatDraussen =
    val.includes('drauss') ||
    val.includes('draußen') ||
    val.includes('outdoor') ||
    val.includes('outside') ||
    val.includes('garten') ||
    val.includes('balkon');

  // Fallback drinnen bei unklarer Angabe oder beiden Optionen ("Drinnen oder draußen")
  if (hatDrinnen && hatDraussen) {
    return 0;
  }
  if (
    val.includes('oder') ||
    val.includes('/') ||
    val === 'both' ||
    val === 'any' ||
    val === 'all' ||
    val === 'beides'
  ) {
    return 0;
  }

  // Eindeutig draußen
  if (hatDraussen) {
    return 1;
  }

  // Eindeutig drinnen oder Fallback
  return 0;
}

/**
 * Liest eine Zahl (Tage) aus einem beliebigen Wert aus.
 */
export function parseTageZahl(wert: unknown): number | undefined {
  if (typeof wert === 'number' && Number.isFinite(wert) && wert > 0) {
    return Math.round(wert);
  }
  if (typeof wert === 'string') {
    const treffer = wert.match(/(\d+)/);
    if (treffer) {
      const zahl = parseInt(treffer[1], 10);
      if (zahl > 0) return zahl;
    }
  }
  return undefined;
}

/** JSON aus der Modell-Antwort holen (rohes JSON, ```-Zaun oder eingebettet). */
export function parseErkennungsAntwort(text: string): Record<string, unknown> | null {
  const versuche = [text.trim()];
  const zaun = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (zaun) versuche.push(zaun[1].trim());
  const anfang = text.indexOf('{');
  const ende = text.lastIndexOf('}');
  if (anfang >= 0 && ende > anfang) versuche.push(text.slice(anfang, ende + 1));

  for (const kandidat of versuche) {
    try {
      const wert: unknown = JSON.parse(kandidat);
      if (wert && typeof wert === 'object' && !Array.isArray(wert)) return wert as Record<string, unknown>;
    } catch {
      // Kandidat war kein gültiges JSON — den nächsten probieren.
    }
  }
  return null;
}

/**
 * Rohe Modellantwort → validiertes FotoVorschlag-Ergebnis oder null.
 * null heißt ehrlich: keine Pflanze erkannt oder Antwort unbrauchbar.
 */
export function erkenungsErgebnisAusAntwort(text: string): FotoVorschlag | null {
  const objekt = parseErkennungsAntwort(text);
  if (!objekt) return null;
  if (objekt.erkannt !== true) return null;

  const art = typeof objekt.art === 'string' ? feldWertBereinigen(objekt.art) : '';
  if (art === '') return null;

  const sicherheit =
    objekt.sicherheit === 'hoch' || objekt.sicherheit === 'gering' ? objekt.sicherheit : 'mittel';

  const giessrhythmus =
    parseTageZahl(objekt.gießrhythmus) ??
    parseTageZahl(objekt.giessrhythmus) ??
    parseTageZahl(objekt.giessIntervallTage) ??
    7;
  const duengenrhythmus =
    parseTageZahl(objekt.düngrhythmus) ??
    parseTageZahl(objekt.duengrhythmus) ??
    parseTageZahl(objekt.duengenrhythmus) ??
    parseTageZahl(objekt.duengerIntervallTage) ??
    28;

  const erde = typeof objekt.erde === 'string' ? feldWertBereinigen(objekt.erde) : undefined;
  const licht = parseLichtAusgabe(typeof objekt.licht === 'string' ? objekt.licht : undefined);
  const ort = parseOrtAusgabe(
    typeof objekt.ort === 'string'
      ? objekt.ort
      : typeof objekt.drinnenDraussen === 'string'
        ? objekt.drinnenDraussen
        : undefined,
  );

  return {
    art,
    giessrhythmus,
    duengenrhythmus,
    erde: erde || undefined,
    licht,
    ort,
    sicherheit,
  };
}

/** Bild (JPEG/PNG-Bytes) vom Vision-Modell analysieren lassen. */
export async function fotoErkennen(bild: Buffer, mime: string): Promise<FotoVorschlag | null> {
  const anfrage = await fetch(`${BASIS_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: ANWEISUNG },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${bild.toString('base64')}` } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(90_000),
  });

  if (!anfrage.ok) {
    throw new Error(`Erkennungs-Dienst antwortete mit ${anfrage.status} (${anfrage.statusText}).`);
  }

  const antwort = (await anfrage.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = antwort.choices?.[0]?.message?.content;
  if (typeof text !== 'string') {
    throw new Error('Erkennungs-Dienst lieferte keinen Text zurück.');
  }
  return erkenungsErgebnisAusAntwort(text);
}

/** Pflegeparameter anhand des Artnamens (Text) ermitteln. */
export async function artDetailsErmitteln(artName: string): Promise<FotoVorschlag | null> {
  const anweisung = ART_ANWEISUNG.replace('{ART}', artName.trim());
  const anfrage = await fetch(`${BASIS_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELL,
      messages: [{ role: 'user', content: anweisung }],
      temperature: 0.1,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(90_000),
  });

  if (!anfrage.ok) {
    throw new Error(`Erkennungs-Dienst antwortete mit ${anfrage.status} (${anfrage.statusText}).`);
  }

  const antwort = (await anfrage.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = antwort.choices?.[0]?.message?.content;
  if (typeof text !== 'string') {
    throw new Error('Erkennungs-Dienst lieferte keinen Text zurück.');
  }
  return erkenungsErgebnisAusAntwort(text);
}
