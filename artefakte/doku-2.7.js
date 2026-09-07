// Doku-Nachzug fuer Paket A (2.5-2.7): CLAUDE.md, PLAN.md, beide globalen Skills.
"use strict";
const fs = require("fs");
const path = require("path");
const HOME = process.env.USERPROFILE || process.env.HOME;
const REPO = path.join(HOME, "github", "reissbrett");
const SKILLS = path.join(HOME, ".claude", "skills");

function patch(file, E) {
  let s = fs.readFileSync(file, "utf8");
  E.forEach(([a, b], i) => {
    const n = s.split(a).length - 1;
    if (n !== 1) { console.error(file + " Anker " + (i + 1) + ": " + n); process.exit(1); }
    s = s.replace(a, () => b);
  });
  fs.writeFileSync(file, s);
  console.log(path.basename(file) + " ok");
}

patch(path.join(REPO, "CLAUDE.md"), [
["- `nodes/<id>`: `kind` box|sticky|diamond|text|**table** (seit 2.3) · `x` `y` `w` `h` · `text` · `color`",
 "- `nodes/<id>`: `kind` box|sticky|diamond|text|**table** (seit 2.3)|**frame|code|start|end** (2.5)|\n  **widget** (2.6)|**entity** (2.7) · `x` `y` `w` `h` · `text` · `color`"],
["  wird beim Einlesen rechteckig gemacht, `zellenLesen()`).",
 "  wird beim Einlesen rechteckig gemacht, `zellenLesen()`) · **`layout`** (nur `frame`: frei|desktop|\n  tablet|handy — setzt die Größe einmal, `LAYOUTS`) · **`variant`** (nur `widget`: button|input|select|\n  toggle|list|menu|image — die **Bedeutung** des Bausteins, `VARIANTS`; `text` ist die Beschriftung, bei\n  `list` eine Zeile je Eintrag, bei `menu` Einträge mit `|`) · **`fields`/`methods`** (nur `entity`:\n  Arrays kurzer Strings, `text` ist der Name; Grenzen 30 Einträge à 120 Zeichen, `listeLesen()`).\n  `code` hält reinen Text in Schreibmaschinenschrift (keine Stichpunkt-Deutung), `start`/`end` sind\n  Kreise ohne Text (`ohneText()`, Pfeile enden am Ellipsenrand in `border()`)."],
["`S` Notiz · `D` Entscheidung · `T` Beschriftung · `G` Tabelle · `A` Pfeil.",
 "`S` Notiz · `D` Entscheidung · `T` Beschriftung · `G` Tabelle · `A` Pfeil · **zweite Leiste `#tools2`\n(Paket A, 2.5–2.7):** `R` Rahmen (Bildschirm; Layout im Inspektor `#frame-row`; kommt beim Anlegen\n**hinter** alles, damit Bausteine darauf mitgehen) · `W` Baustein (Art im Inspektor `#widget-row`) ·\n`E` Datenmodell (Felder/Methoden im Textfeld `#entity-text`, eine je Zeile, Leerzeile trennt; Höhe\nwächst mit) · `C` Code · `1` Start · `0` Ende."],
["    (seit 2.3, alle über `tabelleAendern`) · **Notiz-Feld `node-note`**",
 "    (seit 2.3, alle über `tabelleAendern`) · **Layout-Knöpfe** `#frame-row button[data-layout]` (2.5) ·\n    **Baustein-Art** `#widget-row button[data-variant]` (2.6) · **Felder-Textfeld `entity-text`**\n    (`commitEntity`, 2.7) · **Notiz-Feld `node-note`**"],
["    Rahmen ist ~1,22× der CSS-Pixel und ändert sich mit der Fenstergröße). Schritte 6 und 7 stehen aus.",
 "    Rahmen ist ~1,22× der CSS-Pixel und ändert sich mit der Fenstergröße). Schritte 6 und 7 stehen aus.\n  - **Fassung 2.5–2.7 (Paket A), 2026-09-07:** je Fassung Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des\n    Patch-Werkzeugs grün. Schritt 5 real (Maus/Tastatur) und per DOM: Rahmen angelegt, Kasten darauf,\n    Rahmen gezogen → Kasten geht mit (Rahmen liegt bei z 1998 hinter dem Kasten 2008); Layout „Handy“\n    → 360×640 mit Abzeichen; Code-Kasten in Schreibmaschinenschrift; Start voller Kreis, Ende Ring,\n    beide ohne Textzeile im Inspektor. Alle sieben Baustein-Arten angelegt und im Bild geprüft\n    (Knopf, Eingabe, Auswahl mit ▾, Schalter mit Knauf, Liste mit Trennlinien, Menü mit aktivem\n    ersten Reiter, Bild mit Kreuz). Datenmodell „Kunde“: drei Felder, zwei Methoden aus dem\n    Textfeld, Höhe wächst auf 140. **Offen:** Header wird bei schmalem Fenster dreizeilig, `body`\n    lässt sich dann waagerecht scrollen (Seite 869 px breit bei 650 px Fenster) — kosmetisch,\n    Kandidat für Paket B. Schritte 6 und 7 stehen aus."]
]);

