import Link from 'next/link';
import { pflanzeAusScannerAction } from '@/app/server-aktionen';

export default function ScannerHinzufuegen() {
  return (
    <div className="space-y-6 pb-6">
      <Link href="/hinzufuegen" className="text-sm text-stone-500 underline">
        ← Zurück
      </Link>

      <h1 className="text-2xl font-bold">📷 Per Foto erkennen</h1>
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
        Die automatische Erkennung (Foto → Art + Pflegevorschlag) baut das übrige Team noch. Bis dahin bitte die Art
        von Hand eintragen — das Foto wird trotzdem schon gespeichert und an die Pflanze gehängt.
      </p>

      <form action={pflanzeAusScannerAction} encType="multipart/form-data" className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Foto</span>
          <input
            type="file"
            name="foto"
            accept="image/*"
            capture="environment"
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Name *</span>
          <input name="name" required className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Art *</span>
          <input name="art" required className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
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
          <span className="mb-1 block text-sm font-medium">Aktuelle Größe</span>
          <input
            name="aktuelleGroesse"
            placeholder="z. B. 20 cm, kleiner Ableger"
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Erde</span>
          <input name="erde" className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium">Licht</span>
          <input name="licht" className="w-full rounded-xl border border-stone-300 px-3 py-2.5" />
        </label>

        <button type="submit" className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white">
          Pflanze anlegen
        </button>
      </form>
    </div>
  );
}
