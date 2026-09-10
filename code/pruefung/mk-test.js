/**
 * Prüf-Geschirr (seit 3.00): baut aus code/pinit.html eine Test-Kopie code/_t.html mit
 *   - einer Schein-Datenbank (zeichnet jedes set()/delete() auf, liefert nie Stände),
 *   - einem Haken window.__rb() auf die inneren Funktionen,
 *   - dem festen Ablauf aus szenario.js (window.__szenario).
 *
 * Wozu: bei einem Umbau OHNE gewollte Verhaltensänderung (wie 3.00) beweisen, dass nichts anders
 * aussieht oder anders gespeichert wird. Der Ablauf legt alle Bauarten an, zieht Pfeile, klickt
 * jeden Inspektor-Knopf, verschiebt/zieht mit der Maus, drückt Tasten, wechselt Reiter, füttert
 * fremde Stände, exportiert, friert ein — und nimmt nach jedem Schritt einen Fingerabdruck
 * (DOM der Fläche, Inspektor, Reiter, Statuszeile, berechnete CSS-Werte hell und dunkel, alle
 * Datenbank-Schreibvorgänge, Export-Texte). Kennungen und Uhrzeit sind im Ablauf festgenagelt,
 * darum ist der Abdruck bei gleichem Code exakt gleich (nachgemessen: zweimal derselbe Code = 0 Diffs).
 *
 * Ablauf:
 *   1. node code/pruefung/mk-test.js            (VOR dem Umbau, aus dem Projektordner)
 *   2. code/_t.html über einen lokalen Server öffnen (file:// hat keine Zwischenablage und keinen
 *      Speicher): z. B.  python -m http.server 8765  im Projektordner, dann
 *      http://localhost:8765/code/_t.html — in der Konsole:  await __szenario("vorher")
 *      (legt den Abdruck unter localStorage.fp_vorher ab, ~7 MB)
 *   3. Umbau machen, Schritt 1 wiederholen, Seite neu laden:  await __szenario("nachher")
 *      → { diffs: [...], css: {...} }  — leer heißt: nichts hat sich geändert.
 *
 * code/_t.html ist Wegwerf (in .gitignore) und wird nie veröffentlicht.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const R = path.resolve(__dirname, "..", "..") + "/";
let s = fs.readFileSync(R + "code/pinit.html", "utf8");

const pre = `<meta charset="utf-8">
<style>#toast { transition: none !important; }</style>
<script>
// Schein-Datenbank: zeichnet alle set()/delete() auf, liefert nie Staende.
(function () {
  try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf("rb.") === 0) localStorage.removeItem(k); }); } catch (e) {}
  var log = [];
  function doc(p) {
    return {
      set: function (d) { log.push(["set", p, JSON.parse(JSON.stringify(d))]); return Promise.resolve(); },
      delete: function () { log.push(["del", p]); return Promise.resolve(); },
      onSnapshot: function () {}
    };
  }
  var db = {
    doc: doc,
    collection: function () { return { limit: function () { return { onSnapshot: function () {} }; } }; }
  };
  window.__dbLog = log;
  window.claude = { use: function () { return Promise.resolve(db); } };
})();
</script>
`;
// Der Haken nennt die inneren Funktionen beim Namen — wer eine umbenennt, zieht hier nach.
const hook = `
  window.__rb = function () { return {
    nodes: nodes, edges: edges, allNodes: allNodes, allEdges: allEdges, sheets: sheets,
    get sel() { return sel; }, set sel(v) { sel = v; }, selSet: selSet, selEdges: selEdges, view: view,
    activeSheet: function () { return activeSheet; }, editing: function () { return editing; }, drag: function () { return drag; },
    refilter: refilter, render: render, renderWires: renderWires, renderNodes: renderNodes, renderInspector: renderInspector,
    applyView: applyView, fit: fit, addNode: addNode, connect: connect, putNode: putNode, putEdge: putEdge,
    brettAlsJSON: brettAlsJSON, tabelleAendernFuer: tabelleAendernFuer, zeileEinfuegen: zeileEinfuegen, zeileLoeschen: zeileLoeschen,
    spalteEinfuegen: spalteEinfuegen, spalteLoeschen: spalteLoeschen, sichtbarkeitUmschalten: sichtbarkeitUmschalten,
    auswahlUmschalten: auswahlUmschalten, duplizieren: duplizieren, kopieren: kopieren, einfuegenAusAblage: einfuegenAusAblage,
    ausrichten: ausrichten, mitnehmer: mitnehmer, verstecktMengen: verstecktMengen, nachbarschaft: nachbarschaft,
    switchSheet: switchSheet, addSheet: addSheet, renameSheet: renameSheet, reiterGruppieren: reiterGruppieren,
    reiterTypSetzen: reiterTypSetzen, deleteSheet: deleteSheet, textAendern: textAendern, setTool: setTool,
    applyNodes: applyNodes, applyEdges: applyEdges, applySheets: applySheets, snap: snap,
    inspektorAbschliessen: inspektorAbschliessen, oeffneZumTippen: oeffneZumTippen, removeSel: removeSel,
    auswahlSchieben: auswahlSchieben, toBoard: toBoard, KINDS: KINDS, offenesTippenAbschliessen: offenesTippenAbschliessen,
    rasterSchrittSetzen: rasterSchrittSetzen, einstZeigen: einstZeigen, pfeilAendern: pfeilAendern, groesseAusFeldern: groesseAusFeldern,
    tabellenMenueZeigen: tabellenMenueZeigen, tabMenueZeigen: tabMenueZeigen
  }; };
`;
const szenario = fs.readFileSync(path.join(__dirname, "szenario.js"), "utf8");

if (s.split("<script>").length - 1 !== 1) throw new Error("pinit.html muss genau einen <script>-Block haben");
s = s.replace("<script>", pre + "<script>");
const ende = "\n})();\n</script>";
const i = s.lastIndexOf(ende); if (i < 0) throw new Error("Skript-Ende fehlt");
s = s.slice(0, i) + hook + ende + "\n<script>\n" + szenario + "\n</script>" + s.slice(i + ende.length);
fs.writeFileSync(R + "code/_t.html", s);
console.log("ok code/_t.html", s.length, "Zeichen");
