# Gestaltung „Gartenregal" — Beschreibung

Stand: 6. September 2026. Entstanden im Gespräch mit dem Team (visuelle
Entwürfe unter `.superpowers/brainstorm/`, nicht eingecheckt). Diese Datei
beschreibt **was** die App aussehen und sich anfühlen soll, nicht wie es im
Code umgesetzt wird — das folgt im Umsetzungsplan.

Entschieden vom Team:

| Frage | Entscheidung |
|---|---|
| Stilrichtung | A „Gartenregal" (warmes Papier, Moosgrün, Terrakotta, Holzbretter) |
| Untere Leiste | „Home · Aufgaben · Neu" |
| Pflege-Knöpfe | Bonbon-Pastell: Himmelblau (Gießen), Mint (Düngen), **Gelb** (Ernten) |
| Pflanzenseite | kein „Wuchsstufe x von y" |
| Startseite | **kein Tagesgruß** |

---

## 1. Für wen, und für welche eine Aufgabe

Anne (und jede weitere Nutzerin) steht mit dem Handy am Balkon oder Fenster.
Die eine Aufgabe: **sehen, welche Pflanze jetzt Pflege braucht, und das mit
einem Tipp erledigen.** Alles andere (Pflanze anlegen, Ernte eintragen,
Steckbrief lesen) ist nachgeordnet und darf die Hauptaufgabe nie verdecken.

Erfolgskriterium aus `MVP.md` bleibt Maßstab: Gießen/Düngen/Ernten fühlt
sich niedlich an, ein überfälliger Topf ist am Gesicht erkennbar, ohne
Erklärung.

---

## 2. Informations- und Aktionshierarchie je Seite

Rangfolge: **entscheidend** (muss sofort ins Auge fallen) · **unterstützend**
(auf den zweiten Blick) · **Beiwerk** (klein oder weg).

### Home „Meine Lieblinge" (Überschrift, Team-Entscheidung vom 6. September; vorher „Mein Garten")

| Rang | Inhalt |
|---|---|
| entscheidend | Die Töpfe mit ihren Gesichtern, dreierweise auf Holzbrettern. Darüber ein Hinweis-Pille „2 Töpfe warten heute auf Wasser", die direkt zu **Aufgaben** führt. |
| unterstützend | Namen unter den Töpfen, Ernte-Vitrine (Glasbord mit Emoji-Symbolen, Überschrift etwas größer als andere Abschnittstitel). Über den Töpfen steht keine Überschrift „Meine Töpfe" mehr (Team-Entscheidung vom 6. September). |
| Beiwerk | „In liebevoller Erinnerung" ganz unten, ruhiger Ton; Überschrift gleich groß wie „Ernte-Vitrine". |
| entfällt | Tagesgruß. „Nutzer wechseln" (Team-Entscheidung: kein Link, kein Avatar-Knopf; die Seite `/start` bleibt per Adresse erreichbar). |

Reihenfolge der Töpfe bleibt stabil (wie heute), damit Anne ihre Pflanzen
am Platz wiedererkennt — kein Umsortieren nach Stimmung.

Leerer Garten: ein leeres Brett mit kurzem Satz und **einem** Knopf „Erste
Pflanze anlegen" (führt zu Neu).

### Pflanzenseite

| Rang | Inhalt |
|---|---|
| entscheidend | Großer Topf auf Brett (ohne Stimmungsschild — Team-Entscheidung vom 6. September, das Gesicht sagt es selbst). Darunter Name. Darunter die drei Pflege-Knöpfe. **Der heute fällige Knopf ist hervorgehoben** (kräftigere Füllung, kleines „fällig"-Etikett) — eine Region, eine Hauptaktion. |
| unterstützend | Untertitel nur Art · Standort. Steckbrief als Papierkarte (Erde, Licht, Gießen, Dünger, Notiz). Darunter eine Karte „Zuletzt gepflegt": zuletzt gegossen am (Datum), zuletzt gedüngt am (Datum), und nur wenn es schon eine Ernte gab, zuletzt geerntet am (Datum). Alle Werte gehören genau dieser Pflanze. Team-Entscheidung vom 6. September, die vollständige Liste war zu lang. |
| Beiwerk | „Als verstorben markieren" ganz unten als kleiner Textlink. **Neu: Rückfrage vor dem Ausführen** („Wirklich? Ja, sie ist gestorben / Abbrechen"), weil ein Fehltipp heute sofort wirkt. |
| entfällt | „Wuchsstufe x von y". |

### Aufgaben

