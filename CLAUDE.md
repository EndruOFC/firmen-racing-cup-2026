# Firmen Racing Cup 2026 — Projekt-Übersicht

Ziel: Zentrale Web-App für die Saison 2026 des Firmen Racing Cup. Anzeige von Events,
Resultaten, Team- und Fahrerinformationen; Live-Rangliste basierend auf Assetto Corsa
JSON-Ergebnissen; Deployment via GitHub Pages. Keine Build-Toolchain — direktes
File-Serving.

## Firmenbezug

- Veranstalter: Hybrid Racing Au SG
- Präsentiert von: Lässer Stickmaschinen AG & Menzi Muck AG
- 8 Teams · 16 Fahrer · Porsche 911 GT3 RS (992) · 4 Events Sept–Dez 2026

## Farben / Branding

- Primär: Gelb `#FFD100` (`--color-primary`) mit dunklem Anthrazit `#0A0A0A` (`--color-dark`)
- CI-Variablen zentral in `css/style.css` unter `:root`
- Fonts: Orbitron (Überschriften, Badges, Zahlen) + Rajdhani (Body-Text)
- Akzente: Gold `#C9A84C` / Silver `#A8A9AD` / Bronze `#CD7F32` für Podium
- Team-Farben individuell per `--team-color` CSS-Custom-Property in `js/config.js`
- Menzi-Muck-Logo benötigt `filter: invert(1) hue-rotate(180deg)` für Dark Theme

## Tech-Stack

- Frontend: Statische HTML-Seiten (`index.html`, `standings.html`, `events.html`, `teams.html`)
- Styling: CSS (`css/style.css`, 1360 Zeilen) — keine Build-Toolchain, kein Sass/PostCSS
- Logik: Vanilla JavaScript (`js/config.js`, `js/parser.js`, `js/app.js`)
- Tooling: Node.js-Skript `tools/convert-registration.js` zum Konvertieren von Anmeldungen
- Daten: Assetto Corsa Result JSONs in `results/`
- Hosting: GitHub Pages (root-Deployment, Branch `main`)
- Dev-Server: `.claude/serve.ps1` (PowerShell HTTP-Server Port 3333, MIME-Types korrekt)

## Datenmodell-Überblick

`js/config.js` — zentrale Konfiguration `FRC_CONFIG`:
- `season`: { name, year, organizer, car, sim, motto }
- `points`: [25, 20, 16, 13, 11, 9, 7, 5]  (Index 0 = P1)
- `bonusPole`: 1, `bonusFastestLap`: 1, `finaleMultiplier`: 2
- `teams[]`: { id, name, shortName, color, logo, drivers: ["Vorname Nachname", …] }
- `events[]`: { id, number, label, name, track, trackFlag, date, format, isFinale, resultsFile }
- `nextEvent`: computed — erstes Event dessen Datum >= heute

Ergebnisquelle: AC-JSON (`results/*.json`) — Schema:
```
{ TrackName, TrackConfig, Type, DurationSecs, Date,
  Cars: [{ CarId, Model, Driver: { Name, Team } }],
  Grid: [carIndex, ...],          // Startaufstellung
  Result: [{ CarIndex, DriverName, BestLap, TotalTime }],   // nach Zielreihenfolge sortiert
  Laps: [{ LapTime, CarIndex, Cuts, Sectors }] }
```

Laufzeit-Derivate (`js/parser.js` — `ACParser` IIFE):
- `finishOrder[]`: Rennergebnis mit Punkten, Zeiten, isFastestLap
- `grid[]`: Startaufstellung mit Qualifying-Zeiten
- `teamPoints{}`: teamId → { base, bonus, total } (mit Finale-Multiplier)
- `standings[]`: sortiert nach Gesamtpunkten, inkl. Trend (letzte 2 Events)

## Bekannte Entscheidungen

- Punktesystem: P1–P8 = [25,20,16,13,11,9,7,5]; Pole +1; Fastest Lap +1; Finale ×2
- Fahrer-zu-Team Matching: case-insensitiver Namensvergleich — muss exakt mit AC-Export übereinstimmen
- Statische Seiten + clientseitiges Parsen: kein Backend, einfache Git-Pipeline
- Logo-Fallback: `onerror` → SVG-Initialenavatar (Teamfarbe + Kürzel) via `buildInitialsAvatar()`
- AC `NO_TIME`-Sentinel: `2147483647` — wird überall zu "–" konvertiert
- Standings-Tabelle in `standings.html` hat hard-coded Event-Spalten (E01–E03, F) — nicht aus config.js generiert
- `fetch()` 404 → `null` → "kein Ergebnis" (kein Fehler) — korrekte Semantik

## Offene Punkte / ToDos

- **Echte Teamdaten**: Alle Teams/Fahrer in `config.js` sind Platzhalter — Import via `tools/convert-registration.js` sobald Anmeldungen vorliegen
- **Team-Logos**: Nur Sponsor-Logos in `logos/`; Team-Logos fehlen noch
- **CNAME**: README dokumentiert Custom Domain, Datei fehlt im Repository
- **Standings-Header**: In `standings.html` hard-coded (E01, E02, E03, F) — sollte dynamisch aus `FRC_CONFIG.events` generiert werden
- **`--color-primary-glow`**: In `css/style.css` referenziert (Z. 317, 383) aber nicht in `:root` definiert → silent fail
- **DNF-Handling**: Verhalten bei `TotalTime=0` oder `-1` nicht explizit definiert
- **Tests/Validierung**: Keine automatischen Tests für `js/parser.js` oder `tools/convert-registration.js`
- **OG-Metatags**: Kein `og:image` / `og:title` — Social Media Preview fehlt
- **Internationalisierung / Zeit-Zonen**: `new Date(iso + "T00:00:00")` — Annahme lokale TZ (CH: UTC+2 korrekt)
- **Accessibility (a11y)**: Basis-ARIA vorhanden, aber kein Audit
- **`anmeldungen.json`-Format**: Nur im Convert-Tool-Kommentar dokumentiert; keine Beispieldatei

## Deployment-Setup (GitHub Pages)

1. `main`-Branch auf GitHub pushen
2. Settings → Pages → Source: `main` / Folder: `/ (root)`
3. Optional: `CNAME` in Root mit Domain anlegen + DNS CNAME auf `USERNAME.github.io` zeigen
4. Nach jedem Event: AC-JSON umbenennen, in `results/` ablegen, `git commit && git push`

## Dateien im Repo mit hoher Relevanz

- [index.html](index.html), [standings.html](standings.html), [events.html](events.html), [teams.html](teams.html)
- [js/config.js](js/config.js) — **hier Teams, Fahrer & Events pflegen**
- [js/parser.js](js/parser.js), [js/app.js](js/app.js)
- [css/style.css](css/style.css)
- [results/example-event-01.json](results/example-event-01.json) — AC-Format-Referenz
- [tools/convert-registration.js](tools/convert-registration.js) — Anmeldungs-Konverter

## Workflow nach jedem Event

```bash
# AC-Result-Datei (aus Dokumente\Assetto Corsa\server\results\) umbenennen:
cp <datum>_<zeit>.json results/event-01.json
git add results/event-01.json
git commit -m "Event 01 Ergebnisse: Spielberg"
git push
# → GitHub Pages aktualisiert automatisch
```

## Anmeldungs-Konverter

```bash
# Eingabeformat: JSON-Array von Anmeldungen
# { teamname, fahrer1: { vorname, nachname }, fahrer2: { vorname, nachname } }
node tools/convert-registration.js anmeldungen.json
# → gibt teams: [...] Block für js/config.js auf stdout aus
```
