/**
 * Findet Zuweisungen an Namen, die nirgends deklariert sind.
 *
 * WARUM ES DAS GIBT: `node --check` prueft nur die Syntax. Eine Zuweisung an einen nicht
 * deklarierten Namen ist unter "use strict" ein ReferenceError — also ein LAUFZEIT-Fehler,
 * den `--check` niemals sieht. Genau so ist in Fassung 1.3 `reiterAbgleichLief` ins
 * veroeffentlichte Brett gelangt: die Deklaration ging bei einem abgebrochenen Patch-Lauf
 * verloren, die drei Verwendungen blieben. Lokal fiel es nicht auf, weil der betroffene
 * Pfad nur mit echter Datenbank laeuft — gefunden hat es erst eine Review-Brille.
 *
 * Das ist bewusst KEIN allgemeiner Linter (Bordmittel-Prinzip: keine Fremdpakete). Es prueft
 * genau eine Fehlerklasse, und zwar die, die real zugeschlagen hat.
 *
 * Aufruf:  node undeklariert-pruefen.js [datei.html ...]
 *          ohne Argumente: pinit.html
 * Exit 0 = sauber, Exit 1 = Fund (oder Datei/Skriptblock fehlt).
 */
"use strict";

const fs = require("fs");
const path = require("path");

// Namen, die die Laufzeit stellt — keine Deklaration im Skript erwartet.
const GLOBAL = new Set([
  "window", "document", "navigator", "localStorage", "sessionStorage", "console",
  "setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame",
  "getComputedStyle", "Math", "JSON", "Object", "Date", "String", "Number", "Boolean",
  "Array", "Map", "Set", "Promise", "RegExp", "Error", "TypeError", "Infinity", "NaN",
  "undefined", "isFinite", "isNaN", "parseInt", "parseFloat", "encodeURIComponent",
  "decodeURIComponent", "MouseEvent", "KeyboardEvent", "Range", "claude", "self", "globalThis"
]);

function skriptAus(html) {
  const m = html.match(/<script>([\s\S]*)<\/script>/);
  return m ? m[1] : null;
}

// Kommentare und Zeichenketten entfernen, damit ihr Inhalt nicht als Code gelesen wird.
// Zeichenketten werden durch gleich lange Leerzeichen ersetzt, damit Zeilennummern stimmen.
function entkleiden(src) {
  let out = "";
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      while (i < src.length && src[i] !== "\n") { out += " "; i++; }
    } else if (c === "/" && n === "*") {
      out += "  "; i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) {
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  "; i += 2;
    } else if (c === '"' || c === "'" || c === "`") {
      const q = c;
      out += " "; i++;
      while (i < src.length && src[i] !== q) {
        if (src[i] === "\\") { out += "  "; i += 2; continue; }
        out += src[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += " "; i++;
    } else {
      out += c; i++;
    }
  }
  return out;
}

function deklarierte(src) {
  const namen = new Set();
  const zu = (re, gruppe) => {
    let m;
    const r = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    while ((m = r.exec(src)) !== null) if (m[gruppe]) namen.add(m[gruppe]);
  };
  // var a, b = 1, c;
  let m;
  const varRe = /\bvar\s+([^;{}\n]+)/g;
  while ((m = varRe.exec(src)) !== null) {
    m[1].split(",").forEach(function (teil) {
      const name = teil.trim().split(/[=\s]/)[0];
      if (/^[A-Za-z_$][\w$]*$/.test(name)) namen.add(name);
    });
  }
  zu(/\bfunction\s+([A-Za-z_$][\w$]*)/, 1);              // function name(...)
  zu(/\bcatch\s*\(\s*([A-Za-z_$][\w$]*)/, 1);            // catch (e)
  zu(/\b(?:let|const)\s+([A-Za-z_$][\w$]*)/, 1);         // falls je verwendet
  // Funktions-Parameter (auch anonyme Funktionen)
  const parRe = /\bfunction\s*[A-Za-z_$\w]*\s*\(([^)]*)\)/g;
  while ((m = parRe.exec(src)) !== null) {
    m[1].split(",").forEach(function (p) {
      const name = p.trim();
      if (/^[A-Za-z_$][\w$]*$/.test(name)) namen.add(name);
    });
  }
  // Pfeilfunktionen mit einem Parameter: x => …
  zu(/([A-Za-z_$][\w$]*)\s*=>/, 1);
  return namen;
}

function pruefe(datei) {
  if (!fs.existsSync(datei)) {
    console.error("FEHLT: " + datei);
    return 1;
  }
  const roh = skriptAus(fs.readFileSync(datei, "utf8"));
  if (roh === null) {
    console.error("KEIN <script>-Block in " + datei);
    return 1;
  }
  const src = entkleiden(roh);
  const bekannt = deklarierte(src);
  const zeilen = src.split("\n");
  const funde = [];

  // Zuweisung an einen alleinstehenden Namen: NAME = ... (nicht ==, nicht =>, nicht .NAME)
  const re = /(^|[^.\w$])([A-Za-z_$][\w$]*)\s*=(?!=|>)/g;
  zeilen.forEach(function (zeile, nr) {
    let m;
    re.lastIndex = 0;
    while ((m = re.exec(zeile)) !== null) {
      const name = m[2];
      if (bekannt.has(name) || GLOBAL.has(name)) continue;
      // Schluesselwoerter und Objekt-Literal-Schluessel ausschliessen
      if (/^(var|let|const|if|for|while|return|else|case|new|typeof|function|in|of)$/.test(name)) continue;
      const vor = zeile.slice(0, m.index + m[1].length).trimEnd();
      if (vor.endsWith("{") || vor.endsWith(",")) continue;   // { name = … } ist hier nicht gemeint
      funde.push({ zeile: nr + 1, name: name, text: roh.split("\n")[nr].trim() });
    }
  });

  if (funde.length === 0) {
    console.log("  ok  " + path.basename(datei) + " — keine undeklarierten Zuweisungen");
    return 0;
  }
  console.error("BEFUND in " + path.basename(datei) + ":");
  funde.forEach(function (f) {
    console.error("  Zeile " + f.zeile + ": `" + f.name + "` wird zugewiesen, aber nie deklariert");
    console.error("    " + f.text);
  });
  console.error("Unter \"use strict\" ist das ein ReferenceError zur Laufzeit.");
  return 1;
}

const dateien = process.argv.slice(2);
const ziele = dateien.length
  ? dateien
  : ["pinit.html"].map(function (f) {
      return path.join(__dirname, f);
    });

let code = 0;
ziele.forEach(function (z) { code = pruefe(z) || code; });
process.exit(code);
