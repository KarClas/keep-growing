# keep-growing — Pflanzenwachstums-App für ein AI-Hackathon-Pitch

**Status:** Interview abgeschlossen, Referenz-Dateien ausgewertet, zwei
Korrekturen eingearbeitet (siehe unten). Dies ist die finale Fassung: Kontext,
Constraint Registry, ADR-Log, Entwürfe der Kontext-Dateien für das neue Projekt,
Umsetzungsplan. Quelle der Wahrheit für die Umsetzung.

---

## Context

Es existiert bereits `Annes Pflanzenparadies` (`/Users/flowmate/Annes Pflanzenparadies`),
eine Next.js-App für Annes Balkonpflanzen, hervorgegangen aus einem handgebauten
Claude-Artefakt. Sie dient **ausschließlich als Vorbild für Prinzipien und
Architektur** — ihr Code wird weder kopiert noch verändert (H1).

Der eigentliche Auftrag: Ein Team aus drei nicht sehr technischen Personen baut
auf einem AI-Hackathon (Beginn Freitag 21 Uhr, Pitch Sonntagnachmittag) eine
**mehrbenutzerfähige Pflanzenwachstums-App** in diesem Repository
(`keep-growing`). Anne bleibt die erste echte Nutzerin — ihre 36 Pflanzen
werden als echter Demo-Datensatz importiert (Dogfooding) — aber die App ist
für viele Nutzer:innen gedacht. Soll Annes Pflanzenparadies perspektivisch
ablösen.

Diese Session übernimmt: **Konten, mehrere Gärten pro Nutzer:in, den
Kern-Wachstums-Tracking-Loop, und Töpfe mit Gesichtern.** Zwei Teammitglieder
bauen parallel den **Pflanzen-Scanner** (Foto → Art + Pflegevorschlag per
KI-Bildanalyse); dieser Plan definiert nur die Schnittstelle dafür.

### Referenzmaterial

Unter `Referenz/annes-pflanzenparadies/` liegen sechs von Anne/KarClas
kuratierte Dokumente aus dem *aktuellen* Stand des Referenzprojekts (Stand
4. September 2026, **nicht** der ältere Code-Stand vom 3. August, den diese
Session zuerst gelesen hatte). Das dortige `README.md` markiert explizit, was
übertragbar ist und was nicht:

- **Direkt übertragbar:** `REGELN.md` (Fehlerbehandlung, Einfachheit, Umfang,
  Absicherung — an echtem Code festgemacht).
- **Als Vorbild für die Form, nicht den Inhalt:** `CLAUDE.md` (gestufter
  Kontext statt einer großen Datei), `MVP.md` (nachprüfbare Abnahmekriterien),
  `STACK.md` (die Begründungen, nicht die konkrete Auswahl).
- **Gilt unverändert:** `AGENTS.md` (Next.js 16 ist neuer als der
  Trainingsstand).
- **Nicht übertragbar, weil aus „genau eine Nutzerin" folgend:** Passwort für
  eine Person statt Mehrbenutzer-Anmeldung, Datenmodell ohne Personen-Bezug,
  **Fotos in der Datenbank halten — bei vielen Nutzer:innen die falsche Wahl.**
- **Bewusst nicht mitgeliefert:** Code, `wissen/` (Annes Pflegewissen — Quelle
  bei Bedarf für Pflegelogik), `daten/pflanzen.json` (vorgesehen als
  Demo-Datensatz, nicht ungefragt kopiert — Import ist eine eigene Entscheidung,
  siehe ADR-006).

