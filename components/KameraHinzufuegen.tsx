'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { pflanzeAusScannerAction } from '@/app/server-aktionen';
import type { FotoVorschlag } from '@/lib/erkennung/typ';

/**
 * Kamera-zuerst-Fluss nach Weißwandskizze (Handy füllt fast alles das Sucher-
 * fenster mit Ecken, darunter mittig der runde Auslöser, oben „Manuell
 * eintragen"). Erst NACH dem Auslöser erscheinen Foto, Erkennungs-Vorschlag
 * und Pflegefelder. Ohne Kamera fällt die UI auf Datei-Auswahl zurück.
 */
export function KameraHinzufuegen() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dateiInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<'kamera' | 'details'>('kamera');
  const [bereit, setBereit] = useState(false);
  const [kameraFehler, setKameraFehler] = useState<string | null>(null);
  const [blitzMoeglich, setBlitzMoeglich] = useState(false);
  const [blitzAn, setBlitzAn] = useState(false);
  const [foto, setFoto] = useState<Blob | null>(null);
  const [vorschau, setVorschau] = useState<string | null>(null);
  const [vorschlag, setVorschlag] = useState<FotoVorschlag | null>(null);
  const [erkennungsFehler, setErkennungsFehler] = useState<string | null>(null);
  const [geprueft, setGeprueft] = useState(false);
  const [felder, setFelder] = useState({ name: '', art: '', erde: '', licht: '', giess: '', groesse: '' });
  const [drinnen, setDrinnen] = useState<'drinnen' | 'draussen'>('drinnen');
  const [drinnenVonUser, setDrinnenVonUser] = useState(false);
  const [meldungen, setMeldungen] = useState<string[] | null>(null);
  const [laeuft, starten] = useTransition();

  useEffect(() => {
    let abgebrochen = false;

    async function kameraStarten() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setKameraFehler('Dieser Browser stellt keine Kamera zur Verfügung.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (abgebrochen) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play().catch(() => {});
        }
        const spur = stream.getVideoTracks()[0];
        const faehigkeiten = spur.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
        setBlitzMoeglich(Boolean(faehigkeiten?.torch));
        setBereit(true);
      } catch {
        setKameraFehler('Kamera nicht verfügbar — du kannst stattdessen ein Foto auswählen.');
      }
    }

    void kameraStarten();
    return () => {
      abgebrochen = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Nach Wechsel zurück in die Kamera-Ansicht wird das <video>-Element neu
  //-mountet — den laufenden Stream wieder anhängen, sonst bleibt der Sucher schwarz.
  useEffect(() => {
    if (phase === 'kamera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  async function blitzUmschalten() {
    const spur = streamRef.current?.getVideoTracks()[0];
    if (!spur) return;
    const neuerZustand = !blitzAn;
    try {
      // Torch ist ein Nicht-Standard-Track-Control (v. a. Android-Chrome).
      await (spur as MediaStreamTrack & { applyConstraints?: (c: unknown) => Promise<void> }).applyConstraints?.({
        advanced: [{ torch: neuerZustand }],
      });
      setBlitzAn(neuerZustand);
    } catch {
      setBlitzMoeglich(false);
    }
  }

  function aufnehmen() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const maxBreite = 1600; // hält Uploads klein (Server-Action-Limit) und die DB schlank
    const skala = Math.min(1, maxBreite / video.videoWidth);
    const leinwand = document.createElement('canvas');
    leinwand.width = Math.round(video.videoWidth * skala);
    leinwand.height = Math.round(video.videoHeight * skala);
    const stift = leinwand.getContext('2d');
    if (!stift) return;
    stift.drawImage(video, 0, 0, leinwand.width, leinwand.height);
    leinwand.toBlob(
      (blob) => {
        if (blob) fotoVerarbeiten(blob);
      },
      'image/jpeg',
      0.9,
    );
  }

  /** Ein gemachtes oder gewähltes Bild übernehmen, Erkennung anwerfen, in die Detail-Ansicht wechseln. */
  function fotoVerarbeiten(blob: Blob) {
    setFoto(blob);
    setVorschau((alt) => {
      if (alt) URL.revokeObjectURL(alt);
      return URL.createObjectURL(blob);
    });
    // Neuer Foto/Datei → alles zurücksetzen, damit keine Alt-Werte aus dem
    // letzten Versuch mit hochgeladen werden
    setVorschlag(null);
    setErkennungsFehler(null);
    setGeprueft(false);
    setFelder({ name: '', art: '', erde: '', licht: '', giess: '', groesse: '' });
    setDrinnen('drinnen');
    setDrinnenVonUser(false);
    setMeldungen(null);
    setPhase('details');

    void (async () => {
      try {
        const form = new FormData();
        form.set('foto', new File([blob], 'foto.jpg', { type: blob.type || 'image/jpeg' }));
        const antwort = await fetch('/aufgaben/erkennen', { method: 'POST', body: form });
        const ergebnis = (await antwort.json()) as { vorschlag?: FotoVorschlag | null; fehler?: string };
        if (!antwort.ok) {
          //REGELN: Fehler sichtbar — nicht als „keine Pflanze“ ausgeben.
          setErkennungsFehler(ergebnis.fehler ?? `Foto-Erkennung fehlgeschlagen (HTTP ${antwort.status}).`);
          setVorschlag(null);
          setGeprueft(true);
          return;
        }
        setVorschlag(ergebnis.vorschlag ?? null);
        setGeprueft(true);
        if (!ergebnis.vorschlag) return;
        setFelder((alt) => ({
          ...alt,
          name: alt.name.trim() === '' ? ergebnis.vorschlag!.nameVorschlag : alt.name,
          art: ergebnis.vorschlag!.art,
          erde: ergebnis.vorschlag!.erde ?? '',
          licht: ergebnis.vorschlag!.licht ?? '',
          giess: ergebnis.vorschlag!.giessIntervallTage ? String(ergebnis.vorschlag!.giessIntervallTage) : alt.giess,
        }));
        if (!drinnenVonUser) setDrinnen(ergebnis.vorschlag!.drinnenDraussen);
      } catch (fehler) {
        // Netzwerkfehler o. ä. — sichtbar machen, Felder bleiben leer zum Selberausfüllen.
        setErkennungsFehler(
          `Foto-Erkennung fehlgeschlagen: ${fehler instanceof Error ? fehler.message : String(fehler)}`,
        );
        setVorschlag(null);
        setGeprueft(true);
      }
    })();
  }

  function dateiAuswaehlen(datei: File | null) {
    if (datei && datei.size > 0) fotoVerarbeiten(datei);
  }

  function feldSetzen(feld: keyof typeof felder, wert: string) {
    setFelder((alt) => ({ ...alt, [feld]: wert }));
  }

  function zurueckZurKamera() {
    setFoto(null);
    setVorschau(null);
    setVorschlag(null);
    setErkennungsFehler(null);
    setGeprueft(false);
    setMeldungen(null);
    setPhase('kamera');
  }

  function absenden(formData: FormData) {
    void starten(async () => {
      try {
        if (foto) {
          formData.set('foto', new File([foto], 'foto.jpg', { type: 'image/jpeg' }));
        } else {
          formData.delete('foto');
        }
        await pflanzeAusScannerAction(formData);
      } catch (fehler) {
        if (fehler && typeof fehler === 'object' && 'digest' in fehler) throw fehler; // Next-eigener Redirect-Fehler
        setMeldungen([fehler instanceof Error ? fehler.message : 'Speichern fehlgeschlagen.']);
      }
    });
  }

  // Verborgene Datei-Auswahl für den Rückfall ohne Kamera
  const dateiEingang = (
    <input
      ref={dateiInputRef}
      type="file"
      name="foto"
      accept="image/*"
      capture="environment"
      className="hidden"
      onChange={(e) => dateiAuswaehlen(e.target.files?.[0] ?? null)}
    />
  );

  if (phase === 'kamera') {
    return (
      <div className="space-y-3">
        {/* Zwei Wege, eine Pflanze zu bekommen: Textformular oder Foto */}
        <Link
          href="/pflanze/neu"
          className="block rounded-2xl border border-stone-300 bg-white px-4 py-3 text-center text-base font-semibold text-stone-700 shadow-sm active:bg-stone-100"
        >
          Manuell eintragen
        </Link>
        <button
          type="button"
          onClick={() => dateiInputRef.current?.click()}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-center text-base font-semibold text-stone-700 shadow-sm active:bg-stone-100"
        >
          Datei hinzufügen
        </button>

        {/* Sucher-Fenster — Höhe als inline style, damit kein Tailwind-Cache-\
            Problem (fehlende h-[..]-Klasse im ausgelieferten CSS) den Sucher
            auf 0 px kollabieren lassen kann. */}
        <div className="relative overflow-hidden rounded-3xl bg-stone-900" style={{ height: '58vh' }}>
          {kameraFehler ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-stone-400">
              <span className="text-4xl">📷</span>
              <p className="text-sm">{kameraFehler}</p>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
          )}

          {/* Sucher-Ecken */}
          {!kameraFehler && (
            <div className="pointer-events-none absolute inset-6">
              {[
                'left-0 top-0 border-l-2 border-t-2 rounded-tl-xl',
                'right-0 top-0 border-r-2 border-t-2 rounded-tr-xl',
                'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl',
                'right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl',
              ].map((klassen) => (
                <span key={klassen} className={`absolute h-10 w-10 border-white/80 ${klassen}`} />
              ))}
            </div>
          )}

          {/* Blitz oben links */}
          {blitzMoeglich && !kameraFehler && (
            <button
              type="button"
              onClick={blitzUmschalten}
              aria-label={blitzAn ? 'Blitz ausschalten' : 'Blitz einschalten'}
              className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur ${
                blitzAn ? 'bg-amber-400 text-stone-900' : 'bg-black/40 text-white'
              }`}
            >
              ⚡
            </button>
          )}
        </div>

        {/* Runder Auslöser darunter, mittig (Skizze) */}
        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={aufnehmen}
            disabled={!bereit}
            aria-label="Foto aufnehmen"
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-stone-300 bg-white shadow-sm disabled:opacity-40"
          >
            <span className="h-11 w-11 rounded-full bg-stone-700" />
          </button>
        </div>

        {dateiEingang}
      </div>
    );
  }

  // Detail-Ansicht nach der Aufnahme
  return (
    <div className="space-y-4 pb-2">
      <div className="relative overflow-hidden rounded-3xl bg-stone-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={vorschau ?? ''} alt="Gemachtes Foto" className="w-full object-cover" style={{ maxHeight: '58vh' }} />
        <button
          type="button"
          onClick={zurueckZurKamera}
          className="absolute right-3 top-3 rounded-full bg-black/50 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur"
        >
          ↺ Neues Foto
        </button>
      </div>

      {meldungen && (
        <ul className="space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {meldungen.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}

      {/* Solange die Erkennung läuft: Ladebildschirm statt leerer Felder */}
      {!geprueft ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-sm">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-emerald-700" aria-hidden />
          <p className="text-sm text-stone-500">Pflanze wird erkannt…</p>
        </div>
      ) : (
      <form action={absenden} className="space-y-4">
        {/* erkannt? → Vorschlag mit Pflege-Punkten */}
        {vorschlag ? (
          <div
            className={`rounded-2xl p-4 shadow-sm ${
              vorschlag.sicherheit === 'hoch' ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
            }`}
          >
            <p className="font-semibold">
              🔍 Pflanze erkannt: {vorschlag.art}{' '}
              <span className="text-xs font-normal opacity-80">
                ({vorschlag.sicherheit === 'hoch' ? 'hohe Trefferwahrscheinlichkeit' : `${vorschlag.sicherheit}e Sicherheit — bitte prüfen`})
              </span>
            </p>
            {vorschlag.hinweis && <p className="mt-1 text-sm">{vorschlag.hinweis}</p>}
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-sm">
              {vorschlag.giessIntervallTage ? <li>Gießen alle {vorschlag.giessIntervallTage} Tage</li> : null}
              {vorschlag.licht ? <li>{vorschlag.licht}</li> : null}
              {vorschlag.erde ? <li>{vorschlag.erde}</li> : null}
              {vorschlag.duengerTyp && (
                <li>
                  Düngen: {vorschlag.duengerTyp}
                  {vorschlag.duengerIntervallTage ? ` alle ${vorschlag.duengerIntervallTage} Tage` : ''}
                </li>
              )}
            </ul>

            {/* Name und Art kommen aus der Erkennung — unsichtbar mitgegeben */}
            <input type="hidden" name="name" value={felder.name} />
            <input type="hidden" name="art" value={felder.art} />
            <input type="hidden" name="hinweis" value={vorschlag.hinweis ?? ''} />
          </div>
        ) : geprueft ? (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {erkennungsFehler ? (
              <p className="mb-3 rounded-xl bg-red-50 p-2.5 text-sm font-semibold text-red-700">
                ⚠️ {erkennungsFehler} — bitte Name und Art von Hand eintragen.
              </p>
            ) : (
              <p className="mb-3 rounded-xl bg-red-50 p-2.5 text-sm font-semibold text-red-700">
                ⚠️ Keine Pflanze erkannt — bitte Name und Art von Hand eintragen.
              </p>
            )}
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Name *</span>
                <input
                  name="name"
                  required
                  disabled={laeuft}
                  value={felder.name}
                  onChange={(e) => feldSetzen('name', e.target.value)}
                  placeholder="z. B. Anne's Monstera"
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Art *</span>
                <input
                  name="art"
                  required
                  disabled={laeuft}
                  value={felder.art}
                  onChange={(e) => feldSetzen('art', e.target.value)}
                  placeholder="z. B. Monstera deliciosa"
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5"
                />
              </label>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="space-y-3">
            <fieldset className="flex gap-4">
              <legend className="mb-1 text-sm font-medium">Drinnen oder draußen?</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="drinnenDraussen"
                  value="drinnen"
                  checked={drinnen === 'drinnen'}
                  disabled={laeuft}
                  onChange={() => {
                    setDrinnen('drinnen');
                    setDrinnenVonUser(true);
                  }}
                />{' '}
                Drinnen
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="drinnenDraussen"
                  value="draussen"
                  checked={drinnen === 'draussen'}
                  disabled={laeuft}
                  onChange={() => {
                    setDrinnen('draussen');
                    setDrinnenVonUser(true);
                  }}
                />{' '}
                Draußen
              </label>
            </fieldset>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Gießen alle (Tage)</span>
                <input
                  name="giessIntervallTage"
                  type="number"
                  min={1}
                  disabled={laeuft}
                  value={felder.giess}
                  onChange={(e) => feldSetzen('giess', e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Aktuelle Größe</span>
                <input
                  name="aktuelleGroesse"
                  disabled={laeuft}
                  value={felder.groesse}
                  onChange={(e) => feldSetzen('groesse', e.target.value)}
                  placeholder="z. B. 20 cm"
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Erde</span>
                <input
                  name="erde"
                  disabled={laeuft}
                  value={felder.erde}
                  onChange={(e) => feldSetzen('erde', e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Licht</span>
                <input
                  name="licht"
                  disabled={laeuft}
                  value={felder.licht}
                  onChange={(e) => feldSetzen('licht', e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2.5"
                />
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={laeuft || !foto}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white disabled:opacity-50"
        >
          {laeuft ? 'Wird gespeichert…' : 'Pflanze anlegen'}
        </button>
      </form>
      )}

      {dateiEingang}
    </div>
  );
}
