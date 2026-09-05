import Link from 'next/link';
import { redirect } from 'next/navigation';
import { aktuelleSitzung } from '@/lib/session';
import { pflanzenFuerGarten, naechsteFaelligkeitGiessen, naechsteFaelligkeitDuengen, type Pflanze } from '@/lib/db/abfragen';
import { aktivitaetAction } from '@/app/server-aktionen';

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
  titel: string;
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
        <button type="submit" className="rounded-full border border-emerald-600 px-3 py-1 text-sm text-emerald-700">
          ✓ erledigt
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

  return (
    <div className="space-y-10 pb-6">
      <h1 className="text-2xl font-bold">✅ Aufgaben</h1>

      {pflanzen.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
          Noch keine Pflanze da.
        </p>
      ) : (
        <>
          <PlanListe titel="💧 Gießrunde" eintraege={giessplan} typ="giessen" />
          <PlanListe
            titel="🌿 Düngerunde"
            eintraege={duengeplan}
            typ="duengen"
            zusatz={(p) => p.duengerTyp}
          />
        </>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">🧺 Ernte eintragen</h2>
        {pflanzen.length === 0 ? (
          <p className="text-sm text-stone-500">Noch keine Pflanze da.</p>
        ) : (
          <ul className="space-y-1.5">
            {pflanzen.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pflanze/${p.id}/ernte`}
                  className="block rounded-xl bg-white px-3 py-2.5 font-medium shadow-sm"
                >
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