**Die drei wichtigsten übertragenen Lehren (aus `README.md` des Referenzmaterials):**
1. Gestufter Kontext statt einer großen Anweisungsdatei — ein Verweis ohne
   Auslöser („bevor du X tust, lies Y") wird nicht befolgt.
2. Fehler dürfen nicht schweigen — ein still verlorener Eintrag ist schlimmer
   als eine Fehlermeldung.
3. Eine Schutzmaßnahme wird gegen genau den Fall geprüft, den sie verhindern
   soll — nicht allgemein „getestet".

---

## Korrekturen gegenüber dem ersten Planentwurf (Contradiction Protocol)

Diese zwei Punkte standen bereits im Plan, bevor die Referenz-Dateien kamen,
und werden hiermit ausdrücklich korrigiert statt still überschrieben:

| Was zuerst im Plan stand | Was die aktuellen Referenz-Dateien zeigen | Korrektur |
|---|---|---|
| ADR-007: Login per Google/E-Mail-Passwort, Empfehlung war ursprünglich GitHub-only | Referenzprojekt hat sich am 4.9. **gegen jede Fremdanmeldung** entschieden — Passwort, kein Google, kein GitHub, ausdrücklich um nicht an einen Anbieter gebunden zu sein | Auth.js **Credentials-Provider (E-Mail/Passwort)** wird die Grundlage, nicht Google. Siehe ADR-007 (überarbeitet) unten. |
| Fotos als Bytes in der Datenbank, „bekannte künftige Grenze" | Referenz-`README.md`: bei vielen Nutzer:innen **die falsche Wahl**, nicht nur eine spätere Grenze | Fotospeicherung wechselt auf einen Datei-/Blob-Dienst (Vercel Blob). Siehe ADR-011 unten. |

Nicht korrigiert, sondern bestätigt: Der Stack (Next.js/Postgres/Drizzle/Vercel)
bleibt, aber mit der im Referenzprojekt bereits erprobten
Anbieter-Unabhängigkeits-Disziplin (neutraler Treiber, `output: 'standalone'`)
— siehe ADR-009 (überarbeitet) und den Abschnitt „Warum Neon/Vercel keine
Bindung sind" unten.

**Dritte Korrektur (nach Auswertung der Referenz-Dateien, direkt vom Nutzer
präzisiert):** Das MVP dieser Session ist **lokal-fertig, nicht live-fertig**
— exakt die Trennung, die das Referenzprojekt selbst zieht („Der Livegang
gehört bewusst nicht dazu"). Passwort-Anmeldung gehört **nicht** zum MVP.
Siehe ADR-013 und den überarbeiteten `MVP.md`-Entwurf unten.

---

## Constraint Registry

**Hard Constraints:**
- **H1:** Annes Pflanzenparadies wird nicht verändert oder als Codebasis
  kopiert — Prinzipien-Referenz, auch für die neuen Referenz-Dateien.
- **H2:** Projekt lebt in diesem Repository (`keep-growing`).
- **H3:** Kein wiederkehrendes Budget; kleine nutzungsabhängige KI-Kosten
  (Vision-API für den Scanner) sind akzeptabel.
- **H4:** Pitch spätestens Sonntagnachmittag — feste Zeitgrenze.
- **H5:** Annes echte Pflanzendaten werden importiert, nicht erfunden.
- **H6:** Datenintegritätsregeln aus dem Referenzprojekt gelten (append-only
  Notizen, unveränderliche IDs, deaktivieren statt löschen, Sicherung vor
  Umbauten) — angepasst auf Mehrbenutzer-Kontext (pro Nutzer:in/Garten).
- **H7 (neu):** Mandantentrennung ist eine Sicherheitsanforderung, keine
  Komfortfrage — jede Abfrage filtert auf die eigene(n) Nutzer-/Garten-ID.
  Ein Zugriff auf fremde Daten wird mit derselben Schwere behandelt wie ein
  verschluckter Fehler: nie still, immer sichtbar blockiert.
- **H8 (neu):** Keine Bindung an einen Anbieter — neutraler Datenbanktreiber
  (`postgres.js`, nicht Neon-spezifisch), `output: 'standalone'`, damit ein
  Wechsel von Vercel/Neon jederzeit ein Handgriff bleibt, keine Neuarchitektur.

**Soft Constraints:**
- **S1:** MVP-Umfang für diese Session: Konten + mehrere Gärten + Kern-Tracking
  + Töpfe-mit-Gesichtern. Scanner (Team), „In liebevoller Erinnerung",
  Community/Teilen sind explizite spätere Phasen.
- **S2 (überarbeitet):** Login primär E-Mail/Passwort (Credentials-Provider);
  Google als optionaler Zusatz nur falls Zeit übrig bleibt, nicht als
  Voraussetzung.

**Boundary:**
- **B1:** Der Scanner selbst — Team baut ihn, diese Session liefert die
  Schnittstelle.
- **B2:** Community-/Teilen-Funktionen — privat by default, nicht für den
  Pitch geplant.

---

## Warum Neon/Vercel keine Bindung sind

Die Sorge „unnötige Abstraktion" ist berechtigt, wenn Neon/Vercel bedeuten
würde, Code zu schreiben, der nur dort läuft. Das Referenzprojekt zeigt den
Ausweg, der das vermeidet, ohne auf die Geschwindigkeit der beiden Dienste zu
verzichten:

- **Neutraler Treiber:** `postgres.js`, nicht Neons proprietärer Client. Jede
  PostgreSQL-Datenbank funktioniert damit — ein Wechsel ist Export/Import,
  keine Code-Änderung.
- **`output: 'standalone'`:** Next.js baut sich zu einem Paket, das mit
  `node server.js` überall läuft, wo Node läuft — nicht nur bei Vercel.
- Damit ist Neon/Vercel für diese 30 Stunden die **schnellste Startposition**,
  keine Festlegung. Der Wechsel ist dokumentiert und günstig (siehe `STACK.md`-
  Entwurf unten, Tabelle „Wo die Ausgänge liegen").

Ein Verzicht auf Neon/Vercel *ganz* (z. B. ein VPS mit SQLite) wäre in der
gegebenen Zeit ein neues Risiko: kein Server-Management-Erfahrung im Team,
keine Zeit für Backups/Neustarts von Hand. Die dokumentierte Austrittsstelle
löst die Abstraktions-Sorge günstiger als ein Plattformwechsel unter
Zeitdruck.

---

## Entscheidungen (ADR-Log)

**ADR-001 — Kein Fork/keine Kopie von Annes Pflanzenparadies**
Optionen: (a) Codebasis kopieren, (b) nur Prinzipien übernehmen.
**Entscheidung:** (b). **Begründung:** Ausdrücklicher Nutzerwunsch.

**ADR-002 — Projekt lebt in `keep-growing`**
**Entscheidung:** dieses Repo. **Begründung:** Bereits leer unter diesem Namen
angelegt, vom Nutzer bestätigt.

**ADR-003 — Mehrbenutzer-Architektur statt Einzel-Eigentümerin**
**Entscheidung:** Konten mit je eigenen Gärten, `nutzer_id`/`garten_id` von
Anfang an im Datenmodell. **Begründung:** Nutzerwunsch — Dogfooding mit Annes
Daten bei produktförmigem Anspruch. **Folge:** teuerste Fehlentscheidung, die
sich in 30 Stunden nicht mehr nachträglich reparieren ließe — deshalb zuerst
gebaut.

**ADR-004 — Scope-Schnitt für den Hackathon**
**Entscheidung:** Konten, mehrere Gärten, Kern-Wachstumstracking, Töpfe mit
Gesichtern. Scanner beim übrigen Team. „In liebevoller Erinnerung" und
Community/Teilen verschoben. **Begründung:** Nutzerentscheidung nach Abwägung
von 30 Stunden gegen sechs Feature-Säulen.

**ADR-005 — Team-Schnittstelle: ein Repo, eine Datenbank**
**Entscheidung:** Ein Next.js-Projekt/eine Postgres-DB. Scanner ruft eine
Funktion `pflanzeAusErkennungAnlegen` auf (Foto + optional erkannte Art,
Gießrhythmus, Düngerhythmus, Lichtbedarf → legt Pflanze im aufrufenden Garten
an). **Begründung [E]:** Zwei getrennte Dienste kosten ein nicht sehr
technisches Team unter Zeitdruck mehr Stunden (Deployments, CORS,
Auth-Handshake) als sie sparen.

**ADR-006 — Demo-Daten: Import von Annes echten Pflanzen**
**Entscheidung:** Import aus `Referenz/annes-pflanzenparadies` bzw. den
Originaldaten (nur lesend, H1 bleibt gewahrt — Import kopiert Daten, nicht
Code). **Begründung:** Glaubwürdige Demo, erster Dogfooding-Schritt.

**ADR-007 — Login: E-Mail/Passwort als Grundlage (überarbeitet)**
Optionen: (a) GitHub-only, (b) Google, (c) E-Mail/Passwort (Auth.js
Credentials-Provider).
**Entscheidung:** (c), mit Google als optionalem Zusatz falls Zeit bleibt.
**Begründung [E], korrigiert:** Die aktuellen Referenz-Dateien zeigen, dass
sich das Referenzprojekt bewusst gegen jede Fremdanmeldung entschieden hat, um
nicht an einen Anbieter gebunden zu sein. Für keep-growing kommt ein
praktischer Vorteil dazu: kein Google-Cloud-Console-Setup (OAuth-Client,
Consent Screen) nötig, das in einem 30-Stunden-Fenster selbst zehn bis
fünfzehn Minuten wert ist. Auth.js unterstützt mehrere Provider gleichzeitig
— Google lässt sich später ergänzen, ohne die Grundlage zu ändern.

**ADR-008 — Sprache: Deutsch**
**Entscheidung:** Deutsch, durchgehend. **Begründung:** Ausdrücklicher
Nutzerwunsch trotz Hackathon-Kontext.

**ADR-009 — Tech-Stack (überarbeitet mit Anbieter-Unabhängigkeit)**
**Entscheidung:** Next.js (App Router, `output: 'standalone'`) · PostgreSQL
über Neon als Startpunkt, Zugriff über `postgres.js` (neutraler Treiber) ·
Drizzle · Auth.js (Credentials, optional Google später) · Vercel zum Start.
**Begründung [L]:** Erprobter Stack, jetzt mit der im Referenzprojekt bereits
gefundenen Anbieter-Unabhängigkeits-Disziplin — löst die Abstraktions-Sorge,
ohne die Geschwindigkeit von Neon/Vercel für die ersten 30 Stunden aufzugeben.

**ADR-010 — Scanner nutzt LLM-Vision-Aufruf**
**Entscheidung:** Vision-fähiger LLM-Aufruf statt dedizierter Plant-ID-API.
Betrifft das Scanner-Team (B1) — hier nur dokumentiert, damit die Schnittstelle
(ADR-005) dazu passt.

**ADR-011 — Fotospeicherung: Datei-/Blob-Dienst statt Bytes in der Datenbank (neu)**
Optionen: (a) Bytes in Postgres wie im Referenzprojekt, (b) Vercel Blob
(Datei-Speicher, in Vercel integriert), (c) externer Objektspeicher (S3 o. ä.).
**Entscheidung:** (b) Vercel Blob.
**Begründung [E]:** Die Referenz-Dateien selbst nennen Bytes-in-der-Datenbank
explizit als **falsche Wahl bei vielen Nutzer:innen** — nicht nur als
spätere Grenze. Mit mehreren Nutzer:innen und mehreren Gärten wächst das
Fotoaufkommen linear mit der Nutzerzahl, nicht mit einer Person. Vercel Blob
ist dieselbe Kategorie „ein Dienst weniger zu verwalten" wie Neon (selbes
Vercel-Dashboard, kein neues Konto, kein Bucket-Rechte-Gefrickel wie bei
rohem S3) — die Korrektur kostet also keine zusätzliche Anbieter-Komplexität.
Die Datenbank speichert nur die URL/Referenz, nicht die Bilddaten.

**ADR-013 — MVP-Abgrenzung: lokal-fertig statt live-fertig (neu, vom Nutzer präzisiert)**
Optionen: (a) MVP schließt Passwort-Anmeldung + Cloud-DB + Hosting ein
(ursprünglicher Planentwurf), (b) MVP endet bei „läuft vollständig lokal,
bereit für die Umstellung auf Cloud-DB und Hoster" — Anmeldung, Cloud-Umzug
und Deployment sind ein eigener, nachgelagerter Schritt.
**Entscheidung:** (b).
**Begründung:** Nutzerkorrektur, deckt sich mit der eigenen Trennung des
Referenzprojekts zwischen „fertigbauen und lokal prüfen" und „Livegang" —
dort ausdrücklich als zwei getrennte Phasen behandelt, nicht vermischt.
**Folge für Mandantentrennung (H7):** Die MVP-Verifikation von H7 braucht
keine echte Passwort-Prüfung. Ein einfacher lokaler Mechanismus — aus
vorab angelegten Test-Nutzer:innen (inkl. Anne) auswählen, ohne Passwort —
reicht, um zu beweisen, dass die Datenschicht Gärten sauber trennt. Echte
Auth.js-Anmeldung mit Passwort (ADR-007 bleibt als Ziel-Entscheidung bestehen)
wird zum ersten Schritt der Go-Live-Phase, **nicht** zum MVP selbst — die
Reihenfolge des Referenzprojekts kehrt sich hier bewusst um: dort war
Anmeldung Teil des MVP, weil Annes Anwendung sofort netzerreichbar sein
sollte; keep-growings MVP bleibt bewusst lokal.

**ADR-014 — In liebevoller Erinnerung ins MVP aufgenommen (Nutzerkorrektur, hebt Teil von ADR-004/S1 auf)**
Vorheriger Stand: „In liebevoller Erinnerung" war ausdrücklich auf „später,
falls Zeit bleibt" verschoben (ADR-004, S1).
**Neuer Stand:** Nutzer beschreibt den Bereich als festen Bestandteil des
Home-Bildschirms (unterhalb der alphabetischen Pflanzenliste) — gestorbene
Pflanzen als kleine Engel mit Heiligenschein auf einer Wolke, glücklich
dargestellt.
**Entscheidung:** In den MVP-Kernbau dieser Session aufgenommen, per
ausdrücklicher Bestätigung auf Nachfrage (nicht die Zwischenoption „Platz
reservieren, später füllen").
**Folge:** `MVP.md` „Zu bauen" ergänzt, `MVP.md` „nicht drin"-Tabelle
bereinigt. `DATEN.md`-Regel „Pflanzen werden deaktiviert statt gelöscht"
wird präzisiert: der Status ist keine reine Sichtbarkeits-Schaltung mehr,
sondern ein Lebenszustand mit eigener, positiv gestalteter Darstellung
(„lebend" / „verstorben"), da verstorbene Pflanzen weiterhin sichtbar sind —
nur an anderer Stelle und anders gezeichnet.

**ADR-015 — Scanner-Umfang dieser Session bestätigt: nur UI/Formular**
**Entscheidung:** Diese Session baut Kamera-Aufnahme, manuelles Hinzufügen,
Rückfragen (drinnen/draußen, aktuelle Größe) und die Anbindung an
`pflanzeAusErkennungAnlegen`. Die eigentliche KI-Bilderkennung (Art, Erde,
Licht, Gießbedarf aus dem Foto ableiten) bauen die zwei anderen
Teammitglieder (B1, ADR-005 bleibt unverändert gültig) — bestätigt auf
Nachfrage, keine Scope-Erweiterung dieser Session.

**ADR-016 — Zwei getrennte Pflanzenzustände: Wuchsstufe (dauerhaft) und
Pflegestimmung (tagesaktuell)**
Nutzerbeschreibung: die digitale Pflanze soll bei jeder der drei
Kern-Aktionen (Gießen, Düngen, Ernten) sichtbar „mitwachsen" — UND das
Topf-Gesicht soll je nach aktuellem Pflegezustand zufrieden bis sehr traurig
aussehen. Das sind zwei unabhängige Werte, nicht einer:
- **Wuchsstufe:** kumulativ, steigt mit jeder Pflegehandlung, sinkt nie —
  analog zur `wuchsPunkte`/`wuchsStufe`-Mechanik aus dem Referenzprojekt.
  Sitzt auf der Pflanzenzeichnung selbst.
- **Pflegestimmung:** tagesaktuell, berechnet aus „Zeit seit letzter Pflege"
  vs. „Bedarf" — kann sich verschlechtern, wenn eine fällige Handlung
  ausbleibt. Sitzt auf dem **Topf**, nicht auf der Pflanze (ausdrücklicher
  Nutzerhinweis).
**Entscheidung:** Beide Werte werden getrennt im Datenmodell geführt.
**Begründung [L]:** Folgt direkt aus der Nutzerbeschreibung; vermeidet, dass
ein einzelner überfälliger Tag die gesamte Wachstumshistorie zurücksetzt —
das wäre demotivierend und widerspräche dem Ziel „gutes Gefühl beim
Kümmern, aber nicht bestraft für einen verpassten Tag rückwirkend auf allen
Fortschritt".

**ADR-017 — Emotionales Design ist Erfolgskriterium, nicht Optik-Anmerkung**
Nutzerzitat: „Ich will mich gut fühlen, wenn ich die Pflanzen bekümmere und
schuldig, wenn ich das nicht tue." Ausdrücklich als Abgrenzung zu
bestehenden Pflanzen-Trackern genannt.
**Entscheidung:** Als nachprüfbares Kriterium in `MVP.md` aufgenommen, nicht
nur als Stilhinweis in `STACK.md`. **Folge:** Design-Entwürfe (vom Team
angekündigt) werden gegen dieses Kriterium geprüft, nicht nur gegen
Funktionalität.

**ADR-012 — Design: leichtes Utility-CSS statt eigenem Stylesheet (neu)**
Optionen: (a) eigenes CSS wie im Referenzprojekt, (b) Utility-Framework
(z. B. Tailwind).
**Entscheidung:** (b).
**Begründung [L], bewusste Abweichung vom Referenzprojekt (Rule 6 statt
Vermischung):** Im Referenzprojekt war eigenes CSS richtig, weil Annes
handgemachte Gestaltung bereits existierte und ein Framework nur Fremdstil
darüber gelegt hätte. keep-growing hat **kein** vorhandenes Artefakt (S1) —
hier gibt es nichts zu schützen, aber drei Personen, die in 30 Stunden eine
benutzbare Oberfläche brauchen. Ein Utility-Framework ist hier Geschwindigkeit,
kein Fremdstil-Risiko. Wird die Marke/Optik später eigenständig, ist das ein
bewusster späterer Schritt, kein Rückbau.

---

## Kontext-Dateien für keep-growing (gestufter Aufbau, „Harness Engineering")

Prinzip aus dem Referenzmaterial: ein schlanker Einstiegspunkt, der Nachschlagen
statt Auswendiglernen erzwingt — Verweise nur, wo ein konkreter Auslöser sie
aktiviert. Wird nach Planfreigabe als echte Dateien im Repo-Wurzelverzeichnis
angelegt.

### `AGENTS.md` (unverändert übernommen)

```markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may
all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation
notices.
<!-- END:nextjs-agent-rules -->
```

### `CLAUDE.md` (Entwurf, Ziel < 130 Zeilen)

Struktur, angepasst aus dem Referenzprojekt:
1. `@AGENTS.md`-Import.
2. Ein-Satz-Beschreibung: mehrbenutzerfähige Pflanzenwachstums-App,
   Hackathon-Kontext, Team von drei, Anne als erste Dogfooding-Nutzerin, Ziel:
   Annes Pflanzenparadies perspektivisch ablösen. Sprache: Deutsch.
3. „Wie du mit dem Team arbeitest" (generalisiert aus „Wie du mit Anne
   arbeitest"): Team ist nicht sehr technisch, Produktentscheidungen bei
   ihnen, technische bei Claude Code, nichts erfinden, „fertig" heißt geprüft,
   Zwischenstände nach jedem größeren Schritt, ein Gedanke pro Absatz.
4. „Drei Dinge, die du nie übergehst":
   - Datenintegrität — vor `daten/`, `lib/db/`, Skripten: `DATEN.md` lesen.
   - **Mandantentrennung (H7)** — jede Aktion prüft die eigene(n)
     Nutzer-/Garten-ID, nicht nur den Anmeldestatus.
   - Scope-Disziplin — der MVP-Schnitt aus `MVP.md` gilt; Erweiterungen werden
     vorgeschlagen, nicht einfach gebaut.
5. „Wo nachschlagen"-Tabelle: `REGELN.md` (vor Code), `DATEN.md` (vor
   Daten/Modell/Skripten), `STACK.md` (vor Abhängigkeit/Dienst/Hoster-Wechsel),
   `node_modules/next/dist/docs/` (vor App-Code), `MVP.md` (für Umfang/
   Abnahme), `Referenz/annes-pflanzenparadies/` (für Prinzipien-Fragen).
6. „Stand und Ziele": Hackathon-Phasenplan (siehe Umsetzungsplan unten, kurz
   zusammengefasst), explizit ausgeschlossen: Scanner (Team), Erinnerungs-
   Bereich, Community — mit Datum der Verschiebung.
7. „Entschieden"-Tabelle: Mehrbenutzer, privat by default, Anne als
   Dogfooding-Konto, Login-Modell (ADR-007), Stack (ADR-009), Repo.

### `REGELN.md` (Entwurf — größtenteils direkt übernommen, plus ein neuer Abschnitt)

Übernommen wie im Referenzprojekt: Abschnitt 1 „Fehler" (verbotene
`catch`-Muster, jedes `catch` behandelt sichtbar oder wirft mit mehr Kontext
weiter), Abschnitt 2 „Einfachheit" (nichts auf Verdacht bauen, keine
Abstraktion vor dem zweiten Verwender, vor dem Schreiben lesen ob es die
Funktion schon gibt, kein toter Code), Abschnitt 3 „Umfang" (drei Fragen vor
jeder Erweiterung: gewollt? kleinstmöglich? welche Dauerlast?), Abschnitt 4
„Absicherung" (fertig heißt ausgeführt und angesehen, Schutzmaßnahmen gegen
den Fall prüfen, den sie verhindern sollen, `tsc --noEmit`/`lint`/`build` vor
jedem Commit).

