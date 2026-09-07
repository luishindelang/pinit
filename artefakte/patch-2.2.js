/**
 * Patch 2.2: Pfeile in der Mehrfachauswahl. `selEdges` neben `selSet`; der Rahmen nimmt
 * einen Pfeil, wenn er dessen Linie beruehrt; Umschalt+Klick auf einen Pfeil ergaenzt;
 * Entf loescht Kaesten und Pfeile zusammen. Sammel-Modus = selSet.size + selEdges.size > 1.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.2.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.1";`, `  var FASSUNG = "2.2";`);

edit("Modell: selEdges",
`  var selSet = new Set();`,
`  var selSet = new Set();
  var selEdges = new Set();  // Pfeile der Mehrfachauswahl (seit 2.2)
  function mehrfach() { return selSet.size + selEdges.size > 1; }`);

// Jede Stelle, die die Mehrfachauswahl leert, leert beide Mengen.
edit("selSet.clear() -> beide Mengen (alle Stellen)",
`selSet.clear();`, `selSet.clear(); selEdges.clear();`, true);

edit("renderWires: sel aus selEdges (Klasse)",
`      g.setAttribute("class", "wire" + (sel && sel.type === "edge" && sel.id === id ? " sel" : ""));`,
`      var istSel = (sel && sel.type === "edge" && sel.id === id) || selEdges.has(id);
      g.setAttribute("class", "wire" + (istSel ? " sel" : ""));`);
edit("renderWires: sel aus selEdges (Pfeilspitze)",
`        "url(#" + (sel && sel.type === "edge" && sel.id === id ? "mk-sel" : "mk") + ")");`,
`        "url(#" + (istSel ? "mk-sel" : "mk") + ")");`);

edit("renderInspector: Sammel-Modus mit Pfeilen",
`    if (selSet.size > 1) {
      // Sammel-Modus: Farbe und Loeschen wirken auf alle, der Rest ist verborgen.
      box.classList.add("on");
      $("insp-kind").textContent = selSet.size + " Elemente";
      $("swatches").style.display = "flex";`,
`    if (mehrfach()) {
      // Sammel-Modus: Farbe (nur Elemente) und Loeschen wirken auf alle, der Rest ist verborgen.
      box.classList.add("on");
      $("insp-kind").textContent = selSet.size + " Elemente" +
        (selEdges.size ? " · " + selEdges.size + (selEdges.size === 1 ? " Pfeil" : " Pfeile") : "");
      $("swatches").style.display = selSet.size ? "flex" : "none";`);

edit("removeSel: Pfeile mitloeschen",
`    if (selSet.size > 1) {
      selSet.forEach(function (id) { if (nodes.has(id)) knotenLoeschen(id); });`,
`    if (mehrfach()) {
      selSet.forEach(function (id) { if (nodes.has(id)) knotenLoeschen(id); });
      selEdges.forEach(function (eid) {
        if (!allEdges.has(eid)) return;   // ggf. schon mit seinem Kasten weg
        edges.delete(eid); allEdges.delete(eid); dropDoc("edges", eid);
      });`);

edit("Farbfeld: mehrfach()",
`      if (selSet.size > 1) {
        selSet.forEach(function (id) {`,
`      if (mehrfach()) {
        selSet.forEach(function (id) {`);

edit("auswahlUmschalten: Knoten und Pfeile",
`  function auswahlUmschalten(id) {
    if (!selSet.size && sel && sel.type === "node" && sel.id !== id) selSet.add(sel.id);
    sel = null;
    if (selSet.has(id)) selSet.delete(id); else selSet.add(id);
    if (selSet.size === 1) { sel = { type: "node", id: selSet.values().next().value }; selSet.clear(); selEdges.clear(); }
  }`,
`  function auswahlUmschalten(typ, id) {
    if (!mehrfach() && sel && !(sel.type === typ && sel.id === id)) {
      (sel.type === "node" ? selSet : selEdges).add(sel.id);
    }
    sel = null;
    var menge = typ === "node" ? selSet : selEdges;
    if (menge.has(id)) menge.delete(id); else menge.add(id);
    einzelAufloesen();
  }
  // Bleibt genau EIN Eintrag, wird er wieder Einzelauswahl (damit der Inspektor ihn zeigt).
  function einzelAufloesen() {
    if (selSet.size + selEdges.size !== 1) return;
    if (selSet.size) sel = { type: "node", id: selSet.values().next().value };
    else sel = { type: "edge", id: selEdges.values().next().value };
    selSet.clear(); selEdges.clear();
  }
  // Trifft die Strecke a-b das Rechteck? Endpunkt drin ODER Schnitt mit einer der vier Kanten.
  function strichTrifft(a, b, rx, ry, rw, rh) {
    function drin(p) { return p.x >= rx && p.x <= rx + rw && p.y >= ry && p.y <= ry + rh; }
    if (drin(a) || drin(b)) return true;
    function kreuzt(p, q, r, s) {
      var d = (q.x - p.x) * (s.y - r.y) - (q.y - p.y) * (s.x - r.x);
      if (!d) return false;
      var u = ((r.x - p.x) * (s.y - r.y) - (r.y - p.y) * (s.x - r.x)) / d;
      var v = ((r.x - p.x) * (q.y - p.y) - (r.y - p.y) * (q.x - p.x)) / d;
      return u >= 0 && u <= 1 && v >= 0 && v <= 1;
    }
    var A = { x: rx, y: ry }, B = { x: rx + rw, y: ry }, C = { x: rx + rw, y: ry + rh }, D = { x: rx, y: ry + rh };
    return kreuzt(a, b, A, B) || kreuzt(a, b, B, C) || kreuzt(a, b, C, D) || kreuzt(a, b, D, A);
  }`);

edit("mousedown Knoten: Umschalt mit Typ",
`      if (ev.shiftKey) { auswahlUmschalten(id); render(); return; }`,
`      if (ev.shiftKey) { auswahlUmschalten("node", id); render(); return; }`);

edit("mousedown Knoten: mehrfach()",
`      if (selSet.size > 1 && selSet.has(id)) {`,
`      if (mehrfach() && selSet.has(id)) {`);

edit("mousedown Pfeil: Umschalt",
`      ev.preventDefault();
      selSet.clear(); selEdges.clear();
      sel = { type: "edge", id: wireEl.dataset.edge };`,
`      ev.preventDefault();
      if (ev.shiftKey) { auswahlUmschalten("edge", wireEl.dataset.edge); render(); return; }
      selSet.clear(); selEdges.clear();
      sel = { type: "edge", id: wireEl.dataset.edge };`);

edit("mouseup Rahmen: Pfeile aufnehmen",
`      if (d.ergaenzen) {
        // Bestehende Einzelauswahl wird Mitglied, der Rest bleibt stehen.
        if (sel && sel.type === "node") selSet.add(sel.id);
        sel = null;
      } else {
        selSet.clear(); selEdges.clear(); sel = null;
      }
      if (rw >= 4 || rh >= 4) {
        // Beruehren reicht (wie in Figma): ein Element zaehlt, wenn sich die Rechtecke
        // ueberschneiden — ganz einschliessen muss man es nicht.
        nodes.forEach(function (m, mid) {
          if (m.x < rx + rw && m.x + m.w > rx && m.y < ry + rh && m.y + m.h > ry) selSet.add(mid);
        });
        if (selSet.size === 1) { sel = { type: "node", id: selSet.values().next().value }; selSet.clear(); selEdges.clear(); }
      }`,
`      if (d.ergaenzen) {
        // Bestehende Einzelauswahl wird Mitglied, der Rest bleibt stehen.
        if (sel) (sel.type === "node" ? selSet : selEdges).add(sel.id);
        sel = null;
      } else {
        selSet.clear(); selEdges.clear(); sel = null;
      }
      if (rw >= 4 || rh >= 4) {
        // Beruehren reicht (wie in Figma): ein Element zaehlt, wenn sich die Rechtecke
        // ueberschneiden — ganz einschliessen muss man es nicht. Ein Pfeil zaehlt, wenn
        // der Rahmen seine Linie (Rand zu Rand, wie gezeichnet) beruehrt.
        nodes.forEach(function (m, mid) {
          if (m.x < rx + rw && m.x + m.w > rx && m.y < ry + rh && m.y + m.h > ry) selSet.add(mid);
        });
        edges.forEach(function (e, eid) {
          var a = nodes.get(e.from), b = nodes.get(e.to);
          if (!a || !b) return;
          var ca = center(a), cb = center(b), dx = cb.x - ca.x, dy = cb.y - ca.y;
          if (!dx && !dy) return;
          if (strichTrifft(border(a, dx, dy), border(b, -dx, -dy), rx, ry, rw, rh)) selEdges.add(eid);
        });
        einzelAufloesen();
      }`);

edit("applyEdges: selEdges bereinigen",
`    if (sel && sel.type === "edge" && !edges.has(sel.id)) sel = null;`,
`    if (sel && sel.type === "edge" && !edges.has(sel.id)) sel = null;
    selEdges.forEach(function (id) { if (!edges.has(id)) selEdges.delete(id); });`);

edit("Kurzhilfe",
`Rahmen ziehen wählt mehrere, Umschalt+Klick ergänzt · `,
`Rahmen ziehen wählt mehrere (auch Pfeile), Umschalt+Klick ergänzt · `);

/* ================================ Lauf ================================ */
// Sequentiell auf einer Kopie pruefen (spaetere Anker duerfen auf fruehere Ersetzungen
// aufbauen), erst danach schreiben. Ein Fehltreffer bricht ab, ohne zu schreiben.
const original = fs.readFileSync(ZIEL, "utf8");
let src = original;
const fehler = [];
E.forEach(function (e, i) {
  const n = src.split(e.suche).length - 1;
  if (e.alle ? n < 1 : n !== 1) { fehler.push("  [" + (i + 1) + "] " + e.was + " -> " + n + " Treffer"); return; }
  if (e.alle) { e.n = n; src = src.split(e.suche).join(e.ersetze); }
  else src = src.replace(e.suche, function () { return e.ersetze; });
});
if (fehler.length) {
  console.error("ABBRUCH, nichts geschrieben:");
  fehler.forEach(function (f) { console.error(f); });
  process.exit(1);
}
fs.writeFileSync(ZIEL, src);
E.forEach(function (e, i) { console.log("  ok  [" + (i + 1) + "] " + e.was + (e.alle ? " (" + e.n + "x)" : "")); });
console.log(E.length + " Aenderungen geschrieben.");
