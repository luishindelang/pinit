# Pinit — Ausführungs-Nachweise

Ausgelagert aus `CLAUDE.md` (Test-Konvention), damit die Verfassung schlank bleibt. Je Fassung: welche
der neun Prüfschritte liefen und was gemessen wurde. **Hier fortschreiben**, in `CLAUDE.md` steht nur der
jüngste Eintrag.

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
- **Fassung 2.21, 2026-09-07 (F2 der Prüfliste):** der Tastatur-Wächter kennt jetzt `SELECT` und
  `TEXTAREA`, und die zwei Auswahllisten (`frame-layout`, `widget-variant`) stoppen `keydown` wie alle
  anderen Inspektor-Felder. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Auswahlliste fokussiert,
  Backspace → Element bleibt, „s“ → Werkzeug bleibt Auswählen. Schritte 6 und 7 stehen aus.
- **Fassung 2.22, 2026-09-07 (Griffe vorn):** die acht Größen-Griffe liegen nicht mehr im Knoten
  (dessen `overflow: hidden` schnitt sie ab und der Auswahl-Ring lag davor), sondern in einer eigenen
  Ebene `.grips` in `#layer` (z-index 8000), mittig auf dem Ring. Schritte 2, 3, 4 grün. Schritt 5 per
  Ereignis: `elementFromPoint` auf dem Griff liefert den Griff; Ecke ziehen ändert die Größe
  (168×66 → 240×96), Verschieben nimmt die Griff-Ebene mit. Schritte 6 und 7 stehen aus.
- **Fassung 2.23, 2026-09-07 (Zeilen-Formate, Notizblock, runde Kreise):** `zeilenArt()` erkennt
  `- `, `1. `, `# `, `## `; `listeFortsetzen()` setzt bei Enter die Liste fort und beendet sie in
  einer leeren Listenzeile (Chrome legt in plaintext-only jede Zeile in ein `<div>`, darum Block-Suche
  statt `range.toString()`). Notiz mit Lochband, Papierlinien (`--papier` in allen drei Farbblöcken),
  Vorgabe links oben. `anlegeEnde()` macht Start/Ende beim Aufziehen quadratisch. Schritte 2, 3, 4 grün.
  Schritt 5 per Ereignis: Start 120×50 gezogen → 120×120 (Vorschau und Element); „# Titel“, „- eins“,
  Enter, „zwei“, Enter, Enter, „1. a“, Enter, „b“ → roh `# Titel\n- eins\n- zwei\n1. a\n2. b`,
  dargestellt als h1/li/li/ol/ol. Schritte 6 und 7 stehen aus.
- **Fassung 2.24, 2026-09-07 (Notiz ruhiger):** Papierlinien blasser (`--papier` .09/.10), jede zweite Textzeile (2.7em), als eigene Ebene `::after` unter dem Lochband über die volle Breite; Eselsohr und Innenschatten weg. Schritte 2, 3, 4 grün, Schritt 5 per Bildschirmfoto. Schritte 6 und 7 stehen aus.
- **Fassung 2.25, 2026-09-07 (Zeilen-Formate per Knopf, S9 der Prüfliste):** beim Tippen wirken B und die
  drei Ausrichtungs-Knöpfe nur auf die Cursor-Zeile bzw. die Markierung (`zeileFormatieren()`,
  `cursorZeile()`, Marker `**fett**`, `<- `/`<-> `/`-> `; `mousedown` auf den Knöpfen hält den Fokus im
  Feld), Strg+B im Feld. **Dabei S9 bestätigt und behoben:** `editing.el` war immer `undefined`, weil `t`
  erst nach dem Merker deklariert wurde — der Wächter in `renderNodes` lief nie, ein Neuaufbau während des
  Tippens las `innerText` aus einem abgehängten Feld und verlor die Umbrüche (real gemessen: „Erste
  Zeile- Punkt einsDritte“). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: B → `**Dritte**`, Rechts →
  `-> **Dritte**`, B → `-> Dritte`, Markierung „Erste“ + B → `**Erste** Zeile`, Mitte in Listenzeile →
  `<-> - Punkt eins`, Enter → neue Zeile `<-> - `; Darstellung mit `<b>` und `text-align`. Schritte 6 und 7 stehen aus.