**Neuer Abschnitt 5 — Mandantentrennung:**
> Jede lesende und schreibende Aktion filtert auf die Nutzer-/Garten-ID der
> angemeldeten Person. Ein Zugriff auf fremde Daten ist kein Kantenfall,
> sondern derselbe Fehlertyp wie ein verschlucktes `catch` — er wird sichtbar
> blockiert, nie still durchgelassen. Tests für Berechnungsregeln (Wuchsstufen,
> Pflegezustand der Töpfe) schließen mindestens einen Fall „fremder Garten,
> eigene Anfrage" ein.

### `DATEN.md` (Entwurf)

Übernommene Regeln (angepasst auf Mehrbenutzer): IDs unveränderlich, Pflanzen
werden deaktiviert statt gelöscht, Notizfelder nur ergänzt, neue Felder
defensiv ausgelesen, Sicherung vor jedem Modell-Umbau. **Neu:** Regeln gelten
**pro Garten**, nicht global — eine Sicherung/ein Import darf nie über
Gartengrenzen hinweg zusammenführen. Eigener Abschnitt zum Anne-Import: Quelle
`Referenz/annes-pflanzenparadies` bzw. Originaldaten, einmaliger, sorgfältiger
Vorgang, ursprüngliche Pflanzen-IDs nach Möglichkeit erhalten (falls je ein
Abgleich mit Annes Pflanzenparadies nötig wird). **Fotoregel korrigiert:**
Fotos liegen nicht in der Datenbank (ADR-011) — die Datenbank hält nur die
Referenz/URL zum Blob-Speicher.

