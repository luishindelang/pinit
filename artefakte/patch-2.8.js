/**
 * Patch 2.8 (Paket B): Pfeil-Arten, Raster + Ausrichten, Ueberlauf-Schutz.
 *  - edges: style solid|dashed|dotted · ends to|both|none · head arrow|triangle (Vererbung)
 *           · fromLabel/toLabel (Kardinalitaeten "1" / "n" an den Enden).
 *  - Raster (8 px) beim Ziehen/Groesse/Anlegen, Schalter in der Zoomleiste (je Betrachter).
 *  - Ausrichten/Verteilen/Gleiche Groesse fuer die Mehrfachauswahl.
 *  - body kann nicht mehr waagerecht scrollen (focus() hatte das ausgeloest).
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.8.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.7";`, `  var FASSUNG = "2.8";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: Ueberlauf + Marker + Ausrichten-Knoepfe",
`  #app { display: grid; grid-template-rows: auto auto 1fr; height: 100vh; }`,
`  /* Die Seite darf nie waagerecht scrollen — ein focus() in ein Feld hatte den body verschoben. */
  html, body { overflow: hidden; max-width: 100%; }
  #app { display: grid; grid-template-rows: auto auto 1fr; height: 100vh; overflow: hidden; }
  #wires marker.tri path { stroke: var(--edge); stroke-width: 1; fill: var(--surface); }
  #wires marker.tri.sel path { stroke: var(--accent); }
  .tgrp button.klein { padding: 5px 0; font-size: 11px; }
  .tgrp input {
    flex: 1 1 0; min-width: 0;
    font: 400 12px/1.2 "IBM Plex Sans", sans-serif; color: var(--ink); background: var(--surface-2);
    border: 1px solid var(--line); border-radius: 5px; padding: 5px 6px;
  }
  .tgrp input:focus { outline: none; border-color: var(--accent); background: var(--surface); }`);

/* ---------------------------------------------------------------- Markup */
edit("Marker: Dreieck (hohl) fuer Vererbung",
`            <marker id="mk-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0.6 L10,5 L0,9.4 z" fill="var(--accent)"/>
            </marker>`,
`            <marker id="mk-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0.6 L10,5 L0,9.4 z" fill="var(--accent)"/>
            </marker>
            <marker id="mk-tri" class="tri" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M0.8,0.8 L11.2,6 L0.8,11.2 z"/>
            </marker>
            <marker id="mk-tri-sel" class="tri sel" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
              <path d="M0.8,0.8 L11.2,6 L0.8,11.2 z"/>
            </marker>`);

edit("Inspektor: Pfeil-Art + Ausrichten",
`      <div class="insp-field" id="edge-row" hidden>
        <label for="edge-label">Text am Pfeil</label>
        <input id="edge-label" type="text" maxlength="80" placeholder="z. B. ja" spellcheck="false">
      </div>`,
`      <div class="insp-field" id="edge-row" hidden>
        <label for="edge-label">Text am Pfeil</label>
        <input id="edge-label" type="text" maxlength="80" placeholder="z. B. ja" spellcheck="false">
        <label>Linie</label>
        <div class="tgrp">
          <button class="klein" data-estyle="solid" title="Durchgezogen (Klick-Weg, Ablauf)">━━</button>
          <button class="klein" data-estyle="dashed" title="Gestrichelt (Datenfluss)">╍╍</button>
          <button class="klein" data-estyle="dotted" title="Gepunktet (Abhängigkeit)">┈┈</button>
        </div>
        <label>Spitzen</label>
        <div class="tgrp">
          <button class="klein" data-eends="to" title="Spitze am Ziel">→</button>
          <button class="klein" data-eends="both" title="Spitzen an beiden Enden">↔</button>
          <button class="klein" data-eends="none" title="Ohne Spitze">—</button>
          <button class="klein" data-ehead="triangle" title="Hohles Dreieck: Vererbung / erbt von" aria-pressed="false">▷</button>
        </div>
        <label>Enden beschriften (z. B. 1 und n)</label>
        <div class="tgrp">
          <input id="edge-from" type="text" maxlength="12" placeholder="Anfang" spellcheck="false">
          <input id="edge-to" type="text" maxlength="12" placeholder="Ende" spellcheck="false">
        </div>
      </div>
      <div class="insp-field" id="align-row" hidden>
        <label>Ausrichten</label>
        <div class="tgrp">
          <button class="klein" data-align="l" title="Linke Kanten">⇤</button>
          <button class="klein" data-align="c" title="Waagerecht zentrieren">⇹</button>
          <button class="klein" data-align="r" title="Rechte Kanten">⇥</button>
          <button class="klein" data-align="t" title="Obere Kanten">⤒</button>
          <button class="klein" data-align="m" title="Senkrecht zentrieren">⇳</button>
          <button class="klein" data-align="b" title="Untere Kanten">⤓</button>
        </div>
        <div class="tgrp">
          <button class="klein" data-align="h" title="Gleiche Abstände waagerecht">⇿ Abstand</button>
          <button class="klein" data-align="v" title="Gleiche Abstände senkrecht">⇅ Abstand</button>
          <button class="klein" data-align="s" title="Gleiche Größe (wie das größte)">▣ Größe</button>
        </div>
      </div>`);

edit("Zoomleiste: Raster-Schalter",
`      <button id="z-fit" title="Alles einpassen (Umschalt+1)">Einpassen</button>`,
`      <button id="z-fit" title="Alles einpassen (Umschalt+1)">Einpassen</button>
      <button id="z-raster" title="Einrasten am 8-px-Raster beim Ziehen, Anlegen und Größe ändern" aria-pressed="true">Raster</button>`);

/* ---------------------------------------------------------------- Modell */
edit("Pfeil-Arten + Raster",
`  var ENT_MAX = 30, ENT_MAX_LEN = 120;`,
`  var ENT_MAX = 30, ENT_MAX_LEN = 120;
  // Pfeil-Arten (Paket B): Linie, Spitzen, Kopfform, Endbeschriftungen. Bretter vor 2.8
  // haben die Felder nicht und lesen sich als durchgezogener Pfeil mit Spitze am Ziel.
  var EDGE_STYLES = ["solid", "dashed", "dotted"], EDGE_ENDS = ["to", "both", "none"], EDGE_HEADS = ["arrow", "triangle"];
  function pfeilFelder(v) {
    return {
      style: EDGE_STYLES.indexOf(v.style) >= 0 ? v.style : "solid",
      ends: EDGE_ENDS.indexOf(v.ends) >= 0 ? v.ends : "to",
      head: EDGE_HEADS.indexOf(v.head) >= 0 ? v.head : "arrow",
      fromLabel: typeof v.fromLabel === "string" ? v.fromLabel.slice(0, 12) : "",
      toLabel: typeof v.toLabel === "string" ? v.toLabel.slice(0, 12) : ""
    };
  }
  // Raster: je Betrachter (Browser-Merker), Vorgabe an. snap() rundet immer ganzzahlig.
  var RASTER = 8;
  var raster = load("rb.raster") !== "0";
  function snap(v) { return raster ? Math.round(v / RASTER) * RASTER : Math.round(v); }`);

/* --------------------------------------------------------------- putEdge */
edit("putEdge: Pfeil-Felder",
`    track(db.doc("edges/" + id).set({
      from: e.from, to: e.to, label: e.label || "", sheet: e.sheet || HOME
    }));`,
`    var pf = pfeilFelder(e);
    track(db.doc("edges/" + id).set({
      from: e.from, to: e.to, label: e.label || "", sheet: e.sheet || HOME,
      style: pf.style, ends: pf.ends, head: pf.head, fromLabel: pf.fromLabel, toLabel: pf.toLabel
    }));`);

/* ----------------------------------------------------------- renderWires */
edit("renderWires: Linie, Spitzen, Endbeschriftungen",
`      var line = document.createElementNS(NS, "path");
      line.setAttribute("class", "line");
      line.setAttribute("d", d);
      line.setAttribute("marker-end",
        "url(#" + (istSel ? "mk-sel" : "mk") + ")");
      g.appendChild(line);

      if (e.label) {`,
`      var line = document.createElementNS(NS, "path");
      line.setAttribute("class", "line");
      line.setAttribute("d", d);
      var pf = pfeilFelder(e);
      if (pf.style === "dashed") line.setAttribute("stroke-dasharray", "7 5");
      else if (pf.style === "dotted") line.setAttribute("stroke-dasharray", "2 4");
      var mk = pf.head === "triangle" ? (istSel ? "mk-tri-sel" : "mk-tri") : (istSel ? "mk-sel" : "mk");
      if (pf.ends !== "none") line.setAttribute("marker-end", "url(#" + mk + ")");
      if (pf.ends === "both") line.setAttribute("marker-start", "url(#" + mk + ")");
      g.appendChild(line);

      // Endbeschriftungen (Kardinalitaeten): 16 px vom Rand entlang der Linie, leicht seitlich.
      var len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
      function endText(p, richtung, txt) {
        var tt = document.createElementNS(NS, "text");
        tt.setAttribute("class", "elabel");
        tt.setAttribute("x", p.x + ux * 16 * richtung - uy * 9);
        tt.setAttribute("y", p.y + uy * 16 * richtung + ux * 9);
        tt.textContent = txt;
        g.appendChild(tt);
      }
      if (pf.fromLabel) endText(p1, 1, pf.fromLabel);
      if (pf.toLabel) endText(p2, -1, pf.toLabel);

      if (e.label) {`);

/* ------------------------------------------------------------ Inspektor */
edit("renderInspector: Ausrichten-Zeile vorbelegen",
`  function renderInspector() {
    var box = $("inspector");`,
`  function renderInspector() {
    var box = $("inspector");
    $("align-row").hidden = true;`);

edit("renderInspector: Sammel-Modus zeigt Ausrichten",
`      $("insp-coords").textContent = "Auswahl-Rahmen · Entf löscht alle";`,
`      $("insp-coords").textContent = "Auswahl-Rahmen · Entf löscht alle";
      $("align-row").hidden = selSet.size < 2;`);

edit("renderInspector: Pfeil-Art anzeigen",
`      var f = $("edge-label");
      if (document.activeElement !== f) f.value = e ? (e.label || "") : "";`,
`      var f = $("edge-label");
      if (document.activeElement !== f) f.value = e ? (e.label || "") : "";
      var pf = pfeilFelder(e || {});
      var eb = $("edge-row").querySelectorAll("button[data-estyle],button[data-eends],button[data-ehead]");
      for (var ei = 0; ei < eb.length; ei++) {
        var on = (eb[ei].dataset.estyle && eb[ei].dataset.estyle === pf.style) ||
                 (eb[ei].dataset.eends && eb[ei].dataset.eends === pf.ends) ||
                 (eb[ei].dataset.ehead && pf.head === "triangle");
        eb[ei].setAttribute("aria-pressed", on ? "true" : "false");
      }
      var ef1 = $("edge-from"), ef2 = $("edge-to");
      if (document.activeElement !== ef1) ef1.value = pf.fromLabel;
      if (document.activeElement !== ef2) ef2.value = pf.toLabel;`);

/* ------------------------------------------------------------ Bearbeiten */
edit("addNode: Raster",
`    var n = {
      kind: kind, x: Math.round(bx - nw / 2), y: Math.round(by - nh / 2),`,
`    if (w) { nw = Math.max(48, snap(nw)); nh = Math.max(30, snap(nh)); }
    var n = {
      kind: kind, x: snap(bx - nw / 2), y: snap(by - nh / 2),`);

edit("connect: Pfeil-Vorgaben",
`    var e = { from: from, to: to, label: "", sheet: activeSheet };`,
`    var e = { from: from, to: to, label: "", sheet: activeSheet,
              style: "solid", ends: "to", head: "arrow", fromLabel: "", toLabel: "" };`);

/* ---------------------------------------------------------------- Maus */
edit("mousemove move: Raster",
`      var ddx = Math.round(p.x - drag.start.x), ddy = Math.round(p.y - drag.start.y);
      n.x = drag.x0 + ddx;
      n.y = drag.y0 + ddy;`,
`      var ddx = Math.round(p.x - drag.start.x), ddy = Math.round(p.y - drag.start.y);
      // Raster: das gezogene Element rastet ein, die Kinder ruecken um denselben Weg.
      ddx = snap(drag.x0 + ddx) - drag.x0;
      ddy = snap(drag.y0 + ddy) - drag.y0;
      n.x = drag.x0 + ddx;
      n.y = drag.y0 + ddy;`);

edit("mousemove resize: Raster",
`      m.w = Math.max(48, Math.round(drag.w0 + (p.x - drag.start.x)));
      m.h = Math.max(30, Math.round(drag.h0 + (p.y - drag.start.y)));`,
`      m.w = Math.max(48, snap(drag.w0 + (p.x - drag.start.x)));
      m.h = Math.max(30, snap(drag.h0 + (p.y - drag.start.y)));`);

/* ---------------------------------------------------------------- Knoepfe */
edit("Raster-Schalter, Pfeil-Art-Knoepfe, Ausrichten",
`  var edgeField = $("edge-label");`,
`  // Raster an/aus — je Betrachter, nicht im Brett.
  $("z-raster").setAttribute("aria-pressed", raster ? "true" : "false");
  $("z-raster").addEventListener("click", function () {
    raster = !raster;
    store("rb.raster", raster ? "1" : "0");
    this.setAttribute("aria-pressed", raster ? "true" : "false");
    toast(raster ? "Raster an: Elemente rasten auf 8 px ein." : "Raster aus.");
  });

  // Pfeil-Art: der eine Schreibpfad fuer Linie, Spitzen, Kopf, Endbeschriftungen.
  function pfeilAendern(fn) {
    if (!sel || sel.type !== "edge") return;
    var e = edges.get(sel.id); if (!e) return;
    var pf = pfeilFelder(e);
    e.style = pf.style; e.ends = pf.ends; e.head = pf.head; e.fromLabel = pf.fromLabel; e.toLabel = pf.toLabel;
    fn(e);
    putEdge(sel.id);
    render();
  }
  var pfeilKnoepfe = $("edge-row").querySelectorAll("button[data-estyle],button[data-eends],button[data-ehead]");
  for (var pk = 0; pk < pfeilKnoepfe.length; pk++) {
    pfeilKnoepfe[pk].addEventListener("click", function () {
      var b = this;
      pfeilAendern(function (e) {
        if (b.dataset.estyle) e.style = b.dataset.estyle;
        if (b.dataset.eends) e.ends = b.dataset.eends;
        if (b.dataset.ehead) e.head = e.head === "triangle" ? "arrow" : "triangle";
      });
    });
  }
  ["edge-from", "edge-to"].forEach(function (id) {
    var inp = $(id);
    function commit() {
      pfeilAendern(function (e) {
        var v = inp.value.replace(/\\s+/g, " ").trim().slice(0, 12);
        if (id === "edge-from") e.fromLabel = v; else e.toLabel = v;
      });
    }
    inp.addEventListener("change", commit);
    inp.addEventListener("keydown", function (ev) {
      ev.stopPropagation();
      if (ev.key === "Enter") { ev.preventDefault(); commit(); inp.blur(); }
      else if (ev.key === "Escape") { ev.preventDefault(); render(); inp.blur(); }
    });
  });

  // Ausrichten / Verteilen / Gleiche Groesse fuer die Mehrfachauswahl (nur Elemente).
  function ausrichten(art) {
    var list = [];
    selSet.forEach(function (id) { var m = nodes.get(id); if (m) list.push(m); });
    if (list.length < 2) return;
    var minX = Math.min.apply(null, list.map(function (m) { return m.x; }));
    var maxR = Math.max.apply(null, list.map(function (m) { return m.x + m.w; }));
    var minY = Math.min.apply(null, list.map(function (m) { return m.y; }));
    var maxB = Math.max.apply(null, list.map(function (m) { return m.y + m.h; }));
    if (art === "l") list.forEach(function (m) { m.x = minX; });
    if (art === "r") list.forEach(function (m) { m.x = maxR - m.w; });
    if (art === "c") list.forEach(function (m) { m.x = Math.round((minX + maxR) / 2 - m.w / 2); });
    if (art === "t") list.forEach(function (m) { m.y = minY; });
    if (art === "b") list.forEach(function (m) { m.y = maxB - m.h; });
    if (art === "m") list.forEach(function (m) { m.y = Math.round((minY + maxB) / 2 - m.h / 2); });
    if (art === "h" || art === "v") {
      var k = art === "h" ? "x" : "y", s = art === "h" ? "w" : "h";
      list.sort(function (p, q) { return p[k] - q[k]; });
      var summe = list.reduce(function (acc, m) { return acc + m[s]; }, 0);
      var start = list[0][k], ende = list[list.length - 1][k] + list[list.length - 1][s];
      var luecke = (ende - start - summe) / (list.length - 1);
      var pos = start;
      list.forEach(function (m) { m[k] = Math.round(pos); pos += m[s] + luecke; });
    }
    if (art === "s") {
      var W = Math.max.apply(null, list.map(function (m) { return m.w; }));
      var H = Math.max.apply(null, list.map(function (m) { return m.h; }));
      list.forEach(function (m) { m.w = W; m.h = H; });
    }
    selSet.forEach(function (id) { if (nodes.has(id)) putNode(id); });
    render();
  }
  var alignKnoepfe = $("align-row").querySelectorAll("button[data-align]");
  for (var ak = 0; ak < alignKnoepfe.length; ak++) {
    alignKnoepfe[ak].addEventListener("click", function () { ausrichten(this.dataset.align); });
  }

  var edgeField = $("edge-label");`);

/* -------------------------------------------------------------- Handoff */
edit("Handoff: Pfeil-Felder",
`        from: e.from, to: e.to, label: e.label || "", sheet: reiterFuer(e.sheet)`,
`        from: e.from, to: e.to, label: e.label || "", sheet: reiterFuer(e.sheet),
        style: pfeilFelder(e).style, ends: pfeilFelder(e).ends, head: pfeilFelder(e).head,
        fromLabel: pfeilFelder(e).fromLabel, toLabel: pfeilFelder(e).toLabel`);

edit("Diagramm-Text: Linienart",
`      var lab = (e.label || "").replace(/["|\\n]/g, " ").trim();
      lines.push("  " + a + (lab ? " -->|" + lab + "| " : " --> ") + b);`,
`      var lab = (e.label || "").replace(/["|\\n]/g, " ").trim();
      var pf = pfeilFelder(e);
      var strich = pf.style === "solid" ? "--" : "-.-";
      var spitze = pf.ends === "none" ? (pf.style === "solid" ? "---" : "-.-") : strich + ">";
      if (pf.ends === "both") spitze = "<" + spitze;
      lines.push("  " + a + (lab ? " " + spitze + "|" + lab + "| " : " " + spitze + " ") + b);`);

/* ------------------------------------------------------------- Datenbank */
edit("applyEdges: Pfeil-Felder",
`      next.set(d.id, {
        from: String(v.from), to: String(v.to),
        label: typeof v.label === "string" ? v.label.slice(0, 200) : "",
        sheet: typeof v.sheet === "string" && v.sheet ? v.sheet : HOME
      });`,
`      var pf = pfeilFelder(v);
      next.set(d.id, {
        from: String(v.from), to: String(v.to),
        label: typeof v.label === "string" ? v.label.slice(0, 200) : "",
        sheet: typeof v.sheet === "string" && v.sheet ? v.sheet : HOME,
        style: pf.style, ends: pf.ends, head: pf.head, fromLabel: pf.fromLabel, toLabel: pf.toLabel
      });`);

edit("Kurzhilfe",
`Rahmen ziehen wählt mehrere (auch Pfeile), Umschalt+Klick ergänzt · `,
`Rahmen ziehen wählt mehrere (auch Pfeile), Umschalt+Klick ergänzt, Ausrichten im Inspektor · Pfeil-Art (Linie, Spitzen, 1:n) im Inspektor · Raster unten rechts · `);

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
