/**
 * Echte Foto-Erkennung: ein Vision-Modell (Qwen über den SPARK-Endpoint,
 * OpenAI-kompatibel) beschreibt das Bild und liefert Art + Pflegewerte.
 * Das Ergebnis wird gegen die ErkennungsErgebnis-Schnittstelle aus
 * lib/db/abfragen.ts validiert — ungültige Antworten führen zu null
 * („nichts erkannt“), nie zu erfundenen Werten.
 */

import type { FotoVorschlag } from './typ.ts';

const BASIS_URL = process.env.ERKENNUNG_API_URL ?? 'http://gx10-473b-1tb-nr2.taildca6a1.ts.net:18300/v1';
const MODELL = process.env.ERKENNUNG_MODELL ?? 'qwen3.8-flash-next';

const ANWEISUNG = `Du bist die Pflanzen-Erkennung der App "keep-growing".
Analysiere das Foto. Nenne die HAUPT-PFLANZE (das eigentliche Motiv) mit deutschem
Namen und botanischem Namen in einer Zeile, z. B. "Rote Rose (Rosa spec.)".
Nenne Begleitpflanzen (Füll Blüten, Gräser) NUR im Feld "hinweis".
Antworte ausschließlich mit einem JSON-Objekt, ohne Markdown, genau dieser Felder.
Halte alle Felder kurz (hinweis/erde/licht je höchstens 12 Wörter):
{
  "erkannt": true oder false,
  "name": "kurzer deutscher Name der Hauptpflanze",
  "art": "deutscher Name mit botanischem Namen",
  "hinweis": "ein Satz zu weiteren sichtbaren Pflanzen oder Bestandteilen",
  "sicherheit": "hoch" | "mittel" | "gering",
  "erde": "Pflegehinweis Erde, kurz",
  "licht": "Pflegehinweis Licht, kurz",
  "giessIntervallTage": Zahl,
  "duengerIntervallTage": Zahl oder null,
  "duengerTyp": String oder null,
  "drinnenDraussen": "drinnen" oder "draussen"
}
Wenn auf dem Foto keine Pflanze zu sehen ist, antworte {"erkannt": false}.`;

/** JSON aus der Modell-Antwort holen (rohes JSON, ```-Zaun oder eingebettet). */
export function parseErkennungsAntwort(text: string): Record<string, unknown> | null {
  const versuche = [text.trim()];
  const zaaun = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (zaaun) versuche.push(zaaun[1].trim());
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
 * Rohe Modellantwort → validiertes ErkennungsErgebnis oder null.
 * null heißt ehrlich: keine Pflanze erkannt oder Antwort unbrauchbar.
 */
export function erkenungsErgebnisAusAntwort(text: string): FotoVorschlag | null {
  const objekt = parseErkennungsAntwort(text);
  if (!objekt) return null;
  if (objekt.erkannt !== true) return null;

  const art = typeof objekt.art === 'string' ? objekt.art.trim() : '';
  const name = typeof objekt.name === 'string' ? objekt.name.trim() : '';
  if (art === '' || name === '') return null;

  const intervall = (wert: unknown): number | undefined => {
    const zahl = typeof wert === 'string' ? Number(wert) : wert;
    return typeof zahl === 'number' && Number.isFinite(zahl) && zahl >= 1 ? Math.round(zahl) : undefined;
  };
  const textOderNull = (wert: unknown): string | null =>
    typeof wert === 'string' && wert.trim() !== '' ? wert.trim() : null;

  const sicherheit = objekt.sicherheit === 'hoch' || objekt.sicherheit === 'gering' ? objekt.sicherheit : 'mittel';
  const drinnen = objekt.drinnenDraussen === 'draussen' ? 'draussen' : 'drinnen';

  return {
    art,
    nameVorschlag: name,
    hinweis: textOderNull(objekt.hinweis),
    sicherheit,
    erde: textOderNull(objekt.erde),
    licht: textOderNull(objekt.licht),
    giessIntervallTage: intervall(objekt.giessIntervallTage),
    duengerIntervallTage: intervall(objekt.duengerIntervallTage),
    duengerTyp: textOderNull(objekt.duengerTyp),
    drinnenDraussen: drinnen,
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
      // Der Endpoint kann erzwingen, dass der Modelltext immer gültiges JSON ist
      // (kein abgeschnittener Markdown-Text mehr, der die Validierung kippt).
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
