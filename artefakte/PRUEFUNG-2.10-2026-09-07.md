# Prüfung Fassung 2.10 — 2026-09-07

Anlass: Luis wollte wissen, ob die Seite als Software-Skizzierwerkzeug für die Übergabe an Claude
taugt. Geprüft wurde lokal im Browser-Fenster (echte Maus/Tastatur, Hell und Dunkel, schmales
Fenster) plus vollständige Code-Lektüre plus ein Code-Prüfer als zweite Brille. Die zwei
„roten“ Funde des Prüfers wurden real nachgestellt und traten in Chrome NICHT auf — sie
stehen darum als 🟡 (latent).

**Gesamtbild:** Alles Wesentliche läuft. Kein Absturz, kein Datenverlust im normalen Weg. Die
Lücken liegen (a) im Dunkelmodus, (b) an der Bedienoberfläche für den Rückweg von Claude zum
Brett, (c) an Randfällen beim Speichern mit zwei Betrachtern.

## 🟠 Fehlverhalten — beheben

| Nr | Was | Wo | Szenario |
|---|---|---|---|
| F1 | ~~Dunkelmodus: Rahmen, Code, Tabelle, Baustein in Farbe „plain“ unlesbar~~ **seit 2.20 erledigt.** War: (dunkle Schrift auf dunklem Grund, Kontrast ~1,9:1). Nur `box` bekommt `--node-ink-plain`. | `pinit.html:1580`, CSS Token Z. 51-85 | Dunkelmodus, Rahmen anlegen → Titel „Bildschirm“ kaum zu sehen. Betrifft das ganze Paket A, weil dort `plain` die Vorgabe ist. |
| F2 | ~~Auswahllisten im Inspektor lassen Tastenkürzel durch~~ **seit 2.21 erledigt.** War: `#widget-variant`/`#frame-layout` sind `<select>` ohne `stopPropagation`; der Tastatur-Wächter prüft nur INPUT/contentEditable. | Z. 2599-2613, 675, 687 | Baustein-Art wählen, Liste hat Fokus, `Entf`/`Backspace` → Element gelöscht. Buchstabe „s“ in der Liste schaltet gleichzeitig das Werkzeug auf Notiz. |
| F3 | **Ganzes Dokument wird bei Verschieben/Farbe/Ebene neu geschrieben** (`set`, nicht `update`). | `putNode` Z. 1381-1392, `putSheet` Z. 1404 | A zieht einen Kasten, B schreibt währenddessen eine Notiz in denselben Kasten → A's `mouseup` schreibt B's Notiz weg. Reiter umbenennen überschreibt `type`. Fix: für Move/Color/z/Größe nur die Felder per `update`. |
| F4 | **Beim Einlesen gekappte Werte werden beim nächsten Schreiben zurückgeschrieben.** | `applyNodes` Z. 3215-3231, `putNode` | Claude legt eine 25-Zeilen-Tabelle an (Grenze 20). Nutzer verschiebt den Rahmen darüber → Mitnehmen → `putNode` je Kind → 5 Zeilen dauerhaft weg. Fix: gekappte Dokumente markieren und beim Schreiben nur geänderte Felder schicken (hängt mit F3 zusammen). |
| F5 | **Keine Warnung bei 1000/200-Fenster und Quota.** Ab Element 1001 verschwindet ein frisch angelegtes Element nach dem eigenen Schreiben vom Bildschirm (Fenster hält die ältesten). Zähler kann nie über 1000. | Z. 3318, 3339, 3347, 1308 | Steht als Kandidat in PLAN.md („Warnung ab 800“). Billig: `snap.docs.length >= 900` → Statuszeile. |
| F6 | **`selSet`/`selEdges` werden an drei Stellen nicht geleert** (`switchSheet`, `deleteSheet`, `pruefeAktivenReiter`); `applyNodes` streicht gelöschte Kennungen, ruft aber `einzelAufloesen()` nicht. | Z. 1110, 1212, 3149, 3241 | Drei Kästen per Rahmen wählen, Reiter wechseln → Inspektor zeigt „3 Elemente“ auf dem fremden Reiter. Bleibt nach fremdem Löschen genau eins übrig: gezeichnet als gewählt, aber Entf/Farbe inert. |
| F7 | **Eingefroren: Inspektor-Handler haben kein `gesperrt()`**, nur CSS `pointer-events:none`. Per Tab+Enter erreichbar: Farbe, Text, Duplizieren, Status, Notiz, Tabelle … ändern lokal, `track()` wirft stumm weg, Statuszeile sagt „gespeichert“. | Z. 1364 und alle Inspektor-Handler | Datenbank bleibt sauber, Oberfläche lügt bis zum nächsten fremden Stand. |
| F8 | **Pfeile auf fehlende oder fremd-reiterige Knoten sind unsichtbar, unwählbar, unlöschbar**, zählen aber in „N Pfeile“, im Unsortiert-Zähler und im Übergabe-JSON. | `renderWires` Z. 1677, Z. 1323, 3069 | Claude schreibt einen Knoten auf einen anderen Reiter um → Pfeil hängt für immer. Kein Weg über die Oberfläche. |

## 🟡 Schwächen — für den Zweck „Claude baut daraus“

