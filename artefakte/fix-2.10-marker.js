// 2.10: Klapp-Symbol der Inspektor-Abschnitte — die Schrift zeichnete \25B8 als Quadrat.
"use strict";
const fs = require("fs");
const p = require("path").join(__dirname, "..", "code", "pinit.html");
let s = fs.readFileSync(p, "utf8");
const a = '.insp-sec summary::before { content: "\\25B8"; font-size: 9px; transition: transform .12s; }';
const b = '.insp-sec summary::before { content: "\\203A"; font-size: 13px; line-height: 1; width: 8px; transition: transform .12s; }';
const n = s.split(a).length - 1;
if (n !== 1) { console.error("Anker: " + n + " Treffer"); process.exit(1); }
fs.writeFileSync(p, s.replace(a, () => b));
console.log("marker ok");
