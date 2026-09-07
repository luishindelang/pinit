# Spezifikation: Beispiel: Anfrage bis Event
Stand: 2026-09-07 · eingefroren: nein · Quelle: https://claude.ai/code/artifact/cf961f04-6f2e-41d2-9d5a-eb3a1f8b1a04
Reiter: 2 („Übersicht“ ohne Typ · „Bildschirme“ Typ Bildschirm) · 16 Elemente · 4 Pfeile

## Überblick
Das Brett hat zwei Teile. Erstens einen Ablauf: Eine Anfrage kommt herein, es wird geprüft, ob der
Termin frei ist; wenn ja, geht ein Angebot raus und das Event bleibt „ausstehend“, wenn nein, wird
freundlich abgesagt. Zweitens einen Bildschirm „Anmelden“ mit E-Mail, Passwort, „Angemeldet
bleiben“, Anmelde-Knopf und „Passwort vergessen?“. Ein Datenmodell, eine Architektur und Code
fehlen. Wie Bildschirm und Ablauf zusammenhängen, sagt das Brett nicht.

## Bildschirme
### Anmelden · Layout frei (480×420) · ⟨nodes/mtrl0a01-login⟩ [offen]
Verhalten (Notiz am Rahmen):
- Anmelden prüft E-Mail + Passwort gegen den Benutzerdienst.
- Fehlerfall „falsche Zugangsdaten“: roter Hinweis unter dem Passwortfeld, Felder bleiben gefüllt.
- „Angemeldet bleiben“ setzt ein langlebiges Sitzungs-Token.
- „Passwort vergessen?“ führt zur Seite „Passwort zurücksetzen“ (noch nicht skizziert).

| Baustein | Art | Beschriftung | Verhalten (aus `note`) | Status | Kennung |
|---|---|---|---|---|---|
| Überschrift | Beschriftung | Anmelden | – | offen | ⟨nodes/mtrl0a02-titel⟩ |
| Eingabefeld | input | E-Mail | Pflichtfeld. Gültige E-Mail-Adresse, Kleinbuchstaben beim Vergleich. | offen | ⟨nodes/mtrl0a03-email⟩ |
| Eingabefeld | input | Passwort | Pflichtfeld, verdeckte Eingabe. Enter löst „Anmelden“ aus. | offen | ⟨nodes/mtrl0a04-passwort⟩ |
| Schalter | toggle | Angemeldet bleiben | – | offen | ⟨nodes/mtrl0a05-merken⟩ |
| Knopf | button | Anmelden | Primärer Knopf. Inaktiv, solange ein Pflichtfeld leer ist. | offen | ⟨nodes/mtrl0a06-anmelden⟩ |
| Link | Beschriftung (klein) | Passwort vergessen? | Link. Ziel: Seite „Passwort zurücksetzen“. | offen | ⟨nodes/mtrl0a07-vergessen⟩ |

Navigation: keine Pfeile von diesem Bildschirm weg. Das Ziel „Passwort zurücksetzen“ existiert
nur als Text in der Notiz, nicht als Bildschirm.

## Datenmodell
Keines (kein Element der Art `entity`).

## Abläufe
Reiter „Übersicht“ (ohne Typ), Block „Anfrage bis Event“ ⟨nodes/t1⟩. Kein Start-/Ende-Kreis.

1. **Anfrage kommt rein** ⟨nodes/n1⟩
2. **Termin frei?** ⟨nodes/n2⟩ — Entscheidung
   - Wenn *ja* → 3
   - Wenn *nein* → 4
3. **Angebot senden** ⟨nodes/n3⟩ → danach 5
4. **Freundlich absagen** ⟨nodes/n4⟩ (rot) — Ende dieses Zweigs
5. **Event ausstehend** ⟨nodes/n5⟩ — Ende

Pfeile e1 n1→n2 · e2 n2→n3 „ja“ · e3 n2→n4 „nein“ · e4 n3→n5, alle durchgezogen mit Spitze am Ziel.

## Architektur
Keine.

## Beispiele und Code
Keine `code`-Elemente.

## Weitere Elemente (ohne Bedeutung für die Umsetzung)
- 📝 Notiz „Beispiel zum Ausprobieren. Alles darf weg: anklicken, Entf.“ ⟨nodes/s1⟩
- 📝 Leere Notiz 583×575 ⟨nodes/mtqy57yx-r6f4l⟩ hinter dem Ablauf, Träger-Fläche
- ▦ Tabelle „Tabelle“ ⟨nodes/mtrag4av-so3h5⟩, Kopfzeile „Spalte 1 | “, zwei leere Zeilen — ohne Inhalt

## Was zu bauen ist
**Bildschirm Anmelden** — alles offen:
- Seite/Fenster „Anmelden“ ⟨nodes/mtrl0a01-login⟩ mit den sechs Bausteinen oben
- Anmeldung gegen den Benutzerdienst, Fehlerhinweis bei falschen Zugangsdaten
- Sitzungs-Token bei „Angemeldet bleiben“
- Link zu „Passwort zurücksetzen“ (Zielseite fehlt)

**Ablauf Anfrage bis Event** — ohne Status:
- Anfrage erfassen ⟨nodes/n1⟩ · Terminprüfung ⟨nodes/n2⟩ · Angebot senden ⟨nodes/n3⟩ ·
  Absage senden ⟨nodes/n4⟩ · Zustand „Event ausstehend“ ⟨nodes/n5⟩

Offen: 7 · In Arbeit: 0 · Fertig: 0 (ohne Status: 9)

## Offene Fragen
1. **Gehören Login und Ablauf zur selben Software?** Nichts verbindet sie. Wer meldet sich an —
   der Kunde, der die Anfrage stellt, oder das Team, das prüft?
2. **Was ist der „Benutzerdienst“?** Eigene Nutzertabelle, Microsoft-Konto, etwas anderes?
   Es gibt kein Datenmodell für Benutzer.
3. **Seite „Passwort zurücksetzen“** fehlt als Bildschirm. Soll sie skizziert werden, oder reicht
   ein Standard-Ablauf per E-Mail-Link?
4. **Was passiert nach erfolgreicher Anmeldung?** Kein Pfeil, kein Zielbildschirm.
5. **Anfrage-Daten:** Welche Felder kommen herein (Name, Kontakt, Wunschtermin, Personenzahl)?
6. **Terminprüfung:** Wogegen (Kalender, Ressource) und durch wen (automatisch, von Hand)?
7. **Angebot und Absage:** Inhalt, Kanal, Vorlagen?
8. **Was folgt auf „Event ausstehend“?** Zusage, Absage durch Kunden, Erinnerung? Kein Ende-Kreis.
9. **Leere Tabelle und leere Träger-Notiz** auf „Übersicht“: Test-Reste oder gewollt?
