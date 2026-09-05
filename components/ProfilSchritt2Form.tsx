'use client';

import { useState, useRef } from 'react';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { LittleHomeBackground, LittleGardenBackground } from '@/components/ProfilHintergruende';
import { LichtSymbol } from '@/components/LichtSymbol';
import { profilSchritt2AnlegenAction, artDetailsAction } from '@/app/server-aktionen';
import { ortZuHintergrundIndex } from '@/lib/erkennung/vision';

interface Props {
  initialArt: string;
  initialGiessrhythmus: string;
  initialDuengenrhythmus: string;
  initialErde: string;
  initialLicht: string;
  initialOrt: string;
  fotoUrl: string;
}

export function ProfilSchritt2Form({
  initialArt,
  initialGiessrhythmus,
  initialDuengenrhythmus,
  initialErde,
  initialLicht,
  initialOrt,
  fotoUrl,
}: Props) {
  const [art, setArt] = useState(initialArt);
  const [initialArtBaseline, setInitialArtBaseline] = useState(initialArt);
  const [name, setName] = useState('');
  const [giessrhythmus, setGiessrhythmus] = useState(initialGiessrhythmus || '7');
  const [duengenrhythmus, setDuengenrhythmus] = useState(initialDuengenrhythmus || '28');
  const [erde, setErde] = useState(initialErde || '');
  const [licht, setLicht] = useState(initialLicht || 'Sonne oder Schatten');
  const [notiz, setNotiz] = useState('');

  // 0 = Ich bleibe lieber drinnen, 1 = Ich bleibe lieber draußen (Fallback: drinnen)
  const [hintergrundIndex, setHintergrundIndex] = useState(() => {
    return ortZuHintergrundIndex(initialOrt || 'Drinnen');
  });

  const touchStartX = useRef<number | null>(null);

  const [laedtDetails, setLaedtDetails] = useState(false);
  const [detailsFehler, setDetailsFehler] = useState<string | null>(null);

  // Der Button bleibt gesperrt (ausgegraut), solange der Art-Wert unverändert ist.
  // Er schaltet sich frei, sobald der Wert verändert bzw. etwas eingetippt wurde.
  const istArtVeraendert = art.trim() !== initialArtBaseline.trim() && art.trim().length > 0;

  function vorherigerHintergrund() {
    setHintergrundIndex((alt) => (alt === 0 ? 1 : 0));
  }

  function naechsterHintergrund() {
    setHintergrundIndex((alt) => (alt === 1 ? 0 : 1));
  }

  function naechstesLicht() {
    setLicht((alt) => {
      const val = (alt || '').trim().toLowerCase();
      if (val.includes('sonne') && !val.includes('schatt') && !val.includes('oder') && !val.includes('und')) {
        return 'Schatten';
      }
      if (val.includes('schatt') && !val.includes('sonne') && !val.includes('oder') && !val.includes('und')) {
        return 'Sonne oder Schatten';
      }
      return 'Sonne';
    });
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    if (diffX > 40) {
      vorherigerHintergrund();
    } else if (diffX < -40) {
      naechsterHintergrund();
    }
    touchStartX.current = null;
  }

  async function artDetailsNeuLaden() {
    if (!istArtVeraendert || laedtDetails) return;
    setLaedtDetails(true);
    setDetailsFehler(null);

    try {
      const vorschlag = await artDetailsAction(art);
      if (!vorschlag) {
        setDetailsFehler('Keine Pflanzenart oder Pflegedaten für diesen Namen gefunden.');
        return;
      }

      if (vorschlag.art) setArt(vorschlag.art);
      setGiessrhythmus(String(vorschlag.giessrhythmus ?? 7));
      setDuengenrhythmus(String(vorschlag.duengenrhythmus ?? 28));
      setErde(vorschlag.erde ?? '');
      setLicht(vorschlag.licht ?? 'Sonne oder Schatten');
      setHintergrundIndex(ortZuHintergrundIndex(vorschlag.ort ?? 'Drinnen'));

      // Neue Basis setzen, sodass der Button nach erfolgreichem Laden wieder sperrt
      setInitialArtBaseline(vorschlag.art || art);
    } catch (err) {
      setDetailsFehler(err instanceof Error ? err.message : 'Abfrage fehlgeschlagen.');
    } finally {
      setLaedtDetails(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {/* 3.a Titel */}
      <h1 className="text-center text-2xl font-bold text-stone-900">
        Einstellung des Profils
      </h1>

      {/* 3.b Vorschau-Bereich: Profil-Bilderrahmen zentriert */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-3">
          {/* Linker Pfeil */}
          <button
            type="button"
            onClick={vorherigerHintergrund}
            aria-label="Vorheriger Hintergrund (Ich bleibe lieber drinnen / Ich bleibe lieber draußen)"
            title="Hintergrund wechseln"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-stone-300 text-stone-600 shadow-sm transition hover:bg-stone-200/60 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Profil-Bilderrahmen (h-44 w-44) */}
          <div
            className="relative h-44 w-44 select-none overflow-hidden rounded-2xl border border-stone-300/80 shadow-sm"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Gleitende Hintergrund-Ebene mit weicher Wisch-Animation */}
            <div
              className="absolute inset-0 flex h-full w-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${hintergrundIndex * 100}%)` }}
            >
              <div className="h-full w-full shrink-0">
                <LittleHomeBackground />
              </div>
              <div className="h-full w-full shrink-0">
                <LittleGardenBackground />
              </div>
            </div>

            {/* Vordergrund: TopfMitGesicht sitzt stabil auf dem Boden */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
              <TopfMitGesicht
                id="vorschau"
                wuchsstufe={2}
                stimmung="zufrieden"
                name={art || 'Pflanze'}
                art={art}
              />
            </div>
          </div>

          {/* Rechter Pfeil */}
          <button
            type="button"
            onClick={naechsterHintergrund}
            aria-label="Nächster Hintergrund (Ich bleibe lieber drinnen / Ich bleibe lieber draußen)"
            title="Hintergrund wechseln"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-stone-300 text-stone-600 shadow-sm transition hover:bg-stone-200/60 active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Dezente Umschaltanzeige */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
              hintergrundIndex === 0 ? 'w-4 bg-emerald-700' : 'w-1.5 bg-stone-300'
            }`}
          />
          <span
            className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
              hintergrundIndex === 1 ? 'w-4 bg-emerald-700' : 'w-1.5 bg-stone-300'
            }`}
          />
          <span className="ml-1 text-[11px] font-medium text-stone-500">
            {hintergrundIndex === 0 ? 'Ich bleibe lieber drinnen' : 'Ich bleibe lieber draußen'}
          </span>
        </div>
      </div>

      {/* 3.c Felder prüfen und editieren (nur der Endzustand wird gespeichert) */}
      <form action={profilSchritt2AnlegenAction} className="space-y-4">
        {fotoUrl ? <input type="hidden" name="fotoUrl" value={fotoUrl} /> : null}
        {/* Ort und Licht werden visuell gesteuert und per Hidden-Input übermittelt */}
        <input
          type="hidden"
          name="ort"
          value={hintergrundIndex === 1 ? 'draußen' : 'Drinnen'}
        />
        <input
          type="hidden"
          name="licht"
          value={licht}
        />

        {/* c.1: Name (Pflichtfeld mit Ghost-Text "Meine Schatzi", immer initial leer) mit Licht-Symbol rechts */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Name *</span>
          <div className="flex gap-2">
            <input
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meine Schatzi"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={naechstesLicht}
              title={`Lichtbedarf: ${licht}`}
              aria-label={`Lichtbedarf: ${licht}`}
              className="flex h-[42px] w-[42px] shrink-0 cursor-pointer items-center justify-center text-stone-800 transition hover:opacity-80 active:scale-95"
            >
              <LichtSymbol licht={licht} className="h-9 w-9" />
            </button>
          </div>
        </label>

        {/* c.2: Art (Pflichtfeld) mit Reload-Button daneben */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Art *</span>
          <div className="flex gap-2">
            <input
              type="text"
              name="art"
              required
              value={art}
              onChange={(e) => setArt(e.target.value)}
              placeholder="z. B. Monstera deliciosa"
              className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
            />
            <button
              type="button"
              onClick={artDetailsNeuLaden}
              disabled={!istArtVeraendert || laedtDetails}
              title={
                istArtVeraendert
                  ? 'Pflegedaten für diese Art neu abfragen'
                  : 'Art ändern, um neue Daten abzurufen'
              }
              aria-label="Pflegedaten neu laden"
              className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl border transition ${
                !istArtVeraendert || laedtDetails
                  ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400 opacity-50'
                  : 'cursor-pointer border-emerald-700 bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 active:bg-emerald-900'
              }`}
            >
              <svg
                className={`h-5 w-5 ${laedtDetails ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          {detailsFehler && (
            <p className="mt-1.5 text-xs text-amber-700">⚠️ {detailsFehler}</p>
          )}
        </label>

        {/* c.3 & c.4: Gießrhythmus und Düngrhythmus in einer Zeile nebeneinander */}
        <div className="grid grid-cols-2 gap-3">
          {/* Gießrhythmus (halbe Breite) */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Gießrhythmus</span>
            <div className="relative flex items-center rounded-xl border border-stone-300 focus-within:border-emerald-600">
              <input
                type="number"
                min={1}
                name="giessrhythmus"
                value={giessrhythmus}
                onChange={(e) => setGiessrhythmus(e.target.value)}
                placeholder="7"
                className="w-full rounded-xl bg-transparent py-2.5 pl-3 pr-16 text-stone-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute right-3 text-sm font-normal text-stone-400">
                Tagen
              </span>
            </div>
          </label>

          {/* Düngrhythmus (halbe Breite) */}
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-stone-700">Düngrhythmus</span>
            <div className="relative flex items-center rounded-xl border border-stone-300 focus-within:border-emerald-600">
              <input
                type="number"
                min={1}
                name="duengenrhythmus"
                value={duengenrhythmus}
                onChange={(e) => setDuengenrhythmus(e.target.value)}
                placeholder="28"
                className="w-full rounded-xl bg-transparent py-2.5 pl-3 pr-16 text-stone-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute right-3 text-sm font-normal text-stone-400">
                Tagen
              </span>
            </div>
          </label>
        </div>

        {/* c.5: Erde (Erdmischung) */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Erde (Erdmischung)</span>
          <input
            type="text"
            name="erde"
            value={erde}
            onChange={(e) => setErde(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* c.8: Notiz (immer initial leer, nur durch den Nutzer editierbar) */}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-stone-700">Notiz</span>
          <textarea
            name="notiz"
            rows={3}
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            placeholder="Freie Notiz..."
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-stone-900 focus:border-emerald-600 focus:outline-none"
          />
        </label>

        {/* Am Ende steht: Das Profil anlegen */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-base font-semibold text-white shadow-sm transition active:bg-emerald-800"
          >
            Das Profil anlegen
          </button>
        </div>
      </form>
    </div>
  );
}
