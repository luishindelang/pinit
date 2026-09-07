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

## Entschieden 2026-09-07 (Planungsrunde nach dem Panel)
Diese Runde beantwortet die drei Panel-Befunde, die eine Entscheidung berührten (R1, R4, O1).
R2, R3 und die übrigen 🟠/🟡 sind mechanisch und brauchten keine.

### E1 — Ein Reiter zu löschen darf keinen Inhalt vernichten (löst R1)
**Fassung 2 (2026-09-07, nach der Plan-Brille — Research-Befund F1).** Die erste Fassung
schickte Waisen auf den *ersten* Reiter. Das war die schwächere Variante: die Reste sind
dort nicht von echtem Inhalt zu unterscheiden. Jetzt gilt ein **Auffang-Reiter**.

**Entscheidung:** Löschen entfernt **nur** das Dokument `sheets/<id>`. Die Elemente werden
**nicht angefasst** — ihr `sheet`-Feld bleibt stehen (also **keine** Umschreibung, die
Auflösung passiert erst beim Anzeigen). Dazu eine Regel im Datenmodell, die
**Waisen-Regel**:

> Der wirksame Reiter eines Elements ist der eigene, **wenn es diesen Reiter gibt** — sonst
> der **Auffang-Reiter `_unsortiert`** (Anzeigename „Unsortiert"). Gibt es überhaupt keinen
> benannten Reiter, gilt der implizite `haupt`.

**Der Auffang-Reiter ist virtuell.** Es gibt kein Dokument `sheets/_unsortiert`; er wird von
`sheetList()` **erzeugt**, und zwar nur dann, wenn mindestens ein Element auf ihn auflöst. Er
steht immer als **letzter** in der Reiterleiste, trägt die Anzahl (`Unsortiert (12)`) und
lässt sich **nicht umbenennen und nicht löschen**. Damit kollidiert er nicht mit den
Nutzer-Reitern und braucht keine Schema-Erweiterung.

**Warum ein Auffang-Reiter und nicht „der erste":** Das ist das etablierte Muster (Notion
legt verwaiste Kind-Seiten sichtbar an einem eigenen Ort ab, nicht in einer beliebigen
Nachbar-Seite). Es kostet **genau denselben einen Schreibvorgang** und behält die
Umkehrbarkeit — nur der Zielort ist erkennbar statt geraten.

