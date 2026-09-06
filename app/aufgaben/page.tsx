import { redirect } from 'next/navigation';
import { aktuelleSitzung } from '@/lib/session';
import {
  pflanzenFuerGarten,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
  zuletztGepflegtAm,
  pflegestimmungFuerPflanze,
  wuchsstufeFuerPflanze,
  ernteListeFuerNutzer,
  type Pflanze,
  type AktivitaetTyp,
} from '@/lib/db/abfragen';
import {
  faelligkeitsgruppe,
  beschreibeFaelligkeit,
  istHeute,
  ermutigungsSatz,
  type Faelligkeitsgruppe,
} from '@/lib/garten/faelligkeit';
import { ernteSymbol, istEssbar } from '@/lib/garten/symbole';
import { aktivitaetAction, ernteEintragenAction, ernteLoeschenAction } from '@/app/server-aktionen';
import { IconTropfen, IconBlatt, IconKorb, IconErledigt, IconX } from '@/components/Symbole';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { Seitentitel, Abschnittstitel } from '@/components/bausatz/Titel';
import { Karte, Leerzustand } from '@/components/bausatz/Karte';
import { Kaestchen } from '@/components/bausatz/Kaestchen';
import { Knopf } from '@/components/bausatz/Knopf';
import { KnopfLink } from '@/components/bausatz/KnopfLink';
import { Feld, Eingabe, Auswahl } from '@/components/bausatz/Feld';

interface PlanZeile {
  pflanze: Pflanze;
  faelligAm: Date;
  gruppe: Faelligkeitsgruppe;
  heuteErledigt: boolean;
}

function planZeilen(pflanzen: Pflanze[], typ: 'giessen' | 'duengen', heute: Date): PlanZeile[] {
  const zeilen: PlanZeile[] = [];
  for (const pflanze of pflanzen) {
    const faelligAm = typ === 'giessen' ? naechsteFaelligkeitGiessen(pflanze) : naechsteFaelligkeitDuengen(pflanze);
    if (faelligAm === null) continue; // kein Düngeplan
    zeilen.push({
      pflanze,
      faelligAm,
      gruppe: faelligkeitsgruppe(faelligAm, heute),
      heuteErledigt: istHeute(zuletztGepflegtAm(pflanze, typ), heute),
    });
  }
  return zeilen;
}

