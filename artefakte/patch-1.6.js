/**
 * Patch 1.6: Kennung im Inspektor (kopierbar) + Notiz-Feld je Element (`note`).
 * Erst ALLE Anker pruefen, dann schreiben, dann melden — wie patch-1.5.js.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-1.6.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze) { E.push({ was, suche, ersetze }); }

/* ---------------------------------------------------------------- 1  CSS */
edit("CSS: Notiz-Textfeld + Kennung + Notiz-Marke",
`  .coords {
    font-family: "IBM Plex Mono", monospace; font-size: 10px;
    color: var(--ink-3); margin-top: 10px;
    font-variant-numeric: tabular-nums;
  }`,
`  .coords {
    font-family: "IBM Plex Mono", monospace; font-size: 10px;
    color: var(--ink-3); margin-top: 10px;
    font-variant-numeric: tabular-nums;
  }
  /* Kennung des Elements: damit man Claude sagen kann "aendere nodes/XYZ". Klick kopiert. */
  .kennung {
    font-family: "IBM Plex Mono", monospace; font-size: 10px;
    color: var(--ink-3); margin-top: 4px; cursor: copy;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .kennung:hover { color: var(--accent); }
  .insp-field textarea {
    font: 400 12px/1.35 "IBM Plex Sans", sans-serif;
    color: var(--ink); background: var(--surface-2);
    border: 1px solid var(--line); border-radius: 5px; padding: 6px 8px;
    width: 100%; min-height: 64px; resize: vertical;
  }
  .insp-field textarea:focus { outline: none; border-color: var(--accent); background: var(--surface); }
  /* Kleine Ecke oben rechts: "hier liegt eine Notiz". Nur Anzeige, keine Bedienung. */
  .node .note-mark {
    position: absolute; top: 0; right: 0; width: 0; height: 0;
    border-style: solid; border-width: 0 11px 11px 0;
    border-color: transparent var(--accent) transparent transparent;
    opacity: .75; pointer-events: none;
  }
  .node.diamond .note-mark { top: 4px; right: 4px; }`);

/* ------------------------------------------------------- 2  Inspektor-HTML */
edit("Inspektor: Notiz-Zeile nach der Pfeil-Zeile",
`        <input id="edge-label" type="text" maxlength="80" placeholder="z. B. ja" spellcheck="false">
      </div>`,
`        <input id="edge-label" type="text" maxlength="80" placeholder="z. B. ja" spellcheck="false">
      </div>
      <div class="insp-field" id="note-row" hidden>
        <label for="node-note">Notiz (nur hier sichtbar)</label>
        <textarea id="node-note" maxlength="4000" placeholder="Details, die nicht aufs Brett gehören — auch für Claude lesbar" spellcheck="false"></textarea>
      </div>`);

edit("Inspektor: Kennungs-Zeile unter den Koordinaten",
`      <div class="coords" id="insp-coords"></div>`,
`      <div class="coords" id="insp-coords"></div>
      <div class="kennung" id="insp-id" title="Kennung kopieren"></div>`);

/* -------------------------------------------------------------- 3  Modell */
edit("Fassung", `  var FASSUNG = "1.5";`, `  var FASSUNG = "1.6";`);
edit("Kommentar allNodes",
`  var allNodes = new Map(); // id -> {kind,x,y,w,h,text,color,z,sheet,fs,bold,align}`,
`  var allNodes = new Map(); // id -> {kind,x,y,w,h,text,color,z,sheet,fs,bold,align,note}`);

/* ------------------------------------------------------------- 4  putNode */
edit("putNode: note schreiben",
`      text: n.text, color: n.color, z: n.z, sheet: n.sheet || HOME,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || ""
    }));`,
`      text: n.text, color: n.color, z: n.z, sheet: n.sheet || HOME,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || "",
      note: n.note || ""
    }));`);

/* --------------------------------------------------------- 5  renderNodes */
edit("renderNodes: Notiz-Marke",
`      grip.dataset.grip = id;
      el.appendChild(grip);`,
`      grip.dataset.grip = id;
      el.appendChild(grip);

      if (n.note) {
        var mark = document.createElement("div");
        mark.className = "note-mark";
        el.appendChild(mark);
        el.title = n.note.length > 200 ? n.note.slice(0, 200) + " …" : n.note;
      }`);