patch(path.join(REPO, "PLAN.md"), [
["- [ ] **A1 Bildschirm-Rahmen**", "- [x] **A1 Bildschirm-Rahmen** (2.5)"],
["- [ ] **A2 UI-Bausteine**", "- [x] **A2 UI-Bausteine** (2.6)"],
["- [ ] **A3 Datenmodell / Klassen**", "- [x] **A3 Datenmodell / Klassen** (2.7; Beziehungs-Pfeile 1:n → B1)"],
["- [ ] **B3 Start-/Ende-Kreise** für Abläufe (rein optisch).", "- [x] **B3 Start-/Ende-Kreise** für Abläufe (2.5)."],
["- [ ] **C6 Code-Kasten** (`kind: \"code\"`): fester Zeichensatz für Beispiel-JSON, API-Antwort,\n  SQL. *(Ebenfalls erklärt, Entscheidung offen.)*",
 "- [x] **C6 Code-Kasten** (2.5): fester Zeichensatz für Beispiel-JSON, API-Antwort, SQL."],
["  Ampel offen · in Arbeit · fertig. *(Vom Nutzer noch nicht bewertet — erklärt am\n  2026-09-07, Entscheidung offen.)*",
 "  Ampel offen · in Arbeit · fertig. *(Vom Nutzer 2026-09-07 bestätigt.)*"],
["| 2.4 | 2026-09-07 | Tabelle wirklich bedienbar:",
 "| 2.5 | 2026-09-07 | **Paket A/1:** Bildschirm-Rahmen (`frame`, Layout frei/Desktop/Tablet/Handy), Code-Kasten (`code`), Start/Ende-Kreise (`start`/`end`); zweite Werkzeugleiste |\n| 2.6 | 2026-09-07 | **Paket A/2:** UI-Bausteine (`widget` mit `variant`: Knopf, Eingabe, Auswahl, Schalter, Liste, Menue, Bild) |\n| 2.7 | 2026-09-07 | **Paket A/3:** Datenmodell/Klasse (`entity` mit `fields`/`methods`, Textfeld im Inspektor, Hoehe waechst mit) |\n| 2.4 | 2026-09-07 | Tabelle wirklich bedienbar:"]
]);

const schema =
"\n  **Software-Bauarten (seit 2.5–2.7):** `frame` = Bildschirm/Fenster (`text` Titel, `layout`\n" +
"  frei|desktop|tablet|handy; Elemente, die geometrisch ganz darin liegen, gehören zu diesem\n" +
"  Bildschirm) · `widget` = UI-Baustein (`variant` button|input|select|toggle|list|menu|image,\n" +
"  `text` Beschriftung; bei `list` eine Zeile je Eintrag, bei `menu` Einträge mit `|`) ·\n" +
"  `entity` = Datenmodell/Klasse (`text` Name, `fields` Array „name: Typ“, `methods` Array) ·\n" +
"  `code` = Code-Beispiel (reiner Text) · `start`/`end` = Anfang/Ende eines Ablaufs (kein Text).";

