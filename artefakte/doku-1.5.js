/** Doku-Nachzug fuer Fassung 1.5. Erst alle Anker pruefen, dann schreiben. */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = "C:/Users/LuisHindelang/ClaudeWiki/projekte/reissbrett";

const E = [];
function edit(datei, was, suche, ersetze) { E.push({ datei, was, suche, ersetze }); }

/* ------------------------------------------------------- CLAUDE.md */
edit("CLAUDE.md", "Datenschema: fs/bold/align",
`- \`nodes/<id>\`: \`kind\` box|sticky|diamond|text · \`x\` \`y\` \`w\` \`h\` · \`text\` · \`color\`
  (slate|amber|mint|rose|lilac|plain) · \`z\` · \`sheet\``,
`- \`nodes/<id>\`: \`kind\` box|sticky|diamond|text · \`x\` \`y\` \`w\` \`h\` · \`text\` · \`color\`
  (slate|amber|mint|rose|lilac|plain) · \`z\` · \`sheet\` · **\`fs\` \`bold\` \`align\`**
  (seit 1.5, Textdarstellung). Alle drei sind **Abweichungen von der Vorgabe der Bauart**,
  nicht der Wert selbst: \`fs\` 0 = Vorgabe (13 px, bei \`text\` 17), sonst 1-96 · \`bold\`
  0 = Vorgabe, 1 = fett, 2 = normal (dreiwertig, weil \`text\` von Haus aus fett ist und
  sich auch normal stellen lassen muss) · \`align\` "" = Vorgabe (\`center\`, bei \`text\`
  \`left\`), sonst left|center|right. Ein Brett aus einer Fassung vor 1.5 hat die Felder
  nicht und liest sich darum wie vorher — das ist die rückwärtsverträgliche Erweiterung,
  die das Datenschema verlangt.`);

edit("CLAUDE.md", "Landkarte 3: GRADE und die drei Vorgabe-Helfer",
`3. Modell: \`FASSUNG\`/\`FASSUNG_DATUM\`, \`KINDS\`, \`COLORS\`, \`HOME\`/\`CATCH\`/\`CATCH_NAME\`, die`,
`3. Modell: \`FASSUNG\`/\`FASSUNG_DATUM\`, \`KINDS\` (Vorgaben je Bauart, **inkl. \`fs\`/\`bold\`/
   \`align\`**), \`GRADE\` + **\`schriftgrad\`/\`fett\`/\`ausricht\`/\`gradStufe\`** (die drei Lesehelfer
   sind die EINE Stelle, an der "0 bzw. leer heißt Vorgabe" steht — \`renderNodes\` und die
   Inspektor-Knöpfe fragen beide sie, nicht das Feld), \`COLORS\`, \`HOME\`/\`CATCH\`/\`CATCH_NAME\`, die`);

edit("CLAUDE.md", "Landkarte 8: Vorschau und Textknoepfe",
`8. Zeichnen: \`fillOf\` · \`renderNodes\` · \`renderWires\` (eine SVG-Ebene je Pfeil) ·
   \`renderInspector\` · \`render\`.`,
`8. Zeichnen: \`fillOf\` · \`renderNodes\` · \`renderWires\` (eine SVG-Ebene je Pfeil) ·
   \`renderInspector\` · \`render\`.
8b. Aufziehen + Textknöpfe (seit 1.5): \`vorschauZeigen\`/\`vorschauWeg\` (das gestrichelte
   Rechteck \`#neu-vorschau\`; es liegt in \`#layer\` und teilt darum die Brett-Koordinaten —
   \`renderNodes\` räumt nur \`.node\` und \`.wire-svg\` weg, es überlebt also einen Neuaufbau) ·
   \`textFelderSetzen\` (die Knöpfe zeigen immer den Zustand des Elements, nie einen eigenen
   Merker) · \`textAendern\` (der eine Schreibpfad der drei Textfelder; **kein**
   \`catchGesperrt\` — Ändern ist auf dem Auffang-Reiter erlaubt, nur Anlegen nicht).`);

