/* ═══════════════════════════════════════════════════════════════
   Firmen Racing Cup 2026 – App-Logik
   Rendert Countdown, Podium, Rangliste, Events, Teams
═══════════════════════════════════════════════════════════════ */

/* ── Navigation: aktiven Link markieren ───────────────────── */
(function markActiveNav() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href") || "";
    if (href === page || (page === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
})();

/* ── Hamburger-Menü ────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("navLinks");
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
  }
});

/* ══════════════════════════════════════════════════════════════
   TEAM-LOGO HELPER
══════════════════════════════════════════════════════════════ */
function teamLogoHTML(team, size = 36) {
  if (!team) return `<div class="team-logo-placeholder" style="width:${size}px;height:${size}px;border-radius:50%;background:#1a1a1a;display:flex;align-items:center;justify-content:center;font-size:${size/3}px;color:#555">?</div>`;

  const initials = team.shortName || team.name.substring(0, 3).toUpperCase();
  const color    = team.color || "#e8001c";

  return `
    <div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#1a1a1a;border:2px solid #2a2a2a;flex-shrink:0;">
      <img src="${team.logo}" alt="${team.name}"
           style="width:100%;height:100%;object-fit:cover;"
           onerror="this.replaceWith(buildInitialsAvatar('${initials}','${color}',${size}))">
    </div>`;
}

function buildInitialsAvatar(initials, color, size) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.innerHTML = `
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}22" stroke="${color}55" stroke-width="1.5"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
          fill="${color}" font-family="Orbitron,monospace" font-size="${size * 0.3}"
          font-weight="700">${initials}</text>`;
  return svg;
}

