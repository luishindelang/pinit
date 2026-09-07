// Doku-Nachzug fuer Paket B (2.8): CLAUDE.md, PLAN.md, beide globalen Skills.
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
["- `edges/<id>`: `from` · `to` · `label` · `sheet`",
 "- `edges/<id>`: `from` · `to` · `label` · `sheet` · **seit 2.8** `style` solid|dashed|dotted ·\n  `ends` to|both|none · `head` arrow|triangle (hohles Dreieck = Vererbung) · `fromLabel`/`toLabel`\n  (bis 12 Zeichen, Kardinalitäten wie „1“/„n“ an den Enden). Ein Pfeil ohne diese Felder liest\n  sich als durchgezogen mit Spitze am Ziel (`pfeilFelder()` ist die EINE Stelle für die Vorgaben)."],
["`C` Code · `1` Start · `0` Ende.",
 "`C` Code · `1` Start · `0` Ende. **Paket B (2.8):** Pfeil-Art im Inspektor (Linie, Spitzen, Dreieck,\nEnden beschriften; ein Schreibpfad `pfeilAendern`) · **Raster** 8 px, Schalter unten rechts in der\nZoomleiste, je Betrachter im Browser gemerkt (`rb.raster`), wirkt beim Ziehen, Anlegen und Größe\nändern (`snap()`) · **Ausrichten** im Sammel-Modus (`#align-row`, `ausrichten()`): Kanten,\nZentrieren, gleiche Abstände, gleiche Größe. `html, body` sind `overflow: hidden` — die Seite kann\nnicht mehr waagerecht scrollen."],
["    Kandidat für Paket B. Schritte 6 und 7 stehen aus.",
 "    Kandidat für Paket B. Schritte 6 und 7 stehen aus.\n  - **Fassung 2.8 (Paket B), 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des\n    Patch-Werkzeugs grün (ein Anker scheiterte erst am geschützten Leerzeichen in „z. B.“ — zum\n    zweiten Mal in diesem Projekt; Anker mit „z. B.“ immer aus der Datei kopieren). Schritt 5 per\n    DOM und Bild: Kasten an krummer Stelle → Position durch 8 teilbar; Pfeil gestrichelt, Spitzen\n    beide, Dreieck, „1“/„n“ an den Enden, Knöpfe zeigen den Zustand; drei Kästen: links bündig,\n    senkrecht gleich verteilt (8/164/320), gleiche Größe. Überlauf: `html, body { overflow: hidden }`.\n    Schritte 6 und 7 stehen aus."]
]);

patch(path.join(REPO, "PLAN.md"), [
["- [ ] **B1 Pfeil-Arten**", "- [x] **B1 Pfeil-Arten** (2.8)"],
["- [ ] **B2 Raster und Ausrichten**", "- [x] **B2 Raster und Ausrichten** (2.8)"],
["| 2.5 | 2026-09-07 | **Paket A/1:**",
 "| 2.8 | 2026-09-07 | **Paket B:** Pfeil-Arten (Linie, Spitzen, Vererbungs-Dreieck, Endbeschriftungen 1:n), 8-px-Raster mit Schalter, Ausrichten/Verteilen/Gleiche Groesse fuer die Mehrfachauswahl; Seite scrollt nicht mehr waagerecht |\n| 2.5 | 2026-09-07 | **Paket A/1:**"]
]);

patch(path.join(SKILLS, "pinit-lesen", "SKILL.md"), [
["- `edges/<id>`: `from` · `to` (Element-Kennungen) · `label` · `sheet`.",
 "- `edges/<id>`: `from` · `to` (Element-Kennungen) · `label` · `sheet` · `style` solid|dashed|dotted\n  (durchgezogen = Klick-Weg/Ablauf, gestrichelt = Datenfluss, gepunktet = Abhängigkeit) · `ends`\n  to|both|none · `head` arrow|triangle (**triangle = Vererbung**, „B erbt von A“) · `fromLabel`/`toLabel`\n  (Kardinalitäten an den Enden, z. B. `1` und `n`). Fehlende Felder = durchgezogen, Spitze am Ziel."],
["- **Ablauf** zuerst: Pfeile des Reiters, Reihenfolge = Ketten von Elementen ohne\n  eingehenden Pfeil aus, dann Rest. Pfeiltext kursiv zwischen die Pfeile.",
 "- **Ablauf** zuerst: Pfeile des Reiters, Reihenfolge = Ketten von Elementen ohne\n  eingehenden Pfeil aus, dann Rest. Pfeiltext kursiv zwischen die Pfeile. Pfeil-Art mitschreiben,\n  wenn sie nicht die Vorgabe ist: `⇢` gestrichelt, `⋯>` gepunktet, `↔` beide Spitzen, `—` ohne,\n  `▷` Vererbung; Endbeschriftungen als `A (1) → (n) B`."]
]);

patch(path.join(SKILLS, "pinit-schreiben", "SKILL.md"), [
["- `edges/<id>`: `from` · `to` (Element-Kennungen) · `label` (\"\" erlaubt) · `sheet`.",
 "- `edges/<id>`: `from` · `to` (Element-Kennungen) · `label` (\"\" erlaubt) · `sheet` · `style`\n  solid|dashed|dotted · `ends` to|both|none · `head` arrow|triangle · `fromLabel`/`toLabel` (≤ 12\n  Zeichen). **Konvention:** Klick-Weg/Ablauf = solid+to · Datenfluss = dashed+to · Abhängigkeit =\n  dotted+to · Vererbung = solid+to+triangle (Pfeil zeigt zur Oberklasse) · Beziehung im Datenmodell\n  = solid+none mit `fromLabel`/`toLabel` als Kardinalität (`1`/`n`, `n`/`m`)."],
["- **Datenmodell:** je Entität ein `entity` im Raster 3 Spalten (Abstand 60 px), Beziehungen als\n  Pfeile mit `label` „1:n“, „n:m“ oder „1:1“; Vererbung als Pfeil mit `label` „erbt von“.",
 "- **Datenmodell:** je Entität ein `entity` im Raster 3 Spalten (Abstand 60 px), Beziehungen als\n  Pfeile `ends: \"none\"` mit `fromLabel`/`toLabel` (`1`/`n`, `n`/`m`, `1`/`1`); Vererbung als Pfeil\n  `head: \"triangle\"` zur Oberklasse, ohne Label.\n- **Raster:** Positionen und Größen auf Vielfache von 8 legen — so sieht es aus wie von Hand gesetzt."]
]);
