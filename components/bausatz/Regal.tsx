import type { ReactNode } from 'react';

/** Holzbrett, auf dem Töpfe stehen. */
export function Regalbrett({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`h-2.5 rounded-[3px] bg-linear-to-b from-holz-hell to-holz-dunkel shadow-brett ${className}`} />
  );
}

export interface RegalEintrag {
  schluessel: string;
  topf: ReactNode;
  beschriftung: ReactNode;
}

/** Ordnet Einträge dreierweise: Töpfe, darunter das Brett, darunter die Namen. */
export function Regal({ eintraege }: { eintraege: RegalEintrag[] }) {
  const reihen: RegalEintrag[][] = [];
  for (let i = 0; i < eintraege.length; i += 3) reihen.push(eintraege.slice(i, i + 3));

  return (
    <div className="space-y-7">
      {reihen.map((reihe, i) => (
        <div key={i}>
          <div className="grid grid-cols-3 gap-x-3 px-1">
            {reihe.map((e) => (
              <div key={e.schluessel} className="drop-shadow-[0_6px_4px_rgba(90,60,30,0.18)]">
                {e.topf}
              </div>
            ))}
          </div>
          <Regalbrett className="-mx-1 -mt-1" />
          <div className="grid grid-cols-3 gap-x-3 px-1 pt-2">
            {reihe.map((e) => (
              <div key={e.schluessel} className="min-w-0">
                {e.beschriftung}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
