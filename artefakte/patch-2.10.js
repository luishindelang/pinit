/**
 * Patch 2.10: Inspektor aufgeraeumt.
 *  - Vier klappbare Abschnitte in fester Reihenfolge: Einstellungen (bauartspezifisch) ·
 *    Aussehen (Farbe, Text) · Fuer Claude (Status, Verweis, Notiz; Punkt am Titel, wenn
 *    etwas gesetzt ist) · Anordnen (vorn/hinten/duplizieren). Loeschen immer unten.
 *    Klappzustand je Betrachter im Browser gemerkt. Leere Abschnitte verschwinden.
 *  - Baustein-Art und Layout als Auswahlliste statt Knopf-Reihen (die liefen ueber).
 *  - Kennung nach oben neben die Bauart. Inspektor 232 px breit.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-2.10.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze, alle) { E.push({ was, suche, ersetze, alle }); }

edit("Fassung", `  var FASSUNG = "2.9";`, `  var FASSUNG = "2.10";`);

/* ---------------------------------------------------------------- CSS */
edit("CSS: Inspektor breiter, Abschnitte, Auswahllisten",
`  #inspector.on { display: block; }`,
`  #inspector.on { display: block; }
  .insp-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 4px; }
  .insp-top .insp-head { margin-bottom: 0; }
  .insp-top .kennung { margin-top: 0; max-width: 55%; text-align: right; }
  /* Klappbare Abschnitte. Zustand je Betrachter (rb.sec.<id>); leere Abschnitte werden versteckt. */
  .insp-sec { border-top: 1px solid var(--line); padding: 4px 0 2px; }
  .insp-sec[hidden] { display: none; }
  .insp-sec summary {
    list-style: none; cursor: pointer; user-select: none;
    display: flex; align-items: center; gap: 6px; padding: 5px 0;
    font-family: "IBM Plex Mono", monospace; font-size: 9.5px;
    letter-spacing: .11em; text-transform: uppercase; color: var(--ink-3);
  }
  .insp-sec summary::-webkit-details-marker { display: none; }
  .insp-sec summary::before { content: "\\25B8"; font-size: 9px; transition: transform .12s; }
  .insp-sec[open] summary::before { transform: rotate(90deg); }
  .insp-sec summary:hover { color: var(--ink-2); }
  .insp-sec summary .sec-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); display: none; }
  .insp-sec summary.hat .sec-dot { display: inline-block; }
  .insp-sec .insp-field:last-child, .insp-sec .insp-row:last-child { margin-bottom: 6px; }
  .insp-field { margin-bottom: 9px; }
  .insp-field select {
    font: 400 12.5px/1.2 "IBM Plex Sans", sans-serif; color: var(--ink); background: var(--surface-2);
    border: 1px solid var(--line); border-radius: 5px; padding: 6px 8px; width: 100%;
  }
  .insp-field select:focus { outline: none; border-color: var(--accent); background: var(--surface); }
  #btn-del-row { margin-top: 8px; }`);

edit("CSS: Inspektor 232 px",
`    position: absolute; top: 12px; right: 12px; width: 208px;`,
`    position: absolute; top: 12px; right: 12px; width: 232px;`);

edit("CSS: eingefroren auch Auswahllisten",
`  body.frozen #inspector button:not(#insp-id), body.frozen #inspector input, body.frozen #inspector textarea,`,
`  body.frozen #inspector button:not(#insp-id), body.frozen #inspector input, body.frozen #inspector textarea, body.frozen #inspector select,`);

