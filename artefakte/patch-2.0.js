/**
 * Patch 2.0: Auswahl-Rahmen (Mehrfachauswahl) + Werkzeug "Bewegen" (H).
 * Auswaehlen (V) zieht auf leerer Flaeche einen Rahmen statt die Ansicht zu schieben.
 * Ansicht schieben: Werkzeug Bewegen ODER mittlere Maustaste (wie bisher).
 * Mehrfachauswahl: zusammen verschieben, umfaerben, loeschen. `selSet` traegt sie;
 * `sel` bleibt die Einzelauswahl fuer den Inspektor.
 * Erst ALLE Anker pruefen, dann schreiben, dann melden — wie patch-1.5.js.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.0.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze) { E.push({ was, suche, ersetze }); }

edit("Fassung", `  var FASSUNG = "1.9";`, `  var FASSUNG = "2.0";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: Auswahl-Rahmen + Hand-Zeiger",
`  #canvas.linking { cursor: cell; }`,
`  #canvas.linking { cursor: cell; }
  #canvas.hand { cursor: grab; }
  /* Auswahl-Rahmen (Werkzeug Auswaehlen, Ziehen auf leerer Flaeche). Lebt wie die
     Anlege-Vorschau in #layer und ueberlebt darum renderNodes. */
  #auswahl-rahmen {
    position: absolute; pointer-events: none; z-index: 9000;
    border: 1px solid var(--accent); background: rgba(31, 95, 168, .08);
  }`);

/* -------------------------------------------------------------- Hinweis */
edit("Hinweis-Text",
`Ziehen auf leerer Fläche verschiebt die Ansicht, Mausrad zoomt.</p>`,
`Ziehen auf leerer Fläche wählt einen Bereich aus; die Ansicht verschiebt das Werkzeug „Bewegen“ (H) oder die mittlere Maustaste, Mausrad zoomt.</p>`);

/* --------------------------------------------------------------- Modell */
edit("Modell: selSet",
`  var sel = null;          // {type:"node"|"edge", id}`,
`  var sel = null;          // {type:"node"|"edge", id} — die Einzelauswahl (Inspektor)
  // Mehrfachauswahl aus dem Auswahl-Rahmen: Knoten-Kennungen. Hat sie mehr als ein
  // Element, ist sel null und der Inspektor zeigt den Sammel-Modus. Jede Einzelwahl
  // (Klick auf Element/Pfeil/Griff) leert sie — nur der Rahmen fuellt sie.
  var selSet = new Set();`);

/* ------------------------------------------------------------ Werkzeuge */
edit("TOOLS: Bewegen",
`    { id: "select", key: "V", label: "Auswählen",
      svg: '<path d="M4 3l7 17 2.2-6.8L20 11z"/>' },`,
`    { id: "select", key: "V", label: "Auswählen",
      svg: '<path d="M4 3l7 17 2.2-6.8L20 11z"/>' },
    { id: "hand", key: "H", label: "Bewegen",
      svg: '<path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5V4.5a1.5 1.5 0 0 1 3 0V12M14 12V6.5a1.5 1.5 0 0 1 3 0V13"/><path d="M17 13v-1.5a1.5 1.5 0 0 1 3 0V16a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.6 15.8a1.5 1.5 0 0 1 2.5-1.6L8 15.5"/>' },`);

edit("setTool: hand-Zeiger",
`    canvas.classList.toggle("linking", t === "link");`,
`    canvas.classList.toggle("linking", t === "link");
    canvas.classList.toggle("hand", t === "hand");`);

/* -------------------------------------------------------------- Zeichnen */
edit("renderNodes: sel aus selSet",
`      el.className = "node " + n.kind + (sel && sel.type === "node" && sel.id === id ? " sel" : "");`,
`      el.className = "node " + n.kind +
        ((sel && sel.type === "node" && sel.id === id) || selSet.has(id) ? " sel" : "");`);

edit("renderInspector: Sammel-Modus",
`    if (!sel) { box.classList.remove("on"); return; }`,
`    if (selSet.size > 1) {
      // Sammel-Modus: Farbe und Loeschen wirken auf alle, der Rest ist verborgen.
      box.classList.add("on");
      $("insp-kind").textContent = selSet.size + " Elemente";
      $("swatches").style.display = "flex";
      var sw2 = $("swatches").children;
      for (var j = 0; j < sw2.length; j++) sw2[j].setAttribute("aria-pressed", "false");
      $("btn-front").style.display = "none";
      $("btn-back").style.display = "none";
      $("btn-dup").style.display = "none";
      $("text-row").hidden = true;
      $("edge-row").hidden = true;
      $("note-row").hidden = true;
      $("insp-coords").textContent = "Auswahl-Rahmen · Entf löscht alle";
      $("insp-id").textContent = "";
      return;
    }
    if (!sel) { box.classList.remove("on"); return; }`);

