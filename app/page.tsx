import Link from 'next/link';
import { redirect } from 'next/navigation';
import { aktiveNutzerId, aktiveGartenId } from '@/lib/session';
import { pflanzenFuerGarten, pflegestimmungFuerPflanze, wuchsstufeFuerPflanze, ernteListeFuerNutzer } from '@/lib/db/abfragen';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { EngelWolke } from '@/components/EngelWolke';
import { ernteSymbol } from '@/lib/garten/symbole';

export default async function Home() {
  const nutzerId = await aktiveNutzerId();
  const gartenId = await aktiveGartenId();
  if (!nutzerId || !gartenId) redirect('/start');

  const pflanzen = pflanzenFuerGarten(gartenId, nutzerId);
  const lebend = pflanzen.filter((p) => p.lebenszustand === 'lebend');
  const verstorben = pflanzen.filter((p) => p.lebenszustand === 'verstorben');
  const ernten = ernteListeFuerNutzer(nutzerId);

  const ernteSymboleGesehen = new Map<string, string>();
  for (const e of ernten) {
    if (!ernteSymboleGesehen.has(e.pflanzeId)) {
      ernteSymboleGesehen.set(e.pflanzeId, ernteSymbol(e.pflanzeName, e.pflanzeArt));
    }
  }

  return (
    <div className="space-y-8 pb-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-800">🌱 Mein Garten</h1>
        <Link href="/start" className="text-sm text-stone-500 underline">
          Nutzer wechseln
        </Link>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Meine Töpfe</h2>
        {lebend.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
            Noch keine Pflanze da. Über „Hinzufügen&quot; die erste anlegen.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {lebend.map((p) => {
              const stimmung = pflegestimmungFuerPflanze(p);
              const wuchsstufe = wuchsstufeFuerPflanze(p);
              return (
                <Link key={p.id} href={`/pflanze/${p.id}`} className="rounded-2xl bg-white p-2 shadow-sm">
                  <div className="aspect-square">
                    <TopfMitGesicht wuchsstufe={wuchsstufe} stimmung={stimmung} name={p.name} art={p.art} />
                  </div>
                  <p className="mt-1 truncate text-center text-sm font-medium">{p.name}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Ernte-Vitrine</h2>
        {ernteSymboleGesehen.size === 0 ? (
          <p className="text-sm text-stone-500">Noch nichts geerntet.</p>
        ) : (
          <div className="flex flex-wrap gap-3 text-3xl">
            {[...ernteSymboleGesehen.values()].map((symbol, i) => (
              <span key={i}>{symbol}</span>
            ))}
          </div>
        )}
      </section>

      {verstorben.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-500">In liebevoller Erinnerung</h2>
          <div className="grid grid-cols-2 gap-4">
            {verstorben.map((p) => (
              <div key={p.id} className="rounded-2xl bg-white p-2 shadow-sm">
                <div className="aspect-square">
                  <EngelWolke name={p.name} />
                </div>
                <p className="mt-1 truncate text-center text-sm font-medium text-stone-500">{p.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
