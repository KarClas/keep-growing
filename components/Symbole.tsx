/**
 * Zentrale Linien-Symbole (SVG, currentColor) — Stil wie die untere Navigation.
 * Ersetzt die früheren Emoji-Beschriftungen: skalieren scharf, färben sich
 * per CSS und sehen auf iOS, macOS und Android gleich aus.
 */

type IconProps = { className?: string };

function Basis({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-5 w-5'}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconTropfen({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M12 3.5c3.2 4 5.5 6.8 5.5 9.5a5.5 5.5 0 1 1-11 0c0-2.7 2.3-5.5 5.5-9.5Z" />
    </Basis>
  );
}

export function IconBlatt({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M5 19c0-8 5-13 14-14-.5 9-5 14-13 14" />
      <path d="M5 19c3-5 7-8.5 11-10.5" />
    </Basis>
  );
}

export function IconKorb({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M4 10h16l-1.6 8.2a2 2 0 0 1-2 1.8H7.6a2 2 0 0 1-2-1.8L4 10Z" />
      <path d="m8.5 10 3-6.5" />
      <path d="m15.5 10-3-6.5" />
      <path d="M9.5 13.5v3M14.5 13.5v3" />
    </Basis>
  );
}

export function IconKeimling({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M12 20v-8" />
      <path d="M12 12c0-3.5 2.5-6 6-6 0 3.5-2.5 6-6 6" />
      <path d="M12 14c0-3-2-5-5-5 0 3 2 5 5 5" />
      <path d="M7 20h10" />
    </Basis>
  );
}

export function IconFrucht({ className }: IconProps) {
  return (
    <Basis className={className}>
      <circle cx="12" cy="14" r="6.5" />
      <path d="M12 7.5V5" />
      <path d="M12 5c1.8-.4 3.2-1.6 3.6-3-1.9.1-3.3.9-3.6 3Z" />
    </Basis>
  );
}

export function IconBlume({ className }: IconProps) {
  return (
    <Basis className={className}>
      <circle cx="12" cy="9" r="2.2" />
      <path d="M12 6.8c-.7-2 .2-3.8 2.2-4.3-.3 2-1 3.2-2.2 4.3M14.2 9c2-.7 3.8.2 4.3 2.2-2-.3-3.2-1-4.3-2.2M12 11.2c.7 2-.2 3.8-2.2 4.3.3-2 1-3.2 2.2-4.3M9.8 9c-2 .7-3.8-.2-4.3-2.2 2 .3 3.2 1 4.3 2.2" />
      <path d="M12 13.5V21" />
    </Basis>
  );
}

export function IconKamera({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M4 8h2.7l1.6-2.4h7.4L17.3 8H20a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.6" />
    </Basis>
  );
}

export function IconBlitz({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12L13 3Z" />
    </Basis>
  );
}

export function IconWarnung({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M12 4 2.8 19.5h18.4L12 4Z" />
      <path d="M12 10v4" />
      <path d="M12 16.8v.2" />
    </Basis>
  );
}

export function IconLupe({ className }: IconProps) {
  return (
    <Basis className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </Basis>
  );
}

export function IconZurueck({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </Basis>
  );
}

export function IconErledigt({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Basis>
  );
}

export function IconNeu({ className }: IconProps) {
  return (
    <Basis className={className}>
      <path d="M4 5v5h5" />
      <path d="M4.6 14a8 8 0 1 0 .7-5.7" />
    </Basis>
  );
}

/** Symbol zur Ernte-Art (Schlüssel aus lib/garten/symbole.ts). */
export function ErnteSymbol({ kategorie, className }: { kategorie: string; className?: string }) {
  switch (kategorie) {
    case 'frucht':
      return <IconFrucht className={className} />;
    case 'kraut':
      return <IconBlatt className={className} />;
    case 'blume':
      return <IconBlume className={className} />;
    default:
      return <IconKeimling className={className} />;
  }
}
