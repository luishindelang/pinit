---
plan-status: fertig
verifiziert-am:
---

# Pinit — Plan

<!-- Lebender Index + Richtung. Das `plan-status`-Feld oben IST das Feature-Gate
     (feature-* laufen nur bei exakt `verifiziert`). Diese Datei wandert NIE nach history/.
     Schlank halten: Detailpläne leben in planung/, fertige in history/. -->

## Ziel & roter Faden
Ein eigenes Whiteboard, weil es keins zum Anbinden gibt: Microsoft Whiteboard hat keine
API, Figmas MCP ist im Free-Tarif nach wenigen Aufrufen aufgebraucht. Prozesse und
Mockups sollen sich zeichnen **und mit Claude teilen** lassen — Claude liest und schreibt
dieselben Elemente über die Artifact-Datenbank.

**Roter Faden — verteilt wird die DATEI, nicht das Artifact.** `code/pinit.html` ist
selbsttragend; wer sie hat, lässt sie sich von seinem Claude als eigenes Artifact
veröffentlichen und hat sein eigenes Brett mit eigenem Speicher. Kein gemeinsamer
Datentopf, keine fremde Verwaltung, kein Konto-Eigentum bei einer Person.

**Bewusst nicht gebaut: Auto-Update.** Ein Artifact kann sich nicht selbst klonen und eine
Vorlage kann ihre Kopien nicht mit-aktualisieren. Der einzige technische Weg dorthin wäre
ein ungepinntes Paket vom CDN — verworfen, weil ein kaputtes Update dann in derselben
Sekunde alle Bretter lahmlegt, ohne Rückweg (und der Code läge öffentlich). Stattdessen
die **Fassungsnummer in der Kopfzeile**: sichtbar, wer hinterherhängt. Ein Update ist
ungefährlich, weil der Inhalt in der Datenbank liegt, nicht in der Seite.

## Bereiche / grobe Architektur
Drei Teile, alle in `code/` (Details + Datenschema → `CLAUDE.md`, Code-Landkarte):

1. **Die Seite** (`pinit.html`) — Zeichenfläche, Werkzeuge, Reiter, Inspektor.
   Eine Datei, keine Fremdbibliothek, kein Build.
2. **Der Speicher** — die Artifact-Datenbank (`nodes`/`edges`/`sheets`/`meta`). Die
   Grenze zwischen Seite und Inhalt; sie macht Updates gefahrlos und macht Claude
   lesefähig. Nur rückwärtsverträglich erweitern.
   **Waisen-Regel (entschieden 2026-09-07, → E1):** der wirksame Reiter eines Elements ist
   der eigene, wenn es diesen Reiter gibt — sonst der erste. Ohne benannten Reiter gilt der
   implizite `haupt`. Damit vernichtet kein Reiter-Löschen Inhalt.
3. **Die eine Veröffentlichung** — `pinit.html` als Artifact mit `{db:{}}`. *(Bis 2.10
   gab es eine zweite, „Vorlage“ ohne Speicher; 2026-09-07 abgeschafft: eine Datei, ein
   Artifact. Wer die Datei bekommt, veröffentlicht sie selbst.)*

**Bekannte offene Punkte** (Kandidaten für `/feature-neu`, nichts davon entschieden). Wo die
Plan-Brille schon eine Prämisse geliefert hat, steht sie dabei — sie gehört dann ins
Akzeptanzkriterium, nicht erst in die Rückschau:
- **Freihand-Zeichnen** fehlt ganz. **Prämisse:** passt nicht additiv ins Datenmodell — alle
  Knoten sind heute Rechtecke mit `x`/`y`/`w`/`h`, und `border()` verankert Pfeile an
  Rechteck- und Rautenrändern. Ein Strich ist eine Punktfolge und bräuchte ein eigenes Feld
  (`points`) plus einen eigenen Zeichen-Zweig; Pfeile sollen daran vermutlich gar nicht
  andocken. Das Datenmodell dafür **vor** dem Zuschnitt klären, nicht danach.
