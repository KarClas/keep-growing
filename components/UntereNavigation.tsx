'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

function IconHeim({ aktiv }: { aktiv: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={aktiv ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function IconAufgaben({ aktiv }: { aktiv: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill={aktiv ? 'currentColor' : 'none'} stroke="currentColor" />
      <path d="m8 12 2.8 2.8L16.5 9" stroke={aktiv ? 'white' : 'currentColor'} />
    </svg>
  );
}

function IconPlus({ aktiv }: { aktiv: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={aktiv ? 2.4 : 1.8}
      strokeLinecap="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const ZIELE: { href: string; label: string; icon: (props: { aktiv: boolean }) => ReactNode }[] = [
  { href: '/', label: 'Home', icon: IconHeim },
  { href: '/aufgaben', label: 'Aufgaben', icon: IconAufgaben },
  { href: '/hinzufuegen', label: 'Neu', icon: IconPlus },
];

export function UntereNavigation() {
  const pfad = usePathname();

  return (
    <nav aria-label="Hauptnavigation" className="fixed inset-x-0 bottom-0 z-10 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <ul className="mx-auto flex max-w-md justify-around rounded-full border border-kante bg-papier-hell/95 px-2 py-1.5 shadow-schweben backdrop-blur">
        {ZIELE.map((ziel) => {
          // Pflanzenseiten gehören zum Garten — Home bleibt dort markiert.
          const aktiv = ziel.href === '/' ? pfad === '/' || pfad.startsWith('/pflanze') : pfad.startsWith(ziel.href);
          const Icon = ziel.icon;
          return (
            <li key={ziel.href} className="flex-1">
              <Link
                href={ziel.href}
                aria-current={aktiv ? 'page' : undefined}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold transition-colors ${
                  aktiv ? 'text-moos' : 'text-tinte-gedaempft hover:text-tinte'
                }`}
              >
                <Icon aktiv={aktiv} />
                {ziel.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