- **Fassung 2.26, 2026-09-07 (Rücknahme):** Fett und Ausrichtung je Zeile (2.25) wieder entfernt; Listen, Nummern, Überschriften, Enter-Fortsetzung und der S9-Fix bleiben. Schritte 2, 3, 4 grün, Schritt 5 per Ereignis: Enter in „- eins“ → „- “, Enter in „1. a“ → „2. “, B wirkt aufs Element. Schritte 6 und 7 stehen aus.
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
- **Fassung 2.28, 2026-09-08 (Touchpad automatisch):** `istTouchpad(ev)` stuft jedes Rad-Ereignis ein (deltaMode ≠ 0 → Maus; deltaX ≠ 0 → Touchpad; |deltaY| Vielfaches von 100/120 → Maus; klein oder krumm → Touchpad), Vorgabe „Automatisch“, Maus/Touchpad bleiben als feste Wahl. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: 100/−120/3 Zeilen → Zoom; 12.5/−7 und 23 → schieben; Strg −18 → Zoom 1.20; Strg 100 → senkrecht 100. Schritte 6 und 7 stehen aus.
- **Fassung 2.29, 2026-09-08 (Figma-Regel fürs Rad):** keine Geräte-Erkennung mehr — Rad schiebt (Touchpad in alle Richtungen), Strg+Rad und Kneifen zoomen (`radZoom()`, Schritt gedeckelt auf ±12 → 1.127 je Maus-Raster), Umschalt+Rad waagerecht; Wahl „Rad zoomt“ für Maus-Nutzer (`rb.rad` = schieben|zoomen). Von Luis so entschieden (Option 1). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Rad 100 → schiebt 100; 12.5/−7 → schiebt; Strg −100 → Zoom 1.127; Strg −5 → 1.051; Umschalt → waagerecht; Modus „zoomen“: Rad −100 → Zoom 1.128, seitliches Rad schiebt weiter. Schritte 6 und 7 stehen aus.
- **Fassung 2.30, 2026-09-08 (Gruppen ziehen):** der Gruppen-Chip ist ziehbar (`gruppeVerschieben()`: alle Mitglieder raus, vor/hinter dem Ziel wieder rein, bei Ziel in einer Gruppe vor deren erstem/hinter deren letztem Mitglied); ein Reiter auf den Chip gezogen = beitreten (hinten) oder frei davor (`reiterZuGruppe()`); Chip-Klick nach Ziehen kein Zuklappen. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Ü/[A 2 3]/4 → Chip hinter 4 → Ü/4/[A 2 3] → Chip vor Ü → [A 2 3]/Ü/4 → Reiter 4 auf Chip hinten → [A 2 3 4]/Ü, in-group gesetzt; Chip-Klick klappt 2 Reiter weg. Schritte 6 und 7 stehen aus.
- **Fassung 2.31, 2026-09-08 (Gruppen zu, Ziehen robust):** zugeklappte Reiter blieben sichtbar — `.tab { display: inline-flex }` überstimmt das `hidden`-Attribut, die Seite hat keine globale `[hidden]`-Regel (der Test in 2.27 maß nur `e.hidden`, nicht die Darstellung). Jetzt `#tabs .tab[hidden] { display: none !important; }`. Ziehen: Schwelle 5 px in x ODER y, `preventDefault` im mousedown, Ablegen auf der leeren Leiste = ans Ende. Schritte 2, 3, 4 grün. Schritt 5 mit ECHTER Maus (Browser-Fenster, nicht per Ereignis): Chip-Klick → Reiter 2/3 `display: none`; Chip hinter Reiter 4 gezogen → Ü/4/[Alpha 2 3]. Lehre: Sichtbarkeit über `getComputedStyle(...).display` messen, nie über das Attribut. Schritte 6 und 7 stehen aus.
- **Fassung 2.32, 2026-09-08 (Einstellungen scrollen + verbreitern):** `.einst-inhalt` bekam `flex: 1 1 auto; min-height: 0` (ohne `min-height: 0` schrumpft ein Flex-Kind nicht unter seinen Inhalt — der Dialog lief unten über den Rand, nichts scrollte); `#einst` mit `resize: horizontal`, min 360 px, max Fensterbreite, Höhe max `100vh − 32px`; Breite je Betrachter über ResizeObserver in `rb.einst.w`. Schritte 2, 3, 4 grün. Schritt 5 per Messung: Dialog 1242 px bei Fenster 1274, Inhalt scrollHeight 1415 > clientHeight 1163 → scrollt innen; `resize: horizontal` gesetzt. Schritte 6 und 7 stehen aus.
- **Fassung 2.33, 2026-09-08 (Inspektor scrollt + verbreitern; Dialog-Griff zurück):** `#inspector` mit `max-height: calc(100% − 24px)`, `overflow-y: auto`, `resize: horizontal` (232–560 px, rechts verankert, wächst nach links), Breite je Betrachter `rb.insp.w`; der Zieh-Griff am Einstellungs-Dialog aus 2.32 ist auf Luis’ Wunsch wieder weg (altes Maß `min(78vh, 640px)`), der `min-height: 0`-Scroll-Fix bleibt. Schritte 2, 3, 4 grün. Schritt 5 per Messung bei 1100×600: Inspektor 365 px in Bühne 389, scrollt innen, Unterkante im Fenster; Dialog `resize: none`. Schritte 6 und 7 stehen aus.
- **Fassung 2.34, 2026-09-08 (Inspektor: Luft zur Zoomleiste, Griff links):** `max-height: calc(100% − 72px)` lässt 12 px über der Zoomleiste; der Browser-Griff (`resize`) ist weg — er saß rechts unten und zog verkehrt herum, weil der Inspektor rechts verankert ist. Neuer Griff `#insp-griff` als Nachbar in `#stage`, per ResizeObserver an die linke Kante gelegt (volle Höhe), nach links ziehen = breiter (232–560 px), Breite in `rb.insp.w`. Schritte 2, 3, 4 grün. Schritt 5: per Ereignis Griff 100 px nach links → 232 → 332; mit ECHTER Maus 100 px nach links → 498 (Kunst-Ereignis und echte Maus verschieden weit, beides richtig herum); Griff sitzt auf der Kante (Abstand 0), gleiche Höhe, Unterkante 40 px über der Zoomleiste. Schritte 6 und 7 stehen aus.
- **Fassung 2.35, 2026-09-08 (Tabelle: Spalten und Zeilen ziehen):** neue optionale Felder `colW`/`rowH` (Brett-Pixel je Spalte/Zeile, `masseLesen()`, nur mitgeschrieben, wenn die Länge passt — `tabellenMasse()`); Griffe `.tbl-cgrip` (rechte Kante der Kopfzellen) und `.tbl-rgrip` (untere Kante der ersten Spalte), `drag.mode` `tblcol`/`tblrow`; beim ersten Ziehen werden alle aktuellen Maße festgehalten (`tabellenMasseLesen()`), Ziehen wirkt direkt am DOM (`tabellenMassAnwenden()`), `mouseup` speichert und lässt den Kasten mitwachsen; mit `rowH` steht die Tabelle auf `flex: none`, die Kopfzeile wächst nicht mehr mit dem Kasten; `+/− Spalte/Zeile` führen die Listen mit. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Spalte 0 +60 → 130/130 → 190/130, Kasten 264 → 324; Zeile 1 +30 → 53 → 83; Kasten 100 höher → Zeilen bleiben 57/83/53; + Spalte → 190/130/130, − Spalte → 190/130. Schritte 6 und 7 stehen aus.
- **Fassung 2.36, 2026-09-08 (Tabelle: Außenkanten am Kasten, Griffe über die ganze Länge):** die Tabelle füllt den Kasten immer ganz — alle Spalten/Zeilen bis auf die letzte sind fest, die letzte bekommt den Rest (Spalten über `table-layout: fixed` + letzte `col` ohne Breite; Zeilen ausdrücklich in `tabellenGriffeLegen()`, weil ein Browser Extra-Höhe sonst auf ALLE Zeilen verteilt, auch feste — darum steht die Tabelle mit `rowH` auf `flex: none`). Griffe liegen in einer Hülle `.tbl-wrap` über die ganze Tabellenhöhe bzw. -breite, an der letzten Kante keiner (die ist der Kastenrand); Lage nach dem Einhängen gemessen, auch beim Größe-Ziehen des Kastens nachgelegt. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Kopf −20 → 57/53/53 → 37/53/72; Zeile 1 +25 → 37/78/47; Kasten +80/+80 → 37/78/119 (Kopf bleibt), Spalten 130/130 → 166/166; zurück → 37/78/47; Tabelle unten und rechts stets am Kastenrand; Spalten-Griff volle Höhe, Zeilen-Griff volle Breite. Schritte 6 und 7 stehen aus.