| Nr | Was | Warum es zählt |
|---|---|---|
| S1 | **Kennung suchen fehlt.** Claude antwortet „⟨nodes/abc⟩ ist unklar“, der Nutzer findet das Element auf einem vollen Brett nicht. | Der Rückweg Claude → Brett ist heute nur über Kennungen möglich; ohne Suche ist er blind. Vorschlag: Feld in der Kopfzeile, Treffer wird gewählt und die Kamera fährt hin. |
| S2 | **Pfeile tragen weder Notiz noch Status.** Genau Pfeile sind „Klick auf Speichern → Bildschirm X“ oder „1:n“. | Verhalten der Navigation hat keinen Platz. Schema-Erweiterung `note`/`status` an `edges`, rückwärtsverträglich. |
| S3 | **Containment steht nicht im Übergabe-JSON.** Welcher Baustein in welchem Rahmen liegt, rechnet der Leser aus der Geometrie nach (`mitnehmer()`-Regel). | Ein berechnetes `frame`-Feld je Knoten im Export (nicht in der DB) wäre billig und eindeutig. Zusätzlich: Waisen landen im Export still auf dem ersten Reiter — falscher Kontext. `FASSUNG` fehlt im JSON. |
| S4 | **Handoff-Prosa beschreibt nur die vier Bauarten von 1.0** (Z. 3088-3096). Ein Claude ohne Datei baut ein Brett ohne table/frame/widget/entity. | Entweder Prosa nachziehen oder den Zweig streichen. |
| S5 | ~~Hilfe ist ein Toast~~ **seit 2.14 erledigt:** Zahnrad öffnet Einstellungen-Dialog mit Tastenkürzeln, Darstellung, Infos. | — |
| S6 | **Mermaid-Export verliert Software-Semantik**: Vererbung, 1:n, Entitäten mit Feldern, Rahmen/Bausteine. Reiter-Typ wird nicht genutzt. | Für `type: data` wäre `classDiagram`/`erDiagram` richtig. |
| S7 | **Keine Pfeiltasten zum Schubsen.** ~~Strg+D, Strg+C/V, Duplizieren von Gruppen~~ seit 2.13 erledigt. | Bei Mockups die häufigste Bewegung. |
| S8 | **Reiter lassen sich nicht umsortieren.** | `order` existiert, nur die Bedienung fehlt. |
| ~~S9~~ (2.25) | **`editing.el` ist beim normalen Tippen `undefined`** (`t` wird nach der Zuweisung deklariert, Z. 1927/1929). Beide Sicherheitsnetze (Z. 1540, 3174) greifen nur für Zellen. **Real getestet: Chrome feuert `blur` beim Entfernen, darum klemmt nichts.** Firefox tut das nicht. | Einzeiler, Zeilen tauschen. Latent. |
| S10 | ~~`Enter` auf Start/Ende öffnet `beginEdit`~~ seit 2.17 erledigt: Enter/F2 laufen über `oeffneZumTippen()`. | — |
| S11 | Koordinaten/Größen sind nach oben unbegrenzt (`+v.x || 0` fängt kein `1e300`); `saveView` schreibt das in localStorage und `isFinite(null)` lässt es wieder durch. | `Math.min/max` auf ±1e6 in `applyNodes`. |
| S12 | Einfrieren setzt `frozen` lokal vor dem Schreiben, kein Rückrollen bei Fehler. | Lokal gesperrt, Datenbank nicht — bis zum Neuladen. |
| S13 | `editEdgeLabel` fokussiert ohne `preventScroll` (Z. 2042). | Verstößt gegen die Invariante. |
| S14 | Notbremse (3 s) wird nur in `aufbewahren()` gestellt; kommt der Stand während des Ziehens und hängt danach ein Schreibvorgang, liegt er bis zum nächsten Stand. | Randfall. |
| S15 | Toast beim Reiter-Löschen zählt nur Knoten, Unsortiert-Reiter zählt Knoten+Pfeile. | Kosmetisch, aber genau da schaut man hin. |
| S16 | ~~Tabelle: leere Restfläche unter den Zeilen~~ seit 2.16 erledigt (Zeilen teilen sich die Höhe). Entitäts-Rahmen ignoriert aufgezogene Höhe nicht, aber Rahmen-Titel-Zeile fehlt bei „frei“ als Abzeichen. | Kosmetisch. |
| S17 | Hinweis „Leeres Brett“ erscheint auf jedem leeren Reiter, auch mit Speicher. | Kosmetisch. |

## Nächster Schritt (vom Nutzer gewünscht, 2026-09-07)
**Raster einstellbar:** Klick auf „Raster“ unten rechts öffnet ein Feld mit An/Aus und einem
Regler für den Schritt in 1-px-Stufen. Vorgabe = Punktabstand des Hintergrunds. Achtung: die
Punkte liegen heute bei 24 px (`applyView`, Z. 1442), eingerastet wird auf 8 px (`RASTER`).
Offene Wahl: Punkte an den Regler koppeln (empfohlen) oder Punkte fest bei 24 lassen.

## Für sauber befunden
`catchGesperrt()` in allen drei Erzeugern; `gesperrt()` an Erzeugern/Löschern/Reiter-Wegen; alle
Lese-Helfer (`pfeilFelder`, `statusLesen`, `zellenLesen`, `listeLesen` …) robust gegen falsche
Typen; Übergabe-JSON trägt alle Schemafelder; kein `innerHTML` mit Nutzertext; keine
Browser-Dialoge; Schmales Fenster: Kopfzeile wird dreizeilig, kein waagerechtes Scrollen mehr.
