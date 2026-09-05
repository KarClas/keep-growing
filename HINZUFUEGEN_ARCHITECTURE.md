# Architektur: Pflanze Hinzufügen (2-Schritte-Prozess)

Dieses Dokument beschreibt die Architektur der überarbeiteten **Hinzufügen-Sektion** in *keep-growing*. Der Prozess zum Anlegen eines neuen Pflanzenprofils gliedert sich in zwei aufeinanderfolgende Schritte und nutzt eine direkte KI-Fotoanalyse.

---

## 1. Übersicht des 2-Schritte-Prozesses

Der Erfassungsprozess gliedert sich in zwei Phasen:

```
┌─────────────────────────────────────────────────────────────┐
│ Schritt 1: Fotoaufnahme & Erkennung (/hinzufuegen)          │
│ Sucher / Foto aufnehmen / Datei ──► Vision-Modell           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Übergabe per Query-Parameter
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Schritt 2: Einstellung des Profils (/hinzufuegen/schritt-2) │
│ Boilerplate-Icon ──► Prüfung/Editierung ──► Profil anlegen  │
└─────────────────────────────────────────────────────────────┘
```

### Schritt 1: Fotoaufnahme & Erkennung (`/hinzufuegen`)
- **Komponente**: `app/hinzufuegen/page.tsx` rendert `KameraHinzufuegen` als primären Zustand.
- **Funktion**: Der Nutzer nimmt ein Foto über den Kamerasucher auf (oder wählt eine Bilddatei). Das Foto wird an den internen Endpunkt `POST /aktionen/erkennen` gesendet und direkt über das Vision-Modell (`qwen3.8-flash-next`) analysiert.
- **Ergebnis**: Nach der Analyse wird das strukturierte Datenpaket an Schritt 2 weitergeleitet (`/hinzufuegen/schritt-2?art=...`).

### Schritt 2: Einstellung des Profils (`/hinzufuegen/schritt-2`)
- **Komponente**: `app/hinzufuegen/schritt-2/page.tsx`
- **Funktion**: Kontroll-, Anpassungs- und Bestätigungsmaske vor dem Speichern in der lokalen SQLite-Datenbank.
- **Ergebnis**: Nach Betätigen von *„Das Profil anlegen“* wird die Pflanze mit den validierten Daten in der Datenbank angelegt und das Nutzerprofil direkt auf `/pflanze/[id]` weitergeleitet.

---

## 2. Direkte KI-Fotoanalyse

Die bisherigen externen Hilfsdienste (`id-plant-api` und `plant-details-api`) wurden abgelöst. Die Erkennung erfolgt direkt über das Vision-Modell in `lib/erkennung/vision.ts` über den Endpunkt `POST /aktionen/erkennen`.

### Strukturierte Modellausgabe (JSON):
```json
{
  "erkannt": true,
  "art": "Rosa chinensis",
  "giessrhythmus": 7,
  "duengenrhythmus": 14,
  "erde": "50% Typ-1-Erde, 30% Typ-2-Erde, 20% Typ-3-Erde",
  "licht": "Sonne",
  "ort": "draußen",
  "sicherheit": "hoch"
}
```

---

## 3. Felder und Formatierung in Schritt 2 (`Einstellung des Profils`)

Die Seite ist unter `app/hinzufuegen/schritt-2/page.tsx` implementiert.

### Gestaltungsgrundsätze:
1. **Mobile-First**: Optimiert für schmale Bildschirme im zentrierten Container (`max-w-md mx-auto`).
2. **Schlank & Schnörkellos**: Konsistentes Design ohne störende Animationen.
3. **Keine Platzhalter-Fehler („N/A“-Bereinigung)**: Werte wie `"N/A"`, `"none"` oder `"-"` werden aktiv gefiltert und bleiben leer.

### Elemente der Maske (von oben nach unten):

1. **Seitentitel**:
   - Text: `Einstellung des Profils` (zentriert, `text-2xl font-bold`).

