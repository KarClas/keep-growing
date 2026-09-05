import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { profilSchritt2AnlegenAction } from '@/app/server-aktionen';
import {
  ENJOY_05_PLANT_DATA,
  holeDetailsFuerPflanze,
  parseLichtAusgabe,
  type PflanzenErkennungsErgebnis,
} from '@/lib/pflanzen-api';

interface Props {
  searchParams?: Promise<{
    name?: string;
    art?: string;
    giessrhythmus?: string;
    giessenrhythmus?: string;
    duengenrhythmus?: string;
    erde?: string;
    licht?: string;
    notiz?: string;
  }>;
}

function feldWertBereinigen(wert?: string | null): string {
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

export default async function ProfilSchritt2Seite({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  let daten: PflanzenErkennungsErgebnis = ENJOY_05_PLANT_DATA;
  if (params.art && params.art !== daten.raw_name && params.art !== daten.identified_name) {
    try {
      daten = await holeDetailsFuerPflanze(params.art);
    } catch {
      // Fallback
    }
  }

  const artVorgabe = feldWertBereinigen(params.art ?? daten.identified_name ?? daten.raw_name);
  const giessVorgabe = feldWertBereinigen(params.giessrhythmus ?? params.giessenrhythmus ?? daten.Giessrhythmus);
  const duengenVorgabe = feldWertBereinigen(params.duengenrhythmus ?? daten.Duengenrhytmus);
  const erdeVorgabe = feldWertBereinigen(params.erde ?? daten.Erde);
  const lichtVorgabe = parseLichtAusgabe(params.licht ?? daten.Licht);
  const notizVorgabe = feldWertBereinigen(params.notiz ?? '');

  const hinweisName = `(Dein Wahl oder Mein ${artVorgabe || '<Art des Pflanzes>'})`;

  return (
    <div className="space-y-6 pb-10">
      {/* 3.a Titel */}
      <h1 className="text-center text-2xl font-bold text-stone-900">
        Einstellung des Profils
      </h1>

      {/* 3.b Vorschau-Bild (Boilerplate Icon, keine Korrekturmöglichkeit) */}
      <div className="flex justify-center">
        <div className="flex h-44 w-44 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
          <TopfMitGesicht id="vorschau" wuchsstufe={2} stimmung="zufrieden" name={artVorgabe || 'Pflanze'} art={artVorgabe} />
        </div>
      </div>

      {/* 3.c Felder prüfen und ggf. bearbeiten */}
      <form action={profilSchritt2AnlegenAction} className="space-y-4">
        {/* c.1: Name (standardmäßig leer, kleine graue Notiz in Klammern) */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">
            Name <span className="text-xs font-normal text-stone-400">{hinweisName}</span>
          </span>
          <input
            type="text"
            name="name"
            defaultValue=""
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* c.2: Art */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Art</span>
          <input
            type="text"
            name="art"
            defaultValue={artVorgabe}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* c.3: Giessenrhythmus */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Giessenrhythmus</span>
          <textarea
            name="giessrhythmus"
            rows={3}
            defaultValue={giessVorgabe}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* c.4: Duengenrhythmus */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Duengenrhythmus</span>
          <textarea
            name="duengenrhythmus"
            rows={2}
            defaultValue={duengenVorgabe}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* c.5: Erde (Erdemischung) */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Erde (Erdemischung)</span>
          <input
            type="text"
            name="erde"
            defaultValue={erdeVorgabe}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* c.6: Licht (deterministisches Textfeld mit 3 Optionen) */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Licht</span>
          <input
            type="text"
            name="licht"
            autoComplete="off"
            defaultValue={lichtVorgabe}
            placeholder="Sonne, Schatten oder Sonne oder Schatten"
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* c.7: Notiz */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Notiz</span>
          <textarea
            name="notiz"
            rows={3}
            defaultValue={notizVorgabe}
            placeholder="Freie Notiz..."
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* Am Ende steht: Das Profil Anlegen */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition active:bg-emerald-800"
          >
            Das Profil Anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
