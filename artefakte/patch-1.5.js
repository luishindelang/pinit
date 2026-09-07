/**
 * Patch-Werkzeug: erst ALLE Anker pruefen, dann schreiben, dann melden.
 * Genau in dieser Reihenfolge — ein Lauf, der erst am Ende schreibt und an einem
 * falschen Anker abbricht, hat in Fassung 1.3 eine kaputte Datei live gebracht.
 */
"use strict";
const fs = require("fs");

const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch.js <datei>"); process.exit(1); }

const E = [];
function edit(was, suche, ersetze) { E.push({ was, suche, ersetze }); }

/* ---------------------------------------------------------------- 1  CSS */
edit("CSS: Vorschau-Rechteck",
`  .node.sel .grip { display: block; }`,
`  .node.sel .grip { display: block; }

  /* Vorschau beim Aufziehen eines neuen Elements. Lebt in der Zeichenebene und
     teilt darum deren Brett-Koordinaten; renderNodes raeumt nur .node/.wire-svg weg. */
  #neu-vorschau {
    position: absolute; pointer-events: none; z-index: 9000;
    border: 1.5px dashed var(--accent); border-radius: 4px;
    background: rgba(125, 125, 135, .08);
  }`);

edit("CSS: Knopfgruppe im Inspektor",
`  .insp-row { display: flex; flex-direction: column; gap: 5px; }`,
`  .tgrp { display: flex; gap: 4px; align-items: center; }
  .tgrp button { flex: 1 1 0; min-width: 0; justify-content: center; padding: 5px 0; border-color: var(--line); }
  #fs-val {
    flex: 1 1 0; text-align: center; white-space: nowrap;
    font-family: "IBM Plex Mono", monospace; font-size: 10px; color: var(--ink-2);
    font-variant-numeric: tabular-nums;
  }
  .insp-row { display: flex; flex-direction: column; gap: 5px; }`);

/* ------------------------------------------------------- 2  Inspektor-HTML */
edit("Inspektor: Textzeile",
`      <div class="insp-field" id="edge-row" hidden>`,
`      <div class="insp-field" id="text-row" hidden>
        <label>Text</label>
        <div class="tgrp">
          <button id="fs-minus" title="Schrift kleiner" aria-label="Schrift kleiner">A-</button>
          <span id="fs-val">13 px</span>
          <button id="fs-plus" title="Schrift groesser" aria-label="Schrift groesser">A+</button>
          <button id="t-bold" title="Fett" aria-label="Fett" aria-pressed="false"><b>B</b></button>
        </div>
        <div class="tgrp">
          <button id="al-left" title="Linksbuendig" aria-label="Linksbuendig" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h10M4 17h13"/></svg></button>
          <button id="al-center" title="Zentriert" aria-label="Zentriert" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M7 12h10M6 17h12"/></svg></button>
          <button id="al-right" title="Rechtsbuendig" aria-label="Rechtsbuendig" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M10 12h10M7 17h13"/></svg></button>
        </div>
      </div>
      <div class="insp-field" id="edge-row" hidden>`);

edit("Hinweis auf leerem Brett: Aufziehen erwaehnen",
`Werkzeug oben wählen, dann auf die Fläche klicken.`,
`Werkzeug oben wählen, dann auf der Fläche die Größe aufziehen — ein einzelner Klick nimmt die Standardgröße.`);

/* ------------------------------------------------------------ 3  Fassung */
edit("Fassung auf 1.5",
`  var FASSUNG = "1.4";`,
`  var FASSUNG = "1.5";`);

