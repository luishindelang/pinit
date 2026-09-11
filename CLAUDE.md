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
| **Pinit** (erstes Brett, Arbeits-Konto — steht NICHT in der privaten `bretter.json`; auf der Arbeit eigene Liste anlegen) | `https://claude.ai/code/artifact/cf961f04-6f2e-41d2-9d5a-eb3a1f8b1a04` | Arbeit | `{db: {}}` |

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

**Wie die Datei verteilt wird (seit 2.20):** öffentliches GitHub-Repo
`https://github.com/luishindelang/pinit`, Download der aktuellen Fassung unter
`https://raw.githubusercontent.com/luishindelang/pinit/main/code/pinit.html`. Nach jeder Fassung
„commit und push“. **Und danach Pflicht: ALLE Bretter aktualisieren** — Skill `pinit-veroeffentlichen`
ohne Angabe (jeder Eintrag in `bretter.json`, nicht nur das Dashboard). Ein Brett, das nach einem Commit
auf `main` noch die alte Fassung zeigt, ist ein Fehler, kein Zustand (Luis, 2026-09-11). Grenze: das
Arbeits-Brett gehört dem Arbeitskonto und lässt sich nur dort aktualisieren. Die Skills liegen als Kopie in `skills/` (nach `~/.claude/skills/` kopieren);
`bretter.json` mit den eigenen Brett-URLs bleibt bewusst außerhalb des Repos. Ein Auto-Update der
Bretter gibt es weiterhin nicht (s. `PLAN.md`, Roter Faden) — die Fassungsnummer in der Kopfzeile
zeigt, wer hinterherhängt.

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
1. `<style>`: Farbtoken für Hell/Dunkel (die Dunkel-Palette steht bewusst zweimal — Media-Query und Attribut lassen sich nicht in einer Regel verbinden, Kommentar im CSS), seit 3.00 **eine** globale `[hidden]`-Regel, Kopfzeile, Reiterleiste, Knoten, Pfeile, Inspektor.
2. Markup: Kopfzeile mit Fassung und Werkzeugleiste · Reiterleiste `#tabs` · Zeichenfläche
   `#canvas`/`#layer` · Inspektor — seit 2.10 in **vier klappbaren Abschnitten** (`<details class="insp-sec">`,
   Zustand je Betrachter unter `rb.sec.<id>`, leere Abschnitte versteckt `sektionenAufraeumen()`; seit 2.33 nie höher als die Fläche (2.34: 12 px Luft über der Zoomleiste), scrollt innen, Breite am Griff `#insp-griff` an der linken Kante ziehbar — nach links = breiter, seit 2.41 bis 60 % der Fläche — und in `rb.insp.w` gemerkt):
   Kopf mit Bauart + **Kennung `#insp-id`** · `#sec-bauart` „Einstellungen“ (Baustein-Art und Layout als
   **Auswahllisten** `#widget-variant`/`#frame-layout`, Tabelle, Felder, Pfeil-Art, Ausrichten) ·
   `#sec-aussehen` (Farben, Textknöpfe in einer Reihe) · `#sec-claude` „Für Claude“ (Status, Verweis,
   **Notiz `#note-row`**; Punkt am Titel, wenn etwas gesetzt ist; zu per Vorgabe) · `#sec-anordnen`
   (vorn/hinten/duplizieren; zu per Vorgabe) · Löschen immer unten · Koordinaten · Statuszeile · Zoomleiste · Hinweis · Toast.
3. Modell: `FASSUNG`/`FASSUNG_DATUM`, direkt danach seit 3.00 die **Kleinen Helfer** (`$`/`$$`, `svgEl`, `leeren`, `naechst`, `knotenEl`, `druecken` für aria-pressed-Gruppen, `store`/`load`/`vergessen`), `KINDS` (Vorgaben je Bauart, **inkl. `fs`/`bold`/
   `align`**, seit 2.3 auch `table`), `GRADE` + **`schriftgrad`/`fett`/`ausricht`/`gradStufe`** ·
   **`TBL_MAX_*`/`tabelleLeer`/`zellenKopie`/`zellenLesen`** (Zellen-Helfer, seit 2.3) (die drei Lesehelfer
   sind die EINE Stelle, an der "0 bzw. leer heißt Vorgabe" steht — `renderNodes` und die
   Inspektor-Knöpfe fragen beide sie, nicht das Feld), `COLORS`, `HOME`/`CATCH`/`CATCH_NAME`, die
   Zustands-Merker in Deklarationsreihenfolge (`tabEditing`, `armedDelete`, `sel`, `drag`,
   `editing`, `wartend`, `geladen`, `letzteWaisen`, `reiterAbgleichLief`; **`selSet`** seit 2.0
   direkt nach `sel` — die Mehrfachauswahl, nur vom Auswahl-Rahmen gefüllt; **`selEdges`** seit 2.2
   daneben für Pfeile, mit `mehrfach()` als der EINEN Frage „Sammel-Modus?“ — wer die
   Mehrfachauswahl leert, leert **beide** Mengen; seit 3.00 nur noch über die **Auswahl-Helfer** direkt dahinter: `auswahlLeeren()`, `nichtsWaehlen()`, `waehlen(typ, id)`, `gewaehlterKnoten()`/`gewaehlterPfeil()`, `gewaehlteKnotenIds()`), `uid`,
   `Z_BASIS`/`ebeneZ()`, `topZ`/`bottomZ`. **`syncTot` steht nicht hier**, sondern bei „Speichern“ (Abschnitt 5)
   neben `syncGestorben` — dort, wo er gesetzt wird.
4. Reiter: `store`/`load` (Browser-Merker je Betrachter) · **`wirkReiter`/`waisenZahl`
   (Waisen-Regel)** · `sheetList`/`echteReiter`/`sheetName` · `refilter` ·
   `tabFeldAktiv`/`endTabRename` · `saveView`/`restoreView` · `switchSheet` ·
   `materializeHome`/`addSheet`/`renameSheet`/`armDelete`/`deleteSheet` · `reiterMerken` · Menü-Helfer `menueKnopf`/`menueTrenner`/`menueHinweis`/`menueOeffnen` (3.00, teilen sich Reiter-Menü `tabMenueZeigen` und Zellen-Menü `tabellenMenueZeigen`) · `renderTabs`.
5. Speichern: `setStatus`/`counts`/`offText` · **`syncTot`/`syncGestorben`** (ein
   Abonnement ist mit einem Fehler gestorben — die Meldung muss stehenbleiben) ·
   `saved`/`busy` · `track` (Zähler + Statuszeile) ·
   **`knotenDaten(n, sheet)`/`pfeilDaten(e, von, nach, sheet)`** (3.00: der EINE Bauplan der Dokumente — `putNode`/`putEdge` schreiben ihn, die Ablage nimmt ihn ohne Reiter, `brettAlsJSON` mit aufgelöstem Reiter; wer ein Feld ergänzt, ergänzt es hier) · `putNode`/`putEdge`/`putSheet`/`dropDoc`/`putTitle` · seit 3.03 **`dokSchreiben(pfad, daten)`** als der EINE Weg in die Datenbank (null = löschen) und direkt dahinter das **Rückgängig** (`verlauf`/`wiederholen`, `letzterStand`, `verlaufMerken`, `standMerken`, `stabil`, `rueckgaengig(zurueck)`; Strg+Z/Strg+Y im Tastatur-Handler).
6. Geometrie: `center` · `border` (Rand-Schnittpunkt, Rechteck und Raute) · `bounds` ·
   `toBoard`.
