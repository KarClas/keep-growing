# Referenz: Annes Pflanzenparadies

**Diese Dateien beschreiben ein anderes Projekt.** Sie liegen hier als Vorbild
für Prinzipien, Aufbau und Arbeitsweise — nicht als Vorlage zum Übernehmen.

Das Original liegt unter `/Users/flowmate/Annes Pflanzenparadies` und ist eine
Ein-Personen-Anwendung für Annes 36 Balkon- und Zimmerpflanzen, hervorgegangen
aus einem handgebauten Claude-Artefakt. `keep-growing` ist etwas anderes:
mehrbenutzerfähig, mehrere Gärten je Person, als Produkt gedacht.

**Wo also aufpassen:** Alles, was aus „genau eine Nutzerin" folgt, gilt hier
nicht. Das betrifft vor allem die Anmeldung (dort ein einzelnes Passwort),
das Datenmodell (keine Zuordnung zu Personen) und die Entscheidung, Fotos in
der Datenbank zu halten (bei vielen Nutzer:innen die falsche Wahl).

Stand: 4. September 2026.

---

## Was hier liegt

| Datei | Worum es geht | Wofür es hier taugt |
|---|---|---|
| `REGELN.md` | Fehlerbehandlung, Einfachheit, Umfang, Absicherung | **Am ehesten direkt übertragbar.** Die Regeln sind an Beispielen aus echtem Code festgemacht, nicht allgemein gehalten. |
| `CLAUDE.md` | Der Einstiegspunkt für den Agenten: 107 Zeilen als Landkarte, nicht als Handbuch | Aufbau als Vorbild: was immer geladen wird, was über „bevor du X tust, lies Y" nachgeladen wird |
| `MVP.md` | Spezifikation der ersten Fassung: Abnahmekriterien, Nicht-Ziele, Wege durch die Anwendung | Form als Vorbild, besonders die nachprüfbaren Sätze statt „fertig" nach Gefühl |
| `STACK.md` | Technische Entscheidungen mit Begründung, plus die Stellen, an denen sich später wechseln lässt | Die Begründungen, nicht die Auswahl |
| `DATEN.md` | Regeln zum Schutz unwiederbringlicher Nutzerdaten | Übertragbar, sobald echte Daten im Spiel sind |
| `AGENTS.md` | Hinweis, dass Next.js 16 neuer ist als der Trainingsstand | Gilt auch hier |

---

## Die drei Dinge, die sich am ehesten lohnen

**1. Gestufter Kontext statt einer großen Anweisungsdatei.**
Der Einstieg lag zwischenzeitlich bei 374 Zeilen und wurde auf 107 gekürzt.
Alles Weitere wird über Auslöser nachgeladen — „bevor du Code schreibst, lies
`REGELN.md`". Ein Verweis ohne Auslöser wird nicht befolgt; das ist der Kern.

**2. Fehler dürfen nicht schweigen.**
Ein Gartentagebuch, in dem ein Eintrag still verlorengeht, ist schlimmer als
eines, das meckert: die Nutzerin verlässt sich dann auf etwas, das nie
passiert ist. In `REGELN.md` steht, welche drei Formen von `catch` deshalb
verboten sind.

**3. Eine Schutzmaßnahme wird gegen den Fall geprüft, den sie verhindern soll.**
Diese Regel steht dort, weil sie Geld gekostet hat: Eine Notbremse gegen
Datenverlust war eingebaut und geprüft — aber nicht in der Lage, in der sie
versagte. Die Fotos waren weg. Wiederherstellbar, aber nur durch Zufall.

---

## Was hier bewusst *nicht* liegt

- **Kein Code.** Ausdrücklich nicht gewollt.
- **Annes Gartenwissen** (`wissen/` im Original: Erdmischungen, Saisonkalender,
  Pilzzucht, rund 730 Zeilen) — falls `keep-growing` Pflegelogik braucht,
  ist das die Quelle.
- **Die Pflanzendaten** (`daten/pflanzen.json`, 36 Pflanzen mit vollständigem
  Schema) — vorgesehen als Demo-Datensatz, aber nicht ungefragt kopiert.
