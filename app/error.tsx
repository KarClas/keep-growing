'use client';

export default function Fehler({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mt-10 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">Etwas ist schiefgegangen.</p>
      <p className="mt-1 text-sm">{error.message}</p>
      <button onClick={reset} className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white">
        Nochmal versuchen
      </button>
    </div>
  );
}