2. **Pflanzen-Vorschau links & Licht-Symbol rechts oben**:
   - **Linksbündige Profil-Vorschau** mit dynamischem Hintergrund („Ich bleibe lieber drinnen“ & „Ich bleibe lieber draußen“):
     - Feststehendes Symbol der App (`TopfMitGesicht`), Zustand: zufrieden, Wuchsstufe: 2.
     - Vektor-Hintergründe: „Ich bleibe lieber drinnen“ vs. „Ich bleibe lieber draußen“.
     - Pfeile links und rechts: Wechseln den Hintergrund mit Wisch-Animation und Touch-Unterstützung.
     - Ersetzt das bisherige `Ort`-Feld vollständig.
   - **Licht-Symbol oben rechts**:
     - Ersetzt das bisherige sichtbare `Licht`-Textfeld vollständig.
     - Drei grafische Sonnen-Symbole im App-Stil (warm, ohne reinweiß):
       1. **Helle Sonne** (nur Umriss): `Sonne`
       2. **Dunkle Sonne** (voll gefüllt): `Schatten`
       3. **Halb dunkle, halb helle Sonne** (rechte Hälfte gefüllt): `Sonne oder Schatten` / `Sonne und Schatten` (Fallback: halb/halb).
     - Entspricht der KI-Erkennung und lässt sich durch Antippen zyklisch durchschalten (`Sonne` ──► `Schatten` ──► `Sonne oder Schatten`).
     - Wird als verstecktes Formularfeld (`<input type="hidden" name="licht" ... />`) an das Backend übertragen.

3. **Formularfelder**:
   - **Name (`name`)**:
     - Pflichtfeld (`required`, Label: `Name *`).
     - Standardmäßig immer leer (`defaultValue=""`), zeigt ausschließlich das Ghost-Template / Platzhalter `"Meine Schatzi"`.
   - **Art (`art`)**:
     - Vorbefüllt mit dem wissenschaftlichen Artnamen streng nach botanischer Nomenklatur (`art`, z. B. `"Rosa chinensis"`). Editierbar.
     - **Reload-Button daneben**: Bleibt gesperrt / ausgegraut, solange der Art-Wert unverändert ist. Wird freigeschaltet, sobald der Wert geändert wird (auch bei manueller Neueingabe). Beim Klick ruft das Modell mit dem Text-Prompt (`ART_ANWEISUNG`) die Pflegeparameter für die neue Art ab und überschreibt die übrigen Felder in-place (inkl. Hintergrundauswahl und Licht-Symbol).
   - **Gießrhythmus (`giessrhythmus`) & Düngrhythmus (`duengenrhythmus`)**:
     - Platzsparend nebeneinander in einer Zeile angeordnet (jeweils halbe Breite).
     - Zahlenfelder (`input type="number" min={1}`) mit nachgestellter Maßeinheit `"Tagen"`.
     - Fallbacks bei fehlender Angabe: Gießrhythmus `7`, Düngrhythmus `28`.
     - Harmonische Einbettung ohne weiße Hintergrundflächen (`bg-transparent` auf warmem Hintergrund).
   - **Erde (Erdemischung) (`erde`)**:
     - Klarer Textwert, vorbefüllt mit den empfohlenen Anteilen im Erdemix (z. B. `"50% Typ-1-Erde, 30% Typ-2-Erde, 20% Typ-3-Erde"`).
     - Fallback: Vollständig leer (ohne Phantom-Platzhaltertext).
   - **Notiz (`notiz`)**:
     - Standardmäßig immer leer (`defaultValue=""`), kann ausschließlich von der Nutzer:in manuell befüllt und editiert werden. Bleibt beim Klick auf den Reload-Button unberührt.

4. **Abschluss-Button**:
   - Beschriftung: `Das Profil anlegen`
   - Löst die Server-Aktion `profilSchritt2AnlegenAction` aus:
     - Legt Nutzer & Garten bei Bedarf automatisch an.
     - Ordnet `ort` dem internen Speicherformat (`drinnen` / `draussen`) zu.
     - Legt die Pflanze mit allen final editierten Daten in SQLite an.
     - Leitet direkt zur Profilseite `/pflanze/[id]` weiter.