### `STACK.md` (Entwurf)

Tabelle „Entscheidungen" nach ADR-009/ADR-011/ADR-012 mit Begründungen analog
zum Referenzformat. Tabelle „Bewusst nicht dabei": Bytes-in-DB für Fotos
(ADR-011), eigenes CSS ohne Framework (ADR-012, umgekehrte Begründung zum
Referenzprojekt), Benachrichtigungen (kein Nutzerwunsch geäußert, Default aus
dem Referenzprojekt übernommen bis widersprochen). Tabelle „Wo die Ausgänge
liegen": anderer Hoster (gering, `DATABASE_URL`/`AUTH_SECRET` umziehen, Build
läuft ohne Next.js-Werkzeuge dank `standalone`), andere Datenbank (gering,
normales PostgreSQL), anderer Blob-Speicher (eine Datei, analog zu `/bild/<id>`
im Referenzprojekt).

### `MVP.md` (Entwurf, überarbeitet nach ADR-013)

**Ziel in einem Satz:** Die Anwendung läuft **vollständig lokal** mit einer
lokalen Datenbank, mehrere Nutzer:innen können je eigene Gärten mit Pflanzen
anlegen und deren Wachstum mit Fotos dokumentieren — und ist strukturell
bereit, die lokale Datenbank gegen eine Cloud-Datenbank zu tauschen und bei
einem Hoster zu laufen. **Die Umstellung selbst (Cloud-DB, Deployment, echte
Passwort-Anmeldung) gehört bewusst nicht zum MVP** — analog zur Trennung im
Referenzprojekt zwischen „fertigbauen und lokal prüfen" und „Livegang".

