# Technische Grundlage

Festgelegt während des Interviews (siehe `Plans/we-have-already-a-snug-quiche.md`
für den vollständigen ADR-Log). Format angelehnt an
`Referenz/annes-pflanzenparadies/STACK.md` — übernommen wurden die
Begründungen, nicht die konkrete Auswahl.

Vorgaben, aus denen die Entscheidungen folgen:
- **Null wiederkehrendes Budget**, kleine nutzungsabhängige KI-Kosten okay (H3)
- **Nicht an einen Anbieter gebunden** (H8) — ein Wechsel muss ein Handgriff
  bleiben, kein Umbau
- **30 Stunden Zeit**, Team aus drei nicht sehr technischen Personen
- **MVP ist lokal-fertig, nicht live-fertig** (ADR-013) — Cloud/Deployment ist
  ein eigener, späterer Schritt

---

## Die Entscheidungen

| Bereich | Gewählt | Warum |
|---|---|---|
| Gerüst | **Next.js** (App Router), **TypeScript**, `output: 'standalone'` | Erprobter Stack aus dem Referenzprojekt; `standalone` macht die Anwendung von Anfang an mit `node server.js` betreibbar, nicht nur bei Vercel. |
| Gestaltung | **Utility-CSS-Framework** (z. B. Tailwind) | Abweichung vom Referenzprojekt: dort schützte das Framework-Verbot eine bereits existierende Handarbeit. keep-growing hat kein vorhandenes Artefakt — hier zählt Geschwindigkeit für drei Personen in 30 Stunden (ADR-012). |
| Zeichnungen/Berechnung | **Eigene Module** in `lib/garten/` | Reine Berechnung ohne Zustand, wie im Referenzprojekt — überlebt jeden Umzug. |
| Datenbank | **PostgreSQL**, lokal für die MVP-Phase, **Neon** als Startpunkt für den Go-Live-Schritt | Gleiche Technologie lokal wie in der Cloud — ein Wechsel ist eine geänderte `DATABASE_URL`, kein Umbau. |
| Datenzugriff | **Drizzle** + Treiber **postgres.js** | Neutraler Treiber statt Neons proprietärem Client — jedes PostgreSQL tut es (H8). |
| Anmeldung (Go-Live, nicht MVP) | **Auth.js**, Credentials-Provider (E-Mail/Passwort) | Referenzprojekt hat sich bewusst gegen jede Fremdanmeldung entschieden, um nicht an einen Anbieter gebunden zu sein (ADR-007). Google optional später, kein Muss. |
| Fotos | **Datei-/Blob-Speicher**, referenziert per URL in der Datenbank | Bytes-in-der-Datenbank ist laut Referenzprojekt bei vielen Nutzer:innen die falsche Wahl (ADR-011). Lokal (MVP) eine einfache Ablage, ab Go-Live Vercel Blob — dieselbe Schnittstelle. |
| Verkleinern | **Im Browser**, vor dem Hochladen | Wie im Referenzprojekt — kein Bildwerkzeug auf dem Server nötig. |
| Betrieb (Go-Live, nicht MVP) | **Vercel** | Baut Next.js selbst, kein Konfigurationsaufwand; `standalone` hält den Ausgang offen. |
| Team-Schnittstelle (Scanner) | Eine Funktion `pflanzeAusErkennungAnlegen` im selben Repo/derselben DB | Zwei getrennte Dienste kosten unter Zeitdruck mehr Stunden (CORS, Auth-Handshake) als sie sparen (ADR-005). |

---

## Bewusst nicht dabei

| Verzichtet auf | Grund |
|---|---|
| Bytes-in-der-Datenbank für Fotos | Richtig für eine Nutzerin, falsch bei vielen (ADR-011). |
| Eigenes CSS ohne Framework | Umgekehrte Begründung zum Referenzprojekt: hier gibt es nichts Vorhandenes zu schützen, aber Zeitdruck (ADR-012). |
| Supabase-eigene Bibliotheken/Extras | Genau die Bindung, die H8 vermeiden soll — reines PostgreSQL wäre in Ordnung, die Extras nicht. |
| Separater Scanner-Dienst mit eigenem API-Vertrag | Mehr Setup-Aufwand als Nutzen in 30 Stunden (ADR-005). |
| Erinnerungen/Benachrichtigungen | Kein Nutzerwunsch geäußert; Default aus dem Referenzprojekt übernommen, bis widersprochen. |

---

## Wo die Ausgänge liegen

Damit die Wahl von Neon/Vercel eine Startposition bleibt, keine Festlegung:

| Wechsel | Aufwand | Was zu tun ist |
|---|---|---|
| Anderer Hoster | gering | `DATABASE_URL` und Auth-Geheimnis woanders eintragen. Der Bau läuft dank `standalone` ohne Next.js-spezifisches Vercel-Werkzeug. |
| Andere Datenbank | gering | Export/Import — es ist normales PostgreSQL über einen neutralen Treiber. |
| Anderer Datei-/Blob-Speicher | eine Datei | Nur die Stelle, die Foto-URLs erzeugt/liest, ändert sich. Der Rest der Anwendung kennt nur die Adresse — analog zu `/bild/<id>` im Referenzprojekt. |
| Google/weitere Login-Anbieter dazu | gering | Auth.js unterstützt mehrere Provider gleichzeitig; die Credentials-Grundlage bleibt unverändert. |
