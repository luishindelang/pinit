// Doku-Nachzug fuer Paket C (2.9): CLAUDE.md, PLAN.md, beide globalen Skills.
"use strict";
const fs = require("fs");
const path = require("path");
const HOME = process.env.USERPROFILE || process.env.HOME;
const REPO = path.join(HOME, "github", "reissbrett");
const SKILLS = path.join(HOME, ".claude", "skills");
function patch(file, E) {
  let s = fs.readFileSync(file, "utf8");
  E.forEach(([a, b], i) => {
    const n = s.split(a).length - 1;
    if (n !== 1) { console.error(file + " Anker " + (i + 1) + ": " + n); process.exit(1); }
    s = s.replace(a, () => b);
  });
  fs.writeFileSync(file, s);
  console.log(path.basename(file) + " ok");
}

patch(path.join(REPO, "CLAUDE.md"), [
["  `code` hält reinen Text in Schreibmaschinenschrift (keine Stichpunkt-Deutung), `start`/`end` sind\n  Kreise ohne Text (`ohneText()`, Pfeile enden am Ellipsenrand in `border()`).",
 "  `code` hält reinen Text in Schreibmaschinenschrift (keine Stichpunkt-Deutung), `start`/`end` sind\n  Kreise ohne Text (`ohneText()`, Pfeile enden am Ellipsenrand in `border()`) · **`link`** (2.9, bis\n  300 Zeichen: Datei, URL, Ticket — im Tooltip, im Inspektor) · **`status`** (2.9: \"\" | offen | arbeit |\n  fertig, `statusLesen()`; Punkt oben links rot/gelb/grün)."],
["- `sheets/<id>`: `name` · `order` — fehlt die Sammlung, gilt ein impliziter Reiter `haupt`;",
 "- `sheets/<id>`: `name` · `order` · **`type`** (2.9: \"\" | screen | arch | data | flow, `sheetTypeLesen()`;\n  Symbol vor dem Reiternamen, Klick auf das Symbol des aktiven Reiters wechselt durch) — fehlt die\n  Sammlung, gilt ein impliziter Reiter `haupt`;"],
["- `meta/board`: `title`",
 "- `meta/board`: `title` · **`frozen`** (2.9, boolean). **Eingefroren heißt: niemand ändert etwas — auch\n  Claude nicht.** Die Seite sperrt alle Schreibwege (`gesperrt()` an jedem Erzeuger/Änderer, `body.frozen`\n  legt Inspektor, Werkzeuge, Reiter-Knöpfe und Titel stumpf, `track()` schreibt als letzte Verteidigung\n  nichts außer dem Auftauen), zeigt das Abzeichen EINGEFROREN und legt beim Einfrieren den Stand als JSON\n  in die Ablage (`brettAlsJSON()`, dieselbe Nutzlast wie die Übergabe). `write_db`-Schreiber (der Skill\n  `pinit-schreiben`) lesen `meta/board` zuerst und brechen bei `frozen: true` ab. `set()` auf `meta/board`\n  ersetzt das ganze Dokument — **immer `title` und `frozen` zusammen schreiben** (`putBoard`)."],
["ändern (`snap()`) · **Ausrichten** im Sammel-Modus (`#align-row`, `ausrichten()`): Kanten,\nZentrieren, gleiche Abstände, gleiche Größe. `html, body` sind `overflow: hidden` — die Seite kann\nnicht mehr waagerecht scrollen.",
 "    ändern (`snap()`) · **Ausrichten** im Sammel-Modus (`#align-row`, `ausrichten()`): Kanten,\nZentrieren, gleiche Abstände, gleiche Größe. `html, body` sind `overflow: hidden` — die Seite kann\nnicht mehr waagerecht scrollen. **Paket C (2.9):** Reiter-Typ (Symbol am aktiven Reiter, Klick wechselt),\n**Einfrieren** oben rechts (zweistufig; gesperrt lässt sich nur noch wählen, lesen, Kennung kopieren,\nReiter wechseln, auftauen), **Verweis + Status** je Element im Inspektor (`#meta-row`)."],
["    senkrecht gleich verteilt (8/164/320), gleiche Größe. Überlauf: `html, body { overflow: hidden }`.\n    Schritte 6 und 7 stehen aus.",
 "    senkrecht gleich verteilt (8/164/320), gleiche Größe. Überlauf: `html, body { overflow: hidden }`.\n    Schritte 6 und 7 stehen aus.\n  - **Fassung 2.9 (Paket C), 2026-09-07:** Schritte 1, 2, 3, 4 grün, Rot-Gegenprobe des Patch-Werkzeugs\n    grün. Schritt 5 lokal per DOM: Reiter-Typ wechselt Symbol und Toast; Status setzt Punkt; Verweis im\n    Tooltip. **Einfrieren ist lokal nicht prüfbar** (braucht `meta/board`): am veröffentlichten Brett\n    prüfen — Knopf zweimal → Abzeichen EINGEFROREN, Ablage voll, Anlegen/Ziehen/Tippen/Löschen/Reiter/\n    Titel blockiert mit Hinweis, zweites Fenster zeigt das Abzeichen ebenfalls; Auftauen zweimal → alles\n    geht wieder. Zusätzlich `pinit-schreiben` gegen ein eingefrorenes Brett → muss abbrechen.\n    Schritte 6 und 7 stehen aus."]
]);

