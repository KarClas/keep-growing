export type LichtOption = 'Sonne' | 'Schatten' | 'Sonne oder Schatten';
export type OrtOption = 'Drinnen' | 'draußen' | 'Drinnen oder draußen';

/** Gemeinsamer Typ für Foto- und Art-Vorschläge (Client-UI und Server-Dienst). */
export interface FotoVorschlag {
  /** Wissenschaftlicher Artname streng nach botanischer Nomenklatur, z. B. „Rosa chinensis“ */
  art: string;
  /** Gießrhythmus als Zahl in Tagen */
  giessrhythmus?: number;
  /** Düngrhythmus als Zahl in Tagen */
  duengenrhythmus?: number;
  /** Erdemischung mit Prozenten, z. B. "50% Typ-1-Erde, 30% Typ-2-Erde, 20% Typ-3-Erde" */
  erde?: string;
  /** Licht: Sonne, Schatten oder Sonne oder Schatten */
  licht?: LichtOption;
  /** Ort: Drinnen, draußen oder Drinnen oder draußen */
  ort?: OrtOption;
  sicherheit?: 'hoch' | 'mittel' | 'gering';
  fotoUrl?: string | null;
}