function Zeile({ zeile, typ, heute, zusatz }: { zeile: PlanZeile; typ: AktivitaetTyp; heute: Date; zusatz?: string | null }) {
  const { pflanze, heuteErledigt } = zeile;
  const status = heuteErledigt ? 'heute schon erledigt' : beschreibeFaelligkeit(zeile.faelligAm, heute);
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border border-kante bg-papier-hell py-1.5 pl-2 pr-1.5 shadow-karte ${
        heuteErledigt ? 'opacity-60' : ''
      }`}
    >
      <div className="h-12 w-8 shrink-0">
        <TopfMitGesicht
          id={pflanze.id}
          wuchsstufe={wuchsstufeFuerPflanze(pflanze)}
          stimmung={pflegestimmungFuerPflanze(pflanze)}
          name={pflanze.name}
          art={pflanze.art}
          darstellung={pflanze.darstellung}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{pflanze.name}</p>
        <p className="truncate text-xs text-tinte-gedaempft">
          {status}
          {zusatz ? ` · ${zusatz}` : ''}
        </p>
      </div>
      <form action={aktivitaetAction}>
        <input type="hidden" name="pflanzeId" value={pflanze.id} />
        <input type="hidden" name="typ" value={typ} />
        <Kaestchen label={`${pflanze.name}: ${typ === 'giessen' ? 'Gießen' : 'Düngen'} erledigt`} erledigt={heuteErledigt} />
      </form>
    </li>
  );
}

function Gruppe({
  titel,
  zeilen,
  typ,
  heute,
  zusatz,
}: {
  titel: string;
  zeilen: PlanZeile[];
  typ: AktivitaetTyp;
  heute: Date;
  zusatz?: (p: Pflanze) => string | null;
}) {
  return (
    <div>
      <p className="mb-1.5 ml-1 text-[10px] font-bold uppercase tracking-[0.12em] text-tinte-gedaempft">{titel}</p>
      {zeilen.length === 0 ? (
        <p className="ml-1 text-sm italic text-tinte-gedaempft">Nichts offen.</p>
      ) : (
        <ul className="space-y-1.5">
          {zeilen.map((z) => (
            <Zeile key={z.pflanze.id} zeile={z} typ={typ} heute={heute} zusatz={zusatz?.(z.pflanze)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function Runde({
  titel,
  symbol,
  zeilen,
  typ,
  heute,
  zusatz,
}: {
  titel: string;
  symbol: React.ReactNode;
  zeilen: PlanZeile[];
  typ: AktivitaetTyp;
  heute: Date;
  zusatz?: (p: Pflanze) => string | null;
}) {
  const offenHeute = zeilen.filter((z) => z.gruppe === 'heute' && !z.heuteErledigt);
  const erledigtHeute = zeilen.filter((z) => z.heuteErledigt);
  const morgen = zeilen.filter((z) => z.gruppe === 'morgen' && !z.heuteErledigt);
  return (
    <section>
      <div className="mb-2 flex items-baseline gap-2">
        <Abschnittstitel className="mb-0!">
          {symbol} {titel}
        </Abschnittstitel>
        <span className="text-xs font-semibold text-tinte-gedaempft">{offenHeute.length} offen</span>
      </div>
      <div className="space-y-4">
        {/* Erledigte bleiben blass sichtbar unter den offenen — der Fortschritt bleibt sichtbar. */}
        <Gruppe titel="Heute" zeilen={[...offenHeute, ...erledigtHeute]} typ={typ} heute={heute} zusatz={zusatz} />
        <Gruppe titel="Morgen" zeilen={morgen} typ={typ} heute={heute} zusatz={zusatz} />
      </div>
    </section>
  );
}

export default async function AufgabenSeite() {
  const sitzung = await aktuelleSitzung();
  if (!sitzung) redirect('/start');
  const { nutzerId, gartenId } = sitzung;

  const pflanzen = pflanzenFuerGarten(gartenId, nutzerId).filter((p) => p.lebenszustand === 'lebend');
  const essbarePflanzen = pflanzen.filter((p) => istEssbar(p.art));

  const heute = new Date();
  const giessplan = planZeilen(pflanzen, 'giessen', heute);
  const duengeplan = planZeilen(pflanzen, 'duengen', heute);

  const alle = [...giessplan, ...duengeplan];
  const erledigt = alle.filter((z) => z.heuteErledigt).length;
  const offen = alle.filter((z) => z.gruppe === 'heute' && !z.heuteErledigt).length;
  const ermutigung = ermutigungsSatz(erledigt, offen);

  const heuteISO = heute.toISOString().slice(0, 10);
  const datumText = heute.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const ernten = ernteListeFuerNutzer(nutzerId);

  return (
    <div className="space-y-8 pb-6">
      <header className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-tinte-gedaempft">{datumText}</p>
        <Seitentitel>
          Heute <em>dran</em>
        </Seitentitel>
        {ermutigung && (
          <div className="flex items-center gap-2 rounded-2xl bg-linear-to-r from-moos-zart to-papier px-3.5 py-2.5 text-sm font-semibold text-moos-dunkel">
            <IconErledigt className="h-4 w-4" /> {ermutigung}
          </div>
        )}
      </header>

      {pflanzen.length === 0 ? (
        <Leerzustand
          text="Noch keine Pflanze da."
          aktion={
            <KnopfLink href="/hinzufuegen" variante="primaer">
              Erste Pflanze anlegen
            </KnopfLink>
          }
        />
      ) : (
        <>
          <Runde
            titel="Gießen"
            symbol={<IconTropfen className="h-4 w-4 text-wasser-kraeftig" />}
            zeilen={giessplan}
            typ="giessen"
            heute={heute}
          />
          <Runde
            titel="Düngen"
            symbol={<IconBlatt className="h-4 w-4 text-moos-hell" />}
            zeilen={duengeplan}
            typ="duengen"
            heute={heute}
            zusatz={(p) => p.duengerTyp}
          />
        </>
      )}

      <section>
        <Abschnittstitel>
          <IconKorb className="h-4 w-4" /> Erntetagebuch
        </Abschnittstitel>

        {essbarePflanzen.length === 0 ? (
          <p className="text-sm text-tinte-gedaempft">Noch keine essbare Pflanze da.</p>
        ) : (
          <Karte className="mb-4 p-4">
            <form action={ernteEintragenAction} className="space-y-3">
              <input type="hidden" name="zurueck" value="/aufgaben" />
              <Feld label="Pflanze">
                <Auswahl name="pflanzeId" required>
                  {essbarePflanzen.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Auswahl>
              </Feld>
              <div className="grid grid-cols-2 gap-3">
                <Feld label="Datum">
                  <Eingabe type="date" name="datum" defaultValue={heuteISO} />
                </Feld>
                <Feld label="Menge">
                  <Eingabe name="menge" placeholder="z. B. 500 g, 6 Stück" />
                </Feld>
              </div>
              <Feld label="Notiz">
                <Eingabe name="notiz" placeholder="Wie war's?" />
              </Feld>
              <Knopf type="submit" variante="primaer" className="w-full">
                Eintragen
              </Knopf>
            </form>
          </Karte>
        )}

        {ernten.length === 0 ? (
          <p className="text-sm text-tinte-gedaempft">Noch nichts geerntet.</p>
        ) : (
          <ul className="space-y-1.5">
            {ernten.map((e) => {
              const datum = new Date(e.datum).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: '2-digit' });
              return (
                <li
                  key={e.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-kante bg-papier-hell px-3 py-2.5 shadow-karte"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="text-lg leading-6">{ernteSymbol(e.pflanzeName, e.pflanzeArt)}</span>
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{e.pflanzeName}</span>
                        {e.menge && <span className="ml-1.5 font-semibold text-moos">{e.menge}</span>}
                        <span className="ml-1.5 text-xs text-tinte-gedaempft">{datum}</span>
                      </p>
                      {e.notiz && <p className="mt-0.5 text-sm italic text-tinte-gedaempft">{e.notiz}</p>}
                    </div>
                  </div>
                  <form action={ernteLoeschenAction}>
                    <input type="hidden" name="aktivitaetId" value={e.id} />
                    <Knopf type="submit" variante="text" aria-label="Eintrag löschen" className="h-9 w-9 shrink-0 px-0!">
                      <IconX className="h-4 w-4" />
                    </Knopf>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
