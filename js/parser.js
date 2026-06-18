/* ═══════════════════════════════════════════════════════════════
   Firmen Racing Cup 2026 – Assetto Corsa Result Parser
   Liest AC JSON-Ergebnisdateien aus results/ und transformiert
   sie in das interne Datenformat.

   AC Result-Format (results/*.json):
   {
     "TrackName": "...",
     "Type": 2,
     "DurationSecs": 3600,
     "RaceWeekendIndex": 0,
     "Result": [
       {
         "DriverName": "...",
         "CarModel": "...",
         "BestLap": 123456,        // Millisekunden, 2147483647 = keine Zeit
         "TotalTime": 3612345,     // Millisekunden Gesamtzeit
         "BallastKG": 0,
         "Restrictor": 0
       }, ...
     ],
     "Laps": [
       {
         "LapTime": 123456,        // Millisekunden
         "CarIndex": 0,
         "Cuts": 0,
         "Sectors": [41234, 40123, 42099]
       }, ...
     ],
     "Grid": [0, 2, 1, ...],       // CarIndex-Reihenfolge Startaufstellung
     "Cars": [
       { "CarId": 0, "Driver": { "Name": "...", "Team": "..." }, "Model": "..." }, ...
     ],
     "TrackConfig": "...",
     "Date": "..."
   }
═══════════════════════════════════════════════════════════════ */