patch(path.join(REPO, "PLAN.md"), [
["- [ ] **C1 Reiter-Typ**", "- [x] **C1 Reiter-Typ** (2.9)"],
["- [ ] **C4 Stand einfrieren**", "- [x] **C4 Stand einfrieren** (2.9; Datei-Ablage = Ablage/Clipboard statt `downloads`, damit die Zwei-Artifacts-Invariante unangetastet bleibt)"],
["- [ ] **C5 Verweis und Status je Element**", "- [x] **C5 Verweis und Status je Element** (2.9)"],
["| 2.8 | 2026-09-07 | **Paket B:**",
 "| 2.9 | 2026-09-07 | **Paket C (Seite):** Reiter-Typ (`sheets.type`), Einfrieren (`meta/board.frozen`, sperrt alle Schreibwege, Stand in die Ablage), Verweis + Status je Element (`link`, `status`) |\n| 2.8 | 2026-09-07 | **Paket B:**"]
]);

patch(path.join(SKILLS, "pinit-lesen", "SKILL.md"), [
["- `sheets/<id>`: `name` · `order`.",
 "- `sheets/<id>`: `name` · `order` · `type` (\"\" | screen = Bildschirm | arch = Architektur | data =\n  Datenmodell | flow = Ablauf) — bestimmt, wie der Reiter ausgewertet wird (s. unten).\n- `meta/board`: `title` · `frozen` (true = **eingefrorener Stand**: im Kopf der Datei vermerken\n  „Stand eingefroren“ — das ist die verbindliche Fassung, auf die gebaut wird).\n- Je Element außerdem `link` (Datei/URL/Ticket) und `status` (\"\" | offen | arbeit | fertig)."],
["## <Reitername>   ⟨sheets/<id>⟩",
 "## <Reitername> · <Typ>   ⟨sheets/<id>⟩"],
["- **Bildschirme** (`frame`): eigener Unterabschnitt",
 "- **Reiter-Typ steuert die Form:** `screen` → Bildschirme mit ihren Bausteinen zuerst, dann Rest ·\n  `data` → Entitäten mit Feldern/Methoden und Beziehungen (Kardinalitäten, Vererbung) · `flow` →\n  Ablauf von ● Start bis ◎ Ende als nummerierte Kette · `arch` → Kästen und Pfeile mit Pfeil-Art\n  (Datenfluss/Abhängigkeit) · kein Typ → Standardform.\n- **Status und Verweis** an jede Elementzeile hängen, wenn gesetzt: `[offen]`, `[in Arbeit]`,\n  `[fertig]` und `→ src/login.ts`. Am Ende jedes Reiters eine Zeile „Offen: n · In Arbeit: n ·\n  Fertig: n“.\n- **Bildschirme** (`frame`): eigener Unterabschnitt"]
]);

patch(path.join(SKILLS, "pinit-schreiben", "SKILL.md"), [
["## 0. Bevor du schreibst\n1. **URL**:",
 "## 0. Bevor du schreibst\n0. **Eingefroren?** `read_db get` auf `meta/board`. Steht dort `frozen: true`, **schreibe nichts**\n   und sag dem Nutzer: „Das Brett ist eingefroren. Zum Ändern oben rechts auftauen.“ Das gilt\n   auch für Notizen und für `update`. Keine Ausnahme, kein Nachfragen ob trotzdem.\n1. **URL**:"],
["- `sheets/<id>`: `name` · `order` (ganze Zahl, Reihenfolge in der Leiste).",
 "- `sheets/<id>`: `name` · `order` (ganze Zahl, Reihenfolge in der Leiste) · `type` (\"\" | screen |\n  arch | data | flow) — beim Anlegen eines Reiters passend setzen.\n- Je Element optional `link` (Datei/URL/Ticket, ≤ 300) und `status` (\"\" | offen | arbeit | fertig).\n  Neue Elemente aus einer Skizze bekommen `status: \"offen\"`; was Claude gebaut hat, setzt er\n  danach per `update` auf `fertig` und trägt in `link` die Datei ein."],
["- `meta/board`: `title` — nur ändern, wenn der Nutzer den Titel will.",
 "- `meta/board`: `title` · `frozen` — **immer beide Felder zusammen** schreiben (`set` ersetzt das\n  Dokument); `frozen` nur ändern, wenn der Nutzer ausdrücklich einfrieren/auftauen will."]
]);
