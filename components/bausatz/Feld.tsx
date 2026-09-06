import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

const EINGABE =
  'w-full rounded-2xl border border-kante bg-papier-hell px-3.5 py-3 text-base text-tinte outline-none transition placeholder:text-tinte-gedaempft/60 focus:border-moos focus:ring-2 focus:ring-moos/30 disabled:bg-papier disabled:text-tinte-gedaempft';

/** Beschriftung oben, Eingabe in der Mitte, Hinweis oder Fehler darunter. */
export function Feld({
  label,
  hinweis,
  fehler,
  children,
}: {
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-tinte">{label}</span>
      {children}
      {fehler ? (
        <span role="alert" className="mt-1.5 block text-sm text-gefahr">
          {fehler}
        </span>
      ) : hinweis ? (
        <span className="mt-1.5 block text-xs text-tinte-gedaempft">{hinweis}</span>
      ) : null}
    </label>
  );
}

export function Eingabe({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${EINGABE} ${className}`} {...rest} />;
}

export function Textbereich({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${EINGABE} ${className}`} {...rest} />;
}

export function Auswahl({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${EINGABE} ${className}`} {...rest} />;
}
