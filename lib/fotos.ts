import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const FOTO_ORDNER = path.join(process.cwd(), 'public', 'fotos');

/**
 * Erkennt den Bildtyp an den tatsächlichen Bytes (Magic Numbers), nicht am
 * Client-Dateinamen oder MIME-Header — beide sind vom Aufrufer fälschbar und
 * hätten sonst beliebige Dateiendungen (z. B. .svg/.html mit Script) erlaubt.
 */
function erkenneBildEndung(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return '.jpg';
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return '.png';
  }
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    return '.webp';
  }
  return null;
}

export async function fotoSpeichern(datei: File): Promise<string> {
  const puffer = Buffer.from(await datei.arrayBuffer());
  const endung = erkenneBildEndung(puffer);
  if (!endung) {
    throw new Error('Nur JPEG-, PNG- oder WebP-Bilder werden akzeptiert.');
  }

  fs.mkdirSync(FOTO_ORDNER, { recursive: true });
  const dateiname = `${randomUUID()}${endung}`;
  fs.writeFileSync(path.join(FOTO_ORDNER, dateiname), puffer);
  return `/fotos/${dateiname}`;
}
