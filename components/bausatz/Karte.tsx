import type { HTMLAttributes, ReactNode } from 'react';

export function Karte({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-2xl border border-kante bg-papier-hell shadow-karte ${className}`} {...rest}>
      {children}
    </div>
  );
}

/** Sichtbarer Fehler auf Deutsch, mit Handlungsmöglichkeit (REGELN.md, Abschnitt 1). */
export function Fehlerkasten({
  titel = 'Etwas ist schiefgegangen.',
  text,
  aktionen,
}: {
  titel?: ReactNode;
  text?: ReactNode;
  aktionen?: ReactNode;
}) {
  return (
    <div role="alert" className="rounded-2xl border border-gefahr/30 bg-gefahr-zart p-4 text-gefahr">
      <p className="font-semibold">{titel}</p>
      {text && <p className="mt-1 text-sm">{text}</p>}
      {aktionen && <div className="mt-3 flex flex-wrap gap-2">{aktionen}</div>}
    </div>
  );
}

/** Ein Satz, höchstens ein Knopf — kein leerer Kasten ohne Ausweg. */
export function Leerzustand({ text, aktion }: { text: ReactNode; aktion?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-kante-dunkel px-5 py-6 text-center">
      <p className="text-sm text-tinte-gedaempft">{text}</p>
      {aktion && <div className="mt-3 flex justify-center">{aktion}</div>}
    </div>
  );
}
