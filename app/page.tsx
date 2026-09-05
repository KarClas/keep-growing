import Link from 'next/link';
import { redirect } from 'next/navigation';
import { aktuelleSitzung } from '@/lib/session';
import { pflanzenFuerGarten, pflegestimmungFuerPflanze, wuchsstufeFuerPflanze, ernteListeFuerNutzer } from '@/lib/db/abfragen';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { EngelWolke } from '@/components/EngelWolke';
import { ernteSymbol } from '@/lib/garten/symbole';
import { IconKeimling } from '@/components/Symbole';

export default async function Home() {
  const sitzung = await aktuelleSitzung();
  if (!sitzung) redirect('/start');
  const { nutzerId, gartenId } = sitzung;

  const pflanzen = pflanzenFuerGarten(gartenId, nutzerId);
  const lebend = pflanzen.filter((p) => p.lebenszustand === 'lebend');
  const verstorben = pflanzen.filter((p) => p.lebenszustand === 'verstorben');
  const ernten = ernteListeFuerNutzer(nutzerId);
  // Älteste zuerst, damit die Vitrine mit jeder neuen Ernte nach rechts wächst.
  const ernteChronologisch = [...ernten].reverse();

  return (
    <div className="space-y-8 pb-6">
      <header className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-emerald-800">
          <IconKeimling className="h-7 w-7" /> Mein Garten
        </h1>
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
          <div className="grid grid-cols-3 gap-3">
            {lebend.map((p) => {
              const stimmung = pflegestimmungFuerPflanze(p);
              const wuchsstufe = wuchsstufeFuerPflanze(p);
              return (
                <Link key={p.id} href={`/pflanze/${p.id}`} className="active:opacity-70">
                  <div className="aspect-[8/13]">
                    <TopfMitGesicht
                      id={p.id}
                      wuchsstufe={wuchsstufe}
                      stimmung={stimmung}
                      name={p.name}
                      art={p.art}
                      darstellung={p.darstellung}
                    />
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
        {ernteChronologisch.length === 0 ? (
          <p className="text-sm text-stone-500">Noch nichts geerntet.</p>
        ) : (
          <div className="flex flex-wrap gap-3 text-2xl">
            {ernteChronologisch.map((e, i) => {
              const datum = new Date(e.datum).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: 'long',
              });
              const titel = `${e.pflanzeName} · ${datum}${e.menge ? ' · ' + e.menge : ''}${e.notiz ? ' — ' + e.notiz : ''}`;
              return (
                <span key={i} title={titel}>
                  {ernteSymbol(e.pflanzeName, e.pflanzeArt)}
                </span>
              );
            })}
          </div>
        )}
      </section>

      {verstorben.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-500">In liebevoller Erinnerung</h2>
          <div className="grid grid-cols-3 gap-3">
            {verstorben.map((p) => (
              <div key={p.id}>
                <div className="aspect-square">
                  <EngelWolke
                    id={p.id}
                    wuchsstufe={wuchsstufeFuerPflanze(p)}
                    name={p.name}
                    art={p.art}
                    darstellung={p.darstellung}
                  />
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