/* ---------------------------------------------------------------- Markup */
// Der ganze Inspektor wird neu aufgebaut — per Regex, weil der alte Block geschuetzte
// Leerzeichen in Platzhaltern traegt (die Anker-Falle aus 1.6 und 2.8).
E.push({ was: "Inspektor-Markup neu", regex: /<aside id="inspector" aria-label="Eigenschaften">[\s\S]*?<\/aside>/, ersetze:
`<aside id="inspector" aria-label="Eigenschaften">
      <div class="insp-top">
        <div class="insp-head" id="insp-kind">Auswahl</div>
        <div class="kennung" id="insp-id" title="Kennung kopieren"></div>
      </div>

      <details class="insp-sec" id="sec-bauart" open>
        <summary>Einstellungen</summary>
        <div class="insp-field" id="widget-row" hidden>
          <label for="widget-variant">Baustein-Art</label>
          <select id="widget-variant">
            <option value="button">Knopf</option>
            <option value="input">Eingabefeld</option>
            <option value="select">Auswahlliste</option>
            <option value="toggle">Schalter</option>
            <option value="list">Liste</option>
            <option value="menu">Menü / Reiterleiste</option>
            <option value="image">Bild-Platzhalter</option>
          </select>
        </div>
        <div class="insp-field" id="frame-row" hidden>
          <label for="frame-layout">Layout</label>
          <select id="frame-layout">
            <option value="frei">frei (wie gezogen)</option>
            <option value="desktop">Desktop · 960 × 600</option>
            <option value="tablet">Tablet · 600 × 800</option>
            <option value="handy">Handy · 360 × 640</option>
          </select>
        </div>
        <div class="insp-field" id="tbl-row" hidden>
          <label>Tabelle</label>
          <div class="tgrp">
            <button id="tbl-row-plus" title="Zeile anhängen">+ Zeile</button>
            <button id="tbl-row-minus" title="Letzte Zeile entfernen">− Zeile</button>
            <button id="tbl-col-plus" title="Spalte anhängen">+ Spalte</button>
            <button id="tbl-col-minus" title="Letzte Spalte entfernen">− Spalte</button>
          </div>
          <label for="tbl-text">Inhalt — eine Zeile je Zeile, Spalten mit |</label>
          <textarea id="tbl-text" placeholder="Spalte 1 | Spalte 2&#10;Wert | Wert" spellcheck="false"></textarea>
        </div>
        <div class="insp-field" id="entity-row" hidden>
          <label for="entity-text">Felder — eine je Zeile · Leerzeile, dann Methoden</label>
          <textarea id="entity-text" placeholder="id: int&#10;name: string&#10;&#10;speichern()" spellcheck="false"></textarea>
        </div>
        <div class="insp-field" id="edge-row" hidden>
          <label for="edge-label">Text am Pfeil</label>
          <input id="edge-label" type="text" maxlength="80" placeholder="z. B. ja" spellcheck="false">
          <label>Linie und Spitzen</label>
          <div class="tgrp">
            <button class="klein" data-estyle="solid" title="Durchgezogen (Klick-Weg, Ablauf)">━━</button>
            <button class="klein" data-estyle="dashed" title="Gestrichelt (Datenfluss)">╍╍</button>
            <button class="klein" data-estyle="dotted" title="Gepunktet (Abhängigkeit)">┈┈</button>
          </div>
          <div class="tgrp">
            <button class="klein" data-eends="to" title="Spitze am Ziel">→</button>
            <button class="klein" data-eends="both" title="Spitzen an beiden Enden">↔</button>
            <button class="klein" data-eends="none" title="Ohne Spitze">—</button>
            <button class="klein" data-ehead="triangle" title="Hohles Dreieck: Vererbung / erbt von" aria-pressed="false">▷</button>
          </div>
          <label>Enden beschriften (1 und n)</label>
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
        </div>
      </details>

      <details class="insp-sec" id="sec-aussehen" open>
        <summary>Aussehen</summary>
        <div class="swatches" id="swatches"></div>
        <div class="insp-field" id="text-row" hidden>
          <label>Text</label>
          <div class="tgrp">
            <button id="fs-minus" title="Schrift kleiner" aria-label="Schrift kleiner">A-</button>
            <span id="fs-val">13 px</span>
            <button id="fs-plus" title="Schrift groesser" aria-label="Schrift groesser">A+</button>
            <button id="t-bold" title="Fett" aria-label="Fett" aria-pressed="false"><b>B</b></button>
            <button id="al-left" title="Linksbuendig" aria-label="Linksbuendig" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h10M4 17h13"/></svg></button>
            <button id="al-center" title="Zentriert" aria-label="Zentriert" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M7 12h10M6 17h12"/></svg></button>
            <button id="al-right" title="Rechtsbuendig" aria-label="Rechtsbuendig" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M10 12h10M7 17h13"/></svg></button>
          </div>
        </div>
      </details>

      <details class="insp-sec" id="sec-claude">
        <summary>Für Claude <span class="sec-dot"></span></summary>
        <div class="insp-field" id="meta-row" hidden>
          <label>Status</label>
          <div class="tgrp">
            <button class="klein" data-status="" title="Kein Status">–</button>
            <button class="klein" data-status="offen" title="Offen: noch zu bauen">offen</button>
            <button class="klein" data-status="arbeit" title="In Arbeit">in Arbeit</button>
            <button class="klein" data-status="fertig" title="Fertig: gebaut">fertig</button>
          </div>
          <label for="node-link">Verweis (Datei, URL, Ticket)</label>
          <input id="node-link" type="text" maxlength="300" placeholder="src/login.ts oder https://…" spellcheck="false">
        </div>
        <div class="insp-field" id="note-row" hidden>
          <label for="node-note">Notiz (nur hier sichtbar)</label>
          <textarea id="node-note" maxlength="4000" placeholder="Details, Verhalten, Regeln — Claude liest sie" spellcheck="false"></textarea>
        </div>
      </details>

      <details class="insp-sec" id="sec-anordnen">
        <summary>Anordnen</summary>
        <div class="insp-row">
          <button id="btn-front"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="12" height="12" rx="1.5"/><path d="M9 21h10a2 2 0 0 0 2-2V9"/></svg>Nach vorn</button>
          <button id="btn-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="12" height="12" rx="1.5" stroke-dasharray="3 2.5"/><rect x="9" y="9" width="12" height="12" rx="1.5"/></svg>Nach hinten</button>
          <button id="btn-dup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="1.5"/><path d="M15 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1"/></svg>Duplizieren</button>
        </div>
      </details>

      <div class="insp-row" id="btn-del-row">
        <button id="btn-del" class="del"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>Löschen <span class="kbd">Entf</span></button>
      </div>
      <div class="coords" id="insp-coords"></div>
    </aside>` });

