/**
 * Patch 2.6 (Paket A, Teil 2): UI-Bausteine — kind "widget" mit Feld `variant`:
 * button | input | select | toggle | list | menu | image. Ein Baustein traegt damit seine
 * BEDEUTUNG (das ist ein Knopf), nicht nur einen Text. Art im Inspektor umschaltbar.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.6.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.5";`, `  var FASSUNG = "2.6";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: Bausteine",
`  .node.end.sel { box-shadow: 0 0 0 2px var(--accent), inset 0 0 0 3px var(--surface), inset 0 0 0 12px var(--edge); }`,
`  .node.end.sel { box-shadow: 0 0 0 2px var(--accent), inset 0 0 0 3px var(--surface), inset 0 0 0 12px var(--edge); }
  /* UI-Bausteine (kind widget, Feld variant). Aussehen je Art — die Bedeutung steht im Feld. */
  .node.widget { border-radius: 5px; border: 1.5px solid; box-shadow: none; }
  .node.widget .txt { text-align: left; }
  .node.widget.w-button { border-radius: 999px; justify-content: center !important; font-weight: 600; }
  .node.widget.w-button .txt { text-align: center !important; }
  .node.widget.w-input .txt, .node.widget.w-select .txt { color: var(--ink-3); font-style: italic; }
  .node.widget.w-select .w-caret {
    position: absolute; right: 9px; top: 50%; transform: translateY(-50%);
    font-size: 11px; color: var(--ink-2); pointer-events: none;
  }
  .node.widget.w-toggle { border: none !important; background: transparent !important; padding-left: 46px; }
  .node.widget.w-toggle .w-knob {
    position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
    width: 32px; height: 18px; border-radius: 999px; background: var(--accent);
  }
  .node.widget.w-toggle .w-knob::after {
    content: ""; position: absolute; right: 2px; top: 2px; width: 14px; height: 14px;
    border-radius: 50%; background: var(--surface);
  }
  .node.widget.w-list { align-items: flex-start; padding: 0; }
  .node.widget.w-list .txt { max-height: 100%; overflow: hidden; }
  .node.widget.w-list .txt .zl { padding: 5px 10px; border-bottom: 1px solid var(--line); min-height: 1.6em; }
  .node.widget.w-menu { padding: 0 6px; }
  .node.widget.w-menu .txt { display: flex; gap: 2px; align-items: stretch; height: 100%; }
  .node.widget.w-menu .w-tab {
    display: inline-flex; align-items: center; padding: 0 10px; white-space: nowrap;
    border-bottom: 2px solid transparent;
  }
  .node.widget.w-menu .w-tab:first-child { border-bottom-color: var(--accent); font-weight: 600; }
  .node.widget.w-image {
    border-style: dashed; justify-content: center !important;
    background-image: linear-gradient(to top right, transparent calc(50% - .75px), var(--line-strong), transparent calc(50% + .75px)),
                      linear-gradient(to top left,  transparent calc(50% - .75px), var(--line-strong), transparent calc(50% + .75px)) !important;
  }
  .node.widget.w-image .txt { text-align: center !important; color: var(--ink-3); background: var(--surface); padding: 2px 6px; width: auto !important; border-radius: 3px; }`);

/* ---------------------------------------------------------------- Markup */
edit("Inspektor: Baustein-Art",
`      <div class="insp-field" id="frame-row" hidden>`,
`      <div class="insp-field" id="widget-row" hidden>
        <label>Baustein-Art</label>
        <div class="tgrp">
          <button data-variant="button" title="Knopf">Knopf</button>
          <button data-variant="input" title="Eingabefeld">Eingabe</button>
          <button data-variant="select" title="Auswahlliste">Auswahl</button>
          <button data-variant="toggle" title="Schalter">Schalter</button>
        </div>
        <div class="tgrp">
          <button data-variant="list" title="Liste">Liste</button>
          <button data-variant="menu" title="Menü / Reiterleiste">Menü</button>
          <button data-variant="image" title="Bild-Platzhalter">Bild</button>
        </div>
      </div>
      <div class="insp-field" id="frame-row" hidden>`);

/* ---------------------------------------------------------------- Modell */
edit("KINDS: widget",
`    end:     { w: 40,  h: 40,  color: "slate", label: "Ende",         fs: 13, bold: false, align: "center" }`,
`    end:     { w: 40,  h: 40,  color: "slate", label: "Ende",         fs: 13, bold: false, align: "center" },
    widget:  { w: 160, h: 36,  color: "plain", label: "Baustein",     fs: 13, bold: false, align: "left" }`);

edit("Baustein-Arten",
`  function ohneText(n) { return n.kind === "start" || n.kind === "end"; }`,
`  function ohneText(n) { return n.kind === "start" || n.kind === "end"; }
  // UI-Bausteine: Art -> Standardgroesse und Beispieltext. Die Art ist die Bedeutung, die
  // Claude beim Lesen braucht ("das ist ein Knopf"), das Aussehen nur Andeutung.
  var VARIANTS = {
    button: { w: 120, h: 36,  text: "OK",                    label: "Knopf" },
    input:  { w: 200, h: 36,  text: "Eingabe …",             label: "Eingabefeld" },
    select: { w: 200, h: 36,  text: "Auswahl",               label: "Auswahlliste" },
    toggle: { w: 150, h: 28,  text: "Option",                label: "Schalter" },
    list:   { w: 200, h: 110, text: "Eintrag 1\\nEintrag 2\\nEintrag 3", label: "Liste" },
    menu:   { w: 320, h: 36,  text: "Start | Kunden | Einstellungen", label: "Menü" },
    image:  { w: 160, h: 120, text: "Bild",                  label: "Bild-Platzhalter" }
  };
  function variantLesen(v) { return Object.prototype.hasOwnProperty.call(VARIANTS, v) ? v : "button"; }`);

/* --------------------------------------------------------------- putNode */
edit("putNode: variant",
`    if (n.kind === "frame") d.layout = n.layout || "frei";
    track(db.doc("nodes/" + id).set(d));`,
`    if (n.kind === "frame") d.layout = n.layout || "frei";
    if (n.kind === "widget") d.variant = n.variant || "button";
    track(db.doc("nodes/" + id).set(d));`);

/* ----------------------------------------------------------- renderNodes */
edit("renderNodes: Baustein-Klasse",
`      el.className = "node " + n.kind +
        ((sel && sel.type === "node" && sel.id === id) || selSet.has(id) ? " sel" : "");`,
`      el.className = "node " + n.kind +
        (n.kind === "widget" ? " w-" + variantLesen(n.variant) : "") +
        ((sel && sel.type === "node" && sel.id === id) || selSet.has(id) ? " sel" : "");`);

edit("renderNodes: Baustein-Text",
`      if (n.kind === "code") t.textContent = n.text; else textFuellen(t, n.text);`,
`      if (n.kind === "code") t.textContent = n.text;
      else if (n.kind === "widget" && n.variant === "list") textFuellen(t, n.text, true);
      else if (n.kind === "widget" && n.variant === "menu") menueFuellen(t, n.text);
      else textFuellen(t, n.text);`);

edit("renderNodes: Baustein-Zierteile",
`      if (n.kind === "frame") {
        el.style.justifyContent = "flex-start";`,
`      if (n.kind === "widget") {
        var vz = variantLesen(n.variant);
        if (vz === "select") { var car = document.createElement("span"); car.className = "w-caret"; car.textContent = "\\u25BE"; el.appendChild(car); }
        if (vz === "toggle") { var kn = document.createElement("span"); kn.className = "w-knob"; el.appendChild(kn); }
        if (vz === "list") el.style.justifyContent = "flex-start";
      }
      if (n.kind === "frame") {
        el.style.justifyContent = "flex-start";`);

edit("textFuellen: immerZeilen + menueFuellen",
`  function textFuellen(t, text) {
    var zeilen = (text || "").split("\\n");
    var hat = zeilen.some(function (z) { return LI.test(z); });
    if (!hat) { t.textContent = text; return; }`,
`  function textFuellen(t, text, immerZeilen) {
    var zeilen = (text || "").split("\\n");
    var hat = immerZeilen || zeilen.some(function (z) { return LI.test(z); });
    if (!hat) { t.textContent = text; return; }`);

edit("menueFuellen nach textFuellen",
`  function tabelleBauen(n) {`,
`  // Menue/Reiterleiste: Eintraege mit "|" getrennt, der erste gilt als aktiv.
  function menueFuellen(t, text) {
    while (t.firstChild) t.removeChild(t.firstChild);
    (text || "").split("|").forEach(function (e) {
      var s = document.createElement("span");
      s.className = "w-tab";
      s.textContent = e.trim() || "\\u00a0";
      t.appendChild(s);
    });
  }
  function tabelleBauen(n) {`);

/* ------------------------------------------------------------ Inspektor */
edit("renderInspector: Baustein-Art",
`      $("frame-row").hidden = n.kind !== "frame";`,
`      $("frame-row").hidden = n.kind !== "frame";
      $("widget-row").hidden = n.kind !== "widget";
      if (n.kind === "widget") {
        var vb = $("widget-row").querySelectorAll("button[data-variant]");
        for (var vi = 0; vi < vb.length; vi++) {
          vb[vi].setAttribute("aria-pressed", vb[vi].dataset.variant === variantLesen(n.variant) ? "true" : "false");
        }
      }`);
edit("renderInspector: Baustein-Art verbergen",
`      $("frame-row").hidden = true;`,
`      $("frame-row").hidden = true;
      $("widget-row").hidden = true;`, true);

/* ------------------------------------------------------------ Bearbeiten */
edit("addNode: Baustein-Vorgabe",
`    if (kind === "code") n.text = "// Beispiel\\n{ }";`,
`    if (kind === "code") n.text = "// Beispiel\\n{ }";
    if (kind === "widget") {
      n.variant = "button";
      n.text = VARIANTS.button.text;
      if (!w) { n.w = VARIANTS.button.w; n.h = VARIANTS.button.h; n.x = Math.round(bx - n.w / 2); n.y = Math.round(by - n.h / 2); }
    }`);

/* ------------------------------------------------------------- Werkzeuge */
edit("TOOLS: Baustein",
`    { id: "code", key: "C", label: "Code", rail: 2,`,
`    { id: "widget", key: "W", label: "Baustein", rail: 2,
      svg: '<rect x="3" y="5" width="18" height="6" rx="3"/><rect x="3" y="14" width="12" height="5" rx="1"/><path d="M18 16.5h3"/>' },
    { id: "code", key: "C", label: "Code", rail: 2,`);

edit("Tastatur: Kuerzel W",
`                r: "frame", c: "code", "1": "start", "0": "end" };`,
`                r: "frame", c: "code", "1": "start", "0": "end", w: "widget" };`);

/* ---------------------------------------------------------------- Knoepfe */
edit("Baustein-Knoepfe",
`  function tabelleAendern(fn) {`,
`  // Baustein-Art wechseln: Art, Standardgroesse und — falls noch der Beispieltext der
  // alten Art drinsteht — der Beispieltext der neuen Art.
  var variantKnoepfe = $("widget-row").querySelectorAll("button[data-variant]");
  for (var vk = 0; vk < variantKnoepfe.length; vk++) {
    variantKnoepfe[vk].addEventListener("click", function () {
      if (!sel || sel.type !== "node") return;
      var n = nodes.get(sel.id); if (!n || n.kind !== "widget") return;
      var alt = variantLesen(n.variant), neu = variantLesen(this.dataset.variant);
      if (alt === neu) return;
      if (n.text === VARIANTS[alt].text) n.text = VARIANTS[neu].text;
      n.variant = neu;
      n.w = VARIANTS[neu].w; n.h = VARIANTS[neu].h;
      putNode(sel.id); render();
    });
  }

  function tabelleAendern(fn) {`);

edit("Duplizieren: variant",
`    if (n.kind === "frame") copy.layout = n.layout || "frei";
    allNodes.set(id, copy);`,
`    if (n.kind === "frame") copy.layout = n.layout || "frei";
    if (n.kind === "widget") copy.variant = n.variant || "button";
    allNodes.set(id, copy);`);

edit("Handoff: variant",
`      if (n.kind === "frame") out.nodes[id].layout = n.layout || "frei";`,
`      if (n.kind === "frame") out.nodes[id].layout = n.layout || "frei";
      if (n.kind === "widget") out.nodes[id].variant = n.variant || "button";`);

edit("Diagramm-Text: Bausteine auslassen",
`      if (n.kind === "text" || n.kind === "table" || n.kind === "frame" || n.kind === "code") return;`,
`      if (n.kind === "text" || n.kind === "table" || n.kind === "frame" || n.kind === "code" || n.kind === "widget") return;`);

/* ------------------------------------------------------------- Datenbank */
edit("applyNodes: variant",
`        layout: v.kind === "frame" ? layoutLesen(v.layout) : undefined`,
`        layout: v.kind === "frame" ? layoutLesen(v.layout) : undefined,
        variant: v.kind === "widget" ? variantLesen(v.variant) : undefined`);

edit("Kurzhilfe",
`Rahmen R (Layout im Inspektor), Code C, Start 1, Ende 0 · `,
`Rahmen R (Layout im Inspektor), Baustein W (Art im Inspektor), Code C, Start 1, Ende 0 · `);

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
