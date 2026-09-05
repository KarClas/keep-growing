import { NextResponse, type NextRequest } from 'next/server';
import { fotoErkennen } from '@/lib/erkennung/vision';
import { aktiveNutzerId } from '@/lib/session';

/**
 * Foto-Analyse (Lesender Dienst, keine Mutation — deshalb Route Handler und
 * keine Server-Action, das Foto landet hier NICHT in der Datenbank).
 * Erwartet multipart/form-data mit Feld "foto" und liefert das validierte
 * ErkennungsErgebnis als JSON — oder {"vorschlag": null} wenn nichts erkannt wurde.
 */
export async function POST(request: NextRequest) {
  if (!(await aktiveNutzerId())) {
    return NextResponse.json({ fehler: 'Kein angemeldeter Nutzer. Bitte zuerst unter /start auswählen.' }, { status: 401 });
  }

  const formular = await request.formData().catch(() => null);
  const foto = formular?.get('foto');
  if (!(foto instanceof File) || foto.size === 0) {
    return NextResponse.json({ fehler: 'Kein Foto übermittelt.' }, { status: 400 });
  }

  try {
    const puffer = Buffer.from(await foto.arrayBuffer());
    const mime = foto.type || 'image/jpeg';
    const vorschlag = await fotoErkennen(puffer, mime);
    return NextResponse.json({ vorschlag });
  } catch (fehler) {
    //REGELN: Fehler sichtbar machen, nicht schlucken.
    const grund = fehler instanceof Error ? fehler.message : String(fehler);
    return NextResponse.json({ fehler: `Foto-Erkennung fehlgeschlagen: ${grund}` }, { status: 502 });
  }
}
