/**
 * Zweiteiliger Schalter (z. B. Drinnen/Draußen) als Radiogruppe — reines CSS,
 * funktioniert in Formularen ohne JavaScript und ist per Tastatur bedienbar.
 */
export function Umschalter({
  name,
  legende,
  optionen,
  vorgabe,
}: {
  name: string;
  legende: string;
  optionen: { wert: string; label: string }[];
  vorgabe: string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 block text-sm font-semibold text-tinte">{legende}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-full border border-kante bg-papier-hell p-1 shadow-karte">
        {optionen.map((o) => (
          <label key={o.wert} className="relative">
            <input type="radio" name={name} value={o.wert} defaultChecked={o.wert === vorgabe} className="peer sr-only" />
            <span className="flex min-h-10 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold text-tinte-gedaempft transition peer-checked:bg-moos peer-checked:text-papier-hell peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-moos">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
