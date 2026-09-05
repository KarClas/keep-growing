import type { LichtOption } from '@/lib/erkennung/typ';

interface Props {
  licht?: LichtOption | string | null;
  className?: string;
}

/**
 * Licht-Symbol nach der Vorlage:
 * 1. Helle Sonne (Umriss / nicht gefüllt): "Sonne"
 * 2. Dunkle Sonne (Kreis komplett dunkel gefüllt): "Schatten"
 * 3. Halb dunkel, halb helle Sonne (rechte Hälfte gefüllt): "Sonne oder Schatten" / "Sonne und Schatten" (Fallback)
 *
 * Farbgestaltung: Nutzt currentColor, keine reinweißen Flächen, harmonisch abgestimmt auf die warme App-Palette.
 */
export function LichtSymbol({ licht, className = 'h-14 w-14' }: Props) {
  const typ: 'sonne' | 'schatten' | 'halb' = (() => {
    if (!licht) return 'halb'; // Fallback
    const val = licht.trim().toLowerCase();
    const hatSonne = val.includes('sonne') || val.includes('sun');
    const hatSchatten = val.includes('schatt') || val.includes('shad');

    if (hatSonne && hatSchatten) return 'halb';
    if (
      val.includes('oder') ||
      val.includes('und') ||
      val.includes('/') ||
      val === 'both' ||
      val === 'any' ||
      val === 'all' ||
      val === 'beides'
    ) {
      return 'halb';
    }
    if (hatSonne) return 'sonne';
    if (hatSchatten) return 'schatten';
    return 'halb'; // Fallback
  })();

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden="true"
    >
      {/* 8 Sonnenstrahlen mit abgerundeten Enden */}
      <g stroke="currentColor" strokeWidth="3.2" strokeLinecap="round">
        {/* Oben */}
        <line x1="32" y1="7" x2="32" y2="13.5" />
        {/* Unten */}
        <line x1="32" y1="50.5" x2="32" y2="57" />
        {/* Links */}
        <line x1="7" y1="32" x2="13.5" y2="32" />
        {/* Rechts */}
        <line x1="50.5" y1="32" x2="57" y2="32" />
        {/* Oben-Rechts */}
        <line x1="45.1" y1="18.9" x2="49.7" y2="14.3" />
        {/* Unten-Rechts */}
        <line x1="45.1" y1="45.1" x2="49.7" y2="49.7" />
        {/* Unten-Links */}
        <line x1="18.9" y1="45.1" x2="14.3" y2="49.7" />
        {/* Oben-Links */}
        <line x1="18.9" y1="18.9" x2="14.3" y2="14.3" />
      </g>

      {/* Schatten: Dunkle Sonne (Kreis vollflächig dunkel gefüllt) */}
      {typ === 'schatten' && (
        <circle cx="32" cy="32" r="14" fill="currentColor" stroke="currentColor" strokeWidth="3.2" />
      )}

      {/* Sonne: Helle Sonne (nur Umrisslinie, Inneres transparent für den warmen App-Hintergrund) */}
      {typ === 'sonne' && (
        <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="3.2" />
      )}

      {/* Sonne und Schatten (Fallback): Halbe Sonne (rechte Hälfte dunkel gefüllt, linke Hälfte Umriss) */}
      {typ === 'halb' && (
        <g>
          <circle cx="32" cy="32" r="14" fill="none" stroke="currentColor" strokeWidth="3.2" />
          <path d="M 32,18 A 14,14 0 0,1 32,46 Z" fill="currentColor" />
        </g>
      )}
    </svg>
  );
}
