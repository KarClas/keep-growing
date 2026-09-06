import { pflanzeAnlegenAction } from '@/app/server-aktionen';
import { Seitentitel, ZurueckChip, Abschnittstitel } from '@/components/bausatz/Titel';
import { Karte } from '@/components/bausatz/Karte';
import { Feld, Eingabe, Textbereich } from '@/components/bausatz/Feld';
import { Umschalter } from '@/components/bausatz/Umschalter';
import { Knopf } from '@/components/bausatz/Knopf';

export default function NeuePflanze() {
  return (
    <div className="space-y-6 pb-6">
      <ZurueckChip href="/hinzufuegen" />

      <Seitentitel>
        Pflanze von Hand <em>anlegen</em>
      </Seitentitel>

      <form action={pflanzeAnlegenAction} className="space-y-6">
        <Karte className="space-y-4 p-4">
          <Feld label="Name *">
            <Eingabe name="name" required placeholder="z. B. Tomate Sunny" />
          </Feld>
          <Feld label="Art">
            <Eingabe name="art" placeholder="z. B. Cocktailtomate" />
          </Feld>
          <Umschalter
            name="drinnenDraussen"
            legende="Standort"
            vorgabe="drinnen"
            optionen={[
              { wert: 'drinnen', label: 'Drinnen' },
              { wert: 'draussen', label: 'Draußen' },
            ]}
          />
        </Karte>

        <section>
          <Abschnittstitel>Pflege</Abschnittstitel>
          <Karte className="space-y-4 p-4">
            <Feld label="Erde">
              <Eingabe name="erde" />
            </Feld>
            <Feld label="Licht">
              <Eingabe name="licht" />
            </Feld>
            <div className="grid grid-cols-2 gap-3">
              <Feld label="Gießen alle … Tage">
                <Eingabe type="number" name="giessIntervallTage" min={1} defaultValue={7} inputMode="numeric" />
              </Feld>
              <Feld label="Düngen alle … Tage" hinweis="leer = kein Düngeplan">
                <Eingabe type="number" name="duengerIntervallTage" min={1} inputMode="numeric" />
              </Feld>
            </div>
            <Feld label="Dünger">
              <Eingabe name="duengerTyp" placeholder="z. B. Tomatendünger" />
            </Feld>
            <Feld label="Notiz">
              <Textbereich name="notiz" rows={3} />
            </Feld>
          </Karte>
        </section>

        <Knopf type="submit" variante="primaer" className="w-full">
          Pflanze anlegen
        </Knopf>
      </form>
    </div>
  );
}
