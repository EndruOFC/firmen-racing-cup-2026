/* ═══════════════════════════════════════════════════════════════
   Firmen Racing Cup 2026 – Zentrale Konfiguration
   Hier Teams, Fahrer und Events pflegen.
═══════════════════════════════════════════════════════════════ */

const FRC_CONFIG = {

  // ── Saison-Info ───────────────────────────────────────────
  season: {
    name: "Firmen Racing Cup 2026",
    year: 2026,
    organizer: "Hybrid Racing Au SG",
    car: "Porsche 911 GT3 RS (992)",
    sim: "Assetto Corsa",
    motto: "Road to the Nordschleife",
  },

  // ── Punktesystem ──────────────────────────────────────────
  // Index 0 = P1, Index 1 = P2, ...
  points: [25, 20, 16, 13, 11, 9, 7, 5],
  bonusPole: 1,          // Bonus für Pole Position
  bonusFastestLap: 1,    // Bonus für schnellste Runde
  finaleMultiplier: 2,   // Alle Punkte × 2 beim Grand Finale

  // ── Teams (Reihenfolge = Start-Startnummern) ──────────────
  teams: [
    {
      id: "team-alpha",
      name: "Alpha Racing",
      shortName: "ALP",
      color: "#e8001c",
      logo: "logos/team-alpha.png",
      drivers: ["Max Mustermann", "Lisa Schnell"],
    },
    {
      id: "team-beta",
      name: "Beta Motorsport",
      shortName: "BET",
      color: "#0062ff",
      logo: "logos/team-beta.png",
      drivers: ["Tom Breit", "Sarah Kurve"],
    },
    {
      id: "team-gamma",
      name: "Gamma Speed",
      shortName: "GAM",
      color: "#00b050",
      logo: "logos/team-gamma.png",
      drivers: ["Klaus Drift", "Nina Gas"],
    },
    {
      id: "team-delta",
      name: "Delta Works",
      shortName: "DEL",
      color: "#ff6a00",
      logo: "logos/team-delta.png",
      drivers: ["Frank Bremse", "Monika Volgas"],
    },
    {
      id: "team-epsilon",
      name: "Epsilon Garage",
      shortName: "EPS",
      color: "#8800cc",
      logo: "logos/team-epsilon.png",
      drivers: ["Hans Scheit", "Julia Apex"],
    },
    {
      id: "team-zeta",
      name: "Zeta Dynamics",
      shortName: "ZET",
      color: "#00cccc",
      logo: "logos/team-zeta.png",
      drivers: ["Peter Sturz", "Anna Runde"],
    },
    {
      id: "team-eta",
      name: "Eta Performance",
      shortName: "ETA",
      color: "#ffcc00",
      logo: "logos/team-eta.png",
      drivers: ["Georg Quertreiber", "Eva Sprint"],
    },
    {
      id: "team-theta",
      name: "Theta Racing",
      shortName: "THE",
      color: "#ff0077",
      logo: "logos/team-theta.png",
      drivers: ["Karl Vollgas", "Maria Slalom"],
    },
  ],

  // ── Events ────────────────────────────────────────────────
  events: [
    {
      id: "event-01",
      number: "01",
      label: "Season Opener",
      name: "Season Opener",
      track: "Spielberg South Course",
      trackFlag: "🇦🇹",
      date: "2026-09-12",        // ISO-Format
      format: {
        training: "20 Min. Training",
        quali: "10 Min. Qualifying",
        race: "60 Min. Rennen",
      },
      isFinale: false,
      resultsFile: "results/event-01.json",
    },
    {
      id: "event-02",
      number: "02",
      label: "Runde 2",
      name: "Normales Rennen",
      track: "Hockenheimring GP",
      trackFlag: "🇩🇪",
      date: "2026-10-10",
      format: {
        training: "20 Min. Training",
        quali: "10 Min. Qualifying",
        race: "60 Min. Rennen",
      },
      isFinale: false,
      resultsFile: "results/event-02.json",
    },
    {
      id: "event-03",
      number: "03",
      label: "Weather Challenge",
      name: "Weather Challenge",
      track: "Nürburgring Sprint GT",
      trackFlag: "🇩🇪",
      date: "2026-11-07",
      format: {
        training: "20 Min. Training",
        quali: "10 Min. Qualifying",
        race: "90 Min. Rennen",
      },
      isFinale: false,
      resultsFile: "results/event-03.json",
    },
    {
      id: "event-finale",
      number: "F",
      label: "Grand Finale",
      name: "Grand Finale",
      track: "Nordschleife",
      trackFlag: "🇩🇪",
      date: "2026-12-05",
      format: {
        training: "30 Min. Training",
        quali: "30 Min. Qualifying",
        race: "3h Rennen",
      },
      isFinale: true,
      resultsFile: "results/event-finale.json",
    },
  ],
};

// Nächstes Event ermitteln (für Countdown)
FRC_CONFIG.nextEvent = FRC_CONFIG.events.find(e => new Date(e.date) >= new Date()) || null;