**Warum nicht „Elemente verschieben":** Verschieben hätte je Element einen Schreibvorgang
gekostet. Der Plattform-Vertrag nennt für `resource_exhausted` unter anderem „too many
concurrent writes", **ohne Schwellwert** — ob ein konkreter Reiter das Budget reißt, ist
damit **ungemessen** und war in Fassung 1 mit einer erfundenen Zahl („200 Elemente")
begründet. Die Zahl ist gestrichen; die Entscheidung braucht sie nicht: **ein**
Schreibvorgang plus Umkehrbarkeit schlägt „viele Schreibvorgänge" ohnehin.

**Umkehrbarkeit:** Die Elemente wissen noch, wo sie hingehörten. Ein Reiter mit derselben
Kennung holt sie zurück. Ein „Rückgängig" direkt nach dem Löschen ist damit möglich
(Kennung + Name kurz im Speicher halten) — **optional**, nicht Teil der Fertig-Bedingung.
Dieses eng begrenzte Rückgängig ist vom allgemeinen Undo-Problem (→ N7) **nicht** betroffen:
es reaktiviert nur eine Kennung und schreibt kein fremdes Feld zurück.

**Was das mit R1 macht:** Der Lösch-Wettlauf wird **harmlos**, nicht zugemacht. Löschen zwei
Betrachter gleichzeitig beide Reiter, sind zwar beide Reiter weg — aber **kein Element**; sie
stehen dann auf „Unsortiert". Ein Lease (`acquire()`) wurde verworfen, und zwar **technisch
begründet**, nicht aus Geschmack: der Plattform-Vertrag sagt ausdrücklich, ein Lease ist
*keine* Sicherheitsgrenze — andere Betrachter können trotzdem direkt schreiben. Ein Lease
hätte den Wettlauf also nur geschlossen, wenn **jeder** Schreibpfad ihn respektiert, und
hätte den Fehlklick als Einbahnstraße stehengelassen. Der Fehlklick ist der wahrscheinlichere
Schaden.

**Betroffene Stellen im Code — hier steckt das eigentliche Umsetzungsrisiko.** Die Regel ist
kein Ein-Zeilen-Fix: der Fallback `sheet || HOME` kommt an **acht** Stellen vor (Z. 538, 539,
659, 664, 667, 780, 786, 1490, 1495 — gemessen, nicht geschätzt; die Zahl „zwei Stellen" aus
Fassung 1 war falsch). Sie sind **nicht** alle gleich zu behandeln:
- **`refilter()` (Z. 538-539) — Pflicht.** Filtert heute per Direktvergleich
  `(n.sheet || HOME) === activeSheet`. Wird nur der Löschpfad geändert und `refilter` nicht,
  landen Waisen auf **keinem** sichtbaren Reiter — die Daten überleben, sind aber nie
  erreichbar. Genau der Zustand, den E1 verhindern soll.
- **`sheetList()` (Z. 525-531) — Pflicht.** Muss den virtuellen `_unsortiert` erzeugen, wenn
  Waisen existieren, und ihn als letzten einsortieren. „Der erste" Reiter ist übrigens
  wohldefiniert: sortiert nach `order`, bei Gleichstand lexikografisch nach Kennung.
- **`deleteSheet()` (Z. 659, 664, 667) — ändert sich.** Löscht künftig keine Knoten/Pfeile
  mehr, nur `sheets/<id>`.
- **`putNode`/`putEdge` (Z. 780, 786) — bleiben.** Beim Schreiben gilt weiter das eigene
  `sheet`; die Auflösung ist reine Anzeige-Sache. **Nicht** umschreiben, sonst geht die
  Umkehrbarkeit verloren.
- **Übergabe-Export (Z. 1490, 1495) — Pflicht.** Schreibt heute `n.sheet || HOME` direkt aus
  `allNodes`, ungefiltert. Ein verwaister Verweis würde eine Reiter-Kennung ausgeben, die in
  `out.reiter` gar nicht vorkommt. Muss über die Waisen-Regel auflösen (→ zusammen mit N4).
- **Der Rücksetz-Wächter in `applySheets` (Z. 1597) hat eine eigene Lücke** — siehe N1.

**Nebenwirkung — G7 entfällt wirklich.** Die Konsistenz-Brille hatte bezweifelt, dass die
Waisen-Regel G7 (Waisen-Pfeile) mitlöst; die Machbarkeits-Brille hat die Ursache benannt und
damit den Streit entschieden: G7 entstand, weil `deleteSheet` Knoten **löschte**, auf die
anderswo Pfeile zeigten (Z. 663-668). E1 nimmt genau dieses Löschen weg — der Auslöser
entfällt, nicht nur der Symptomdruck.

**Preis, den E1 bewusst zahlt:** `deleteSheet` war der **einzige** automatische Rückbau —
Reiter löschen gab Dokumente frei. Das fällt weg, Elemente bleiben erhalten, bis sie einzeln
gelöscht werden. Die Datenbank eines Artifacts ist auf **5.000 Dokumente** gedeckelt; danach
schlägt jedes Anlegen mit `quota_exceeded` fehl (bestehende bleiben schreibbar). Für ein
persönliches Brett weit weg, aber ein „Unsortiert aufräumen"-Feature ist damit ein
Kandidat — steht bei den offenen Punkten.

**Achtung beim Umsetzen:** Das Datenschema in `CLAUDE.md` kennt heute nur die zwei alten
Fälle (Sammlung fehlt / Feld fehlt → `haupt`) und muss auf die Waisen-Regel nachgezogen
werden. `CLAUDE.md` ist Verfassung — das passiert in `/projekt-umsetzen` oder bewusst per
Hand, **nicht** in `/projekt-planen`.


### E2 — Verpasste Änderungen werden aufbewahrt, nicht verworfen (löst R4)
**Entscheidung:** Trifft ein Stand ein, während getippt oder gezogen wird, wird das
**Snapshot-Objekt aufbewahrt** (je Sammlung eines) und angewendet, sobald der Wächter fällt.
Kein Nachlesen über das Netz.

**Warum kein `get()` beim Abarbeiten:** Der aufbewahrte Stand ist per Definition der
neueste — ändert danach jemand etwas, kommt der nächste Stand von selbst. Ein `get()` würde
je Textedit eine Abfrage kosten und kann selbst scheitern, bräuchte also wieder eine
Fehlerbehandlung. Die Snapshot-Objekte sind laut Plattform-Vertrag unveränderlich und stabil,
dürfen also gehalten werden.

**Ein Abarbeitungs-Pfad für alles:** Der heutige `pending`/`pull()`-Mechanismus (`pull` ruft
nur `render()` und liest nichts nach) wird durch **eine** Funktion ersetzt, die alle
aufbewahrten Stände anwendet. Sie wird an **jeder** Stelle gerufen, an der der Wächter fällt:
Textedit fertig, Ziehen fertig, Reiter-Umbenennen fertig.

**Verzahnung mit R2 und R3 — die drei gehören in einen Zug:**
- R2 gibt `applySheets` denselben Wächter. Damit werden auch Reiter-Stände aufbewahrt.
- R3 verhindert, dass der Wächter **hängen** bleibt. Ohne R3 macht R2 die Lage schlimmer:
  ein klemmender `editing`-Merker friert dann auch die Reiter ein.
- Reihenfolge beim Bauen: **R3 zuerst** (Merker kann nicht klemmen), dann R4 (Aufbewahren),
  dann R2 (Wächter für Reiter).

### E3 — Web-Schriften sind die einzige erlaubte Netz-Abhängigkeit (löst O1)
**Entscheidung:** Die Invariante in `CLAUDE.md` wird **präzisiert**, die Schriften bleiben.
Der Wortlaut soll sagen: keine JS-/CSS-**Bibliothek** vom CDN, keine Laufzeit-Abfrage an einen
fremden Dienst — Web-Schriften sind die einzige Ausnahme, mit Begründung: sie sind kein Code,
es gibt eine Rückfall-Schriftenliste, und die Seite ist ohne Netz **voll funktionsfähig**, sie
sieht nur anders aus.

**Bewusst mitgenommen:** In gesperrten Umgebungen (Firewall, WDAC — im Haus real) sieht die
Seite anders aus als getestet. Das ist kosmetisch und akzeptiert. Wer es exakt gleich braucht,
kann die Schriften später einbetten; das ist dann eine Größen- gegen Treue-Abwägung, keine
Fehlerbehebung.

**Achtung beim Umsetzen:** Die Invarianten in `CLAUDE.md` sind Verfassung — `/projekt-planen`
darf sie nicht anfassen. Die Textänderung passiert in `/projekt-umsetzen` (oder bewusst per
Hand), nicht hier.

### Gemessen — Ergebnis liegt vor
- [x] **O2 gegengeprüft:** Zeigt die veröffentlichte Vorlage
  (`https://claude.ai/code/artifact/b059cf88-e25b-4460-a703-6a8abf4dd1f5`) wirklich das
  Abzeichen **VORLAGE** und die Statuszeile „Vorlage – nichts wird gespeichert"? Ich komme
  an `claude.ai` vom Browser-Fenster aus **nicht** heran (Richtlinie blockiert die Domain),
  kann diesen Weg also nicht selbst belegen.
  **Ergebnis 2026-09-07, Sichtprüfung durch den Nutzer: beides ist da.** Abzeichen
  VORLAGE und Statuszeile „Vorlage – nichts wird gespeichert“ erscheinen am echten
  Artifact. Damit ist belegt, dass `claude.use("db")` ohne `db`-Deklaration `null`
  liefert und `verbinden(null)` in `vorlageModus()` landet — die Kernkonstruktion trägt.
  **Rest von O2 bleibt offen:** diesen Weg als **sechsten** in die Test-Konvention der
  `CLAUDE.md` aufnehmen, damit er bei künftigen Fassungen nicht wieder ungeprüft bleibt.
  Gehört in `/projekt-umsetzen` — die Verfassung ist von hier aus nicht anfassbar.

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

## Offen nach Fassung 1.6
- **Das Code-Panel hat 1.5 und 1.6 noch nicht gesehen** (`/projekt-verifizieren`). Gebaut und
  lokal belegt sind Schritte 1-5, 8 und 9 der Test-Konvention (1.6: 5 nur teilweise).
- **Die beiden globalen Skills sind ungetestet am echten Brett.** `pinit-lesen` und
  `pinit-schreiben` liegen in `~/.claude/skills/` (bewusst nicht im Projekt — die Bretter
  gehören zu verschiedenen Projekten). Erster echter Lauf mit einer Brett-URL steht aus.
- **Verworfen:** ein Knopf „Als Markdown kopieren“ in der Seite — Claude liest die
  Datenbank direkt, ein zweiter Exportweg in der Seite wäre nur Pflege.
- **Schritte 6 und 7 kann nur der Mensch fahren** (veröffentlichtes Artifact, zwei
  Betrachter; `claude.ai` ist Claude im Browser-Fenster per Richtlinie gesperrt). Sie sind
  die einzigen Schritte, die die Fassung-1.3-Panne vor dem Veröffentlichen gefangen hätten.
- **Die neun Wartungspunkte S9-S17** aus dem 1.3-Panel stehen weiter offen — Liste in
  [`artefakte/HISTORIE-2026-09-07.md`](artefakte/HISTORIE-2026-09-07.md).

## Panel-Befunde — alle abgearbeitet
Die Befundlisten der Panel-Läufe stehen vollständig in
[`artefakte/HISTORIE-2026-09-07.md`](artefakte/HISTORIE-2026-09-07.md): R1-R4 / O1-O6 /
G1-G11 (Fassung 1.0), N1-N17 (Plan-Brille), P1-P16 (Fassung 1.1) und Q1-Q15 (Fassung 1.2).

**Regel für den nächsten Lauf:** eine Panel-Befundliste wird **im selben Zug** ausgelagert,
in dem der letzte Punkt abgehakt wird — nicht erst, wenn das nächste Panel sie als Archiv
meldet. Genau das ist hier zweimal passiert (P4, dann wieder im Panel zu 1.2).

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

