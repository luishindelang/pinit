/**
 * Patch 2.7 (Paket A, Teil 3): Datenmodell / Klasse — kind "entity". `text` = Name,
 * `fields` = Array von Strings ("id: int"), `methods` = Array von Strings (optional, fuer
 * Klassendiagramme). Inhalt ueber ein Textfeld im Inspektor: eine Zeile je Feld, eine
 * Leerzeile trennt Felder von Methoden. Hoehe passt sich beim Uebernehmen an.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.7.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.6";`, `  var FASSUNG = "2.7";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: Datenmodell",
`  /* UI-Bausteine (kind widget, Feld variant). Aussehen je Art — die Bedeutung steht im Feld. */`,
`  /* Datenmodell / Klasse: Name oben, Felder darunter, Methoden abgesetzt. */
  .node.entity {
    border-radius: 4px; border: 1.5px solid; padding: 0;
    flex-direction: column; align-items: stretch; justify-content: flex-start;
  }
  .node.entity .txt {
    flex: none; max-height: none; padding: 5px 8px; text-align: center !important;
    background: rgba(127,127,127,.14); border-bottom: 1px solid var(--line-strong);
  }
  .node.entity .ent-list {
    padding: 4px 8px; text-align: left; white-space: pre; overflow: hidden;
    font-family: "IBM Plex Mono", ui-monospace, monospace; line-height: 1.5;
  }
  .node.entity .ent-methods { border-top: 1px dashed var(--line-strong); }
  /* UI-Bausteine (kind widget, Feld variant). Aussehen je Art — die Bedeutung steht im Feld. */`);

/* ---------------------------------------------------------------- Markup */
edit("Inspektor: Felder-Textfeld",
`      <div class="insp-field" id="widget-row" hidden>`,
`      <div class="insp-field" id="entity-row" hidden>
        <label for="entity-text">Felder — eine je Zeile · Leerzeile, dann Methoden</label>
        <textarea id="entity-text" placeholder="id: int&#10;name: string&#10;&#10;speichern()" spellcheck="false"></textarea>
      </div>
      <div class="insp-field" id="widget-row" hidden>`);

/* ---------------------------------------------------------------- Modell */
edit("KINDS: entity",
`    widget:  { w: 160, h: 36,  color: "plain", label: "Baustein",     fs: 13, bold: false, align: "left" }`,
`    widget:  { w: 160, h: 36,  color: "plain", label: "Baustein",     fs: 13, bold: false, align: "left" },
    entity:  { w: 200, h: 96,  color: "lilac", label: "Datenmodell",  fs: 12, bold: true,  align: "center" }`);

edit("Listen-Helfer",
`  function variantLesen(v) { return Object.prototype.hasOwnProperty.call(VARIANTS, v) ? v : "button"; }`,
`  function variantLesen(v) { return Object.prototype.hasOwnProperty.call(VARIANTS, v) ? v : "button"; }
  // Datenmodell: Felder/Methoden als Liste kurzer Strings, begrenzt und bereinigt.
  var ENT_MAX = 30, ENT_MAX_LEN = 120;
  function listeLesen(v) {
    if (!Array.isArray(v)) return [];
    return v.filter(function (x) { return typeof x === "string"; })
      .slice(0, ENT_MAX).map(function (x) { return x.slice(0, ENT_MAX_LEN); });
  }
  function entityText(n) {
    var f = (n.fields || []).join("\\n"), m = (n.methods || []).join("\\n");
    return m ? f + "\\n\\n" + m : f;
  }
  // Umkehrung: erste Leerzeile trennt Felder von Methoden.
  function entityParsen(s) {
    var zeilen = s.replace(/\\r\\n?/g, "\\n").split("\\n").map(function (z) { return z.trim(); });
    var trenner = zeilen.indexOf("");
    var fields = trenner < 0 ? zeilen : zeilen.slice(0, trenner);
    var methods = trenner < 0 ? [] : zeilen.slice(trenner + 1);
    var leer = function (z) { return z !== ""; };
    return { fields: listeLesen(fields.filter(leer)), methods: listeLesen(methods.filter(leer)) };
  }
  // Hoehe, die Name + Zeilen brauchen (Schriftgrad * 1.5 je Zeile + Kopf + Rahmen).
  function entityHoehe(n) {
    var z = (n.fields || []).length + (n.methods || []).length;
    var zeile = Math.round(schriftgrad(n) * 1.5);
    return Math.max(60, 30 + 10 + z * zeile + ((n.methods || []).length ? 10 : 0));
  }`);

/* --------------------------------------------------------------- putNode */
edit("putNode: fields/methods",
`    if (n.kind === "widget") d.variant = n.variant || "button";
    track(db.doc("nodes/" + id).set(d));`,
`    if (n.kind === "widget") d.variant = n.variant || "button";
    if (n.kind === "entity") { d.fields = (n.fields || []).slice(); d.methods = (n.methods || []).slice(); }
    track(db.doc("nodes/" + id).set(d));`);

/* ----------------------------------------------------------- renderNodes */
edit("renderNodes: Datenmodell-Listen",
`      if (n.kind === "frame") {
        el.style.justifyContent = "flex-start";`,
`      if (n.kind === "entity") {
        el.style.justifyContent = "flex-start";
        var fl = document.createElement("div");
        fl.className = "ent-list";
        fl.style.fontSize = Math.max(9, schriftgrad(n) - 1) + "px";
        fl.textContent = (n.fields || []).join("\\n") || "\\u00a0";
        el.appendChild(fl);
        if (n.methods && n.methods.length) {
          var ml = document.createElement("div");
          ml.className = "ent-list ent-methods";
          ml.style.fontSize = Math.max(9, schriftgrad(n) - 1) + "px";
          ml.textContent = n.methods.join("\\n");
          el.appendChild(ml);
        }
      }
      if (n.kind === "frame") {
        el.style.justifyContent = "flex-start";`);

/* ------------------------------------------------------------ Inspektor */
edit("renderInspector: Felder-Textfeld",
`      $("widget-row").hidden = n.kind !== "widget";`,
`      $("widget-row").hidden = n.kind !== "widget";
      $("entity-row").hidden = n.kind !== "entity";
      if (n.kind === "entity") {
        var ef = $("entity-text");
        if (document.activeElement !== ef) ef.value = entityText(n);
      }`);
edit("renderInspector: Felder-Textfeld verbergen",
`      $("widget-row").hidden = true;`,
`      $("widget-row").hidden = true;
      $("entity-row").hidden = true;`, true);

/* ------------------------------------------------------------ Bearbeiten */
edit("addNode: Datenmodell-Vorgabe",
`    if (kind === "code") n.text = "// Beispiel\\n{ }";`,
`    if (kind === "code") n.text = "// Beispiel\\n{ }";
    if (kind === "entity") { n.text = "Entität"; n.fields = ["id: int", "name: string"]; n.methods = []; if (!h) n.h = entityHoehe(n); }`);

/* ------------------------------------------------------------- Werkzeuge */
edit("TOOLS: Datenmodell",
`    { id: "code", key: "C", label: "Code", rail: 2,`,
`    { id: "entity", key: "E", label: "Datenmodell", rail: 2,
      svg: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M4 9h16M8 13h6M8 17h8"/>' },
    { id: "code", key: "C", label: "Code", rail: 2,`);

edit("Tastatur: Kuerzel E",
`                r: "frame", c: "code", "1": "start", "0": "end", w: "widget" };`,
`                r: "frame", c: "code", "1": "start", "0": "end", w: "widget", e: "entity" };`);

/* ---------------------------------------------------------------- Knoepfe */
edit("Felder-Textfeld: Handler",
`  function tabelleAendern(fn) {`,
`  // Felder/Methoden eines Datenmodells: Schreibpfad wie das Tabellen-Textfeld.
  var entityField = $("entity-text");
  function commitEntity() {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n || n.kind !== "entity") return;
    offenesTippenAbschliessen();
    var p = entityParsen(entityField.value);
    if (JSON.stringify(p.fields) === JSON.stringify(n.fields || []) &&
        JSON.stringify(p.methods) === JSON.stringify(n.methods || [])) return;
    n.fields = p.fields; n.methods = p.methods;
    n.h = Math.max(n.h, entityHoehe(n));
    putNode(sel.id);
    render();
  }
  entityField.addEventListener("change", commitEntity);
  entityField.addEventListener("keydown", function (ev) {
    ev.stopPropagation();
    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); commitEntity(); entityField.blur(); }
    else if (ev.key === "Escape") {
      ev.preventDefault();
      var n = sel && sel.type === "node" ? nodes.get(sel.id) : null;
      entityField.value = n && n.kind === "entity" ? entityText(n) : "";
      entityField.blur();
    }
  });

  function tabelleAendern(fn) {`);

edit("Duplizieren: fields/methods",
`    if (n.kind === "widget") copy.variant = n.variant || "button";
    allNodes.set(id, copy);`,
`    if (n.kind === "widget") copy.variant = n.variant || "button";
    if (n.kind === "entity") { copy.fields = (n.fields || []).slice(); copy.methods = (n.methods || []).slice(); }
    allNodes.set(id, copy);`);

edit("Handoff: fields/methods",
`      if (n.kind === "widget") out.nodes[id].variant = n.variant || "button";`,
`      if (n.kind === "widget") out.nodes[id].variant = n.variant || "button";
      if (n.kind === "entity") { out.nodes[id].fields = (n.fields || []).slice(); out.nodes[id].methods = (n.methods || []).slice(); }`);

/* ------------------------------------------------------------- Datenbank */
edit("applyNodes: fields/methods",
`        variant: v.kind === "widget" ? variantLesen(v.variant) : undefined`,
`        variant: v.kind === "widget" ? variantLesen(v.variant) : undefined,
        fields: v.kind === "entity" ? listeLesen(v.fields) : undefined,
        methods: v.kind === "entity" ? listeLesen(v.methods) : undefined`);

edit("Kurzhilfe",
`Baustein W (Art im Inspektor), Code C, `,
`Baustein W (Art im Inspektor), Datenmodell E (Felder im Inspektor), Code C, `);

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
