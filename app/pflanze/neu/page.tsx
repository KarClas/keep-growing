import Link from 'next/link';
import { pflanzeAnlegenAction } from '@/app/server-aktionen';

export default function NeuePflanze() {
  return (
    <div className="space-y-6 pb-6">
      <Link href="/hinzufuegen" className="text-sm text-stone-500 underline">
        ← Zurück
      </Link>

      <h1 className="text-2xl font-bold">✍️ Pflanze von Hand anlegen</h1>

      <form action={pflanzeAnlegenAction} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Name *</span>
          <input name="name" required className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Art</span>
          <input name="art" className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <fieldset className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="drinnenDraussen" value="drinnen" defaultChecked /> Drinnen
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="drinnenDraussen" value="draussen" /> Draußen
          </label>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Erde</span>
          <input name="erde" className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Licht</span>
          <input name="licht" className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Gießen alle wie viele Tage?</span>
          <input
            type="number"
            name="giessIntervallTage"
            min={1}
            defaultValue={7}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Düngen alle wie viele Tage? (leer = kein Düngeplan)</span>
          <input
            type="number"
            name="duengerIntervallTage"
            min={1}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Dünger</span>
          <input name="duengerTyp" className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Notiz</span>
          <textarea name="notiz" rows={3} className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <button type="submit" className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white">
          Pflanze anlegen
        </button>
      </form>
    </div>
  );
}
