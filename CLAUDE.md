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
- Styling: CSS (`css/style.css`) — keine Build-Toolchain, kein Sass/PostCSS
- Logik: Vanilla JavaScript (`js/config.js`, `js/parser.js`, `js/app.js`)
- Tooling: Node.js-Skript `tools/convert-registration.js` zum Konvertieren von Anmeldungen
- Daten: Assetto Corsa Result JSONs in `results/`; derzeit nur `example-event-01.json` als Referenz
- Hosting: GitHub Pages (root-Deployment, Branch `main`)
- Dev-Server: `.claude/serve.ps1` (PowerShell HTTP-Server Port 3333, MIME-Types korrekt)

## Seitenstruktur

### `index.html` — Landingpage

Vollständige Abschnitte (in Reihenfolge):
1. **Navbar** — Brand-Link + Nav-Links + Hamburger-Button (`#hamburger` togglet `.open` auf `#navLinks` / `#navRight`)
2. **Hero Photo** (`section.hero-photo#heroLanding`) — Vollbild-Overlay-Hero mit: Dual-Logo-Reihe (Lässer + Menzi Muck), Countdown-Sektion (`#countdownWrap`), CTA-Button-Gruppe; Scroll-Cue unten
3. **Narrativ-Block** (`section.narrative-block`) — Zitat-Block; rein dekorativ/statisch
4. **Partner-Kacheln** (`div.partner-grid`) — 3 Artikel-Kacheln: Lässer, Menzi Muck, Hybrid Racing Au SG; die Hybrid-Racing-Kachel hat kein Logo (Initialen-Avatar `HR`)
5. **Timeline** (`div.timeline-wrap#timelineWrap`) — **hard-coded HTML** für E01–E03 + Grand Finale; Inline-Script setzt `.tl-status`-Badge dynamisch per Datums-Diff (< –7 Tage → grün/Abgeschlossen, ≤ 7 Tage → live/Live, sonst → muted/Upcoming)
6. **Podium Top 3** (`div.podium-grid#podiumGrid`) — Layout P2/P1/P3; befüllt via `renderPodium()` in `app.js`
7. **Saisonkalender Mini** (`div.events-grid#eventsMiniGrid`) — befüllt via `renderEventMiniCards()`
8. **Car-Highlight** (`div.car-highlight`) — statische Fahrzeug-Infos (PS, Vmax, Klasse, Teams, Fahrer); kein JS

Script-Ladereihenfolge: `config.js` → `parser.js` → `app.js` → Inline-Script (Timeline-Badges)

### `standings.html` — Rangliste

- **`<thead>`** mit Event-Spalten ist **hard-coded** (E01 Spielberg / E02 Hockenheim / E03 Nürburgring / F Nordschleife) — nicht aus `FRC_CONFIG.events` generiert
- **`<tbody id="standingsTableBody">`** wird dynamisch von `renderStandings()` befüllt (Event-Spalten korrekt aus `FRC_CONFIG.events` iteriert)
- Scoring-Box mit Punktetabelle (P1–P8 + Pole/FL-Bonus) ist statisch

### `events.html` — Events & Ergebnisse

- Container `#eventsContainer` wird von `renderEvents()` befüllt
- Collapsible Event-Cards: Click auf `.event-card-header` togglet `.open` via `toggleEvent()`
- Ergebnis-Tabs (Startaufstellung / Zieleinlauf): `switchTab()` wechselt `.result-panel.active`
- Zeigt Pole / Fastest Lap als Badges über der Tabelle

### `teams.html` — Teams

- Grid `#teamsGrid` wird von `renderTeams()` befüllt
- Zeigt: Logo/Avatar, Teamname, Rang, Trend, Fahrer-Liste, Punkte/Events/Rang-Stats
- Fallback wenn keine Ergebnisse: Teams aus `FRC_CONFIG.teams` mit 0 Punkten

## Datenmodell-Überblick

`js/config.js` — zentrale Konfiguration `FRC_CONFIG`:
- `season`: { name, year, organizer, car, sim, motto }
- `points`: [25, 20, 16, 13, 11, 9, 7, 5]  (Index 0 = P1)
- `bonusPole`: 1, `bonusFastestLap`: 1, `finaleMultiplier`: 2
- `teams[]`: { id, name, shortName, color, logo, drivers: ["Vorname Nachname", …] }
- `events[]`: { id, number, label, name, track, trackFlag, date, format, isFinale, resultsFile }
- `nextEvent`: computed — erstes Event dessen Datum >= heute (für Countdown)

Alle Teams/Fahrer in `config.js` sind derzeit **Platzhalter** — müssen via `tools/convert-registration.js` aus echten Anmeldungen befüllt werden.

Ergebnisquelle: AC-JSON (`results/*.json`) — Schema:
```
{ TrackName, TrackConfig, Type, DurationSecs, Date,
  Cars: [{ CarId, Model, Driver: { Name, Team } }],
  Grid: [carIndex, ...],          // Startaufstellung
  Result: [{ DriverName, CarModel, BestLap, TotalTime, BallastKG, Restrictor }],
  Laps: [{ LapTime, CarIndex, Cuts, Sectors }] }
```

Laufzeit-Derivate (`js/parser.js` — `ACParser` IIFE):
- `finishOrder[]`: Rennergebnis mit Punkten, Zeiten, isFastestLap, lapCount
- `grid[]`: Startaufstellung mit Qualifying-Zeiten, isPole
- `teamPoints{}`: teamId → { base, bonus, total } (mit Finale-Multiplier)
- `standings[]`: sortiert nach Gesamtpunkten, inkl. Trend (letzte 2 Events)

## `js/app.js` — Funktions-Inventar