**Nachprüfbare Abnahmekriterien:**
1. Zwei verschiedene lokale Test-Nutzer:innen (ohne Passwort ausgewählt, siehe
   ADR-013) sehen ausschließlich ihre eigenen Gärten — auch über direkte
   Anfragen, nicht nur über die Oberfläche (H7).
2. Anne als Test-Nutzerin zeigt nach dem Import alle 36 Pflanzen mit intakten
   Kern-Pflegedaten.
3. Ein neuer Wachstumseintrag mit Foto erscheint sofort im Verlauf der
   jeweiligen Pflanze; schlägt das Speichern fehl, erscheint eine Meldung,
   kein Erfolg wird vorgetäuscht (aus `REGELN.md` Abschnitt 1).
4. Ein Topf zeigt sichtbar unterschiedliche Gesichter (fröhlich/neutral/
   traurig) abhängig vom berechneten Pflegezustand.
5. `npm run dev` startet die Anwendung mit einer lokalen Datenbank; die
   Datenbankverbindung ist so gebaut, dass ein Wechsel auf eine Cloud-DB nur
   eine geänderte `DATABASE_URL` erfordert, keine Code-Änderung (H8).
6. `output: 'standalone'` ist gesetzt — die Anwendung ließe sich mit
   `node server.js` betreiben, ohne an Vercel gebunden zu sein.

