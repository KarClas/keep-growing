# Architektur: Pflanze Hinzufügen (2-Schritte-Prozess)

Dieses Dokument beschreibt die Architektur der überarbeiteten **Hinzufügen-Sektion** in *keep-growing*. Der Prozess zum Anlegen eines neuen Pflanzenprofils wird in zwei getrennte Schritte unterteilt und stützt sich auf zwei spezialisierte Feature-APIs.

---

## 1. Übersicht des 2-Schritte-Prozesses

Der Erfassungsprozess gliedert sich in zwei aufeinanderfolgende Phasen:

```
┌─────────────────────────────────────────────────────────────┐
│ Schritt 1: Fotoaufnahme & API-Erkennung                     │
│ Foto aufnehmen/wählen ──► id-plant-api ──► plant-details-api│
└──────────────────────────────┬──────────────────────────────┘
                               │ Vorbelegte Pflegedaten
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Schritt 2: Einstellung des Profils (Implementiert)          │
│ Boilerplate-Icon ──► Prüfung/Editierung ──► Profil anlegen  │
└─────────────────────────────────────────────────────────────┘
```

### Schritt 1: Fotoaufnahme & Erkennung (Vorgelagert)
- **Funktion**: Der Nutzer nimmt ein Foto der Pflanze auf (oder wählt ein Bild aus). Das Bild durchläuft die beiden APIs (erst Art-Identifikation, dann Pflege-Ermittlung).
- **Ergebnis**: Ein strukturiertes Datenpaket über Art, Gieß- und Düngeempfehlungen sowie Standort- und Lichtbedürfnisse wird an Schritt 2 übergeben.

### Schritt 2: Einstellung des Profils (Implementierter Schritt)
- **Funktion**: Kontroll-, Anpassungs- und Bestätigungsmaske vor dem Speichern in der lokalen Datenbank. Da KI- und Perenual-Treffer ungenau sein können (oder fehlende Werte aufweisen), prüft und korrigiert der Nutzer die Daten hier.
- **Ergebnis**: Nach Betätigen von *„Das Profil Anlegen“* wird die Pflanze mit den validierten Daten in der Datenbank angelegt und das Nutzerprofil direkt auf `/pflanze/[id]` weitergeleitet.

---

## 2. Die beiden Feature-APIs

Die Erkennung basiert auf zwei eigenständigen Python-HTTP-Diensten, die nacheinander (**sequentiell**) aufgerufen werden:

```
[ Bilddatei ]
     │
     ▼  POST /id-plant (Port 5005)
┌─────────────────────────────────────────────────────────────┐
│ 1. id-plant-api: Bild ──► Pflanzenname (Top-Kandidaten)     │
└─────────────────────────────────────────────────────────────┘
     │ Top-Guess: z. B. "Rose"
     ▼  POST /get-plant-details (Port 5006)
┌─────────────────────────────────────────────────────────────┐
│ 2. plant-details-api: Pflanzenname ──► Strukturierte Pflege │
└─────────────────────────────────────────────────────────────┘
     │ Strukturierte Daten
     ▼
[ Schritt 2: Formular ]
```

### API 1: Bild ──► Pflanze (`id-plant-api`)
- **Dienst**: `id-plant-api/server.py`
- **Port**: `5005`
- **Endpunkt**: `POST http://127.0.0.1:5005/id-plant`
- **Funktion**: Sendet das Bild an ein lokales Vision-Modell (`qwen3.8-flash-next`) und liefert die wahrscheinlichsten englischen Pflanzennamen.

#### Eingabeformat (JSON):
```json
{
  "image_path": "/Users/mk/Downloads/enjoy_05.jpg"
}
```

#### Ausgabeformat (JSON Array):
```json
[
  "Rosa chinensis",
  "Rosa × hybrida",
  "Rosa gallica",
  "Rosa × damascena",
  "Rosa moschata"
]
```

---

### API 2: Pflanze ──► Pflegedaten (`plant-details-api`)
- **Dienst**: `plant-details-api/server.py`
- **Port**: `5006`
- **Endpunkt**: `POST http://127.0.0.1:5006/get-plant-details` (oder `GET /get-plant-details?name=Rosa%20chinensis`)
- **Funktion**: Nimmt den Namen des obersten Treffers aus API 1 (z. B. `"Rosa chinensis"`), fragt die Perenual-Datenbank ab und liefert konkrete Pflegeparameter mit Fallbacks.

