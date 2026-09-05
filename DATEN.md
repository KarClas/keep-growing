# Daten

**Lies das, bevor du etwas in `daten/`, `lib/db/` oder Import-Skripten anfasst —
auch bevor du eine Migration erzeugst.**

Angepasst aus `Referenz/annes-pflanzenparadies/DATEN.md`. Die dortigen Regeln
galten für eine Nutzerin; hier gelten sie **pro Garten**, nicht global.

---

## Unantastbar

1. **Die `id` einer Pflanze wird nie geändert.** Alle Aktivitäten,
   Wachstumseinträge und Fotos hängen daran. Der `name` darf sich ändern, die
   `id` nicht.
2. **Felder werden ergänzt, nie umbenannt oder entfernt.** Neue Felder
   defensiv auslesen (`?? 0` o. ä.), damit ältere Datensätze weiter
   funktionieren.
3. **Pflanzen werden nicht gelöscht**, sondern auf einen Lebenszustand
   gesetzt (`lebend` / `verstorben`), kein reines Sichtbarkeits-Flag. Eine
   verstorbene Pflanze bleibt sichtbar — nur im In-Loving-Memory-Bereich
   statt in der aktiven Liste, positiv dargestellt (siehe `MVP.md`).
4. **Notizfelder nie überschreiben, nur ergänzen.**
5. **Vor jedem Umbau am Datenmodell:** Sicherung ziehen, Team informieren,
   auf Antwort warten. Nicht bauen und danach erwähnen.
6. **Eine Sicherung/ein Import darf nie über Gartengrenzen hinweg
   zusammenführen.** Jeder Garten bleibt für sich abgeschlossen — das ist die
   Mehrbenutzer-Entsprechung zu Regel 1.

---

## Der Anne-Import

Einmaliger, sorgfältiger Vorgang, keine laufende Synchronisation:

- **Quelle:** `Referenz/annes-pflanzenparadies/` bzw. die dort referenzierten
  Originaldaten. Nur lesend — das Referenzprojekt selbst wird nicht verändert
  (H1 im Plan, siehe `Plans/we-have-already-a-snug-quiche.md`).
- **Ursprüngliche Pflanzen-IDs nach Möglichkeit erhalten**, falls je ein
  Abgleich mit Annes Pflanzenparadies nötig wird (Duplikate vermeiden, wie im
  Referenzprojekt für Ernte-IDs beschrieben).
- Ein Import-Skript räumt niemals bestehende Gärten leer — es legt Annes
  Garten einmal an. Ein zweiter Lauf gegen denselben Garten ist ein Fehler,
  kein Abgleich, und muss sichtbar abbrechen (Regel „Fehler nicht schlucken",
  siehe `REGELN.md`).

---

## Fotos

**Nicht in der Datenbank** — anders als im Referenzprojekt. Dort war das bei
einer Nutzerin richtig; bei vielen Nutzer:innen und mehreren Gärten wächst das
Fotoaufkommen linear mit der Nutzerzahl, nicht mit einer Person (siehe
`Referenz/annes-pflanzenparadies/README.md` und ADR-011 im Plan).

- Die Datenbank speichert nur eine **Referenz/URL** zum Foto, nie die
  Bilddaten selbst.
- Lokal (MVP-Phase) liegt die Referenz auf eine lokale Ablage; nach dem
  Go-Live-Schritt zeigt dieselbe Spalte auf Vercel Blob. Der Wechsel ist eine
  Konfigurationsänderung, kein Umbau des Datenmodells.
- Verkleinert wird im Browser vor dem Hochladen (wie im Referenzprojekt).

---

## Zwei getrennte Zustände je Pflanze

Nicht vermischen (siehe ADR-016 im Plan):

- **Wuchsstufe** — dauerhaft, steigt mit jeder Gieß-, Dünge- oder
  Ernte-Handlung, sinkt nie. Sitzt auf der Pflanzenzeichnung.
- **Pflegestimmung** — tagesaktuell, berechnet aus Zeit-seit-letzter-Pflege
  vs. Bedarf, kann sich verschlechtern. Sitzt auf dem Topf.

Ein überfälliger Tag darf nie die Wuchsstufe zurücksetzen — nur die
Pflegestimmung ändert sich.

## Mandantentrennung

Jede Tabelle mit Nutzer- oder Gartenbezug trägt die entsprechende
Fremdschlüssel-Spalte von Anfang an (`nutzer_id`, `garten_id`) — nicht
nachträglich ergänzt. Siehe `REGELN.md` Abschnitt 5 für die Konsequenzen beim
Lesen/Schreiben.
