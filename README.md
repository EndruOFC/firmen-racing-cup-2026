# Firmen Racing Cup 2026

**Sim-Racing Championship · Hybrid Racing Au SG**  
Porsche 911 GT3 RS (992) · Assetto Corsa · Road to the Nordschleife

---

## Dateistruktur

```
/
├── index.html          Landingpage (Hero, Narrativ, Partner, Timeline, Podium, Kalender)
├── standings.html      Teamwertung (Live-Tabelle)
├── events.html         Events & Ergebnisse (aufklappbare Karten mit Tabs)
├── teams.html          Teamkarten mit Fahrern & Statistiken
├── css/style.css       Komplettes Styling (Racing-Theme, CSS Tokens)
├── js/config.js        ← HIER Teams, Fahrer & Events konfigurieren
├── js/parser.js        Assetto Corsa Result-Parser
├── js/app.js           Render-Logik für alle Seiten
├── results/            AC JSON-Ergebnisdateien hier ablegen
│   └── example-event-01.json  (Schema-Referenz)
├── logos/              Sponsor-Logos (Lässer, Menzi Muck)
├── tools/
│   └── convert-registration.js  Anmeldungs-Konverter (Node.js)
└── README.md
```

---

## Nach jedem Event: Ergebnisse hochladen

### 1. AC Result-Datei finden

Assetto Corsa speichert Rennergebnisse nach jedem Session-Ende unter:

```
Dokumente\Assetto Corsa\server\results\
```

Die Datei heisst z.B. `231012_201530.json` (Datum_Uhrzeit).

### 2. Datei umbenennen & hochladen

Benenne die Datei entsprechend um und lege sie in `results/` ab:

| Event | Dateiname |
|-------|-----------|
| Event 01 – Spielberg | `results/event-01.json` |
| Event 02 – Hockenheim | `results/event-02.json` |
| Event 03 – Nürburgring | `results/event-03.json` |
| Grand Finale – Nordschleife | `results/event-finale.json` |

Die Namen sind in `js/config.js` unter `resultsFile` definiert.

### 3. Git commit & push

```bash
git add results/event-01.json
git commit -m "Event 01 Ergebnisse: Spielberg"
git push
```

Die Website aktualisiert sich automatisch – kein weiterer Eingriff nötig.

---

## Teams & Fahrer konfigurieren

Öffne `js/config.js` und passe den `teams`-Array an:

```js
{
  id: "team-alpha",
  name: "Alpha Racing",
  shortName: "ALP",
  color: "#e8001c",
  logo: "logos/team-alpha.png",
  drivers: ["Max Mustermann", "Lisa Schnell"],  // exakt wie in AC!
},
```

> **Wichtig:** Die Fahrernamen müssen **exakt** mit den Namen in den AC-Ergebnisdateien übereinstimmen (Gross-/Kleinschreibung, Leerzeichen).

---

## Anmeldungen automatisch konvertieren

Das Anmeldeportal exportiert im Admin-Bereich eine `anmeldungen.json`.
`tools/convert-registration.js` wandelt diese automatisch in den `teams`-Block für `js/config.js` um.

**Voraussetzung:** [Node.js](https://nodejs.org) installiert.

```bash
node tools/convert-registration.js anmeldungen.json
```

Ausgabe direkt in Datei speichern:

```bash
node tools/convert-registration.js anmeldungen.json > teams.txt
```

| Anmeldung (Export) | → | config.js Team |
|--------------------|---|----------------|
| `teamname` | → | `name` + `id` (Slug) + `shortName` |
| `fahrer1` + `fahrer2` | → | `drivers: ["Vorname Nachname", …]` |
| _(automatisch)_ | → | `color` (aus Palette) + `logo`-Pfad |

> Fehlt ein Team-Logo, zeigt die Seite automatisch ein farbiges Initialen-Avatar.

---

## Team-Logos

1. Logo als PNG vorbereiten (empfohlen: quadratisch, mind. 200×200 px)
2. Datei in `logos/` ablegen, z.B. `logos/team-alpha.png`
3. Pfad in `js/config.js` eintragen: `logo: "logos/team-alpha.png"`

---

## GitHub Pages Deployment

1. Repository → **Settings → Pages**
2. Source: **Deploy from a branch** · Branch: **main** · Folder: **/ (root)**
3. Speichern – erreichbar unter `https://DEIN-USERNAME.github.io/firmen-racing-cup-2026`

---

## Punktesystem

| Position | Punkte |
|----------|--------|
| P1 | 25 |
| P2 | 20 |
| P3 | 16 |
| P4 | 13 |
| P5 | 11 |
| P6 | 9 |
| P7 | 7 |
| P8 | 5 |
| Pole Position | +1 |
| Schnellste Runde | +1 |
| **Grand Finale** | **×2 alle Punkte** |

---

## Saisonkalender

| Event | Strecke | Format |
|-------|---------|--------|
| 01 – Season Opener | Spielberg | 60 Min. Rennen |
| 02 – Runde 2 | Hockenheim | 60 Min. Rennen |
| 03 – Weather Challenge | Nürburgring Sprint | 90 Min. Rennen |
| F – Grand Finale | Nordschleife | 3 Stunden Rennen |

---

*Firmen Racing Cup 2026 · Hybrid Racing Au SG*
