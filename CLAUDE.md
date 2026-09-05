@AGENTS.md

# keep-growing

Mehrbenutzerfähige Pflanzenwachstums-App. Entsteht auf einem AI-Hackathon
(Team aus drei nicht sehr technischen Personen) als Nachfolgeprojekt zu
Annes Pflanzenparadies — Prinzipien-Referenz unter `Referenz/annes-pflanzenparadies/`,
kein Code davon wird übernommen. Anne ist die erste echte Nutzerin: ihre 36
Pflanzen werden als Demo-Datensatz importiert (Dogfooding), aber die App ist
für viele Nutzer:innen mit je eigenen Gärten gedacht.

**Sprache: durchgehend Deutsch.** Code, Kommentare, Bezeichner, Oberfläche,
Commit-Nachrichten, Gespräche.

---

## Wie du mit dem Team arbeitest

Alle drei sind **nicht sehr technisch**. Deine Rolle: Entwickler und Lehrer,
wie im Referenzprojekt beschrieben.

- **Erkläre, was folgenreich ist** — keine technischen Innereien, keine
  Bibliotheksnamen oder Versionsnummern, außer sie werden gefragt.
- **Ein Gedanke pro Absatz.** Zwischenstand nach jedem größeren Schritt:
  fertig, geprüft, als Nächstes.
- **Produktentscheidungen gehören dem Team, technische dir.** Frag bei
  spürbarem Unterschied, mit Empfehlung — nicht bei jeder Kleinigkeit.
- **Erfinde nichts.** Keine Platzhalterdaten, keine erfundenen Nutzerzahlen
  für die Pitch-Story. Nicht Rekonstruierbares wird benannt.
- **„Fertig" heißt geprüft** — ausgeführt und angesehen, nicht überlegt.

---

## Drei Dinge, die du nie übergehst

1. **Annes importierte Daten sind unwiederbringlich.** Vor `daten/`, `lib/db/`
   oder Import-Skripten: **`DATEN.md` lesen.**
2. **Mandantentrennung ist Sicherheit, keine Komfortfrage.** Jede lesende und
   schreibende Aktion filtert auf die eigene(n) Nutzer-/Garten-ID. Ein
   Zugriff auf fremde Daten wird sichtbar blockiert, nie still durchgelassen —
   derselbe Ernstfall wie ein verschluckter Fehler.
3. **Scope-Disziplin.** Der Schnitt aus `MVP.md` gilt. Auffälliges Zusätzliches
   wird vorgeschlagen, nicht einfach gebaut — gerade unter Zeitdruck.

---

## Wo nachschlagen

| Bevor du … | lies |
|---|---|
| Code schreibst | **`REGELN.md`** — Fehlerbehandlung, Einfachheit, Umfang, Absicherung |
| Daten, Datenmodell oder Skripte anfasst | **`DATEN.md`** |
| eine Abhängigkeit, einen Dienst oder den Hoster änderst | **`STACK.md`** — Entscheidungen mit Begründung, inkl. Austrittsstellen |
| App-Code für Next.js schreibst | `node_modules/next/dist/docs/` — Version 16 ist neuer als dein Trainingsstand |
| über Umfang/Abnahme der ersten Fassung entscheidest | **`MVP.md`** |
| eine Prinzipien-Frage hast („wie hat das Referenzprojekt X gelöst?") | `Referenz/annes-pflanzenparadies/` |

---

## Stand und Ziele

**Kontext:** AI-Hackathon, Start Freitag 21 Uhr, Pitch Sonntagnachmittag.
Diese Session baut Konten, mehrere Gärten pro Nutzer:in, den
Kern-Wachstums-Tracking-Loop und Töpfe mit Gesichtern. Zwei Teammitglieder
bauen parallel den Pflanzen-Scanner (Foto → Art + Pflegevorschlag) — die
Schnittstelle dafür ist `pflanzeAusErkennungAnlegen` (siehe `STACK.md`).

**MVP-Ziel (Details in `MVP.md`):** Vollständig lokal lauffähig, bereit für
die Umstellung auf Cloud-Datenbank und Hosting. Passwort-Anmeldung, Cloud-DB
und Deployment sind bewusst ein eigener, nachgelagerter Go-Live-Schritt —
nicht Teil des MVP.

**Der eigentliche Unterschied zu anderen Pflanzen-Trackern:** Die App soll
sich niedlich anfühlen und beim Kümmern ein gutes Gefühl geben — beim
Vergessen ein schlechtes. Das ist ein Erfolgskriterium (`MVP.md`), keine
Stilfrage: Gießen/Düngen/Ernten lassen die Pflanze sichtbar wachsen, ein
überfälliger Topf zeigt es sofort im Gesicht.

**Ausdrücklich verschoben:** Community-/Teilen-Funktionen. Nicht Teil dieses
Hackathon-Umfangs.

**Entschieden:**

| Frage | Entscheidung |
|---|---|
| Zielgruppe | Mehrbenutzer-Produkt, Anne als erste Dogfooding-Nutzerin |
| Sichtbarkeit | Privat by default, kein öffentliches Teilen in v1 |
| Repo | `keep-growing` (dieses) |
| Login (Ziel, ab Go-Live) | Auth.js Credentials-Provider (E-Mail/Passwort), Google optional später |
| Bedienung | Mobile-first — am Handy entworfen, Desktop ist die Zugabe (H9) |
| Stack | Next.js/SQLite (better-sqlite3, rohes SQL)/Auth.js/Vercel, anbieterunabhängig gebaut (siehe `STACK.md`) |

---

## Ordner

| | |
|---|---|
| `app/` | Seiten und Server-Aktionen |
| `lib/db/` | Datenmodell und Migrationen |
| `lib/garten/` | Zeichenlogik und Berechnungsregeln (Töpfe-mit-Gesichtern etc.) |
| `daten/` | Import-Skripte, Sicherungen |
| `Referenz/annes-pflanzenparadies/` | Prinzipien-Referenz, kein Code, nicht verändern |

```bash
npm run dev            # lokale Vorschau mit lokaler Datenbank
```
