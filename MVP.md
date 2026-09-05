# Spezifikation: erste vollständige Fassung

Grundlage: das Interview in `Plans/we-have-already-a-snug-quiche.md` (ADR-013
insbesondere). Form angelehnt an
`Referenz/annes-pflanzenparadies/MVP.md` — übernommen wurde die Form
(nachprüfbare Sätze statt Gefühl), nicht der Inhalt.

---

## Das Ziel in einem Satz

**Die Anwendung läuft vollständig lokal mit einer lokalen Datenbank, mehrere
Nutzer:innen können je eigene Gärten mit Pflanzen anlegen und deren Wachstum
mit Fotos dokumentieren — und ist strukturell bereit, die lokale Datenbank
gegen eine Cloud-Datenbank zu tauschen und bei einem Hoster zu laufen.**

Die Umstellung selbst — Cloud-Datenbank, Deployment, echte
Passwort-Anmeldung — gehört **bewusst nicht** zum MVP. Genau wie im
Referenzprojekt wird erst fertiggebaut und lokal geprüft; der Go-Live-Schritt
folgt danach, getrennt (ADR-013).

---

## Wer es benutzt

Mehrere Personen, je mit eigenem Garten. Für die MVP-Phase: lokale
Test-Nutzer:innen ohne echtes Passwort, darunter Anne mit ihren 36 importierten
Pflanzen als Demo-Datensatz.

---

## Woran wir messen, ob es fertig ist

Nachprüfbar, nicht gefühlt:

1. Zwei verschiedene lokale Test-Nutzer:innen sehen ausschließlich ihre
   eigenen Gärten — auch über direkte Anfragen, nicht nur über die
   Oberfläche.
2. Annes Test-Konto zeigt nach dem Import alle 36 Pflanzen mit intakten
   Kern-Pflegedaten.
3. Ein neuer Wachstumseintrag mit Foto erscheint sofort im Verlauf der
   jeweiligen Pflanze. Schlägt das Speichern fehl, erscheint eine Meldung —
   kein Zustand, der Erfolg vortäuscht.
4. Ein Topf zeigt sichtbar unterschiedliche Gesichter (fröhlich/neutral/
   traurig), abhängig vom berechneten Pflegezustand — unabhängig davon wächst
   die Pflanze selbst sichtbar mit jeder Gieß-, Dünge- oder Ernte-Handlung
   weiter (zwei getrennte Werte, ADR-016).
5. Eine gestorbene Pflanze verschwindet nicht, sondern erscheint im
   In-Loving-Memory-Bereich, positiv dargestellt (ADR-014).
6. `npm run dev` startet die Anwendung mit einer lokalen Datenbank. Ein
   Wechsel auf eine Cloud-Datenbank braucht nur eine geänderte
   `DATABASE_URL`, keine Code-Änderung.
7. Die Anwendung ist mit `output: 'standalone'` gebaut — sie ließe sich mit
   `node server.js` betreiben, ohne an Vercel gebunden zu sein.
8. **Gefühlsprobe (ADR-017):** Eine Person, die die App zum ersten Mal
   benutzt, beschreibt das Gießen/Düngen/Ernten unaufgefordert als
   „niedlich" oder „macht Spaß" — und erkennt eine überfällige Pflanze am
   traurigen Gesicht, ohne eine Erklärung zu brauchen.
9. **Handy-Probe (ADR-018, H9):** Kein seitliches Scrollen auf dem
   Handybildschirm, jede Tippfläche (Häkchen im Gießplan, Aktions-Knöpfe)
   ist bequem mit dem Daumen bedienbar, die Kamera ist beim Hinzufügen direkt
   erreichbar. Am Computer benutzbar, aber am Handy entworfen — nicht
   umgekehrt.

---

## Die vier Kern-Aktionen

Jede der ersten drei lässt die jeweilige Pflanze sichtbar wachsen (Wuchsstufe,
dauerhaft) — unabhängig davon zeigt das Gesicht auf ihrem **Topf** den
tagesaktuellen Pflegezustand (zufrieden bis sehr traurig, je nachdem ob etwas
überfällig ist). Zwei getrennte Werte, siehe ADR-016 im Plan.

1. **Gießplan** — zeigt, welche Pflanzen heute fällig sind, einzeln abhakbar.
2. **Düngeplan** — gleiches Prinzip, eigener Rhythmus je Pflanze.
3. **Erntetagebuch** — Pflanze wählen, Menge, Notiz, eintragen.
4. **Hinzufügen** — manuell (Name eingeben) oder per Scanner (Foto → Art +
   Pflegevorschlag, Rückfragen zu drinnen/draußen und aktueller Größe).

## Was drin ist

### Zu bauen (diese Session)

