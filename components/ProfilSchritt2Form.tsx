'use client';

import { useState, useRef } from 'react';
import { TopfMitGesicht } from '@/components/TopfMitGesicht';
import { LittleHomeBackground, LittleGardenBackground } from '@/components/ProfilHintergruende';
import { LichtSymbol } from '@/components/LichtSymbol';
import { profilSchritt2AnlegenAction, artDetailsAction } from '@/app/server-aktionen';
import { ortZuHintergrundIndex } from '@/lib/erkennung/vision';
import { Knopf } from '@/components/bausatz/Knopf';
import { Feld, Eingabe, Textbereich } from '@/components/bausatz/Feld';
import { IconNeu } from '@/components/Symbole';

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
      <h1 className="text-center font-anzeige text-3xl font-medium leading-none tracking-tight text-moos-dunkel">
        Einstellung des Profils
      </h1>

      {/* 3.b Vorschau-Bereich: Profil-Bilderrahmen zentriert */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-3">
          {/* Linker Pfeil */}
          <Knopf
            variante="sekundaer"
            onClick={vorherigerHintergrund}
            aria-label="Vorheriger Hintergrund (Ich bleibe lieber drinnen / Ich bleibe lieber draußen)"
            title="Hintergrund wechseln"
            className="h-11 w-11 px-0!"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Knopf>

          {/* Profil-Bilderrahmen (h-44 w-44) */}
          <div
            className="relative h-44 w-44 select-none overflow-hidden rounded-3xl border-4 border-papier-hell shadow-schweben"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Gleitende Hintergrund-Ebene mit weicher Wisch-Animation */}
            <div
              className="absolute inset-0 flex h-full w-full transition-transform duration-500 ease-out motion-reduce:transition-none"
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
          <Knopf
            variante="sekundaer"
            onClick={naechsterHintergrund}
            aria-label="Nächster Hintergrund (Ich bleibe lieber drinnen / Ich bleibe lieber draußen)"
            title="Hintergrund wechseln"
            className="h-11 w-11 px-0!"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Knopf>
        </div>

        {/* Dezente Umschaltanzeige */}
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
              hintergrundIndex === 0 ? 'w-4 bg-moos' : 'w-1.5 bg-kante-dunkel'
            }`}
          />
          <span
            className={`inline-block h-1.5 rounded-full transition-all duration-300 ${
              hintergrundIndex === 1 ? 'w-4 bg-moos' : 'w-1.5 bg-kante-dunkel'
            }`}
          />
          <span className="ml-1 text-[11px] font-semibold text-tinte-gedaempft">
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
        <Feld label="Name *">
          <div className="flex gap-2">
            <Eingabe
              type="text"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meine Schatzi"
            />
            <button
              type="button"
              onClick={naechstesLicht}
              title={`Lichtbedarf: ${licht}`}
              aria-label={`Lichtbedarf: ${licht}`}
              className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-2xl text-moos-dunkel transition hover:opacity-80 active:scale-95"
            >
              <LichtSymbol licht={licht} className="h-9 w-9" />
            </button>
          </div>
        </Feld>

        {/* c.2: Art (Pflichtfeld) mit Reload-Button daneben */}
        <Feld label="Art *" fehler={detailsFehler}>
          <div className="flex gap-2">
            <Eingabe
              type="text"
              name="art"
              required
              value={art}
              onChange={(e) => setArt(e.target.value)}
              placeholder="z. B. Monstera deliciosa"
            />
            <Knopf
              variante="primaer"
              onClick={artDetailsNeuLaden}
              disabled={!istArtVeraendert || laedtDetails}
              wartend={laedtDetails}
              title={istArtVeraendert ? 'Pflegedaten für diese Art neu abfragen' : 'Art ändern, um neue Daten abzurufen'}
              aria-label="Pflegedaten neu laden"
              className="h-12 w-12 shrink-0 rounded-2xl px-0!"
            >
              {!laedtDetails && <IconNeu className="h-5 w-5" />}
            </Knopf>
          </div>
        </Feld>

        {/* c.3 & c.4: Gießrhythmus und Düngrhythmus in einer Zeile nebeneinander */}
        <div className="grid grid-cols-2 gap-3">
          <Feld label="Gieß-Rhythmus">
            <div className="relative">
              <Eingabe
                type="number"
                min={1}
                name="giessrhythmus"
                value={giessrhythmus}
                onChange={(e) => setGiessrhythmus(e.target.value)}
                placeholder="7"
                inputMode="numeric"
                className="pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-tinte-gedaempft">Tagen</span>
            </div>
          </Feld>

          <Feld label="Dünge-Rhythmus">
            <div className="relative">
              <Eingabe
                type="number"
                min={1}
                name="duengenrhythmus"
                value={duengenrhythmus}
                onChange={(e) => setDuengenrhythmus(e.target.value)}
                placeholder="28"
                inputMode="numeric"
                className="pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-tinte-gedaempft">Tagen</span>
            </div>
          </Feld>
        </div>

        {/* c.5: Erde (Erdmischung) */}
        <Feld label="Erde (Erdmischung)">
          <Eingabe type="text" name="erde" value={erde} onChange={(e) => setErde(e.target.value)} />
        </Feld>

        {/* c.8: Notiz (immer initial leer, nur durch den Nutzer editierbar) */}
        <Feld label="Notiz">
          <Textbereich name="notiz" rows={3} value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="Freie Notiz..." />
        </Feld>

        {/* Am Ende steht: Hinzufügen */}
        <div className="pt-2">
          <Knopf type="submit" variante="primaer" className="w-full">
            Hinzufügen
          </Knopf>
        </div>
      </form>
    </div>
  );
}
