import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconZurueck } from '@/components/Symbole';

/** Seitenüberschrift in Fraunces; ein <em> darin wird kursiv und moosgrün. */
export function Seitentitel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={`font-anzeige text-3xl font-medium leading-none tracking-tight text-moos-dunkel [&_em]:italic [&_em]:text-moos-hell ${className}`}
    >
      {children}
    </h1>
  );
}

export function Abschnittstitel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={`mb-2 flex items-center gap-1.5 font-anzeige text-base italic text-tinte-gedaempft ${className}`}>
      {children}
    </h2>
  );
}

export function ZurueckChip({ href, children = 'Zurück' }: { href: string; children?: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-kante bg-papier-hell pl-2 pr-3.5 text-sm font-semibold text-tinte-gedaempft shadow-karte transition hover:text-tinte"
    >
      <IconZurueck className="h-4 w-4" />
      {children}
    </Link>
  );
}
