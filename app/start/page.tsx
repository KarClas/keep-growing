import { nutzerListe, gaertenFuerNutzer } from '@/lib/db/abfragen';
import { aktiveNutzerId, aktiveGartenId } from '@/lib/session';
import { nutzerAnlegenAction, nutzerWaehlenAction, gartenAnlegenAction, gartenWaehlenAction } from '@/app/server-aktionen';
import { Seitentitel, Abschnittstitel } from '@/components/bausatz/Titel';
import { Knopf } from '@/components/bausatz/Knopf';
import { KnopfLink } from '@/components/bausatz/KnopfLink';
import { Eingabe } from '@/components/bausatz/Feld';

export default async function StartSeite() {
  const nutzer = nutzerListe();
  const nutzerIdAusCookie = await aktiveNutzerId();
  const gartenIdAusCookie = await aktiveGartenId();
  const aktiverNutzer = nutzer.some((n) => n.id === nutzerIdAusCookie) ? nutzerIdAusCookie : null;
  const gaerten = aktiverNutzer ? gaertenFuerNutzer(aktiverNutzer) : [];
  const aktiverGarten = gaerten.some((g) => g.id === gartenIdAusCookie) ? gartenIdAusCookie : null;

  // Gewählter Eintrag: moosgrüner Rand und zarter Grünton, alles andere Papier.
  const auswahlKlassen = (gewaehlt: boolean) =>
    `w-full justify-start! ${gewaehlt ? 'border-moos bg-moos-zart text-moos-dunkel' : ''}`;

  return (
    <div className="space-y-8 pb-10">
      <header className="space-y-1">
        <Seitentitel>
          keep-<em>growing</em>
        </Seitentitel>
        <p className="text-sm text-tinte-gedaempft">Töpfe mit Gesichtern, die zeigen, wie es ihnen geht.</p>
      </header>

      <section>
        <Abschnittstitel>Wer bist du?</Abschnittstitel>
        {nutzer.length === 0 && <p className="text-sm text-tinte-gedaempft">Noch niemand angelegt.</p>}
        <ul className="space-y-2">
          {nutzer.map((n) => (
            <li key={n.id}>
              <form action={nutzerWaehlenAction}>
                <input type="hidden" name="nutzerId" value={n.id} />
                <Knopf
                  type="submit"
                  variante="sekundaer"
                  aria-pressed={aktiverNutzer === n.id}
                  className={auswahlKlassen(aktiverNutzer === n.id)}
                >
                  {n.name}
                </Knopf>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Abschnittstitel>Neu hier?</Abschnittstitel>
        <form action={nutzerAnlegenAction} className="flex gap-2">
          <Eingabe name="name" required placeholder="Dein Name" aria-label="Dein Name" />
          <Knopf type="submit" variante="primaer" className="shrink-0">
            Loslegen
          </Knopf>
        </form>
      </section>

      {aktiverNutzer && gaerten.length > 0 && (
        <section>
          <Abschnittstitel>Welcher Garten?</Abschnittstitel>
          <ul className="space-y-2">
            {gaerten.map((g) => (
              <li key={g.id}>
                <form action={gartenWaehlenAction}>
                  <input type="hidden" name="gartenId" value={g.id} />
                  <Knopf
                    type="submit"
                    variante="sekundaer"
                    aria-pressed={aktiverGarten === g.id}
                    className={auswahlKlassen(aktiverGarten === g.id)}
                  >
                    {g.name}
                  </Knopf>
                </form>
              </li>
            ))}
          </ul>
          <form action={gartenAnlegenAction} className="mt-2 flex gap-2">
            <Eingabe name="name" required placeholder="Neuer Garten" aria-label="Name des neuen Gartens" />
            <Knopf type="submit" variante="sekundaer" className="shrink-0">
              Anlegen
            </Knopf>
          </form>
        </section>
      )}

      {aktiverNutzer && aktiverGarten && (
        <KnopfLink href="/" variante="primaer" className="w-full">
          Weiter zu meinem Garten
        </KnopfLink>
      )}
    </div>
  );
}
