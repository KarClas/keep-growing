'use client';

import { useState, useEffect } from 'react';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { profilSchritt2AnlegenAction } from '@/app/server-aktionen';
import type { LichtAuswahl } from '@/lib/pflanzen-api';

interface Props {
  artVorgabe: string;
  giessVorgabe: string;
  duengenVorgabe: string;
  erdeVorgabe: string;
  initialLicht: LichtAuswahl;
  notizVorgabe: string;
  hinweisName: string;
}

export function ProfilSchritt2Formular({
  artVorgabe,
  giessVorgabe,
  duengenVorgabe,
  erdeVorgabe,
  initialLicht,
  notizVorgabe,
  hinweisName,
}: Props) {
  const [sonneChecked, setSonneChecked] = useState(initialLicht.sonne);
  const [schattenChecked, setSchattenChecked] = useState(initialLicht.schatten);

  const mode: 'sonne' | 'schatten' | 'beides' =
    sonneChecked && schattenChecked
      ? 'beides'
      : schattenChecked
        ? 'schatten'
        : 'sonne';

  useEffect(() => {
    if (mode === 'schatten') {
      document.body.style.backgroundColor = '#1c1917';
      document.body.style.backgroundImage = 'none';
      document.body.style.color = '#f5f5f4';
    } else if (mode === 'beides') {
      document.body.style.backgroundColor = 'transparent';
      document.body.style.backgroundImage =
        'linear-gradient(90deg, #fdfaf4 0%, #fdfaf4 50%, #1c1917 50%, #1c1917 100%)';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.color = '#2f2a22';
    } else {
      document.body.style.backgroundColor = '#fdfaf4';
      document.body.style.backgroundImage = 'none';
      document.body.style.color = '#2f2a22';
    }

    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.color = '';
    };
  }, [mode]);

  const labelClass =
    mode === 'schatten' ? 'text-stone-300' : 'text-stone-700';

  const inputClass =
    mode === 'schatten'
      ? 'w-full rounded-xl border border-stone-700 bg-stone-900/60 px-3 py-2.5 text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:outline-none transition-colors'
      : mode === 'beides'
        ? 'w-full rounded-xl border border-stone-400/70 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none transition-colors'
        : 'w-full rounded-xl border border-stone-300 bg-transparent px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none transition-colors';

  const splitInputStyle =
    mode === 'beides'
      ? {
          background:
            'linear-gradient(90deg, rgba(253, 250, 244, 0.85) 0%, rgba(253, 250, 244, 0.85) 50%, rgba(41, 37, 36, 0.85) 50%, rgba(41, 37, 36, 0.85) 100%)',
        }
      : undefined;

  return (
    <div className="relative space-y-6 pb-10 transition-colors duration-300">
      {/* Vertikale Trennlinie bei beidem */}
      {mode === 'beides' && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-stone-400/40" />
      )}

      {/* 3.a Titel */}
      <h1
        className="text-center text-2xl font-bold transition-colors duration-300"
        style={
          mode === 'beides'
            ? {
                background:
                  'linear-gradient(90deg, #1c1917 0%, #1c1917 50%, #f5f5f4 50%, #f5f5f4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }
            : {
                color: mode === 'schatten' ? '#f5f5f4' : '#1c1917',
              }
        }
      >
        Einstellung des Profils
      </h1>

      {/* 3.b Vorschau-Bild (Boilerplate Icon) */}
      <div className="flex justify-center">
        <div
          className="flex h-44 w-44 items-center justify-center rounded-2xl border p-4 shadow-sm transition-colors duration-300"
          style={
            mode === 'beides'
              ? {
                  background:
                    'linear-gradient(90deg, rgba(236, 253, 245, 0.75) 50%, rgba(41, 37, 36, 0.85) 50%)',
                  borderColor: '#78716c',
                }
              : mode === 'schatten'
                ? {
                    backgroundColor: 'rgba(41, 37, 36, 0.85)',
                    borderColor: '#44403c',
                  }
                : {
                    backgroundColor: 'rgba(236, 253, 245, 0.7)',
                    borderColor: '#d1fae5',
                  }
          }
        >
          <TopfMitGesicht
            wuchsstufe={2}
            stimmung="zufrieden"
            name={artVorgabe || 'Pflanze'}
          />
        </div>
      </div>

      {/* 3.c Formular */}
      <form action={profilSchritt2AnlegenAction} className="space-y-4">
        {/* c.1: Name */}
        <label className="block">
          <span className={`mb-1 block text-sm font-medium ${labelClass}`}>
            Name{' '}
            <span className="text-xs font-normal text-stone-400">
              {hinweisName}
            </span>
          </span>
          <input
            type="text"
            name="name"
            defaultValue=""
            className={inputClass}
            style={splitInputStyle}
          />
        </label>

        {/* c.2: Art */}
        <label className="block">
          <span className={`mb-1 block text-sm font-medium ${labelClass}`}>Art</span>
          <input
            type="text"
            name="art"
            defaultValue={artVorgabe}
            className={inputClass}
            style={splitInputStyle}
          />
        </label>

        {/* c.3: Giessenrhythmus */}
        <label className="block">
          <span className={`mb-1 block text-sm font-medium ${labelClass}`}>
            Giessenrhythmus
          </span>
          <textarea
            name="giessrhythmus"
            rows={3}
            defaultValue={giessVorgabe}
            className={inputClass}
            style={splitInputStyle}
          />
        </label>

        {/* c.4: Duengenrhythmus */}
        <label className="block">
          <span className={`mb-1 block text-sm font-medium ${labelClass}`}>
            Duengenrhythmus
          </span>
          <textarea
            name="duengenrhythmus"
            rows={2}
            defaultValue={duengenVorgabe}
            className={inputClass}
            style={splitInputStyle}
          />
        </label>

        {/* c.5: Erde */}
        <label className="block">
          <span className={`mb-1 block text-sm font-medium ${labelClass}`}>
            Erde (Erdemischung)
          </span>
          <input
            type="text"
            name="erde"
            defaultValue={erdeVorgabe}
            className={inputClass}
            style={splitInputStyle}
          />
        </label>

        {/* c.6: Licht — Zentrierte Zeile über die gesamte Breite ohne Bubble */}
        <div className="space-y-1.5 py-1">
          <span
            className="block text-center text-sm font-medium transition-colors"
            style={
              mode === 'beides'
                ? {
                    background:
                      'linear-gradient(90deg, #44403c 0%, #44403c 50%, #d6d3d1 50%, #d6d3d1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }
                : {
                    color: mode === 'schatten' ? '#d6d3d1' : '#44403c',
                  }
            }
          >
            Licht
          </span>

          <div className="grid w-full grid-cols-2 items-center">
            {/* Sonne: Linke Spalte, zentriert in linker Hälfte */}
            <div className="flex justify-center">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="licht"
                  value="Sonne"
                  checked={sonneChecked}
                  onChange={(e) => setSonneChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-400 text-emerald-600 focus:ring-emerald-500"
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    mode === 'schatten' ? 'text-stone-300' : 'text-stone-800'
                  }`}
                >
                  Sonne
                </span>
              </label>
            </div>

            {/* Schatten: Rechte Spalte, zentriert in rechter Hälfte */}
            <div className="flex justify-center">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="licht"
                  value="Schatten"
                  checked={schattenChecked}
                  onChange={(e) => setSchattenChecked(e.target.checked)}
                  className="h-4 w-4 rounded border-stone-400 text-emerald-600 focus:ring-emerald-500"
                />
                <span
                  className={`text-sm font-medium transition-colors ${
                    mode === 'sonne' ? 'text-stone-800' : 'text-stone-200'
                  }`}
                >
                  Schatten
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* c.7: Notiz */}
        <label className="block">
          <span className={`mb-1 block text-sm font-medium ${labelClass}`}>Notiz</span>
          <textarea
            name="notiz"
            rows={3}
            defaultValue={notizVorgabe}
            placeholder="Freie Notiz..."
            className={inputClass}
            style={splitInputStyle}
          />
        </label>

        {/* Abschluss-Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-xl px-4 py-3 text-base font-semibold text-white shadow-sm transition active:opacity-90"
            style={
              mode === 'beides'
                ? {
                    background:
                      'linear-gradient(90deg, #047857 0%, #047857 50%, #065f46 50%, #065f46 100%)',
                  }
                : {
                    backgroundColor: mode === 'schatten' ? '#059669' : '#047857',
                  }
            }
          >
            Das Profil Anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
