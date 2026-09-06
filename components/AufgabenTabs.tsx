'use client';

import { useState } from 'react';

/**
 * Reiter-Leiste nach Friedrichs Skizze: oben „Gießen | Düngen | Ernten“ als
 * segmentierte Leiste, darunter nur der Inhalt des gewählten Reiters — statt
 * drei untereinandergestapelten Abschnitten.
 */
export function AufgabenTabs({ inhalte }: { inhalte: Record<'giessen' | 'duengen' | 'ernten', React.ReactNode> }) {
  const [aktiv, setAktiv] = useState<'giessen' | 'duengen' | 'ernten'>('giessen');

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Aufgaben-Bereiche"
        className="flex overflow-hidden rounded-2xl border border-kante bg-papier-hell shadow-karte"
      >
        {(
          [
            ['giessen', 'Gießen'],
            ['duengen', 'Düngen'],
            ['ernten', 'Ernten'],
          ] as const
        ).map(([wert, label], i) => (
          <button
            key={wert}
            role="tab"
            type="button"
            aria-selected={aktiv === wert}
            onClick={() => setAktiv(wert)}
            className={`flex-1 px-3 py-2.5 text-sm font-semibold transition-colors ${i > 0 ? 'border-l border-kante' : ''} ${
              aktiv === wert ? 'bg-moos text-white' : 'text-tinte-gedaempft active:bg-papier'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel">{inhalte[aktiv]}</div>
    </div>
  );
}
