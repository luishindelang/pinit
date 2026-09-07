/**
 * Patch 2.3: Tabelle als fuenfte Bauart (`kind: "table"`, Ueberschrift in `text`, Zellen im
 * neuen Feld `cells` = Array von Zeilen aus Strings, erste Zeile = Kopfzeile) und
 * Stichpunkte: Zeilen, die mit "- " oder "* " beginnen, werden als Punkt gezeigt.
 * Anker werden sequentiell auf einer Kopie geprueft (wie patch-2.2.js).
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.3.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.2";`, `  var FASSUNG = "2.3";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: Tabelle + Stichpunkte",
`  .node.text.sel { box-shadow: 0 0 0 2px var(--accent); }`,
`  .node.text.sel { box-shadow: 0 0 0 2px var(--accent); }
  /* Stichpunkte: eine Zeile je Block, Punktzeilen mit haengendem Einzug. */
  .node .txt .zl { display: block; min-height: 1.35em; }
  .node .txt .li { display: block; padding-left: 1.1em; text-indent: -1.1em; text-align: left; }
  /* Tabelle: Titelzeile (.txt) oben, darunter das Gitter. Erste Zeile ist die Kopfzeile. */
  .node.table {
    border-radius: 4px; border: 1.5px solid; padding: 0;
    flex-direction: column; align-items: stretch; justify-content: flex-start;
  }
  .node.table .txt {
    flex: none; max-height: none; padding: 6px 8px 4px;
    border-bottom: 1px solid var(--line-strong);
  }
  .node.table table.tbl { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .node.table td {
    border: 1px solid var(--line); padding: 3px 6px; vertical-align: top;
    overflow-wrap: anywhere; white-space: pre-wrap; text-align: left; min-height: 1.4em;
  }
  .node.table tr:first-child td { font-weight: 600; background: rgba(127,127,127,.12); }
  .node.table td.editing {
    outline: 2px solid var(--accent); outline-offset: -2px;
    user-select: text; cursor: text;
  }`);

/* ------------------------------------------------------------ Inspektor */
edit("Inspektor: Tabellen-Knoepfe",
`      <div class="insp-field" id="edge-row" hidden>`,
`      <div class="insp-field" id="tbl-row" hidden>
        <label>Tabelle</label>
        <div class="tgrp">
          <button id="tbl-row-plus" title="Zeile anhängen">+ Zeile</button>
          <button id="tbl-row-minus" title="Letzte Zeile entfernen">− Zeile</button>
        </div>
        <div class="tgrp">
          <button id="tbl-col-plus" title="Spalte anhängen">+ Spalte</button>
          <button id="tbl-col-minus" title="Letzte Spalte entfernen">− Spalte</button>
        </div>
      </div>
      <div class="insp-field" id="edge-row" hidden>`);

/* ---------------------------------------------------------------- Modell */
edit("KINDS: table",
`    text:    { w: 220, h: 34,  color: "plain", label: "Beschriftung", fs: 17, bold: true,  align: "left" }`,
`    text:    { w: 220, h: 34,  color: "plain", label: "Beschriftung", fs: 17, bold: true,  align: "left" },
    // Tabelle (seit 2.3): \`text\` ist die Ueberschrift, die Zellen liegen in \`cells\`
    // (Array von Zeilen aus Strings, erste Zeile = Kopfzeile). Bretter aus aelteren
    // Fassungen kennen die Bauart nicht und lassen das Element einfach weg.
    table:   { w: 320, h: 150, color: "plain", label: "Tabelle",      fs: 12, bold: true,  align: "left" }`);

edit("Zellen-Helfer nach gradStufe",
`  var COLORS = ["slate", "amber", "mint", "rose", "lilac", "plain"];`,
`  var COLORS = ["slate", "amber", "mint", "rose", "lilac", "plain"];

  var TBL_MAX_ZEILEN = 20, TBL_MAX_SPALTEN = 10, TBL_MAX_ZELLE = 200;
  function tabelleLeer() { return [["Spalte 1", "Spalte 2"], ["", ""], ["", ""]]; }
  function zellenKopie(c) { return (c || tabelleLeer()).map(function (r) { return r.slice(); }); }
  // Fremde Schreiber duerfen jede Form liefern — hier wird sie rechteckig, begrenzt, String.
  function zellenLesen(v) {
    if (!Array.isArray(v) || !v.length || !Array.isArray(v[0])) return tabelleLeer();
    var cols = Math.max(1, Math.min(TBL_MAX_SPALTEN, v[0].length));
    var out = [];
    for (var r = 0; r < Math.min(TBL_MAX_ZEILEN, v.length); r++) {
      var row = Array.isArray(v[r]) ? v[r] : [];
      var zeile = [];
      for (var c = 0; c < cols; c++) {
        zeile.push(typeof row[c] === "string" ? row[c].slice(0, TBL_MAX_ZELLE) : "");
      }
      out.push(zeile);
    }
    return out;
  }`);

/* --------------------------------------------------------------- putNode */
edit("putNode: cells bei Tabellen",
`  function putNode(id) {
    var n = nodes.get(id); if (!n || !db) return;
    track(db.doc("nodes/" + id).set({
      kind: n.kind, x: n.x, y: n.y, w: n.w, h: n.h,
      text: n.text, color: n.color, z: n.z, sheet: n.sheet || HOME,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || "",
      note: n.note || ""
    }));
  }`,
`  function putNode(id) {
    var n = nodes.get(id); if (!n || !db) return;
    var d = {
      kind: n.kind, x: n.x, y: n.y, w: n.w, h: n.h,
      text: n.text, color: n.color, z: n.z, sheet: n.sheet || HOME,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || "",
      note: n.note || ""
    };
    if (n.kind === "table") d.cells = zellenKopie(n.cells);
    track(db.doc("nodes/" + id).set(d));
  }`);

/* ----------------------------------------------------------- renderNodes */
edit("renderNodes: Stichpunkte + Tabelle",
`      var t = document.createElement("div");
      t.className = "txt";
      t.textContent = n.text;`,
`      var t = document.createElement("div");
      t.className = "txt";
      textFuellen(t, n.text);`);

edit("renderNodes: Tabelle anhaengen",
`      el.style.justifyContent =
        aus === "left" ? "flex-start" : aus === "right" ? "flex-end" : "center";
      el.appendChild(t);`,
`      el.style.justifyContent =
        aus === "left" ? "flex-start" : aus === "right" ? "flex-end" : "center";
      el.appendChild(t);
      if (n.kind === "table") {
        el.style.justifyContent = "flex-start";
        el.appendChild(tabelleBauen(n));
      }`);

edit("Helfer textFuellen + tabelleBauen vor renderNodes",
`  function renderNodes() {`,
`  // Stichpunkte: Zeilen, die mit "- ", "* " oder "• " beginnen, werden als Punkt mit
  // haengendem Einzug gezeigt. Gespeichert bleibt der rohe Text (beginEdit setzt ihn
  // vor dem Tippen wieder ein) — so bleibt das Datenschema reiner Text.
  var LI = /^\\s*[-*\\u2022]\\s+(.*)$/;
  function textFuellen(t, text) {
    var zeilen = (text || "").split("\\n");
    var hat = zeilen.some(function (z) { return LI.test(z); });
    if (!hat) { t.textContent = text; return; }
    while (t.firstChild) t.removeChild(t.firstChild);
    zeilen.forEach(function (z) {
      var d = document.createElement("span");
      var m = LI.exec(z);
      if (m) { d.className = "zl li"; d.textContent = "\\u2022 " + m[1]; }
      else { d.className = "zl"; d.textContent = z; }
      t.appendChild(d);
    });
  }
  function tabelleBauen(n) {
    var tb = document.createElement("table");
    tb.className = "tbl";
    tb.style.fontSize = schriftgrad(n) + "px";
    var cells = n.cells || tabelleLeer();
    cells.forEach(function (row, r) {
      var tr = document.createElement("tr");
      row.forEach(function (val, c) {
        var td = document.createElement("td");
        td.dataset.r = r; td.dataset.c = c;
        td.textContent = val;
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    return tb;
  }

  function renderNodes() {`);

/* ------------------------------------------------------------ Inspektor */
edit("renderInspector: Tabellen-Zeile zeigen",
`      $("note-row").hidden = false;
      textFelderSetzen(n);`,
`      $("note-row").hidden = false;
      $("tbl-row").hidden = n.kind !== "table";
      textFelderSetzen(n);`);
edit("renderInspector: Tabellen-Zeile verbergen (Sammel + Pfeil)",
`      $("note-row").hidden = true;`,
`      $("note-row").hidden = true;
      $("tbl-row").hidden = true;`, true);

/* ------------------------------------------------------------ Bearbeiten */
edit("addNode: Tabelle mit Ueberschrift und Zellen",
`      w: nw, h: nh, text: "", color: d.color, z: topZ() + 1, sheet: activeSheet,
      fs: 0, bold: 0, align: ""
    };
    allNodes.set(id, n);`,
`      w: nw, h: nh, text: "", color: d.color, z: topZ() + 1, sheet: activeSheet,
      fs: 0, bold: 0, align: ""
    };
    if (kind === "table") { n.text = "Tabelle"; n.cells = tabelleLeer(); }
    allNodes.set(id, n);`);

edit("beginEdit: rohen Text einsetzen",
`    var t = el.querySelector(".txt");
    t.contentEditable = "plaintext-only";
    if (t.contentEditable !== "plaintext-only") t.contentEditable = "true";`,
`    var t = el.querySelector(".txt");
    t.textContent = n.text;   // roh, ohne Stichpunkt-Darstellung
    t.contentEditable = "plaintext-only";
    if (t.contentEditable !== "plaintext-only") t.contentEditable = "true";`);

edit("beginCellEdit nach beginEdit",
`  function editEdgeLabel(id) {`,
`  // Zelle einer Tabelle tippen. Gleiche Bauweise wie beginEdit: editing gesetzt
  // (Schnappschuesse warten), Fokus per setTimeout, finish raeumt auf. Tab springt
  // zur naechsten Zelle, Enter schliesst ab, Esc verwirft.
  function beginCellEdit(id, r, c) {
    var el = layer.querySelector('.node[data-id="' + id + '"]');
    if (!el) return;
    var n = nodes.get(id);
    if (!n || n.kind !== "table" || !n.cells || !n.cells[r]) return;
    var td = el.querySelector('td[data-r="' + r + '"][data-c="' + c + '"]');
    if (!td) return;
    editing = { id: id, zelle: [r, c], before: n.cells[r][c] || "" };
    el.classList.add("editing");
    td.classList.add("editing");
    td.contentEditable = "plaintext-only";
    if (td.contentEditable !== "plaintext-only") td.contentEditable = "true";

    setTimeout(function () {
      if (!editing || editing.id !== id || !td.isConnected) { editing = null; abarbeiten(); return; }
      td.focus();
      var rg = document.createRange();
      rg.selectNodeContents(td);
      var s = window.getSelection();
      s.removeAllRanges(); s.addRange(rg);
      td.addEventListener("blur", onBlur);
      td.addEventListener("keydown", onKey);
    }, 0);

    function finish(keep, weiter) {
      if (!editing || editing.id !== id || !editing.zelle) return;
      td.removeEventListener("blur", onBlur);
      td.removeEventListener("keydown", onKey);
      var txt = (keep ? td.innerText : editing.before)
        .replace(/\\u00a0/g, " ").replace(/\\s+$/, "").slice(0, TBL_MAX_ZELLE);
      editing = null;
      td.contentEditable = "false";
      td.classList.remove("editing");
      el.classList.remove("editing");
      var nn = nodes.get(id);
      if (nn && nn.cells && nn.cells[r] && nn.cells[r][c] !== txt) { nn.cells[r][c] = txt; putNode(id); }
      render();
      abarbeiten();
      if (weiter && nn && nn.cells) {
        var cols = nn.cells[0].length, nc = c + 1, nr = r;
        if (nc >= cols) { nc = 0; nr++; }
        if (nr < nn.cells.length) beginCellEdit(id, nr, nc);
      }
    }
    function onBlur() { finish(true); }
    function onKey(ev) {
      if (ev.key === "Escape") { ev.preventDefault(); finish(false); }
      else if (ev.key === "Tab") { ev.preventDefault(); finish(true, true); }
      else if (ev.key === "Enter" && !ev.shiftKey) { ev.preventDefault(); finish(true); }
      ev.stopPropagation();
    }
  }

  function editEdgeLabel(id) {`);

/* ------------------------------------------------------------- Werkzeuge */
edit("TOOLS: Tabelle",
`    { id: "link", key: "A", label: "Pfeil",`,
`    { id: "table", key: "G", label: "Tabelle",
      svg: '<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 10h18M9 4v16M15 4v16"/>' },
    { id: "link", key: "A", label: "Pfeil",`);

edit("Tastatur: Kuerzel G",
`    var map = { v: "select", h: "hand", b: "box", s: "sticky", d: "diamond", t: "text", a: "link" };`,
`    var map = { v: "select", h: "hand", b: "box", s: "sticky", d: "diamond", t: "text", g: "table", a: "link" };`);

/* ---------------------------------------------------------------- Maus */
edit("dblclick: Zelle tippen",
`      selSet.clear(); selEdges.clear();
      sel = { type: "node", id: nodeEl.dataset.id };
      render();
      beginEdit(nodeEl.dataset.id);
      return;`,
`      selSet.clear(); selEdges.clear();
      sel = { type: "node", id: nodeEl.dataset.id };
      var td = ev.target.closest ? ev.target.closest("td") : null;
      render();
      if (td && td.dataset.r !== undefined) { beginCellEdit(nodeEl.dataset.id, +td.dataset.r, +td.dataset.c); return; }
      beginEdit(nodeEl.dataset.id);
      return;`);

/* ---------------------------------------------------------------- Knoepfe */
edit("Tabellen-Knoepfe",
`  $("btn-back").addEventListener("click", function () {`,
`  // Tabelle: Zeilen/Spalten anhaengen oder die letzte entfernen. Wirkt nur auf eine
  // einzeln gewaehlte Tabelle; Inhalte der entfernten Zeile/Spalte gehen verloren
  // (bewusst ohne Nachfrage — es ist nur der Rand, und Duplizieren sichert vorher).
  function tabelleAendern(fn) {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n || n.kind !== "table") return;
    if (!n.cells) n.cells = tabelleLeer();
    if (fn(n) === false) return;
    putNode(sel.id); render();
  }
  $("tbl-row-plus").addEventListener("click", function () {
    tabelleAendern(function (n) {
      if (n.cells.length >= TBL_MAX_ZEILEN) { toast("Höchstens " + TBL_MAX_ZEILEN + " Zeilen."); return false; }
      n.cells.push(n.cells[0].map(function () { return ""; }));
    });
  });
  $("tbl-row-minus").addEventListener("click", function () {
    tabelleAendern(function (n) {
      if (n.cells.length <= 1) { toast("Die Kopfzeile bleibt."); return false; }
      n.cells.pop();
    });
  });
  $("tbl-col-plus").addEventListener("click", function () {
    tabelleAendern(function (n) {
      if (n.cells[0].length >= TBL_MAX_SPALTEN) { toast("Höchstens " + TBL_MAX_SPALTEN + " Spalten."); return false; }
      n.cells.forEach(function (r) { r.push(""); });
    });
  });
  $("tbl-col-minus").addEventListener("click", function () {
    tabelleAendern(function (n) {
      if (n.cells[0].length <= 1) { toast("Eine Spalte bleibt."); return false; }
      n.cells.forEach(function (r) { r.pop(); });
    });
  });

  $("btn-back").addEventListener("click", function () {`);

edit("Duplizieren: cells kopieren",
`    allNodes.set(id, copy);
    nodes.set(id, copy);`,
`    if (n.kind === "table") copy.cells = zellenKopie(n.cells);
    allNodes.set(id, copy);
    nodes.set(id, copy);`);

edit("Handoff: cells mitgeben",
`        note: n.note || ""
      };
    });
    allEdges.forEach(function (e, id) {`,
`        note: n.note || ""
      };
      if (n.kind === "table") out.nodes[id].cells = zellenKopie(n.cells);
    });
    allEdges.forEach(function (e, id) {`);

edit("Diagramm-Text: Tabellen auslassen",
`      if (n.kind === "text") return;`,
`      if (n.kind === "text" || n.kind === "table") return;`);

edit("Kurzhilfe",
`Pfeil: A, von Kasten zu Kasten ziehen · `,
`Pfeil: A, von Kasten zu Kasten ziehen · Tabelle: G, Doppelklick in eine Zelle, Tab springt weiter · Stichpunkte: Zeile mit „- “ beginnen · `);

/* ------------------------------------------------------------- Datenbank */
edit("applyNodes: cells einlesen",
`        note: typeof v.note === "string" ? v.note.slice(0, 4000) : ""
      });`,
`        note: typeof v.note === "string" ? v.note.slice(0, 4000) : "",
        cells: v.kind === "table" ? zellenLesen(v.cells) : undefined
      });`);

/* ================================ Lauf ================================ */
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
/* Nachtrag (im selben Zug, vor der Veroeffentlichung von 2.3): die drei Fokus-Zeitgeber in
 * beginEdit / beginCellEdit / renameSheet raeumen nur noch den EIGENEN Merker auf. Vorher
 * loeschte ein alter Zeitgeber den Merker eines neuen Vorgangs (Doppelklick auf B, bevor
 * der Zeitgeber von A feuerte) — B bekam dann nie Blur/Tasten. Direkt per node -e
 * eingespielt, Anker siehe Sitzungsprotokoll 2026-09-07. */
