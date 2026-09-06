'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { FotoVorschlag } from '@/lib/erkennung/typ';
import { Knopf } from '@/components/bausatz/Knopf';
import { KnopfLink } from '@/components/bausatz/KnopfLink';
import { Fehlerkasten } from '@/components/bausatz/Karte';
import { IconBlitz, IconKamera } from '@/components/Symbole';

/**
 * Schritt 1: Fotoaufnahme & Erkennung (Kamera-zuerst).
 * Zeigt den Sucher mit Ecken und Auslöser sowie Optionen für manuelle Eingabe
 * und Dateiauswahl. Nach der Aufnahme wird das Bild über die Erkennungslogik
 * analysiert und nahtlos an Schritt 2 ("Einstellung des Profils") übergeben.
 */
export function KameraHinzufuegen() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const dateiInputRef = useRef<HTMLInputElement>(null);

  const [bereit, setBereit] = useState(false);
  const [kameraFehler, setKameraFehler] = useState<string | null>(null);
  const [blitzMoeglich, setBlitzMoeglich] = useState(false);
  const [blitzAn, setBlitzAn] = useState(false);
  const [analysiert, setAnalysiert] = useState(false);
  const [erkennungsFehler, setErkennungsFehler] = useState<string | null>(null);
  const [letztesFotoUrl, setLetztesFotoUrl] = useState<string | null>(null);
  const [, startTransition] = useTransition();

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

  async function blitzUmschalten() {
    const spur = streamRef.current?.getVideoTracks()[0];
    if (!spur) return;
    const neuerZustand = !blitzAn;
    try {
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
    const maxBreite = 1600;
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

  /** Sendet das Foto an den Erkennungsdienst und navigiert zu Schritt 2 */
  function fotoVerarbeiten(blob: Blob) {
    setAnalysiert(true);
    setErkennungsFehler(null);

    void (async () => {
      try {
        const form = new FormData();
        form.set('foto', new File([blob], 'foto.jpg', { type: blob.type || 'image/jpeg' }));
        const antwort = await fetch('/aufgaben/erkennen', { method: 'POST', body: form });
        const ergebnis = (await antwort.json()) as {
          vorschlag?: FotoVorschlag | null;
          fotoUrl?: string | null;
          fehler?: string;
        };

        if (ergebnis.fotoUrl) {
          setLetztesFotoUrl(ergebnis.fotoUrl);
        }

        if (!antwort.ok) {
          setErkennungsFehler(ergebnis.fehler ?? `Foto-Erkennung fehlgeschlagen (HTTP ${antwort.status}).`);
          setAnalysiert(false);
          return;
        }

        const vorschlag = ergebnis.vorschlag;
        if (!vorschlag) {
          setErkennungsFehler('Keine Pflanze erkannt. Du kannst die Daten von Hand eingeben oder ein neues Foto versuchen.');
          setAnalysiert(false);
          return;
        }

        // Erfolgreich erkannt: Weiterleiten zu Schritt 2
        const params = new URLSearchParams();
        if (vorschlag.art) params.set('art', vorschlag.art);
        if (vorschlag.giessrhythmus !== undefined) params.set('giessrhythmus', String(vorschlag.giessrhythmus));
        if (vorschlag.duengenrhythmus !== undefined) params.set('duengenrhythmus', String(vorschlag.duengenrhythmus));
        if (vorschlag.erde) params.set('erde', vorschlag.erde);
        if (vorschlag.licht) params.set('licht', vorschlag.licht);
        if (vorschlag.ort) params.set('ort', vorschlag.ort);
        if (ergebnis.fotoUrl) params.set('fotoUrl', ergebnis.fotoUrl);

        startTransition(() => {
          router.push(`/hinzufuegen/schritt-2?${params.toString()}`);
        });
      } catch (fehler) {
        setErkennungsFehler(
          `Foto-Erkennung fehlgeschlagen: ${fehler instanceof Error ? fehler.message : String(fehler)}`,
        );
        setAnalysiert(false);
      }
    })();
  }

  function dateiAuswaehlen(datei: File | null) {
    if (datei && datei.size > 0) fotoVerarbeiten(datei);
  }

  return (
    <div className="space-y-3">
      {/* Fehlermeldung bei nicht erkannter Pflanze oder API-Fehler */}
      {erkennungsFehler && (
        <Fehlerkasten
          titel={erkennungsFehler}
          aktionen={
            <>
              <Knopf variante="sekundaer" onClick={() => setErkennungsFehler(null)}>
                Neues Foto versuchen
              </Knopf>
              <KnopfLink
                variante="primaer"
                href={`/hinzufuegen/schritt-2${letztesFotoUrl ? `?fotoUrl=${encodeURIComponent(letztesFotoUrl)}` : ''}`}
              >
                Manuell fortfahren
              </KnopfLink>
            </>
          }
        />
      )}

      {/* Navigation oben: Manuell eintragen oder Datei wählen */}
      <div className="grid grid-cols-2 gap-2">
        <KnopfLink href="/hinzufuegen/schritt-2" variante="sekundaer">
          Manuell eintragen
        </KnopfLink>
        <Knopf variante="sekundaer" disabled={analysiert} onClick={() => dateiInputRef.current?.click()}>
          Datei hinzufügen
        </Knopf>
      </div>

      {/* Sucher-Fenster */}
      <div
        className="relative overflow-hidden rounded-[1.75rem] border-4 border-papier-hell bg-tinte shadow-schweben"
        style={{ height: '58vh' }}
      >
        {kameraFehler ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-kante">
            <IconKamera className="h-10 w-10" />
            <p className="text-sm">{kameraFehler}</p>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
        )}

        {/* Sucher-Ecken */}
        {!kameraFehler && !analysiert && (
          <div className="pointer-events-none absolute inset-6">
            {[
              'left-0 top-0 border-l-2 border-t-2 rounded-tl-xl',
              'right-0 top-0 border-r-2 border-t-2 rounded-tr-xl',
              'left-0 bottom-0 border-l-2 border-b-2 rounded-bl-xl',
              'right-0 bottom-0 border-r-2 border-b-2 rounded-br-xl',
            ].map((klassen) => (
              <span key={klassen} className={`absolute h-10 w-10 border-papier-hell/80 ${klassen}`} />
            ))}
          </div>
        )}

        {/* Blitz oben links */}
        {blitzMoeglich && !kameraFehler && !analysiert && (
          <button
            type="button"
            onClick={blitzUmschalten}
            aria-label={blitzAn ? 'Blitz ausschalten' : 'Blitz einschalten'}
            aria-pressed={blitzAn}
            className={`absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full backdrop-blur ${
              blitzAn ? 'bg-sonne text-tinte' : 'bg-black/40 text-papier-hell'
            }`}
          >
            <IconBlitz className="h-5 w-5" />
          </button>
        )}

        {/* Overlay während der Analyse */}
        {analysiert && (
          <div
            role="status"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 px-6 text-center text-papier-hell backdrop-blur-sm"
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-transparent" />
            <p className="font-semibold">Pflanze wird analysiert…</p>
            <p className="text-xs text-kante">Art und Pflegeparameter werden ermittelt</p>
          </div>
        )}
      </div>

      {/* Runder Auslöser darunter, mittig */}
      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={aufnehmen}
          disabled={!bereit || analysiert}
          aria-label="Foto aufnehmen"
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-kante bg-papier-hell shadow-schweben transition active:scale-95 disabled:opacity-40"
        >
          <span className="h-11 w-11 rounded-full bg-moos" />
        </button>
      </div>

      {/* Verstecktes File-Input */}
      <input
        ref={dateiInputRef}
        type="file"
        name="foto"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => dateiAuswaehlen(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
