import type { Metadata, Viewport } from 'next';
import './globals.css';
import { UntereNavigation } from '@/components/UntereNavigation';
import { aktiveNutzerId } from '@/lib/session';
import { nutzerMitId } from '@/lib/db/abfragen';

export const metadata: Metadata = {
  title: 'keep-growing',
  description: 'Pflanzenwachstum mit Töpfen, die Gesichter zeigen.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nutzerId = await aktiveNutzerId();
  const angemeldet = nutzerId !== null && nutzerMitId(nutzerId) !== undefined;

  return (
    <html lang="de">
      <body className={angemeldet ? 'min-h-screen pb-20' : 'min-h-screen'}>
        <main className="mx-auto max-w-md px-4 pt-6">{children}</main>
        {angemeldet && <UntereNavigation />}
      </body>
    </html>
  );
}
