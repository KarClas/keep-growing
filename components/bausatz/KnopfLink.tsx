import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { knopfKlassen, pflegeKnopfKlassen, type KnopfVariante, type PflegeVariante } from './knopfStil';

type LinkProps = ComponentProps<typeof Link>;

/** Ein Link, der wie ein Knopf aussieht (Navigation, kein Speichern). */
export function KnopfLink({ variante = 'sekundaer', className = '', ...rest }: LinkProps & { variante?: KnopfVariante }) {
  return <Link className={knopfKlassen(variante, className)} {...rest} />;
}

/** Ernten führt zum Formular — deshalb ein Link im Gewand des Pflege-Knopfs. */
export function PflegeKnopfLink({
  variante,
  symbol,
  className = '',
  children,
  ...rest
}: LinkProps & { variante: PflegeVariante; symbol: ReactNode; children: ReactNode }) {
  return (
    <Link className={pflegeKnopfKlassen(variante, false, className)} {...rest}>
      <span className="flex h-7 w-7 items-center justify-center">{symbol}</span>
      {children}
    </Link>
  );
}