**Bewusst nicht im MVP:**

| Nicht im MVP | Warum, und wann dann |
|---|---|
| Echte Passwort-Anmeldung (Auth.js Credentials) | Erst nötig, sobald die Anwendung netzerreichbar wird — erster Schritt der Go-Live-Phase (ADR-013). |
| Cloud-Datenbank (Neon), tatsächliches Deployment | Bewusst getrennt von „fertigbauen und lokal prüfen" — Go-Live-Phase, nach dem MVP. |
| Scanner | Baut das übrige Team (B1). |
| „In liebevoller Erinnerung" | Verschoben (S1). |
| Community/Teilen | Verschoben (B2). |
| Erinnerungen/Benachrichtigungen | Kein Nutzerwunsch geäußert. |

**Go-Live-Phase (nach dem MVP, vor dem Pitch):** Cloud-DB anbinden
(`DATABASE_URL` austauschen, siehe Abnahmekriterium 5), Auth.js
Credentials-Provider scharfschalten (ADR-007), auf Vercel deployen. Getrennt
vom MVP, damit ein Deployment- oder OAuth-Problem nicht den Kern-Feature-Bau
blockiert.

---

## Interview-Protokoll (Q&A) — vollständig

*(unverändert aus der vorherigen Fassung erhalten, siehe Versionsverlauf des
Dokuments — Domäne/Zielperson/Ort/Umfang/Ressourcen/Team-Schnittstelle/Demo/
Sprache/Login wie zuvor protokolliert. Ergänzt:)*