| Rang | Inhalt |
|---|---|
| entscheidend | Überschrift „Heute dran" mit kleiner Datumszeile darüber. Abschnitt „Gießen" (Team hat die Überschriften auf „Gießen"/„Düngen" gekürzt) → Heute: jede Zeile mit kleinem Topf, Name, „seit 3 Tagen überfällig" oder „heute fällig", rechts ein **Kästchen zum Abhaken** (Team-Entscheidung: Kästchen statt Knopf; Tippfläche mindestens 44 px, Kästchen selbst ca. 28 px). |
| unterstützend | Ermutigungszeile „1 von 3 Töpfen schon versorgt". Gruppe „Morgen". Abschnitt „Düngen" gleich aufgebaut, mit Düngerart als Unterzeile. Erledigte Zeilen bleiben blass sichtbar mit gefülltem Kästchen. |
| Beiwerk | **Erntetagebuch** darunter, wie vom Team gebaut: Formular (Pflanze wählen — nur essbare —, Datum, Menge, Notiz, „Eintragen") in einer Karte, danach die Liste der Ernten, neueste zuerst, mit Symbol, Menge, Datum, Notiz und kleinem Löschen-Kreuz. Funktion bleibt, Aussehen kommt aus dem Bausatz. |

Leere Gruppe: ein kurzer Satz („Nichts offen."), kein leerer Kasten.

### Formulare (Start, Neu anlegen, Profil-Schritt 2, Ernte eintragen)

Ablauf und Felder bleiben, wie sie sind. **Insbesondere Profil-Schritt 2 von
Max** (Felder, Hintergrund-Wischer, Licht-Symbol, Pflegedaten-Nachladen,
Prüf- und Speicherlogik) wird funktional unverändert übernommen — nur die
optische Schicht (Farben, Schrift, Feld- und Knopfbausteine) kommt aus
dieser Gestaltung. Alle Formulare bekommen dieselben Bausteine
(Abschnitt 4): ein Feldaufbau, ein Knopfsatz, eine Karte. Drinnen/Draußen
wird ein zweiteiliger Schalter statt zweier Radioknöpfe. Pro Formular genau
**ein** gefüllter Hauptknopf, alles andere sekundär.

### Untere Leiste

Schwebende weiße Pille, „Home · Aufgaben · Neu", aktives Ziel in Moosgrün
mit gefülltem Symbol. Sicherer Abstand zum Handy-Rand bleibt.

---

## 3. Was weg, was zusammen

- **Weg:** Tagesgruß, Wuchsstufen-Zahl, „Nutzer wechseln" auf der
  Startseite, unterstrichene Zurück-Links in drei verschiedenen
  Schreibweisen.
- **Zusammen:** alle Zurück-Links werden ein Chip „‹ Zurück" oben links;
  alle Karten, Felder und Knöpfe kommen aus einem Bausatz (Abschnitt 4).

---

## 4. Bausatz (kanonische Bausteine)

Jeder Baustein gibt es genau einmal; Seiten setzen nur zusammen.

| Baustein | Aussehen | Zustände |
|---|---|---|
| **Knopf, primär** | gefüllt Moosgrün, weiße Schrift, Pillenform, ≥ 44 px hoch | Ruhe · Druck (leicht dunkler, minimal kleiner) · Fokus (sichtbarer Ring) · **Wartend** (Spinner, gesperrt, Text bleibt) · Gesperrt (blass) |
| **Knopf, sekundär** | Papierweiß mit feiner Kante | wie oben |
| **Knopf, Text** | nur Schrift, für Beiwerk | Ruhe · Fokus |
| **Knopf, Gefahr** | Text in gedämpftem Rot, nie gefüllt | Ruhe · Fokus · Rückfrage |
| **Pflege-Knopf** | Pastell-Pille mit Symbol oben, dunkler Schrift: Himmelblau `Gießen`, Mint `Düngen`, Gelb `Ernten` | wie primär; zusätzlich **fällig** (kräftigere Füllung + Etikett) |
| **Kästchen** | abgerundetes Quadrat, Moosgrün-Rand, Tippfläche ≥ 44 px | offen · wartend · erledigt (gefüllt, Haken) |
| **Feld** | Beschriftung oben, Eingabe mit weicher Kante auf Papierweiß, Hinweis/Fehler darunter | Ruhe · Fokus (Moosgrün-Ring) · Fehler (Rot-Rand + Satz) · Gesperrt |
| **Zweiteiliger Schalter** | für Drinnen/Draußen | gewählt · nicht gewählt · Fokus |
| **Karte** | Papierweiß, feine Kante, weicher Schatten unten | — |
| **Abschnittstitel** | Serifenschrift kursiv, klein, gedämpft | — |
| **Zurück-Chip** | „‹ Zurück" als kleiner runder Chip oben links | Ruhe · Fokus |
| **Regalbrett** | Holzverlauf mit Schatten, Töpfe stehen darauf | — |
| **Leerzustand** | ein Satz + höchstens ein Knopf | — |
| **Fehlerkasten** | Karte in gedämpftem Rot, Satz auf Deutsch, Knopf „Nochmal versuchen" | — |

Hinweis-Pille, Schild am Topf und Ermutigungszeile sind Varianten der Karte.

---

## 5. Bedienvertrag (gilt überall)

- **Ehrlicher Status:** Jeder Knopf, der speichert, zeigt „wartend", bis die
  Antwort da ist. Schlägt es fehl, erscheint der Fehlerkasten mit Satz —
  kein stiller Misserfolg (`REGELN.md` Abschnitt 1).
- **Fokus sichtbar:** Tastatur-Fokus hat immer einen Moosgrün-Ring.
- **Kontrast:** Text mindestens 4,5:1 auf seinem Hintergrund, auch der
  gedämpfte Nebentext (der heutige Ton aus den Entwürfen ist dafür zu hell
  und wird nachgedunkelt). Dunkle Schrift auf den Pastell-Pillen.
- **Bewegung:** Genau zwei bedeutungsvolle Bewegungen — die Pflanze wächst
  nach einer Pflegeaktion (gibt es schon), und das Kästchen füllt sich. Ein
  sanftes Einblenden der Seite beim Laden ist erlaubt, sonst keine Deko-
  Bewegung. `prefers-reduced-motion` schaltet alles außer Zustandswechseln ab.
- **Tippflächen:** mindestens 44 × 44 px. Kein seitliches Scrollen bei 375 px.
- **Nur helles Thema:** „Gartenregal" ist bewusst ein helles Papier-Thema.
  Die App bleibt auf helles Farbschema festgelegt; ein dunkles Thema ist
  kein Teil dieser Arbeit.

---

## 6. Farben und Schrift

Alle Werte an **einer** Stelle (Design-Tokens), Seiten verwenden nur Namen.

| Name | Wert | Verwendung |
|---|---|---|
| Papier | `#f5eddc` mit feiner Linienstruktur | Seitenhintergrund |
| Papier hell | `#fffdf7` | Karten, Felder, Leiste |
| Kante | `#e4d9c2` | Kartenränder |
| Tinte | `#2f2a22` | Fließtext |
| Tinte gedämpft | `#6b5e45` (≥ 4,5:1 auf Papier) | Nebentext, Beschriftungen |
| Moos | `#3f6b3a` | Hauptfarbe, Primärknopf, aktive Leiste, Fokusring |
| Moos hell | `#7a9a6c` | kursive Betonung in Überschriften |
| Terrakotta | `#c97b52` | Akzent (Töpfe bleiben wie gezeichnet) |
| Holz | Verlauf `#c9a074 → #a97b4e` | Regalbretter |
| Wasser | `#bfe3f7` | Pflege-Knopf Gießen |
| Mint | `#cdeccb` | Pflege-Knopf Düngen |
| Sonne | `#ffe58a` | Pflege-Knopf Ernten |
| Gefahr | `#b3402e` | Gefahr-Text, Fehlerkasten |

Schrift: **Fraunces** (Überschriften, Abschnittstitel; zweites Wort der
Seitenüberschrift kursiv in Moos hell) und **Figtree** (alles andere). Beide
werden beim Bauen mitgeliefert; im Betrieb braucht die App dafür keine
Verbindung nach außen (`STACK.md`: self-contained).

---

## 7. Was sich ausdrücklich nicht ändert

- Keine Änderung an Datenmodell, Datenbank, Berechnungsregeln oder Import.
- Topf- und Pflanzenzeichnungen, Gesichter, Engel-Wolke bleiben unverändert.
- Abläufe der Formulare und Server-Aktionen bleiben; nur Aussehen und
  Zustandsanzeige kommen dazu.
- Mandantentrennung wird nicht berührt.

Neu gegenüber dem MVP, alle nur berechnet oder rein bedienerisch:
Hinweis-Pille auf Home, Ermutigungszeile, „überfällig seit", hervorgehobener
fälliger Knopf, Rückfrage vor „verstorben", zweiteiliger Schalter,
Leerzustände.

---

## 8. Prüfung, bevor „fertig" gesagt wird

1. Jede Seite im Browser bei **375, 768 und 1440 px** angesehen: kein
   seitliches Scrollen, nichts abgeschnitten, untere Leiste überdeckt keinen
   Inhalt oder Knopf.
2. Tastatur: Fokusreihenfolge sinnvoll, Ring sichtbar, jedes Formular per
   Tastatur absendbar.
3. Kontrast der Text/Hintergrund-Paare aus Abschnitt 6 gemessen.
4. Zustände ausgelöst und angesehen: wartend beim Abhaken und Speichern,
   Fehlerkasten bei absichtlich provoziertem Fehler, Leerzustände in einem
   leeren Garten, Rückfrage vor „verstorben".
5. Barrierefreiheits-Prüfung (axe) ohne schwere Verstöße, sofern das
   Werkzeug im Browser läuft; sonst wird das benannt.
6. `npx tsc --noEmit` · `npm run lint` · `npm run build` · `npm test`.
