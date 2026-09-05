import { ProfilSchritt2Form } from '@/components/ProfilSchritt2Form';
import {
  feldWertBereinigen,
  parseLichtAusgabe,
  parseOrtAusgabe,
  parseTageZahl,
} from '@/lib/erkennung/vision';

interface Props {
  searchParams?: Promise<{
    name?: string;
    art?: string;
    giessrhythmus?: string;
    giessenrhythmus?: string;
    duengenrhythmus?: string;
    erde?: string;
    licht?: string;
    ort?: string;
    notiz?: string;
    fotoUrl?: string;
  }>;
}

export default async function ProfilSchritt2Seite({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};

  const artVorgabe = feldWertBereinigen(params.art ?? '');
  const giessTage = parseTageZahl(params.giessrhythmus ?? params.giessenrhythmus) ?? 7;
  const giessVorgabe = String(giessTage);
  const duengenTage = parseTageZahl(params.duengenrhythmus) ?? 28;
  const duengenVorgabe = String(duengenTage);
  const erdeVorgabe = feldWertBereinigen(params.erde ?? '');
  const lichtVorgabe = parseLichtAusgabe(params.licht);
  const ortVorgabe = params.ort ?? 'Drinnen';
  const fotoUrlVorgabe = feldWertBereinigen(params.fotoUrl ?? '');

  return (
    <ProfilSchritt2Form
      initialArt={artVorgabe}
      initialGiessrhythmus={giessVorgabe}
      initialDuengenrhythmus={duengenVorgabe}
      initialErde={erdeVorgabe}
      initialLicht={lichtVorgabe}
      initialOrt={ortVorgabe}
      fotoUrl={fotoUrlVorgabe}
    />
  );
}
