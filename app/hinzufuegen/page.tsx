import { KameraHinzufuegen } from '@/components/KameraHinzufuegen';
import { Seitentitel } from '@/components/bausatz/Titel';

export default function HinzufuegenSeite() {
  return (
    <div className="space-y-4 pb-6">
      <Seitentitel>
        Neue <em>Pflanze</em>
      </Seitentitel>
      <KameraHinzufuegen />
    </div>
  );
}