patch(path.join(SKILLS, "pinit-lesen", "SKILL.md"), [
["  **`note`** (Langtext, nur im Inspektor sichtbar — hier stehen die Details).",
 "  **`note`** (Langtext, nur im Inspektor sichtbar — hier stehen die Details)." + schema],
["  ◻ box · ◇ diamond · 📝 sticky · ᵀ text · ▦ table.",
 "  ◻ box · ◇ diamond · 📝 sticky · ᵀ text · ▦ table · 🖥 frame · ▢ widget (Art in Klammern) ·\n  ⛁ entity · ⌨ code · ● start · ◎ end."],
["- **Stichpunkte** im `text` (Zeilen, die mit `- `, `* ` oder `• ` beginnen) sind reiner Text.",
 "- **Bildschirme** (`frame`): eigener Unterabschnitt „#### Bildschirm: <Titel> (Layout)“; darunter\n  die Bausteine, die geometrisch ganz im Rahmen liegen, **von oben links nach unten rechts**,\n  jeder mit Art: `- ▢ Knopf „Speichern“ ⟨nodes/…⟩`. Was zu keinem Rahmen gehört, kommt danach.\n- **Datenmodelle** (`entity`): Name als Überschrift, dann Felder als Liste, Methoden darunter;\n  Pfeile zwischen Entitäten mit ihrem Label (z. B. „1:n“) im Ablauf-Teil.\n- **Code** als Codeblock (```), **start/end** als „● Start“ / „◎ Ende“ im Ablauf.\n- **Stichpunkte** im `text` (Zeilen, die mit `- `, `* ` oder `• ` beginnen) sind reiner Text."]
]);

patch(path.join(SKILLS, "pinit-schreiben", "SKILL.md"), [
["- `nodes/<id>`: `kind` box|sticky|diamond|text|**table** · `x` `y` `w` `h`",
 "- `nodes/<id>`: `kind` box|sticky|diamond|text|table|**frame|widget|entity|code|start|end** · `x` `y` `w` `h`"],
["  **Stichpunkte** sind reiner Text: Zeile mit `- ` beginnen, die Seite zeigt sie als Punkt.",
 "  **Stichpunkte** sind reiner Text: Zeile mit `- ` beginnen, die Seite zeigt sie als Punkt." + schema +
 "\n  Ein `frame` bekommt `z` **kleiner** als alles darauf (z. B. -1), sonst liegt er davor."],
["diamond 158×100 · text 220×34 · table 320×150 (bei mehr als 3 Zeilen je Zeile ~28 px dazu).",
 "diamond 158×100 · text 220×34 · table 320×150 (bei mehr als 3 Zeilen je Zeile ~28 px dazu) ·\nframe 480×320 (desktop 960×600, tablet 600×800, handy 360×640) · widget: button 120×36, input\n200×36, select 200×36, toggle 150×28, list 200×110, menu 320×36, image 160×120 · entity 200×\n(40 + 18 je Feld/Methode) · code 260×120 · start/end 40×40."],
["- **Aufzählungen** in einer Notiz als Zeilen mit `- ` schreiben — die Seite setzt Punkte.",
 "- **Aufzählungen** in einer Notiz als Zeilen mit `- ` schreiben — die Seite setzt Punkte.\n- **Bildschirm skizzieren:** erst den `frame` (Layout wählen), dann Bausteine **innerhalb**\n  seiner Fläche mit 16 px Rand, von oben nach unten: Menü oben (volle Breite), dann\n  Eingabefelder untereinander (Abstand 12 px), Knöpfe unten rechts. Eine Beschriftung\n  (`text`) über einer Gruppe von Feldern erklärt den Abschnitt.\n- **Datenmodell:** je Entität ein `entity` im Raster 3 Spalten (Abstand 60 px), Beziehungen als\n  Pfeile mit `label` „1:n“, „n:m“ oder „1:1“; Vererbung als Pfeil mit `label` „erbt von“.\n- **Ablauf:** `start` links oben, `end` rechts unten, dazwischen Schritte/Entscheidungen."]
]);