| Funktion | Seite | Beschreibung |
|---|---|---|
| `markActiveNav()` | alle | IIFE — setzt `.active` auf aktuellen Nav-Link |
| Hamburger-Listener | alle | togglet `.open` auf `#navLinks` / `#navRight` |
| `teamLogoHTML(team, size)` | alle | gibt `<div>` mit `<img>` + `onerror`-Avatar zurück |
| `buildInitialsAvatar(initials, color, size)` | alle | SVG-Kreis mit Initialen als Fallback |
| `initCountdown()` | index | Countdown zu `FRC_CONFIG.nextEvent`; Sondertext wenn Saison vorbei oder Rennen läuft |
| `renderPodium(standings)` | index | Top-3 in P2/P1/P3-Layout; Leerstand-Placeholder wenn keine Daten |
| `renderEventMiniCards(allResults)` | index | Mini-Kacheln pro Event mit Status-Badge |
| `renderStandings(standings, allResults)` | standings | Tabellen-Zeilen mit Event-Spalten + Trend |
| `renderEvents(allResults)` | events | Collapsible Event-Cards mit `buildResultTabs()` |
| `buildResultTabs(result, ev)` | events | Grid- + Finish-Tabellen mit Tab-Switcher |
| `toggleEvent(id)` | events | togglet `.open` auf `#<id>` |
| `switchTab(eventId, tab, btn)` | events | wechselt aktiven Tab in Event-Card |
| `renderTeams(standings)` | teams | Team-Cards mit Stats; Fallback ohne Ergebnisse |
| `formatDate(iso)` | alle | ISO → `DD.MM.YYYY` (de-DE) |
| `initApp()` | alle | orchestriert Parser + alle Render-Funktionen |

## Bekannte Entscheidungen

- Punktesystem: P1–P8 = [25,20,16,13,11,9,7,5]; Pole +1; Fastest Lap +1; Finale ×2
- Fahrer-zu-Team Matching: case-insensitiver Namensvergleich — muss exakt mit AC-Export übereinstimmen
- Statische Seiten + clientseitiges Parsen: kein Backend, einfache Git-Pipeline
- Logo-Fallback: `onerror` → SVG-Initialenavatar (Teamfarbe + Kürzel) via `buildInitialsAvatar()`
- AC `NO_TIME`-Sentinel: `2147483647` — wird überall zu "–" konvertiert
- Timeline in `index.html` ist hard-coded HTML (Daten, Namen, Strecken); Status-Badges werden per Inline-Script aus `FRC_CONFIG.events` berechnet
- Standings `<thead>` in `standings.html` ist hard-coded — `<tbody>` wird dynamisch generiert
- `fetch()` 404 → `null` → "kein Ergebnis" (kein Fehler) — korrekte Semantik für noch ausstehende Events

## Offene Punkte / ToDos

- **Echte Teamdaten**: Alle Teams/Fahrer in `config.js` sind Platzhalter — Import via `tools/convert-registration.js` sobald Anmeldungen vorliegen
- **Team-Logos**: Nur Sponsor-Logos in `logos/`; Team-Logos fehlen (Fallback: Initialen-Avatar)
- **CNAME**: README dokumentiert Custom Domain, Datei fehlt im Repository
- **Standings-Header**: In `standings.html` hard-coded (E01 Spielberg, E02 Hockenheim, E03 Nürburgring, F Nordschleife) — sollte dynamisch aus `FRC_CONFIG.events` generiert werden
- **Timeline hard-coded**: Daten/Namen/Strecken in `index.html` fest — müssen bei Änderungen manuell synchron gehalten werden mit `FRC_CONFIG.events`
- **`--color-primary-glow`**: In `css/style.css` referenziert aber möglicherweise nicht in `:root` definiert → silent fail prüfen
- **DNF-Handling**: Verhalten bei `TotalTime=0` oder `-1` nicht explizit definiert
- **Tests/Validierung**: Keine automatischen Tests für `js/parser.js` oder `tools/convert-registration.js`
- **OG-Metatags**: Kein `og:image` / `og:title` — Social Media Preview fehlt
- **Internationalisierung / Zeit-Zonen**: `new Date(iso + "T00:00:00")` — Annahme lokale TZ (CH: UTC+2 korrekt)
- **Accessibility (a11y)**: Hamburger hat `aria-label`, weitere ARIA-Attribute fehlen
- **`anmeldungen.json`-Format**: Nur im Convert-Tool-Kommentar dokumentiert; keine Beispieldatei
- **Ergebnisdateien**: Keine echten AC-JSONs vorhanden; nur `results/example-event-01.json` als Schema-Referenz

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

Nach dem Hochladen muss nichts am HTML geändert werden — `parser.js` liest die Datei
automatisch via `fetch(event.resultsFile)`.

## Anmeldungs-Konverter

```bash
# Eingabeformat: JSON-Array von Anmeldungen (Export aus Racing-Event-Sing-In)
# { teamname, fahrer1: { vorname, nachname }, fahrer2: { vorname, nachname } }
node tools/convert-registration.js anmeldungen.json
# → gibt teams: [...] Block für js/config.js auf stdout aus
```

## Aktueller Branch-Status (Stand 2026-06-25)

- `main`: Stabil, sauber, kein offener PR.
  - Zuletzt: Landingpage mit Kern-Narrativ, Partner-Kacheln & Timeline (Commit `2c6d285`)
  - Zuvor: Corporate Motorsport Design-System überarbeitet (`447e6f8`)
  - Zuvor: Registration-Converter Tool (`9de789c`)
- Keine offenen Feature-Branches.
- Alle Teams/Fahrer sind Platzhalter — Echtdaten kommen via Anmeldungs-Konverter.
