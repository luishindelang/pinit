/**
 * Patch 1.9: Eigene Schreibvorgaenge zaehlen als Warte-Grund. Solange `writes > 0`, werden
 * hereinkommende Staende aufbewahrt und erst angewendet, wenn alle eigenen Schreibvorgaenge
 * bestaetigt sind — sonst springt nach "Verschieben nimmt mit" jeder Kasten einzeln
 * (jeder set() liefert einen Stand, in dem die anderen Kaesten noch alt sind).
 * Notbremse: haelt der Stand nur wegen writes, wird er nach 3 s trotzdem angewendet.
 */
"use strict";
const fs = require("fs");
const ZIEL = process.argv[2];
if (!ZIEL) { console.error("Aufruf: node patch-1.9.js <datei>"); process.exit(1); }
const E = [];
function edit(was, suche, ersetze) { E.push({ was, suche, ersetze }); }

edit("Fassung", `  var FASSUNG = "1.8";`, `  var FASSUNG = "1.9";`);

edit("track: bei 0 offenen Schreibvorgaengen abarbeiten",
`      writes--; if (writes <= 0) { writes = 0; saved(); }
      return r;
    }, function () { writes--; if (writes < 0) writes = 0; });`,
`      writes--; if (writes <= 0) { writes = 0; saved(); abarbeiten(); }
      return r;
    }, function () { writes--; if (writes <= 0) { writes = 0; abarbeiten(); } });`);

edit("warteGrund + aufbewahren + Notbremse",
`  function warteGrund() {
    return !!(editing || drag || tabFeldAktiv());
  }`,
`  // Seit 1.9 zaehlen auch EIGENE offene Schreibvorgaenge (writes > 0): nach "Verschieben
  // nimmt mit" gehen N set() raus, und jeder liefert einen Stand, in dem die anderen N-1
  // Kaesten noch an der alten Stelle stehen — angewendet sah das aus, als wuerden die
  // Kaesten einzeln nachruecken. Jetzt wird bis zur letzten Bestaetigung gewartet
  // (track() ruft abarbeiten(), sobald writes auf 0 faellt).
  function warteGrund() {
    return !!(editing || drag || tabFeldAktiv() || writes > 0);
  }
  function bedienWarteGrund() {
    return !!(editing || drag || tabFeldAktiv());
  }
  // Notbremse: haengt ein Schreibvorgang (Netz weg, nie bestaetigt), duerfen fremde Staende
  // nicht ewig liegen bleiben. Haelt ein Stand NUR wegen writes, wird er nach 3 s trotzdem
  // angewendet — die Statuszeile zeigt den haengenden Schreibvorgang weiter.
  var schreibNotbremse = null;
  function aufbewahren(was, snap) {
    wartend[was] = snap;
    if (!bedienWarteGrund() && !schreibNotbremse) {
      schreibNotbremse = setTimeout(function () {
        schreibNotbremse = null;
        abarbeiten(true);
      }, 3000);
    }
  }`);

edit("abarbeiten: erzwingen-Parameter",
`  function abarbeiten() {
    if (warteGrund()) return;
    var w = wartend;`,
`  function abarbeiten(erzwingen) {
    if (bedienWarteGrund()) return;
    if (!erzwingen && writes > 0) return;
    if (schreibNotbremse) { clearTimeout(schreibNotbremse); schreibNotbremse = null; }
    var w = wartend;`);

edit("applyNodes: aufbewahren",
`    if (warteGrund()) { wartend.nodes = snap; return; }`,
`    if (warteGrund()) { aufbewahren("nodes", snap); return; }`);
edit("applyEdges: aufbewahren",
`    if (warteGrund()) { wartend.edges = snap; return; }`,
`    if (warteGrund()) { aufbewahren("edges", snap); return; }`);
edit("applySheets: aufbewahren",
`    if (warteGrund()) { wartend.sheets = snap; return; }`,
`    if (warteGrund()) { aufbewahren("sheets", snap); return; }`);

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
