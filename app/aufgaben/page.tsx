import { redirect } from 'next/navigation';
import { aktuelleSitzung } from '@/lib/session';
import {
  pflanzenFuerGarten,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
  ernteListeFuerNutzer,
  type Pflanze,
} from '@/lib/db/abfragen';
import { ernteSymbol, istEssbar } from '@/lib/garten/symbole';
import { aktivitaetAction, ernteEintragenAction, ernteLoeschenAction } from '@/app/server-aktionen';
import { IconTropfen, IconBlatt, IconKorb, IconErledigt, IconX } from '@/components/Symbole';

function tagSchluessel(datum: Date): string {
  return datum.toISOString().slice(0, 10);
}

function gruppe(faelligkeit: Date, heute: Date, morgen: Date): 'heute' | 'morgen' | 'spaeter' {
  const tag = tagSchluessel(faelligkeit);
  if (tag <= tagSchluessel(heute)) return 'heute';
  if (tag === tagSchluessel(morgen)) return 'morgen';
  return 'spaeter';
}

function PlanListe({
  titel,
  eintraege,
  typ,
  zusatz,
}: {
  titel: React.ReactNode;
  eintraege: { pflanze: Pflanze; gruppe: 'heute' | 'morgen' | 'spaeter' }[];
  typ: 'giessen' | 'duengen';
  zusatz?: (pflanze: Pflanze) => string | null;
}) {
  const heute = eintraege.filter((e) => e.gruppe === 'heute');
  const morgen = eintraege.filter((e) => e.gruppe === 'morgen');

  const Zeile = ({ pflanze }: { pflanze: Pflanze }) => (
    <li className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
      <div>
        <p className="font-medium">{pflanze.name}</p>
        {zusatz?.(pflanze) && <p className="text-xs text-stone-500">{zusatz(pflanze)}</p>}
      </div>
      <form action={aktivitaetAction}>
        <input type="hidden" name="pflanzeId" value={pflanze.id} />
        <input type="hidden" name="typ" value={typ} />
        <button type="submit" className="flex items-center gap-1.5 rounded-full border border-emerald-600 px-3 py-1 text-sm text-emerald-700">
          <IconErledigt className="h-4 w-4" /> erledigt
        </button>
      </form>
    </li>
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">{titel}</h2>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">Heute</p>
          {heute.length === 0 ? (
            <p className="text-sm text-stone-400">Nichts offen.</p>
          ) : (
            <ul className="space-y-1.5">
              {heute.map((e) => (
                <Zeile key={e.pflanze.id} pflanze={e.pflanze} />
              ))}
            </ul>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-stone-400">Morgen</p>
          {morgen.length === 0 ? (
            <p className="text-sm text-stone-400">Nichts offen.</p>
          ) : (
            <ul className="space-y-1.5">
              {morgen.map((e) => (
                <Zeile key={e.pflanze.id} pflanze={e.pflanze} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default async function AufgabenSeite() {
  const sitzung = await aktuelleSitzung();
  if (!sitzung) redirect('/start');
  const { nutzerId, gartenId } = sitzung;

  const pflanzen = pflanzenFuerGarten(gartenId, nutzerId).filter((p) => p.lebenszustand === 'lebend');
  const essbarePflanzen = pflanzen.filter((p) => istEssbar(p.art));

  const heute = new Date();
  const morgen = new Date(heute.getTime() + 24 * 60 * 60 * 1000);

  const giessplan = pflanzen.map((pflanze) => ({
    pflanze,
    gruppe: gruppe(naechsteFaelligkeitGiessen(pflanze), heute, morgen),
  }));

  const duengeplan = pflanzen
    .filter((p) => p.duengerIntervallTage !== null)
    .map((pflanze) => ({
      pflanze,
      gruppe: gruppe(naechsteFaelligkeitDuengen(pflanze)!, heute, morgen),
    }));

  const heuteISO = heute.toISOString().slice(0, 10);
  const ernten = ernteListeFuerNutzer(nutzerId);

  return (
    <div className="space-y-10 pb-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <IconErledigt className="h-7 w-7 text-emerald-700" /> Aufgaben
      </h1>

      {pflanzen.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          Noch keine Pflanze da.
        </p>
      ) : (
        <>
          <PlanListe titel={<><IconTropfen className="h-5 w-5 text-sky-600" /> Gießen</>} eintraege={giessplan} typ="giessen" />
          <PlanListe
            titel={<><IconBlatt className="h-5 w-5 text-emerald-700" /> Düngen</>}
            eintraege={duengeplan}
            typ="duengen"
            zusatz={(p) => p.duengerTyp}
          />
        </>
      )}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><IconKorb className="h-5 w-5" /> Erntetagebuch</h2>

        {essbarePflanzen.length === 0 ? (
          <p className="text-sm text-stone-500">Noch keine essbare Pflanze da.</p>
        ) : (
          <form action={ernteEintragenAction} className="mb-4 space-y-3 rounded-xl bg-white p-3 shadow-sm">
            <input type="hidden" name="zurueck" value="/aufgaben" />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-500">Pflanze</span>
              <select
                name="pflanzeId"
                required
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
              >
                {essbarePflanzen.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-500">Datum</span>
                <input
                  type="date"
                  name="datum"
                  defaultValue={heuteISO}
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-stone-500">Menge</span>
                <input
                  name="menge"
                  placeholder="z. B. 500 g, 6 Stück"
                  className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-500">Notiz</span>
              <input
                name="notiz"
                placeholder="Wie war's?"
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
              />
            </label>
            <button type="submit" className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 font-semibold text-white">
              Eintragen
            </button>
          </form>
        )}

        {ernten.length === 0 ? (
          <p className="text-sm text-stone-500">Noch nichts geerntet.</p>
        ) : (
          <ul className="space-y-1.5">
            {ernten.map((e) => {
              const datum = new Date(e.datum).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'short',
                year: '2-digit',
              });
              return (
                <li key={e.id} className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="text-lg leading-6">{ernteSymbol(e.pflanzeName, e.pflanzeArt)}</span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{e.pflanzeName}</span>
                        {e.menge && <span className="ml-1.5 font-semibold text-emerald-700">{e.menge}</span>}
                        <span className="ml-1.5 text-xs text-stone-400">{datum}</span>
                      </p>
                      {e.notiz && <p className="mt-0.5 text-sm italic text-stone-500">{e.notiz}</p>}
                    </div>
                  </div>
                  <form action={ernteLoeschenAction}>
                    <input type="hidden" name="aktivitaetId" value={e.id} />
                    <button type="submit" aria-label="Eintrag löschen" className="shrink-0 text-stone-400">
                      <IconX className="h-4 w-4" />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