/* -------------------------------------------------------------- 4  KINDS */
edit("KINDS: Text-Vorgaben je Bauart",
`  var KINDS = {
    box:     { w: 168, h: 66,  color: "slate", label: "Schritt" },
    sticky:  { w: 148, h: 128, color: "amber", label: "Notiz" },
    diamond: { w: 158, h: 100, color: "mint",  label: "Entscheidung" },
    text:    { w: 220, h: 34,  color: "plain", label: "Beschriftung" }
  };`,
`  // fs/bold/align sind die VORGABEN der Bauart. Am Element bedeutet fs 0 / bold 0 /
  // align "" ausdruecklich "nimm die Vorgabe" — nur eine Abweichung wird gespeichert.
  // bold ist dreiwertig, weil "Beschriftung" von Haus aus fett ist und man sie auch
  // wieder normal stellen koennen muss: 0 = Vorgabe, 1 = fett, 2 = normal.
  var KINDS = {
    box:     { w: 168, h: 66,  color: "slate", label: "Schritt",      fs: 13, bold: false, align: "center" },
    sticky:  { w: 148, h: 128, color: "amber", label: "Notiz",        fs: 13, bold: false, align: "center" },
    diamond: { w: 158, h: 100, color: "mint",  label: "Entscheidung", fs: 13, bold: false, align: "center" },
    text:    { w: 220, h: 34,  color: "plain", label: "Beschriftung", fs: 17, bold: true,  align: "left" }
  };
  // Waehlbare Schriftgrade. Die Knoepfe springen von Stufe zu Stufe, damit 1-px-Schritte
  // nicht zwanzig Klicks kosten.
  var GRADE = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64];
  function schriftgrad(n) { return n.fs || KINDS[n.kind].fs; }
  function fett(n) { return n.bold === 1 ? true : n.bold === 2 ? false : KINDS[n.kind].bold; }
  function ausricht(n) { return n.align || KINDS[n.kind].align; }
  function gradStufe(v, richtung) {
    var i = 0, best = Infinity;
    for (var k = 0; k < GRADE.length; k++) {
      var d = Math.abs(GRADE[k] - v);
      if (d < best) { best = d; i = k; }
    }
    return GRADE[Math.min(GRADE.length - 1, Math.max(0, i + richtung))];
  }`);

edit("Kommentar am Datenmodell",
`  var allNodes = new Map(); // id -> {kind,x,y,w,h,text,color,z,sheet}`,
`  var allNodes = new Map(); // id -> {kind,x,y,w,h,text,color,z,sheet,fs,bold,align}`);

/* ------------------------------------------------------------ 5  putNode */
edit("putNode: Textfelder mitschreiben",
`    track(db.doc("nodes/" + id).set({
      kind: n.kind, x: n.x, y: n.y, w: n.w, h: n.h,
      text: n.text, color: n.color, z: n.z, sheet: n.sheet || HOME
    }));`,
`    track(db.doc("nodes/" + id).set({
      kind: n.kind, x: n.x, y: n.y, w: n.w, h: n.h,
      text: n.text, color: n.color, z: n.z, sheet: n.sheet || HOME,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || ""
    }));`);

/* -------------------------------------------------------- 6  renderNodes */
edit("renderNodes: Textstil anwenden",
`      t.className = "txt";
      t.textContent = n.text;
      el.appendChild(t);`,
`      t.className = "txt";
      t.textContent = n.text;
      // Immer setzen, in beide Richtungen: eine Beschriftung ist per CSS fett und
      // muss sich auch wieder normal stellen lassen. Darum die Vorgabe der Bauart
      // ueber schriftgrad/fett/ausricht und kein "nur wenn abweichend".
      t.style.fontSize = schriftgrad(n) + "px";
      t.style.fontWeight = fett(n) ? "700" : "400";
      var aus = ausricht(n);
      t.style.width = "100%";
      t.style.textAlign = aus;
      el.style.justifyContent =
        aus === "left" ? "flex-start" : aus === "right" ? "flex-end" : "center";
      el.appendChild(t);`);

/* ----------------------------------------------------- 7  renderInspector */
edit("renderInspector: Textzeile am Element zeigen",
`      $("btn-dup").style.display = "";
      $("edge-row").hidden = true;`,
`      $("btn-dup").style.display = "";
      $("edge-row").hidden = true;
      $("text-row").hidden = false;
      textFelderSetzen(n);`);

edit("renderInspector: Textzeile am Pfeil verbergen",
`      var e = edges.get(sel.id);
      $("edge-row").hidden = false;`,
`      var e = edges.get(sel.id);
      $("text-row").hidden = true;
      $("edge-row").hidden = false;`);