/* ------------------------------------------------------------ Inspektor JS */
edit("renderInspector: Layout als Auswahlliste",
`      if (n.kind === "frame") {
        var lb = $("frame-row").querySelectorAll("button[data-layout]");
        for (var li = 0; li < lb.length; li++) {
          lb[li].setAttribute("aria-pressed", lb[li].dataset.layout === (n.layout || "frei") ? "true" : "false");
        }
      }`,
`      if (n.kind === "frame") $("frame-layout").value = n.layout || "frei";`);

edit("renderInspector: Baustein-Art als Auswahlliste",
`      if (n.kind === "widget") {
        var vb = $("widget-row").querySelectorAll("button[data-variant]");
        for (var vi = 0; vi < vb.length; vi++) {
          vb[vi].setAttribute("aria-pressed", vb[vi].dataset.variant === variantLesen(n.variant) ? "true" : "false");
        }
      }`,
`      if (n.kind === "widget") $("widget-variant").value = variantLesen(n.variant);`);

edit("render: Abschnitte aufraeumen",
`    renderInspector();
    $("hint").classList.toggle("on", nodes.size === 0 && edges.size === 0);`,
`    renderInspector();
    sektionenAufraeumen();
    $("hint").classList.toggle("on", nodes.size === 0 && edges.size === 0);`);

