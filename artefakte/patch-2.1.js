/**
 * Patch 2.1: Umschalt+Klick nimmt ein Element in die Mehrfachauswahl auf oder wieder
 * heraus; Umschalt beim Rahmenziehen ergaenzt die bestehende Auswahl statt sie zu ersetzen.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.1.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze) { E.push({ was, suche, ersetze }); }

edit("Fassung", `  var FASSUNG = "2.0";`, `  var FASSUNG = "2.1";`);

edit("Helfer: Auswahl umschalten (vor mitnehmer)",
`  function mitnehmer(id, n) {`,
`  // Umschalt+Klick: Element in die Mehrfachauswahl aufnehmen oder wieder herausnehmen.
  // Eine bestehende Einzelauswahl wird dabei zum ersten Mitglied. Bleibt genau eins
  // uebrig, wird es wieder Einzelauswahl (damit der Inspektor es zeigt).
  function auswahlUmschalten(id) {
    if (!selSet.size && sel && sel.type === "node" && sel.id !== id) selSet.add(sel.id);
    sel = null;
    if (selSet.has(id)) selSet.delete(id); else selSet.add(id);
    if (selSet.size === 1) { sel = { type: "node", id: selSet.values().next().value }; selSet.clear(); }
  }

  function mitnehmer(id, n) {`);

edit("mousedown Knoten: Umschalt+Klick",
`      if (editing && editing.id === id) return;
      ev.preventDefault();
      var n = nodes.get(id);
      var kinder;`,
`      if (editing && editing.id === id) return;
      ev.preventDefault();
      if (ev.shiftKey) { auswahlUmschalten(id); render(); return; }
      var n = nodes.get(id);
      var kinder;`);

edit("mousedown leere Flaeche: Umschalt haelt die Auswahl",
`    if (sel || selSet.size) { sel = null; selSet.clear(); render(); }
    if (tool === "select") {
      ev.preventDefault();
      drag = { mode: "marquee", start: toBoard(ev.clientX, ev.clientY) };
      return;
    }`,
`    var ergaenzen = ev.shiftKey && tool === "select";
    if (!ergaenzen && (sel || selSet.size)) { sel = null; selSet.clear(); render(); }
    if (tool === "select") {
      ev.preventDefault();
      drag = { mode: "marquee", start: toBoard(ev.clientX, ev.clientY), ergaenzen: ergaenzen };
      return;
    }`);

edit("mouseup Rahmen: ergaenzen",
`      selSet.clear(); sel = null;
      if (rw >= 4 || rh >= 4) {`,
`      if (d.ergaenzen) {
        // Bestehende Einzelauswahl wird Mitglied, der Rest bleibt stehen.
        if (sel && sel.type === "node") selSet.add(sel.id);
        sel = null;
      } else {
        selSet.clear(); sel = null;
      }
      if (rw >= 4 || rh >= 4) {`);

edit("Kurzhilfe",
`Rahmen ziehen wählt mehrere · `,
`Rahmen ziehen wählt mehrere, Umschalt+Klick ergänzt · `);

/* ================================ Lauf ================================ */
let src = fs.readFileSync(ZIEL, "utf8");
const fehler = [];
E.forEach(function (e, i) {
  const n = src.split(e.suche).length - 1;
  if (n !== 1) fehler.push("  [" + (i + 1) + "] " + e.was + " -> " + n + " Treffer (erwartet 1)");
});
if (fehler.length) {
  console.error("ABBRUCH, nichts geschrieben:");
  fehler.forEach(function (f) { console.error(f); });
  process.exit(1);
}
E.forEach(function (e) { src = src.replace(e.suche, function () { return e.ersetze; }); });
fs.writeFileSync(ZIEL, src);
E.forEach(function (e, i) { console.log("  ok  [" + (i + 1) + "] " + e.was); });
console.log(E.length + " Aenderungen geschrieben.");
