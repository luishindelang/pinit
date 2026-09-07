/**
 * Patch 2.9 (Paket C, Seitenanteil):
 *  C1 Reiter-Typ (`sheets.type`: "" | screen | arch | data | flow) — Symbol vor dem Namen,
 *     Klick auf das Symbol des aktiven Reiters wechselt durch.
 *  C4 Einfrieren (`meta/board.frozen`) — zweistufiger Knopf in der Kopfzeile; eingefroren
 *     sperrt die Seite jede Aenderung (Anlegen, Ziehen, Tippen, Loeschen, Reiter, Titel,
 *     Inspektor), zeigt ein Abzeichen und legt den Stand als JSON in die Ablage. Auftauen
 *     ebenfalls zweistufig. Claude prueft das Feld im Schreib-Skill.
 *  C5 Verweis + Status je Element (`link`, `status`: "" | offen | arbeit | fertig) —
 *     Statuspunkt oben links, Verweis im Tooltip, beides im Inspektor.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.9.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.8";`, `  var FASSUNG = "2.9";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: Reiter-Typ, Eingefroren, Statuspunkt",
`  .tab-add {`,
`  .tab .tab-type {
    font-size: 12px; line-height: 1; opacity: .8; padding: 0 2px; border-radius: 3px;
  }
  .tab[aria-selected="true"] .tab-type { cursor: pointer; }
  .tab[aria-selected="true"] .tab-type:hover { background: var(--accent-soft); opacity: 1; }
  /* Eingefroren: alles, was aendert, ist stumpf. Lesen, Waehlen, Kennung kopieren, Reiter
     wechseln und Auftauen bleiben. */
  .badge.frozen { color: var(--danger); border-color: var(--danger); }
  body.frozen #tools button:not([data-tool="select"]):not([data-tool="hand"]),
  body.frozen #tools2 button,
  body.frozen #inspector button:not(#insp-id), body.frozen #inspector input, body.frozen #inspector textarea,
  body.frozen #tabs .tab-add, body.frozen #tabs .x, body.frozen #tabs .tab-type, body.frozen #title,
  body.frozen #btn-handoff { pointer-events: none; opacity: .45; }
  body.frozen .grip { display: none !important; }
  .node .status-dot {
    position: absolute; top: 4px; left: 4px; width: 9px; height: 9px; border-radius: 50%;
    border: 1.5px solid var(--surface); pointer-events: none;
  }
  .node .status-dot.offen { background: var(--danger); }
  .node .status-dot.arbeit { background: #d3ab5c; }
  .node .status-dot.fertig { background: #3f9a6a; }
  .tab-add {`);

/* ---------------------------------------------------------------- Markup */
edit("Kopfzeile: Eingefroren-Abzeichen + Knopf",
`    <span id="mode-badge" class="badge" hidden>Vorlage</span>`,
`    <span id="mode-badge" class="badge" hidden>Vorlage</span>
    <span id="frozen-badge" class="badge frozen" hidden title="Dieses Brett ist eingefroren: niemand ändert etwas, auch Claude nicht. Oben rechts auftauen.">Eingefroren</span>`);

edit("Kopfzeile: Einfrieren-Knopf",
`      <button id="btn-help" title="Kurzhilfe">`,
`      <button id="btn-freeze" class="ghost" title="Stand einfrieren: das Brett wird für alle schreibgeschützt (auch für Claude), der Stand landet als Text in der Ablage. Zweiter Klick bestätigt.">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
        <span id="btn-freeze-txt">Einfrieren</span>
      </button>
      <button id="btn-help" title="Kurzhilfe">`);

edit("Inspektor: Verweis + Status",
`      <div class="insp-field" id="entity-row" hidden>`,
`      <div class="insp-field" id="meta-row" hidden>
        <label for="node-link">Verweis (Datei, URL, Ticket)</label>
        <input id="node-link" type="text" maxlength="300" placeholder="z. B. src/login.ts oder https://…" spellcheck="false">
        <label>Status</label>
        <div class="tgrp">
          <button class="klein" data-status="" title="Kein Status">–</button>
          <button class="klein" data-status="offen" title="Offen: noch zu bauen">offen</button>
          <button class="klein" data-status="arbeit" title="In Arbeit">in Arbeit</button>
          <button class="klein" data-status="fertig" title="Fertig: gebaut">fertig</button>
        </div>
      </div>
      <div class="insp-field" id="entity-row" hidden>`);

/* ---------------------------------------------------------------- Modell */
edit("Modell: Reiter-Typen, Status, frozen",
`  var RASTER = 8;`,
`  // Reiter-Typ (C1): sagt Claude, wie ein Reiter zu lesen ist. Leer = unbestimmt.
  var SHEET_TYPES = ["", "screen", "arch", "data", "flow"];
  var SHEET_TYPE_INFO = {
    "":       { symbol: "\\u00b7", name: "kein Typ" },
    screen:   { symbol: "\\uD83D\\uDDA5", name: "Bildschirm" },
    arch:     { symbol: "\\u29C9", name: "Architektur" },
    data:     { symbol: "\\u26C1", name: "Datenmodell" },
    flow:     { symbol: "\\u21C4", name: "Ablauf" }
  };
  function sheetTypeLesen(v) { return SHEET_TYPES.indexOf(v) > 0 ? v : ""; }
  // Status je Element (C5). Leer = kein Status.
  var STATUS = ["", "offen", "arbeit", "fertig"];
  function statusLesen(v) { return STATUS.indexOf(v) > 0 ? v : ""; }
  // Eingefroren (C4): Wahrheit liegt in meta/board.frozen, hier nur der Spiegel.
  var frozen = false;
  var freezeArmed = null;
  function gesperrt() {
    if (!frozen) return false;
    toast("Das Brett ist eingefroren — erst oben rechts auftauen.");
    return true;
  }
  var RASTER = 8;`);

/* ------------------------------------------------------------------ Reiter */
edit("sheetList: type mitfuehren",
`    sheets.forEach(function (s, id) { a.push({ id: id, name: s.name, order: s.order || 0 }); });`,
`    sheets.forEach(function (s, id) { a.push({ id: id, name: s.name, order: s.order || 0, type: s.type || "" }); });`);

edit("renderTabs: Typ-Symbol",
`      var lbl = document.createElement("span");
      lbl.className = "tab-name";
      lbl.textContent = s.auffang ? s.name + " (" + waisen + ")" : s.name;
      b.appendChild(lbl);`,
`      if (!s.auffang && (s.type || s.id === activeSheet)) {
        var ty = document.createElement("span");
        ty.className = "tab-type";
        ty.textContent = SHEET_TYPE_INFO[s.type || ""].symbol;
        ty.title = "Reiter-Typ: " + SHEET_TYPE_INFO[s.type || ""].name +
          (s.id === activeSheet ? " — Klick wechselt (Bildschirm, Architektur, Datenmodell, Ablauf)" : "");
        if (s.id === activeSheet) {
          ty.addEventListener("click", function (ev) {
            ev.stopPropagation();
            if (gesperrt()) return;
            materializeHome();
            var sh = sheets.get(s.id); if (!sh) return;
            sh.type = SHEET_TYPES[(SHEET_TYPES.indexOf(sh.type || "") + 1) % SHEET_TYPES.length];
            putSheet(s.id);
            render();
            toast("Reiter-Typ: " + SHEET_TYPE_INFO[sh.type].name);
          });
        }
        b.appendChild(ty);
      }
      var lbl = document.createElement("span");
      lbl.className = "tab-name";
      lbl.textContent = s.auffang ? s.name + " (" + waisen + ")" : s.name;
      b.appendChild(lbl);`);

edit("putSheet: type",
`    track(db.doc("sheets/" + id).set({ name: s.name, order: s.order }));`,
`    track(db.doc("sheets/" + id).set({ name: s.name, order: s.order, type: s.type || "" }));`);

edit("applySheets: type",
`        name: typeof v.name === "string" && v.name ? v.name.slice(0, 80) : "Reiter",
        order: +v.order || 0
      });`,
`        name: typeof v.name === "string" && v.name ? v.name.slice(0, 80) : "Reiter",
        order: +v.order || 0,
        type: sheetTypeLesen(v.type)
      });`);

edit("addSheet: gesperrt", `  function addSheet() {`, `  function addSheet() {
    if (gesperrt()) return;`);
edit("renameSheet: gesperrt",
`  function renameSheet(id) {
    if (id === CATCH) { toast("Der Auffang-Reiter lässt sich nicht umbenennen."); return; }`,
`  function renameSheet(id) {
    if (gesperrt()) return;
    if (id === CATCH) { toast("Der Auffang-Reiter lässt sich nicht umbenennen."); return; }`);
edit("deleteSheet: gesperrt",
`  function deleteSheet(id) {
    if (id === CATCH) { toast("Der Auffang-Reiter lässt sich nicht löschen."); return; }`,
`  function deleteSheet(id) {
    if (gesperrt()) return;
    if (id === CATCH) { toast("Der Auffang-Reiter lässt sich nicht löschen."); return; }`);

/* --------------------------------------------------------------- Speichern */
edit("putNode: link/status",
`    if (n.kind === "entity") { d.fields = (n.fields || []).slice(); d.methods = (n.methods || []).slice(); }
    track(db.doc("nodes/" + id).set(d));`,
`    if (n.kind === "entity") { d.fields = (n.fields || []).slice(); d.methods = (n.methods || []).slice(); }
    d.link = n.link || ""; d.status = statusLesen(n.status);
    track(db.doc("nodes/" + id).set(d));`);

edit("putTitle bewahrt frozen; putBoard",
`  function putTitle(t) { if (db) track(db.doc("meta/board").set({ title: t })); }`,
`  // meta/board traegt title UND frozen — set() ersetzt das ganze Dokument, also immer beide.
  function putBoard(t, f) { if (db) track(db.doc("meta/board").set({ title: t, frozen: !!f })); }
  function putTitle(t) { putBoard(t, frozen); }`);

edit("track: letzte Verteidigung",
`  function track(p) {
    if (!db) return Promise.resolve();`,
`  function track(p) {
    if (!db) return Promise.resolve();
    // Letzte Verteidigung: eingefroren schreibt nichts — ausser das Auftauen selbst.
    if (frozen && !track.auftauen) { return Promise.resolve(); }`);

/* ----------------------------------------------------------- renderNodes */
edit("renderNodes: Statuspunkt + Verweis-Tooltip",
`      if (n.note) {
        var mark = document.createElement("div");
        mark.className = "note-mark";
        el.appendChild(mark);
        el.title = n.note.length > 200 ? n.note.slice(0, 200) + " …" : n.note;
      }`,
`      if (n.note) {
        var mark = document.createElement("div");
        mark.className = "note-mark";
        el.appendChild(mark);
        el.title = n.note.length > 200 ? n.note.slice(0, 200) + " …" : n.note;
      }
      if (n.status) {
        var dot = document.createElement("div");
        dot.className = "status-dot " + n.status;
        el.appendChild(dot);
      }
      if (n.link) el.title = (el.title ? el.title + "\\n" : "") + "\\u2197 " + n.link;`);

/* ------------------------------------------------------------ Inspektor */
edit("renderInspector: Verweis/Status",
`      $("entity-row").hidden = n.kind !== "entity";`,
`      $("entity-row").hidden = n.kind !== "entity";
      $("meta-row").hidden = false;
      var lk = $("node-link");
      if (document.activeElement !== lk) lk.value = n.link || "";
      var sb = $("meta-row").querySelectorAll("button[data-status]");
      for (var si = 0; si < sb.length; si++) sb[si].setAttribute("aria-pressed", sb[si].dataset.status === statusLesen(n.status) ? "true" : "false");`);
edit("renderInspector: Verweis/Status verbergen",
`      $("entity-row").hidden = true;`,
`      $("entity-row").hidden = true;
      $("meta-row").hidden = true;`, true);

/* ------------------------------------------------------------ Bearbeiten */
edit("addNode: gesperrt",
`  function addNode(kind, bx, by, w, h) {
    if (catchGesperrt()) return null;`,
`  function addNode(kind, bx, by, w, h) {
    if (gesperrt()) return null;
    if (catchGesperrt()) return null;`);
edit("connect: gesperrt",
`  function connect(from, to) {
    if (from === to) return;
    if (catchGesperrt()) return;`,
`  function connect(from, to) {
    if (from === to) return;
    if (gesperrt()) return;
    if (catchGesperrt()) return;`);
edit("removeSel: gesperrt", `  function removeSel() {`, `  function removeSel() {
    if (gesperrt()) return;`);
edit("oeffneZumTippen: gesperrt", `  function oeffneZumTippen(typ, id, td) {`, `  function oeffneZumTippen(typ, id, td) {
    if (gesperrt()) return;`);

/* ---------------------------------------------------------------- Maus */
edit("mousedown Griff: gesperrt",
`    if (grip) {
      ev.preventDefault();
      var gn = nodes.get(grip.dataset.grip);`,
`    if (grip) {
      ev.preventDefault();
      if (gesperrt()) return;
      var gn = nodes.get(grip.dataset.grip);`);
edit("mousedown Anlegen: gesperrt",
`    if (KINDS[tool]) {
      ev.preventDefault();
      if (catchGesperrt()) return;`,
`    if (KINDS[tool]) {
      ev.preventDefault();
      if (gesperrt()) return;
      if (catchGesperrt()) return;`);
edit("mousedown Knoten: eingefroren nur waehlen",
`      if (editing && editing.id === id) return;
      ev.preventDefault();
      if (ev.shiftKey) { auswahlUmschalten("node", id); render(); return; }`,
`      if (editing && editing.id === id) return;
      ev.preventDefault();
      if (ev.shiftKey) { auswahlUmschalten("node", id); render(); return; }
      if (frozen) { selSet.clear(); selEdges.clear(); sel = { type: "node", id: id }; render(); return; }`);

/* -------------------------------------------------------------- Tastatur */
edit("Tastatur: Enter gesperrt",
`    if (ev.key === "Enter" && sel && sel.type === "node") { ev.preventDefault(); beginEdit(sel.id); return; }`,
`    if (ev.key === "Enter" && sel && sel.type === "node") { ev.preventDefault(); if (!gesperrt()) beginEdit(sel.id); return; }`);

/* ---------------------------------------------------------------- Knoepfe */
edit("Verweis/Status/Einfrieren-Knoepfe",
`  var edgeField = $("edge-label");`,
`  // Verweis + Status je Element (C5).
  var linkField = $("node-link");
  function commitLink() {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n) return;
    var v = linkField.value.trim().slice(0, 300);
    if ((n.link || "") === v) return;
    n.link = v; putNode(sel.id); render();
  }
  linkField.addEventListener("change", commitLink);
  linkField.addEventListener("keydown", function (ev) {
    ev.stopPropagation();
    if (ev.key === "Enter") { ev.preventDefault(); commitLink(); linkField.blur(); }
    else if (ev.key === "Escape") { ev.preventDefault(); render(); linkField.blur(); }
  });
  var statusKnoepfe = $("meta-row").querySelectorAll("button[data-status]");
  for (var sk = 0; sk < statusKnoepfe.length; sk++) {
    statusKnoepfe[sk].addEventListener("click", function () {
      if (!sel || sel.type !== "node") return;
      var n = nodes.get(sel.id); if (!n) return;
      n.status = statusLesen(this.dataset.status); putNode(sel.id); render();
    });
  }

  // Einfrieren / Auftauen (C4) — zweistufig, ohne Dialogfenster.
  function frozenAnzeigen() {
    document.body.classList.toggle("frozen", frozen);
    $("frozen-badge").hidden = !frozen;
    $("btn-freeze-txt").textContent = frozen ? "Auftauen" : "Einfrieren";
    $("btn-freeze").title = frozen
      ? "Brett auftauen: danach kann wieder jeder ändern. Zweiter Klick bestätigt."
      : "Stand einfrieren: das Brett wird für alle schreibgeschützt (auch für Claude), der Stand landet als Text in der Ablage. Zweiter Klick bestätigt.";
  }
  $("btn-freeze").addEventListener("click", function () {
    if (noStore || !db) { toast("Nur ein Brett mit Speicher lässt sich einfrieren."); return; }
    if (!freezeArmed) {
      freezeArmed = setTimeout(function () { freezeArmed = null; $("btn-freeze-txt").textContent = frozen ? "Auftauen" : "Einfrieren"; }, 4000);
      $("btn-freeze-txt").textContent = frozen ? "wirklich auftauen?" : "wirklich einfrieren?";
      return;
    }
    clearTimeout(freezeArmed); freezeArmed = null;
    offenesTippenAbschliessen();
    var neu = !frozen;
    track.auftauen = true;         // dieser eine Schreibvorgang darf durch die Sperre
    frozen = neu;                  // sofort lokal, damit putBoard den neuen Wert traegt
    putBoard(titleEl.value, neu);
    track.auftauen = false;
    frozenAnzeigen();
    if (neu) copyOut(JSON.stringify(brettAlsJSON(), null, 2), "Eingefroren — der Stand liegt als Text in der Ablage.");
    else toast("Aufgetaut — das Brett lässt sich wieder ändern.");
  });

  var edgeField = $("edge-label");`);

edit("Titel: gesperrt",
`  titleEl.addEventListener("change", function () {
    var v = titleEl.value.trim() || "Unbenanntes Brett";`,
`  titleEl.addEventListener("change", function () {
    if (gesperrt()) { render(); return; }
    var v = titleEl.value.trim() || "Unbenanntes Brett";`);

edit("Duplizieren: link/status",
`    if (n.kind === "entity") { copy.fields = (n.fields || []).slice(); copy.methods = (n.methods || []).slice(); }
    allNodes.set(id, copy);`,
`    if (n.kind === "entity") { copy.fields = (n.fields || []).slice(); copy.methods = (n.methods || []).slice(); }
    copy.link = n.link || ""; copy.status = statusLesen(n.status);
    allNodes.set(id, copy);`);

/* -------------------------------------------------------------- Handoff */
edit("Handoff: brettAlsJSON ausgliedern",
`  $("btn-handoff").addEventListener("click", function () {
    // Die Nutzlast traegt GENAU die Feldnamen der Datenbank (kind/color/z/sheet), nicht
    // eigene deutsche. Damit gibt es kein zweites Format, das vom Schema wegdriften kann —
    // die Fehlerklasse verschwindet, statt einen Waechter zu brauchen.
    var out = { meta: { board: { title: titleEl.value } }, sheets: {}, nodes: {}, edges: {} };`,
`  // Das ganze Brett als JSON mit den ECHTEN Feldnamen — fuer die Uebergabe (Vorlage) und
  // fuer den eingefrorenen Stand (Ablage).
  function brettAlsJSON() {
    var out = { meta: { board: { title: titleEl.value, frozen: frozen } }, sheets: {}, nodes: {}, edges: {} };`);

edit("Handoff: sheets mit type",
`      out.sheets[s.id] = { name: s.name, order: s.order === Infinity ? i : s.order };`,
`      out.sheets[s.id] = { name: s.name, order: s.order === Infinity ? i : s.order, type: s.type || "" };`);

edit("Handoff: link/status + Funktionsende",
`      if (n.kind === "entity") { out.nodes[id].fields = (n.fields || []).slice(); out.nodes[id].methods = (n.methods || []).slice(); }
    });`,
`      if (n.kind === "entity") { out.nodes[id].fields = (n.fields || []).slice(); out.nodes[id].methods = (n.methods || []).slice(); }
      out.nodes[id].link = n.link || ""; out.nodes[id].status = statusLesen(n.status);
    });`);

edit("Handoff: Klick-Handler beginnt nach brettAlsJSON",
`    var auftrag =
      "Veroeffentliche mir mein eigenes Pinit (Fassung " + FASSUNG + ").\\n\\n" +`,
`    return out;
  }
  $("btn-handoff").addEventListener("click", function () {
    // Die Nutzlast traegt GENAU die Feldnamen der Datenbank (kind/color/z/sheet), nicht
    // eigene deutsche. Damit gibt es kein zweites Format, das vom Schema wegdriften kann.
    var out = brettAlsJSON();
    var auftrag =
      "Veroeffentliche mir mein eigenes Pinit (Fassung " + FASSUNG + ").\\n\\n" +`);

/* ------------------------------------------------------------- Datenbank */
edit("applyNodes: link/status",
`        methods: v.kind === "entity" ? listeLesen(v.methods) : undefined`,
`        methods: v.kind === "entity" ? listeLesen(v.methods) : undefined,
        link: typeof v.link === "string" ? v.link.slice(0, 300) : "",
        status: statusLesen(v.status)`);

edit("meta/board: frozen lesen",
`      if (typeof v.title === "string" && v.title && document.activeElement !== titleEl) {
        titleEl.value = v.title;
        document.title = v.title + " · Pinit";
      }`,
`      if (typeof v.title === "string" && v.title && document.activeElement !== titleEl) {
        titleEl.value = v.title;
        document.title = v.title + " · Pinit";
      }
      var f = !!v.frozen;
      if (f !== frozen) {
        frozen = f;
        frozenAnzeigen();
        if (f) offenesTippenAbschliessen();
        toast(f ? "Dieses Brett wurde eingefroren." : "Dieses Brett wurde aufgetaut.");
      }`);

edit("Kurzhilfe",
`Raster unten rechts · `,
`Raster unten rechts · Reiter-Typ: Symbol am aktiven Reiter klicken · Einfrieren oben rechts (zweimal klicken) · `);

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
