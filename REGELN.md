# Arbeitsregeln für dieses Projekt

Übernommen aus dem Referenzprojekt (`Referenz/annes-pflanzenparadies/REGELN.md`),
weil laut dessen eigener Einschätzung am direktesten übertragbar — mit einem
neuen Abschnitt 5 für den Mehrbenutzer-Fall, den es dort nicht gab.

---

## 1. Fehler

**Ein Programm, das lügt, ist schlechter als eines, das meckert.**

Ein Wachstumseintrag, der still verlorengeht, ist schlimmer als eine
Fehlermeldung: die Nutzerin glaubt dann, dokumentiert zu haben, und verlässt
sich darauf.

### Verboten

```ts
try { ... } catch { }                       // schluckt
try { ... } catch { return [] }             // tut so, als wäre nichts
try { ... } catch (e) { console.error(e) }  // niemand liest die Konsole
```

### Erlaubt

Ein `catch` muss **eines von beidem** tun:

1. **Den Fehler wirklich behandeln** — sichtbar in der Oberfläche, auf
   Deutsch, nicht nur in der Konsole.
2. **Weiterwerfen, mit mehr Kontext als vorher.** Wenn diese Ebene nicht
   entscheiden kann, was zu tun ist, darf sie es auch nicht verstecken.

Jede schreibende Aktion braucht eine sichtbare Rückmeldung im Fehlerfall.
**Kein `catch (e)` ohne Verwendung von `e`.**

---

## 2. Einfachheit

### Nicht bauen, was heute niemand braucht

Gebaut wird für den Fall, der eingetreten ist — nicht für den, der eintreten
könnte. Das MVP aus `MVP.md` ist die Grenze, nicht ein Vorschlag.

### Keine Abstraktion für einen einzigen Verwender

Erst gerechtfertigt ab dem zweiten Verwender oder bei einem konkreten,
bekannten künftigen Wechsel (Beispiel: die Foto-Schnittstelle, die von Anfang
an weiß, dass sie später auf Vercel Blob zeigt — siehe `STACK.md`).

### Vor dem Schreiben lesen

Gibt es die Funktion schon? `lib/garten/` ist die Stelle für
Berechnungsregeln (Wuchsstufen, Pflegezustand). Zwei Fassungen derselben
Regel wären ein Fehler, der erst auffällt, wenn sie auseinanderlaufen.

### Kein toter Code

Beim Aufräumen im selben Zug entfernen, nicht „später".

---

## 3. Umfang

**Vor jeder Erweiterung drei Fragen:**

1. **Hat das Team das gewollt?** Steht es in `MVP.md`/`CLAUDE.md`, oder wurde
   es in diesem Gespräch gesagt? Wenn nicht: vorschlagen, nicht bauen.
2. **Ist es das Kleinste, was die Sache löst?**
3. **Was kommt an Dauerlast dazu?** Ein neues Paket, ein neuer Dienst, eine
   neue Tabelle — jemand muss es pflegen, in 30 Stunden niemand außer dir.

**Neue Abhängigkeiten** brauchen eine Begründung in einem Satz. **Fällt
während der Arbeit etwas Zusätzliches auf:** notieren und dem Team sagen,
nicht mitbauen, weil es gerade naheliegt.

---

## 4. Absicherung

### „Fertig" heißt geprüft — an der Sache selbst

Nicht: „der Code sieht richtig aus." Sondern: ausgeführt, Ergebnis angesehen.

### Eine Schutzmaßnahme wird gegen den Fall geprüft, den sie verhindern soll

Aus dem Referenzprojekt: eine Notbremse gegen Datenverlust war eingebaut und
geprüft — aber nicht in der Lage, in der sie versagte. „Ich habe es getestet"
ohne Angabe des geprüften Falls ist keine Prüfung.

### Was Tests verdient

Die reinen Berechnungsregeln, an denen die Historie hängt (Wuchsstufen,
Pflegezustand/Gesichter der Töpfe, Fälligkeiten). Keine Datenbank nötig dafür
— billig zu testen, aber ein Fehler fällt sonst erst bei falschen Zahlen auf.

### Vor jedem Commit

`npx tsc --noEmit` · `npm run lint` · `npm run build`. Alle drei.

---

## 5. Mandantentrennung (neu gegenüber dem Referenzprojekt)

Das Referenzprojekt hatte genau eine Nutzerin — diese Frage stellte sich dort
nicht. Hier ist sie zentral:

- **Jede lesende und schreibende Aktion filtert auf die Nutzer-/Garten-ID der
  angemeldeten Person.** Nicht nur „angemeldet oder nicht", sondern „gehört
  das dieser Person".
- **Ein Zugriff auf fremde Daten ist kein Kantenfall**, sondern derselbe
  Fehlertyp wie ein verschlucktes `catch` — er wird sichtbar blockiert, nie
  still durchgelassen (Fehlermeldung, kein leeres Ergebnis, das wie „nichts
  vorhanden" aussieht).
- **Berechnungsregel-Tests** (Abschnitt 4) schließen mindestens einen Fall
  „fremder Garten, eigene Anfrage" ein.
- **Ohne ORM (`STACK.md`) gibt es keinen Schema-Layer, der einen fehlenden
  Filter automatisch verhindert.** Jede Abfrage mit Nutzer-/Garten-Bezug läuft
  über eine gemeinsame Hilfsfunktion in `lib/db/`, die die ID-Filterung
  erzwingt — kein rohes SQL mit `WHERE` von Hand an einzelnen Stellen im Code.

---

## Kurzfassung

| | |
|---|---|
| Fehler | Sichtbar machen oder weiterwerfen. Niemals schlucken. |
| Umfang | Das Kleinste, was die Sache löst. Nichts auf Verdacht. |
| Abstraktion | Erst ab dem zweiten Verwender oder bei bekanntem Wechsel. |
| Erweiterung | Erst fragen, wenn das Team es nicht gewollt hat. |
| Prüfung | Ausgeführt und angesehen, nicht überlegt. |
| Schutzmaßnahmen | Gegen den Fall prüfen, für den sie da sind. |
| Mandantentrennung | Jede Abfrage filtert auf die eigene(n) ID. Kein stiller Fremdzugriff. |
