'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ZIELE = [
  { href: '/', label: 'Home', icon: '🏡' },
  { href: '/aktionen', label: 'Aktionen', icon: '✅' },
  { href: '/hinzufuegen', label: 'Hinzufügen', icon: '➕' },
];

export function UntereNavigation() {
  const pfad = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md justify-around">
        {ZIELE.map((ziel) => {
          const aktiv = ziel.href === '/' ? pfad === '/' : pfad.startsWith(ziel.href);
          return (
            <li key={ziel.href} className="flex-1">
              <Link
                href={ziel.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs ${
                  aktiv ? 'text-emerald-700 font-semibold' : 'text-stone-500'
                }`}
              >
                <span className="text-xl leading-none">{ziel.icon}</span>
                {ziel.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
