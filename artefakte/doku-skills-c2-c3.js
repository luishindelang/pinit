// Paket C, Skill-Anteil: C2 Spezifikations-Export (pinit-lesen) und C3 Bausaetze (pinit-schreiben).
"use strict";
const fs = require("fs");
const path = require("path");
const HOME = process.env.USERPROFILE || process.env.HOME;
const SKILLS = path.join(HOME, ".claude", "skills");
const REPO = path.join(HOME, "github", "reissbrett");
function patch(file, E) {
  let s = fs.readFileSync(file, "utf8");
  E.forEach(([a, b], i) => {
    const n = s.split(a).length - 1;
    if (n !== 1) { console.error(file + " Anker " + (i + 1) + ": " + n); process.exit(1); }
    s = s.replace(a, () => b);
  });
  fs.writeFileSync(file, s);
  console.log(path.basename(path.dirname(file)) + "/" + path.basename(file) + " ok");
}

patch(path.join(SKILLS, "pinit-lesen", "SKILL.md"), [
["description: Liest ein Pinit (Whiteboard-Artifact mit db-Capability) über die Artifact-Datenbank aus und schreibt es als Markdown-Datei",
 "description: Liest ein Pinit (Whiteboard-Artifact mit db-Capability) über die Artifact-Datenbank aus und schreibt es als Markdown-Datei — oder mit dem Zusatz „spec“ als Arbeitsauftrag (Spezifikation) für die Umsetzung"],
["## 5. Datei schreiben",
 "## 4b. Spezifikations-Modus — `/pinit-lesen <url> spec`\nDer Nutzer skizziert Software auf dem Brett und will, dass Claude sie **baut**. Dann ist der Abzug\n(Abschnitt 4) zu roh. Der Spezifikations-Modus macht aus dem Brett einen **Arbeitsauftrag**. Er\ngilt automatisch, wenn der Nutzer „spec“, „Spezifikation“, „Arbeitsauftrag“ oder „zum Bauen“ sagt,\noder wenn das Brett eingefroren ist (`frozen: true`) — ein eingefrorenes Brett ist per Definition\ndie Fassung, gegen die gebaut wird.\n\nAufbau der Datei `spec-<titel-slug>-<datum>.md`:\n\n```markdown\n# Spezifikation: <Titel>\nStand: <Datum> · eingefroren: ja/nein · Quelle: <url>\n\n## Überblick\nDrei bis fünf Sätze in Prosa: Was ist das für eine Software, welche Bildschirme, welche Daten,\nwelche Abläufe. Nur aus dem, was auf dem Brett steht — nichts dazuerfinden.\n\n## Bildschirme            (aus Reitern vom Typ screen und aus allen `frame`-Elementen)\n### <Titel des Rahmens> · <Layout> · ⟨nodes/…⟩ [Status]\nBausteine von oben nach unten, mit Bedeutung und was sie tun sollen:\n| Baustein | Art | Beschriftung | Verhalten (aus `note`) | Kennung |\nPfeile, die von diesem Bildschirm wegführen = Navigation: „Klick auf ‚Speichern‘ → Bildschirm X“.\n\n## Datenmodell            (aus `entity`-Elementen und ihren Pfeilen)\n### <Name> ⟨nodes/…⟩\n| Feld | Typ | Anmerkung |\nMethoden als Liste. Beziehungen: „Kunde 1 — n Auftrag“, Vererbung: „Rechnung erbt von Dokument“.\n\n## Abläufe                (aus Reitern vom Typ flow und aus Ketten mit start/end)\nNummerierte Schritte, Entscheidungen als „Wenn … dann …, sonst …“.\n\n## Architektur            (aus Reitern vom Typ arch; Pfeil-Art = Bedeutung)\nKomponenten und ihre Verbindungen: durchgezogen = ruft auf, gestrichelt = Datenfluss,\ngepunktet = hängt ab von.\n\n## Beispiele und Code     (alle `code`-Elemente, mit Zuordnung zum nächsten Bildschirm/Modell)\n\n## Was zu bauen ist\nAlle Elemente mit Status offen oder in Arbeit, gruppiert nach Bildschirm/Modell, mit Verweis\n(`link`), wenn gesetzt. Fertiges nur zählen. Am Ende: „Offen: n · In Arbeit: n · Fertig: n“.\n\n## Offene Fragen\nAlles, was das Brett nicht beantwortet, aber zum Bauen nötig ist (leere Bausteine, Pfeile ohne\nZiel, Entitäten ohne Felder, Bildschirme ohne Navigation). Als Fragen an den Nutzer formuliert.\n```\n\nRegeln: Kennungen bleiben an jeder Zeile (⟨nodes/…⟩), damit Rückfragen eindeutig sind. Was\nauf dem Brett fehlt, steht unter „Offene Fragen“ — **nicht** stillschweigend ergänzen. Notizen\n(`note`) sind die Quelle für Verhalten und Akzeptanzkriterien; wörtlich übernehmen.\n\n## 5. Datei schreiben"]
]);

