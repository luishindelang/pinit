# Pinit

<!-- Projekt-„Verfassung" — immer geladen, schlank halten.
     Feste, entschiedene Invarianten stehen HIER (nicht in REGELN.md).
     Richtung/Status: @PLAN.md · später per /projekt-regel ergänzte Regeln: @REGELN.md -->
@PLAN.md
@REGELN.md

## Was ist das?
Whiteboard als Claude-Artifact für Prozess-Visualisierung und Mockups. Wird als HTML-Datei verteilt; jeder veröffentlicht daraus sein eigenes Brett mit eigenem Speicher.

- **Typ / Stack:** **Code** (Migration — Fassung 1.0 lief vor dem Anlegen) · Eine einzelne HTML-Datei, reines JS/CSS ohne Fremdbibliothek; Claude Artifact mit db-Capability.
- **Code-Herkunft:** lokal  <!-- lokal = code/ im Wiki mitversioniert · extern = eigener Git-Repo mit Remote, vom Wiki ignoriert (via code-extern-einrichten.js; s. Root-CLAUDE.md „Git ist lokal") -->
- **Kontext:** Ersatz für Microsoft Whiteboard (keine API) und Figma (dessen MCP — Model
  Context Protocol, die Schnittstelle, über die Claude ein Fremdwerkzeug bedient — ist im
  Free-Tarif nach wenigen Aufrufen aufgebraucht). Fassung 1.0 ist veröffentlicht und im
  Einsatz.

**Zwei Begriffe, die durchgehend vorkommen:** `capabilities` sind die Fähigkeiten, die eine
Artifact-Seite beim Veröffentlichen **deklariert** und die ihr die Laufzeit dann gewährt —
hier genau eine, `db`: eine kleine JSON-Dokument-Datenbank, die zu diesem einen Artifact
gehört, Änderungen in Echtzeit an alle offenen Betrachter verteilt und ein Republish der
Seite übersteht. Ohne die Deklaration (oder ohne Artifact-Laufzeit, z. B. Datei direkt im
Browser) liefert `claude.use("db")` `null` — dann läuft die Seite im **Modus ohne Speicher**
(im Code noch `vorlageModus()` genannt, Abzeichen „Vorlage“): ausprobieren ja, speichern nein.

## Die Veröffentlichungen (Artifact-URLs)
Ein Artifact kann nur das Konto aktualisieren, das es veröffentlicht hat — Luis hat zwei
(Arbeit und privat). Vollständige Liste mit Konto-Vermerk:
`~/.claude/skills/pinit-veroeffentlichen/bretter.json`.

| | URL | Konto | `capabilities` |
|---|---|---|---|
| **Pinit · Allgemein Dashboard** (privat, projektübergreifend, seit 2.12) | `https://claude.ai/code/artifact/f0313815-8831-4ec5-8613-9e28915e7051` | privat | `{db: {}}` |
| **Pinit** (Luis' erstes Brett, Arbeits-Rechner) | `https://claude.ai/code/artifact/cf961f04-6f2e-41d2-9d5a-eb3a1f8b1a04` | Arbeit | `{db: {}}` |

**Seit 2.11 gibt es keine „Vorlage“ mehr.** Die frühere zweite Veröffentlichung
„Reißbrett Vorlage“ (`b059cf88-e25b-4460-a703-6a8abf4dd1f5`, `capabilities {}`) wird **nicht
mehr gepflegt** und bleibt auf 2.10 stehen; die Kopie `reissbrett-vorlage.html` und der
Erzeuger `vorlage-erzeugen.js` sind gelöscht. *(Entschieden 2026-09-07 von Luis: eine Datei,
ein Artifact — einfacher zu entwickeln, und wer die Datei hat, veröffentlicht ohnehin selbst.)*

**Veröffentlichen läuft über den globalen Skill `pinit-veroeffentlichen`**
(`~/.claude/skills/pinit-veroeffentlichen/`, Liste aller Bretter in `bretter.json` daneben).
Ohne Angabe aktualisiert er **alle** Bretter, mit Name/URL eins, mit „neu <Name>“ legt er ein
Brett für ein anderes Projekt an (eigener Galerie-Name über eine Wegwerf-Kopie mit anderem
`<title>`, eigene Datenbank; URL landet in dessen `CLAUDE.md`). Regeln, die dahinterstehen:
die URL muss als `url` mitgegeben werden (sonst entsteht ein neues, leeres Artifact),
`capabilities` weglassen (die gespeicherte `{db:{}}` bleibt), `label` = Fassung, und
`pinit.html` wird für keinen Namen umgeschrieben — nur die Kopie.

**Zugriff von überall:** das Artifact hängt an Luis' Konto, nicht an diesem Ordner. Jede
Claude-Code-Sitzung in jedem Projekt kann mit der URL per `read_db`/`write_db` an die Daten —
darum liegen die Skills `pinit-lesen`/`pinit-schreiben` im Benutzer-Ordner.

**Wie ein Kollege die Datei überhaupt bekommt:** `code/pinit.html` wird **von Hand
weitergegeben** — Team-Laufwerk, Teams-Anhang, Datei-Freigabe. Es gibt bewusst keinen
automatischen Verteilweg (kein Remote, kein Paket): das Wiki ist rein lokal versioniert, und
ein Auto-Update ist ausdrücklich verworfen (s. `PLAN.md`, Roter Faden). Der Dateiname ist
frei wählbar, für die Veröffentlichung zählt nur der Inhalt.

**Wie ein Empfänger sein Brett aktualisiert** (es gibt kein Auto-Update — s. Invarianten):
er bekommt die neue `pinit.html`, vergleicht die Fassung in seiner Kopfzeile mit der
in der Datei und sagt seinem Claude: *„aktualisier mein Pinit mit dieser Datei, gleiche
URL, capabilities nicht anfassen."* **Sein Inhalt bleibt** — die Zeichnungen liegen in der
Datenbank des Artifacts, nicht in der Seite, und die übersteht ein Republish. Wer neu
anfängt, lässt die Datei einfach mit `capabilities {db:{}}` veröffentlichen.

## Was liegt wo (Code-Landkarte)
`code/` trägt zwei Dateien. Es gibt bewusst **keinen Build und keine Fremdbibliothek** —
die HTML ist das lieferbare Artefakt und muss ohne Werkzeug weitergegeben werden können.

- **`code/pinit.html`** — die **eine maßgebliche Quelle**. Selbsttragende Seite:
  Farbtoken (Hell/Dunkel) · Kopfzeile mit Fassungsnummer · Reiter-Leiste · Zeichenfläche
  (Verschieben/Zoomen) · Knoten (`box`, `sticky`, `diamond`, `text`) · Pfeile · Inspektor ·
  Speicher-Anschluss über `claude.use("db")`. Zugleich die Datei, die an Kollegen geht.
- **`code/undeklariert-pruefen.js`** — Prüfschritt 3: findet Zuweisungen an nie deklarierte
  Namen (Laufzeitfehler unter `"use strict"`, die `node --check` durchlässt).

Abschnitte in `pinit.html`, in der Reihenfolge der Datei (vollständig — wer hier etwas
ergänzt, hält die Liste mit):
1. `<style>`: Farbtoken für Hell/Dunkel, Kopfzeile, Reiterleiste, Knoten, Pfeile, Inspektor.
2. Markup: Kopfzeile mit Fassung und Werkzeugleiste · Reiterleiste `#tabs` · Zeichenfläche
   `#canvas`/`#layer` · Inspektor — seit 2.10 in **vier klappbaren Abschnitten** (`<details class="insp-sec">`,
   Zustand je Betrachter unter `rb.sec.<id>`, leere Abschnitte versteckt `sektionenAufraeumen()`):
   Kopf mit Bauart + **Kennung `#insp-id`** · `#sec-bauart` „Einstellungen“ (Baustein-Art und Layout als
   **Auswahllisten** `#widget-variant`/`#frame-layout`, Tabelle, Felder, Pfeil-Art, Ausrichten) ·
   `#sec-aussehen` (Farben, Textknöpfe in einer Reihe) · `#sec-claude` „Für Claude“ (Status, Verweis,
   **Notiz `#note-row`**; Punkt am Titel, wenn etwas gesetzt ist; zu per Vorgabe) · `#sec-anordnen`
   (vorn/hinten/duplizieren; zu per Vorgabe) · Löschen immer unten · Koordinaten · Statuszeile · Zoomleiste · Hinweis · Toast.
3. Modell: `FASSUNG`/`FASSUNG_DATUM`, `KINDS` (Vorgaben je Bauart, **inkl. `fs`/`bold`/
   `align`**, seit 2.3 auch `table`), `GRADE` + **`schriftgrad`/`fett`/`ausricht`/`gradStufe`** ·
   **`TBL_MAX_*`/`tabelleLeer`/`zellenKopie`/`zellenLesen`** (Zellen-Helfer, seit 2.3) (die drei Lesehelfer
   sind die EINE Stelle, an der "0 bzw. leer heißt Vorgabe" steht — `renderNodes` und die
   Inspektor-Knöpfe fragen beide sie, nicht das Feld), `COLORS`, `HOME`/`CATCH`/`CATCH_NAME`, die
   Zustands-Merker in Deklarationsreihenfolge (`tabEditing`, `armedDelete`, `sel`, `drag`,
   `editing`, `wartend`, `geladen`, `letzteWaisen`, `reiterAbgleichLief`; **`selSet`** seit 2.0
   direkt nach `sel` — die Mehrfachauswahl, nur vom Auswahl-Rahmen gefüllt; **`selEdges`** seit 2.2
   daneben für Pfeile, mit `mehrfach()` als der EINEN Frage „Sammel-Modus?“ — wer die
   Mehrfachauswahl leert, leert **beide** Mengen, das steht an zehn Stellen), `uid`,
   `topZ`/`bottomZ`. **`syncTot` steht nicht hier**, sondern bei „Speichern“ (Abschnitt 5)
   neben `syncGestorben` — dort, wo er gesetzt wird.
4. Reiter: `store`/`load` (Browser-Merker je Betrachter) · **`wirkReiter`/`waisenZahl`
   (Waisen-Regel)** · `sheetList`/`echteReiter`/`sheetName` · `refilter` ·
   `tabFeldAktiv`/`endTabRename` · `saveView`/`restoreView` · `switchSheet` ·
   `materializeHome`/`addSheet`/`renameSheet`/`armDelete`/`deleteSheet` · `renderTabs`.
5. Speichern: `setStatus`/`counts`/`offText` · **`syncTot`/`syncGestorben`** (ein
   Abonnement ist mit einem Fehler gestorben — die Meldung muss stehenbleiben) ·
   `saved`/`busy` · `track` (Zähler + Statuszeile) ·
   `putNode`/`putEdge`/`putSheet`/`dropDoc`/`putTitle`.
6. Geometrie: `center` · `border` (Rand-Schnittpunkt, Rechteck und Raute) · `bounds` ·
   `toBoard`.
7. Ansicht: `applyView`/`zoomAt`/`fit`.
8. Zeichnen: `fillOf` · `renderNodes` · `renderWires` (eine SVG-Ebene je Pfeil) ·
   `renderInspector` · `render`. Davor seit 2.3 **`textFuellen`** (Stichpunkt-Darstellung) und
   **`tabelleBauen`** (das `<table>` aus `cells`).
8b. Aufziehen + Textknöpfe (seit 1.5): `vorschauZeigen`/`vorschauWeg` (das gestrichelte
   Rechteck `#neu-vorschau`; es liegt in `#layer` und teilt darum die Brett-Koordinaten —
   `renderNodes` räumt nur `.node` und `.wire-svg` weg, es überlebt also einen Neuaufbau) ·
   `textFelderSetzen` (die Knöpfe zeigen immer den Zustand des Elements, nie einen eigenen
   Merker) · `textAendern` (der eine Schreibpfad der drei Textfelder; **kein**
   `catchGesperrt` — Ändern ist auf dem Auffang-Reiter erlaubt, nur Anlegen nicht).
9. Bearbeiten: **`catchGesperrt`** (die eine Stelle, an der das Anlege-Verbot des
   Auffang-Reiters sitzt — bewusst in der Funktion, nicht bei den Aufrufern) · `addNode` ·
   `beginEdit` · **`beginCellEdit`** (seit 2.3, Zelle einer Tabelle; setzt `editing.zelle`) ·
   `editEdgeLabel` · `removeSel` · `connect`. **Die drei Fokus-Zeitgeber** (`beginEdit`,
   `beginCellEdit`, `renameSheet`) räumen seit 2.3 nur den **eigenen** Merker auf: gehört
   `editing`/`tabEditing` inzwischen einem anderen Vorgang, fassen sie ihn nicht an — vorher
   löschte der Zeitgeber von A den frisch gesetzten Merker von B, und B bekam nie Blur/Tasten.
10. Werkzeuge: `TOOLS`, `setTool`, Farbfelder.
11. Maus (`mousedown`/`mousemove`/`mouseup`/`dblclick`/`wheel`) und Tastatur. **Die
    `drag`-Modi sind `pan`, `move`, `resize`, `link`, seit 1.5 `create` und seit 2.0 `marquee`**
    (`move` trägt seit 1.8 `kinder`, s. Bedienung; Helfer `mitnehmer()` steht direkt vor dem
    Maus-Abschnitt; `marquee` zeichnet `#auswahl-rahmen` über `rahmenZeigen`/`rahmenWeg` neben
    der Anlege-Vorschau und füllt beim `mouseup` `selSet` — Berühren reicht; genau ein Treffer
    wird zur Einzelauswahl `sel`). Werkzeug `hand` schiebt in `mousedown` sofort die Ansicht. — bei aktivem
    Anlege-Werkzeug merkt `mousedown` nur den Startpunkt, `mousemove` zeichnet die Vorschau,
    erst `mouseup` ruft `addNode`. Ein Klick ohne nennenswerte Bewegung (unter 20
    Brett-Pixeln in beiden Richtungen) nimmt die Standardgröße. Folge fürs Verhalten:
    solange man aufzieht, ist `drag` gesetzt und Schnappschüsse werden aufbewahrt
    (`warteGrund`) — das war vorher nicht so, weil Anlegen ein Wimpernschlag war.
12. Knöpfe, in Dateireihenfolge: Textknöpfe (`fs-minus`/`fs-plus`/`t-bold`/`al-left`/
    `al-center`/`al-right`, alle über `textAendern`) · Zoom · Löschen · Nach vorn ·
    Pfeiltext-Feld · **Tabellen-Knöpfe `tbl-row-plus`/`tbl-row-minus`/`tbl-col-plus`/`tbl-col-minus`**
    (seit 2.3, alle über `tabelleAendern`) · **Layout-Knöpfe** `#frame-row button[data-layout]` (2.5) ·
    **Baustein-Art** `#widget-row button[data-variant]` (2.6) · **Felder-Textfeld `entity-text`**
    (`commitEntity`, 2.7) · **Notiz-Feld `node-note`** (`commitNote`, seit 1.6 — Schreibpfad wie
    der Pfeiltext: `change` übernimmt, `Strg+Enter` schließt ab, `Esc` verwirft; **kein**
    eigener Warte-Merker, weil `renderInspector` den Wert nicht überschreibt, solange das
    Feld den Fokus hat) · **Kennung `insp-id`** (Klick kopiert `nodes/<id>` bzw.
    `edges/<id>`) · Nach hinten ·
    Duplizieren · Titel · `toast` · **`btn-help` (Zahnrad, seit 2.14 der Einstellungen-Dialog
    `#einst-hinter`/`#einst`: drei Seiten Tastenkürzel `KUERZEL`/Darstellung `#einst-theme`/Infos
    `einstInfoBauen()`; `einstZeigen()` öffnet/schließt, Esc im Fenster-Handler ganz oben, Klick auf
    den Hintergrund schließt; kein Browser-Dialog)** · `copyOut` ·
    **`btn-handoff`** (Übergabe an Claude) · `btn-mermaid` (Beschriftung seit 1.7 „Diagramm-Text“, die
    Kennung im Code bleibt).
13. Datenbank: **`pruefeAktivenReiter`** (gilt der offene Reiter noch?) ·
    **`warteGrund`/`abarbeiten`** (aufbewahrte Stände) ·
    `applyNodes`/`applyEdges`/`applySheets` · `vorlageModus` · `verbinden` und die
    Abonnements.

**Bedienung heute** (der Ist-Stand, damit man ohne Code-Lektüre planen kann). Seit 1.6 hat
jedes Element im Inspektor ein **Notiz-Feld** (Langtext, auf der Fläche nur als blaue Ecke
sichtbar) und eine **kopierbare Kennung** `nodes/<id>` bzw. `edges/<id>`; damit lässt sich
ein Element gegenüber Claude eindeutig benennen. Werkzeug oben
wählen, dann auf die Fläche klicken — mit aktivem Anlege-Werkzeug wird **immer** angelegt,
auch über einem bestehenden Element. Tastenkürzel `V` Auswählen · `H` Bewegen · `B` Schritt ·
`S` Notiz · `D` Entscheidung · `T` Beschriftung · `G` Tabelle · `A` Pfeil · **zweite Leiste `#tools2`
(Paket A, 2.5–2.7):** `R` Rahmen (Bildschirm; Layout im Inspektor `#frame-row`; kommt beim Anlegen
**hinter** alles, damit Bausteine darauf mitgehen) · `W` Baustein (Art im Inspektor `#widget-row`) ·
`E` Datenmodell (Felder/Methoden im Textfeld `#entity-text`, eine je Zeile, Leerzeile trennt; Höhe
wächst mit) · `C` Code · `1` Start · `0` Ende. **Paket B (2.8):** Pfeil-Art im Inspektor (Linie, Spitzen, Dreieck,
Enden beschriften; ein Schreibpfad `pfeilAendern`) · **Raster** — seit 2.11 einstellbar: Klick auf
„Raster“ unten rechts klappt `#raster-feld` auf mit An/Aus (`rb.raster`) und Schrittweite 0–100 px
(`rb.rasterschritt`, Vorgabe `RASTER_VORGABE` = 24 = Punktabstand des Hintergrunds; 0 = frei;
`rasterLesen()` kappt, `rasterAnzeigen()` ist die EINE Anzeige-Stelle, der Knopf zeigt „Raster 24“),
je Betrachter im Browser, wirkt beim Ziehen, Anlegen und Größe ändern (`snap()`) · **Ausrichten** im Sammel-Modus (`#align-row`, `ausrichten()`): Kanten,
Zentrieren, gleiche Abstände, gleiche Größe. `html, body` sind `overflow: hidden` — die Seite kann
nicht mehr waagerecht scrollen. **Paket C (2.9):** Reiter-Typ (Symbol am aktiven Reiter, Klick wechselt),
**Einfrieren** oben rechts (zweistufig; gesperrt lässt sich nur noch wählen, lesen, Kennung kopieren,
Reiter wechseln, auftauen), **Verweis + Status** je Element im Inspektor (`#meta-row`). **Tabelle** (seit 2.3):
Überschrift oben (Doppelklick auf die Überschrift tippt sie), erste Zeile fett als Kopfzeile,
Doppelklick in eine Zelle tippt sie, `Tab` springt zur nächsten Zelle, `Enter` schließt ab, `Esc`
verwirft; Zeilen und Spalten kommen über vier Knöpfe im Inspektor (`+ Zeile`, `− Zeile`, `+ Spalte`,
`− Spalte`, immer am Ende). **Seit 2.4** außerdem ein **Inhalts-Textfeld** im Inspektor (`tbl-text`):
eine Zeile je Tabellenzeile, Spalten mit `|` — der schnelle Weg, eine Tabelle zu füllen
(`zellenAlsText`/`textAlsZellen`/`commitTblText`). **Stichpunkte** in jedem Element: Zeile mit `- ` beginnen. **Mehrfachauswahl seit 2.0:** mit
`Auswählen` auf leerer Fläche einen Rahmen ziehen — alles, was der Rahmen **berührt**, ist
gewählt (`selSet` für Elemente, seit 2.2 `selEdges` für Pfeile — ein Pfeil zählt, wenn der Rahmen
seine gezeichnete Linie berührt, `strichTrifft()`; Sammel-Modus = `mehrfach()`); die Gruppe lässt sich zusammen verschieben, umfärben und löschen, der
Inspektor zeigt dann „N Elemente“. **`Umschalt`+Klick** (seit 2.1, `auswahlUmschalten()`) nimmt
ein Element dazu oder wieder heraus; `Umschalt` beim Rahmenziehen ergänzt statt zu ersetzen
(`drag.ergaenzen`). Ein Klick **ohne** Umschalt auf ein einzelnes Element, einen Pfeil oder
Griff leert die Mehrfachauswahl. **Die Ansicht verschiebt seit 2.0 nicht mehr das
Auswählen-Werkzeug**, sondern `Bewegen` (H) oder die mittlere Maustaste.
Doppelklick beschriftet ein Element oder einen Pfeil; `Strg+Enter` schließt ab, `Esc` bricht
ab. **Doppelklick auf leere Fläche legt einen Kasten an** (Schnellweg ohne Werkzeugwahl). `Entf` löscht die Auswahl.
**Seit 2.13:** `Strg+D` dupliziert, `Strg+C`/`Strg+V` kopiert und fügt ein — Einzel- wie Mehrfachauswahl,
Pfeile mit beiden Enden in der Auswahl kommen mit. Die Ablage ist **intern** (`ablage`, kein
System-Clipboard, damit Text-Kopieren in Feldern ungestört bleibt) und lebt nur bis zum Neuladen; jedes
`Strg+V` rückt 24 px weiter (`ablageEinfuegungen`). `auswahlPaket()` liest die Auswahl als Daten ohne
Kennungen, `einfuegen()` legt sie auf dem offenen Reiter an — das ist seit 2.13 der **eine** Anlege-Weg
für Duplizieren-Knopf, `Strg+D` und `Strg+V` (mit `gesperrt()` und `catchGesperrt()`).
**Doppelklick wird seit 2.4 selbst erkannt** (`letzterKlick` im `mousedown`, 400 ms, gleiches Element,
nur mit Auswählen-Werkzeug; der eine Öffnungsweg heißt `oeffneZumTippen`): der erste Klick baut per
`render()` alle Elemente neu, der zweite trifft ein anderes DOM-Element, und der Browser erzeugt dann
**kein** natives `dblclick` (real gemessen: mousedown/mouseup auf der Zelle, kein click, kein dblclick).
Das native `dblclick` bleibt als zweiter Weg drin und läuft über dieselbe Funktion.
**Verschieben nimmt mit** (seit 1.8): ein Element zieht alles mit, was **ganz in ihm liegt** und **vor ihm**
(gleiches oder höheres `z`) — so wird eine große Notiz „nach hinten“ zum Träger für das, was darauf
liegt. `Alt` beim Anfassen bewegt nur das Element selbst. Kein Gruppen-Feld in der Datenbank: die
Zugehörigkeit wird beim `mousedown` aus der Geometrie berechnet (`mitnehmer()`), die Kinder stehen
in `drag.kinder` und werden beim `mouseup` einzeln gespeichert. Mausrad zoomt, Umschalt+Mausrad schiebt waagerecht, Strg+Mausrad senkrecht (2.19). Ecke ziehen ändert die Größe. Reiter: `+` legt
an (Name wird direkt getippt), Doppelklick benennt um, `×` am aktiven Reiter löscht
zweistufig. Der Auffang-Reiter „Unsortiert“ ist gestrichelt abgesetzt und kursiv, lässt sich
nicht umbenennen, nicht löschen, und **auf ihm kann nichts angelegt werden** — er ist eine
Ablage, kein Arbeitsort. Kein Rückgängig.

**Datenschema der Artifact-Datenbank** (das ist der Vertrag, nicht die Seite):
- `nodes/<id>`: `kind` box|sticky|diamond|text|**table** (seit 2.3)|**frame|code|start|end** (2.5)|
  **widget** (2.6)|**entity** (2.7) · `x` `y` `w` `h` · `text` · `color`
  (bis 2.15: slate|amber|mint|rose|lilac|plain; **seit 2.16 auch** sky|teal|lime|orange|coral|violet|sand|
  graphite — `COLORS`/`COLOR_NAMES`, Token `--f-<name>`/`--s-<name>` in allen DREI Farbblöcken;
  eine ältere Fassung zeigt bei unbekanntem Namen die Vorgabefarbe der Bauart) · `z` · `sheet` · **`fs` `bold` `align`**
  · **`valign`** (2.17: "" = Vorgabe mittig | top | middle | bottom, `valignLesen()`/`senkrecht()`; wirkt nur bei
  Bauarten mit frei gesetztem Text, `senkrechtMoeglich()` — nicht bei table/entity/frame/start/end/Liste/Menü)
  (seit 1.5, Textdarstellung) · **`note`** (seit 1.6: freier Langtext bis 4000 Zeichen,
  auf der Fläche nur als Ecke oben rechts markiert, im Inspektor lesbar — der Ort für
  Details und für Notizen von Claude; fehlt oder leer = keine Notiz) · **`cells`** (seit 2.3, nur
  bei `kind: "table"`: Array von Zeilen, jede Zeile ein Array von Strings; erste Zeile = Kopfzeile;
  `text` ist die Überschrift der Tabelle; Grenzen 20×10, 200 Zeichen je Zelle; ein fremdes Format
  wird beim Einlesen rechteckig gemacht, `zellenLesen()`) · **`layout`** (nur `frame`: frei|desktop|
  tablet|handy — setzt die Größe einmal, `LAYOUTS`) · **`variant`** (nur `widget`: button|input|select|
  toggle|list|menu|image — die **Bedeutung** des Bausteins, `VARIANTS`; `text` ist die Beschriftung, bei
  `list` eine Zeile je Eintrag, bei `menu` Einträge mit `|`) · **`fields`/`methods`** (nur `entity`:
  Arrays kurzer Strings, `text` ist der Name; Grenzen 30 Einträge à 120 Zeichen, `listeLesen()`).
  `code` hält reinen Text in Schreibmaschinenschrift (keine Stichpunkt-Deutung), `start`/`end` sind
  Kreise ohne Text (`ohneText()`, Pfeile enden am Ellipsenrand in `border()`) · **`link`** (2.9, bis
  300 Zeichen: Datei, URL, Ticket — im Tooltip, im Inspektor) · **`status`** (2.9: "" | offen | arbeit |
  fertig, `statusLesen()`; Punkt oben links rot/gelb/grün). **Stichpunkte sind reiner Text:** eine
  Zeile, die mit `- `, `* ` oder `• ` beginnt, wird nur bei der Anzeige als Punkt gesetzt
  (`textFuellen()`), gespeichert bleibt die Zeile roh — kein eigenes Feld. Eine Fassung vor 2.3
  kennt `table` nicht und lässt solche Elemente stumm weg (`if (!KINDS[v.kind]) return`). Alle drei sind **Abweichungen von der Vorgabe der Bauart**,
  nicht der Wert selbst: `fs` 0 = Vorgabe (13 px, bei `text` 17), sonst 1-96 · `bold`
  0 = Vorgabe, 1 = fett, 2 = normal (dreiwertig, weil `text` von Haus aus fett ist und
  sich auch normal stellen lassen muss) · `align` "" = Vorgabe (`center`, bei `text`
  `left`), sonst left|center|right. Ein Brett aus einer Fassung vor 1.5 hat die Felder
  nicht und liest sich darum wie vorher — das ist die rückwärtsverträgliche Erweiterung,
  die das Datenschema verlangt.
- `edges/<id>`: `from` · `to` · `label` · `sheet` · **seit 2.8** `style` solid|dashed|dotted ·
  `ends` to|both|none · `head` arrow|triangle (hohles Dreieck = Vererbung) · `fromLabel`/`toLabel`
  (bis 12 Zeichen, Kardinalitäten wie „1“/„n“ an den Enden). Ein Pfeil ohne diese Felder liest
  sich als durchgezogen mit Spitze am Ziel (`pfeilFelder()` ist die EINE Stelle für die Vorgaben).
- `sheets/<id>`: `name` · `order` · **`type`** (2.9: "" | screen | arch | data | flow, `sheetTypeLesen()`;
  Symbol vor dem Reiternamen, Klick auf das Symbol des aktiven Reiters wechselt durch) — fehlt die
  Sammlung, gilt ein impliziter Reiter `haupt`;
  ein fehlendes `sheet` am Knoten/Pfeil zählt als `haupt` (so bleiben Bretter aus Fassungen
  vor den Reitern lesbar)

**Waisen-Regel (seit Fassung 1.1, Helfer `wirkReiter()`).** Der **wirksame** Reiter eines
Elements ist der eigene, **wenn es diesen Reiter gibt** — sonst der Auffang-Reiter
`_unsortiert` (Anzeigename „Unsortiert“). Ist überhaupt kein Reiter benannt, gilt `haupt`.
Der Auffang-Reiter ist **virtuell**: es gibt **kein** Dokument `sheets/_unsortiert`,
`sheetList()` erzeugt ihn und nur dann, wenn wirklich Waisen daliegen; er steht immer als
letzter, trägt die Anzahl und ist nicht umbenennbar und nicht löschbar. Ein hereinkommendes
Dokument mit der Kennung `_unsortiert` wird beim Einlesen **verworfen**.
**Ladewettlauf:** `nodes`, `edges` und `sheets` sind **drei getrennte Abonnements**, die zu
unterschiedlichen Zeiten eintreffen. Ob der Auffang-Reiter angezeigt werden darf, hängt an
den **Elementen** (gibt es Waisen?) — die Entscheidung darf also nicht fallen, solange die
noch nicht da sind. Dafür gibt es den Merker `geladen`: er wird erst gesetzt, wenn ein
Stand **server-endgültig** ist (`metadata.fromCache === false`), und solange er aussteht,
gilt der Auffang-Reiter als gültig. Ohne das sprang ein Betrachter beim Laden vom
Auffang-Reiter weg und **überschrieb dabei seine gemerkte Reiter-Wahl**.

**Die übrigen Merker in einem Satz:** `letzteWaisen` — die Waisenzahl, einmal je
`sheetList()` gerechnet, damit `renderTabs()` nicht ein zweites Mal über alle Elemente
läuft. `reiterAbgleichLief` — unterscheidet den **ersten** Reiter-Abgleich nach dem
Verbinden (dort wechselt die Seite still: niemand hat gelöscht, der gemerkte Reiter
existiert nur nicht mehr) von einem **echten** erzwungenen Wechsel (dort gibt es einen
Hinweis). `syncTot` — ein Abonnement ist mit einem Fehler gestorben; solange er steht,
überschreibt **nichts** mehr die Statuszeile, auch kein fehlgeschlagener eigener
Schreibvorgang.

**Wichtig für Schreiber** (Claude über `write_db`, ein Import, jeder Automat):
- Das `sheet`-Feld wird beim Löschen eines Reiters **nicht** umgeschrieben. Die Auflösung
  passiert nur beim Anzeigen. Genau daran hängt die Umkehrbarkeit — ein Reiter mit derselben
  Kennung holt die Elemente zurück.
- **Reiter vor den Elementen anlegen.** Wer ein Element mit einem `sheet` schreibt, für das
  noch kein `sheets/<id>` existiert, sieht es sofort auf „Unsortiert“ — ohne Fehlermeldung.
  Bei einem Batch also erst die `sheets`-Dokumente, dann `nodes`/`edges`.
- **Kein Dokument `sheets/_unsortiert` anlegen.** Es wird beim Einlesen verworfen (der
  Auffang-Reiter ist virtuell), zählt aber dauerhaft gegen die 5.000-Dokumente-Grenze und
  lässt sich über die Oberfläche **nicht** löschen — nur per `write_db delete`.
- **Auf dem Auffang-Reiter legt die Oberfläche nichts an** (seit Fassung 1.2): ein Element
  mit dieser Kennung käme nie auf einen echten Reiter, weil es diesen Reiter nie geben kann.
  Schreiber setzen sie darum ebenfalls nicht.
**Grenzen des Ladens:** die Seite abonniert `nodes` und `edges` mit `limit(1000)` und
`sheets` mit `limit(200)` — **brettweit über alle Reiter**, nicht je Reiter. Und zwar als
**Fenster nach Dokument-Kennung**: der Plattform-Vertrag sortiert eine Abfrage ohne
`orderBy` aufsteigend nach Kennung, und `uid()` baut die Kennung aus der Uhrzeit — jenseits
der Grenze hält das Fenster also die **ältesten** Elemente, und **neue Arbeit taucht
dauerhaft nicht mehr auf**, nicht bloß irgendwelche. Ohne Fehlermeldung. Eine Warnung ab 800 ist ein
Feature-Kandidat, kein heutiges Verhalten. Textfelder werden beim Einlesen gekappt
(Element 2000, Pfeil 200, Reitername 80 Zeichen).
- `meta/board`: `title` · **`frozen`** (2.9, boolean) · **`theme`** (2.14: "system" | "light" | "dark",
  `themeLesen()`; gilt für alle Betrachter, `themeAnwenden()` setzt `data-theme` am Root — bei
  "system" wird das Attribut entfernt und die Wahl des Artifact-Rahmens gilt). `putBoard(title, frozen,
  theme)` schreibt **immer alle drei**. **Eingefroren heißt: niemand ändert etwas — auch
  Claude nicht.** Die Seite sperrt alle Schreibwege (`gesperrt()` an jedem Erzeuger/Änderer, `body.frozen`
  legt Inspektor, Werkzeuge, Reiter-Knöpfe und Titel stumpf, `track()` schreibt als letzte Verteidigung
  nichts außer dem Auftauen), zeigt das Abzeichen EINGEFROREN und legt beim Einfrieren den Stand als JSON
  in die Ablage (`brettAlsJSON()`, dieselbe Nutzlast wie die Übergabe). `write_db`-Schreiber (der Skill
  `pinit-schreiben`) lesen `meta/board` zuerst und brechen bei `frozen: true` ab. `set()` auf `meta/board`
  ersetzt das ganze Dokument — **immer `title` und `frozen` zusammen schreiben** (`putBoard`).

## Feste Invarianten (Verfassung — nur bewusst per Hand / `projekt-neu` ändern)

- **Eine Datei, keine Abhängigkeiten — mit genau einer Ausnahme.** Kein Build, kein
  Paketmanager, keine JS-/CSS-**Bibliothek** vom CDN, keine Laufzeit-Abfrage an einen
  fremden Dienst. Die Seite wird per Datei weitergegeben und beim Empfänger unverändert
  veröffentlicht; alles Nötige liegt darin.
  **Die Ausnahme sind Web-Schriften** (Google Fonts, Zeile 2-3 der HTML): sie sind kein
  Code, es gibt eine Rückfall-Schriftenliste, und die Seite ist ohne Netz **voll
  funktionsfähig** — sie sieht nur anders aus. In gesperrten Umgebungen (Firewall, WDAC)
  ist das bewusst akzeptiert. Wer exakte Darstellung braucht, kann die Schriften einbetten;
  das ist dann eine Größen-gegen-Treue-Abwägung, keine Fehlerbehebung.
  *(Entschieden 2026-09-07 als E3, nachdem zwei Review-Brillen den Widerspruch zwischen
  dem alten Wortlaut und der eigenen HTML gemeldet hatten.)*
- **`code/pinit.html` ist die einzige Quelle und das einzige Artifact.** Keine
  erzeugte Kopie, keine zweite Veröffentlichung. *(Bis 2.10 gab es eine „Vorlage“ als
  zweites Artifact ohne `db`; 2026-09-07 bewusst abgeschafft.)* Der Modus ohne Speicher
  bleibt im Code: er greift, wenn `claude.use("db")` `null` liefert oder `claude` fehlt
  (Datei lokal geöffnet) — so bleibt die Datei lokal testbar.
- **Die Fassungsnummer wird bei JEDER Änderung an `pinit.html` hochgezählt**
  (`FASSUNG` + `FASSUNG_DATUM` im Skript, sichtbar in der Kopfzeile). Sie ist das einzige
  Mittel, um verteilte Bretter auseinanderzuhalten — es gibt kein Auto-Update.
- **Keine Browser-Dialoge.** Kein `prompt()`, `confirm()` oder `alert()` — Artifact-Rahmen
  blockieren sie, das Merkmal wäre stumm tot. Eingaben laufen inline, Bestätigungen
  zweistufig, Kopieren mit `execCommand("copy")` als Rückfallweg.
- **Ein neues Verhalten über mehrere parallele Stellen: alle Stellen aufzählen und einzeln
  gegenprüfen, bevor „erledigt“ gilt.** Ein grüner Test an einer Stelle beweist nichts über
  die anderen. Diese Fehlerklasse hat in diesem Projekt **fünfmal** zugeschlagen, in zwei
  Formen:
  · **Eine Funktion, mehrere Aufrufer** → in die Funktion legen. So gelöst beim
    Anlege-Verbot (`catchGesperrt()` in `addNode()`/`connect()`; in Fassung 1.2 stand es an
    einem von drei Wegen, und der Test prüfte genau den geschützten).
  · **Mehrere gleichrangige Geschwisterfunktionen** → da gibt es keine „eine Funktion“, in
    die man es legen könnte; hier hilft nur eine Liste und Stück-für-Stück-Prüfung. So bei
    `applyNodes`/`applyEdges`/`applySheets` (zweimal getroffen: Wächter und
    Gültigkeitsprüfung) und bei `saved`/`busy`/`render`/`track` (die `syncTot`-Prüfung
    fehlte in `track`).
  **Die Suchfrage muss auf die Sache zielen, nicht auf den Namen.** „Wer ruft `addNode`?“
  fand den Duplizieren-Knopf nicht — der baut sein Element selbst. Richtig war
  „wer legt Dokumente an?“ (`allNodes.set|allEdges.set`).
- **`node --check` ist kein Ladetest.** Es prüft nur die Syntax. Eine Zuweisung an einen
  nicht deklarierten Namen ist unter `"use strict"` ein **Laufzeit**-Fehler und kommt
  durch — so ist Fassung 1.3 mit einem gebrochenen `pruefeAktivenReiter()` live gegangen.
  Dafür gibt es jetzt `code/undeklariert-pruefen.js` (Schritt 3 der Test-Konvention).
- **Ein Reiter zu löschen darf keinen Inhalt vernichten.** `deleteSheet` entfernt **nur**
  `sheets/<id>`; die Elemente bleiben unangetastet und erscheinen über die Waisen-Regel auf
  „Unsortiert“. Wer hier je wieder Elemente mitlöscht, baut die Datenverlust-Klasse aus
  Fassung 1.0 zurück (R1). *(Entschieden 2026-09-07 als E1.)*
- **Ein einziger Abarbeitungs-Pfad für aufbewahrte Stände.** Trifft ein Stand ein, während
  getippt oder gezogen wird, wird er **aufbewahrt** (`wartend`) und in `abarbeiten()`
  angewendet — nie verworfen. `warteGrund()` prüft `editing || drag || tabFeldAktiv() || writes > 0`
  (**`writes > 0` seit 1.9**: eigene offene Schreibvorgänge zählen als Warte-Grund, sonst rücken
  nach „Verschieben nimmt mit“ die Kästen einzeln nach — jeder `set()` liefert einen Stand, in dem
  die anderen noch alt sind; `track()` ruft `abarbeiten()`, sobald `writes` auf 0 fällt, und eine
  **Notbremse** in `aufbewahren()` wendet nach 3 s trotzdem an, falls ein Schreibvorgang hängt);
  **das Umbenennen eines Reiters hängt an einer eigenen Variablen**, ein Wächter aus
  `editing || drag` allein schützt es nicht. Neue Wartestellen tragen `abarbeiten()` nach.
  *(E2 + N2.)*
- **Kein Fokus über `requestAnimationFrame`.** Feuert nicht, wenn das Fenster nicht malt;
  ein vorher gesetzter Merker klemmt dann dauerhaft. `setTimeout(…, 0)` plus einen Merker,
  der gegen `document.activeElement` gegengeprüft wird. **Fokus immer mit
  `{ preventScroll: true }`** — ein nacktes `focus()` hat den `body` um 219 px verschoben (2.4).
- **Neu zeichnen schließt offenes Tippen ab.** `render()` baut alle `.node` neu; ein offenes
  Textfeld verschwände aus dem DOM, sein Blur käme nie, der Merker klemmte. Darum trägt
  `editing` seit 2.4 `el` und `finish`, `renderNodes` ruft `offenesTippenAbschliessen()` (Text
  wird übernommen), und `bedienWarteGrund()` verwirft einen Merker, dessen Feld nicht mehr im DOM
  hängt. Das ist Prüfschritt 8 als Code. Wer Zellen umbaut (`commitTblText`, `tabelleAendern`),
  schließt vorher ausdrücklich ab, sonst schreibt die alte Zelle in die neuen Zellen.
- **Der Inhalt lebt in der Datenbank, nicht in der Seite.** Ein Seiten-Update ist darum
  gefahrlos: Bretter überleben ein Republish. Umgekehrt heißt es, dass das Datenschema
  oben nur rückwärtsverträglich erweitert werden darf.
- **Test-Konvention:** Es gibt keine automatisierten Tests (eine HTML-Datei, kein Runner).
  Verifiziert wird von Hand. **Neun Schritte, in dieser Reihenfolge.** Lokal an der Datei laufen
  **1-5, 8 und 9**; das **veröffentlichte** Artifact brauchen nur **6 und 7**:

  1. **Entfällt seit 2.11** (war: Vorlage-Kopie erzeugen). Nummer bleibt, damit die
     Nachweise unten weiter stimmen.
  2. **Skript-Syntax.** Nur der `<script>`-Block (Inline-Handler in HTML-Attributen gibt es
     bewusst keine), mit genau diesem Kommando:
     ```bash
     node -e "const fs=require('fs');fs.writeFileSync('rb.js',fs.readFileSync('pinit.html','utf8').match(/<script>([\s\S]*)<\/script>/)[1])" && node --check rb.js && rm rb.js
     ```
  3. **Undeklarierte Zuweisungen.** `node code/undeklariert-pruefen.js` — muss für beide
     Dateien „ok“ melden. **Warum als eigener Schritt:** `node --check` aus Schritt 2 prüft
     nur die Syntax; eine Zuweisung an einen nie deklarierten Namen ist unter
     `"use strict"` ein **Laufzeit**-Fehler und kommt durch. Genau so ging Fassung 1.3 mit
     einem gebrochenen `pruefeAktivenReiter()` live — lokal unauffällig, weil der Pfad nur
     mit echter Datenbank läuft.
  4. **Fassungsnummer** in `FASSUNG` hochgezählt und in der Kopfzeile sichtbar.
  5. **Die sieben lokalen Wege im Browser** (Datei direkt öffnen): Element anlegen +
     beschriften · Pfeil ziehen + beschriften · Notiz groß ziehen und „nach hinten"
     (Pfeile müssen sichtbar bleiben) · Reiter anlegen, umbenennen, umschalten (Inhalte
     müssen getrennt bleiben) · Hell/Dunkel umschalten · **Größe aufziehen** (Werkzeug
     wählen, Rechteck ziehen → das Element hat genau diese Größe; ein einzelner Klick →
     Standardgröße) · **Textknöpfe** (A−/A+ ändern den Grad, B schaltet fett **in beide
     Richtungen** — auch eine Beschriftung, die von Haus aus fett ist, muss normal werden
     können —, die drei Ausrichtungs-Knöpfe zeigen nach dem Klick den neuen Zustand).
     **Achtung beim Prüfen mit Automatik:** ein synthetisches „ziehen" liefert oft kein
     `mouseup`, und ein synthetischer Doppelklick oft kein `dblclick`. Bleibt die Vorschau
     stehen oder öffnet sich das Textfeld nicht, ist erst das **Messwerkzeug** verdächtig,
     nicht der Code (2026-09-07 real: beides lief, das Werkzeug schickte die Ereignisse
     nicht).
  6. **Modus ohne Speicher — lokal, Datei direkt im Browser.** Abzeichen **VORLAGE** in der
     Kopfzeile, Statuszeile „Vorlage – nichts wird gespeichert", und **den Knopf „Eigenes
     Brett anlegen" wirklich KLICKEN**: es muss ein Toast kommen und Text in der Ablage
     liegen. **Nur zu prüfen, dass der Knopf sichtbar ist, reicht nicht** — genau so ist in
     Fassung 1.1 ein toter Knopf durchs Gate gekommen. *(Seit 2.11 ohne zweites Artifact;
     der `null`-Zweig von `claude.use("db")` ist damit nur noch theoretisch, lokal greift
     der `catch`-Zweig — beide landen in `vorlageModus()`.)*
  7. **Zwei Betrachter — am veröffentlichten Brett.** Nur so sind die
     Nebenläufigkeits-Fixes überhaupt prüfbar; alle Schritte davor sind
     Ein-Betrachter-Wege. Dasselbe Brett in **zwei Browser-Fenstern** öffnen, dann:
     · in A ein Element beschriften und im Feld bleiben; in B ein *anderes* Element
       verschieben; A abschließen → die Änderung aus B muss **sofort** erscheinen.
     · in A tippen; in B einen Reiter umbenennen → A darf den Cursor **nicht** verlieren,
       und nach dem Abschließen muss der neue Reitername da sein.
     · bei zwei Reitern in A den einen und in B den anderen löschen → danach müssen
       **alle** Elemente auf „Unsortiert" stehen, und das Brett darf **nicht** leer
       aussehen.
     · **Bewusst erwartet:** ändern beide dasselbe Element, **flackert** es beim Abschließen
       einmal (kurz der fremde Text, dann der eigene). Das ist kein Fehler — der eigene
       Schreibvorgang gewinnt, der aufbewahrte Stand wird danach angewandt.
     **Kann Claude nicht selbst ausführen** — die Domain `claude.ai` ist im Browser-Fenster
     per Richtlinie gesperrt. Dieser Schritt gehört dem Menschen.
  8. **Lokale Aktion während einer offenen Texteingabe** (ein Betrachter reicht): Text
     eingeben und **ohne** abzuschließen eine andere Aktion auslösen — Farbe wählen,
     Duplizieren, „nach vorn", Reiter wechseln. Danach muss der Editier-Zustand sauber
     beendet sein, der getippte Text stehen, und weitere Eingaben müssen wieder gehen.
     Prüft, dass kein Warte-Merker klemmt. *(Ergänzt 2026-09-07 aus Panel-Befund P14 —
     alle Interleaving-Schritte davor sind Zwei-Betrachter-Fälle, dieser Fall war
     ungeprüft.)*
  9. **Rot-Gegenprobe der Kommandos.** Ein Kommando, das ohne Zutun grün meldet, gehört
     nicht in ein Gate. Darum die Kommandos aus Schritt 2-3 einmal mit absichtlich kaputtem
     Input: `node --check` über ein Skript mit zerstörter Funktionssignatur → muss **rot**
     werden (Exit ≠ 0); `undeklariert-pruefen.js` mit einer entfernten Deklaration → muss
     **einen Fund** melden.

  **Ausführungs-Nachweise** (kein Schritt, sondern das Protokoll — hier fortschreiben):
  - **Fassung 1.0, 2026-09-07:** Schritte 1, 2, 4 grün (inkl. Dunkelmodus über
    `data-theme="dark"`: Kopfzeile, Reiter, Fläche, Kasten, Raute, Inspektor, Statuszeile).
    Schritt 5 vom Nutzer am echten Vorlage-Artifact gesichtet — allerdings **ohne** den
    Knopf zu klicken, weshalb P1 durchkam. Nicht belegt: Pfeil-Beschriftung im Dunkelmodus
    und der `prefers-color-scheme`-Zweig (die Vorschau-Umgebung stellt für lokale Dateien
    nur den `data-theme`-Zweig; beide Zweige setzen dieselben Token).
  - **Fassung 1.1, 2026-09-07:** Schritte 1, 2, 3, 8 grün. Waisen-Regel am laufenden Brett
    gemessen (Reiter gelöscht → `Unsortiert (1)`, Elementzahl unverändert), Umkehrbarkeit an
    der Datenbank belegt (das Element trägt nach dem Löschen weiter seine alte
    Reiter-Kennung). Schritte 5-7 **nicht** gelaufen — daraus fielen im Code-Panel P1
    (toter Knopf), P2 und P14.
  - **Fassung 1.2, 2026-09-07:** Schritte 1, 2, 3, 8 grün (Rot-Gegenprobe: `node --check`
    wird bei zerstörter Signatur rot). Schritt 4 lokal gefahren. **Der neue Schritt 5 hat
    seinen Zweck gleich erfüllt:** der Übergabe-Knopf wurde diesmal *geklickt* — kein Wurf,
    1753 Zeichen in der Ablage, Toast erscheint, die Nutzlast trägt die echten Feldnamen und
    keine alten. Ebenfalls gemessen: Reiter löschen → `Unsortiert (1)` gestrichelt markiert,
    Elementzahl unverändert, Zähler „auf 1 Reiter · 1 auf Unsortiert“; auf dem
    Auffang-Reiter kein Anlege-Zeiger und Anlegen wird mit Hinweis abgelehnt, auf einem
    echten Reiter geht es. **Schritte 6 und 7 stehen aus** — Schritt 6 braucht zwei
    Betrachter am veröffentlichten Brett (kann Claude nicht), Schritt 7 ist ein lokaler
    Ein-Betrachter-Ablauf und beim nächsten Lauf fällig.
  - **Fassung 1.3, 2026-09-07:** Schritte 1, 2, 3, 8 grün. **Der 🔴 aus 1.2 ist behoben und
    an allen drei Wegen belegt** — auf dem Auffang-Reiter blockieren jetzt Werkzeug+Klick,
    **Doppelklick auf leere Fläche** und **Pfeil zwischen zwei Waisen**, jeweils mit
    Hinweis; in 1.2 waren die letzten zwei offen, weil das Verbot beim Aufrufer statt in der
    Funktion saß. **Gegenprobe gemacht:** auf einem echten Reiter legen alle drei Wege
    weiter an und der Pfeil entsteht (5 Elemente, 1 Pfeil) — das Verbot ist nicht zu weit
    geraten. Ebenfalls gelaufen: Reiter mit zwei Elementen gelöscht → `Unsortiert (2)`,
    Elementzahl unverändert, Zähler „auf 1 Reiter · 2 auf Unsortiert“.
    **Schritte 5, 6 und 7 stehen aus** — 6 und 7 brauchen das veröffentlichte Artifact und
    zwei Betrachter (kann Claude nicht), 5 ist lokal und beim nächsten Lauf fällig.
    *(Nummern 2026-09-07 auf die Neun-Schritt-Zählung gezogen; zur Bauzeit hieß die
    Vorlage-Prüfung noch 5 und die Zwei-Betrachter-Prüfung noch 6.)*
  - **Fassung 1.4, 2026-09-07 (Notfall):** Schritte 1, 2, 3, 9 grün. Anlass war der 🔴 des
    1.3-Panels: eine nie deklarierte Variable, die am **veröffentlichten** Brett jeden
    Schnappschuss scheitern ließ. Dafür ist Schritt 3 (`undeklariert-pruefen.js`) überhaupt
    entstanden — **rot gegengeprüft**, indem die Deklaration wieder entfernt wurde. Zweiter
    🔴: der Duplizieren-Knopf war ein vierter Anlege-Weg ohne Schutz; gefunden über die
    richtige Suche (`allNodes.set|allEdges.set`, nicht `addNode(`).
  - **Fassung 1.5, 2026-09-07:** Schritte 1, 2, 3, 4, 5 und 9 grün — **erstmals auch
    Schritt 5 durch Claude selbst**, weil die lokale Datei im Vorschau-Fenster läuft.
    Belegt: Notiz auf 326×208 aufgezogen (genau die gezogene Größe), einzelner Klick →
    Standardgröße 220×34, Text eingegeben und sichtbar, A+ zweimal → 13 → 14 → 16 px,
    B setzt `font-weight: 700` und an der Beschriftung wieder `400` (beide Richtungen),
    Ausrichtung links wirkt auf Element **und** Knopf-Zustand, Pfeil gezogen → beim
    ausgewählten Pfeil ist die Textzeile verborgen und die Pfeiltext-Zeile sichtbar,
    „nach hinten“ lässt den Pfeil sichtbar, Dunkelmodus lesbar. **Rot-Gegenproben (Schritt
    9) diesmal für vier Kommandos:** `node --check`, `undeklariert-pruefen.js`,
    `vorlage-erzeugen.js` **und das Patch-Werkzeug** — letzteres brach bei einem falschen
    Anker ab und ließ die Datei nachweislich unverändert (`cmp`). Genau dieser Fehlermodus
    hatte 1.3 kaputt live gebracht.
    **Schritte 6, 7 und 8 stehen aus** — 6 und 7 brauchen das veröffentlichte Artifact und
    zwei Betrachter (kann Claude nicht), 8 ist beim nächsten Lauf fällig.
  - **Fassung 1.6, 2026-09-07:** Schritte 1, 2, 3, 4, 9 grün (Rot-Gegenproben: `node --check`
    bei zerstörter Signatur rot, `vorlage-erzeugen.js` ohne Titel-Anker bricht ab, das
    Patch-Werkzeug bricht bei fehlendem Anker ab — beim ersten Lauf wirklich passiert, ein
    geschütztes Leerzeichen im Anker). Schritt 5 teilweise im Vorschau-Fenster: Kasten
    angelegt, Notiz eingetragen → Ecke oben rechts erscheint, Tooltip trägt den Text,
    Inspektor zeigt `nodes/<id>`; `Entf` im Notizfeld löscht den Kasten **nicht**. Nicht
    belegt: Pfeil-Auswahl (synthetisches Ziehen liefert kein `mouseup`, s. Hinweis in
    Schritt 5), Kennung-Kopieren per Klick. **Schritte 6, 7 und 8 stehen aus.**
  - **Fassung 1.7, 2026-09-07:** nur Beschriftung/Tooltip/Toast des Diagramm-Knopfs. Schritte 1,
    2, 3, 4 grün. Mit 1.6 zusammen veröffentlicht (beide Artifacts, `url` mitgegeben,
    `capabilities` unangetastet).
  - **Fassung 1.8, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs
    grün (zweiter Lauf bricht ab). Schritt 5 im Vorschau-Fenster gemessen: Notiz aufgezogen, zwei
    Kästen darauf, einer außerhalb; Notiz um 100/50 gezogen → beide Kästen darauf um genau 100/50,
    der außerhalb unverändert, kein fremdes Element bewegt; mit `Alt` bewegt sich nur die Notiz.
    **Messwerkzeug-Lehre:** im verdeckten Vorschau-Fenster werden `setTimeout`-Wartezeiten
    gedrosselt, das Prüfskript muss synchron laufen; und das zuletzt angelegte Element trägt den
    Editier-Merker und lässt sich darum synthetisch nicht anfassen — erst die Notiz anlegen, dann
    die Kästen. **Schritte 6, 7 und 8 stehen aus.**
  - **Fassung 1.9, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs grün.
    Anlass: Nutzer sah am veröffentlichten Brett nach „Verschieben nimmt mit“ die Kästen **einzeln
    nachrücken**. Ursache: N eigene `set()`, N Stände, jeder mit N−1 alten Positionen. Fix rein im
    Warte-Mechanismus (kein Sammel-Schreibvorgang — der Plattform-Vertrag kennt keinen: „no
    transactions“). **Lokal nicht prüfbar** (ohne Datenbank ist `writes` immer 0), also nur am
    veröffentlichten Brett: Notiz mit Kästen ziehen → alles muss in **einem** Sprung ankommen.
    **Vom Nutzer am veröffentlichten Brett bestätigt (2026-09-07): läuft glatt, kein Zucken mehr.**
    Ebenso 1.8 bestätigt: Mitnehmen funktioniert am echten Brett.
  - **Fassung 2.0, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs
    grün. Schritt 5 im Vorschau-Fenster gemessen: Rahmen über zwei von drei Kästen → 2 gewählt,
    Inspektor „2 Elemente“, Rahmen nach `mouseup` weg; einen der beiden gezogen → beide um
    50/50, der dritte unverändert; Farbfeld färbt beide; `Entf` löscht beide; Werkzeug Bewegen
    schiebt die Ansicht, Auswählen auf leerer Fläche schiebt **nicht**, mittlere Maustaste
    schiebt. **Messwerkzeug-Lehre:** Tastendruck an `window` schicken, nicht an `document`, und
    ein Doppelklick-Kasten hält den Editier-Merker — vorher `blur` auf sein `.txt`.
    **Schritte 6, 7 und 8 stehen aus.** Vom Nutzer am veröffentlichten Brett bestätigt: läuft.
  - **Fassung 2.1, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs
    grün. Schritt 5 im Vorschau-Fenster: Klick → 1, Umschalt+Klick → 2 („2 Elemente“) → 3,
    Umschalt+Klick auf gewähltes → 2 → 1 (Inspektor zeigt wieder „Schritt“), Umschalt+Rahmen
    ergänzt, Rahmen ohne Umschalt ersetzt, Gruppe aus Umschalt-Klicks wandert zusammen.
    **Messwerkzeug-Lehre:** `render()` baut alle `.node` neu — Element-Referenzen nach jedem
    Schritt frisch über `data-id` holen, sonst landen die Ereignisse auf losgelösten Knoten.
    **Schritte 6, 7 und 8 stehen aus.** Vom Nutzer am veröffentlichten Brett bestätigt: läuft.
  - **Fassung 2.2, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs
    grün (das Werkzeug prüft seit 2.2 **sequentiell auf einer Kopie**, weil ein späterer Anker auf
    einer früheren Sammel-Ersetzung aufbauen darf). Schritt 5 im Vorschau-Fenster: Rahmen nur in
    der Lücke zwischen zwei Kästen → genau der Pfeil (Inspektor „Pfeil“, Kennung `edges/…`);
    Rahmen über beide → „2 Elemente · 1 Pfeil“; Umschalt+Klick auf den Pfeil raus und wieder rein;
    `Entf` löscht Kästen und Pfeil, der dritte Kasten bleibt. **Messwerkzeug-Lehre:** im
    verdeckten Vorschau-Fenster liefert `document.elementFromPoint` nichts — ein Pfeil lässt
    sich synthetisch nur ziehen, wenn man die Funktion im Test kurz durch den Zielkasten
    ersetzt. **Schritte 6, 7 und 8 stehen aus.** Vom Nutzer am veröffentlichten Brett bestätigt: läuft.
  - **Fassung 2.3, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs
    grün. Schritt 5 im Vorschau-Fenster, in Etappen mit 1-s-Pausen: Tabelle per Werkzeug → 320×150,
    Titel „Tabelle“, 6 Zellen; Titel getippt → „Meine Tabelle“; `+ Zeile`/`+ Spalte` → 12 Zellen,
    `− Spalte` → 8; Kopfzeile fett (600); Doppelklick in Zelle 1/0 öffnet genau sie, Text getippt,
    `Tab` speichert und öffnet 1/1. Stichpunkte: Kasten mit „- eins / - zwei“ zeigt zwei
    `.li`-Punkte „• eins“, beim erneuten Öffnen steht der rohe Text im Feld.
    **Echter Fund durch den Test:** die Fokus-Zeitgeber löschten fremde Editier-Merker (s.
    Abschnitt 9 der Code-Landkarte) — im selben Zug behoben. **Messwerkzeug-Lehre:** zwischen
    „Editieren starten“ und „Blur schicken“ eine echte Pause (`computer wait`), sonst ist der
    Blur-Listener noch nicht angehängt; und `location.reload()` im Vorschau-Fenster lädt **nicht**
    neu — alte Elemente bleiben, also immer das **neueste** Element über `data-id` greifen.
    **Schritte 6, 7 und 8 stehen aus.** Vom Nutzer am veröffentlichten Brett gemeldet: **in die
    Tabelle lässt sich nichts eintragen** → 2.4.
  - **Fassung 2.4, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs grün.
    **Erstmals Schritt 5 mit ECHTER Maus und Tastatur** (`computer`-Werkzeug statt synthetischer
    Ereignisse) — und der fand, was die synthetischen Tests nicht fanden: (a) leere Zeilen fielen auf
    1 px zusammen (`td` braucht `height` als Mindesthöhe), (b) auf ein Element kam **kein natives
    dblclick**, weil der erste Klick es neu baut, (c) `focus()` verschob den `body` um 219 px,
    (d) das Inhalts-Textfeld unter einer offenen Zelle ließ den Editier-Merker klemmen. Alle vier
    behoben; danach real belegt: Doppelklick in Zelle → „Hallo“, `Tab` → nächste Zelle → „Welt“,
    `Enter` schließt; Farbe wechseln bei offener Zelle → Text bleibt, Merker weg (**Schritt 8 damit
    erstmals gelaufen**); Inhalts-Textfeld ersetzt die Zellen, danach lässt sich wieder tippen.
    **Lehre:** synthetische Ereignisse beweisen Logik, nicht Bedienbarkeit — Schritt 5 künftig
    mit echten Eingaben, Koordinaten aus dem **unmittelbar vorher** gemachten Screenshot (der
    Rahmen ist ~1,22× der CSS-Pixel und ändert sich mit der Fenstergröße). Schritte 6 und 7 stehen aus.
  - **Fassung 2.5–2.7 (Paket A), 2026-09-07:** je Fassung Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des
    Patch-Werkzeugs grün. Schritt 5 real (Maus/Tastatur) und per DOM: Rahmen angelegt, Kasten darauf,
    Rahmen gezogen → Kasten geht mit (Rahmen liegt bei z 1998 hinter dem Kasten 2008); Layout „Handy“
    → 360×640 mit Abzeichen; Code-Kasten in Schreibmaschinenschrift; Start voller Kreis, Ende Ring,
    beide ohne Textzeile im Inspektor. Alle sieben Baustein-Arten angelegt und im Bild geprüft
    (Knopf, Eingabe, Auswahl mit ▾, Schalter mit Knauf, Liste mit Trennlinien, Menü mit aktivem
    ersten Reiter, Bild mit Kreuz). Datenmodell „Kunde“: drei Felder, zwei Methoden aus dem
    Textfeld, Höhe wächst auf 140. **Offen:** Header wird bei schmalem Fenster dreizeilig, `body`
    lässt sich dann waagerecht scrollen (Seite 869 px breit bei 650 px Fenster) — kosmetisch,
    Kandidat für Paket B. Schritte 6 und 7 stehen aus.
  - **Fassung 2.8 (Paket B), 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des
    Patch-Werkzeugs grün (ein Anker scheiterte erst am geschützten Leerzeichen in „z. B.“ — zum
    zweiten Mal in diesem Projekt; Anker mit „z. B.“ immer aus der Datei kopieren). Schritt 5 per
    DOM und Bild: Kasten an krummer Stelle → Position durch 8 teilbar; Pfeil gestrichelt, Spitzen
    beide, Dreieck, „1“/„n“ an den Enden, Knöpfe zeigen den Zustand; drei Kästen: links bündig,
    senkrecht gleich verteilt (8/164/320), gleiche Größe. Überlauf: `html, body { overflow: hidden }`.
    Schritte 6 und 7 stehen aus.
  - **Fassung 2.9 (Paket C), 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs
    grün. Schritt 5 lokal per DOM: Reiter-Typ wechselt Symbol und Toast; Status setzt Punkt; Verweis im
    Tooltip. **Einfrieren ist lokal nicht prüfbar** (braucht `meta/board`): am veröffentlichten Brett
    prüfen — Knopf zweimal → Abzeichen EINGEFROREN, Ablage voll, Anlegen/Ziehen/Tippen/Löschen/Reiter/
    Titel blockiert mit Hinweis, zweites Fenster zeigt das Abzeichen ebenfalls; Auftauen zweimal → alles
    geht wieder. Zusätzlich `pinit-schreiben` gegen ein eingefrorenes Brett → muss abbrechen.
    **Vom Nutzer am veröffentlichten Brett bestätigt (2026-09-07): Einfrieren läuft, alles blockiert wie
    erwartet.** Schritte 6 und 7 stehen aus.
  - **Fassung 2.10, 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs grün
    (Inspektor-Markup per Regex ersetzt, weil der alte Block geschützte Leerzeichen trug). Schritt 5 per
    DOM und Bild: Baustein gewählt → Abschnitte Einstellungen/Aussehen offen, Für Claude/Anordnen zu,
    Auswahlliste zeigt „Knopf“; alle Kennungen der Knöpfe unverändert, Handler laufen weiter.
    Anlass: Nutzer-Screenshot des überlaufenden Inspektors (Baustein-Art-Knöpfe ragten über den Rand).
    Schritte 6 und 7 stehen aus.
    Schritt 7 gewinnt damit einen Punkt: fremde Änderungen dürfen während eines eigenen
    Schreibvorgangs höchstens 3 s verzögert erscheinen, nie verloren gehen.
  - **Fassung 2.11, 2026-09-07:** Schritte 1, 2, 3, 4 grün. Schritt 5 real (Maus + DOM): Feld klappt
    auf, Zahl 10 gesetzt → Knopf zeigt „Raster 10“, Kasten angelegt → Position durch 10 teilbar; „aus“
    → Kasten an krummer Stelle (194/298); Klick auf die Fläche schließt das Feld. Vorher lief eine
    vollständige Prüfung von 2.10 (Browser + Code-Prüfer), Befundliste in
    `artefakte/PRUEFUNG-2.10-2026-09-07.md`. Schritte 6 und 7 stehen aus.
  - **Fassung 2.12, 2026-09-07:** nur Umbenennung Reißbrett → Pinit (Datei, Titel, Kopfzeile,
    Doku, Skills). Schritte 2, 3, 4 grün. Als „Pinit · Allgemein Dashboard“ neu veröffentlicht
    (privates Konto), das Arbeits-Brett bleibt auf 2.10.
  - **Fassung 2.13, 2026-09-07:** Strg+D / Strg+C / Strg+V. Schritte 2, 3, 4 grün. Schritt 5 real
    (Tastatur + DOM): zwei Kästen mit Pfeil per Rahmen gewählt, Strg+D → 4 Kästen, 2 Pfeile, die
    Kopien gewählt; Strg+C → Toast „2 Elemente kopiert (mit 1 Pfeil)“; zweimal Strg+V → 8 und 4,
    jede Kopie 24 px weiter versetzt. Schritte 6 und 7 stehen aus.
  - **Fassung 2.14, 2026-09-07:** Zahnrad statt Fragezeichen, Einstellungen-Dialog (Tastenkürzel,
    Darstellung im Brett gespeichert, Infos); `meta/board.theme`. Schritte 2, 3, 4 grün. Schritt 5 real:
    Dialog öffnet mit Tastenkürzel-Tabelle, Reiter Darstellung → „Dunkel“ setzt `data-theme="dark"`
    und den Knopf-Zustand, Reiter Infos zeigt Fassung/Zähler, Esc schließt. **Am veröffentlichten Brett
    prüfen:** Dunkel wählen → zweites Fenster wird ebenfalls dunkel; eingefroren → Wahl wird abgelehnt.
    Schritte 6 und 7 stehen aus.
  - **Fassung 2.15, 2026-09-07:** Faust-Zeiger beim Ziehen. Anlass: Nutzer sah die Faust nur bei
    mittlerer Maustaste. Ursache: `.node { cursor: grab }` gewinnt über `#canvas.panning`, und beim
    Verschieben eines Elements gab es gar keine Klasse. Jetzt `#canvas.dragging` (in `mousedown` für
    `move`, in `mouseup` weg) plus `.node`-Selektoren; die Faust-Regeln stehen bewusst als letzte im
    Block (gleiche Spezifität wie `.hand`). Schritte 2, 3, 4 grün; per `getComputedStyle` belegt:
    normal grab, dragging grabbing, hand grab, hand+panning grabbing. Schritte 6 und 7 stehen aus.
  - **Fassung 2.16, 2026-09-07:** Tabellen-Gitter im Inspektor (`#tbl-grid`, ein Eingabefeld je Zelle,
    `tblGitterBauen()`/`zelleSetzen()`; Enter = übernehmen und eine Zeile tiefer, Tab = nächste Zelle,
    Esc = verwerfen; wird nicht neu gebaut, solange ein Feld darin den Fokus hat; das Textfeld mit `|`
    bleibt eingeklappt als „Als Text“), Tabelle auf der Fläche füllt die Höhe (`flex: 1`), **acht neue
    Farben** (14 gesamt, Namen in `COLOR_NAMES`, Farbfelder umbrechen). Schritte 2, 3, 4 grün. Schritt 5
    real: Tabelle aufgezogen → Gitter 3 × 2 mit Kopfzeile im Inspektor, 14 Farbfelder in zwei Reihen,
    Koralle gesetzt → hell `rgb(247,207,196)`, dunkel der Dunkel-Token. **Lehre:** beim Einfügen in die
    drei Farbblöcke ist ein 4-Leerzeichen-Anker Teilstring des 6-Leerzeichen-Ankers — die zweite
    Ersetzung traf den Media-Block doppelt, der `data-theme`-Block blieb leer; erst die Messung im
    Dunkelmodus hat es gezeigt. Anker in den Farbblöcken immer mit Zeilenanfang verankern.
    **Messwerkzeug-Lehre:** die Return-Taste des Browser-Werkzeugs kam mit leerem `key` an, Buchstaben
    ohne `keydown` — der Gitter-Handler prüft darum auch `keyCode 13`; per JS-Ereignis belegt: Enter
    springt eine Zeile tiefer. Schritte 6 und 7 stehen aus.
  - **Fassung 2.17, 2026-09-07:** **Acht Griffe** je Element (`data-dir` nw/n/ne/e/se/s/sw/w, `groesseZiehen()`:
    gegenüberliegende Kante bleibt, nur die gezogene Achse rastet ein; Start/Ende nur Ecken und
    symmetrisch `w = h`, min 24) · **Position/Größe als Zahlen** im Inspektor (`#size-row`, `sz-x/y/w/h`,
    `groesseAusFeldern()`) · **senkrechte Ausrichtung** (`valign`, Knöpfe `va-top/middle/bottom`) · Knopf
    **„Text bearbeiten“** und `F2`; `Enter`/`F2` laufen jetzt über `oeffneZumTippen()` (damit ist S10 der
    Prüfliste mit erledigt). Schritte 2, 3, 4 grün. Schritt 5 real: West-Griff → x −48→−144, w 168→264,
    rechte Kante fest; Nord-Griff → y −120→−198, h 66→144, untere Kante fest; SW-Griff → 240×120, rechte
    Kante fest; Start-Kreis SE → 40→96×96; Breite-Feld 300 → 300 px; „Oben“ → `align-items: flex-start`.
    **Zwei Funde beim Bauen:** (1) beim Seiten-Ziehen rastete auch die unberührte Achse ein (66→72) →
    nur die gezogene Achse; (2) `.node` hat `overflow: hidden`, halb außen liegende Griffe waren nur zur
    Hälfte klickbar (Eck-Griff traf das Element → Verschieben statt Größe) → Griffe liegen jetzt innen
    (Ecken 2 px über den Rand, Balken bündig). Schritte 6 und 7 stehen aus.
  - **Fassung 2.18, 2026-09-07:** Auswahl-Ring für **alle** Bauarten (Rahmen, Baustein, Code, Tabelle,
    Datenmodell setzten `box-shadow: none` NACH `.node.sel` und verloren ihn — eine Sammelregel am Ende
    des Bauarten-Blocks) und **Ring-Farbe je Füllung**: Token `--r-<farbe>` in allen drei Farbblöcken,
    `renderNodes` setzt `--sel` am Element, alle `.sel`-Regeln lesen `var(--sel, var(--accent))`. Blau
    auf neutralen/kühlen Füllungen, Rot auf Bernstein/Orange/Koralle/Rosé, warm auf Himmel/Petrol/
    Mint/Limette; im Dunkelmodus hellere Werte. **Notiz** sieht jetzt aus wie ein Zettel: Klebestreifen
    oben (`::before`), Eselsohr unten rechts (`::after`), `padding-top: 16px`. Schritte 2, 3, 4 grün.
    Schritt 5 real: Ring gemessen — Orange-Kasten `rgb(185,28,28)`, Rahmen und Baustein
    `rgb(47,111,214)`, Notiz rot; Bild hell und dunkel geprüft. Schritte 6 und 7 stehen aus.
  - **Fassung 2.19, 2026-09-07:** Strg+Mausrad schiebt senkrecht (Umschalt waagerecht, ohne Taste
    Zoom; `preventDefault` hält den Browser-Zoom fern). Schritte 2, 3, 4 grün; per `WheelEvent` belegt:
    Strg ändert nur `translate`-y, Umschalt nur x, ohne Taste nur den Zoom. Schritte 6 und 7 stehen aus.
  - **Fassung 2.20, 2026-09-07 (F1 der Prüfliste):** helle Schrift auf `plain` im Dunkelmodus für JEDE
    Bauart (`renderNodes`: `--node-ink-plain` bei `color === "plain"`, vorher nur `box`), Schalter-Baustein
    in Flächen-Tinte `var(--ink)`. Schritte 2, 3, 4 grün. Schritt 5 real im Dunkelmodus gemessen: Rahmen-Titel,
    Code, Tabellenzellen, Knopf und Schalter alle `rgb(230,236,242)` auf `rgb(53,66,79)` bzw. transparent.
    Schritte 6 und 7 stehen aus.