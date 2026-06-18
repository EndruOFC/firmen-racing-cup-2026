/* ═══════════════════════════════════════════════════════════════
   Firmen Racing Cup 2026 – App-Logik
   CI: Lässer Stickmaschinen × Menzi Muck AG
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
  const navRight  = document.getElementById("navRight");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      if (navLinks)  navLinks.classList.toggle("open");
      if (navRight)  navRight.classList.toggle("open");
    });
  }
});

/* ══════════════════════════════════════════════════════════════
   TEAM-LOGO HELPER
══════════════════════════════════════════════════════════════ */
function teamLogoHTML(team, size = 36) {
  if (!team) {
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:var(--anthracite);display:flex;align-items:center;justify-content:center;font-size:${Math.round(size/3)}px;color:var(--text-dim)">?</div>`;
  }
  const initials = team.shortName || team.name.substring(0, 3).toUpperCase();
  const color    = team.color || "#FFD100";
  return `
    <div style="width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--anthracite);border:2px solid rgba(255,255,255,.07);flex-shrink:0;">
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
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}22" stroke="${color}66" stroke-width="1.5"/>
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
          fill="${color}" font-family="Orbitron,monospace" font-size="${Math.round(size * 0.3)}"
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
    wrap.innerHTML = `<p class="text-muted" style="font-family:'Orbitron',monospace;font-size:.8rem;letter-spacing:.1em">Saison 2026 abgeschlossen – danke an alle Teams!</p>`;
    return;
  }

  const targetDate = new Date(next.date + "T00:00:00");
  const nameEl     = document.getElementById("countdownEventName");
  if (nameEl) nameEl.textContent = `▶ ${next.name}  ·  ${next.track} ${next.trackFlag}`;

  function tick() {
    const diff = targetDate - new Date();
    if (diff <= 0) {
      wrap.innerHTML = `<p style="font-family:'Orbitron',monospace;color:var(--yellow);font-size:1rem;letter-spacing:.08em">🏁 Das Rennen läuft!</p>`;
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
    el.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px 20px;color:var(--text-dim)">
      <div style="font-size:2.5rem;margin-bottom:14px">🏁</div>
      <div style="font-family:'Orbitron',monospace;font-size:.8rem;letter-spacing:.1em">Saison startet bald</div>
      <div style="font-size:.82rem;margin-top:6px">Ergebnisse erscheinen hier nach dem ersten Event.</div>
    </div>`;
    return;
  }

  const top3 = standings.slice(0, 3);
  // Podium-Layout: P2 links, P1 Mitte, P3 rechts
  const display = top3.length >= 3
    ? [{ item: top3[1], cls: "p2", rank: 2 }, { item: top3[0], cls: "p1", rank: 1 }, { item: top3[2], cls: "p3", rank: 3 }]
    : top3.map((item, i) => ({ item, cls: ["p1","p2","p3"][i], rank: i+1 }));

  el.innerHTML = display.map(({ item, cls, rank }, i) => `
    <div class="podium-card ${cls} fade-up" style="animation-delay:${i * .1}s">
      <div class="podium-rank">${rank}</div>
      <div class="podium-logo">${teamLogoHTML(item.team, 54)}</div>
      <div class="podium-team-name">${item.team.name}</div>
      <div class="podium-drivers">${item.team.drivers.join(" · ")}</div>
      <div class="podium-points">${item.pts.total} <span>Punkte</span></div>
    </div>`).join("");
}