#### Eingabeformat (JSON):
```json
{
  "name": "Rosa chinensis"
}
```

#### Ausgabeformat (JSON):
```json
{
  "raw_name": "Rosa chinensis",
  "identified_name": "Rosa chinensis",
  "Giessrhythmus": "Bedarfsgerecht bei angetrockneter Erdoberfläche gießen (ca. alle 7–10 Tage)",
  "Duengenrhytmus": "Alle 2–4 Wochen von Frühjahr bis Spätsommer mit handelsüblichem Flüssigdünger",
  "Standort": "N/A",
  "Licht": "N/A",
  "Erde": "N/A",
  "perenual_id": null
}
```

---

## 3. Layout und Aufbau von Schritt 2 (`Einstellung des Profils`)

Die Seite ist unter `app/hinzufuegen/page.tsx` (und Alias `app/hinzufuegen/schritt-2/page.tsx`) implementiert.

### Gestaltungsgrundsätze:
1. **Mobile-First**: Optimiert für schmale Bildschirme im zentrierten Container (`max-w-md mx-auto`), bricht auf Desktop-Geräten nicht um oder ab.
2. **Schlank & Schnörkellos**: Kein Einsatz von Animationen, reines natives Scrolling.
3. **Keine Platzhalter-Fehler („N/A“-Bereinigung)**: Liefert die Datenbank/API leere Werte oder `"N/A"`, wird das entsprechende Eingabefeld in der UI vollständig leer gelassen — die Zeichenkette `"N/A"` wird aktiv herausgefiltert.

### Elemente der Maske (von oben nach unten):

1. **Seitentitel**:
   - Text: `Einstellung des Profils` (zentriert, `text-2xl font-bold`).

2. **Pflanzen-Vorschau (Boilerplate Icon)**:
   - Feststehendes Symbol der App (`TopfMitGesicht`), Zustand: zufrieden, Wuchsstufe: 2.
   - Reine Vorschau ohne Korrektur-/Austauschoption an dieser Stelle.

3. **Formularfelder**:
   - **Name (`name`)**:
     - Standardmäßig **leer** (`value=""`).
     - Enthält am Label einen kleineren grauen Hinweis in Klammern:
       `(Dein Wahl oder Mein <Art des Pflanzes>)`
     - Bleibt das Feld beim Absenden unberührt, vergibt die Server-Aktion automatisch den Namen `Mein <Art des Pflanzes>`.
   - **Art (`art`)**:
     - Vorbefüllt mit dem Wert `identified_name` (oder `raw_name`) aus den Eingabedaten. Editierbar.
   - **Gießrhythmus (`giessrhythmus`)**:
     - Vorbefüllt mit der Gießempfehlung (`Giessrhythmus`). Als Textfeld/Textarea editierbar.
   - **Düngrhythmus (`duengenrhythmus`)**:
     - Vorbefüllt mit dem Düngezyklus (`Duengenrhytmus`). Editierbar.
   - **Erde (Erdemischung) (`erde`)**:
     - Vorbefüllt mit dem Erdenvorschlag. War der API-Wert `"N/A"`, bleibt das Feld leer.
   - **Licht (`licht`)**:
     - Checklisten-Feld mit zwei Optionen: **`Sonne`** und **`Schatten`**.
     - Wird anhand der Ausgabe von `plant-details-api` (`Licht: "sun" | "shadow" | "any"`) automatisch vorausgewählt:
       - `"sun"`: Nur **`Sonne`** ist aktiviert.
       - `"shadow"`: Nur **`Schatten`** ist aktiviert.
       - `"any"`: Sowohl **`Sonne`** als auch **`Schatten`** sind aktiviert.
     - Nutzer:in kann die Häkchen nach Wunsch frei anpassen (eine Option oder beide).
   - **Notiz (`notiz`)**:
     - Freitextfeld für individuelle Notizen der Nutzer:in, optional wie bisher.

4. **Abschluss-Button**:
   - Beschriftung: `Das Profil Anlegen`
   - Löst die Server-Aktion `profilSchritt2AnlegenAction` aus:
     - Ermittelt/erstellt den aktiven Nutzer & Garten.
     - Berechnet bzw. parst die Gieß- und Düngetage für die Wachstumslogik.
     - Legt die Pflanze in SQLite an.
     - Leitet direkt zur Profilseite `/pflanze/[id]` weiter.