edit("CLAUDE.md", "Landkarte 11: create-Modus nennen",
`11. Maus (\`mousedown\`/\`mousemove\`/\`mouseup\`/\`dblclick\`/\`wheel\`) und Tastatur.`,
`11. Maus (\`mousedown\`/\`mousemove\`/\`mouseup\`/\`dblclick\`/\`wheel\`) und Tastatur. **Die
    \`drag\`-Modi sind \`pan\`, \`move\`, \`resize\`, \`link\` und seit 1.5 \`create\`** — bei aktivem
    Anlege-Werkzeug merkt \`mousedown\` nur den Startpunkt, \`mousemove\` zeichnet die Vorschau,
    erst \`mouseup\` ruft \`addNode\`. Ein Klick ohne nennenswerte Bewegung (unter 20
    Brett-Pixeln in beiden Richtungen) nimmt die Standardgröße. Folge fürs Verhalten:
    solange man aufzieht, ist \`drag\` gesetzt und Schnappschüsse werden aufbewahrt
    (\`warteGrund\`) — das war vorher nicht so, weil Anlegen ein Wimpernschlag war.`);

edit("CLAUDE.md", "Landkarte 12: Textknoepfe in der Knopfliste",
`12. Knöpfe, in Dateireihenfolge: Zoom · Löschen · Nach vorn · Pfeiltext-Feld · Nach hinten ·`,
`12. Knöpfe, in Dateireihenfolge: Textknöpfe (\`fs-minus\`/\`fs-plus\`/\`t-bold\`/\`al-left\`/
    \`al-center\`/\`al-right\`, alle über \`textAendern\`) · Zoom · Löschen · Nach vorn ·
    Pfeiltext-Feld · Nach hinten ·`);

edit("CLAUDE.md", "Schrittzahl richtigstellen",
`**Acht Schritte, in dieser Reihenfolge.** Lokal an der Datei laufen
  **1-5, 8 und 9**; das **veröffentlichte** Artifact brauchen nur **6 und 7**:`,
`**Neun Schritte, in dieser Reihenfolge.** Lokal an der Datei laufen
  **1-5, 8 und 9**; das **veröffentlichte** Artifact brauchen nur **6 und 7**:`);

edit("CLAUDE.md", "Schritt 5: die zwei neuen Wege aufnehmen",
`  5. **Die fünf lokalen Wege im Browser** (Datei direkt öffnen): Element anlegen +
     beschriften · Pfeil ziehen + beschriften · Notiz groß ziehen und „nach hinten"
     (Pfeile müssen sichtbar bleiben) · Reiter anlegen, umbenennen, umschalten (Inhalte
     müssen getrennt bleiben) · Hell/Dunkel umschalten.`,
`  5. **Die sieben lokalen Wege im Browser** (Datei direkt öffnen): Element anlegen +
     beschriften · Pfeil ziehen + beschriften · Notiz groß ziehen und „nach hinten"
     (Pfeile müssen sichtbar bleiben) · Reiter anlegen, umbenennen, umschalten (Inhalte
     müssen getrennt bleiben) · Hell/Dunkel umschalten · **Größe aufziehen** (Werkzeug
     wählen, Rechteck ziehen → das Element hat genau diese Größe; ein einzelner Klick →
     Standardgröße) · **Textknöpfe** (A−/A+ ändern den Grad, B schaltet fett **in beide
     Richtungen** — auch eine Beschriftung, die von Haus aus fett ist, muss normal werden
     können —, die drei Ausrichtungs-Knöpfe zeigen nach dem Klick den neuen Zustand).
     **Achtung beim Prüfen mit Automatik:** ein synthetisches „ziehen" liefert oft kein
     \`mouseup\`, und ein synthetischer Doppelklick oft kein \`dblclick\`. Bleibt die Vorschau
     stehen oder öffnet sich das Textfeld nicht, ist erst das **Messwerkzeug** verdächtig,
     nicht der Code (2026-09-07 real: beides lief, das Werkzeug schickte die Ereignisse
     nicht).`);

