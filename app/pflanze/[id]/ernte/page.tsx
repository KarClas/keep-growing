import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/session';
import { pflanzeMitId } from '@/lib/db/abfragen';
import { ernteEintragenAction } from '@/app/server-aktionen';
import { IconKorb } from '@/components/Symbole';
import { Seitentitel, ZurueckChip } from '@/components/bausatz/Titel';
import { Karte } from '@/components/bausatz/Karte';
import { Feld, Eingabe, Textbereich } from '@/components/bausatz/Feld';
import { Knopf } from '@/components/bausatz/Knopf';

export default async function ErnteEintragen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzerId = await aktuellerNutzer();
  if (!nutzerId) redirect('/start');

  const pflanze = pflanzeMitId(id, nutzerId);
  const heute = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 pb-6">
      <ZurueckChip href={`/pflanze/${pflanze.id}`}>{pflanze.name}</ZurueckChip>

      <header className="space-y-1">
        <Seitentitel>
          Ernte <em>eintragen</em>
        </Seitentitel>
        <p className="flex items-center gap-1.5 text-sm text-tinte-gedaempft">
          <IconKorb className="h-4 w-4" /> {pflanze.name}
        </p>
      </header>

      <Karte className="p-4">
        <form action={ernteEintragenAction} className="space-y-4">
          <input type="hidden" name="pflanzeId" value={pflanze.id} />
          <Feld label="Datum">
            <Eingabe type="date" name="datum" defaultValue={heute} />
          </Feld>
          <Feld label="Menge" hinweis="Frei formuliert, zum Beispiel 500 g oder 6 Stück">
            <Eingabe name="menge" placeholder="z. B. 500 g, 6 Stück" />
          </Feld>
          <Feld label="Notiz">
            <Textbereich name="notiz" rows={3} placeholder="Wie war's?" />
          </Feld>
          <Knopf type="submit" variante="primaer" className="w-full">
            Eintragen
          </Knopf>
        </form>
      </Karte>
    </div>
  );
}
