'use client';

import { useFormStatus } from 'react-dom';
import { IconErledigt } from '@/components/Symbole';
import { Spinner } from './Knopf';

/**
 * Abhak-Kästchen der Aufgabenseite (Team-Entscheidung: Kästchen statt Knopf).
 * Tippfläche 44 px, sichtbares Kästchen 28 px. Erledigte Zeilen sind gesperrt —
 * ein Abhaken lässt sich nicht zurücknehmen, das ist ehrlich so.
 */
export function Kaestchen({ label, erledigt = false }: { label: string; erledigt?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={erledigt || pending}
      aria-label={label}
      aria-busy={pending || undefined}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl disabled:cursor-default"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 border-moos transition-colors ${
          erledigt ? 'bg-moos text-papier-hell' : 'bg-papier-hell text-transparent'
        }`}
      >
        {pending ? <Spinner className="h-3.5 w-3.5 text-moos" /> : <IconErledigt className="h-4 w-4" />}
      </span>
    </button>
  );
}
