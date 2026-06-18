# 🏁 Firmen Racing Cup 2026

**Sim-Racing Championship · Hybrid Racing Au SG**  
Porsche 911 GT3 RS (992) · Assetto Corsa · Road to the Nordschleife

---

## Seitenstruktur

```
/
├── index.html          Startseite (Hero, Countdown, Top 3, Kalender)
├── standings.html      Teamwertung (Live-Tabelle)
├── events.html         Events & Ergebnisse (aufklappbare Karten)
├── teams.html          Teamkarten mit Fahrern & Statistiken
├── css/style.css       Komplettes Styling (Racing-Theme)
├── js/config.js        ← HIER Teams, Fahrer & Events konfigurieren
├── js/parser.js        Assetto Corsa Result-Parser
├── js/app.js           Render-Logik
├── results/            AC JSON-Ergebnisdateien hier ablegen
│   └── example-event-01.json  (Beispieldatei / Vorlage)
├── logos/              Team-Logos hier ablegen
├── CNAME               Custom Domain für GitHub Pages
└── README.md
```

---

## Nach jedem Event: Ergebnisse hochladen

### 1. AC Result-Datei finden

Assetto Corsa speichert Rennergebnisse nach jedem Session-Ende unter:

```
Dokumente\Assetto Corsa\server\results\
```

Die Datei heißt z.B. `231012_201530.json` (Datum_Uhrzeit).

### 2. Datei umbenennen & hochladen

Benenne die Datei entsprechend um und lege sie in `results/` ab:

| Event | Dateiname |
|-------|-----------|
| Event 01 – Spielberg | `results/event-01.json` |
| Event 02 – Hockenheim | `results/event-02.json` |
| Event 03 – Nürburgring | `results/event-03.json` |
| Grand Finale – Nordschleife | `results/event-finale.json` |

Die Namen sind in `js/config.js` unter `resultsFile` definiert und können angepasst werden.

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
  id: "team-alpha",          // eindeutige ID (keine Leerzeichen)
  name: "Alpha Racing",      // vollständiger Teamname
  shortName: "ALP",          // 3-Buchstaben-Kürzel
  color: "#e8001c",          // Teamfarbe (Hex)
  logo: "logos/team-alpha.png",  // Logo-Pfad
  drivers: ["Max Mustermann", "Lisa Schnell"],  // exakt wie in AC!
},
```

> **Wichtig:** Die Fahrernamen müssen **exakt** mit den Namen in den AC-Ergebnisdateien übereinstimmen (Groß-/Kleinschreibung, Leerzeichen).

---

## Team-Logos ersetzen

1. Logo als PNG oder SVG vorbereiten (empfohlen: quadratisch, mind. 200×200px)
2. Datei in `logos/` ablegen, z.B. `logos/team-alpha.png`
3. Pfad in `js/config.js` beim Team eintragen: `logo: "logos/team-alpha.png"`

Falls kein Logo vorhanden, zeigt die Seite automatisch ein farbiges Initialen-Avatar.

---

## GitHub Pages Deployment

### Erstmaliges Setup

```bash
# Repository auf GitHub erstellen (z.B. firmen-racing-cup-2026)
git init
git add .
git commit -m "Initial commit: Firmen Racing Cup 2026"
git remote add origin https://github.com/DEIN-USERNAME/firmen-racing-cup-2026.git
git push -u origin main
```

### GitHub Pages aktivieren

1. Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** · Folder: **/ (root)**
4. Speichern – die Seite ist nach ~2 Minuten unter `https://DEIN-USERNAME.github.io/firmen-racing-cup-2026` erreichbar.

---

## Custom Domain einrichten

### 1. CNAME-Datei anpassen

Öffne `CNAME` und ersetze den Inhalt mit deiner Domain:

```
racing.meinedomain.ch
```

### 2. DNS-Eintrag setzen

Bei deinem Domain-Anbieter einen **CNAME-Record** anlegen:

| Typ | Name | Ziel |
|-----|------|------|
| CNAME | racing | DEIN-USERNAME.github.io |

### 3. In GitHub Pages bestätigen

Settings → Pages → Custom domain eintragen → **Enforce HTTPS** aktivieren.

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
| 01 – Season Opener | Spielberg South Course | 20' Training + 10' Quali + 60' Rennen |
| 02 – Normales Rennen | Hockenheimring GP | 20' Training + 10' Quali + 60' Rennen |
| 03 – Weather Challenge | Nürburgring Sprint GT | 20' Training + 10' Quali + 90' Rennen |
| F – Grand Finale | Nordschleife | 30' Training + 30' Quali + 3h Rennen |

---

*Firmen Racing Cup 2026 · Hybrid Racing Au SG*
