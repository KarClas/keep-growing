'use client';

import { Fehlerkasten } from '@/components/bausatz/Karte';
import { Knopf } from '@/components/bausatz/Knopf';

export default function Fehler({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mt-10">
      <Fehlerkasten
        text={error.message}
        aktionen={
          <Knopf variante="sekundaer" onClick={reset}>
            Nochmal versuchen
          </Knopf>
        }
      />
    </div>
  );
}