patch(path.join(SKILLS, "pinit-schreiben", "SKILL.md"), [
["description: Schreibt Elemente, Pfeile, Reiter oder Notizen in ein Pinit (Whiteboard-Artifact mit db-Capability) über die Artifact-Datenbank — aus einer Liste, einem Text, einem Mermaid-Flowchart oder einer Änderungsanweisung",
 "description: Schreibt Elemente, Pfeile, Reiter oder Notizen in ein Pinit (Whiteboard-Artifact mit db-Capability) über die Artifact-Datenbank — aus einer Liste, einem Text, einem Mermaid-Flowchart, einem Bausatz („Login-Seite“, „Liste mit Suche“, „Formular“, „CRUD-Datenmodell“) oder einer Änderungsanweisung"],
["## 6. Danach",
 "## 5b. Bausätze — fertige Blöcke, die der Nutzer nur noch anpasst\nSagt der Nutzer „Bausatz X“, „leg mir eine Login-Seite an“, „ein Formular für …“, kommt ein\nfertiger Block. Immer: eigener `frame` (Layout nach Wunsch, sonst desktop), Bausteine darin mit\n16 px Rand, alles `status: \"offen\"`, Kennungen im Chat nennen. Zielreiter: der vom Typ `screen`,\nsonst neu anlegen (`type: \"screen\"`), Datenmodelle auf einen Reiter vom Typ `data`.\n\n**Login-Seite** (frame 480×420): Beschriftung „Anmelden“ oben · input „E-Mail“ · input\n„Passwort“ · toggle „Angemeldet bleiben“ · button „Anmelden“ (rechts) · text „Passwort\nvergessen?“ klein darunter. Notiz am Rahmen: Fehlerfall „falsche Zugangsdaten“ als Hinweis unter\ndem Passwortfeld.\n\n**Liste mit Suche** (frame 960×600): menu oben (Einträge vom Nutzer, sonst „Übersicht | Neu |\nEinstellungen“) · input „Suchen …“ links · button „+ Neu“ rechts · table darunter (Kopfzeile aus\nden Feldern der Entität, wenn es eine gibt, sonst „Name | Status | Geändert“, drei Beispielzeilen\nleer) · Notiz: Klick auf Zeile öffnet Detail; Suche filtert live.\n\n**Formular** (frame 600×520): Beschriftung „<Objekt> bearbeiten“ · je Feld der Entität ein input\n(Typ boolean → toggle, Typ mit festen Werten → select, langer Text → sticky als Platzhalter für\nMehrzeiler) · buttons „Speichern“ und „Abbrechen“ unten rechts · Notiz: Pflichtfelder, Validierung.\n\n**CRUD-Datenmodell** (Reiter data): je genanntem Objekt ein `entity` mit `id: int` plus den\nFeldern des Nutzers (`erstellt: datetime`, `geaendert: datetime` ergänzen) · Beziehungen als Pfeile\n`ends: \"none\"` mit `1`/`n` · dazu auf dem screen-Reiter je Objekt eine „Liste mit Suche“ und ein\n„Formular“ — nur wenn der Nutzer „komplett“ oder „mit Bildschirmen“ sagt.\n\n**Ablauf** (Reiter flow): `start` links · Schritte als box in Leserichtung · Entscheidungen als\ndiamond mit „ja“ rechts weiter, „nein“ eine Zeile tiefer · `end` rechts unten.\n\nAlles, was der Bausatz **annimmt** (Feldnamen, Beschriftungen), im Chat als Liste nennen, damit der\nNutzer es korrigieren kann — Bausätze sind Startpunkte, keine Entscheidungen.\n\n## 6. Danach"]
]);

patch(path.join(REPO, "PLAN.md"), [
["- [ ] **C2 Spezifikations-Export**", "- [x] **C2 Spezifikations-Export** (Skill `pinit-lesen … spec`, 2026-09-07; erster echter Lauf steht aus)"],
["- [ ] **C3 Bausätze**", "- [x] **C3 Bausätze** (Skill `pinit-schreiben`, Abschnitt 5b, 2026-09-07; erster echter Lauf steht aus)"]
]);