**Nach Auswertung der Referenz-Dateien:**
- F: Wie „openai harness engineering principles" umsetzen? → Gestufter Kontext
  (schlanker Einstieg + Verweise mit Auslöser), wie im Referenzprojekt bereits
  erprobt — siehe Abschnitt „Kontext-Dateien" oben.
- Korrektur Login (ADR-007) und Fotospeicherung (ADR-011) wie oben begründet,
  nicht erneut abgefragt — beide direkt durch die mitgelieferten Referenz-
  Dateien belegt, technische Entscheidungen liegen laut eigener Geschäftsregel
  2 bei Claude Code.

---

## Offene Annahmen

- **Angenommen:** Die zwei anderen Teammitglieder haben noch keinen Code für
  den Scanner geschrieben — Schnittstelle aus ADR-005 lässt sich reibungslos
  festlegen. *(Beim ersten Sync verifizieren.)*
- **Angenommen:** Töpfe-mit-Gesichtern werden regelbasiert berechnet
  (Zeit-seit-Pflege vs. Bedarf), kein KI-Aufruf nötig — analog zur
  zustandslosen Zeichenlogik im Referenzprojekt.
- **Angenommen:** Google als zusätzlicher Login-Provider ist ein Stretch-Goal,
  kein Muss — falls das Team das anders sieht, bitte vor Phase A sagen.
- **Angenommen:** Annes Garten-Wissen (`wissen/` im Original) wird nicht
  kopiert, außer die App braucht konkrete Pflegelogik (Gießrhythmen etc.) —
  dann als Quelle zitieren, nicht ungefragt übernehmen (Referenz-README).

---

## Umsetzungsplan (Freitag 21 Uhr → Sonntag Pitch)

**Phase A — Freitagabend (~2 Std.), MVP-Grundgerüst, rein lokal:**
1. `AGENTS.md`, `CLAUDE.md`, `REGELN.md`, `DATEN.md`, `STACK.md`, `MVP.md` aus
   den Entwürfen oben als echte Dateien anlegen.