- ~~Mehrfachauswahl~~ **seit 2.0–2.2 vollständig** (Auswahl-Rahmen, Umschalt+Klick, Pfeile).
- **Kein Rückgängig.** **Prämisse (→ N7):** ein naives Mehrbenutzer-Undo rollt fremde,
  zwischenzeitlich eingetroffene Änderungen kommentarlos zurück. Korrekt ist es nur mit
  Operationshistorie, die dieses Projekt bewusst nicht hat. Falls es kommt, gehört ins
  Akzeptanzkriterium: nur die eigene letzte Aktion, und nur wenn danach niemand geschrieben
  hat — sonst ablehnen.
- **Live-Zeiger anderer Betrachter.** Bräuchte die `room`-Fähigkeit — das ist die
  Artifact-Fähigkeit für einen **ephemeren** Kanal an alle, die die Seite *gerade jetzt*
  offen haben; nichts davon wird gespeichert. **Prämisse (→ N8):** Zeigerpositionen gehören
  genau dorthin und **nicht** in die Dokument-Datenbank (unnötige Schreiblast, und sie
  bleiben liegen). Das etablierte Vokabular dafür heißt Presence bzw. Awareness.
- **Kein Bild-Import.**
- **Unsortiert aufräumen** (→ E1, Preis). Seit E1 gibt Reiter-Löschen keine Dokumente mehr
  frei; die Datenbank eines Artifacts ist auf 5.000 Dokumente gedeckelt. Ein Weg, den
  Auffang-Reiter gesammelt zu leeren, ist damit ein Kandidat.

## Entscheidungen und alte Befunde
E1 (Waisen-Regel), E2 (aufbewahrte Stände), E3 (Web-Schriften), die Messung O2, „Offen nach 1.6“ und
alle Panel-Befundlisten stehen in `artefakte/HISTORIE-2026-09-07.md`. Alles davon ist entschieden
oder abgehakt; hier steht nur noch, was lebt.

## Historie
Abgeschlossenes wandert nach `artefakte/`, damit diese Datei schlank bleibt (sie wird per
`@import` in jeder Session geladen).

