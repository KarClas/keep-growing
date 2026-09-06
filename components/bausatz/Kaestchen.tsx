'use client';

import { useFormStatus } from 'react-dom';
import { IconErledigt } from '@/components/Symbole';
import { Spinner } from './Knopf';

/**
 * Abhak-Kästchen der Aufgabenseite (Team-Entscheidung: Kästchen statt Knopf).
 * Tippfläche 44 px, sichtbares Kästchen 28 px. Während die Server-Aktion
 * läuft, zeigt es einen Spinner; danach verschwindet die Zeile aus der Liste.
 */
export function Kaestchen({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      aria-busy={pending || undefined}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-moos bg-papier-hell text-transparent">
        {pending ? <Spinner className="h-3.5 w-3.5 text-moos" /> : <IconErledigt className="h-4 w-4" />}
      </span>
    </button>
  );
}
