import Link from 'next/link';
import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/session';
import { pflanzeMitId, pflegestimmungFuerPflanze, wuchsstufeFuerPflanze, aktivitaetenFuerPflanze } from '@/lib/db/abfragen';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { aktivitaetAction, alsVerstorbenAction } from '@/app/server-aktionen';

const AKTIVITAET_LABEL: Record<string, string> = {
  giessen: '💧 Gegossen',
  duengen: '🌿 Gedüngt',
  ernten: '🧺 Geerntet',
};

export default async function PflanzenDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzerId = await aktuellerNutzer();
  if (!nutzerId) redirect('/start');

  const pflanze = pflanzeMitId(id, nutzerId);
  const stimmung = pflegestimmungFuerPflanze(pflanze);
  const wuchsstufe = wuchsstufeFuerPflanze(pflanze);
  const verlauf = aktivitaetenFuerPflanze(pflanze.id, nutzerId).slice(0, 10);

  return (
    <div className="space-y-6 pb-6">
      <Link href="/" className="text-sm text-stone-500 underline">
        ← Zurück
      </Link>

      <div className="mx-auto w-40 aspect-[8/13]">
        <TopfMitGesicht
          id={pflanze.id}
          wuchsstufe={wuchsstufe}
          stimmung={stimmung}
          name={pflanze.name}
          art={pflanze.art}
          darstellung={pflanze.darstellung}
        />
      </div>

      <h1 className="text-center text-2xl font-bold">{pflanze.name}</h1>

      {pflanze.lebenszustand === 'lebend' ? (
        <div className="grid grid-cols-3 gap-2">
          <form action={aktivitaetAction}>
            <input type="hidden" name="pflanzeId" value={pflanze.id} />
            <input type="hidden" name="typ" value="giessen" />
            <button type="submit" className="w-full rounded-xl bg-sky-600 px-2 py-3 text-sm font-medium text-white">
              💧 Gießen
            </button>
          </form>
          <form action={aktivitaetAction}>
            <input type="hidden" name="pflanzeId" value={pflanze.id} />
            <input type="hidden" name="typ" value="duengen" />
            <button type="submit" className="w-full rounded-xl bg-amber-600 px-2 py-3 text-sm font-medium text-white">
              🌿 Düngen
            </button>
          </form>
          <Link
            href={`/pflanze/${pflanze.id}/ernte`}
            className="flex w-full items-center justify-center rounded-xl bg-rose-600 px-2 py-3 text-center text-sm font-medium text-white"
          >
            🧺 Ernten
          </Link>
        </div>
      ) : (
        <p className="rounded-xl bg-stone-100 p-3 text-center text-sm text-stone-500">
          Diese Pflanze ist von uns gegangen und ruht in liebevoller Erinnerung.
        </p>
      )}

      <section className="rounded-xl border border-stone-200 p-4 text-sm">
        <dl className="grid grid-cols-2 gap-y-1">
          <dt className="text-stone-500">Art</dt>
          <dd>{pflanze.art ?? '–'}</dd>
          <dt className="text-stone-500">Erde</dt>
          <dd>{pflanze.erde ?? '–'}</dd>
          <dt className="text-stone-500">Licht</dt>
          <dd>{pflanze.licht ?? '–'}</dd>
          <dt className="text-stone-500">Standort</dt>
          <dd>{pflanze.drinnenDraussen === 'drinnen' ? 'Drinnen' : 'Draußen'}</dd>
          <dt className="text-stone-500">Gießrhythmus</dt>
          <dd>alle {pflanze.giessIntervallTage} Tage</dd>
          {pflanze.duengerIntervallTage !== null && (
            <>
              <dt className="text-stone-500">Düngerhythmus</dt>
              <dd>
                alle {pflanze.duengerIntervallTage} Tage{pflanze.duengerTyp ? ` (${pflanze.duengerTyp})` : ''}
              </dd>
            </>
          )}
        </dl>
        {pflanze.notiz && <p className="mt-3 whitespace-pre-wrap text-stone-600">{pflanze.notiz}</p>}
      </section>

      {verlauf.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Verlauf</h2>
          <ul className="space-y-1 text-sm">
            {verlauf.map((a) => (
              <li key={a.id} className="flex justify-between rounded-lg bg-stone-50 px-3 py-2">
                <span>{AKTIVITAET_LABEL[a.typ] ?? a.typ}</span>
                <span className="text-stone-400">{new Date(a.datum).toLocaleDateString('de-DE')}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pflanze.lebenszustand === 'lebend' && (
        <form action={alsVerstorbenAction} className="pt-4 text-center">
          <input type="hidden" name="pflanzeId" value={pflanze.id} />
          <button type="submit" className="text-xs text-stone-400 underline">
            Als verstorben markieren
          </button>
        </form>
      )}
    </div>
  );
}