/* ----------------------------------------------------- 6  renderInspector */
edit("renderInspector: Knoten — Notiz + Kennung",
`      $("edge-row").hidden = true;
      $("text-row").hidden = false;
      textFelderSetzen(n);
      $("insp-coords").textContent =
        "x " + Math.round(n.x) + "  y " + Math.round(n.y) +
        "   " + Math.round(n.w) + "×" + Math.round(n.h);`,
`      $("edge-row").hidden = true;
      $("text-row").hidden = false;
      $("note-row").hidden = false;
      textFelderSetzen(n);
      // Wie beim Pfeiltext: waehrend getippt wird, den Wert NICHT ueberschreiben —
      // sonst wirft ein hereinkommender Stand den halben Satz weg.
      var nf = $("node-note");
      if (document.activeElement !== nf) nf.value = n.note || "";
      $("insp-coords").textContent =
        "x " + Math.round(n.x) + "  y " + Math.round(n.y) +
        "   " + Math.round(n.w) + "×" + Math.round(n.h);
      $("insp-id").textContent = "nodes/" + sel.id;`);

edit("renderInspector: Pfeil — Notiz weg, Kennung",
`      var f = $("edge-label");
      if (document.activeElement !== f) f.value = e ? (e.label || "") : "";
      $("insp-coords").textContent = "Reiter: " + sheetName(activeSheet);`,
`      $("note-row").hidden = true;
      var f = $("edge-label");
      if (document.activeElement !== f) f.value = e ? (e.label || "") : "";
      $("insp-coords").textContent = "Reiter: " + sheetName(activeSheet);
      $("insp-id").textContent = "edges/" + sel.id;`);

/* ------------------------------------------------- 7  Knoepfe/Feld-Handler */
edit("Notiz-Feld: Handler + Kennung kopieren",
`  $("btn-back").addEventListener("click", function () {`,
`  // Notiz-Feld: Schreibpfad wie beim Pfeiltext (change = uebernehmen, Esc = verwerfen).
  // Kein warteGrund(): ein hereinkommender Stand laesst das Feld in Ruhe, solange es den
  // Fokus hat (s. renderInspector) — darum braucht es keinen eigenen Warte-Merker.
  var noteField = $("node-note");
  function commitNote() {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n) return;
    var v = noteField.value.replace(/\\r\\n?/g, "\\n").trim().slice(0, 4000);
    if ((n.note || "") === v) return;
    n.note = v;
    putNode(sel.id);
    render();
  }
  noteField.addEventListener("change", commitNote);
  noteField.addEventListener("keydown", function (ev) {
    ev.stopPropagation();   // Entf/Buchstaben duerfen nicht als Brett-Kuerzel wirken
    if (ev.key === "Enter" && (ev.ctrlKey || ev.metaKey)) {
      ev.preventDefault(); commitNote(); noteField.blur();
    } else if (ev.key === "Escape") {
      ev.preventDefault();
      var n = sel && sel.type === "node" ? nodes.get(sel.id) : null;
      noteField.value = n ? (n.note || "") : "";
      noteField.blur();
    }
  });
  $("insp-id").addEventListener("click", function () {
    var t = $("insp-id").textContent;
    if (t) copyOut(t, "Kennung kopiert: " + t);
  });

  $("btn-back").addEventListener("click", function () {`);

edit("Duplizieren: note mitnehmen",
`      text: n.text, color: n.color, z: topZ() + 1, sheet: activeSheet,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || ""
    };`,
`      text: n.text, color: n.color, z: topZ() + 1, sheet: activeSheet,
      fs: n.fs || 0, bold: n.bold || 0, align: n.align || "",
      note: n.note || ""
    };`);

/* ------------------------------------------------------------ 8  Handoff */
edit("Handoff: note mitgeben",
`        text: n.text, color: n.color, z: n.z, sheet: reiterFuer(n.sheet),
        fs: n.fs || 0, bold: n.bold || 0, align: n.align || ""
      };`,
`        text: n.text, color: n.color, z: n.z, sheet: reiterFuer(n.sheet),
        fs: n.fs || 0, bold: n.bold || 0, align: n.align || "",
        note: n.note || ""
      };`);

/* ---------------------------------------------------------- 9  applyNodes */
edit("applyNodes: note einlesen und kappen",
`        align: v.align === "left" || v.align === "center" || v.align === "right" ? v.align : ""
      });`,
`        align: v.align === "left" || v.align === "center" || v.align === "right" ? v.align : "",
        note: typeof v.note === "string" ? v.note.slice(0, 4000) : ""
      });`);

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
