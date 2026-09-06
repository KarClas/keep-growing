import { redirect } from 'next/navigation';
import { aktuellerNutzer } from '@/lib/session';
import {
  pflanzeMitId,
  pflegestimmungFuerPflanze,
  wuchsstufeFuerPflanze,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
  zuletztGepflegtAm,
} from '@/lib/db/abfragen';
import { faelligkeitsgruppe } from '@/lib/garten/faelligkeit';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { VerstorbenMarkieren } from '@/components/VerstorbenMarkieren';
import { aktivitaetAction } from '@/app/server-aktionen';
import { IconTropfen, IconBlatt, IconKorb } from '@/components/Symbole';
import { ZurueckChip, Abschnittstitel } from '@/components/bausatz/Titel';
import { Karte } from '@/components/bausatz/Karte';
import { Regalbrett } from '@/components/bausatz/Regal';
import { PflegeKnopf } from '@/components/bausatz/Knopf';
import { PflegeKnopfLink } from '@/components/bausatz/KnopfLink';

/** Datum für „zuletzt gegossen am …" — ehrlich „noch nie", wenn es keinen Eintrag gibt. */
function datumOderNie(zeitpunkt: Date | null): string {
  if (!zeitpunkt) return 'noch nie';
  return zeitpunkt.toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function PflanzenDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nutzerId = await aktuellerNutzer();
  if (!nutzerId) redirect('/start');

  const pflanze = pflanzeMitId(id, nutzerId);
  const stimmung = pflegestimmungFuerPflanze(pflanze);
  const wuchsstufe = wuchsstufeFuerPflanze(pflanze);
  const heute = new Date();
  const giessenFaellig = faelligkeitsgruppe(naechsteFaelligkeitGiessen(pflanze), heute) === 'heute';
  const duengenAm = naechsteFaelligkeitDuengen(pflanze);
  const duengenFaellig = duengenAm !== null && faelligkeitsgruppe(duengenAm, heute) === 'heute';
  // Alle drei Werte gehören genau dieser Pflanze (Abfrage nach pflanze.id).
  const zuletztGegossenAm = zuletztGepflegtAm(pflanze, 'giessen');
  const zuletztGeduengtAm = zuletztGepflegtAm(pflanze, 'duengen');
  const zuletztGeerntetAm = zuletztGepflegtAm(pflanze, 'ernten');

  const untertitel = [pflanze.art, pflanze.drinnenDraussen === 'drinnen' ? 'drinnen' : 'draußen'].filter(Boolean).join(' · ');
  const lebt = pflanze.lebenszustand === 'lebend';

  return (
    <div className="space-y-6 pb-6">
      <ZurueckChip href="/">Meine Lieblinge</ZurueckChip>

      {/* Kein Stimmungsschild neben dem Topf (Team-Entscheidung) — das Gesicht sagt es selbst. */}
      <div>
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
            <PflegeKnopf faellig={giessenFaellig} symbol={<IconTropfen className="h-6 w-6" />}>
              Gießen
            </PflegeKnopf>
          </form>
          <form action={aktivitaetAction}>
            <input type="hidden" name="pflanzeId" value={pflanze.id} />
            <input type="hidden" name="typ" value="duengen" />
            <PflegeKnopf faellig={duengenFaellig} symbol={<IconBlatt className="h-6 w-6" />}>
              Düngen
            </PflegeKnopf>
          </form>
          <PflegeKnopfLink href={`/pflanze/${pflanze.id}/ernte`} symbol={<IconKorb className="h-6 w-6" />}>
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

      <section>
        <Abschnittstitel>Zuletzt gepflegt</Abschnittstitel>
        <Karte className="p-4 text-sm">
          <dl className="space-y-2">
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-1.5 text-tinte-gedaempft">
                <IconTropfen className="h-4 w-4 text-wasser-kraeftig" /> zuletzt gegossen am
              </dt>
              <dd className="font-semibold">{datumOderNie(zuletztGegossenAm)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="flex items-center gap-1.5 text-tinte-gedaempft">
                <IconBlatt className="h-4 w-4 text-moos-hell" /> zuletzt gedüngt am
              </dt>
              <dd className="font-semibold">{datumOderNie(zuletztGeduengtAm)}</dd>
            </div>
            {/* Ernte nur zeigen, wenn es schon eine gab — Zierpflanzen bekommen keine „noch nie"-Zeile. */}
            {zuletztGeerntetAm && (
              <div className="flex items-center gap-2">
                <dt className="flex items-center gap-1.5 text-tinte-gedaempft">
                  <IconKorb className="h-4 w-4 text-sonne-kraeftig" /> zuletzt geerntet am
                </dt>
                <dd className="font-semibold">{datumOderNie(zuletztGeerntetAm)}</dd>
              </div>
            )}
          </dl>
        </Karte>
      </section>

      {lebt && <VerstorbenMarkieren pflanzeId={pflanze.id} />}
    </div>
  );
}