/* ══════════════════════════════════════════════════════════════
   COUNTDOWN (index.html)
══════════════════════════════════════════════════════════════ */
function initCountdown() {
  const wrap = document.getElementById("countdownWrap");
  if (!wrap) return;

  const next = FRC_CONFIG.nextEvent;
  if (!next) {
    wrap.innerHTML = `<p class="text-muted">Saison 2026 abgeschlossen – danke an alle Teams!</p>`;
    return;
  }

  const targetDate = new Date(next.date + "T00:00:00");
  const nameEl     = document.getElementById("countdownEventName");
  if (nameEl) nameEl.textContent = `▶ ${next.name} · ${next.track} ${next.trackFlag}`;

  function tick() {
    const now  = new Date();
    const diff = targetDate - now;

    if (diff <= 0) {
      wrap.innerHTML = `<p class="text-gold font-orbitron">🏁 Das Rennen läuft!</p>`;
      return;
    }

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    document.getElementById("cd-days").textContent    = String(days).padStart(2, "0");
    document.getElementById("cd-hours").textContent   = String(hours).padStart(2, "0");
    document.getElementById("cd-minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("cd-seconds").textContent = String(seconds).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

/* ══════════════════════════════════════════════════════════════
   PODIUM TOP 3 (index.html)
══════════════════════════════════════════════════════════════ */
function renderPodium(standings) {
  const el = document.getElementById("podiumGrid");
  if (!el) return;

  if (!standings || standings.length === 0) {
    el.innerHTML = `<p class="text-muted" style="grid-column:1/-1;text-align:center;padding:40px">Noch keine Ergebnisse – Saison startet bald!</p>`;
    return;
  }

  const top3 = standings.slice(0, 3);
  // Reihenfolge für Podium: P2 links, P1 Mitte, P3 rechts
  const order = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const classes = top3.length >= 3 ? ["p2", "p1", "p3"] : ["p1", "p2", "p3"];
  const rankLabels = ["P2", "P1", "P3"];
  const realRanks  = [2, 1, 3];

  el.innerHTML = order.map((item, i) => {
    if (!item) return "";
    const cls = classes[i];
    const pts = item.pts.total;
    return `
      <div class="podium-card ${cls} animate-fadeInUp" style="animation-delay:${i * .1}s">
        <div class="podium-rank">${realRanks[i]}</div>
        <div class="podium-team-logo">${teamLogoHTML(item.team, 56)}</div>
        <div class="podium-team-name">${item.team.name}</div>
        <div class="podium-drivers">${item.team.drivers.join(" · ")}</div>
        <div class="podium-points">${pts} <span>Punkte</span></div>
      </div>`;
  }).join("");
}

/* ══════════════════════════════════════════════════════════════
   EVENT-KACHELN (index.html – Saisonübersicht)
══════════════════════════════════════════════════════════════ */
function renderEventMiniCards(allResults) {
  const el = document.getElementById("eventsMiniGrid");
  if (!el) return;

  el.innerHTML = FRC_CONFIG.events.map(ev => {
    const result = allResults[ev.id];
    const hasResult = result?.ok;

    let statusHtml;
    const today = new Date();
    const evDate = new Date(ev.date);
    if (hasResult) {
      statusHtml = `<span class="event-status completed">✓ Abgeschlossen</span>`;
    } else if (Math.abs(evDate - today) < 86400000 * 2) {
      statusHtml = `<span class="event-status live">◉ Bald</span>`;
    } else {
      statusHtml = `<span class="event-status upcoming">⏱ ${formatDate(ev.date)}</span>`;
    }

    return `
      <div class="event-mini-card ${ev.isFinale ? "finale" : ""}">
        <div class="event-num">Event ${ev.number}</div>
        <div class="event-name">${ev.name}</div>
        <div class="event-track">${ev.trackFlag} ${ev.track}</div>
        ${statusHtml}
      </div>`;
  }).join("");
}

/* ══════════════════════════════════════════════════════════════
   STANDINGS TABLE (standings.html)
══════════════════════════════════════════════════════════════ */
function renderStandings(standings, allResults) {
  const el = document.getElementById("standingsTableBody");
  if (!el) return;

  if (!standings || standings.length === 0) {
    el.innerHTML = `<tr><td colspan="20" class="no-results"><span class="icon">🏁</span>Noch keine Ergebnisse verfügbar.</td></tr>`;
    return;
  }

  el.innerHTML = standings.map(({ team, pts, rank }) => {
    const rankClass = rank <= 3 ? `rank-${rank}` : "rank-other";

    const eventCols = FRC_CONFIG.events.map(ev => {
      const tp = pts.byEvent[ev.id];
      if (!tp) return `<td class="center pts-zero">–</td>`;
      const bonus = tp.bonus > 0 ? `<div class="pts-bonus">+${tp.bonus} Bonus</div>` : "";
      return `<td class="center pts-cell">${tp.base}${bonus}</td>`;
    }).join("");

    const trendEl = pts.trend > 0
      ? `<span class="trend-up">↑${pts.trend}</span>`
      : pts.trend < 0
        ? `<span class="trend-down">↓${Math.abs(pts.trend)}</span>`
        : `<span class="trend-same">–</span>`;

    return `
      <tr class="${rankClass}">
        <td><span class="rank-badge">${rank}</span></td>
        <td>
          <div class="team-cell">
            <div class="team-logo-sm">${teamLogoHTML(team, 34)}</div>
            <div class="team-info-cell">
              <div class="team-name">${team.name}</div>
              <div class="team-drivers">${team.drivers.join(" · ")}</div>
            </div>
          </div>
        </td>
        ${eventCols}
        <td class="center pts-cell total">${pts.total}</td>
        <td class="center">${trendEl}</td>
      </tr>`;
  }).join("");
}

/* ══════════════════════════════════════════════════════════════
   EVENTS PAGE (events.html)
══════════════════════════════════════════════════════════════ */
function renderEvents(allResults) {
  const el = document.getElementById("eventsContainer");
  if (!el) return;

  el.innerHTML = FRC_CONFIG.events.map(ev => {
    const result = allResults[ev.id];
    const hasResult = result?.ok;
    const badgeCls = ev.isFinale ? "finale" : "rnd";

    let bodyContent;
    if (!hasResult) {
      bodyContent = `
        <div class="no-results">
          <span class="icon">⏱</span>
          <p>Ergebnisse werden nach dem Event veröffentlicht.</p>
          <p class="text-muted" style="font-size:.8rem;margin-top:8px">Erwartet: ${formatDate(ev.date)}</p>
        </div>`;
    } else {
      bodyContent = buildResultTabs(result, ev);
    }

    const statusTag = hasResult
      ? `<span class="tag tag-green">✓ Ergebnisse</span>`
      : `<span class="tag tag-red">⏱ ${formatDate(ev.date)}</span>`;

    if (ev.isFinale) {
      // Finale bekommt goldene Sondermarkierung
    }

    return `
      <div class="event-card ${ev.isFinale ? "finale" : ""}" id="${ev.id}">
        <div class="event-card-header" onclick="toggleEvent('${ev.id}')">
          <div class="event-header-left">
            <span class="event-badge ${badgeCls}">Event ${ev.number}</span>
            <div>
              <div class="event-card-title">${ev.name}</div>
              <div class="event-card-meta">
                <span>${ev.trackFlag} ${ev.track}</span>
                <span>📅 ${formatDate(ev.date)}</span>
                ${ev.isFinale ? `<span class="text-gold">★ ×2 Punkte</span>` : ""}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            ${statusTag}
            <span class="event-toggle-icon">▾</span>
          </div>
        </div>
        <div class="event-card-body">
          <div class="format-box">
            <div class="format-item"><span class="fi-label">Training</span>${ev.format.training}</div>
            <div class="format-item"><span class="fi-label">Qualifying</span>${ev.format.quali}</div>
            <div class="format-item"><span class="fi-label">Rennen</span>${ev.format.race}</div>
          </div>
          ${bodyContent}
        </div>
      </div>`;
  }).join("");
}

function buildResultTabs(result, ev) {
  const poleInfo = result.poleDriver
    ? `<span class="pole-icon">🏆 Pole:</span> ${result.poleDriver.driverName} (${result.poleDriver.bestLapFmt})`
    : "";
  const fastInfo = result.fastestDriver
    ? `<span class="fastest-lap">⚡ Schnellste Runde:</span> ${result.fastestDriver.driverName} · ${result.fastestLapFmt}`
    : "";

  const gridRows = result.grid.map(r => `
    <tr>
      <td class="${r.position <= 3 ? `pos-p${r.position}` : ""}">${r.position}</td>
      <td>${r.driverName}${r.isPole ? ` <span class="pole-icon" title="Pole Position">🏆</span>` : ""}</td>
      <td>${r.team ? r.team.name : "<span class='text-muted'>–</span>"}</td>
      <td>${r.bestLapFmt}</td>
    </tr>`).join("");

  const finishRows = result.finishOrder.map(r => `
    <tr>
      <td class="${r.position <= 3 ? `pos-p${r.position}` : ""}">${r.position}</td>
      <td>${r.driverName}${r.isFastestLap ? ` <span class="fastest-lap" title="Schnellste Runde">⚡</span>` : ""}</td>
      <td>${r.team ? r.team.name : "<span class='text-muted'>–</span>"}</td>
      <td>${r.totalTimeFmt}</td>
      <td>${r.gapToLeader}</td>
      <td>${r.bestLapFmt}</td>
      <td>${r.lapCount}</td>
      <td class="pts-cell">${r.basePoints > 0 ? r.basePoints : "–"}</td>
    </tr>`).join("");

  return `
    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:16px;font-size:.85rem">
      <span>${poleInfo}</span>
      <span>${fastInfo}</span>
    </div>
    <div class="results-tabs">
      <button class="result-tab active" onclick="switchTab('${ev.id}','grid',this)">Startaufstellung</button>
      <button class="result-tab" onclick="switchTab('${ev.id}','finish',this)">Zieleinlauf</button>
    </div>
    <div id="${ev.id}-grid" class="result-tab-panel active">
      <table class="result-table">
        <thead><tr><th>#</th><th>Fahrer</th><th>Team</th><th>Bestzeit</th></tr></thead>
        <tbody>${gridRows || '<tr><td colspan="4" class="no-results">Keine Daten</td></tr>'}</tbody>
      </table>
    </div>
    <div id="${ev.id}-finish" class="result-tab-panel">
      <table class="result-table">
        <thead><tr><th>Pos</th><th>Fahrer</th><th>Team</th><th>Zeit</th><th>Abstand</th><th>Bestzeit</th><th>Runden</th><th>Pkt</th></tr></thead>
        <tbody>${finishRows || '<tr><td colspan="8" class="no-results">Keine Daten</td></tr>'}</tbody>
      </table>
    </div>`;
}

function toggleEvent(id) {
  const card = document.getElementById(id);
  if (card) card.classList.toggle("open");
}

function switchTab(eventId, tab, btn) {
  const body = document.getElementById(eventId)?.querySelector(".event-card-body");
  if (!body) return;
  body.querySelectorAll(".result-tab-panel").forEach(p => p.classList.remove("active"));
  body.querySelectorAll(".result-tab").forEach(t => t.classList.remove("active"));
  document.getElementById(`${eventId}-${tab}`)?.classList.add("active");
  btn.classList.add("active");
}

/* ══════════════════════════════════════════════════════════════
   TEAMS PAGE (teams.html)
══════════════════════════════════════════════════════════════ */
function renderTeams(standings) {
  const el = document.getElementById("teamsGrid");
  if (!el) return;

  // Wenn keine Ergebnisse, Teams in Grundreihenfolge
  const items = standings?.length
    ? standings
    : FRC_CONFIG.teams.map((team, i) => ({ team, rank: i + 1, pts: { total: 0, byEvent: {}, trend: 0 } }));

  el.innerHTML = items.map(({ team, rank, pts }) => {
    const trendEl = pts.trend > 0
      ? `<span class="trend-up">↑ Aufsteiger</span>`
      : pts.trend < 0
        ? `<span class="trend-down">↓ Absteiger</span>`
        : `<span class="trend-same">Gehalten</span>`;

    const completedCount = FRC_CONFIG.events.filter(ev => pts.byEvent[ev.id] !== null && pts.byEvent[ev.id] !== undefined).length;

    return `
      <div class="team-card" style="--team-color:${team.color}">
        <div class="team-card-header">
          <div class="team-logo-lg">${teamLogoHTML(team, 68)}</div>
          <div>
            <div class="team-card-name">${team.name}</div>
            <div class="team-card-rank">
              Rang <strong>${rank}</strong> &nbsp;·&nbsp; ${trendEl}
            </div>
          </div>
        </div>
        <div class="team-card-body">
          <div class="driver-list">
            ${team.drivers.map((d, i) => `
              <div class="driver-row">
                <div class="driver-number">#${i + 1}</div>
                <div class="driver-name">${d}</div>
              </div>`).join("")}
          </div>
          <div class="team-stats">
            <div class="stat-item">
              <div class="stat-value text-gold">${pts.total}</div>
              <div class="stat-label">Punkte</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${completedCount}</div>
              <div class="stat-label">Events</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${rank}</div>
              <div class="stat-label">Rang</div>
            </div>
          </div>
        </div>
      </div>`;
  }).join("");
}

/* ══════════════════════════════════════════════════════════════
   DATUM FORMATIEREN
══════════════════════════════════════════════════════════════ */
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ══════════════════════════════════════════════════════════════
   HAUPT-INITIALISIERUNG
══════════════════════════════════════════════════════════════ */
async function initApp() {
  // Countdown immer starten (nur sichtbar auf Index)
  initCountdown();

  // Ergebnisse laden
  const { allResults, standings } = await ACParser.loadAllResults();

  // Seitenspezifische Render-Aufrufe
  renderPodium(standings);
  renderEventMiniCards(allResults);
  renderStandings(standings, allResults);
  renderEvents(allResults);
  renderTeams(standings);
}

document.addEventListener("DOMContentLoaded", initApp);
