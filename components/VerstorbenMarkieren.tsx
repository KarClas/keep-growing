'use client';

import { useState } from 'react';
import { alsVerstorbenAction } from '@/app/server-aktionen';
import { Knopf } from '@/components/bausatz/Knopf';

/**
 * Zwei Schritte statt einem Tipp: „Als verstorben markieren" wirkt sofort und
 * lässt sich nicht rückgängig machen — deshalb erst die Rückfrage.
 */
export function VerstorbenMarkieren({ pflanzeId }: { pflanzeId: string }) {
  const [nachfrage, setNachfrage] = useState(false);

  if (!nachfrage) {
    return (
      <div className="pt-4 text-center">
        <Knopf variante="gefahr" className="text-xs" onClick={() => setNachfrage(true)}>
          Als verstorben markieren
        </Knopf>
      </div>
    );
  }

  return (
    <form action={alsVerstorbenAction} className="mt-4 rounded-2xl border border-gefahr/30 bg-gefahr-zart p-4 text-center">
      <input type="hidden" name="pflanzeId" value={pflanzeId} />
      <p className="text-sm font-semibold text-gefahr">Wirklich? Die Pflanze wandert dann zu „In liebevoller Erinnerung&ldquo;.</p>
      <div className="mt-3 flex justify-center gap-2">
        <Knopf variante="sekundaer" onClick={() => setNachfrage(false)}>
          Abbrechen
        </Knopf>
        <Knopf type="submit" variante="sekundaer" className="border-gefahr/40! text-gefahr!">
          Ja, sie ist gestorben
        </Knopf>
      </div>
    </form>
  );
}