/* ---------------------------------------------------------- Bearbeiten */
edit("removeSel: Mehrfachauswahl",
`  function removeSel() {
    if (!sel) return;
    if (sel.type === "node") {
      var id = sel.id;
      nodes.delete(id); allNodes.delete(id);
      var kill = [];
      allEdges.forEach(function (e, eid) { if (e.from === id || e.to === id) kill.push(eid); });
      kill.forEach(function (eid) {
        edges.delete(eid); allEdges.delete(eid); dropDoc("edges", eid);
      });
      dropDoc("nodes", id);
    } else {`,
`  function knotenLoeschen(id) {
    nodes.delete(id); allNodes.delete(id);
    var kill = [];
    allEdges.forEach(function (e, eid) { if (e.from === id || e.to === id) kill.push(eid); });
    kill.forEach(function (eid) {
      edges.delete(eid); allEdges.delete(eid); dropDoc("edges", eid);
    });
    dropDoc("nodes", id);
  }
  function removeSel() {
    if (selSet.size > 1) {
      selSet.forEach(function (id) { if (nodes.has(id)) knotenLoeschen(id); });
      selSet.clear();
      sel = null;
      render();
      return;
    }
    if (!sel) return;
    if (sel.type === "node") {
      knotenLoeschen(sel.id);
    } else {`);

edit("Farbfeld: Mehrfachauswahl",
`      if (!sel || sel.type !== "node") return;
      var n = nodes.get(sel.id); if (!n) return;
      n.color = c; putNode(sel.id); render();`,
`      if (selSet.size > 1) {
        selSet.forEach(function (id) {
          var m = nodes.get(id); if (!m) return;
          m.color = c; putNode(id);
        });
        render();
        return;
      }
      if (!sel || sel.type !== "node") return;
      var n = nodes.get(sel.id); if (!n) return;
      n.color = c; putNode(sel.id); render();`);

/* ------------------------------------------------------------------ Maus */
edit("mousedown: Bewegen-Werkzeug + Griff leert selSet",
`    if (grip) {
      ev.preventDefault();
      var gn = nodes.get(grip.dataset.grip);
      sel = { type: "node", id: grip.dataset.grip };`,
`    // Werkzeug Bewegen: Ziehen schiebt die Ansicht, egal was darunter liegt.
    if (tool === "hand") { startPan(ev); return; }

    if (grip) {
      ev.preventDefault();
      var gn = nodes.get(grip.dataset.grip);
      selSet.clear();
      sel = { type: "node", id: grip.dataset.grip };`);