/* ------------------------------------------------------------- 8  addNode */
edit("addNode: Groesse darf mitkommen",
`  function addNode(kind, bx, by) {
    if (catchGesperrt()) return null;
    var d = KINDS[kind], id = uid();
    var n = {
      kind: kind, x: Math.round(bx - d.w / 2), y: Math.round(by - d.h / 2),
      w: d.w, h: d.h, text: "", color: d.color, z: topZ() + 1, sheet: activeSheet
    };`,
`  // bx/by ist die MITTE. w/h sind freiwillig: fehlen sie, kommt die Standardgroesse
  // der Bauart (einzelner Klick, Doppelklick auf leere Flaeche). Sind sie da, hat der
  // Nutzer die Groesse aufgezogen.
  function addNode(kind, bx, by, w, h) {
    if (catchGesperrt()) return null;
    var d = KINDS[kind], id = uid();
    var nw = w ? Math.max(48, Math.round(w)) : d.w;
    var nh = h ? Math.max(30, Math.round(h)) : d.h;
    var n = {
      kind: kind, x: Math.round(bx - nw / 2), y: Math.round(by - nh / 2),
      w: nw, h: nh, text: "", color: d.color, z: topZ() + 1, sheet: activeSheet,
      fs: 0, bold: 0, align: ""
    };`);

/* ------------------------------------------------- 9  Vorschau + Textknoepfe */
edit("Vorschau-Rechteck und Textknopf-Logik",
`  /* ============================ Maus ============================ */`,
`  /* ====================== Vorschau beim Aufziehen ====================== */
  function vorschauZeigen(a, b) {
    var g = $("neu-vorschau");
    if (!g) {
      g = document.createElement("div");
      g.id = "neu-vorschau";
      layer.appendChild(g);
    }
    g.style.left = Math.min(a.x, b.x) + "px";
    g.style.top = Math.min(a.y, b.y) + "px";
    g.style.width = Math.abs(b.x - a.x) + "px";
    g.style.height = Math.abs(b.y - a.y) + "px";
  }
  function vorschauWeg() {
    var g = $("neu-vorschau");
    if (g) g.remove();
  }

  /* ========================= Textknoepfe ========================= */
  // Die Knoepfe zeigen IMMER den Zustand des Elements, nie einen eigenen Merker —
  // sonst driftet die Anzeige, wenn ein Schnappschuss das Element von aussen aendert.
  function textFelderSetzen(n) {
    $("fs-val").textContent = schriftgrad(n) + " px";
    $("t-bold").setAttribute("aria-pressed", fett(n) ? "true" : "false");
    var aus = ausricht(n);
    ["left", "center", "right"].forEach(function (x) {
      $("al-" + x).setAttribute("aria-pressed", x === aus ? "true" : "false");
    });
  }
  // Aendern ist auf dem Auffang-Reiter ausdruecklich erlaubt (kein catchGesperrt):
  // der Guard gehoert nur an die Erzeuger.
  function textAendern(fn) {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n) return;
    fn(n);
    putNode(sel.id);
    render();
  }
  $("fs-minus").addEventListener("click", function () {
    textAendern(function (n) { n.fs = gradStufe(schriftgrad(n), -1); });
  });
  $("fs-plus").addEventListener("click", function () {
    textAendern(function (n) { n.fs = gradStufe(schriftgrad(n), 1); });
  });
  $("t-bold").addEventListener("click", function () {
    textAendern(function (n) { n.bold = fett(n) ? 2 : 1; });
  });
  ["left", "center", "right"].forEach(function (a) {
    $("al-" + a).addEventListener("click", function () {
      textAendern(function (n) { n.align = a; });
    });
  });

  /* ============================ Maus ============================ */`);