const ACParser = (() => {

  const NO_TIME = 2147483647; // AC-Sentinel für "keine Zeit gesetzt"

  // ── Hilfsfunktionen ─────────────────────────────────────
  function msToLaptime(ms) {
    if (!ms || ms >= NO_TIME || ms <= 0) return "–";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis  = ms % 1000;
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
  }

  function msToRacetime(ms) {
    if (!ms || ms >= NO_TIME || ms <= 0) return "–";
    const hours   = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis  = ms % 1000;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
    }
    return `${minutes}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
  }

  function gapToLeader(leadMs, myMs) {
    if (!leadMs || leadMs >= NO_TIME || !myMs || myMs >= NO_TIME) return "–";
    const diff = myMs - leadMs;
    if (diff === 0) return "–";
    return `+${msToRacetime(diff)}`;
  }

  // ── Team-Zuordnung ───────────────────────────────────────
  // Ordnet einen AC-Fahrernamen dem internen Team zu.
  // Sucht zuerst exakt, dann case-insensitiv.
  function findTeamForDriver(driverName) {
    if (!driverName) return null;
    const lower = driverName.toLowerCase().trim();
    for (const team of FRC_CONFIG.teams) {
      for (const driver of team.drivers) {
        if (driver.toLowerCase().trim() === lower) return team;
      }
    }
    return null;
  }

  // ── Schnellste Runde pro Car ──────────────────────────────
  function buildBestLapMap(laps) {
    const map = {}; // carIndex → besterLap-Eintrag
    for (const lap of (laps || [])) {
      if (!lap || lap.Cuts > 0) continue; // Cuts ungültig
      const prev = map[lap.CarIndex];
      if (!prev || lap.LapTime < prev.LapTime) {
        map[lap.CarIndex] = lap;
      }
    }
    return map;
  }

  // ── Rundenanzahl pro Car ──────────────────────────────────
  function buildLapCountMap(laps) {
    const map = {};
    for (const lap of (laps || [])) {
      map[lap.CarIndex] = (map[lap.CarIndex] || 0) + 1;
    }
    return map;
  }

  // ── Hauptparser ──────────────────────────────────────────
  function parseRaceResult(json, eventCfg) {
    try {
      const data = typeof json === "string" ? JSON.parse(json) : json;

      const cars       = data.Cars || [];
      const results    = data.Result || [];
      const laps       = data.Laps || [];
      const grid       = data.Grid || [];
      const isFinale   = eventCfg?.isFinale || false;
      const multiplier = isFinale ? FRC_CONFIG.finaleMultiplier : 1;

      const bestLapMap  = buildBestLapMap(laps);
      const lapCountMap = buildLapCountMap(laps);

      // ── Globale schnellste Runde ────────────────────────
      let globalFastestMs   = Infinity;
      let globalFastestCar  = null;
      for (const [carIdx, lap] of Object.entries(bestLapMap)) {
        if (lap.LapTime < globalFastestMs) {
          globalFastestMs  = lap.LapTime;
          globalFastestCar = parseInt(carIdx);
        }
      }

      // ── Startaufstellung (Grid) ─────────────────────────
      const qualiOrder = grid.map((carIdx, pos) => {
        const car = cars[carIdx] || {};
        const lap = bestLapMap[carIdx];
        return {
          position: pos + 1,
          carIndex: carIdx,
          driverName: car.Driver?.Name || car.DriverName || `Car #${carIdx}`,
          team: findTeamForDriver(car.Driver?.Name || car.DriverName),
          carModel: car.Model || car.CarModel || "",
          bestLap: lap ? lap.LapTime : NO_TIME,
          bestLapFmt: lap ? msToLaptime(lap.LapTime) : "–",
          isPole: pos === 0,
        };
      });

      // Pole-Fahrer
      const poleDriver = qualiOrder.length > 0 ? qualiOrder[0] : null;

      // ── Renn-Ergebnis ───────────────────────────────────
      // AC sortiert results[] bereits nach Zielreihenfolge
      const finishOrder = results.map((r, idx) => {
        // Car-Objekt per Name suchen (AC gibt manchmal CarIndex mit)
        const carIdx = typeof r.CarIndex !== "undefined"
          ? r.CarIndex
          : cars.findIndex(c => (c.Driver?.Name || c.DriverName) === r.DriverName);

        const lap     = bestLapMap[carIdx >= 0 ? carIdx : -1];
        const isFastest = carIdx === globalFastestCar;
        const lapCount  = lapCountMap[carIdx] || 0;
        const team      = findTeamForDriver(r.DriverName);

        // Punkte aus Tabelle
        const basePoints = FRC_CONFIG.points[idx] || 0;

        return {
          position:       idx + 1,
          carIndex:       carIdx,
          driverName:     r.DriverName,
          team:           team,
          carModel:       r.CarModel || "",
          totalTime:      r.TotalTime,
          totalTimeFmt:   msToRacetime(r.TotalTime),
          gapToLeader:    gapToLeader(results[0]?.TotalTime, r.TotalTime),
          bestLap:        r.BestLap,
          bestLapFmt:     msToLaptime(r.BestLap),
          lapCount:       lapCount,
          isFastestLap:   isFastest,
          basePoints:     basePoints,
        };
      });

      // Schnellste-Runde-Fahrer ermitteln
      const fastestDriver = finishOrder.find(r => r.isFastestLap) || null;

      // ── Team-Punkte aggregieren ─────────────────────────
      const teamPts = {}; // teamId → { base, bonus }

      for (const entry of finishOrder) {
        if (!entry.team) continue;
        const id = entry.team.id;
        if (!teamPts[id]) teamPts[id] = { base: 0, bonus: 0 };
        teamPts[id].base += entry.basePoints;
      }

      // Pole-Bonus
      if (poleDriver?.team) {
        const id = poleDriver.team.id;
        if (!teamPts[id]) teamPts[id] = { base: 0, bonus: 0 };
        teamPts[id].bonus += FRC_CONFIG.bonusPole;
      }

      // Fastest-Lap-Bonus
      if (fastestDriver?.team) {
        const id = fastestDriver.team.id;
        if (!teamPts[id]) teamPts[id] = { base: 0, bonus: 0 };
        teamPts[id].bonus += FRC_CONFIG.bonusFastestLap;
      }

      // Multiplikator (Grand Finale)
      const teamPoints = {};
      for (const [id, pts] of Object.entries(teamPts)) {
        teamPoints[id] = {
          base:  pts.base  * multiplier,
          bonus: pts.bonus * multiplier,
          total: (pts.base + pts.bonus) * multiplier,
        };
      }

      return {
        ok:           true,
        eventId:      eventCfg?.id || "",
        trackName:    data.TrackName || "",
        trackConfig:  data.TrackConfig || "",
        date:         data.Date || "",
        isFinale:     isFinale,
        multiplier:   multiplier,
        grid:         qualiOrder,
        finishOrder:  finishOrder,
        poleDriver:   poleDriver,
        fastestDriver: fastestDriver,
        fastestLapMs: globalFastestMs < Infinity ? globalFastestMs : null,
        fastestLapFmt: globalFastestMs < Infinity ? msToLaptime(globalFastestMs) : "–",
        teamPoints:   teamPoints,
      };

    } catch (err) {
      console.error("[ACParser] Fehler beim Parsen:", err);
      return { ok: false, error: err.message };
    }
  }

  // ── Datei laden (fetch) ──────────────────────────────────
  async function loadResult(filePath) {
    try {
      const res = await fetch(filePath);
      if (!res.ok) return null; // Datei nicht vorhanden → noch kein Ergebnis
      const json = await res.json();
      return json;
    } catch {
      return null; // Netzwerkfehler oder ungültiges JSON
    }
  }

  // ── Alle Events laden & Gesamtwertung berechnen ──────────
  async function loadAllResults() {
    const allResults = {};

    for (const event of FRC_CONFIG.events) {
      const raw = await loadResult(event.resultsFile);
      if (!raw) {
        allResults[event.id] = { ok: false, notAvailable: true };
        continue;
      }
      allResults[event.id] = parseRaceResult(raw, event);
    }

    // Gesamtpunktestand berechnen
    const standings = FRC_CONFIG.teams.map(team => {
      const pts = { total: 0, byEvent: {}, trend: 0 };
      let prevTotal = 0;

      for (const event of FRC_CONFIG.events) {
        const result = allResults[event.id];
        if (!result || !result.ok) {
          pts.byEvent[event.id] = null;
          continue;
        }
        const tp = result.teamPoints[team.id] || { base: 0, bonus: 0, total: 0 };
        pts.byEvent[event.id] = tp;
        pts.total += tp.total;
      }

      // Trend: Vergleich letzte zwei Events
      const completedEvents = FRC_CONFIG.events.filter(e => allResults[e.id]?.ok);
      if (completedEvents.length >= 2) {
        const last = completedEvents[completedEvents.length - 1];
        const prev = completedEvents[completedEvents.length - 2];
        const lastPts = (allResults[last.id]?.teamPoints[team.id]?.total || 0);
        const prevPts = (allResults[prev.id]?.teamPoints[team.id]?.total || 0);
        pts.trend = lastPts - prevPts;
      }

      return { team, pts };
    });

    // Sortieren nach Gesamtpunkten
    standings.sort((a, b) => b.pts.total - a.pts.total);
    standings.forEach((s, i) => { s.rank = i + 1; });

    return { allResults, standings };
  }

  // Öffentliche API
  return {
    loadAllResults,
    parseRaceResult,
    loadResult,
    msToLaptime,
    msToRacetime,
    NO_TIME,
  };
})();
