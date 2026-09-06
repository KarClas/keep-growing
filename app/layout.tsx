import type { Metadata, Viewport } from 'next';
import { Fraunces, Figtree } from 'next/font/google';
import './globals.css';
import { UntereNavigation } from '@/components/UntereNavigation';
import { aktiveNutzerId } from '@/lib/session';
import { nutzerMitId } from '@/lib/db/abfragen';

// Beide Schriften werden beim Bauen einmal heruntergeladen und danach von der
// App selbst ausgeliefert — im Betrieb keine Verbindung nach außen (STACK.md).
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'keep-growing',
  description: 'Pflanzenwachstum mit Töpfen, die Gesichter zeigen.',
};

// Kein maximumScale: Nutzer:innen dürfen zoomen (Barrierefreiheit, axe „meta-viewport").
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nutzerId = await aktiveNutzerId();
  const angemeldet = nutzerId !== null && nutzerMitId(nutzerId) !== undefined;

  return (
    <html lang="de" className={`${fraunces.variable} ${figtree.variable}`}>
      {/* pb-28: Platz für die schwebende untere Leiste, damit sie nichts verdeckt. */}
      {/* Die Leiste wird immer gerendert — sie war sonst auf /hinzufuegen weg,
          sobald niemand angemeldet ist (die Seite braucht kein Login). */}
      <body className={angemeldet ? 'min-h-screen pb-28' : 'min-h-screen pb-28'}>
        <main className="einblenden mx-auto max-w-md px-4 pt-6">{children}</main>
        <UntereNavigation />
      </body>
    </html>
  );
}
