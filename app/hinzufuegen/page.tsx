import Link from 'next/link';

export default function Hinzufuegen() {
  return (
    <div className="space-y-4 pb-6">
      <h1 className="text-2xl font-bold">➕ Pflanze hinzufügen</h1>

      <Link
        href="/pflanze/neu"
        className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <p className="text-lg font-semibold">✍️ Von Hand eintragen</p>
        <p className="mt-1 text-sm text-stone-500">Name und Pflegedaten selbst eingeben.</p>
      </Link>

      <Link
        href="/pflanze/scanner"
        className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <p className="text-lg font-semibold">📷 Per Foto erkennen</p>
        <p className="mt-1 text-sm text-stone-500">Foto machen, Art und Pflege vorschlagen lassen.</p>
      </Link>
    </div>
  );
}
