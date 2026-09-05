import { redirect } from 'next/navigation';

// Die Kamera-Fläche lebt jetzt direkt auf /hinzufuegen (Weißwandskizze).
export default function ScannerHinzufuegen() {
  redirect('/hinzufuegen');
}
