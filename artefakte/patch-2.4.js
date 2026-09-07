/**
 * Patch 2.4 (Teil 2; Teil 1 war die td-Mindesthoehe per node -e):
 *  - Eigene Doppelklick-Erkennung im mousedown: der erste Klick baut per render() die
 *    Elemente neu, der zweite trifft ein anderes DOM-Element -> der Browser erzeugt KEIN
 *    dblclick. Real gemessen 2026-09-07 (mousedown/mouseup auf TD, kein click, kein dblclick).
 *  - focus({preventScroll:true}) an den drei Fokus-Stellen: focus() hat den body um 219 px
 *    verschoben.
 *  - Inspektor: Textfeld fuer den Tabellen-Inhalt (eine Zeile je Zeile, Spalten mit |).
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.4.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Modell: letzterKlick",
`  var selEdges = new Set();  // Pfeile der Mehrfachauswahl (seit 2.2)`,
`  var selEdges = new Set();  // Pfeile der Mehrfachauswahl (seit 2.2)
  // Eigene Doppelklick-Erkennung (seit 2.4): der erste Klick auf ein Element ruft render()
  // und baut alle .node/.wire-svg neu — der zweite Klick trifft damit ein ANDERES
  // DOM-Element, und der Browser erzeugt weder click noch dblclick (real gemessen). Darum
  // merkt sich mousedown den letzten Treffer und erkennt den zweiten selbst.
  var letzterKlick = null;   // {t, typ, id}`);

edit("focus ohne Scrollen: Reitername", `      lbl.focus();`, `      lbl.focus({ preventScroll: true });`);
edit("focus ohne Scrollen: Text", `      t.focus();`, `      t.focus({ preventScroll: true });`);
edit("focus ohne Scrollen: Zelle", `      td.focus();`, `      td.focus({ preventScroll: true });`);

edit("Inspektor: Inhalts-Textfeld der Tabelle",
`          <button id="tbl-col-minus" title="Letzte Spalte entfernen">− Spalte</button>
        </div>
      </div>`,
`          <button id="tbl-col-minus" title="Letzte Spalte entfernen">− Spalte</button>
        </div>
        <label for="tbl-text">Inhalt — eine Zeile je Zeile, Spalten mit |</label>
        <textarea id="tbl-text" placeholder="Spalte 1 | Spalte 2&#10;Wert | Wert" spellcheck="false"></textarea>
      </div>`);

edit("renderInspector: Inhalts-Textfeld fuellen",
`      $("tbl-row").hidden = n.kind !== "table";`,
`      $("tbl-row").hidden = n.kind !== "table";
      if (n.kind === "table") {
        var tf = $("tbl-text");
        if (document.activeElement !== tf) tf.value = zellenAlsText(n.cells);
      }`);

edit("Tabellen-Inhalt: Text <-> Zellen + Handler",
`  function tabelleAendern(fn) {`,
`  // Der Tabellen-Inhalt als Text: eine Zeile je Zeile, Spalten mit " | ". Der bequeme Weg,
  // eine Tabelle zu fuellen, ohne jede Zelle einzeln anzuklicken.
  function zellenAlsText(cells) {
    return (cells || tabelleLeer()).map(function (r) { return r.join(" | "); }).join("\\n");
  }
  function textAlsZellen(s) {
    var zeilen = s.replace(/\\r\\n?/g, "\\n").split("\\n");
    while (zeilen.length && !zeilen[zeilen.length - 1].trim()) zeilen.pop();
    if (!zeilen.length) return tabelleLeer();
    var rows = zeilen.slice(0, TBL_MAX_ZEILEN).map(function (z) {
      return z.split("|").map(function (c) { return c.trim().slice(0, TBL_MAX_ZELLE); });
    });
    var cols = Math.max(1, Math.min(TBL_MAX_SPALTEN, Math.max.apply(null, rows.map(function (r) { return r.length; }))));
    return rows.map(function (r) {
      r = r.slice(0, cols);
      while (r.length < cols) r.push("");
      return r;
    });
  }
  var tblText = $("tbl-text");
  function commitTblText() {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n || n.kind !== "table") return;
    var neu = textAlsZellen(tblText.value);
    if (JSON.stringify(neu) === JSON.stringify(n.cells || tabelleLeer())) return;
    n.cells = neu;
    putNode(sel.id);
    render();
  }
  tblText.addEventListener("change", commitTblText);
  tblText.addEventListener("keydown", function (ev) {
    ev.stopPropagation();
    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); commitTblText(); tblText.blur(); }
    else if (ev.key === "Escape") {
      ev.preventDefault();
      var n = sel && sel.type === "node" ? nodes.get(sel.id) : null;
      tblText.value = n && n.kind === "table" ? zellenAlsText(n.cells) : "";
      tblText.blur();
    }
  });

  function tabelleAendern(fn) {`);

edit("mousedown: Doppelklick selbst erkennen",
`    var wireEl = ev.target.closest ? ev.target.closest("g.wire") : null;

    if (editing && (!nodeEl || nodeEl.dataset.id !== editing.id)) {`,
`    var wireEl = ev.target.closest ? ev.target.closest("g.wire") : null;

    // Doppelklick selbst erkennen (s. letzterKlick): zweiter Klick auf dasselbe Element
    // innerhalb von 400 ms, mit Auswaehlen-Werkzeug -> zum Tippen oeffnen, kein Ziehen.
    var jetzt = Date.now();
    var ziel = grip ? null
      : nodeEl ? { typ: "node", id: nodeEl.dataset.id, td: ev.target.closest ? ev.target.closest("td") : null }
      : wireEl ? { typ: "edge", id: wireEl.dataset.edge } : null;
    if (ziel && tool === "select" && letzterKlick && jetzt - letzterKlick.t < 400 &&
        letzterKlick.typ === ziel.typ && letzterKlick.id === ziel.id) {
      letzterKlick = null;
      ev.preventDefault();
      oeffneZumTippen(ziel.typ, ziel.id, ziel.td);
      return;
    }
    letzterKlick = ziel ? { t: jetzt, typ: ziel.typ, id: ziel.id } : null;

    if (editing && (!nodeEl || nodeEl.dataset.id !== editing.id)) {`);

edit("dblclick: ueber oeffneZumTippen",
`    var nodeEl = ev.target.closest ? ev.target.closest(".node") : null;
    if (nodeEl) {
      ev.preventDefault();
      selSet.clear(); selEdges.clear();
      sel = { type: "node", id: nodeEl.dataset.id };
      var td = ev.target.closest ? ev.target.closest("td") : null;
      render();
      if (td && td.dataset.r !== undefined) { beginCellEdit(nodeEl.dataset.id, +td.dataset.r, +td.dataset.c); return; }
      beginEdit(nodeEl.dataset.id);
      return;
    }
    var wireEl = ev.target.closest ? ev.target.closest("g.wire") : null;
    if (wireEl) { ev.preventDefault(); editEdgeLabel(wireEl.dataset.edge); return; }`,
`    // Falls der Browser doch ein dblclick liefert (Element wurde nicht neu gebaut), laeuft
    // es ueber denselben Weg wie die eigene Erkennung; oeffneZumTippen ist doppelt-sicher.
    var nodeEl = ev.target.closest ? ev.target.closest(".node") : null;
    if (nodeEl) {
      ev.preventDefault();
      oeffneZumTippen("node", nodeEl.dataset.id, ev.target.closest ? ev.target.closest("td") : null);
      return;
    }
    var wireEl = ev.target.closest ? ev.target.closest("g.wire") : null;
    if (wireEl) { ev.preventDefault(); oeffneZumTippen("edge", wireEl.dataset.edge, null); return; }`);

edit("oeffneZumTippen vor dem Maus-Abschnitt",
`  /* ============================ Maus ============================ */`,
`  // Der EINE Weg, ein Element zum Tippen zu oeffnen (eigene Doppelklick-Erkennung und
  // natives dblclick). td = die getroffene Zelle einer Tabelle, sonst null.
  function oeffneZumTippen(typ, id, td) {
    var r = td && td.dataset.r !== undefined ? +td.dataset.r : -1;
    var c = r >= 0 ? +td.dataset.c : -1;
    if (editing && editing.id === id) {
      // Schon offen: gleiche Zelle/gleicher Text -> nichts tun; andere Zelle -> erst schliessen.
      var gleich = editing.zelle ? (editing.zelle[0] === r && editing.zelle[1] === c) : r < 0;
      if (gleich) return;
      var a = document.activeElement; if (a && a.blur) a.blur();
    }
    if (typ === "edge") { editEdgeLabel(id); return; }
    if (!nodes.has(id)) return;
    selSet.clear(); selEdges.clear();
    sel = { type: "node", id: id };
    render();
    if (r >= 0) beginCellEdit(id, r, c); else beginEdit(id);
  }

  /* ============================ Maus ============================ */`);

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
/* Nachtrag (vor der Veroeffentlichung, per node -e): editing traegt jetzt `el` und `finish`;
 * renderNodes schliesst eine offene Texteingabe ab, bevor es die Elemente neu baut
 * (offenesTippenAbschliessen), bedienWarteGrund verwirft einen Merker ohne DOM-Element,
 * commitTblText/tabelleAendern schliessen eine offene Zelle vor dem Umbau. Real gemessen:
 * Inhalts-Textfeld unter offener Zelle -> Merker klemmte. */
