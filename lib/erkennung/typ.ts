/** Gemeinsamer Typ für Foto-Vorschläge (Client-UI und Server-Dienst). */
export interface FotoVorschlag {
  /** Hauptpflanze: deutscher Name + botanischer Name, z. B. „Rote Rose (Rosa spec.)“ */
  art: string;
  /** Kurzer deutscher Name als vorausgefüllter Pflanzen-Name */
  nameVorschlag: string;
  /** Ein Satz zu Begleitpflanzen/Bestandteilen (Füllblumen, Gräser …) */
  hinweis: string | null;
  sicherheit: 'hoch' | 'mittel' | 'gering';
  erde: string | null;
  licht: string | null;
  giessIntervallTage?: number;
  duengerIntervallTage?: number | null;
  duengerTyp?: string | null;
  drinnenDraussen: 'drinnen' | 'draussen';
}
