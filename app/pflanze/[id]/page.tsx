import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/session';
import {
  pflanzeMitId,
  pflegestimmungFuerPflanze,
  wuchsstufeFuerPflanze,
  aktivitaetenFuerPflanze,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
  zuletztGepflegtAm,
} from '@/lib/db/abfragen';
import { faelligkeitsgruppe, beschreibeLetztePflege } from '@/lib/garten/faelligkeit';
import { TopfMitGesicht, STIMMUNG_BESCHREIBUNG } from '@/components/TopfMitGesicht';
import { VerstorbenMarkieren } from '@/components/VerstorbenMarkieren';
import { aktivitaetAction } from '@/app/server-aktionen';
import { IconTropfen, IconBlatt, IconKorb } from '@/components/Symbole';
import { ZurueckChip, Abschnittstitel } from '@/components/bausatz/Titel';
import { Karte } from '@/components/bausatz/Karte';
import { Regalbrett } from '@/components/bausatz/Regal';
import { PflegeKnopf } from '@/components/bausatz/Knopf';
import { PflegeKnopfLink } from '@/components/bausatz/KnopfLink';

const AKTIVITAET_LABEL: Record<string, string> = {
  giessen: 'Gegossen',
  duengen: 'Gedüngt',
  ernten: 'Geerntet',
};

// Farbpunkte im Verlauf tragen dieselben Farben wie die Pflege-Knöpfe.
const PUNKT_FARBE: Record<string, string> = {
  giessen: 'bg-wasser-kraeftig',
  duengen: 'bg-mint-kraeftig',
  ernten: 'bg-sonne-kraeftig',
};

export default async function PflanzenDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzerId = await aktuellerNutzer();
  if (!nutzerId) redirect('/start');

  const pflanze = pflanzeMitId(id, nutzerId);
  const stimmung = pflegestimmungFuerPflanze(pflanze);
  const wuchsstufe = wuchsstufeFuerPflanze(pflanze);
  const verlauf = aktivitaetenFuerPflanze(pflanze.id, nutzerId).slice(0, 10);

  const heute = new Date();
  const giessenFaellig = faelligkeitsgruppe(naechsteFaelligkeitGiessen(pflanze), heute) === 'heute';
  const duengenAm = naechsteFaelligkeitDuengen(pflanze);
  const duengenFaellig = duengenAm !== null && faelligkeitsgruppe(duengenAm, heute) === 'heute';
  const zuletztGegossen = beschreibeLetztePflege(zuletztGepflegtAm(pflanze, 'giessen'), heute);

  const untertitel = [pflanze.art, pflanze.drinnenDraussen === 'drinnen' ? 'drinnen' : 'draußen'].filter(Boolean).join(' · ');
  const lebt = pflanze.lebenszustand === 'lebend';

  return (
    <div className="space-y-6 pb-6">
      <ZurueckChip href="/">Mein Garten</ZurueckChip>

      <div className="relative">
        <div className="mx-auto w-36 aspect-[8/13] drop-shadow-[0_8px_6px_rgba(90,60,30,0.2)]">
          <TopfMitGesicht
            id={pflanze.id}
            wuchsstufe={wuchsstufe}
            stimmung={stimmung}
            name={pflanze.name}
            art={pflanze.art}
            darstellung={pflanze.darstellung}
          />
        </div>
        <Regalbrett className="mx-6 -mt-1" />
        {lebt && (
          <Karte className="absolute right-0 top-3 px-3 py-2 text-xs leading-snug text-tinte-gedaempft">
            <span className="block font-anzeige text-sm italic text-moos">{STIMMUNG_BESCHREIBUNG[stimmung]}</span>
            zuletzt gegossen
            <br />
            {zuletztGegossen}
          </Karte>
        )}
      </div>

      <div className="text-center">
        <h1 className="font-anzeige text-3xl font-medium leading-none tracking-tight text-moos-dunkel">{pflanze.name}</h1>
        {untertitel && <p className="mt-1.5 text-sm text-tinte-gedaempft">{untertitel}</p>}
      </div>

      {lebt ? (
        <div className="grid grid-cols-3 gap-2 pt-1">
          <form action={aktivitaetAction}>
            <input type="hidden" name="pflanzeId" value={pflanze.id} />
            <input type="hidden" name="typ" value="giessen" />
            <PflegeKnopf variante="wasser" faellig={giessenFaellig} symbol={<IconTropfen className="h-6 w-6" />}>
              Gießen
            </PflegeKnopf>
          </form>
          <form action={aktivitaetAction}>
            <input type="hidden" name="pflanzeId" value={pflanze.id} />
            <input type="hidden" name="typ" value="duengen" />
            <PflegeKnopf variante="mint" faellig={duengenFaellig} symbol={<IconBlatt className="h-6 w-6" />}>
              Düngen
            </PflegeKnopf>
          </form>
          <PflegeKnopfLink href={`/pflanze/${pflanze.id}/ernte`} variante="sonne" symbol={<IconKorb className="h-6 w-6" />}>
            Ernten
          </PflegeKnopfLink>
        </div>
      ) : (
        <Karte className="p-3 text-center text-sm text-tinte-gedaempft">
          Diese Pflanze ist von uns gegangen und ruht in liebevoller Erinnerung.
        </Karte>
      )}

      <section>
        <Abschnittstitel>Steckbrief</Abschnittstitel>
        <Karte className="p-4 text-sm">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Erde</dt>
              <dd>{pflanze.erde ?? '–'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Licht</dt>
              <dd>{pflanze.licht ?? '–'}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Gießen</dt>
              <dd>alle {pflanze.giessIntervallTage} Tage</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-tinte-gedaempft">Dünger</dt>
              <dd>
                {pflanze.duengerIntervallTage === null
                  ? 'kein Düngeplan'
                  : `alle ${pflanze.duengerIntervallTage} Tage${pflanze.duengerTyp ? ` · ${pflanze.duengerTyp}` : ''}`}
              </dd>
            </div>
          </dl>
          {pflanze.notiz && <p className="mt-3 whitespace-pre-wrap border-t border-kante pt-3 text-tinte-gedaempft">{pflanze.notiz}</p>}
        </Karte>
      </section>

      {verlauf.length > 0 && (
        <section>
          <Abschnittstitel>Verlauf</Abschnittstitel>
          <ol className="ml-2 border-l-2 border-kante pl-4 text-sm">
            {verlauf.map((a) => (
              <li key={a.id} className="relative flex justify-between gap-3 py-1.5">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[1.45rem] top-2.5 h-3 w-3 rounded-full ring-4 ring-papier ${PUNKT_FARBE[a.typ] ?? 'bg-kante'}`}
                />
                <span>
                  {AKTIVITAET_LABEL[a.typ] ?? a.typ}
                  {a.menge ? ` · ${a.menge}` : ''}
                </span>
                <span className="shrink-0 text-tinte-gedaempft">
                  {new Date(a.datum).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {lebt && <VerstorbenMarkieren pflanzeId={pflanze.id} />}
    </div>
  );
}