/* ------------------------------------------------------- PLAN.md */
edit("PLAN.md", "Historien-Tabelle: 1.4 und 1.5",
`| 1.3 | 2026-09-07 | Anlege-Verbot des Auffang-Reiters von den Aufrufern IN die Funktion verlegt (in 1.2 galt es nur fuer einen von drei Wegen), Ladewettlauf-Merker erst bei server-endgueltigem Stand, Reiterwechsel mit Hinweis und Kamera, toter Listener bleibt sichtbar tot, Panel-Befundlisten nach artefakte/ |`,
`| 1.3 | 2026-09-07 | Anlege-Verbot des Auffang-Reiters von den Aufrufern IN die Funktion verlegt (in 1.2 galt es nur fuer einen von drei Wegen), Ladewettlauf-Merker erst bei server-endgueltigem Stand, Reiterwechsel mit Hinweis und Kamera, toter Listener bleibt sichtbar tot, Panel-Befundlisten nach artefakte/ |
| 1.4 | 2026-09-07 | **Notfall:** 1.3 war am echten Brett kaputt (eine nie deklarierte Variable liess unter "use strict" jeden Snapshot scheitern, das Brett zeigte seinen Inhalt nicht mehr). Deklaration nachgetragen, Duplizieren-Knopf als vierter Anlege-Weg geschuetzt, Pruefer \`undeklariert-pruefen.js\` fuer genau diese Fehlerklasse gebaut, Patch-Werkzeug auf "erst alle Anker pruefen, dann schreiben" umgestellt |
| 1.5 | 2026-09-07 | Groesse wird beim Anlegen aufgezogen statt gespawnt (Figma-Art, Klick = Standardgroesse), Textdarstellung je Element im Inspektor einstellbar (Schriftgrad, fett, Ausrichtung) mit den drei neuen Feldern \`fs\`/\`bold\`/\`align\` |`);

edit("PLAN.md", "Offener Punkt: Verifizieren von 1.5 steht aus",
`## Panel-Befunde — alle abgearbeitet`,
`## Offen nach Fassung 1.5
- **Das Code-Panel hat 1.5 noch nicht gesehen** (\`/projekt-verifizieren\`). Gebaut und lokal
  belegt sind Schritte 1-5, 8 und 9 der Test-Konvention.
- **Schritte 6 und 7 kann nur der Mensch fahren** (veröffentlichtes Artifact, zwei
  Betrachter; \`claude.ai\` ist Claude im Browser-Fenster per Richtlinie gesperrt). Sie sind
  die einzigen Schritte, die die Fassung-1.3-Panne vor dem Veröffentlichen gefangen hätten.
- **Die neun Wartungspunkte S9-S17** aus dem 1.3-Panel stehen weiter offen — Liste in
  [\`artefakte/HISTORIE-2026-09-07.md\`](artefakte/HISTORIE-2026-09-07.md).

## Panel-Befunde — alle abgearbeitet`);

/* ============================== Lauf ============================== */
const inhalt = {};
const fehler = [];
E.forEach(function (e, i) {
  const p = path.join(ROOT, e.datei);
  if (!(e.datei in inhalt)) inhalt[e.datei] = fs.readFileSync(p, "utf8");
  const n = inhalt[e.datei].split(e.suche).length - 1;
  if (n !== 1) fehler.push("  [" + (i + 1) + "] " + e.datei + " / " + e.was + " -> " + n + " Treffer");
});
if (fehler.length) {
  console.error("ABBRUCH, nichts geschrieben:");
  fehler.forEach(function (f) { console.error(f); });
  process.exit(1);
}
E.forEach(function (e) {
  inhalt[e.datei] = inhalt[e.datei].replace(e.suche, function () { return e.ersetze; });
});
Object.keys(inhalt).forEach(function (d) { fs.writeFileSync(path.join(ROOT, d), inhalt[d]); });
E.forEach(function (e, i) { console.log("  ok  [" + (i + 1) + "] " + e.datei + " / " + e.was); });
console.log(E.length + " Aenderungen geschrieben.");
