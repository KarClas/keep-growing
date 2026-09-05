import Link from 'next/link';
import { nutzerListe, gaertenFuerNutzer } from '@/lib/db/abfragen';
import { aktiveNutzerId, aktiveGartenId } from '@/lib/session';
import { nutzerAnlegenAction, nutzerWaehlenAction, gartenAnlegenAction, gartenWaehlenAction } from '@/app/server-aktionen';

export default async function StartSeite() {
  const nutzer = nutzerListe();
  const nutzerIdAusCookie = await aktiveNutzerId();
  const gartenIdAusCookie = await aktiveGartenId();
  const aktiverNutzer = nutzer.some((n) => n.id === nutzerIdAusCookie) ? nutzerIdAusCookie : null;
  const gaerten = aktiverNutzer ? gaertenFuerNutzer(aktiverNutzer) : [];
  const aktiverGarten = gaerten.some((g) => g.id === gartenIdAusCookie) ? gartenIdAusCookie : null;

  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-2xl font-bold text-emerald-800">🌱 keep-growing</h1>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Wer bist du?</h2>
        {nutzer.length === 0 && <p className="text-sm text-stone-500">Noch niemand angelegt.</p>}
        <ul className="space-y-2">
          {nutzer.map((n) => (
            <li key={n.id}>
              <form action={nutzerWaehlenAction}>
                <input type="hidden" name="nutzerId" value={n.id} />
                <button
                  type="submit"
                  className={`w-full rounded-xl border px-4 py-2.5 text-left ${
                    aktiverNutzer === n.id ? 'border-emerald-600 bg-emerald-50 font-semibold' : 'border-stone-200'
                  }`}
                >
                  {n.name}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Neu hier?</h2>
        <form action={nutzerAnlegenAction} className="flex gap-2">
          <input
            name="name"
            required
            placeholder="Dein Name"
            className="flex-1 rounded-xl border border-stone-300 px-3 py-2.5"
          />
          <button type="submit" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-white">
            Loslegen
          </button>
        </form>
      </section>

      {aktiverNutzer && gaerten.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Welcher Garten?</h2>
          <ul className="space-y-2">
            {gaerten.map((g) => (
              <li key={g.id}>
                <form action={gartenWaehlenAction}>
                  <input type="hidden" name="gartenId" value={g.id} />
                  <button
                    type="submit"
                    className={`w-full rounded-xl border px-4 py-2.5 text-left ${
                      aktiverGarten === g.id ? 'border-emerald-600 bg-emerald-50 font-semibold' : 'border-stone-200'
                    }`}
                  >
                    {g.name}
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <form action={gartenAnlegenAction} className="mt-2 flex gap-2">
            <input
              name="name"
              required
              placeholder="Neuer Garten"
              className="flex-1 rounded-xl border border-stone-300 px-3 py-2.5"
            />
            <button type="submit" className="rounded-xl bg-stone-700 px-4 py-2.5 text-white">
              Anlegen
            </button>
          </form>
        </section>
      )}

      {aktiverNutzer && aktiverGarten && (
        <Link href="/" className="block rounded-xl bg-emerald-700 px-4 py-3 text-center font-semibold text-white">
          Weiter zu meinem Garten →
        </Link>
      )}
    </div>
  );
}
