import Link from 'next/link';
import { redirect } from 'next/navigation';
import { aktuelleSitzung } from '@/lib/session';
import {
  pflanzenFuerGarten,
  pflegestimmungFuerPflanze,
  wuchsstufeFuerPflanze,
  ernteListeFuerNutzer,
  naechsteFaelligkeitGiessen,
  naechsteFaelligkeitDuengen,
} from '@/lib/db/abfragen';
import { faelligkeitsgruppe, hinweisText } from '@/lib/garten/faelligkeit';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { EngelWolke } from '@/components/EngelWolke';
import { ernteSymbol } from '@/lib/garten/symbole';
import { IconTropfen, IconErledigt } from '@/components/Symbole';
import { Seitentitel, Abschnittstitel } from '@/components/bausatz/Titel';
import { Regal } from '@/components/bausatz/Regal';
import { Leerzustand } from '@/components/bausatz/Karte';
import { KnopfLink } from '@/components/bausatz/KnopfLink';

export default async function Home() {
  const sitzung = await aktuelleSitzung();
  if (!sitzung) redirect('/start');
  const { nutzerId, gartenId } = sitzung;

  const pflanzen = pflanzenFuerGarten(gartenId, nutzerId);
  const lebend = pflanzen.filter((p) => p.lebenszustand === 'lebend');
  const verstorben = pflanzen.filter((p) => p.lebenszustand === 'verstorben');
  const ernten = ernteListeFuerNutzer(nutzerId);
  // Älteste zuerst, damit die Vitrine mit jeder neuen Ernte nach rechts wächst.
  const ernteChronologisch = [...ernten].reverse();

  // Bedarf für die Hinweis-Pille: Töpfe zählen, nicht Aufgaben.
  const heute = new Date();
  let wasser = 0;
  let duenger = 0;
  let pflegebeduerftig = 0;
  for (const p of lebend) {
    const brauchtWasser = faelligkeitsgruppe(naechsteFaelligkeitGiessen(p), heute) === 'heute';
    const duengenAm = naechsteFaelligkeitDuengen(p);
    const brauchtDuenger = duengenAm !== null && faelligkeitsgruppe(duengenAm, heute) === 'heute';
    if (brauchtWasser) wasser++;
    if (brauchtDuenger) duenger++;
    if (brauchtWasser || brauchtDuenger) pflegebeduerftig++;
  }
  const allesVersorgt = pflegebeduerftig === 0;

  return (
    <div className="space-y-8 pb-6">
      <header className="space-y-3">
        <Seitentitel>
          Mein <em>Garten</em>
        </Seitentitel>
        {lebend.length > 0 && (
          <Link
            href="/aufgaben"
            className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold shadow-karte transition hover:bg-white ${
              allesVersorgt ? 'border-moos/20 bg-moos-zart text-moos-dunkel' : 'border-kante bg-papier-hell text-tinte'
            }`}
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${allesVersorgt ? 'bg-mint' : 'bg-wasser'}`}>
              {allesVersorgt ? <IconErledigt className="h-3.5 w-3.5" /> : <IconTropfen className="h-3.5 w-3.5" />}
            </span>
            {hinweisText({ wasser, duenger, pflanzen: pflegebeduerftig })}
          </Link>
        )}
      </header>

      <section>
        <Abschnittstitel>Meine Töpfe</Abschnittstitel>
        {lebend.length === 0 ? (
          <Leerzustand
            text="Hier ist noch Platz für die erste Pflanze."
            aktion={
              <KnopfLink href="/hinzufuegen" variante="primaer">
                Erste Pflanze anlegen
              </KnopfLink>
            }
          />
        ) : (
          <Regal
            eintraege={lebend.map((p) => ({
              schluessel: p.id,
              topf: (
                <Link href={`/pflanze/${p.id}`} className="block active:opacity-70">
                  <div className="aspect-[8/13]">
                    <TopfMitGesicht
                      id={p.id}
                      wuchsstufe={wuchsstufeFuerPflanze(p)}
                      stimmung={pflegestimmungFuerPflanze(p)}
                      name={p.name}
                      art={p.art}
                      darstellung={p.darstellung}
                    />
                  </div>
                </Link>
              ),
              // Der Topf-Link trägt bereits Name und Stimmung (aria-label im SVG);
              // die Beschriftung ist nur der sichtbare Zweitweg, kein zweiter Tab-Stopp.
              beschriftung: (
                <Link
                  href={`/pflanze/${p.id}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="block truncate text-center text-sm font-semibold text-tinte"
                >
                  {p.name}
                </Link>
              ),
            }))}
          />
        )}
      </section>

      <section>
        <Abschnittstitel>Ernte-Vitrine</Abschnittstitel>
        {ernteChronologisch.length === 0 ? (
          <p className="text-sm text-tinte-gedaempft">Noch nichts geerntet.</p>
        ) : (
          <div className="rounded-2xl border border-white/90 border-b-[3px] border-b-kante-dunkel bg-linear-to-b from-white/60 to-white/20 px-4 pb-3 pt-2.5">
            <div className="flex flex-wrap gap-3 text-2xl">
              {ernteChronologisch.map((e, i) => {
                const datum = new Date(e.datum).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' });
                const titel = `${e.pflanzeName} · ${datum}${e.menge ? ' · ' + e.menge : ''}${e.notiz ? ' — ' + e.notiz : ''}`;
                return (
                  <span key={i} title={titel}>
                    {ernteSymbol(e.pflanzeName, e.pflanzeArt)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {verstorben.length > 0 && (
        <section>
          <Abschnittstitel>In liebevoller Erinnerung</Abschnittstitel>
          <div className="grid grid-cols-3 gap-3">
            {verstorben.map((p) => (
              <div key={p.id}>
                <div className="aspect-square">
                  <EngelWolke id={p.id} wuchsstufe={wuchsstufeFuerPflanze(p)} name={p.name} art={p.art} darstellung={p.darstellung} />
                </div>
                <p className="mt-1 truncate text-center text-sm font-medium text-tinte-gedaempft">{p.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