edit("mousedown: Knoten — Mehrfachauswahl zusammen bewegen",
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
      render();
      return;`,
`      var n = nodes.get(id);
      var kinder;
      if (selSet.size > 1 && selSet.has(id)) {
        // Griff an einem Element der Mehrfachauswahl: die anderen gewaehlten gehen mit.
        kinder = [];
        selSet.forEach(function (mid) {
          var m = nodes.get(mid);
          if (m && mid !== id) kinder.push({ id: mid, x0: m.x, y0: m.y });
        });
        sel = null;
      } else {
        selSet.clear();
        sel = { type: "node", id: id };
        // Mitnehmen: alles, was ganz in diesem Element liegt UND vor ihm (hoeheres z).
        // So wird eine grosse Notiz "nach hinten" zum Traeger fuer das, was darauf
        // liegt — ohne Gruppen-Feld in der Datenbank. Alt gedrueckt = nur dieses Element.
        kinder = ev.altKey ? [] : mitnehmer(id, n);
      }
      drag = {
        mode: "move", id: id, moved: false,
        start: toBoard(ev.clientX, ev.clientY), x0: n.x, y0: n.y,
        kinder: kinder
      };
      render();
      return;`);

edit("mousedown: Pfeil leert selSet",
`      sel = { type: "edge", id: wireEl.dataset.edge };
      render();
      return;
    }

    // leere Fläche
    if (sel) { sel = null; render(); }
    startPan(ev);`,
`      selSet.clear();
      sel = { type: "edge", id: wireEl.dataset.edge };
      render();
      return;
    }

    // leere Fläche: mit Auswaehlen einen Rahmen ziehen, sonst die Ansicht schieben
    if (sel || selSet.size) { sel = null; selSet.clear(); render(); }
    if (tool === "select") {
      ev.preventDefault();
      drag = { mode: "marquee", start: toBoard(ev.clientX, ev.clientY) };
      return;
    }
    startPan(ev);`);

edit("mousemove: Rahmen zeichnen",
`    if (drag.mode === "create") {
      drag.cur = p;
      vorschauZeigen(drag.start, p);
      return;
    }`,
`    if (drag.mode === "create") {
      drag.cur = p;
      vorschauZeigen(drag.start, p);
      return;
    }
    if (drag.mode === "marquee") {
      drag.cur = p;
      rahmenZeigen(drag.start, p);
      return;
    }`);

edit("mouseup: Rahmen auswerten",
`    if (d.mode === "create") {
      vorschauWeg();`,
`    if (d.mode === "marquee") {
      rahmenWeg();
      var q = d.cur || d.start;
      var rx = Math.min(d.start.x, q.x), ry = Math.min(d.start.y, q.y);
      var rw = Math.abs(q.x - d.start.x), rh = Math.abs(q.y - d.start.y);
      selSet.clear(); sel = null;
      if (rw >= 4 || rh >= 4) {
        // Beruehren reicht (wie in Figma): ein Element zaehlt, wenn sich die Rechtecke
        // ueberschneiden — ganz einschliessen muss man es nicht.
        nodes.forEach(function (m, mid) {
          if (m.x < rx + rw && m.x + m.w > rx && m.y < ry + rh && m.y + m.h > ry) selSet.add(mid);
        });
        if (selSet.size === 1) { sel = { type: "node", id: selSet.values().next().value }; selSet.clear(); }
      }
      render();
      abarbeiten();
      return;
    }
    if (d.mode === "create") {
      vorschauWeg();`);

edit("Rahmen-Helfer neben der Anlege-Vorschau",
`  function vorschauWeg() {
    var g = $("neu-vorschau");
    if (g) g.remove();
  }`,
`  function vorschauWeg() {
    var g = $("neu-vorschau");
    if (g) g.remove();
  }
  function rahmenZeigen(a, b) {
    var g = $("auswahl-rahmen");
    if (!g) {
      g = document.createElement("div");
      g.id = "auswahl-rahmen";
      layer.appendChild(g);
    }
    g.style.left = Math.min(a.x, b.x) + "px";
    g.style.top = Math.min(a.y, b.y) + "px";
    g.style.width = Math.abs(b.x - a.x) + "px";
    g.style.height = Math.abs(b.y - a.y) + "px";
  }
  function rahmenWeg() {
    var g = $("auswahl-rahmen");
    if (g) g.remove();
  }`);

edit("dblclick: Knoten leert selSet",
`      sel = { type: "node", id: nodeEl.dataset.id };`,
`      selSet.clear();
      sel = { type: "node", id: nodeEl.dataset.id };`);

/* -------------------------------------------------------------- Tastatur */
edit("Tastatur: Escape + H",
`    if (ev.key === "Escape") { sel = null; setTool("select"); render(); return; }`,
`    if (ev.key === "Escape") { sel = null; selSet.clear(); setTool("select"); render(); return; }`);
edit("Tastatur: Kuerzel H",
`    var map = { v: "select", b: "box", s: "sticky", d: "diamond", t: "text", a: "link" };`,
`    var map = { v: "select", h: "hand", b: "box", s: "sticky", d: "diamond", t: "text", a: "link" };`);

/* ------------------------------------------------------------- Kurzhilfe */
edit("Kurzhilfe",
`toast("Fassung " + FASSUNG + " · Werkzeug wählen + klicken · Doppelklick beschriftet · Pfeil: A, von Kasten zu Kasten ziehen · Entf löscht · Verschieben nimmt mit, was darauf liegt (Alt: nur das Element) · Reiter: + anlegen, Doppelklick umbenennen");`,
`toast("Fassung " + FASSUNG + " · Werkzeug wählen + klicken · Rahmen ziehen wählt mehrere · Ansicht: Bewegen (H) oder mittlere Maustaste · Doppelklick beschriftet · Pfeil: A, von Kasten zu Kasten ziehen · Entf löscht · Verschieben nimmt mit, was darauf liegt (Alt: nur das Element) · Reiter: + anlegen, Doppelklick umbenennen");`);

/* ------------------------------------------------------------ Datenbank */
edit("applyNodes: selSet bereinigen",
`    if (sel && sel.type === "node" && !nodes.has(sel.id)) sel = null;`,
`    if (sel && sel.type === "node" && !nodes.has(sel.id)) sel = null;
    selSet.forEach(function (id) { if (!nodes.has(id)) selSet.delete(id); });`);

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
