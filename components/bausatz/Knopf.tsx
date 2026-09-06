'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import {
  knopfKlassen,
  pflegeKnopfKlassen,
  FAELLIG_ETIKETT_KLASSEN,
  type KnopfVariante,
  type PflegeVariante,
} from './knopfStil';

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} inline-block animate-spin rounded-full border-2 border-current border-t-transparent`}
    />
  );
}

type KnopfProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: KnopfVariante;
  /** Erzwingt „wartend" von außen (z. B. beim Nachladen ohne Formular). */
  wartend?: boolean;
  children: ReactNode;
};

/**
 * Ein Knopf für alle Seiten. Als Absende-Knopf zeigt er von selbst „wartend"
 * (Spinner, gesperrt), solange die Server-Aktion läuft — ehrlicher Status
 * statt Doppelklick ins Leere (REGELN.md, Abschnitt 1).
 */
export function Knopf({
  variante = 'primaer',
  wartend,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}: KnopfProps) {
  const { pending } = useFormStatus();
  const laeuft = wartend ?? (type === 'submit' && pending);
  return (
    <button
      type={type}
      disabled={disabled || laeuft}
      aria-busy={laeuft || undefined}
      className={knopfKlassen(variante, className)}
      {...rest}
    >
      {laeuft && <Spinner />}
      {children}
    </button>
  );
}

type PflegeKnopfProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  variante: PflegeVariante;
  faellig?: boolean;
  symbol: ReactNode;
  children: ReactNode;
};

/** Gießen/Düngen als Absende-Knopf im Formular; Symbol oben, Wort unten. */
export function PflegeKnopf({ variante, faellig = false, symbol, className = '', children, ...rest }: PflegeKnopfProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className={pflegeKnopfKlassen(variante, faellig, className)}
      {...rest}
    >
      {faellig && <span className={FAELLIG_ETIKETT_KLASSEN}>fällig</span>}
      <span className="flex h-7 w-7 items-center justify-center">{pending ? <Spinner className="h-5 w-5" /> : symbol}</span>
      {children}
    </button>
  );
}