| | |
|---|---|
| Konten/Gärten | Mehrere Nutzer:innen, je mit einem oder mehreren Gärten |
| Pflanzenverwaltung | Pflanzen anlegen, Pflegedaten, Detailseite (Erde, Licht, Gießrhythmus, Dünger) |
| Gieß- und Düngeplan | Nach Datum, heute fällige einzeln abhakbar |
| Erntetagebuch | Menge + Notiz je Pflanze, Ernte-Vitrine als Symbol-Übersicht |
| Wachstums-Tracking | Wuchsstufe steigt mit jeder der drei Kern-Aktionen; Verlauf über die Zeit |
| Töpfe mit Gesichtern | Regelbasierte Pflegestimmung aus Zeit-seit-Pflege vs. Bedarf, unabhängig von der Wuchsstufe |
| In liebevoller Erinnerung | Gestorbene Pflanzen als eigener Bereich unterhalb der Pflanzenliste — Engel mit Heiligenschein auf einer Wolke, glücklich dargestellt (ADR-014) |
| Scanner — UI-Teil | Kamera-Aufnahme, manuelles Hinzufügen, Rückfragen (drinnen/draußen, Größe), Anbindung an `pflanzeAusErkennungAnlegen` (ADR-015) |
| Anne-Import | Einmaliger, sorgfältiger Import ihrer 36 Pflanzen als Demo-Datensatz |

### Baut das übrige Team

| | Warum hier nur erwähnt |
|---|---|
| Scanner — KI-Erkennung (Foto → Art, Erde, Licht, Gießbedarf) | Eigener Teil des Teams (B1, ADR-015). Diese Session liefert nur die Schnittstelle und das Formular drumherum. |

## Screens (grobe Struktur, Designs folgen)

Untere Navigationsleiste, drei Ziele:

1. **Home** (links): Pflanzen-Topf-Galerie oben (alle Pflanzen, Gesichter
   sichtbar) → Ernte-Vitrine → alphabetische Pflanzenliste (Tippen → Detail:
   Erde, Licht/Schatten, Gießrhythmus, Dünger) → In-Loving-Memory-Bereich.
2. **Aktionen** (mitte): Gießplan, Düngeplan, Ernte eintragen.
3. **Hinzufügen** (rechts): manuell (Name) oder Scanner (Foto → KI-Vorschlag
   → Rückfragen drinnen/draußen, Größe → anlegen).

---

## Was bewusst nicht drin ist

| Nicht im MVP | Warum, und wann dann |
|---|---|
| Echte Passwort-Anmeldung (Auth.js Credentials) | Erst nötig, sobald die Anwendung netzerreichbar wird — erster Schritt der Go-Live-Phase. |
| Cloud-Datenbank (Neon), tatsächliches Deployment | Bewusst getrennt von „fertigbauen und lokal prüfen" (ADR-013). |
| Scanner — KI-Erkennung selbst | Baut das übrige Team (B1, ADR-015). |
| Community-/Teilen-Funktionen | Privat by default; nicht für den Pitch geplant. |
| Erinnerungen/Benachrichtigungen | Kein Nutzerwunsch geäußert. |

---

## Go-Live-Phase (nach dem MVP, vor dem Pitch)

Eigener, nachgelagerter Schritt, damit ein Deployment- oder
Anmeldungs-Problem nicht den Kern-Feature-Bau blockiert:

1. `DATABASE_URL` auf Neon umstellen, Daten einmalig umziehen.
2. Auth.js Credentials-Provider scharfschalten, lokalen Test-Nutzer-Wechsler
   ablösen.
3. Auf Vercel deployen, Foto-Ablage auf Vercel Blob umstellen.

Gelingt einer dieser Schritte am Hackathon-Wochenende nicht rechtzeitig, ist
die lokale MVP-Fassung der Rückfallplan für den Pitch — vorgeführt vom
Laptop, klar benannt statt improvisiert vorgetäuscht.

---

## Risiken

| Risiko | Wie wir damit umgehen |
|---|---|
| Mandantentrennung hat eine Lücke | Eigener Testfall „fremder Garten, eigene Anfrage" für jede Berechnungsregel (siehe `REGELN.md` Abschnitt 5). |
| Neon/Vercel/Auth.js machen im Go-Live-Schritt Ärger | MVP ist bereits lokal vollständig vorführbar — der Pitch hängt nicht am Gelingen des Go-Live-Schritts. |
| Annes importierte Daten gehen beim Import verloren oder verfälscht | `DATEN.md`, einmaliger Import mit sichtbarem Abbruch bei zweitem Lauf, keine Löschung bestehender Gärten. |
| Scanner-Team liefert nicht rechtzeitig | Schnittstelle (`pflanzeAusErkennungAnlegen`) ist unabhängig nutzbar — die App funktioniert auch ohne den Scanner vollständig. |

---

## Offene Entscheidungen

| Frage | Wer entscheidet | Stand |
|---|---|---|
| Wie wird die App beim Pitch aufs Handy geholt — rein lokal, kurzzeitiger Tunnel, oder echte Live-Schaltung? | Team | offen, bewusst — Optionen mit Vor-/Nachteilen liegen bereit, Entscheidung folgt später |
| Google als zusätzlicher Login-Anbieter | Team | Stretch-Goal, kein Muss (siehe Plan, „Offene Annahmen") |
| Annes Garten-Wissen (`wissen/`) übernehmen | Team | Nur bei Bedarf für konkrete Pflegelogik, als Quelle zitiert |
| Umfang der Töpfe-Gesichter-Berechnung | Claude Code (technisch) | Regelbasiert, kein KI-Aufruf — siehe Plan, „Offene Annahmen" |
