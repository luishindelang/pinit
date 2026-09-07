/**
 * Patch 2.5 (Paket A, Teil 1): drei neue Bauarten
 *  - frame  Bildschirm-Rahmen: Titelzeile, Layout (frei/desktop/tablet/handy) waehlbar im
 *           Inspektor, liegt beim Anlegen hinter allem (Traeger fuer Bausteine).
 *  - code   Code-Kasten: Schreibmaschinenschrift, linksbuendig, keine Stichpunkt-Deutung.
 *  - start / end  Kreise fuer Ablaeufe (ohne Text, Pfeile enden am Kreisrand).
 * Zweite Werkzeugleiste #tools2 fuer die Software-Bauarten.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.5.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.4";`, `  var FASSUNG = "2.5";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: frame / code / start / end",
`  .node.table td.editing {
    outline: 2px solid var(--accent); outline-offset: -2px;
    user-select: text; cursor: text;
  }`,
`  .node.table td.editing {
    outline: 2px solid var(--accent); outline-offset: -2px;
    user-select: text; cursor: text;
  }
  /* Bildschirm-Rahmen: Titelzeile oben, Flaeche darunter leer — die Bausteine sind eigene
     Elemente, die darauf liegen (Mitnehmen beim Verschieben). Liegt hinter allem. */
  .node.frame {
    border-radius: 6px; border: 2px solid; padding: 0;
    flex-direction: column; align-items: stretch; justify-content: flex-start;
    box-shadow: none;
  }
  .node.frame .txt {
    flex: none; max-height: none; padding: 5px 10px;
    background: rgba(127,127,127,.14); border-bottom: 1px solid var(--line-strong);
  }
  .node.frame .frame-badge {
    position: absolute; top: 5px; right: 8px; pointer-events: none;
    font: 500 9.5px "IBM Plex Mono", monospace; letter-spacing: .08em; text-transform: uppercase;
    color: var(--ink-3);
  }
  /* Code-Kasten: Schreibmaschinenschrift, Zeilen bleiben wie getippt. */
  .node.code {
    border-radius: 4px; border: 1.5px solid; border-left-width: 4px;
    align-items: flex-start; justify-content: flex-start; padding: 8px 10px;
  }
  .node.code .txt {
    font-family: "IBM Plex Mono", ui-monospace, monospace; text-align: left;
    white-space: pre; overflow: auto; max-height: 100%;
  }
  /* Start (voller Kreis) und Ende (Doppelring) fuer Ablaeufe. Kein Text. */
  .node.start, .node.end { border-radius: 50%; border: 2px solid; padding: 0; box-shadow: none; }
  .node.start { background: var(--edge) !important; border-color: var(--edge) !important; }
  .node.end { background: var(--surface) !important; border: 3px solid var(--edge) !important;
    box-shadow: inset 0 0 0 3px var(--surface), inset 0 0 0 12px var(--edge); }
  .node.start .txt, .node.end .txt { display: none; }
  .node.start.sel, .node.end.sel { box-shadow: 0 0 0 2px var(--accent); }
  .node.end.sel { box-shadow: 0 0 0 2px var(--accent), inset 0 0 0 3px var(--surface), inset 0 0 0 12px var(--edge); }`);

/* ---------------------------------------------------------------- Markup */
edit("Markup: zweite Werkzeugleiste",
`    <div class="rail" id="tools" role="group" aria-label="Werkzeuge"></div>`,
`    <div class="rail" id="tools" role="group" aria-label="Werkzeuge"></div>
    <div class="rail" id="tools2" role="group" aria-label="Software-Bauarten"></div>`);

edit("Inspektor: Layout-Zeile fuer Rahmen",
`      <div class="insp-field" id="tbl-row" hidden>`,
`      <div class="insp-field" id="frame-row" hidden>
        <label>Layout</label>
        <div class="tgrp">
          <button data-layout="frei" title="Größe wie gezogen">frei</button>
          <button data-layout="desktop" title="960 × 600">Desktop</button>
        </div>
        <div class="tgrp">
          <button data-layout="tablet" title="600 × 800">Tablet</button>
          <button data-layout="handy" title="360 × 640">Handy</button>
        </div>
      </div>
      <div class="insp-field" id="tbl-row" hidden>`);

/* ---------------------------------------------------------------- Modell */
edit("KINDS: frame / code / start / end",
`    table:   { w: 320, h: 150, color: "plain", label: "Tabelle",      fs: 12, bold: true,  align: "left" }`,
`    table:   { w: 320, h: 150, color: "plain", label: "Tabelle",      fs: 12, bold: true,  align: "left" },
    // Paket A (seit 2.5): Software skizzieren.
    frame:   { w: 480, h: 320, color: "plain", label: "Bildschirm",   fs: 13, bold: true,  align: "left" },
    code:    { w: 260, h: 120, color: "plain", label: "Code",         fs: 12, bold: false, align: "left" },
    start:   { w: 40,  h: 40,  color: "slate", label: "Start",        fs: 13, bold: false, align: "center" },
    end:     { w: 40,  h: 40,  color: "slate", label: "Ende",         fs: 13, bold: false, align: "center" }`);

edit("Layout-Vorgaben",
`  var TBL_MAX_ZEILEN = 20, TBL_MAX_SPALTEN = 10, TBL_MAX_ZELLE = 200;`,
`  var TBL_MAX_ZEILEN = 20, TBL_MAX_SPALTEN = 10, TBL_MAX_ZELLE = 200;
  // Bildschirm-Rahmen: gewaehltes Layout setzt die Groesse einmal, danach frei veraenderbar.
  var LAYOUTS = { frei: null, desktop: [960, 600], tablet: [600, 800], handy: [360, 640] };
  function layoutLesen(v) { return Object.prototype.hasOwnProperty.call(LAYOUTS, v) ? v : "frei"; }
  function ohneText(n) { return n.kind === "start" || n.kind === "end"; }`);

/* ------------------------------------------------------------- Geometrie */
edit("border: Kreis",
`    if (n.kind === "diamond") {
      var d = Math.abs(dx) / hw + Math.abs(dy) / hh;
      t = d > 0 ? 1 / d : 0;
    } else {`,
`    if (n.kind === "diamond") {
      var d = Math.abs(dx) / hw + Math.abs(dy) / hh;
      t = d > 0 ? 1 / d : 0;
    } else if (ohneText(n)) {
      // Ellipse (Start/Ende sind Kreise, koennen aber gezogen werden)
      var q = Math.sqrt((dx * dx) / (hw * hw) + (dy * dy) / (hh * hh));
      t = q > 0 ? 1 / q : 0;
    } else {`);

/* --------------------------------------------------------------- putNode */
edit("putNode: layout",
`    if (n.kind === "table") d.cells = zellenKopie(n.cells);
    track(db.doc("nodes/" + id).set(d));`,
`    if (n.kind === "table") d.cells = zellenKopie(n.cells);
    if (n.kind === "frame") d.layout = n.layout || "frei";
    track(db.doc("nodes/" + id).set(d));`);

/* ----------------------------------------------------------- renderNodes */
edit("renderNodes: Code ohne Stichpunkte",
`      var t = document.createElement("div");
      t.className = "txt";
      textFuellen(t, n.text);`,
`      var t = document.createElement("div");
      t.className = "txt";
      if (n.kind === "code") t.textContent = n.text; else textFuellen(t, n.text);`);

edit("renderNodes: Rahmen-Abzeichen",
`      if (n.kind === "table") {
        el.style.justifyContent = "flex-start";
        el.appendChild(tabelleBauen(n));
      }`,
`      if (n.kind === "table") {
        el.style.justifyContent = "flex-start";
        el.appendChild(tabelleBauen(n));
      }
      if (n.kind === "frame") {
        el.style.justifyContent = "flex-start";
        if (n.layout && n.layout !== "frei") {
          var badge = document.createElement("div");
          badge.className = "frame-badge";
          badge.textContent = n.layout;
          el.appendChild(badge);
        }
      }`);

/* ------------------------------------------------------------ Inspektor */
edit("renderInspector: Layout-Zeile",
`      $("tbl-row").hidden = n.kind !== "table";`,
`      $("tbl-row").hidden = n.kind !== "table";
      $("frame-row").hidden = n.kind !== "frame";
      if (n.kind === "frame") {
        var lb = $("frame-row").querySelectorAll("button[data-layout]");
        for (var li = 0; li < lb.length; li++) {
          lb[li].setAttribute("aria-pressed", lb[li].dataset.layout === (n.layout || "frei") ? "true" : "false");
        }
      }
      $("text-row").hidden = ohneText(n);`);
edit("renderInspector: Layout-Zeile verbergen (Sammel + Pfeil)",
`      $("tbl-row").hidden = true;`,
`      $("tbl-row").hidden = true;
      $("frame-row").hidden = true;`, true);

/* ------------------------------------------------------------ Bearbeiten */
edit("addNode: Vorgaben je Bauart",
`    if (kind === "table") { n.text = "Tabelle"; n.cells = tabelleLeer(); }`,
`    if (kind === "table") { n.text = "Tabelle"; n.cells = tabelleLeer(); }
    // Ein Rahmen ist Traeger: er kommt HINTER alles, damit Bausteine darauf mitgehen.
    if (kind === "frame") { n.text = "Bildschirm"; n.layout = "frei"; n.z = bottomZ() - 1; }
    if (kind === "code") n.text = "// Beispiel\\n{ }";`);

edit("addNode: Start/Ende ohne Texteingabe",
`    putNode(id);
    render();
    beginEdit(id);
    setTool("select");
    return id;`,
`    putNode(id);
    render();
    if (!ohneText(n)) beginEdit(id);
    setTool("select");
    return id;`);

edit("oeffneZumTippen: Start/Ende nicht",
`    if (!nodes.has(id)) return;
    selSet.clear(); selEdges.clear();
    sel = { type: "node", id: id };
    render();
    if (r >= 0) beginCellEdit(id, r, c); else beginEdit(id);`,
`    if (!nodes.has(id)) return;
    if (ohneText(nodes.get(id))) return;
    selSet.clear(); selEdges.clear();
    sel = { type: "node", id: id };
    render();
    if (r >= 0) beginCellEdit(id, r, c); else beginEdit(id);`);

/* ------------------------------------------------------------- Werkzeuge */
edit("TOOLS: zweite Leiste",
`    { id: "link", key: "A", label: "Pfeil",
      svg: '<path d="M4 20L20 4M13 4h7v7"/>' }
  ];`,
`    { id: "link", key: "A", label: "Pfeil",
      svg: '<path d="M4 20L20 4M13 4h7v7"/>' },
    // Zweite Leiste: Software skizzieren (Paket A).
    { id: "frame", key: "R", label: "Rahmen", rail: 2,
      svg: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>' },
    { id: "code", key: "C", label: "Code", rail: 2,
      svg: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 5l-2 14"/>' },
    { id: "start", key: "1", label: "Start", rail: 2,
      svg: '<circle cx="12" cy="12" r="8" fill="currentColor"/>' },
    { id: "end", key: "0", label: "Ende", rail: 2,
      svg: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5" fill="currentColor"/>' }
  ];`);

edit("TOOLS.forEach: Leiste waehlen",
`    b.addEventListener("click", function () { setTool(t.id); });
    $("tools").appendChild(b);
  });`,
`    b.addEventListener("click", function () { setTool(t.id); });
    $(t.rail === 2 ? "tools2" : "tools").appendChild(b);
  });`);

edit("setTool: beide Leisten",
`    var bs = $("tools").children;
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute("aria-pressed", bs[i].dataset.tool === t ? "true" : "false");
    }`,
`    var bs = document.querySelectorAll("#tools button, #tools2 button");
    for (var i = 0; i < bs.length; i++) {
      bs[i].setAttribute("aria-pressed", bs[i].dataset.tool === t ? "true" : "false");
    }`);

edit("Tastatur: Kuerzel R C 1 0",
`    var map = { v: "select", h: "hand", b: "box", s: "sticky", d: "diamond", t: "text", g: "table", a: "link" };`,
`    var map = { v: "select", h: "hand", b: "box", s: "sticky", d: "diamond", t: "text", g: "table", a: "link",
                r: "frame", c: "code", "1": "start", "0": "end" };`);

/* ---------------------------------------------------------------- Knoepfe */
edit("Layout-Knoepfe",
`  function tabelleAendern(fn) {`,
`  // Layout eines Rahmens: setzt die Groesse einmal, danach ist sie frei.
  var layoutKnoepfe = $("frame-row").querySelectorAll("button[data-layout]");
  for (var lk = 0; lk < layoutKnoepfe.length; lk++) {
    layoutKnoepfe[lk].addEventListener("click", function () {
      if (!sel || sel.type !== "node") return;
      var n = nodes.get(sel.id); if (!n || n.kind !== "frame") return;
      var l = layoutLesen(this.dataset.layout);
      n.layout = l;
      if (LAYOUTS[l]) { n.w = LAYOUTS[l][0]; n.h = LAYOUTS[l][1]; }
      putNode(sel.id); render();
    });
  }

  function tabelleAendern(fn) {`);

edit("Duplizieren: layout",
`    if (n.kind === "table") copy.cells = zellenKopie(n.cells);
    allNodes.set(id, copy);`,
`    if (n.kind === "table") copy.cells = zellenKopie(n.cells);
    if (n.kind === "frame") copy.layout = n.layout || "frei";
    allNodes.set(id, copy);`);

edit("Handoff: layout",
`      if (n.kind === "table") out.nodes[id].cells = zellenKopie(n.cells);`,
`      if (n.kind === "table") out.nodes[id].cells = zellenKopie(n.cells);
      if (n.kind === "frame") out.nodes[id].layout = n.layout || "frei";`);

edit("Diagramm-Text: Kreise, Rahmen/Code auslassen",
`      if (n.kind === "text" || n.kind === "table") return;
      i++;
      var key = "n" + i;
      num.set(id, key);
      var label = (n.text || KINDS[n.kind].label).replace(/["\\n]/g, " ").trim();
      if (n.kind === "diamond") lines.push("  " + key + '{"' + label + '"}');`,
`      if (n.kind === "text" || n.kind === "table" || n.kind === "frame" || n.kind === "code") return;
      i++;
      var key = "n" + i;
      num.set(id, key);
      var label = (n.text || KINDS[n.kind].label).replace(/["\\n]/g, " ").trim();
      if (ohneText(n)) lines.push("  " + key + '(("' + KINDS[n.kind].label + '"))');
      else if (n.kind === "diamond") lines.push("  " + key + '{"' + label + '"}');`);

/* ------------------------------------------------------------- Datenbank */
edit("applyNodes: layout",
`        cells: v.kind === "table" ? zellenLesen(v.cells) : undefined`,
`        cells: v.kind === "table" ? zellenLesen(v.cells) : undefined,
        layout: v.kind === "frame" ? layoutLesen(v.layout) : undefined`);

edit("Kurzhilfe",
`Tabelle: G, Doppelklick in eine Zelle, Tab springt weiter · `,
`Tabelle: G, Doppelklick in eine Zelle, Tab springt weiter · Rahmen R (Layout im Inspektor), Code C, Start 1, Ende 0 · `);

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