/* ══════════════════════════════════════════════════════════════
   EVENT MINI CARDS (index.html)
══════════════════════════════════════════════════════════════ */
function renderEventMiniCards(allResults) {
  const el = document.getElementById("eventsMiniGrid");
  if (!el) return;

  el.innerHTML = FRC_CONFIG.events.map(ev => {
    const result  = allResults[ev.id];
    const done    = result?.ok;
    const evDate  = new Date(ev.date);
    const soon    = !done && Math.abs(evDate - new Date()) < 86400000 * 3;

    const statusHtml = done
      ? `<span class="badge badge-green">✓ Abgeschlossen</span>`
      : soon
        ? `<span class="badge badge-live">◉ Bald</span>`
        : `<span class="badge badge-muted">⏱ ${formatDate(ev.date)}</span>`;

    return `
      <div class="event-mini ${ev.isFinale ? "finale" : ""}">
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
    el.innerHTML = `<tr><td colspan="8" class="no-results"><span class="icon">🏁</span>Noch keine Ergebnisse verfügbar.</td></tr>`;
    return;
  }

  el.innerHTML = standings.map(({ team, pts, rank }) => {
    const rankClass = rank <= 3 ? `rank-${rank}` : "rank-other";

    const eventCols = FRC_CONFIG.events.map(ev => {
      const tp = pts.byEvent[ev.id];
      if (!tp) return `<td class="center pts-zero">–</td>`;
      const bonus = tp.bonus > 0 ? `<div class="pts-bonus">+${tp.bonus}</div>` : "";
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
            <div class="team-logo-sm">${teamLogoHTML(team, 32)}</div>
            <div class="team-info">
              <div class="t-name">${team.name}</div>
              <div class="t-drivers">${team.drivers.join(" · ")}</div>
            </div>
          </div>
        </td>
        ${eventCols}
        <td class="center pts-cell pts-total">${pts.total}</td>
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
    const result    = allResults[ev.id];
    const hasResult = result?.ok;

    const statusTag = hasResult
      ? `<span class="badge badge-green">✓ Ergebnisse</span>`
      : `<span class="badge badge-muted">⏱ ${formatDate(ev.date)}</span>`;

    const bodyContent = hasResult
      ? buildResultTabs(result, ev)
      : `<div class="no-results">
           <span class="icon">⏱</span>
           <p>Ergebnisse werden nach dem Event veröffentlicht.</p>
           <p class="text-muted" style="font-size:.78rem;margin-top:6px">Erwartet: ${formatDate(ev.date)}</p>
         </div>`;

    return `
      <div class="event-card ${ev.isFinale ? "finale" : ""}" id="${ev.id}">
        <div class="event-card-header" onclick="toggleEvent('${ev.id}')">
          <div class="event-header-left">
            <span class="ev-badge ${ev.isFinale ? "finale" : ""}">Event ${ev.number}</span>
            <div>
              <div class="event-card-title">${ev.name}</div>
              <div class="event-card-meta">
                <span>${ev.trackFlag} ${ev.track}</span>
                <span>📅 ${formatDate(ev.date)}</span>
                ${ev.isFinale ? `<span class="text-yellow">★ ×2 Punkte</span>` : ""}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            ${statusTag}
            <span class="event-toggle">▾</span>
          </div>
        </div>
        <div class="event-card-body">
          <div class="format-box">
            <div class="format-tag"><span class="fmt-label">Training</span>${ev.format.training}</div>
            <div class="format-tag"><span class="fmt-label">Qualifying</span>${ev.format.quali}</div>
            <div class="format-tag"><span class="fmt-label">Rennen</span>${ev.format.race}</div>
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
    ? `<span class="fl-icon">⚡ Schnellste Runde:</span> ${result.fastestDriver.driverName} · ${result.fastestLapFmt}`
    : "";

  const gridRows = result.grid.map(r => `
    <tr>
      <td class="${r.position <= 3 ? `pos-p${r.position}` : ""}">${r.position}</td>
      <td>${r.driverName}${r.isPole ? ` <span class="pole-icon" title="Pole">🏆</span>` : ""}</td>
      <td>${r.team ? r.team.name : `<span class="text-muted">–</span>`}</td>
      <td>${r.bestLapFmt}</td>
    </tr>`).join("");

  const finishRows = result.finishOrder.map(r => `
    <tr>
      <td class="${r.position <= 3 ? `pos-p${r.position}` : ""}">${r.position}</td>
      <td>${r.driverName}${r.isFastestLap ? ` <span class="fl-icon" title="Schnellste Runde">⚡</span>` : ""}</td>
      <td>${r.team ? r.team.name : `<span class="text-muted">–</span>`}</td>
      <td>${r.totalTimeFmt}</td>
      <td>${r.gapToLeader}</td>
      <td>${r.bestLapFmt}</td>
      <td>${r.lapCount}</td>
      <td class="pts-cell">${r.basePoints > 0 ? r.basePoints : "–"}</td>
    </tr>`).join("");

  return `
    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-top:14px;font-size:.83rem;color:var(--text-muted)">
      <span>${poleInfo}</span>
      <span>${fastInfo}</span>
    </div>
    <div class="result-tabs">
      <button class="result-tab active" onclick="switchTab('${ev.id}','grid',this)">Startaufstellung</button>
      <button class="result-tab" onclick="switchTab('${ev.id}','finish',this)">Zieleinlauf</button>
    </div>
    <div id="${ev.id}-grid" class="result-panel active">
      <table class="result-table">
        <thead><tr><th>#</th><th>Fahrer</th><th>Team</th><th>Bestzeit</th></tr></thead>
        <tbody>${gridRows || `<tr><td colspan="4" class="no-results">Keine Daten</td></tr>`}</tbody>
      </table>
    </div>
    <div id="${ev.id}-finish" class="result-panel">
      <table class="result-table">
        <thead><tr><th>Pos</th><th>Fahrer</th><th>Team</th><th>Zeit</th><th>Abstand</th><th>Bestzeit</th><th>Runden</th><th>Pkt</th></tr></thead>
        <tbody>${finishRows || `<tr><td colspan="8" class="no-results">Keine Daten</td></tr>`}</tbody>
      </table>
    </div>`;
}

function toggleEvent(id) {
  document.getElementById(id)?.classList.toggle("open");
}

function switchTab(eventId, tab, btn) {
  const body = document.getElementById(eventId)?.querySelector(".event-card-body");
  if (!body) return;
  body.querySelectorAll(".result-panel").forEach(p => p.classList.remove("active"));
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

  const items = standings?.length
    ? standings
    : FRC_CONFIG.teams.map((team, i) => ({ team, rank: i + 1, pts: { total: 0, byEvent: {}, trend: 0 } }));

  el.innerHTML = items.map(({ team, rank, pts }) => {
    const trendEl = pts.trend > 0
      ? `<span class="trend-up">↑ Aufsteiger</span>`
      : pts.trend < 0
        ? `<span class="trend-down">↓ Absteiger</span>`
        : `<span class="trend-same">Gehalten</span>`;

    const completedCount = FRC_CONFIG.events.filter(ev =>
      pts.byEvent[ev.id] !== null && pts.byEvent[ev.id] !== undefined
    ).length;

    return `
      <div class="team-card" style="--team-color:${team.color}">
        <div class="team-card-head">
          <div class="team-logo-lg">${teamLogoHTML(team, 64)}</div>
          <div>
            <div class="tc-name">${team.name}</div>
            <div class="tc-rank">Rang <strong>${rank}</strong> &nbsp;·&nbsp; ${trendEl}</div>
          </div>
        </div>
        <div class="team-card-body">
          <div class="driver-list">
            ${team.drivers.map((d, i) => `
              <div class="driver-row">
                <div class="driver-num">#${i + 1}</div>
                <div class="driver-name">${d}</div>
              </div>`).join("")}
          </div>
          <div class="tc-stats">
            <div class="stat-i">
              <div class="stat-v">${pts.total}</div>
              <div class="stat-l">Punkte</div>
            </div>
            <div class="stat-i">
              <div class="stat-v">${completedCount}</div>
              <div class="stat-l">Events</div>
            </div>
            <div class="stat-i">
              <div class="stat-v">${rank}</div>
              <div class="stat-l">Rang</div>
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
  return new Date(iso + "T00:00:00").toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
async function initApp() {
  initCountdown();
  const { allResults, standings } = await ACParser.loadAllResults();
  renderPodium(standings);
  renderEventMiniCards(allResults);
  renderStandings(standings, allResults);
  renderEvents(allResults);
  renderTeams(standings);
}

document.addEventListener("DOMContentLoaded", initApp);
