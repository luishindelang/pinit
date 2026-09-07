"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = "C:/Users/LuisHindelang/ClaudeWiki/projekte/reissbrett";
const E = [];
function edit(datei, was, suche, ersetze) { E.push({ datei, was, suche, ersetze }); }

edit("CLAUDE.md", "1.3-Nachweis: Schrittnummern auf die neue Zaehlung ziehen + 1.4/1.5 anhaengen",
`    **Schritte 5, 6 und 7 stehen aus** — 5 und 6 brauchen das veröffentlichte Artifact und
    zwei Betrachter (kann Claude nicht), 7 ist lokal und beim nächsten Lauf fällig.`,
`    **Schritte 5, 6 und 7 stehen aus** — 6 und 7 brauchen das veröffentlichte Artifact und
    zwei Betrachter (kann Claude nicht), 5 ist lokal und beim nächsten Lauf fällig.
    *(Nummern 2026-09-07 auf die Neun-Schritt-Zählung gezogen; zur Bauzeit hieß die
    Vorlage-Prüfung noch 5 und die Zwei-Betrachter-Prüfung noch 6.)*
  - **Fassung 1.4, 2026-09-07 (Notfall):** Schritte 1, 2, 3, 9 grün. Anlass war der 🔴 des
    1.3-Panels: eine nie deklarierte Variable, die am **veröffentlichten** Brett jeden
    Schnappschuss scheitern ließ. Dafür ist Schritt 3 (\`undeklariert-pruefen.js\`) überhaupt
    entstanden — **rot gegengeprüft**, indem die Deklaration wieder entfernt wurde. Zweiter
    🔴: der Duplizieren-Knopf war ein vierter Anlege-Weg ohne Schutz; gefunden über die
    richtige Suche (\`allNodes.set|allEdges.set\`, nicht \`addNode(\`).
  - **Fassung 1.5, 2026-09-07:** Schritte 1, 2, 3, 4, 5 und 9 grün — **erstmals auch
    Schritt 5 durch Claude selbst**, weil die lokale Datei im Vorschau-Fenster läuft.
    Belegt: Notiz auf 326×208 aufgezogen (genau die gezogene Größe), einzelner Klick →
    Standardgröße 220×34, Text eingegeben und sichtbar, A+ zweimal → 13 → 14 → 16 px,
    B setzt \`font-weight: 700\` und an der Beschriftung wieder \`400\` (beide Richtungen),
    Ausrichtung links wirkt auf Element **und** Knopf-Zustand, Pfeil gezogen → beim
    ausgewählten Pfeil ist die Textzeile verborgen und die Pfeiltext-Zeile sichtbar,
    „nach hinten“ lässt den Pfeil sichtbar, Dunkelmodus lesbar. **Rot-Gegenproben (Schritt
    9) diesmal für vier Kommandos:** \`node --check\`, \`undeklariert-pruefen.js\`,
    \`vorlage-erzeugen.js\` **und das Patch-Werkzeug** — letzteres brach bei einem falschen
    Anker ab und ließ die Datei nachweislich unverändert (\`cmp\`). Genau dieser Fehlermodus
    hatte 1.3 kaputt live gebracht.
    **Schritte 6, 7 und 8 stehen aus** — 6 und 7 brauchen das veröffentlichte Artifact und
    zwei Betrachter (kann Claude nicht), 8 ist beim nächsten Lauf fällig.`);

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
E.forEach(function (e) { inhalt[e.datei] = inhalt[e.datei].replace(e.suche, function () { return e.ersetze; }); });
Object.keys(inhalt).forEach(function (d) { fs.writeFileSync(path.join(ROOT, d), inhalt[d]); });
E.forEach(function (e, i) { console.log("  ok  [" + (i + 1) + "] " + e.datei + " / " + e.was); });