2. Next.js-Projekt scaffolden (`output: 'standalone'` von Anfang an, H8),
   Ordnerstruktur analog Referenzprojekt.
3. Datenmodell v1 in Drizzle: `nutzer`, `garten`, `pflanze` (`aktiv`-Status,
   unveränderliche `id`, `garten_id`-Fremdschlüssel), `wachstumseintrag`.
   Lokale Postgres-Instanz, `DATABASE_URL` als einzige Stelle, die später auf
   Neon zeigt (MVP-Kriterium 5).
4. Einfacher lokaler Test-Nutzer-Wechsler ohne Passwort (ADR-013) — genug, um
   Sitzungs-/Mandanten-Kontext für H7 zu haben, kein Auth.js nötig für die
   MVP-Phase.

**Phase B — Samstag (Hauptbau-Tag), weiter rein lokal:**
5. CRUD für Gärten/Pflanzen, Kern-Wachstumstracking (Eintrag mit Foto/Notiz,
   Verlauf).
6. Fotos zunächst lokal ablegen (Dateisystem oder lokaler Blob-Emulator) mit
   derselben Schnittstelle, die später auf Vercel Blob zeigt (ADR-011) —
   Wechsel bleibt eine Konfigurationszeile, kein Umbau.
7. Töpfe-mit-Gesichtern: regelbasierte Berechnung + einfache SVG-Zeichnung.
8. Importskript für Annes echte Daten (nur lesend aus dem Referenzprojekt),
   Sicherung vor dem ersten Lauf.
9. Schnittstellenfunktion `pflanzeAusErkennungAnlegen` für das Scanner-Team
   bereitstellen, mit ihnen abstimmen (offene Annahme oben verifizieren).
10. **MVP-Kontrollpunkt:** alle sechs Abnahmekriterien aus `MVP.md` lokal
    geprüft, bevor die Go-Live-Phase beginnt.

**Phase C — Go-Live (Samstagabend/Sonntagvormittag), erst jetzt Cloud/Deployment:**
11. `DATABASE_URL` auf Neon umstellen (über die Vercel-Integration
    provisioniert, Zugriff weiter über `postgres.js`), Daten einmalig
    umziehen.
12. Auth.js Credentials-Provider scharfschalten (ADR-007), Test-Nutzer-Wechsler
    ablösen.
13. Auf Vercel deployen, Vercel Blob für Fotos anschließen (ADR-011).
14. „In liebevoller Erinnerung" (günstig dank Status-Feld), falls Zeit bleibt.
15. Integration mit dem fertigen Scanner-Teil, sobald verfügbar.
16. Politur, Demo-Skript komplett durchspielen — jetzt gegen die echte
    Live-Umgebung, nicht nur lokal.

**Phase D — Sonntag vor dem Pitch:**
17. Feature-Freeze, Enddemo mehrfach testen, Pitch-Argumente an die
    Geschäftsregeln anbinden (Datenintegrität/Mandantentrennung als
    Vertrauensargument).

**Nicht in diesem Fenster geplant:** Community-/Teil-Funktionen (B2).

**Warum diese Reihenfolge:** Falls Neon/Vercel/Auth.js am Wochenende Ärger
machen (Kontolimits, OAuth-Konfiguration, Netzwerkprobleme), ist bis dahin
bereits eine vollständige, lokal vorführbare Anwendung fertig (Phase B). Der
Pitch ist damit nie vom Gelingen des Go-Live-Schritts abhängig — im Zweifel
wird lokal vom Laptop demonstriert, wie es auch beim Referenzprojekt zunächst
vorgesehen war.

---

## Verifikation

- **Nach Phase A:** App läuft lokal (`npm run dev`), lokaler Test-Nutzer-
  Wechsler funktioniert, Datenmodell mit `nutzer_id`/`garten_id` steht.
- **Nach Phase B (MVP-Kontrollpunkt, alle sechs Kriterien aus `MVP.md`):**
  Annes 36 Pflanzen sichtbar bei ihrer Test-Nutzerin, eine zweite
  Test-Nutzerin sieht sie **nicht** — auch nicht über direkte Anfragen
  (H7-Test), neuer Wachstumseintrag mit Foto erscheint im Verlauf, ein Topf
  zeigt unterschiedliche Gesichter je Pflegezustand, App liefe mit
  `node server.js` (H8).
- **Nach Phase C (Go-Live):** dieselben Kriterien gegen die echte Neon-DB und
  das Vercel-Deployment, jetzt mit echter Passwort-Anmeldung statt
  Test-Nutzer-Wechsler.
- **Vor dem Pitch:** kompletter Demo-Durchlauf ohne Fehler; ist der Scanner
  oder der Go-Live-Schritt nicht rechtzeitig fertig, wird das im Pitch klar
  als „in Arbeit" benannt statt improvisiert vorgetäuscht (Geschäftsregel
  „nichts erfinden") — die lokale MVP-Fassung aus Phase B ist der Rückfallplan.