| Fassung | Datum | Was |
|---|---|---|
| 1.0 | 2026-09-07 | Erste Veröffentlichung: Zeichenfläche, vier Element-Arten, Pfeile, Reiter, zwei Veröffentlichungen (Brett + Vorlage) |
| 1.1 | 2026-09-07 | Panel-Befunde von 1.0 abgearbeitet: Waisen-Regel mit Auffang-Reiter (E1), aufbewahrte Stände (E2), Wächter in `applySheets`, Übergabe-Nutzlast auf die echten Feldnamen, Fehlermeldungen für Reiter und Titel, Kapp-Grenzen |
| 1.2 | 2026-09-07 | Code-Panel-Befunde von 1.1: toter Uebergabe-Knopf gefixt (war ein Rest des alten Feldschemas), Gueltigkeitspruefung des offenen Reiters in alle drei Snapshot-Pfade plus Ladewettlauf-Schutz, auf dem Auffang-Reiter kann nichts mehr angelegt werden, Test-Konvention auf acht Schritte neu geschrieben |
| 1.3 | 2026-09-07 | Anlege-Verbot des Auffang-Reiters von den Aufrufern IN die Funktion verlegt (in 1.2 galt es nur fuer einen von drei Wegen), Ladewettlauf-Merker erst bei server-endgueltigem Stand, Reiterwechsel mit Hinweis und Kamera, toter Listener bleibt sichtbar tot, Panel-Befundlisten nach artefakte/ |
| 1.4 | 2026-09-07 | **Notfall:** 1.3 war am echten Brett kaputt (eine nie deklarierte Variable liess unter "use strict" jeden Snapshot scheitern, das Brett zeigte seinen Inhalt nicht mehr). Deklaration nachgetragen, Duplizieren-Knopf als vierter Anlege-Weg geschuetzt, Pruefer `undeklariert-pruefen.js` fuer genau diese Fehlerklasse gebaut, Patch-Werkzeug auf "erst alle Anker pruefen, dann schreiben" umgestellt |
| 1.5 | 2026-09-07 | Groesse wird beim Anlegen aufgezogen statt gespawnt (Figma-Art, Klick = Standardgroesse), Textdarstellung je Element im Inspektor einstellbar (Schriftgrad, fett, Ausrichtung) mit den drei neuen Feldern `fs`/`bold`/`align` |
| 1.6 | 2026-09-07 | Zusammenarbeit mit Claude: Notiz-Feld je Element (neues Feld `note`, Langtext, auf der Flaeche nur als Ecke markiert) und kopierbare Kennung im Inspektor. Dazu zwei **globale** Skills im Benutzer-Ordner (`~/.claude/skills/pinit-lesen`, `pinit-schreiben`), damit jedes Brett in jedem Projekt gelesen und beschrieben werden kann |
| 1.7 | 2026-09-07 | Knopf „Mermaid“ heißt jetzt „Diagramm-Text“ (Tooltip erklärt, wo man ihn einfügt) — das Fachwort verstand niemand. Zusammen mit 1.6 veröffentlicht |
| 1.8 | 2026-09-07 | Verschieben nimmt mit: ein Element zieht alles mit, was ganz in ihm und vor ihm liegt (Notiz als Traeger); Alt bewegt nur das Element. Rein geometrisch, kein Gruppen-Feld |
| 1.9 | 2026-09-07 | Eigene offene Schreibvorgaenge zaehlen als Warte-Grund (`writes > 0` in `warteGrund`), mit 3-s-Notbremse: nach dem Mitnehmen kommen alle Kaesten in einem Sprung an statt einzeln |
| 2.0 | 2026-09-07 | **Bedienung geaendert:** Auswaehlen zieht auf leerer Flaeche einen Rahmen (Mehrfachauswahl: zusammen verschieben, umfaerben, loeschen); die Ansicht schiebt das neue Werkzeug Bewegen (H) oder die mittlere Maustaste |
| 2.1 | 2026-09-07 | Umschalt+Klick nimmt Elemente in die Mehrfachauswahl auf oder heraus; Umschalt beim Rahmenziehen ergaenzt |
| 2.2 | 2026-09-07 | Pfeile gehoeren zur Mehrfachauswahl: der Rahmen nimmt einen Pfeil, wenn er seine Linie beruehrt; Umschalt+Klick auf Pfeile; Entf loescht Kaesten und Pfeile zusammen |
| 2.3 | 2026-09-07 | **Tabelle** als fuenfte Bauart (`kind: "table"`, Ueberschrift + Kopfzeile, neues Feld `cells`, Zellen per Doppelklick, Tab springt, Zeilen/Spalten im Inspektor) und **Stichpunkte** in jedem Element (Zeile mit `- ` wird als Punkt gezeigt, gespeichert bleibt roher Text). Nebenbei gefunden und behoben: Fokus-Zeitgeber loeschten fremde Editier-Merker |
| 3.00 | 2026-09-10 | Aufräumung ohne Verhaltensänderung: ein Bauplan für Datenbank-Dokumente, ein Anbinder für Inspektor-Felder, Auswahl-Helfer, `renderNodes`/`renderInspector` in Bausteine, eine `[hidden]`-Regel, Token für Code-/Status-Farben; Prüf-Geschirr `code/pruefung/` (Fingerabdruck-Vergleich, 74 Aufnahmen, 0 Unterschiede zu 2.51) |
| 2.51 | 2026-09-10 | Tabelle: Inhalts-Textfeld „Als Text“ im Inspektor entfernt (Gitter und Doppelklick reichen) |
| 2.50 | 2026-09-10 | Sichtbarkeit (Issue #8): Feld `hidden` — Element als blasser Umriss, Pfeile und alles darin unsichtbar; Knopf im Inspektor und Strg+Umschalt+H |
| 2.49 | 2026-09-10 | Tabelle (Issue #7): Rechtsklick auf eine Zelle — Zeile/Spalte davor oder danach einfügen, Zeile/Spalte löschen |
| 2.48 | 2026-09-10 | Performance (Issue #9): Pfeilspitzen als Pfade statt SVG-Marker, Tabellen gesammelt messen, `contain: paint` — Neuaufbau bei 273 Elementen/173 Pfeilen 250 → 22 ms |
| 2.47 | 2026-09-09 | Code-Kasten: Text steht per Vorgabe oben statt mittig |
| 2.46 | 2026-09-09 | Tabelle: gezogene Spalten-/Zeilen-Trennlinie rastet auf dem Raster |
| 2.45 | 2026-09-09 | Doppelklick im offenen Textfeld markiert das Wort (Browser-Standard, vorher geschluckt) |
| 2.44 | 2026-09-09 | Code-Kasten: Zeilennummer springt bei Enter nicht mehr doppelt; Farben für Kommentare, Zeichenketten, Zahlen, Schlüsselwörter |
| 2.43 | 2026-09-09 | Smart Guides auch beim Größe ziehen: die gezogene Kante schnappt an Nachbar-Kanten und -Mitten |
| 2.42 | 2026-09-09 | Smart Guides: beim Verschieben schnappen Kanten und Mitten an die Nachbarn, rote Hilfslinie; abschaltbar unter Darstellung |
| 2.41 | 2026-09-09 | Doppelklick auf Notiz/Code setzt den Cursor ans Ende statt alles zu markieren; Inspektor bis 60 % der Fläche breit |
| 2.40 | 2026-09-09 | Raster greift an den Kanten statt an der Mitte (Verschieben/Anlegen: Ecke oben links, Größe ziehen: gezogene Kante) — Kanten liegen wieder auf dem Raster |
| 2.39 | 2026-09-09 | Innere Linien aller Elemente in der Randfarbe (`--rand`); Auto-Größe für Entitäten-, DB- und Klassen-Modell (Feld `auto`, Knopf im Inspektor) |
| 2.38 | 2026-09-09 | Rahmen überall „Rahmen“; neue Bauarten DB-Modell (M) und Klassen-Modell (K), Datenmodell heißt Entitäten-Modell; Code-Kasten als Editor mit Zeilennummern; Tabellenlinien im Dunkelmodus sichtbar; Notiz mit einer Linie je Textzeile; Reiter-Typ im Rechtsklick-Menü, größeres Symbol |
| 2.37 | 2026-09-09 | GitHub-Issues #4–#6: Pfeiltasten schieben die Auswahl im Raster; gewähltes Element hebt seine Pfeile und Nachbarn hervor; Inspektor-Felder werden vor jedem Auswahlwechsel gespeichert |
| 2.36 | 2026-09-08 | Tabelle füllt den Kasten immer ganz (letzte Spalte/Zeile nimmt den Rest), Zieh-Griffe über die ganze Höhe bzw. Breite |
| 2.35 | 2026-09-08 | Tabelle: Spaltenbreite und Zeilenhöhe an den Kanten ziehbar wie in Excel (Felder `colW`/`rowH`); die Kopfzeile wächst nicht mehr mit dem Kasten |
| 2.34 | 2026-09-08 | Inspektor lässt Luft zur Zoomleiste; Zieh-Griff an der linken Kante (nach links = breiter) statt Browser-Griff rechts unten |
| 2.33 | 2026-09-08 | Inspektor nie höher als die Fläche (scrollt innen) und in der Breite ziehbar; Zieh-Griff am Einstellungs-Dialog wieder entfernt |
| 2.32 | 2026-09-08 | Einstellungen-Dialog scrollt innen (Flex-Kind `min-height: 0`) und ist in der Breite ziehbar, Breite je Betrachter gemerkt |
| 2.31 | 2026-09-08 | Zugeklappte Gruppen wirklich unsichtbar (`hidden` wurde von `.tab` überstimmt), Ziehen robuster (5-px-Schwelle in beide Richtungen, Ablegen auf leerer Leiste = Ende) |
| 2.30 | 2026-09-08 | Gruppen-Chip ziehen verschiebt die ganze Gruppe; Reiter auf den Chip ziehen = beitreten |
| 2.29 | 2026-09-08 | Mausrad nach Figma-Regel: Rad schiebt, Strg+Rad/Kneifen zoomt, Umschalt waagerecht; „Rad zoomt“ als Wahl für Maus-Nutzer. Geräte-Erkennung aus 2.28 verworfen |
| 2.28 | 2026-09-08 | Touchpad wird automatisch am Rad-Ereignis erkannt (`istTouchpad()`), Vorgabe „Automatisch“; Maus/Touchpad bleiben fest wählbar |
| 2.27 | 2026-09-08 | GitHub-Issues #1–#3: Reiter per Ziehen ordnen und in Gruppen (Rechtsklick, Chip klappt zu) mit neuem Feld `sheets.group`; Inspektor zeigt die Mitte und das Raster greift an der Mitte; Touchpad-Modus in den Einstellungen (zwei Finger schieben, Kneifen zoomt) |
| 2.26 | 2026-09-07 | Rücknahme: Fett und Ausrichtung je Zeile wieder raus (Bedienung überzeugte nicht); Listen/Nummern/Überschriften und der S9-Fix bleiben |
| 2.25 | 2026-09-07 | Zeilen-Formate per Knopf: beim Tippen treffen B und die Ausrichtung nur die Zeile oder Markierung (`**fett**`, `<- `/`<-> `/`-> `), Strg+B. Dabei S9 behoben (`editing.el` war leer, Umbrüche gingen bei Neuaufbau während des Tippens verloren) |
| 2.24 | 2026-09-07 | Notizblock ruhiger: blassere Linien in jeder zweiten Zeile, unter dem Lochband über die volle Breite, ohne Eselsohr |
| 2.23 | 2026-09-07 | Zeilen-Formate in jedem Element (`- ` Punkt, `1. ` Nummer, `# `/`## ` Überschrift; Enter setzt Listen fort, Enter in leerer Listenzeile beendet sie), Notiz als Notizblock (Lochband, Linien, Text links oben), Start/Ende werden quadratisch aufgezogen |
| 2.22 | 2026-09-07 | Größen-Griffe liegen vor dem Auswahl-Ring (eigene Ebene `.grips` über allen Knoten statt im abgeschnittenen Kasten) |
| 2.21 | 2026-09-07 | Auswahllisten im Inspektor lassen keine Tastenkürzel mehr durch (F2 der Prüfliste): Entf löscht nichts mehr, Buchstaben wechseln kein Werkzeug |
| 2.20 | 2026-09-07 | Dunkelmodus: helle Schrift auf „Weiß“-Füllung für alle Bauarten (F1 der Prüfliste), Schalter-Baustein lesbar |
| 2.19 | 2026-09-07 | Strg+Mausrad schiebt die Ansicht senkrecht (Umschalt waagerecht, ohne Taste Zoom) |
| 2.18 | 2026-09-07 | Auswahl-Ring für alle Bauarten (Rahmen, Baustein, Code, Tabelle, Datenmodell hatten keinen), Ring-Farbe passend zur Füllung (Blau/Rot/Warm), Notiz als Zettel mit Klebestreifen und Eselsohr |
| 2.17 | 2026-09-07 | Größe an allen acht Griffen (Ecken und Seiten; Start/Ende symmetrisch), Position/Größe als Zahlen im Inspektor, senkrechte Text-Ausrichtung (`valign`), Knopf „Text bearbeiten“ + F2 |
| 2.16 | 2026-09-07 | Tabelle im Inspektor als Gitter mit Eingabefeldern (Enter = Zeile tiefer, Tab = nächste Zelle), Tabelle füllt ihre Höhe; acht neue Farben (14 gesamt, mit deutschen Namen im Tooltip) |
| 2.15 | 2026-09-07 | Faust-Zeiger beim Verschieben von Elementen und beim Schieben mit „Bewegen“ (vorher nur bei mittlerer Maustaste) |
| 2.14 | 2026-09-07 | Zahnrad oben rechts öffnet Einstellungen-Dialog: Tastenkürzel-Liste, Darstellung System/Hell/Dunkel (im Brett gespeichert, `meta/board.theme`), Infos (Fassung, Zähler, Grenzen, Hinweise für Claude). Ersetzt die Toast-Hilfe |
| 2.13 | 2026-09-07 | Strg+D dupliziert, Strg+C/V kopiert und fügt ein (Einzel- und Mehrfachauswahl samt Pfeilen, interne Ablage, 24 px Versatz je Einfügen); Duplizieren-Knopf läuft über denselben Weg `einfuegen()` |
| 2.12 | 2026-09-07 | Umbenennung Reißbrett → Pinit; Vorlage abgeschafft; Skill `pinit-veroeffentlichen` mit Bretter-Liste; neues Brett „Pinit · Allgemein Dashboard“ (privates Konto) |
| 2.11 | 2026-09-07 | Raster einstellbar: Klick auf „Raster“ öffnet An/Aus und Schrittweite 0–100 px (Vorgabe 24 = Punktabstand), je Betrachter gemerkt. Prüfliste zu 2.10 in `artefakte/PRUEFUNG-2.10-2026-09-07.md` |
| 2.10 | 2026-09-07 | Inspektor aufgeraeumt: vier klappbare Abschnitte (Einstellungen, Aussehen, Fuer Claude, Anordnen), Baustein-Art und Layout als Auswahlliste, Kennung oben, 232 px breit |
| 2.9 | 2026-09-07 | **Paket C (Seite):** Reiter-Typ (`sheets.type`), Einfrieren (`meta/board.frozen`, sperrt alle Schreibwege, Stand in die Ablage), Verweis + Status je Element (`link`, `status`) |
| 2.8 | 2026-09-07 | **Paket B:** Pfeil-Arten (Linie, Spitzen, Vererbungs-Dreieck, Endbeschriftungen 1:n), 8-px-Raster mit Schalter, Ausrichten/Verteilen/Gleiche Groesse fuer die Mehrfachauswahl; Seite scrollt nicht mehr waagerecht |
| 2.5 | 2026-09-07 | **Paket A/1:** Bildschirm-Rahmen (`frame`, Layout frei/Desktop/Tablet/Handy), Code-Kasten (`code`), Start/Ende-Kreise (`start`/`end`); zweite Werkzeugleiste |
| 2.6 | 2026-09-07 | **Paket A/2:** UI-Bausteine (`widget` mit `variant`: Knopf, Eingabe, Auswahl, Schalter, Liste, Menue, Bild) |
| 2.7 | 2026-09-07 | **Paket A/3:** Datenmodell/Klasse (`entity` mit `fields`/`methods`, Textfeld im Inspektor, Hoehe waechst mit) |
| 2.4 | 2026-09-07 | Tabelle wirklich bedienbar: Zellen mit Mindesthoehe, eigene Doppelklick-Erkennung (der Browser lieferte auf neu gebaute Elemente kein dblclick), Fokus ohne Scrollen, Inhalts-Textfeld im Inspektor (Zeile je Zeile, Spalten mit |). Neu zeichnen schliesst offenes Tippen sauber ab (Pruefschritt 8 als Code) |

**Details:** [`artefakte/HISTORIE-2026-09-07.md`](artefakte/HISTORIE-2026-09-07.md) — Bau-Protokoll
von 1.1, die 17 Nachträge der Plan-Brille (N1-N17) und die vollständige Befundliste des
ersten Code-Panels (R1-R4, O1-O6, G1-G11, alle abgehakt).

## Features & Status

**Ziel-Bild (2026-09-07, vom Nutzer bestätigt):** Das Brett ist das Werkzeug, mit dem Luis als
Softwareentwickler seine Software **skizziert** und die Skizze an Claude **übergibt**, der
daraus implementiert. Jedes Feature unten wird daran gemessen: hilft es Claude, aus der Skizze
richtig zu bauen? Reihenfolge = Pakete, so abgestimmt.

### Paket A — Software-Skizze (als Nächstes)
- [x] **A1 Bildschirm-Rahmen** (2.5) (`kind: "frame"`): Kasten mit Titelzeile, der „das ist eine
  Seite/ein Fenster“ bedeutet. **Layout wählbar** (Desktop, Tablet, Handy, frei) und
  **beschriftbar**. Elemente darauf gehören zur Seite (Mitnehmen gibt es schon).
- [x] **A2 UI-Bausteine** (2.6) (`kind: "widget"`, Feld `variant`): Knopf, Eingabefeld,
  Auswahlliste, Schalter, Liste, Menü/Reiterleiste, Bild-Platzhalter. Damit trägt ein
  Element seine **Bedeutung**, nicht nur einen Text.
- [x] **A3 Datenmodell / Klassen** (2.7; Beziehungs-Pfeile 1:n → B1) (`kind: "entity"`): Name oben, darunter Felder
  `name: Typ` (bei Klassen zusätzlich Methoden). Beziehungen als Pfeile mit
  **1:1 / 1:n / n:m** und Vererbung als eigene Pfeilart (→ B1).

### Paket B — Pfeile und Ordnung
- [x] **B1 Pfeil-Arten** (2.8) (Feld `style`/`ends` an `edges`): durchgezogen (Klick-Weg),
  gestrichelt (Datenfluss), gepunktet (Abhängigkeit); Spitze an einem, beiden oder keinem
  Ende; Vererbungs-Dreieck; Kardinalitäten als Endbeschriftung.
- [x] **B2 Raster und Ausrichten** (2.8): Einrasten beim Ziehen (8 px), Inspektor-Knöpfe für die
  Mehrfachauswahl: links/rechts/oben/unten ausrichten, gleiche Abstände, gleiche Größe.
- [x] **B3 Start-/Ende-Kreise** für Abläufe (2.5).

### Paket C — Übergabe an Claude
- [x] **C1 Reiter-Typ** (2.9) (Feld `type` an `sheets`): Bildschirm · Architektur ·
  Datenmodell · Ablauf. Der Lese-Skill wertet jeden Reiter passend aus.
- [x] **C2 Spezifikations-Export** (Skill `pinit-lesen … spec`, 2026-09-07; erster echter Lauf steht aus) (`pinit-lesen` ausbauen): je Bildschirm die Bausteine
  mit Bedeutung, je Datenmodell die Felder und Beziehungen, je Ablauf die Kette — als
  Arbeitsauftrag, nicht als Abzug. Konzept vor dem Bau.
- [x] **C3 Bausätze** (Skill `pinit-schreiben`, Abschnitt 5b, 2026-09-07; erster echter Lauf steht aus) (`pinit-schreiben` ausbauen): fertige Blöcke aufs Brett —
  Login-Seite, Liste mit Suche, Formular, CRUD-Datenmodell.
- [x] **C4 Stand einfrieren** (2.9; Datei-Ablage = Ablage/Clipboard statt `downloads`, damit die Zwei-Artifacts-Invariante unangetastet bleibt): Knopf „Einfrieren“ → das Brett ist **gesperrt**, auch für
  Claude: die Seite lehnt Änderungen ab (Hinweis), `pinit-schreiben` prüft die Sperre und
  bricht ab. Plus Ablage des Stands als Datei (`downloads`-Fähigkeit). Auftauen nur
  bewusst über einen zweistufigen Knopf. **Prämisse:** die Sperre liegt in `meta/board`
  (`frozen: true`), damit alle Betrachter und Claude dieselbe Wahrheit sehen.
- [x] **C5 Verweis und Status je Element** (2.9) (Felder `link`, `status`): Datei/URL und
  Ampel offen · in Arbeit · fertig. *(Vom Nutzer 2026-09-07 bestätigt.)*
- [x] **C6 Code-Kasten** (2.5): fester Zeichensatz für Beispiel-JSON, API-Antwort, SQL.

### To-do — später
- [ ] Bild einfügen (Screenshots). **Prämisse:** Dokumentgröße der Datenbank erst messen;
  eine `assets`-Fähigkeit steht dieser Umgebung nicht zur Verfügung.
- [ ] Rückgängig (→ N7, nur eigene letzte Aktion).
- [ ] Unsortiert aufräumen (→ E1, Preis).
- [ ] Freihand-Zeichnen (Datenmodell vorher klären, s. oben).
- [x] Smart Guides beim Verschieben (2.42, abschaltbar).
- [ ] Live-Zeiger (`room`).
- [ ] Warnung ab 800 Elementen.

<!-- Je Feature ein Eintrag (von den feature-* Skills gepflegt); nach Abschluss auf eine schlanke Zeile kollabieren.
     Muster für einen Eintrag — der Block liegt bewusst INNERHALB dieses Kommentars: als lebendes
     Markdown zaehlt ihn jeder Feature-Scan als echtes Feature namens "<Feature-Name>"
     (status-setzen.js-Blocksuche, parsePlanStatus des Orchestrators, jede Feature-Zaehlung).
     Herkunft: AUDIT_2026-07-31-0215 F2. WICHTIG beim Ergaenzen von Musterzeilen: hier drin darf
     KEIN schliessendes Kommentar-Token stehen (auch nicht in Anfuehrungszeichen oder Backticks) —
     HTML-Kommentare verschachteln nicht, das erste davon beendet diesen Block vorzeitig und macht
     alles darunter wieder zum Phantom-Feature. Erlaeuterungen darum in runden Klammern:

### <Feature-Name>
- **Status:** erstellt
- **Akzeptanzkriterium:** <funktioniert, wenn …>
- **Parallelität:** Welle <N> · hängt-ab-von: <feature|–> · schema-owner: <ja/nein>   (nur im Batch — mehrere Features aus einem /feature-neu; bei Einzel-Feature weglassen)
- **Plan → Historie:** `planung/PLAN-<slug>-<ts>.md` → `history/UMGESETZT-<slug>-<ts>.md`
-->

<!-- Ab hier die echten Feature-Einträge (von /feature-neu angefügt). -->

