/**
 * Patch 1.8: Mitnehmen beim Verschieben — ein Element nimmt alles mit, was ganz in ihm
 * liegt und vor ihm liegt (hoeheres z). Alt gedrueckt = nur das Element selbst.
 * Erst ALLE Anker pruefen, dann schreiben, dann melden — wie patch-1.5.js.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-1.8.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze) { E.push({ was, suche, ersetze }); }

edit("Fassung", `  var FASSUNG = "1.7";`, `  var FASSUNG = "1.8";`);

/* ------------------------------------------------------ Helfer + mousedown */
edit("mousedown: Kinder einsammeln",
`      var n = nodes.get(id);
      sel = { type: "node", id: id };
      drag = {
        mode: "move", id: id, moved: false,
        start: toBoard(ev.clientX, ev.clientY), x0: n.x, y0: n.y
      };
      render();`,
`      var n = nodes.get(id);
      sel = { type: "node", id: id };
      drag = {
        mode: "move", id: id, moved: false,
        start: toBoard(ev.clientX, ev.clientY), x0: n.x, y0: n.y,
        // Mitnehmen: alles, was ganz in diesem Element liegt UND vor ihm (hoeheres z).
        // So wird eine grosse Notiz "nach hinten" zum Traeger fuer das, was darauf
        // liegt — ohne Gruppen-Feld in der Datenbank. Alt gedrueckt = nur dieses Element.
        kinder: ev.altKey ? [] : mitnehmer(id, n)
      };
      render();`);

edit("Helfer mitnehmer() vor dem Maus-Abschnitt",
`  /* ============================ Maus ============================ */`,
`  // Welche Elemente des offenen Reiters liegen GANZ in n und vor n? Genau die wandern
  // beim Verschieben mit. Gleiches z zaehlt als "vor", damit ein frisch angelegter
  // Kasten auf einer Notiz gleich mitgeht; die Notiz selbst ist ausgeschlossen.
  function mitnehmer(id, n) {
    var out = [];
    nodes.forEach(function (m, mid) {
      if (mid === id) return;
      if ((m.z || 0) < (n.z || 0)) return;
      if (m.x < n.x || m.y < n.y) return;
      if (m.x + m.w > n.x + n.w || m.y + m.h > n.y + n.h) return;
      out.push({ id: mid, x0: m.x, y0: m.y });
    });
    return out;
  }

  /* ============================ Maus ============================ */`);

/* ------------------------------------------------------------- mousemove */
edit("mousemove: Kinder mitbewegen",
`    if (drag.mode === "move") {
      var n = nodes.get(drag.id); if (!n) return;
      n.x = Math.round(drag.x0 + (p.x - drag.start.x));
      n.y = Math.round(drag.y0 + (p.y - drag.start.y));
      drag.moved = true;
      var el = layer.querySelector('.node[data-id="' + drag.id + '"]');
      if (el) { el.style.left = n.x + "px"; el.style.top = n.y + "px"; }
      renderWires();
      return;
    }`,
`    if (drag.mode === "move") {
      var n = nodes.get(drag.id); if (!n) return;
      var ddx = Math.round(p.x - drag.start.x), ddy = Math.round(p.y - drag.start.y);
      n.x = drag.x0 + ddx;
      n.y = drag.y0 + ddy;
      drag.moved = true;
      var el = layer.querySelector('.node[data-id="' + drag.id + '"]');
      if (el) { el.style.left = n.x + "px"; el.style.top = n.y + "px"; }
      drag.kinder.forEach(function (k) {
        var m = nodes.get(k.id); if (!m) return;
        m.x = k.x0 + ddx; m.y = k.y0 + ddy;
        var kel = layer.querySelector('.node[data-id="' + k.id + '"]');
        if (kel) { kel.style.left = m.x + "px"; kel.style.top = m.y + "px"; }
      });
      renderWires();
      return;
    }`);

/* --------------------------------------------------------------- mouseup */
edit("mouseup: Kinder speichern",
`    if (d.mode === "move" && d.moved) { putNode(d.id); render(); }`,
`    if (d.mode === "move" && d.moved) {
      putNode(d.id);
      d.kinder.forEach(function (k) { if (nodes.has(k.id)) putNode(k.id); });
      render();
    }`);

/* ------------------------------------------------------------- Kurzhilfe */
edit("Kurzhilfe",
`Entf löscht · Reiter: + anlegen, Doppelklick umbenennen");`,
`Entf löscht · Verschieben nimmt mit, was darauf liegt (Alt: nur das Element) · Reiter: + anlegen, Doppelklick umbenennen");`);

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