/* ---------------------------------------------------------- 10  mousedown */
edit("mousedown: Anlegen zieht die Groesse auf",
`    if (KINDS[tool]) {
      ev.preventDefault();
      var np = toBoard(ev.clientX, ev.clientY);
      addNode(tool, np.x, np.y);
      return;
    }`,
`    // Die Groesse wird aufgezogen (wie in Figma): mousedown merkt nur den Startpunkt,
    // erst mouseup legt an. Das Anlege-Verbot des Auffang-Reiters muss schon HIER
    // fragen, sonst zieht man ein Rechteck auf, das nichts wird.
    if (KINDS[tool]) {
      ev.preventDefault();
      if (catchGesperrt()) return;
      drag = { mode: "create", kind: tool, start: toBoard(ev.clientX, ev.clientY) };
      return;
    }`);

/* ---------------------------------------------------------- 11  mousemove */
edit("mousemove: Vorschau zeichnen",
`    if (drag.mode === "move") {
      var n = nodes.get(drag.id); if (!n) return;`,
`    if (drag.mode === "create") {
      drag.cur = p;
      vorschauZeigen(drag.start, p);
      return;
    }
    if (drag.mode === "move") {
      var n = nodes.get(drag.id); if (!n) return;`);

/* ------------------------------------------------------------ 12  mouseup */
edit("mouseup: aufgezogenes Element anlegen",
`    if (d.mode === "move" && d.moved) { putNode(d.id); render(); }`,
`    if (d.mode === "create") {
      vorschauWeg();
      var a = d.start, b = d.cur || d.start;
      var cw = Math.abs(b.x - a.x), ch = Math.abs(b.y - a.y);
      // Unter 20 Brett-Pixeln in BEIDEN Richtungen war das ein Klick und kein
      // Aufziehen: Standardgroesse, zentriert auf den Klickpunkt.
      if (cw < 20 && ch < 20) addNode(d.kind, a.x, a.y);
      else addNode(d.kind, (a.x + b.x) / 2, (a.y + b.y) / 2, cw, ch);
      abarbeiten();
      return;
    }
    if (d.mode === "move" && d.moved) { putNode(d.id); render(); }`);

/* -------------------------------------------------------------- 13  btn-dup */
edit("Duplizieren: Textfelder mitnehmen",
`    var copy = {
      kind: n.kind, x: n.x + 24, y: n.y + 24, w: n.w, h: n.h,
      text: n.text, color: n.color, z: topZ() + 1, sheet: activeSheet
    };`,
`    var copy = {
      kind: n.kind, x: n.x + 24, y: n.y + 24, w: n.w, h: n.h,
      text: n.text, color: n.color, z: topZ() + 1, sheet: activeSheet,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || ""
    };`);

/* ------------------------------------------------------------ 14  Handoff */
edit("Handoff-Nutzlast: Textfelder mitgeben",
`      out.nodes[id] = {
        kind: n.kind, x: n.x, y: n.y, w: n.w, h: n.h,
        text: n.text, color: n.color, z: n.z, sheet: reiterFuer(n.sheet)
      };`,
`      out.nodes[id] = {
        kind: n.kind, x: n.x, y: n.y, w: n.w, h: n.h,
        text: n.text, color: n.color, z: n.z, sheet: reiterFuer(n.sheet),
        fs: n.fs || 0, bold: n.bold || 0, align: n.align || ""
      };`);

/* ---------------------------------------------------------- 15  applyNodes */
edit("applyNodes: Textfelder einlesen und begrenzen",
`        z: +v.z || 0,
        sheet: typeof v.sheet === "string" && v.sheet ? v.sheet : HOME
      });`,
`        z: +v.z || 0,
        sheet: typeof v.sheet === "string" && v.sheet ? v.sheet : HOME,
        // 0 heisst "Vorgabe der Bauart". Ein fremder Schreiber darf jeden Grad setzen,
        // nicht nur die Stufen der Knoepfe — nur begrenzt wird er.
        fs: Math.max(0, Math.min(96, Math.round(+v.fs || 0))),
        bold: +v.bold === 2 ? 2 : (v.bold ? 1 : 0),
        align: v.align === "left" || v.align === "center" || v.align === "right" ? v.align : ""
      });`);

/* ================================ Lauf ================================ */
let src = fs.readFileSync(ZIEL, "utf8");

// Erst ALLE Anker pruefen. Ein einziger Fehltreffer bricht ab, ohne zu schreiben.
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
