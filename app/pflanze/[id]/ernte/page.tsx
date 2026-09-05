import Link from 'next/link';
import { redirect } from 'next/navigation';
import { aktiveNutzerId } from '@/lib/session';
import { pflanzeMitId } from '@/lib/db/abfragen';
import { ernteEintragenAction } from '@/app/server-aktionen';

export default async function ErnteEintragen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzerId = await aktiveNutzerId();
  if (!nutzerId) redirect('/start');

  const pflanze = pflanzeMitId(id, nutzerId);
  const heute = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-6">
      <Link href={`/pflanze/${pflanze.id}`} className="text-sm text-stone-500 underline">
        ← Zurück
      </Link>

      <h1 className="text-2xl font-bold">🧺 Ernte eintragen</h1>
      <p className="text-stone-500">{pflanze.name}</p>

      <form action={ernteEintragenAction} className="space-y-4">
        <input type="hidden" name="pflanzeId" value={pflanze.id} />

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Datum</span>
          <input
            type="date"
            name="datum"
            defaultValue={heute}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Menge</span>
          <input
            name="menge"
            placeholder="z. B. 500 g, 6 Stück"
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Notiz</span>
          <textarea name="notiz" rows={3} className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <button type="submit" className="w-full rounded-xl bg-rose-600 px-4 py-3 font-semibold text-white">
          Eintragen
        </button>
      </form>
    </div>
  );
}