7. Ansicht: `applyView`/`zoomAt`/`fit`.
8. Zeichnen: `fillOf` · `renderNodes` (seit 3.00 nur noch die Schleife: je Element `knotenBauen()` = `knotenFarben` + `knotenInhalt` (mit `codeRandBauen`, `modellBauen`) + `markenSetzen`, Griffe `griffeBauen`; seit 2.48 misst es alle Tabellen gesammelt: `tabellenGriffeMessen`/`tabellenGriffeSetzen`) · `renderWires` (eine SVG-Ebene je Pfeil; **Pfeilspitzen seit 2.48 als eigene Pfade `kopfPfad()`, keine SVG-Marker** — ein `url(#marker)`-Verweis ließ Chrome bei jedem Pfeil alle anderen neu durchrechnen, Issue #9) ·
   `renderInspector` (seit 3.00 über `INSP_ZEILEN`/`inspZeilen()`, `INSP_KNOEPFE`/`inspKnoepfe()`, `farbfelderMarkieren()`, `wertSetzen()` — eine Zeile ergänzen heißt: in `INSP_ZEILEN` eintragen) · `render`. Davor seit 2.3 **`textFuellen`** (Stichpunkt-Darstellung) und
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
    (`move` trägt seit 1.8 `kinder`, s. Bedienung; Helfer `mitnehmer()`, `knotenUnterMaus()`, `linkZielWeg()`, `nachbarKanten()` stehen direkt vor dem
    Maus-Abschnitt; der Tabellen-Griff (`tblcol`/`tblrow`) wird seit 3.00 in `tabellenGriffAnfassen()` angefasst; `marquee` zeichnet `#auswahl-rahmen` über `rahmenZeigen`/`rahmenWeg` neben
    der Anlege-Vorschau und füllt beim `mouseup` `selSet` — Berühren reicht; genau ein Treffer
    wird zur Einzelauswahl `sel`). Werkzeug `hand` schiebt in `mousedown` sofort die Ansicht. — bei aktivem
    Anlege-Werkzeug merkt `mousedown` nur den Startpunkt, `mousemove` zeichnet die Vorschau,
    erst `mouseup` ruft `addNode`. Ein Klick ohne nennenswerte Bewegung (unter 20
    Brett-Pixeln in beiden Richtungen) nimmt die Standardgröße. Folge fürs Verhalten:
    solange man aufzieht, ist `drag` gesetzt und Schnappschüsse werden aufbewahrt
    (`warteGrund`) — das war vorher nicht so, weil Anlegen ein Wimpernschlag war.
12. Knöpfe, in Dateireihenfolge — **alle Textfelder des Inspektors hängen seit 3.00 an `feldAnbinden(id, übernehmen, zurücksetzen, strgEnter)`** (change übernimmt, Enter bzw. Strg+Enter übernimmt und verlässt das Feld, Esc stellt zurück; das registriert sie zugleich für `inspektorAbschliessen()`): Textknöpfe (`fs-minus`/`fs-plus`/`t-bold`/`al-left`/
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
    `standAngewendet()` (3.00: der gemeinsame Abschluss — Reiter prüfen, filtern, Auswahl bereinigen, zeichnen) · `applyNodes`/`applyEdges`/`applySheets` · `vorlageModus` · `verbinden` und die
    Abonnements.

**Bedienung heute** (der Ist-Stand, damit man ohne Code-Lektüre planen kann). Seit 1.6 hat
jedes Element im Inspektor ein **Notiz-Feld** (Langtext, auf der Fläche nur als blaue Ecke
sichtbar) und eine **kopierbare Kennung** `nodes/<id>` bzw. `edges/<id>`; damit lässt sich
ein Element gegenüber Claude eindeutig benennen. Werkzeug oben
wählen, dann auf die Fläche klicken — mit aktivem Anlege-Werkzeug wird **immer** angelegt,
auch über einem bestehenden Element. Tastenkürzel `V` Auswählen · `H` Bewegen · `B` Schritt ·
`S` Notiz · `D` Entscheidung · `T` Beschriftung · `G` Tabelle · `A` Pfeil · **zweite Leiste `#tools2`
(Paket A, 2.5–2.7):** `R` Rahmen (seit 2.38 überall so genannt, vorher „Bildschirm“; Layout im Inspektor `#frame-row`; kommt beim Anlegen
**hinter** alles, damit Bausteine darauf mitgehen) · `W` Baustein (Art im Inspektor `#widget-row`) ·
`E` Entitäten-Modell (bis 2.37 „Datenmodell“; Felder/Methoden im Textfeld `#entity-text`, eine je Zeile, Leerzeile trennt; Höhe
wächst mit) · **`M` DB-Modell** und **`K` Klassen-Modell** (2.38, gleicher Datenbau wie `entity` — `hatFelder()` —, anderes Bild: Name | Typ in zwei Spalten bzw. UML-Fächer) · `C` Code (seit 2.38 als Editor-Fenster mit Kopfleiste und Zeilennummern `.code-gutter`; seit 2.44 mit Farben für Kommentare, Zeichenketten, Zahlen und Schlüsselwörter — `codeFuellen()`, nur Anzeige) · `1` Start · `0` Ende. Die Notiz hat seit 2.38 eine Linie je Textzeile (1.6em, hängt am Schriftgrad). Der Reiter-Typ ist seit 2.38 auch im Rechtsklick-Menü wählbar (`reiterTypSetzen()`). **Seit 2.39** tragen alle inneren Linien eines Elements die Farbe seines Rands (`--rand`, je Element in `renderNodes` gesetzt; nur die Notiz behält ihre Papierlinien), und die drei Modell-Bauarten haben **Auto-Größe** (Feld `auto`, Knopf `#btn-auto` unter den Maßen: `autoAnpassen()`/`inhaltsMasse()` messen den Inhalt; Griff ziehen oder B/H tippen schaltet es aus). **Paket B (2.8):** Pfeil-Art im Inspektor (Linie, Spitzen, Dreieck,
Enden beschriften; ein Schreibpfad `pfeilAendern`) · **Raster** — seit 2.11 einstellbar: Klick auf
„Raster“ unten rechts klappt `#raster-feld` auf mit An/Aus (`rb.raster`) und Schrittweite 0–100 px
(`rb.rasterschritt`, Vorgabe `RASTER_VORGABE` = 24 = Punktabstand des Hintergrunds; 0 = frei;
`rasterLesen()` kappt, `rasterAnzeigen()` ist die EINE Anzeige-Stelle, der Knopf zeigt „Raster 24“),
An/Aus je Betrachter im Browser, die **Schrittweite seit 3.01 im Brett** (`meta/board.raster`, alle Betrachter und Claude nutzen dieselbe; ohne Speicher Rückfall `rb.rasterschritt`), wirkt beim Ziehen, Anlegen und Größe ändern (`snap()`, seit 2.40 an den Kanten) · **Ausrichten** im Sammel-Modus (`#align-row`, `ausrichten()`): Kanten,
Zentrieren, gleiche Abstände, gleiche Größe. `html, body` sind `overflow: hidden` — die Seite kann
nicht mehr waagerecht scrollen. **Paket C (2.9):** Reiter-Typ (Symbol am aktiven Reiter, Klick wechselt),
**Einfrieren** oben rechts (zweistufig; gesperrt lässt sich nur noch wählen, lesen, Kennung kopieren,
Reiter wechseln, auftauen), **Verweis + Status** je Element im Inspektor (`#meta-row`). **Tabelle** (seit 2.3):
Überschrift oben (Doppelklick auf die Überschrift tippt sie), erste Zeile fett als Kopfzeile,
Doppelklick in eine Zelle tippt sie, `Tab` springt zur nächsten Zelle, `Enter` schließt ab, `Esc`
verwirft; Zeilen und Spalten kommen über vier Knöpfe im Inspektor (`+ Zeile`, `− Zeile`, `+ Spalte`,
`− Spalte`, immer am Ende) oder seit 2.49 (Issue #7) per **Rechtsklick auf eine Zelle** (Menü: Zeile/Spalte davor oder danach einfügen, löschen — an der Zelle; `tabellenMenueZeigen()`, gleiche Helfer `zeileEinfuegen()`/`spalteLoeschen()` … wie die Knöpfe). *(2.4–2.50 gab es zusätzlich ein Inhalts-Textfeld „Als Text“ mit `|`-Spalten; 2026-09-10 von Luis in 2.51 entfernt — Gitter und Doppelklick reichen.)* **Zeilen-Formate** in jedem Element (2.23, `zeilenArt()`): Zeile mit `- ` = Stichpunkt, `1. ` = Nummer, `# `/`## ` = Überschrift; Enter in einer Listenzeile setzt die Liste fort, Enter in einer leeren Listenzeile beendet sie (`listeFortsetzen()`). *(2.25 hatte zusätzlich Fett und Ausrichtung je Zeile über Marker im Text; 2026-09-07 von Luis in 2.26 wieder entfernt — die Bedienung über die Inspektor-Knöpfe fühlte sich nicht richtig an. B und Ausrichtung wirken wieder nur auf das Element. `cursorZeile()` blieb als Helfer für `listeFortsetzen()`.)* Die Notiz ist seit 2.23 ein Notizblock (Lochband, Papierlinien über `--papier`, Text per Vorgabe links oben; die Füllung wird als `backgroundColor` gesetzt, damit die Linien bleiben). Start/Ende werden quadratisch aufgezogen (`anlegeEnde()`). **Mehrfachauswahl seit 2.0:** mit
`Auswählen` auf leerer Fläche einen Rahmen ziehen — alles, was der Rahmen **berührt**, ist
gewählt (`selSet` für Elemente, seit 2.2 `selEdges` für Pfeile — ein Pfeil zählt, wenn der Rahmen
seine gezeichnete Linie berührt, `strichTrifft()`; Sammel-Modus = `mehrfach()`); die Gruppe lässt sich zusammen verschieben, umfärben und löschen, der
Inspektor zeigt dann „N Elemente“. **`Umschalt`+Klick** (seit 2.1, `auswahlUmschalten()`) nimmt
ein Element dazu oder wieder heraus; `Umschalt` beim Rahmenziehen ergänzt statt zu ersetzen
(`drag.ergaenzen`). Ein Klick **ohne** Umschalt auf ein einzelnes Element, einen Pfeil oder
Griff leert die Mehrfachauswahl. **Die Ansicht verschiebt seit 2.0 nicht mehr das
Auswählen-Werkzeug**, sondern `Bewegen` (H) oder die mittlere Maustaste.
Doppelklick beschriftet ein Element oder einen Pfeil; `Strg+Enter` schließt ab, `Esc` bricht
ab. Bei Notiz und Code steht der Cursor dabei am Ende (2.41), bei allen anderen ist der Text markiert. Ein weiterer Doppelklick im offenen Feld markiert das Wort (2.45, `tipptSchon()`). **Doppelklick auf leere Fläche legt einen Kasten an** (Schnellweg ohne Werkzeugwahl). `Entf` löscht die Auswahl.
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
in `drag.kinder` und werden beim `mouseup` einzeln gespeichert. **Mausrad seit 2.29 nach der Figma-Regel** (der Browser verrät nie, ob Maus oder Touchpad, also eine Regel für beide): Rad schiebt die Fläche (Touchpad in alle Richtungen), Strg+Rad und Kneifen zoomen (`radZoom()`, Schritt gedeckelt), Umschalt+Rad schiebt waagerecht; Einstellungen → Darstellung bietet „Rad zoomt“ für Maus-Nutzer (`RAD`/`rb.rad` = schieben|zoomen). *(2.19–2.28: Rad zoomte, Strg senkrecht, dann Touchpad-Wahl und -Erkennung — 2026-09-08 von Luis zugunsten der Figma-Regel verworfen.)* Die Inspektor-Felder zeigen seit 2.27 die **Mitte** (`Mx`/`My`, gespeichert bleibt die Ecke). **Das Raster greift seit 2.40 an den Kanten** (Verschieben und Anlegen: Ecke oben links; Größe ziehen: die gezogene Kante, `groesseZiehen()`) — wie Figma/Miro/draw.io. *(2.27–2.39 rastete die Mitte, Issue #2; 2026-09-09 von Luis verworfen, weil die Kanten damit nie auf dem Raster lagen.)* **Smart Guides seit 2.42:** beim Verschieben schnappen Kanten und Mitten an die der Nachbarn (7 Bildschirm-Pixel, rote Linie `.smart-guide`, `guideTreffer()`), vor dem Raster; seit 2.43 auch beim Größe ziehen (die gezogene Kante, in `groesseZiehen()`); abschaltbar unter Einstellungen → Darstellung (`GUIDES`/`rb.guides`). Ecke oder Seite ziehen ändert die Größe (acht Griffe; seit 2.22 in einer eigenen Ebene `.grips` über allen Knoten, `griffeSetzen()`/`griffeVon()` schieben sie beim Ziehen mit). **Pfeiltasten** (2.37, Issue #4) schieben die Auswahl um einen Raster-Schritt (ohne Raster 1 px, Umschalt 10 px), gespeichert wird gesammelt nach 300 ms Ruhe (`auswahlSchieben()`). **Ein gewähltes Element zeigt seine Nachbarschaft** (2.37, Issue #5, `nachbarschaft()`): die anhängenden Pfeile werden dicker und kommen nach vorn, die Elemente am anderen Ende bekommen einen dünnen Ring und liegen ebenfalls vorn — nur bei einem einzelnen Element, nicht im Sammel-Modus. **Ausblenden** (2.50, Issue #8, Feld `hidden`): Knopf im Abschnitt Anordnen oder Strg+Umschalt+H — das Element bleibt als blasser gestrichelter Umriss (wählbar, verschiebbar, nicht tippbar), seine Pfeile und alles, was ganz darin und davor liegt (Mitnehmen-Regel), verschwinden ganz (`verstecktMengen()`, in `renderNodes`/`renderWires`/Auswahl-Rahmen); Einblenden über denselben Knopf/dieselbe Taste. **Inspektor-Felder gehen nicht mehr verloren** (2.37, Issue #6): wer tippt und dann auf die Fläche, ein anderes Element oder einen anderen Reiter klickt, bekommt den Text trotzdem gespeichert — `inspektorAbschliessen()` läuft VOR jedem Auswahlwechsel (`mousedown` auf der Fläche, `switchSheet`); wer einen neuen Auswahlwechsel baut, ruft es ebenfalls. Reiter: `+` legt
an (Name wird direkt getippt), Doppelklick benennt um, **Ziehen ordnet** (2.27, Issue #1; in eine Gruppe ziehen = beitreten), **Rechtsklick** öffnet das Reiter-Menü (`#tab-menu`: Umbenennen, in Gruppe einsortieren, lösen), ein **Gruppen-Chip** vor den Mitgliedern klappt die Gruppe je Betrachter zu und auf (`gruppenChip()`, aktiver Reiter bleibt sichtbar) und lässt sich seit 2.30 als Ganzes ziehen (`gruppeVerschieben()`; Reiter auf den Chip = beitreten, `reiterZuGruppe()`), `×` am aktiven Reiter löscht
zweistufig. Der Auffang-Reiter „Unsortiert“ ist gestrichelt abgesetzt und kursiv, lässt sich
nicht umbenennen, nicht löschen, und **auf ihm kann nichts angelegt werden** — er ist eine
Ablage, kein Arbeitsort. **Rückgängig seit 3.03:** Strg+Z / Strg+Y (auch Strg+Umschalt+Z) nehmen die eigenen Schritte dieser Sitzung zurück bzw. wiederholen sie (bis 100). Ein Schritt = alle Schreibvorgänge eines Ereignis-Durchlaufs (Löschen samt Pfeilen, Einfügen, Mitnehmen). Hat jemand anderes eines der Dokumente inzwischen geändert, wird der Schritt mit Hinweis abgelehnt und verworfen (Plan-Prämisse N7). Titel, Einfrieren, Darstellung und Raster (`meta/board`) sind nicht rückgängig; ohne Speicher gibt es kein Rückgängig; beim Tippen gilt das Rückgängig des Textfelds.

**Datenschema der Artifact-Datenbank** (das ist der Vertrag, nicht die Seite):
- `nodes/<id>`: `kind` box|sticky|diamond|text|**table** (seit 2.3)|**frame|code|start|end** (2.5)|
  **widget** (2.6)|**entity** (2.7)|**dbmodel|classmodel** (2.38, Datenbau wie `entity`: `text` Name, `fields`, `methods`; nur die Darstellung ist anders — DB-Tabelle mit „Name: Typ“ je Zeile bzw. UML-Klasse) · `x` `y` `w` `h` · `text` · `color`
  (bis 2.15: slate|amber|mint|rose|lilac|plain; **seit 2.16 auch** sky|teal|lime|orange|coral|violet|sand|
  graphite — `COLORS`/`COLOR_NAMES`, Token `--f-<name>`/`--s-<name>` in allen DREI Farbblöcken;
  eine ältere Fassung zeigt bei unbekanntem Namen die Vorgabefarbe der Bauart) · `z` · `sheet` · **`fs` `bold` `align`**
  · **`valign`** (2.17: "" = Vorgabe mittig — bei Notiz und seit 2.47 bei Code oben — | top | middle | bottom, `valignLesen()`/`senkrecht()`; wirkt nur bei
  Bauarten mit frei gesetztem Text, `senkrechtMoeglich()` — nicht bei table/entity/frame/start/end/Liste/Menü)
  (seit 1.5, Textdarstellung) · **`note`** (seit 1.6: freier Langtext bis 4000 Zeichen,
  auf der Fläche nur als Ecke oben rechts markiert, im Inspektor lesbar — der Ort für
  Details und für Notizen von Claude; fehlt oder leer = keine Notiz) · **`cells`** (seit 2.3, nur
  bei `kind: "table"`: Array von Zeilen, jede Zeile ein Array von Strings; erste Zeile = Kopfzeile;
  `text` ist die Überschrift der Tabelle; Grenzen 20×10, 200 Zeichen je Zelle; ein fremdes Format
  wird beim Einlesen rechteckig gemacht, `zellenLesen()`) · **`colW`/`rowH`** (2.35, nur `table`, optional: Array von Brett-Pixeln je Spalte bzw. Zeile, 16–2000, `masseLesen()`; fehlt es oder passt die Länge nicht, teilt sich die Tabelle den Kasten gleichmäßig auf wie bis 2.34; gesetzt wird es beim ersten Ziehen an einer Trennlinie, Griffe `.tbl-cgrip`/`.tbl-rgrip` in der Hülle `.tbl-wrap` über die ganze Tabelle, `drag.mode` `tblcol`/`tblrow`; seit 2.36 füllt die Tabelle den Kasten immer ganz: der letzte Wert wird nicht angewandt, die letzte Spalte/Zeile bekommt den Rest, `tabellenGriffeLegen()`; seit 2.46 rastet die gezogene Trennlinie auf dem Raster, `drag.basis`) · **`layout`** (nur `frame`: frei|desktop|
  tablet|handy — setzt die Größe einmal, `LAYOUTS`) · **`variant`** (nur `widget`: button|input|select|
  toggle|list|menu|image — die **Bedeutung** des Bausteins, `VARIANTS`; `text` ist die Beschriftung, bei
  `list` eine Zeile je Eintrag, bei `menu` Einträge mit `|`) · **`auto`** (2.39, nur `entity`/`dbmodel`/`classmodel`, boolean: true = Größe folgt dem Inhalt, fehlt = wie bisher) · **`fields`/`methods`** (nur `entity`, `dbmodel`, `classmodel`:
  Arrays kurzer Strings, `text` ist der Name; Grenzen 30 Einträge à 120 Zeichen, `listeLesen()`).
  `code` hält reinen Text in Schreibmaschinenschrift (keine Stichpunkt-Deutung), `start`/`end` sind
  Kreise ohne Text (`ohneText()`, Pfeile enden am Ellipsenrand in `border()`; Mindestmaß 24 × 24 statt 48 × 30 — seit 3.02 an EINER Stelle `minBreite()`/`minHoehe()`, auch beim Einlesen) · **`hidden`** (2.50, boolean, optional: true = ausgeblendet — blasser Umriss, Pfeile und alles ganz darin unsichtbar; fehlt = sichtbar) · **`link`** (2.9, bis
  300 Zeichen: Datei, URL, Ticket — im Tooltip, im Inspektor) · **`status`** (2.9: "" | offen | arbeit |
  fertig, `statusLesen()`; Punkt oben links rot/gelb/grün). **Zeilen-Formate sind reiner Text:** eine
  Zeile, die mit `- `, `* ` oder `• ` beginnt, wird nur bei der Anzeige als Punkt gesetzt, `1. ` als
  Nummer, `# `/`## ` als Überschrift (2.23; `textFuellen()`/`zeilenArt()`), gespeichert bleibt die Zeile roh — kein eigenes Feld. Eine Fassung vor 2.3
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
- `sheets/<id>`: `name` · `order` · **`group`** (2.27: Gruppenname bis 40 Zeichen, "" = keine; Mitglieder stehen in der Leiste beisammen hinter einem Chip, `gruppeLesen()`) · **`type`** (2.9: "" | screen | arch | data | flow, `sheetTypeLesen()`;
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
  "system" wird das Attribut entfernt und die Wahl des Artifact-Rahmens gilt) · **`raster`** (3.01: Schrittweite des Rasters in Brett-Pixeln, 0–100, 0 = frei, `rasterLesen()`; fehlt = 24; Schreiber wie `pinit-schreiben` legen `x/y/w/h` auf Vielfache davon). `putBoard(title, frozen,
  theme)` schreibt **immer alle vier** (`raster` aus `RASTER`). **Eingefroren heißt: niemand ändert etwas — auch
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
  hängt. Das ist Prüfschritt 8 als Code. Wer Zellen umbaut (`tabelleAendernFuer`),
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
     **Sichtbarkeit misst man über `getComputedStyle(el).display`, nie über `el.hidden`** — `.tab` setzt
     `display` und überstimmt das Attribut; so kam in 2.27 eine Gruppe durch, die sich nicht zuklappen ließ (2.31).
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

  10. **Fingerabdruck-Vergleich (seit 3.00, bei Umbauten OHNE gewollte Verhaltensänderung).**
     `node code/pruefung/mk-test.js` baut `code/_t.html` (Wegwerf, in .gitignore) mit Schein-Datenbank
     und festem Ablauf; über einen lokalen Server öffnen (file:// hat keine Zwischenablage), in der
     Konsole `await __szenario("vorher")` VOR dem Umbau, `await __szenario("nachher")` danach — die
     Rückgabe nennt jeden Unterschied in DOM, Inspektor, CSS-Werten (hell und dunkel), Schreibvorgängen
     und Export-Texten. Leer = nichts hat sich geändert. Wer eine innere Funktion umbenennt, zieht den
     Haken in `mk-test.js` nach. Kopf von `mk-test.js` erklärt die Schritte.

  **Ausführungs-Nachweise** (das Protokoll je Fassung) stehen in
  `artefakte/NACHWEISE-2026-09-07.md` — dort **fortschreiben**, hier steht nur der jüngste:
  - **Fassung 3.03, 2026-09-11 (Rückgängig / Wiederholen, Strg+Z / Strg+Y):** Luis: „ganz wichtig, Strg+Z und Strg+Y für die letzten Schritte“. Umsetzung nach Plan-Prämisse N7 — kein Operations-Protokoll, sondern Dokument-Stände: `dokSchreiben(pfad, daten)` ist jetzt der EINE Weg in die Datenbank (`putNode`/`putEdge`/`putSheet`/`dropDoc` laufen darüber; `putBoard` bewusst nicht — Titel, Einfrieren, Darstellung, Raster sind kein Rückgängig-Fall). Jeder Schreibvorgang merkt sich vorher/nachher des Dokuments (`letzterStand`, gefüttert aus den Ständen per `standMerken()` in den drei apply-Funktionen und aus eigenen Schreibvorgängen); alle Schreibvorgänge eines Ereignis-Durchlaufs bilden EINEN Schritt (`offenerSchritt`, geschlossen per `setTimeout 0` — Löschen mit Pfeilen, Einfügen, Mitnehmen, Ausrichten sind je ein Schritt). `rueckgaengig(zurueck)` schreibt vorher bzw. nachher zurück, aber nur, wenn jedes Dokument des Schritts heute noch genau dem gemerkten Stand entspricht (`stabil()` = stabiler JSON-Vergleich); sonst Toast und der Schritt ist verworfen — fremde Arbeit wird nie stumm zurückgesetzt. Bis 100 Schritte, nur diese Sitzung, nur mit Speicher (ohne: Toast); eingefroren greift `gesperrt()`. Strg+Umschalt+Z = Wiederholen. Beim Tippen in einem Feld gilt weiter das Rückgängig des Browsers (der Tastatur-Handler tritt dort nicht an). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis (Prüf-Geschirr): Kasten anlegen, „Kasten“ tippen, um 100/50 verschieben → drei Schritte; Strg+Z → `set` mit alter Position; Strg+Z → `set` mit Text „“; Strg+Z → `del`; Strg+Z → „Nichts zum Rückgängigmachen.“; Strg+Y, Strg+Umschalt+Z, Strg+Y bauen alles in derselben Reihenfolge wieder auf; Strg+Y → „Nichts zum Wiederholen.“; fremder Stand mit `x: 999` eingespielt → Strg+Z: Toast „… 1 Dokument wurde inzwischen von jemand anderem geändert.“, kein Schreibvorgang, auch der ältere Schritt am selben Dokument abgelehnt. Schritte 6 und 7 stehen aus — **am echten Brett prüfen, dass Strg+Z nach einem Verschieben greift** (der Stand aus der Datenbank muss dem geschriebenen Dokument gleichen; tut er das nicht, meldet jedes Rückgängig „von jemand anderem geändert“).
  - **Fassung 3.02, 2026-09-11 (Start/Ende: kleine Kreise blieben nicht rund):** ein Kreis, kleiner als 48 gezogen, wurde zur liegenden Ellipse und „wackelte“ dabei — `groesseZiehen` und die Größen-Felder ließen 24 zu, aber `applyNodes` kappte JEDES eingelesene Dokument auf 48 × 30; der eigene Schreibvorgang kam als Stand zurück und überschrieb den runden Wert (Luis, 2026-09-11). Jetzt EINE Stelle fürs Mindestmaß: `MIN_W`/`MIN_H`/`MIN_KREIS` mit `minBreite(n)`/`minHoehe(n)` direkt nach `ohneText()`; `addNode`, `groesseZiehen`, `groesseAusFeldern` und `applyNodes` fragen sie. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis (Prüf-Geschirr): Start 40 × 40 angelegt, SO-Griff 200 px nach innen → während und nach dem Ziehen 24 × 24, Dokument `w: 24, h: 24`; Stand mit 24 × 24 eingespielt → bleibt 24 × 24, DOM 24 × 24, `border-radius: 50%`; Stand mit Kasten 10 × 5 → 48 × 30, Ende 10 × 5 → 24 × 24. Schritte 6 und 7 stehen aus.
  - **Fassung 3.01, 2026-09-11 (Raster-Schrittweite im Brett):** die Schrittweite unten rechts („Raster 24“) lag bisher nur im Browser des Betrachters — Claude konnte sie nicht lesen (Luis, 2026-09-11: „ich dachte, das stellt man unten rechts fürs Brett ein“). Jetzt neues Feld `meta/board.raster` (Schrittweite in px, 0 = frei): `putBoard` schreibt es immer mit, der Schieberegler schreibt erst beim Loslassen (`change`), das Zahlenfeld bei `change`; ein hereinkommender Stand mit `raster` setzt `RASTER` und die Anzeige; eingefroren wird nur der Hinweis gezeigt und die Anzeige zurückgesetzt. An/Aus bleibt je Fenster (`rb.raster`); ohne Speicher bleibt `rb.rasterschritt` der Rückfall. `brettAlsJSON` führt das Feld. Skills: `pinit-schreiben` liest `raster` zusammen mit `frozen` aus `meta/board` und legt jedes `x/y/w/h` auf ein Vielfaches (Vorgabe 24, 0 = frei → 8er-Schritte), Gegenprüfung vor dem Schreiben; `pinit-lesen` kennt das Feld. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis (Prüf-Geschirr): Regler auf 40 → Anzeige „Raster 40“, KEIN Schreibvorgang; Loslassen → `set meta/board {…, raster: 40}`; Zahlenfeld 16 → `raster: 16`, `snap(37)` = 32; Titel ändern → schreibt `raster: 16` mit; Export trägt `raster`; kein `rb.rasterschritt` im Browser (Speicher-Modus); eingefroren → Toast, Anzeige bleibt 16, 0 Schreibvorgänge. Fingerabdruck gegen 2.51: nur `raster` in den Dokumenten, Fassungstext und der neue `<b>` im Hinweis der Einstellungen. Schritte 6 und 7 stehen aus.
  - **Fassung 3.00, 2026-09-10 (Aufräumung ohne Verhaltensänderung):** derselbe Funktionsumfang wie 2.51, aber weniger Doppeltes: **ein** Bauplan für Datenbank-Dokumente (`knotenDaten(n, sheet)`/`pfeilDaten(e, von, nach, sheet)` — vorher stand er dreimal, in `putNode`, der Ablage und `brettAlsJSON`); **ein** Anbinder für alle Inspektor-Textfelder (`feldAnbinden()`, registriert sie zugleich für `inspektorAbschliessen()`, vorher sieben Kopien des change/Enter/Esc-Musters); `renderInspector` über Zeilen-Tabellen (`INSP_ZEILEN`/`inspZeilen()`, `INSP_KNOEPFE`/`inspKnoepfe()`, `wertSetzen()`) statt 30 Einzelzeilen je Zweig; `renderNodes` in Bausteine (`knotenBauen` = `knotenFarben` + `knotenInhalt` mit `codeRandBauen`/`modellBauen` + `markenSetzen`, Griffe `griffeBauen`); Auswahl-Helfer (`auswahlLeeren`/`nichtsWaehlen`/`waehlen`/`gewaehlterKnoten`/`gewaehlterPfeil`/`gewaehlteKnotenIds` — die „beide Mengen leeren“-Regel steht damit an EINER Stelle statt an zehn); kleine Helfer (`$`, `svgEl`, `leeren`, `naechst`, `knotenEl`, `druecken`, `vergessen`); `TASTE` aus `TOOLS` abgeleitet statt zweiter Liste; Menü-Helfer für Reiter- und Zellen-Menü; `standAngewendet()` als gemeinsamer Abschluss der drei apply-Funktionen; `tabellenGriffAnfassen()` aus dem mousedown herausgelöst; `nachbarKanten()` für die Hilfslinien; Ebenen über `Z_BASIS`/`ebeneZ()`. CSS: **eine** globale `[hidden]`-Regel (ersetzt acht Einzelregeln; die Artifact-Hülle setzt dieselbe — damit verhält sich die Datei lokal wie veröffentlicht: der Knopf „Eigenes Brett anlegen“ und die Senkrecht-Knöpfe sind lokal jetzt wirklich unsichtbar, wenn `hidden`), ein Grundstil für Inspektor-Felder, Ring-Regeln als `:is()`-Liste, Code-Farben und Status-Farben als Token; die doppelte Dunkel-Palette bleibt bewusst (Kommentar im CSS erklärt warum). 5064 → 4931 Zeilen. Schritte 2, 3, 4, 9 grün. **Schritt 5 als Fingerabdruck-Vergleich** (neues Prüf-Geschirr `code/pruefung/`, s. Test-Konvention Schritt 10): 74 Aufnahmen über alle Bauarten, Pfeil-Arten, Inspektor-Knöpfe, Maus (Verschieben mit Mitnehmen, Größe, Rahmen, Pfeil ziehen, Aufziehen, Schieben, Rad), Tastatur, Reiter/Gruppen/Menüs, fremde Stände, Export, Einfrieren, Einstellungen, hell und dunkel; 148 Datenbank-Schreibvorgänge — nach jedem der vier Umbau-Schritte **0 Unterschiede** zu 2.51, am Ende nur der Fassungstext und die `[hidden]`-Folge (36 CSS-Werte, alle an Kopfzeile/Inspektor-Höhe, keine Farbe, kein Rand, keine Schrift). Schritte 6 und 7 stehen aus.
  - **Fassung 2.51, 2026-09-10 (Tabelle: „Als Text“ weg):** das Inhalts-Textfeld aus 2.4 (`tbl-text`, `zellenAlsText`/`textAlsZellen`/`commitTblText`) ist entfernt — Gitter im Inspektor und Doppelklick in die Zelle reichen (Luis, 2026-09-10). Mit weg: der Zweig in `inspektorAbschliessen()` und die CSS-Regeln `.tbl-text-details`. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Tabelle gewählt → kein `#tbl-text` im DOM, Gitter 3×2 da, „+ Zeile“ und Zellen-Menü weiter in Ordnung. Schritte 6 und 7 stehen aus.
  - **Fassung 2.50, 2026-09-10 (Sichtbarkeit, Issue #8):** neues optionales Feld `hidden` (boolean, im Brett — alle Betrachter und Claude sehen es). Ausgeblendet = blasser, gestrichelter Umriss ohne Inhalt (`.node.versteckt`, opacity .3, Kinder `visibility: hidden`; Raute behält ihren Umriss), weiter wählbar und verschiebbar, Doppelklick zum Tippen wird mit Hinweis abgelehnt. Alles, was ganz in einem ausgeblendeten Element und davor liegt (Mitnehmen-Regel, `mitnehmer()`), wird gar nicht gezeichnet und vom Auswahl-Rahmen nicht gewählt; Pfeile an einem ausgeblendeten oder darin liegenden Element werden nicht gezeichnet (`verstecktMengen()` liefert `umriss`/`weg`, gefragt in `renderNodes`, `renderWires`, Auswahl-Rahmen). Umschalten: Knopf „Ausblenden/Einblenden“ (`#btn-hide`, Abschnitt Anordnen, auch im Sammel-Modus) und Strg+Umschalt+H — ein Schreibweg `sichtbarkeitUmschalten()`; sind alle gewählten schon ausgeblendet, werden sie eingeblendet. `putNode`, `knotenDaten` (Kopieren/Duplizieren nimmt es mit), `applyNodes`, `brettAlsJSON` führen das Feld. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Rahmen F mit A und B darin, C/T/D außerhalb, fünf Pfeile → F ausblenden: DOM „F* C T D“, Pfeile nur e4/e5 (C→T, T→D); F opacity .3, Rand dashed, Text hidden; Knopf „Einblenden“; Strg+Umschalt+H → alles zurück; Sammel A+C → „A* B C*“, Pfeile e2/e5; Raute D → gestrichelter Umriss. Bildschirmfoto geprüft. Schritte 6 und 7 stehen aus.
  - **Fassung 2.49, 2026-09-10 (Tabelle: Zeile/Spalte an der Zelle, Issue #7):** Rechtsklick auf eine Zelle öffnet ein Menü (`tabellenMenueZeigen()`, nutzt `#tab-menu` als Hülle): Zeile davor/danach einfügen, Zeile löschen, Spalte davor/danach einfügen, Spalte löschen — an der geklickten Zelle; die Tabelle wird dabei gewählt. Die vier Inspektor-Knöpfe und das Menü laufen über dieselben Helfer `zeileEinfuegen/zeileLoeschen/spalteEinfuegen/spalteLoeschen(n, at)` (Knöpfe = am Ende) und `tabelleAendernFuer(id, fn)`; `colW`/`rowH` werden mitgeführt (neue Zeile/Spalte nimmt das Maß der davor). Kein Menü beim Tippen in der Tabelle; eingefroren nur der Hinweis. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis (Tabelle 3×3, colW 60/80/120, rowH 30/40/50): Rechtsklick Zeile 2/Spalte 2 → 6 Knöpfe, Tabelle gewählt; „Zeile danach einfügen“ → leere Zeile an Index 2, rowH 30/40/50/50; „Spalte davor einfügen“ an Spalte 1 → Kopf „,A,B,C“, colW 60/60/80/120; „Zeile löschen“ Zeile 1 → Kopf weg; „Spalte löschen“ Spalte 3 → 12 Zellen, colW 60/60/120; „− Zeile“ im Inspektor weiter in Ordnung. Schritte 6 und 7 stehen aus.
  - **Fassung 2.48, 2026-09-10 (Performance, Issue #9):** Nachgemessen mit 273 Elementen und 173 Pfeilen (Wegwerf-Kopie mit Test-Haken, nicht im Repo): jeder Klick baute alles neu und kostete ~250 ms, davon ~190 ms allein für die Pfeile — nicht das JavaScript (2 ms), sondern das Layout danach, weil jeder `url(#mk)`-Marker-Verweis Chrome alle anderen Verweise neu durchrechnen lässt (Probe: 173 leere SVGs 2,6 ms, mit Pfad 2,4 ms, mit Pfad + Marker 186 ms); beim Ziehen eines Elements lief das bei JEDER Mausbewegung. Zweite Bremse: jede Tabelle maß sich direkt nach dem Einhängen (`getBoundingClientRect`) und erzwang je Tabelle ein neues Layout (273 Tabellen: 1889 ms, 21 Tabellen: ~150 ms). Änderungen: (1) Pfeilspitzen sind eigene Pfade je Pfeil (`kopfPfad()`/`kopf()` in `renderWires`, Klassen `.kopf`/`.kopf.tri`, Maße wie die alten Marker, Strichstärke 1.6/2.4/2.6), die `<marker>`-Definitionen und das Träger-SVG `#wires` sind weg. (2) `tabellenGriffeLegen` ist in `tabellenGriffeMessen` (nur lesen) und `tabellenGriffeSetzen` (nur schreiben) geteilt; `renderNodes` misst erst alle Tabellen und setzt dann alle Griffe. (3) `.node { contain: paint }` — im Test-Fenster nicht messbar (die Bildzeiten sinken beim wiederholten Schieben von 50 auf 17 ms, egal welche Einstellung: der Browser wärmt seinen Bild-Zwischenspeicher), bleibt als Standard-Empfehlung ohne sichtbare Änderung (`.node` hat schon `overflow: hidden`). Ergebnis: Neuaufbau 250 → 22 ms, Pfeile 189 → 4 ms, Schieben mit 962 sichtbaren Elementen ohne Marker 43 → 28 ms je Bild. Schritte 2, 3, 4 grün. Schritt 5 per Bildschirmfoto: Spitze, hohles Dreieck, beide Enden, ohne Spitze (gestrichelt), gewählter Pfeil blau mit 2.4 px; Tabellen-Griffe bei colW [50,50,60] auf 47/97 px und rowH [30,30,30] auf 27/57 px wie vorher. Schritte 6 und 7 stehen aus.
  - **Fassung 2.47, 2026-09-09 (Code oben):** Vorgabe der senkrechten Ausrichtung für `code` ist `top` (`senkrecht()`, wie bei der Notiz); wer `valign` gesetzt hat, behält es. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: neuer Code-Kasten → `align-items: flex-start`, Text 31 px unter der Oberkante (direkt unter der Kopfleiste) bei 120 px Kastenhöhe, Knopf „oben“ gedrückt. Schritte 6 und 7 stehen aus.
  - **Fassung 2.46, 2026-09-09 (Tabellen-Trennlinien rasten):** beim Ziehen einer Spalten-/Zeilen-Trennlinie rastet die LINIE auf dem Raster, nicht das Maß — `mousedown` merkt die Brett-Position der Anfangskante der Spalte/Zeile (`drag.basis`, aus dem DOM per `toBoard()`), `mousemove` rechnet `snap(basis + Maß) − basis`. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis (Raster 24, Tabelle bei −336/−168): Spalten-Griff +31 → Trennlinie bei −144, Breite 190; Zeilen-Griff +17 → Trennlinie bei −72, Höhe 67 — beide Linien Vielfache von 24. Schritte 6 und 7 stehen aus.
  - **Fassung 2.45, 2026-09-09 (Doppelklick markiert das Wort):** wird in einem Feld schon getippt, gehört ein weiterer Doppelklick dem Browser (`tipptSchon()` in der eigenen Doppelklick-Erkennung und im nativen `dblclick`-Handler; vorher schluckte `preventDefault` den Klick, `oeffneZumTippen` tat bei „schon offen“ nichts). Zellen prüfen `editing.zelle`. Schritte 2, 3, 4 grün. Schritt 5 mit ECHTER Maus: Notiz „Hallo Welt zwei“ öffnen, Doppelklick auf „Hallo“ → Markierung „Hallo “, auf „Welt“ → „Welt “ (Windows nimmt das Leerzeichen mit), Tippen bleibt offen. Schritte 6 und 7 stehen aus.
  - **Fassung 2.44, 2026-09-09 (Code: Zeilennummern, Farben):** (1) Enter im Code-Kasten ließ die Zeilennummer um zwei springen und beim Tippen wieder zurück — Chrome hängt hinter einem Zeilenende ein unsichtbares `<br>` an, `innerText` endet dann auf `

`; der Zähler streicht dieses eine Ende jetzt. (2) `codeFuellen()` färbt zur Anzeige: Kommentare (`//`, `/* */`, Zeilenanfang `#`/`--`), Zeichenketten, JSON-Schlüssel (Zeichenkette vor `:`), Zahlen, Schlüsselwörter (JS/Python/Go/Rust/SQL-Auswahl, `CODE_KW`); Klassen `.c-com/.c-str/.c-key/.c-num/.c-kw`, Farben hell und dunkel getrennt (CSS-Nesting in den beiden Dunkel-Blöcken); beim Tippen bleibt roher Text. Schritte 2, 3, 4 grün. Schritt 5: Beispieltext → Klassen c-com [„// Kommentar“, „/* block */“], c-kw [const, SELECT, FROM, return, true], c-num [42, 1.5], c-key ["name", 'x'], c-str ["Luis"]; Enter nachgebaut (`insertLineBreak`, das Test-Fenster liefert kein echtes Enter): innerText endet auf `

`, Rand zeigt 6 statt 7, nach „z“ weiter 6. Schritte 6 und 7 stehen aus.
  - **Fassung 2.43, 2026-09-09 (Smart Guides beim Größe ziehen):** in `groesseZiehen()` schnappt die GEZOGENE Kante an Kanten und Mitten der Nachbarn (gleicher `guideTreffer()`, rohe Mausposition, vor dem Raster, Mindestmaß bleibt), mit roter Linie; Kreise ausgenommen; dieselbe Einstellung „Hilfslinien“ gilt. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis (Raster aus): Ost-Griff von B so gezogen, dass Bs rechte Kante 4 px vor As rechter Kante (−192) liegt → Linie senkrecht@−192, B-Breite 120, rechte Kante nach dem Loslassen −192; Nord-Griff 3 px unter As Unterkante (−174) → Linie waagerecht@−174, Oberkante −174; Linien nach dem Loslassen weg. Schritte 6 und 7 stehen aus.
  - **Fassung 2.42, 2026-09-09 (Smart Guides):** Option 2 der Raster-Entscheidung: beim Verschieben schnappt das Element an Kanten und Mitten der Nachbarn ein (gleicher Reiter, Mitgenommene ausgenommen), wenn es näher als 7 Bildschirm-Pixel dran ist (`GUIDE_NAEHE / view.k`), und zeigt eine rote Linie (`.smart-guide` in `#layer`, `hilfslinieZeigen()`/`hilfslinienWeg()`, `guideTreffer()` wählt den kleinsten Abstand je Achse). Die Hilfslinie hat Vorrang vor dem Raster. Einstellungen → Darstellung → „Hilfslinien an/Aus“ (`GUIDES`, `rb.guides`, je Betrachter). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis (Raster aus): B mit linker Kante 4 px rechts von As rechter Kante und 3 px tiefer gezogen → Linien senkrecht@−192 und waagerecht@−240, nach dem Loslassen B bei −192/−240 = As Kante/Oberkante, Linien weg; „Aus“ → 1 px daneben gezogen → −193/−241, keine Linie. Nebenbefund: ein zweiter Kunst-Klick auf dasselbe Element innerhalb 400 ms öffnet das Tippen (Doppelklick-Erkennung) — im Test erst Escape. Schritte 6 und 7 stehen aus.
  - **Fassung 2.41, 2026-09-09 (Notiz-Cursor, Inspektor bis 60 %):** Doppelklick auf Notiz und Code setzt den Cursor ans Ende statt alles zu markieren (`beginEdit`, `r.collapse(false)` — der erste Tastendruck löschte sonst den ganzen Text); kurze Beschriftungen bleiben markiert. Inspektor-Breite bis 60 % der Fläche (CSS `max-width: 60%`, Griff-Grenze `stage × 0.6`, vorher 560 px). Schritte 2, 3, 4 grün. Schritt 5 mit ECHTER Maus: Notiz „Hallo Welt“ tippen, abschließen, erneut doppelklicken → Auswahl zusammengefallen am Ende, „ zwei“ getippt → „Hallo Welt zwei“; Griff 2000 px nach links → Inspektor 800 px bei Fläche 1334 = 60 %. Schritte 6 und 7 stehen aus.
  - **Fassung 2.40, 2026-09-09 (Raster an den Kanten):** das Raster greift beim Verschieben an der Ecke oben links, beim Anlegen an der Ecke, beim Größe-Ziehen an der GEZOGENEN Kante (`groesseZiehen()`: E/S rasten die rechte/untere Kante, W/N die linke/obere, die stehende Kante bleibt exakt; Kreise rasten weiter das Maß). Von Luis so entschieden (Option 1 von 2; Option 2 = zusätzlich Smart Guides an Nachbar-Kanten, später). Grund: mit der Mitte (2.27–2.39) lagen die Kanten bei „Mitte ± halbe Größe“ und damit nie auf dem Raster, sobald die Größe kein Vielfaches war — zwei Kästen fanden keine gemeinsame Kante. Der Inspektor zeigt weiter die Mitte. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis bei Raster 24: Aufziehen 137/143→301/239 → −336/−264, 168×96; Verschieben um 37/13 → −288/−240; Ostkante +31 → rechte Kante −96, linke bleibt; Westkante −20 → linke −312, rechte bleibt −96; Nordkante −15 → obere −264, untere bleibt −144; alle Werte Vielfache von 24. Schritte 6 und 7 stehen aus.
  - **Fassung 2.39, 2026-09-09 (Linien in Randfarbe, Auto-Größe):** (1) alle inneren Linien und Kopf-Hintergründe (Tabelle, Rahmen, Code-Kopfleiste und Zeilennummern, Entitäten-/DB-/Klassen-Modell, Listen-Baustein) laufen über die Variable `--rand`, die `renderNodes` je Element auf `var(--s-<farbe>)` setzt — dieselbe Farbe wie der Außenrand, Hintergründe als `color-mix` 22 %; die Notiz bleibt bei `--papier`. (2) neues optionales Feld `auto` (nur `entity`/`dbmodel`/`classmodel`): Knopf „⤢ Auto-Größe“ im Inspektor unter den Maßen; an = `autoAnpassen()` misst Kopf und Zeilen per Canvas-`measureText` (`inhaltsMasse()`) und setzt Breite und Höhe, danach bei jeder Inhalts-Änderung erneut (Felder-Textfeld, Titel, Schriftgrad/fett); Ziehen am Griff oder Tippen in B/H schaltet es aus. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Tabellen-Zelle, DB-Zelle und Entitäten-Kopf tragen exakt die Randfarbe ihres Elements (169/182/195 bzw. 162/148/196); DB-Modell 220×76 → Auto an → 132×72 → vier Zeilen → 237×112, scrollHeight = clientHeight, Gitterbreite = Kastenbreite; Tabelle zeigt den Knopf nicht. Schritte 6 und 7 stehen aus.
  - **Fassung 2.38, 2026-09-09 (acht Wünsche von Luis):** (1) Rahmen heißt überall „Rahmen“ (Bauart-Label und Vorgabetext, war „Bildschirm“). (2–4) Zwei neue Bauarten mit demselben Datenbau wie `entity` — `dbmodel` „DB-Modell“ (Taste M, jede Feldzeile „Name: Typ“ als zwei Zellen mit Linien, `.db-grid`) und `classmodel` „Klassen-Modell“ (Taste K, eckig, drei Fächer mit durchgezogenen Linien, Methoden-Fach immer da); `entity` unverändert, nur umbenannt zu „Entitäten-Modell“; die EINE Frage „trägt Felder?“ ist `hatFelder()` (putNode, knotenDaten, brettAlsJSON, applyNodes, Inspektor, commitEntity). (5) Code-Kasten als Editor-Fenster: Kopfleiste mit drei Punkten (`::before`), Zeilennummern `.code-gutter` (laufen beim Tippen über `input` mit). (6) Tabellen-Zellrand neutral `rgba(127,127,127,.45)` statt `--line` — auf Weiß im Dunkelmodus unsichtbar. (7) Notiz: jede Textzeile genau 1.6em (auch Listen/Überschriften), Linie alle 1.6em — Text steht immer zwischen zwei Linien, beides hängt am Schriftgrad. (8) Reiter-Typ-Symbol 15 px statt 12; Rechtsklick-Menü zeigt alle Typen als Knöpfe mit Symbol und Namen (`reiterTypSetzen()` ist der eine Schreibweg, Symbol-Klick läuft auch darüber). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Leiste zeigt Rahmen/Baustein/Entitäten-Modell/DB-Modell/Klassen-Modell/Code/Start/Ende; DB-Modell 4 Zellen (ID | String NN PK, Name | String NN), Inspektor „DB-Modell“ mit Felder-Textfeld; Klasse 2 Fächer, Radius 0, Methoden „+ speichern(): void“; Code Zeilennummern „1 2“, Kopfleiste 22 px; Notiz line-height 20.8 px bei 13 px = 1.6em, Linienperiode 20.8; Zellrand rgba(127,127,127,.45); Rahmen-Text und -Label „Rahmen“; Rechtsklick → 5 Typ-Knöpfe, Klick auf „Datenmodell“ → Symbol ⛁ bei 15 px. Bildschirmfoto hell und dunkel geprüft (Tabellenlinien im Dunkelmodus sichtbar). Schritte 6 und 7 stehen aus.
  - **Fassung 2.37, 2026-09-09 (GitHub-Issues #4–#6):** **#4 Pfeiltasten** — `auswahlSchieben()` schiebt die Auswahl (Einzel-Element mit Mitnehmern, Sammel-Auswahl) um einen Raster-Schritt, ohne Raster 1 px, mit Umschalt 10 px; gespeichert wird gesammelt 300 ms nach der letzten Taste (`tastenOffen` zählt als Warte-Grund). **#5 Nachbarschaft** — `nachbarschaft()` liefert bei genau einem gewählten Element die anhängenden Pfeile und die Elemente am anderen Ende; Pfeile bekommen `.nah` (2.6 px, Akzent-Spitze) und liegen auf topZ+1, Nachbarn und das gewählte Element auf topZ+2, Nachbarn mit halb durchsichtigem Ring (`color-mix`) ohne Griffe; ohne Auswahl gilt wieder das gespeicherte z. **#6 Info-Verlust** — `inspektorAbschliessen()` schreibt das fokussierte Inspektor-Feld (Notiz, Verweis, Felder, Tabelle, Pfeiltext, Endbeschriftungen, Maße, Gitter-Zelle) für die NOCH gültige Auswahl, bevor `mousedown` auf der Fläche oder `switchSheet` die Auswahl wechselt; das Klick-Ziel wird danach per `elementFromPoint` neu gesucht, weil das Schreiben neu zeichnet. Schritte 2, 3, 4 grün. Schritt 5: Pfeiltasten per Ereignis → −396/−297 → −372/−249 (24er-Schritte), Raster aus → −373, Umschalt → −259; Hervorhebung: A gewählt → B `.nah`, z 2010/2010/2006, Pfeil-Ebene 2007, Strich 2.6 px, Ring auf B; abgewählt → nichts mehr `.nah`, z zurück auf 2002. Issue #6 mit ECHTER Maus (Kunst-Fokus greift im Test-Fenster nicht): Notiz tippen → auf die Fläche klicken → Element wieder wählen → „Hallo Notiz“ steht und die Ecke ist da; Verweis tippen → anderes Element klicken → zurück → „src/a.ts“ steht. Schritte 6 und 7 stehen aus.
  - **Fassung 2.36, 2026-09-08 (Tabelle: Außenkanten am Kasten, Griffe über die ganze Länge):** die Tabelle füllt den Kasten immer ganz — alle Spalten/Zeilen bis auf die letzte sind fest, die letzte bekommt den Rest (Spalten über `table-layout: fixed` + letzte `col` ohne Breite; Zeilen ausdrücklich in `tabellenGriffeLegen()`, weil ein Browser Extra-Höhe sonst auf ALLE Zeilen verteilt, auch feste — darum steht die Tabelle mit `rowH` auf `flex: none`). Griffe liegen in einer Hülle `.tbl-wrap` über die ganze Tabellenhöhe bzw. -breite, an der letzten Kante keiner (die ist der Kastenrand); Lage nach dem Einhängen gemessen, auch beim Größe-Ziehen des Kastens nachgelegt. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Kopf −20 → 57/53/53 → 37/53/72; Zeile 1 +25 → 37/78/47; Kasten +80/+80 → 37/78/119 (Kopf bleibt), Spalten 130/130 → 166/166; zurück → 37/78/47; Tabelle unten und rechts stets am Kastenrand; Spalten-Griff volle Höhe, Zeilen-Griff volle Breite. Schritte 6 und 7 stehen aus.
  - **Fassung 2.35, 2026-09-08 (Tabelle: Spalten und Zeilen ziehen):** neue optionale Felder `colW`/`rowH` (Brett-Pixel je Spalte/Zeile, `masseLesen()`, nur mitgeschrieben, wenn die Länge passt — `tabellenMasse()`); Griffe `.tbl-cgrip` (rechte Kante der Kopfzellen) und `.tbl-rgrip` (untere Kante der ersten Spalte), `drag.mode` `tblcol`/`tblrow`; beim ersten Ziehen werden alle aktuellen Maße festgehalten (`tabellenMasseLesen()`), Ziehen wirkt direkt am DOM (`tabellenMassAnwenden()`), `mouseup` speichert und lässt den Kasten mitwachsen; mit `rowH` steht die Tabelle auf `flex: none`, die Kopfzeile wächst nicht mehr mit dem Kasten; `+/− Spalte/Zeile` führen die Listen mit. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Spalte 0 +60 → 130/130 → 190/130, Kasten 264 → 324; Zeile 1 +30 → 53 → 83; Kasten 100 höher → Zeilen bleiben 57/83/53; + Spalte → 190/130/130, − Spalte → 190/130. Schritte 6 und 7 stehen aus.
  - **Fassung 2.34, 2026-09-08 (Inspektor: Luft zur Zoomleiste, Griff links):** `max-height: calc(100% − 72px)` lässt 12 px über der Zoomleiste; der Browser-Griff (`resize`) ist weg — er saß rechts unten und zog verkehrt herum, weil der Inspektor rechts verankert ist. Neuer Griff `#insp-griff` als Nachbar in `#stage`, per ResizeObserver an die linke Kante gelegt (volle Höhe), nach links ziehen = breiter (232–560 px), Breite in `rb.insp.w`. Schritte 2, 3, 4 grün. Schritt 5: per Ereignis Griff 100 px nach links → 232 → 332; mit ECHTER Maus 100 px nach links → 498 (Kunst-Ereignis und echte Maus verschieden weit, beides richtig herum); Griff sitzt auf der Kante (Abstand 0), gleiche Höhe, Unterkante 40 px über der Zoomleiste. Schritte 6 und 7 stehen aus.
  - **Fassung 2.33, 2026-09-08 (Inspektor scrollt + verbreitern; Dialog-Griff zurück):** `#inspector` mit `max-height: calc(100% − 24px)`, `overflow-y: auto`, `resize: horizontal` (232–560 px, rechts verankert, wächst nach links), Breite je Betrachter `rb.insp.w`; der Zieh-Griff am Einstellungs-Dialog aus 2.32 ist auf Luis’ Wunsch wieder weg (altes Maß `min(78vh, 640px)`), der `min-height: 0`-Scroll-Fix bleibt. Schritte 2, 3, 4 grün. Schritt 5 per Messung bei 1100×600: Inspektor 365 px in Bühne 389, scrollt innen, Unterkante im Fenster; Dialog `resize: none`. Schritte 6 und 7 stehen aus.
  - **Fassung 2.32, 2026-09-08 (Einstellungen scrollen + verbreitern):** `.einst-inhalt` bekam `flex: 1 1 auto; min-height: 0` (ohne `min-height: 0` schrumpft ein Flex-Kind nicht unter seinen Inhalt — der Dialog lief unten über den Rand, nichts scrollte); `#einst` mit `resize: horizontal`, min 360 px, max Fensterbreite, Höhe max `100vh − 32px`; Breite je Betrachter über ResizeObserver in `rb.einst.w`. Schritte 2, 3, 4 grün. Schritt 5 per Messung: Dialog 1242 px bei Fenster 1274, Inhalt scrollHeight 1415 > clientHeight 1163 → scrollt innen; `resize: horizontal` gesetzt. Schritte 6 und 7 stehen aus.
  - **Fassung 2.31, 2026-09-08 (Gruppen zu, Ziehen robust):** zugeklappte Reiter blieben sichtbar — `.tab { display: inline-flex }` überstimmt das `hidden`-Attribut, die Seite hat keine globale `[hidden]`-Regel (der Test in 2.27 maß nur `e.hidden`, nicht die Darstellung). Jetzt `#tabs .tab[hidden] { display: none !important; }`. Ziehen: Schwelle 5 px in x ODER y, `preventDefault` im mousedown, Ablegen auf der leeren Leiste = ans Ende. Schritte 2, 3, 4 grün. Schritt 5 mit ECHTER Maus (Browser-Fenster, nicht per Ereignis): Chip-Klick → Reiter 2/3 `display: none`; Chip hinter Reiter 4 gezogen → Ü/4/[Alpha 2 3]. Lehre: Sichtbarkeit über `getComputedStyle(...).display` messen, nie über das Attribut. Schritte 6 und 7 stehen aus.
  - **Fassung 2.30, 2026-09-08 (Gruppen ziehen):** der Gruppen-Chip ist ziehbar (`gruppeVerschieben()`: alle Mitglieder raus, vor/hinter dem Ziel wieder rein, bei Ziel in einer Gruppe vor deren erstem/hinter deren letztem Mitglied); ein Reiter auf den Chip gezogen = beitreten (hinten) oder frei davor (`reiterZuGruppe()`); Chip-Klick nach Ziehen kein Zuklappen. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Ü/[A 2 3]/4 → Chip hinter 4 → Ü/4/[A 2 3] → Chip vor Ü → [A 2 3]/Ü/4 → Reiter 4 auf Chip hinten → [A 2 3 4]/Ü, in-group gesetzt; Chip-Klick klappt 2 Reiter weg. Schritte 6 und 7 stehen aus.
  - **Fassung 2.29, 2026-09-08 (Figma-Regel fürs Rad):** keine Geräte-Erkennung mehr — Rad schiebt (Touchpad in alle Richtungen), Strg+Rad und Kneifen zoomen (`radZoom()`, Schritt gedeckelt auf ±12 → 1.127 je Maus-Raster), Umschalt+Rad waagerecht; Wahl „Rad zoomt“ für Maus-Nutzer (`rb.rad` = schieben|zoomen). Von Luis so entschieden (Option 1). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Rad 100 → schiebt 100; 12.5/−7 → schiebt; Strg −100 → Zoom 1.127; Strg −5 → 1.051; Umschalt → waagerecht; Modus „zoomen“: Rad −100 → Zoom 1.128, seitliches Rad schiebt weiter. Schritte 6 und 7 stehen aus.
  - **Fassung 2.28, 2026-09-08 (Touchpad automatisch):** `istTouchpad(ev)` stuft jedes Rad-Ereignis ein (deltaMode ≠ 0 → Maus; deltaX ≠ 0 → Touchpad; |deltaY| Vielfaches von 100/120 → Maus; klein oder krumm → Touchpad), Vorgabe „Automatisch“, Maus/Touchpad bleiben als feste Wahl. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: 100/−120/3 Zeilen → Zoom; 12.5/−7 und 23 → schieben; Strg −18 → Zoom 1.20; Strg 100 → senkrecht 100. Schritte 6 und 7 stehen aus.
  - **Fassung 2.27, 2026-09-08 (GitHub-Issues #1–#3):** **#1 Reiter** — Ziehen ordnet die Reiter
    (`reiterZiehbar()`, `reiterVerschieben()`, `order` wird entlang `sichtbareFolge()` neu vergeben),
    Rechtsklick öffnet `#tab-menu` (Umbenennen, Gruppe, lösen), neues Feld `sheets.group`
    (`gruppeLesen()`, `reiterGruppieren()`), Gruppen-Chip klappt zu/auf (je Betrachter, `rb.grp.<name>`
    + Seitenspeicher `gruppenZu`). **#2 Mitte** — Inspektor-Felder und Koordinaten zeigen die Mitte
    (`Mx`/`My`), das Raster greift beim Ziehen und Anlegen an der Mitte. **#3 Touchpad** — Darstellung
    → „Mausrad / Touchpad“ (`RAD`, `rb.rad`): zwei Finger schieben, Kneifen zoomt. Schritte 2, 3, 4 grün.
    Schritt 5 per Ereignis: Reiter 3 vor Übersicht gezogen → Folge 3/Ü/2; Rechtsklick + „Alpha“ + Enter →
    Chip [Alpha] vor den Mitgliedern, Chip-Klick versteckt das nicht-aktive Mitglied; Mx-Feld 240 → Mitte
    240; Ziehen um 37/13 px → Mitte 288/−192 (Vielfache von 24); Touchpad: Rad ohne Taste schiebt 30/50,
    Strg+Rad zoomt 1.22, Maus-Modus zoomt wie bisher. Schritte 6 und 7 stehen aus.
  - **Fassung 2.26, 2026-09-07 (Rücknahme):** Fett und Ausrichtung je Zeile (2.25) wieder entfernt; Listen, Nummern, Überschriften, Enter-Fortsetzung und der S9-Fix bleiben. Schritte 2, 3, 4 grün, Schritt 5 per Ereignis: Enter in „- eins“ → „- “, Enter in „1. a“ → „2. “, B wirkt aufs Element. Schritte 6 und 7 stehen aus.
  - **Fassung 2.25, 2026-09-07 (Zeilen-Formate per Knopf, S9 der Prüfliste):** beim Tippen wirken B und die
    drei Ausrichtungs-Knöpfe nur auf die Cursor-Zeile bzw. die Markierung (`zeileFormatieren()`,
    `cursorZeile()`, Marker `**fett**`, `<- `/`<-> `/`-> `; `mousedown` auf den Knöpfen hält den Fokus im
    Feld), Strg+B im Feld. **Dabei S9 bestätigt und behoben:** `editing.el` war immer `undefined`, weil `t`
    erst nach dem Merker deklariert wurde — der Wächter in `renderNodes` lief nie, ein Neuaufbau während des
    Tippens las `innerText` aus einem abgehängten Feld und verlor die Umbrüche (real gemessen: „Erste
    Zeile- Punkt einsDritte“). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: B → `**Dritte**`, Rechts →
    `-> **Dritte**`, B → `-> Dritte`, Markierung „Erste“ + B → `**Erste** Zeile`, Mitte in Listenzeile →
    `<-> - Punkt eins`, Enter → neue Zeile `<-> - `; Darstellung mit `<b>` und `text-align`. Schritte 6 und 7 stehen aus.
  - **Fassung 2.24, 2026-09-07 (Notiz ruhiger):** Papierlinien blasser (`--papier` .09/.10), jede zweite Textzeile (2.7em), als eigene Ebene `::after` unter dem Lochband über die volle Breite; Eselsohr und Innenschatten weg. Schritte 2, 3, 4 grün, Schritt 5 per Bildschirmfoto. Schritte 6 und 7 stehen aus.
  - **Fassung 2.23, 2026-09-07 (Zeilen-Formate, Notizblock, runde Kreise):** `zeilenArt()` erkennt
    `- `, `1. `, `# `, `## `; `listeFortsetzen()` setzt bei Enter die Liste fort und beendet sie in
    einer leeren Listenzeile (Chrome legt in plaintext-only jede Zeile in ein `<div>`, darum Block-Suche
    statt `range.toString()`). Notiz mit Lochband, Papierlinien (`--papier` in allen drei Farbblöcken),
    Vorgabe links oben. `anlegeEnde()` macht Start/Ende beim Aufziehen quadratisch. Schritte 2, 3, 4 grün.
    Schritt 5 per Ereignis: Start 120×50 gezogen → 120×120 (Vorschau und Element); „# Titel“, „- eins“,
    Enter, „zwei“, Enter, Enter, „1. a“, Enter, „b“ → roh `# Titel\n- eins\n- zwei\n1. a\n2. b`,
    dargestellt als h1/li/li/ol/ol. Schritte 6 und 7 stehen aus.
