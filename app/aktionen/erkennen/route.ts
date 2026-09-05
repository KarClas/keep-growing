import { NextResponse, type NextRequest } from 'next/server';
import { fotoErkennen } from '@/lib/erkennung/vision';
import { fotoSpeichern } from '@/lib/fotos';
import { aktiveNutzerId } from '@/lib/session';

/**
 * Foto-Analyse & Erkennungs-Endpunkt.
 * Erwartet multipart/form-data mit Feld "foto" und liefert das validierte
 * FotoVorschlag-Ergebnis als JSON sowie die gespeicherte fotoUrl.
 */
export async function POST(request: NextRequest) {
  if (!(await aktiveNutzerId())) {
    return NextResponse.json(
      { fehler: 'Kein angemeldeter Nutzer. Bitte zuerst unter /start auswählen.' },
      { status: 401 }
    );
  }

  const formular = await request.formData().catch(() => null);
  const foto = formular?.get('foto');
  if (!(foto instanceof File) || foto.size === 0) {
    return NextResponse.json({ fehler: 'Kein Foto übermittelt.' }, { status: 400 });
  }

  try {
    let fotoUrl: string | null = null;
    try {
      fotoUrl = await fotoSpeichern(foto);
    } catch {
      // Wenn Bildspeicherung fehlschlägt, läuft die Erkennung weiter
    }

    const puffer = Buffer.from(await foto.arrayBuffer());
    const mime = foto.type || 'image/jpeg';
    const vorschlag = await fotoErkennen(puffer, mime);
    return NextResponse.json({ vorschlag, fotoUrl });
  } catch (fehler) {
    const grund = fehler instanceof Error ? fehler.message : String(fehler);
    return NextResponse.json({ fehler: `Foto-Erkennung fehlgeschlagen: ${grund}` }, { status: 502 });
  }
}
