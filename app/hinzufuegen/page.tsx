import { ProfilSchritt2Formular } from '@/components/ProfilSchritt2Formular';
import {
  ENJOY_05_PLANT_DATA,
  holeDetailsFuerPflanze,
  parseLichtAusgabe,
  type PflanzenErkennungsErgebnis,
} from '@/lib/pflanzen-api';

interface Props {
  searchParams?: Promise<{
    name?: string;
    art?: string;
    giessrhythmus?: string;
    giessenrhythmus?: string;
    duengenrhythmus?: string;
    erde?: string;
    licht?: string;
    notiz?: string;
  }>;
}

function feldWertBereinigen(wert?: string | null): string {
  if (!wert) return '';
  const getrimmt = wert.trim();
  const lower = getrimmt.toLowerCase();
  if (
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'none' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === '-' ||
    lower === '--'
  ) {
    return '';
  }
  return getrimmt;
}

export default async function ProfilSchritt2Seite({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  let daten: PflanzenErkennungsErgebnis = ENJOY_05_PLANT_DATA;
  if (params.art && params.art !== daten.raw_name && params.art !== daten.identified_name) {
    try {
      daten = await holeDetailsFuerPflanze(params.art);
    } catch {
      // Fallback
    }
  }

  const artVorgabe = feldWertBereinigen(params.art ?? daten.identified_name ?? daten.raw_name);
  const giessVorgabe = feldWertBereinigen(params.giessrhythmus ?? params.giessenrhythmus ?? daten.Giessrhythmus);
  const duengenVorgabe = feldWertBereinigen(params.duengenrhythmus ?? daten.Duengenrhytmus);
  const erdeVorgabe = feldWertBereinigen(params.erde ?? daten.Erde);
  const initialLicht = parseLichtAusgabe(params.licht ?? daten.Licht);
  const notizVorgabe = feldWertBereinigen(params.notiz ?? '');

  const hinweisName = `(Dein Wahl oder Mein ${artVorgabe || '<Art des Pflanzes>'})`;

  return (
    <ProfilSchritt2Formular
      artVorgabe={artVorgabe}
      giessVorgabe={giessVorgabe}
      duengenVorgabe={duengenVorgabe}
      erdeVorgabe={erdeVorgabe}
      initialLicht={initialLicht}
      notizVorgabe={notizVorgabe}
      hinweisName={hinweisName}
    />
  );
}
