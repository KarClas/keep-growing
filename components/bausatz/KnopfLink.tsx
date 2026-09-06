import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { knopfKlassen, pflegeKnopfKlassen, PFLEGE_SYMBOL_KLASSEN, type KnopfVariante } from './knopfStil';

type LinkProps = ComponentProps<typeof Link>;

/** Ein Link, der wie ein Knopf aussieht (Navigation, kein Speichern). */
export function KnopfLink({ variante = 'sekundaer', className = '', ...rest }: LinkProps & { variante?: KnopfVariante }) {
  return <Link className={knopfKlassen(variante, className)} {...rest} />;
}

/** Ernten führt zum Formular — deshalb ein Link im Gewand des Pflege-Knopfs. */
export function PflegeKnopfLink({
  symbol,
  className = '',
  children,
  ...rest
}: LinkProps & { symbol: ReactNode; children: ReactNode }) {
  return (
    <Link className={pflegeKnopfKlassen(false, className)} {...rest}>
      <span className={PFLEGE_SYMBOL_KLASSEN}>{symbol}</span>
      {children}
    </Link>
  );
}