- **Fassung 2.37, 2026-09-09 (GitHub-Issues #4–#6):** **#4 Pfeiltasten** — `auswahlSchieben()` schiebt die Auswahl (Einzel-Element mit Mitnehmern, Sammel-Auswahl) um einen Raster-Schritt, ohne Raster 1 px, mit Umschalt 10 px; gespeichert wird gesammelt 300 ms nach der letzten Taste (`tastenOffen` zählt als Warte-Grund). **#5 Nachbarschaft** — `nachbarschaft()` liefert bei genau einem gewählten Element die anhängenden Pfeile und die Elemente am anderen Ende; Pfeile bekommen `.nah` (2.6 px, Akzent-Spitze) und liegen auf topZ+1, Nachbarn und das gewählte Element auf topZ+2, Nachbarn mit halb durchsichtigem Ring (`color-mix`) ohne Griffe; ohne Auswahl gilt wieder das gespeicherte z. **#6 Info-Verlust** — `inspektorAbschliessen()` schreibt das fokussierte Inspektor-Feld (Notiz, Verweis, Felder, Tabelle, Pfeiltext, Endbeschriftungen, Maße, Gitter-Zelle) für die NOCH gültige Auswahl, bevor `mousedown` auf der Fläche oder `switchSheet` die Auswahl wechselt; das Klick-Ziel wird danach per `elementFromPoint` neu gesucht, weil das Schreiben neu zeichnet. Schritte 2, 3, 4 grün. Schritt 5: Pfeiltasten per Ereignis → −396/−297 → −372/−249 (24er-Schritte), Raster aus → −373, Umschalt → −259; Hervorhebung: A gewählt → B `.nah`, z 2010/2010/2006, Pfeil-Ebene 2007, Strich 2.6 px, Ring auf B; abgewählt → nichts mehr `.nah`, z zurück auf 2002. Issue #6 mit ECHTER Maus (Kunst-Fokus greift im Test-Fenster nicht): Notiz tippen → auf die Fläche klicken → Element wieder wählen → „Hallo Notiz“ steht und die Ecke ist da; Verweis tippen → anderes Element klicken → zurück → „src/a.ts“ steht. Schritte 6 und 7 stehen aus.

- **Fassung 2.38, 2026-09-09 (acht Wünsche von Luis):** (1) Rahmen heißt überall „Rahmen“ (Bauart-Label und Vorgabetext, war „Bildschirm“). (2–4) Zwei neue Bauarten mit demselben Datenbau wie `entity` — `dbmodel` „DB-Modell“ (Taste M, jede Feldzeile „Name: Typ“ als zwei Zellen mit Linien, `.db-grid`) und `classmodel` „Klassen-Modell“ (Taste K, eckig, drei Fächer mit durchgezogenen Linien, Methoden-Fach immer da); `entity` unverändert, nur umbenannt zu „Entitäten-Modell“; die EINE Frage „trägt Felder?“ ist `hatFelder()` (putNode, knotenDaten, brettAlsJSON, applyNodes, Inspektor, commitEntity). (5) Code-Kasten als Editor-Fenster: Kopfleiste mit drei Punkten (`::before`), Zeilennummern `.code-gutter` (laufen beim Tippen über `input` mit). (6) Tabellen-Zellrand neutral `rgba(127,127,127,.45)` statt `--line` — auf Weiß im Dunkelmodus unsichtbar. (7) Notiz: jede Textzeile genau 1.6em (auch Listen/Überschriften), Linie alle 1.6em — Text steht immer zwischen zwei Linien, beides hängt am Schriftgrad. (8) Reiter-Typ-Symbol 15 px statt 12; Rechtsklick-Menü zeigt alle Typen als Knöpfe mit Symbol und Namen (`reiterTypSetzen()` ist der eine Schreibweg, Symbol-Klick läuft auch darüber). Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Leiste zeigt Rahmen/Baustein/Entitäten-Modell/DB-Modell/Klassen-Modell/Code/Start/Ende; DB-Modell 4 Zellen (ID | String NN PK, Name | String NN), Inspektor „DB-Modell“ mit Felder-Textfeld; Klasse 2 Fächer, Radius 0, Methoden „+ speichern(): void“; Code Zeilennummern „1 2“, Kopfleiste 22 px; Notiz line-height 20.8 px bei 13 px = 1.6em, Linienperiode 20.8; Zellrand rgba(127,127,127,.45); Rahmen-Text und -Label „Rahmen“; Rechtsklick → 5 Typ-Knöpfe, Klick auf „Datenmodell“ → Symbol ⛁ bei 15 px. Bildschirmfoto hell und dunkel geprüft (Tabellenlinien im Dunkelmodus sichtbar). Schritte 6 und 7 stehen aus.

- **Fassung 2.39, 2026-09-09 (Linien in Randfarbe, Auto-Größe):** (1) alle inneren Linien und Kopf-Hintergründe (Tabelle, Rahmen, Code-Kopfleiste und Zeilennummern, Entitäten-/DB-/Klassen-Modell, Listen-Baustein) laufen über die Variable `--rand`, die `renderNodes` je Element auf `var(--s-<farbe>)` setzt — dieselbe Farbe wie der Außenrand, Hintergründe als `color-mix` 22 %; die Notiz bleibt bei `--papier`. (2) neues optionales Feld `auto` (nur `entity`/`dbmodel`/`classmodel`): Knopf „⤢ Auto-Größe“ im Inspektor unter den Maßen; an = `autoAnpassen()` misst Kopf und Zeilen per Canvas-`measureText` (`inhaltsMasse()`) und setzt Breite und Höhe, danach bei jeder Inhalts-Änderung erneut (Felder-Textfeld, Titel, Schriftgrad/fett); Ziehen am Griff oder Tippen in B/H schaltet es aus. Schritte 2, 3, 4 grün. Schritt 5 per Ereignis: Tabellen-Zelle, DB-Zelle und Entitäten-Kopf tragen exakt die Randfarbe ihres Elements (169/182/195 bzw. 162/148/196); DB-Modell 220×76 → Auto an → 132×72 → vier Zeilen → 237×112, scrollHeight = clientHeight, Gitterbreite = Kastenbreite; Tabelle zeigt den Knopf nicht. Schritte 6 und 7 stehen aus.