/* ---------------------------------------------------------------- Knoepfe */
edit("Layout: Auswahlliste statt Knoepfe",
`  var layoutKnoepfe = $("frame-row").querySelectorAll("button[data-layout]");
  for (var lk = 0; lk < layoutKnoepfe.length; lk++) {
    layoutKnoepfe[lk].addEventListener("click", function () {
      if (!sel || sel.type !== "node") return;
      var n = nodes.get(sel.id); if (!n || n.kind !== "frame") return;
      var l = layoutLesen(this.dataset.layout);
      n.layout = l;
      if (LAYOUTS[l]) { n.w = LAYOUTS[l][0]; n.h = LAYOUTS[l][1]; }
      putNode(sel.id); render();
    });
  }`,
`  $("frame-layout").addEventListener("change", function () {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n || n.kind !== "frame") return;
    var l = layoutLesen(this.value);
    n.layout = l;
    if (LAYOUTS[l]) { n.w = LAYOUTS[l][0]; n.h = LAYOUTS[l][1]; }
    putNode(sel.id); render();
  });`);

edit("Baustein-Art: Auswahlliste statt Knoepfe",
`  var variantKnoepfe = $("widget-row").querySelectorAll("button[data-variant]");
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
  }`,
`  $("widget-variant").addEventListener("change", function () {
    if (!sel || sel.type !== "node") return;
    var n = nodes.get(sel.id); if (!n || n.kind !== "widget") return;
    var alt = variantLesen(n.variant), neu = variantLesen(this.value);
    if (alt === neu) return;
    if (n.text === VARIANTS[alt].text) n.text = VARIANTS[neu].text;
    n.variant = neu;
    n.w = VARIANTS[neu].w; n.h = VARIANTS[neu].h;
    putNode(sel.id); render();
  });`);

edit("Abschnitte: Zustand merken + leere verstecken",
`  var edgeField = $("edge-label");`,
`  // Klappbare Abschnitte des Inspektors: Zustand je Betrachter, leere Abschnitte weg,
  // Punkt am Titel "Fuer Claude", wenn Status, Verweis oder Notiz gesetzt sind.
  var SEKTIONEN = ["sec-bauart", "sec-aussehen", "sec-claude", "sec-anordnen"];
  SEKTIONEN.forEach(function (id) {
    var d = $(id);
    var gemerkt = load("rb.sec." + id);
    if (gemerkt === "1") d.open = true; else if (gemerkt === "0") d.open = false;
    d.addEventListener("toggle", function () { store("rb.sec." + id, d.open ? "1" : "0"); });
  });
  function sichtbar(id) { var el = $(id); return el && !el.hidden && el.style.display !== "none"; }
  function sektionenAufraeumen() {
    $("sec-bauart").hidden = !(sichtbar("widget-row") || sichtbar("frame-row") || sichtbar("tbl-row") ||
      sichtbar("entity-row") || sichtbar("edge-row") || sichtbar("align-row"));
    $("sec-aussehen").hidden = !(sichtbar("swatches") || sichtbar("text-row"));
    $("sec-claude").hidden = !(sichtbar("meta-row") || sichtbar("note-row"));
    $("sec-anordnen").hidden = !sichtbar("btn-front");
    var n = sel && sel.type === "node" ? nodes.get(sel.id) : null;
    var hat = !!(n && (n.status || n.link || n.note));
    $("sec-claude").querySelector("summary").classList.toggle("hat", hat);
  }

  var edgeField = $("edge-label");`);

/* ================================ Lauf ================================ */
const original = fs.readFileSync(ZIEL, "utf8");
let src = original;
const fehler = [];
E.forEach(function (e, i) {
  if (e.regex) {
    const m = src.match(e.regex);
    if (!m) { fehler.push("  [" + (i + 1) + "] " + e.was + " -> Regex ohne Treffer"); return; }
    src = src.replace(e.regex, function () { return e.ersetze; });
    return;
  }
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
