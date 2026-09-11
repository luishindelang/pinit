// Fester Ablauf -> Fingerabdruck. window.__szenario("vorher") speichert, ("nachher") vergleicht.
(function () {
  var R = function () { return window.__rb(); };
  var $ = function (id) { return document.getElementById(id); };
  var out = [];
  var tick = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 25); }); };

  var PROPS = ["display", "background-color", "background-image", "border-top-color", "border-top-style", "border-top-width", "border-radius",
    "box-shadow", "color", "opacity", "visibility", "font-size", "font-weight", "font-family", "font-style", "text-align", "justify-content",
    "align-items", "padding-top", "padding-left", "line-height", "z-index", "cursor", "outline-style", "outline-color", "stroke", "fill",
    "stroke-width", "stroke-dasharray", "white-space", "flex", "min-height", "max-height", "overflow", "width", "height", "left", "top",
    "position", "text-transform", "letter-spacing", "user-select", "pointer-events", "transform", "gap", "grid-template-columns"];
  function comp(el) {
    var cs = getComputedStyle(el), o = {};
    PROPS.forEach(function (p) { o[p] = cs.getPropertyValue(p); });
    if (el.tagName !== "svg" && el.tagName !== "polygon" && el.tagName !== "path" && el.tagName !== "text" && el.tagName !== "g") {
      var b = getComputedStyle(el, "::before"), a = getComputedStyle(el, "::after");
      if (b.content !== "none") o["::before"] = b.background + "|" + b.height + "|" + b.borderBottom + "|" + b.visibility;
      if (a.content !== "none") o["::after"] = a.background + "|" + a.top + "|" + a.visibility;
    }
    return o;
  }
  function pfad(el) {
    var p = [], e = el;
    while (e && e.nodeType === 1 && e.id !== "app") {
      p.unshift(e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : "") + (e.dataset && e.dataset.id ? "[" + e.dataset.id + "]" : ""));
      e = e.parentNode;
    }
    return p.join(">");
  }
  function dom(el) {
    return { p: pfad(el), html: el.outerHTML };
  }
  function layerDom() {
    var a = [];
    Array.prototype.forEach.call($("layer").children, function (c) { a.push(dom(c)); });
    return a;
  }
  function inspDom() {
    var i = $("inspector");
    return { on: i.className, html: i.innerHTML, griff: $("insp-griff").hidden, coords: $("insp-coords").textContent,
      activeId: document.activeElement && document.activeElement.id };
  }
  function tabsDom() { return $("tabs").innerHTML; }
  function css(root) {
    var a = [];
    a.push({ p: "html", c: comp(document.documentElement) });
    Array.prototype.forEach.call(root.querySelectorAll("*"), function (el) { a.push({ p: pfad(el), c: comp(el) }); });
    return a;
  }
  function fp(label, extra) {
    var o = { label: label, layer: layerDom(), insp: inspDom(), tabs: tabsDom(), status: $("status").className + " " + $("status-txt").innerHTML,
      hint: $("hint").className, canvas: $("canvas").className, body: document.body.className, badges: [$("mode-badge").hidden, $("frozen-badge").hidden, $("btn-freeze-txt").textContent],
      zoom: $("zoomval").textContent, sel: JSON.stringify(R().sel), selSet: Array.from(R().selSet), selEdges: Array.from(R().selEdges),
      dbLog: window.__dbLog.length, tool: $("canvas").className, title: document.title, raster: $("z-raster").textContent };
    if (extra) o.extra = extra;
    out.push(o);
  }
  function cssFp(label) {
    document.documentElement.removeAttribute("data-theme");
    var hell = css($("app"));
    document.documentElement.setAttribute("data-theme", "dark");
    var dunkel = css($("app"));
    document.documentElement.removeAttribute("data-theme");
    out.push({ label: label, hell: hell, dunkel: dunkel });
  }
  function screen(bx, by) {
    var r = $("canvas").getBoundingClientRect(), v = R().view;
    return { clientX: r.left + v.x + bx * v.k, clientY: r.top + v.y + by * v.k };
  }
  function maus(typ, el, bx, by, extra) {
    var s = screen(bx, by);
    var ev = new MouseEvent(typ, Object.assign({ bubbles: true, cancelable: true, clientX: s.clientX, clientY: s.clientY, button: 0, buttons: 1 }, extra || {}));
    (el || $("canvas")).dispatchEvent(ev);
  }
  function elAt(bx, by) { var s = screen(bx, by); return document.elementFromPoint(s.clientX, s.clientY); }
  async function ziehen(startEl, ax, ay, bx, by, extra) {
    maus("mousedown", startEl, ax, ay, extra);
    await tick(5);
    maus("mousemove", window, (ax + bx) / 2, (ay + by) / 2, extra);
    maus("mousemove", window, bx, by, extra);
    await tick(5);
    maus("mouseup", window, bx, by, extra);
    await tick(30);
  }
  function taste(key, extra) {
    window.dispatchEvent(new KeyboardEvent("keydown", Object.assign({ bubbles: true, cancelable: true, key: key }, extra || {})));
  }
  var ids = {};
  async function neu(name, kind, x, y, w, h, text) {
    var id = R().addNode(kind, x, y, w, h);
    ids[name] = id;
    await tick(30);
    var e = R().editing();
    if (e) {
      if (text !== undefined) e.el.textContent = text;
      e.finish(text !== undefined);
    }
    await tick(10);
    return id;
  }
  function knoten(name) { return R().nodes.get(ids[name]); }
  function el(name) { return document.querySelector('.node[data-id="' + ids[name] + '"]'); }
  function waehle(name) { var r = R(); r.selSet.clear(); r.selEdges.clear(); r.sel = { type: "node", id: ids[name] }; r.render(); }
  function waehlePfeil(name) { var r = R(); r.selSet.clear(); r.selEdges.clear(); r.sel = { type: "edge", id: ids[name] }; r.render(); }
  function pfeil(name, von, nach) { var r = R(); r.connect(ids[von], ids[nach]); ids[name] = r.sel.id; }
  function feld(id, wert, key) {
    var f = $(id); f.focus(); f.value = wert;
    f.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: key || "Enter", ctrlKey: key === "CtrlEnter" }));
    f.dispatchEvent(new Event("change", { bubbles: true }));
  }

  window.__szenario = async function (modus) {
    out = [];
    // Deterministische Kennungen
    var t0 = 1700000000000, c = 0; Date.now = function () { return t0 + (++c) * 1000; };
    var rc = 0; Math.random = function () { rc++; return ((rc * 7919) % 997) / 997; };
    var clip = []; navigator.clipboard.writeText = function (t) { clip.push(t); return Promise.resolve(); };
    var r = R();
    r.view.x = 200; r.view.y = 100; r.view.k = 1; r.applyView();
    fp("leer");

    await neu("box", "box", 100, 100, 0, 0, "Schritt eins");
    await neu("sticky", "sticky", 400, 100, 200, 160, "# Kopf\n- eins\n- zwei\n1. a\n2. b\nfrei");
    await neu("dia", "diamond", 100, 300, 0, 0, "Ja?");
    await neu("text", "text", 400, 320, 0, 0, "Überschrift");
    await neu("table", "table", 700, 100, 300, 160, "Preise");
    await neu("frame", "frame", 200, 600, 500, 340, "Login");
    await neu("code", "code", 800, 400, 300, 160, "// Kommentar\nconst x = 42; /* block */\nlet s = \"Luis\"; # nope\nSELECT id FROM t WHERE a = 1.5;\n{\"name\": 'x'}\nreturn true;");
    await neu("start", "start", 50, 500, 0, 0);
    await neu("end", "end", 50, 900, 60, 40);
    await neu("wbutton", "widget", 260, 660, 0, 0, "OK");
    await neu("winput", "widget", 260, 720, 0, 0, "Eingabe …");
    await neu("wselect", "widget", 260, 780, 0, 0, "Auswahl");
    await neu("wtoggle", "widget", 260, 840, 0, 0, "Option");
    await neu("wlist", "widget", 480, 660, 0, 0, "Eintrag 1\nEintrag 2\nEintrag 3");
    await neu("wmenu", "widget", 480, 800, 0, 0, "Start | Kunden | Einstellungen");
    await neu("wimage", "widget", 560, 860, 0, 0, "Bild");
    await neu("entity", "entity", 1200, 100, 0, 0, "Kunde");
    await neu("dbm", "dbmodel", 1200, 300, 0, 0, "kunden");
    await neu("cls", "classmodel", 1200, 500, 0, 0, "Kunde");
    fp("angelegt");

    // Baustein-Arten
    var VAR = { winput: "input", wselect: "select", wtoggle: "toggle", wlist: "list", wmenu: "menu", wimage: "image" };
    Object.keys(VAR).forEach(function (k) { waehle(k); $("widget-variant").value = VAR[k]; $("widget-variant").dispatchEvent(new Event("change")); });
    // Rahmen-Layout
    waehle("frame"); $("frame-layout").value = "tablet"; $("frame-layout").dispatchEvent(new Event("change"));
    knoten("frame").w = 500; knoten("frame").h = 340; r.putNode(ids.frame); r.render();
    // Farben, Schrift, Ausrichtung
    waehle("box"); $("swatches").children[5].click(); $("fs-plus").click(); $("t-bold").click(); $("al-left").click(); $("va-top").click();
    waehle("text"); $("t-bold").click(); $("al-right").click(); $("fs-minus").click(); $("fs-minus").click();
    waehle("sticky"); $("swatches").children[10].click(); $("va-bottom").click();
    waehle("dia"); $("swatches").children[3].click();
    waehle("cls"); $("fs-plus").click();
    // Notiz, Verweis, Status
    waehle("box"); feld("node-note", "Eine Notiz\nmit zwei Zeilen", "CtrlEnter"); feld("node-link", "src/a.ts");
    $("meta-row").querySelectorAll("button[data-status]")[2].click();
    waehle("dia"); $("meta-row").querySelectorAll("button[data-status]")[1].click();
    waehle("entity"); $("meta-row").querySelectorAll("button[data-status]")[3].click(); feld("node-link", "https://x.y");
    fp("gestylt");

    // Entitaet-Felder + Auto-Groesse
    waehle("entity"); feld("entity-text", "id: int\nname: string\nemail: string\n\nspeichern()\nloeschen()", "CtrlEnter");
    $("btn-auto").click();
    waehle("dbm"); feld("entity-text", "ID: String NN PK\nName: String\nohneTyp", "CtrlEnter");
    waehle("cls"); feld("entity-text", "- id: int\n\n+ speichern(): void\n+ laden(): Kunde", "CtrlEnter");
    // Tabelle: Gitter, Masse, Zellen
    waehle("table");
    var g = $("tbl-grid").querySelector('input[data-r="1"][data-c="0"]'); g.focus(); g.value = "Apfel";
    g.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" }));
    await tick(10);
    var g2 = $("tbl-grid").querySelector('input[data-r="2"][data-c="0"]'); if (g2) { g2.value = "Birne"; g2.dispatchEvent(new Event("change", { bubbles: true })); }
    $("tbl-col-plus").click(); $("tbl-row-plus").click();
    knoten("table").colW = [60, 80, 120]; knoten("table").rowH = [30, 40, 50, 50]; r.putNode(ids.table); r.render();
    r.tabelleAendernFuer(ids.table, function (n) { return r.zeileEinfuegen(n, 1); });
    r.tabelleAendernFuer(ids.table, function (n) { return r.spalteEinfuegen(n, 0); });
    r.tabelleAendernFuer(ids.table, function (n) { return r.spalteLoeschen(n, 3); });
    r.tabelleAendernFuer(ids.table, function (n) { return r.zeileLoeschen(n, 4); });
    waehle("table"); r.oeffneZumTippen("node", ids.table, el("table").querySelector('td[data-r="1"][data-c="1"]'));
    await tick(30);
    if (r.editing()) { r.editing().el.textContent = "Zelle"; r.editing().finish(true, true); }
    await tick(30);
    if (r.editing()) { r.editing().el.textContent = "Tab"; r.editing().finish(true); }
    await tick(10);
    fp("tabelle");

    // Pfeile
    pfeil("e1", "box", "dia"); pfeil("e2", "dia", "sticky"); pfeil("e3", "start", "box"); pfeil("e4", "box", "end");
    pfeil("e5", "entity", "cls"); pfeil("e6", "wbutton", "winput"); pfeil("e7", "frame", "table");
    waehlePfeil("e1"); feld("edge-label", "ja"); $("edge-row").querySelector("button[data-estyle=dashed]").click();
    waehlePfeil("e2"); $("edge-row").querySelector("button[data-eends=both]").click(); $("edge-row").querySelector("button[data-estyle=dotted]").click(); feld("edge-from", "1"); feld("edge-to", "n");
    waehlePfeil("e5"); $("edge-row").querySelector("button[data-ehead]").click();
    waehlePfeil("e4"); $("edge-row").querySelector("button[data-eends=none]").click();
    r.connect(ids.box, ids.dia);   // Duplikat -> waehlt e1
    fp("pfeile");
    waehle("box"); fp("nachbarschaft-box");
    waehlePfeil("e2"); fp("insp-pfeil");
    ["sticky", "dia", "text", "table", "frame", "code", "start", "end", "wlist", "wmenu", "entity", "dbm", "cls"].forEach(function (k) { waehle(k); fp("insp-" + k); });
    cssFp("css-alles");

    // Mehrfachauswahl + Ausrichten + Sichtbarkeit
    r.sel = null; r.selSet.clear(); r.selEdges.clear(); r.selSet.add(ids.box); r.selSet.add(ids.dia); r.selSet.add(ids.text); r.selEdges.add(ids.e1); r.render();
    fp("mehrfach");
    r.ausrichten("l"); r.ausrichten("v"); fp("ausgerichtet");
    r.auswahlUmschalten("node", ids.text); r.render(); fp("umschalten");
    waehle("frame"); r.sichtbarkeitUmschalten(); fp("frame-versteckt"); cssFp("css-versteckt");
    r.sichtbarkeitUmschalten(); fp("frame-sichtbar");
    waehle("dia"); r.sichtbarkeitUmschalten(); fp("dia-versteckt"); r.sichtbarkeitUmschalten();

    // Duplizieren / Kopieren / Einfuegen
    waehle("box"); r.duplizieren(); fp("dupliziert");
    r.sel = null; r.selSet.clear(); r.selEdges.clear(); r.selSet.add(ids.entity); r.selSet.add(ids.cls); r.render();
    r.kopieren(); r.einfuegenAusAblage(); r.einfuegenAusAblage(); fp("eingefuegt");

    // Maus: verschieben (mit Mitnehmen), Groesse ziehen, Rahmen, Pfeil ziehen, Anlegen ziehen, Umschalt-Klick
    r.sel = null; r.selSet.clear(); r.selEdges.clear(); r.render();
    var f = knoten("frame");
    await ziehen(el("frame"), f.x + 20, f.y + 10, f.x + 57, f.y + 23);
    fp("verschoben-frame");
    waehle("box"); var b = knoten("box");
    await ziehen(document.querySelector('.grip[data-dir="e"]'), b.x + b.w, b.y + b.h / 2, b.x + b.w + 31, b.y + b.h / 2);
    await ziehen(document.querySelector('.grip[data-dir="n"]'), b.x + b.w / 2, b.y, b.x + b.w / 2, b.y - 15);
    fp("groesse-box");
    waehle("start"); var st = knoten("start");
    await ziehen(document.querySelector('.grip[data-dir="se"]'), st.x + st.w, st.y + st.h, st.x + st.w + 20, st.y + st.h + 5);
    fp("groesse-start");
    r.sel = null; r.selSet.clear(); r.selEdges.clear(); r.render();
    r.setTool("select");
    await ziehen($("canvas"), 60, 60, 520, 420);
    fp("marquee");
    await ziehen($("canvas"), 1150, 60, 1500, 400, { shiftKey: true });
    fp("marquee-shift");
    maus("mousedown", el("text"), knoten("text").x + 5, knoten("text").y + 5, { shiftKey: true }); maus("mouseup", window, 0, 0);
    fp("shift-klick");
    r.setTool("link"); var dd = knoten("dia"), tt = knoten("text");
    await ziehen(el("dia"), dd.x + dd.w / 2, dd.y + dd.h / 2, tt.x + 10, tt.y + 10);
    fp("pfeil-gezogen");
    r.setTool("sticky");
    await ziehen($("canvas"), 900, 700, 1050, 810);
    await tick(30); if (r.editing()) { r.editing().el.textContent = "gezogen"; r.editing().finish(true); }
    fp("aufgezogen");
    r.setTool("box"); maus("mousedown", $("canvas"), 900, 900); maus("mouseup", window, 902, 903);
    await tick(30); if (r.editing()) r.editing().finish(false);
    fp("klick-angelegt");
    // Pan mit Hand
    r.setTool("hand"); await ziehen($("canvas"), 100, 100, 130, 90); fp("pan");
    r.setTool("select");
    // Rad
    $("canvas").dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 100 }));
    $("canvas").dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -100, ctrlKey: true, clientX: 300, clientY: 300 }));
    $("canvas").dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 50, shiftKey: true }));
    fp("rad");
    r.view.x = 200; r.view.y = 100; r.view.k = 1; r.applyView();

    // Tastatur
    waehle("box"); taste("ArrowRight"); taste("ArrowDown", { shiftKey: true }); await tick(350); fp("pfeiltasten");
    taste("Escape"); fp("escape");
    waehle("wimage"); taste("Delete"); fp("geloescht");
    waehle("dbm"); taste("c", { ctrlKey: true }); taste("v", { ctrlKey: true }); fp("strg-cv");
    taste("d", { ctrlKey: true }); fp("strg-d");
    waehle("code"); taste("h", { ctrlKey: true, shiftKey: true }); fp("strg-h"); taste("h", { ctrlKey: true, shiftKey: true });
    taste("s"); fp("taste-s"); taste("v");
    taste("!", { shiftKey: true }); fp("fit"); r.view.x = 200; r.view.y = 100; r.view.k = 1; r.applyView();
    // Tippen oeffnen per Enter, Text aendern, Escape verwirft
    waehle("sticky"); taste("Enter"); await tick(30); if (r.editing()) { r.editing().el.textContent = "verworfen"; r.editing().finish(false); } fp("enter-esc");
    // Groesse aus Feldern
    waehle("dia"); feld("sz-w", "200"); feld("sz-x", "300"); fp("felder-groesse");
    // Raster
    r.rasterSchrittSetzen(10); fp("raster10", { snap: [r.snap(37), r.snap(5), r.snap(-13)] });
    $("raster-an").click(); fp("raster-aus", { snap: [r.snap(37.4)] }); $("raster-an").click(); r.rasterSchrittSetzen(24);

    // Reiter
    r.addSheet(); await tick(30);
    var lbl = document.querySelector('.tab-name[contenteditable]'); if (lbl) { lbl.textContent = "Zweiter"; lbl.blur(); }
    await tick(20); var zweiter = r.activeSheet();
    await neu("z1", "box", 0, 0, 0, 0, "auf zwei");
    r.addSheet(); await tick(30); lbl = document.querySelector('.tab-name[contenteditable]'); if (lbl) { lbl.textContent = "Dritter"; lbl.blur(); } await tick(20);
    var dritter = r.activeSheet();
    r.reiterGruppieren(zweiter, "Alpha"); r.reiterGruppieren(dritter, "Alpha"); r.reiterTypSetzen(dritter, "data");
    fp("reiter");
    r.switchSheet("haupt"); fp("reiter-haupt");
    r.tabMenueZeigen({ clientX: 40, clientY: 40 }, zweiter); fp("tab-menue", { menu: $("tab-menu").innerHTML }); $("tab-menu").hidden = true;
    waehle("table"); r.tabellenMenueZeigen({ clientX: 40, clientY: 40 }, ids.table, 1, 1); fp("zellen-menue", { menu: $("tab-menu").innerHTML });
    $("tab-menu").querySelectorAll("button")[2].click(); fp("zelle-menue-loeschen");
    r.switchSheet(dritter); r.deleteSheet(dritter); fp("reiter-geloescht");
    r.switchSheet("haupt");

    // Fremde Staende (Normalisierung)
    var docs = function (arr) { return { docs: arr.map(function (p) { return { id: p[0], data: function () { return p[1]; } }; }), metadata: { fromCache: false } }; };
    var alt = Array.from(r.allNodes.entries()).map(function (p) { return [p[0], JSON.parse(JSON.stringify(p[1]))]; });
    alt.push(["fremd1", { kind: "unbekannt", x: 1, y: 2 }]);
    alt.push(["fremd2", { kind: "box", x: "12", y: "abc", w: 3, h: 4, text: 5, color: "neon", z: "7", fs: 500, bold: 2, align: "mitte", note: 9, valign: "top", link: 3, status: "arbeit", hidden: 1 }]);
    alt.push(["fremd3", { kind: "table", x: 0, y: 0, w: 200, h: 100, text: "t", color: "sky", cells: [["a", "b", "c"], ["d"], "x", ["e", "f", "g", "h"]], colW: [10, "20", 5000], rowH: "x" }]);
    alt.push(["fremd4", { kind: "entity", x: 0, y: 0, w: 200, h: 100, text: "e", color: "lilac", fields: ["a", 5, "b"], methods: "m", auto: "true" }]);
    alt.push(["fremd5", { kind: "widget", x: 0, y: 0, w: 100, h: 30, text: "w", color: "plain", variant: "kaputt", sheet: "gibtsnicht" }]);
    alt.push(["fremd6", { kind: "frame", x: 0, y: 0, w: 100, h: 30, text: "f", color: "plain", layout: "handy", sheet: "" }]);
    alt.push(["fremd7", { kind: "code", x: 0, y: 0, w: 100, h: 30, text: "c", color: "plain", fs: -3, bold: "1", valign: "oben" }]);
    r.applyNodes(docs(alt));
    var alte = Array.from(r.allEdges.entries()).map(function (p) { return [p[0], JSON.parse(JSON.stringify(p[1]))]; });
    alte.push(["fe1", { from: "fremd2", to: "fremd3", label: 7, style: "wild", ends: "x", head: "y", fromLabel: "abcdefghijklmnop", toLabel: 5 }]);
    alte.push(["fe2", { from: "", to: "fremd3" }]);
    alte.push(["fe3", { from: "fremd5", to: "fremd6", sheet: "gibtsnicht" }]);
    r.applyEdges(docs(alte));
    var alts = Array.from(r.sheets.entries()).map(function (p) { return [p[0], JSON.parse(JSON.stringify(p[1]))]; });
    alts.push(["_unsortiert", { name: "boese" }]); alts.push(["s9", { name: 7, order: "3", type: "quatsch", group: 12 }]);
    r.applySheets(docs(alts));
    fp("fremde-staende", { allNodes: Array.from(r.allNodes.entries()), allEdges: Array.from(r.allEdges.entries()), sheets: Array.from(r.sheets.entries()) });
    r.switchSheet("_unsortiert"); fp("unsortiert");
    r.setTool("box"); fp("unsortiert-werkzeug");
    r.addNode("box", 5, 5); fp("unsortiert-anlegen");
    r.switchSheet("haupt");

    // Export
    var ex = r.brettAlsJSON(); $("btn-mermaid").click(); await tick(10); $("btn-handoff").click(); await tick(10);
    fp("export", { json: ex, clip: clip.slice() });

    // Einfrieren
    $("btn-freeze").click(); $("btn-freeze").click(); await tick(10);
    waehle("box"); fp("eingefroren", { clip: clip.length }); cssFp("css-eingefroren");
    r.addNode("box", 1, 1); r.sichtbarkeitUmschalten(); $("swatches").children[2].click();
    fp("eingefroren-versuche");
    $("btn-freeze").click(); $("btn-freeze").click(); await tick(10); fp("aufgetaut");

    // Einstellungen
    r.einstZeigen(true); fp("einst", { keys: $("einst-keys-tabelle").innerHTML, info: $("einst-info-liste").innerHTML, look: $("einst-look").innerHTML });
    document.querySelectorAll("#einst-reiter button")[2].click(); fp("einst-info", { html: $("einst").innerHTML });
    document.querySelectorAll("#einst-guides button")[1].click(); document.querySelectorAll("#einst-rad button")[1].click();
    document.querySelectorAll("#einst-theme button")[2].click(); fp("einst-dunkel", { theme: document.documentElement.getAttribute("data-theme"), ls: JSON.stringify(Object.keys(localStorage).filter(function (k) { return k.indexOf("rb.") === 0; }).sort().map(function (k) { return [k, localStorage.getItem(k)]; })) });
    document.querySelectorAll("#einst-theme button")[0].click(); r.einstZeigen(false);
    // Titel
    $("title").value = "  Mein Brett "; $("title").dispatchEvent(new Event("change")); fp("titel");
    // Inspektor-Feld offen, dann Klick auf Flaeche (Issue #6)
    waehle("box"); $("node-note").focus(); $("node-note").value = "spaeter gespeichert";
    maus("mousedown", $("canvas"), 2000, 2000); maus("mouseup", window, 2000, 2000); await tick(10);
    fp("insp-abschluss", { note: knoten("box").note });

    out.push({ label: "dbLog", log: window.__dbLog });
    var json = JSON.stringify(out);
    if (modus === "vorher") { localStorage.setItem("fp_vorher", json); return "gespeichert " + json.length + " Zeichen, " + out.length + " Aufnahmen"; }
    var vorher = JSON.parse(localStorage.getItem("fp_vorher") || "[]");
    var diffs = [], cssDiffs = {};
    function cmp(a, b, p) {
      if (diffs.length > 80) return;
      if (a === b) return;
      if (typeof a !== typeof b || a === null || b === null || typeof a !== "object") { diffs.push(p + ": " + String(JSON.stringify(a)).slice(0, 300) + "  =>  " + String(JSON.stringify(b)).slice(0, 300)); return; }
      if (Array.isArray(a) && a.length !== b.length) { diffs.push(p + ".length " + a.length + " => " + b.length); }
      // CSS-Aufnahmen: je Element nach Pfad benennen und die Eigenschaften sammeln
      if (a.p !== undefined && a.c && b.c) {
        Object.keys(a.c).forEach(function (k) {
          if (a.c[k] !== b.c[k]) { var key = a.p + " | " + k; cssDiffs[key] = (cssDiffs[key] || "") || (String(a.c[k]).slice(0, 60) + " => " + String(b.c[k]).slice(0, 60)); }
        });
        return;
      }
      var keys = Object.keys(a).concat(Object.keys(b).filter(function (k) { return !(k in a); }));
      keys.forEach(function (k) { cmp(a[k], b[k], p + "." + k); });
    }
    if (vorher.length !== out.length) diffs.push("Aufnahmen " + vorher.length + " => " + out.length);
    out.forEach(function (o, i) { if (vorher[i]) cmp(vorher[i], o, "[" + o.label + "]"); });
    window.__fpNachher = out;
    return { aufnahmen: out.length, diffs: diffs, css: cssDiffs, cssAnzahl: Object.keys(cssDiffs).length, laenge: json.length };
  };
})();
