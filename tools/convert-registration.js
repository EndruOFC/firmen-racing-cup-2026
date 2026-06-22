#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   Firmen Racing Cup 2026 – Anmeldungs-Konverter
   ---------------------------------------------------------------
   Wandelt den Admin-Export (anmeldungen.json) vom Anmeldeportal
   in das FRC_CONFIG.teams-Format für js/config.js um.

   Nutzung:
     node tools/convert-registration.js [pfad/zur/anmeldungen.json]

   Standard-Eingabe: anmeldungen.json im aktuellen Ordner.
   Ausgabe: der fertige  teams: [ ... ]  Block auf der Konsole
   (stdout) – einfach in js/config.js über den bestehenden
   teams-Array kopieren. Status/Warnungen gehen auf stderr.

   Beispiel (Ausgabe in Datei speichern):
     node tools/convert-registration.js anmeldungen.json > teams.txt
   ═══════════════════════════════════════════════════════════════ */

"use strict";

const fs = require("fs");

// Teamfarben – gleiche Palette wie in js/config.js, wird durchrotiert.
const COLORS = [
  "#e8001c", "#0062ff", "#00b050", "#ff6a00",
  "#8800cc", "#00cccc", "#ffcc00", "#ff0077",
];

// Teamname → URL-tauglicher Slug (für id und Logo-Pfad)
function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")  // restliche Akzente entfernen
    .replace(/[^a-z0-9]+/g, "-")                        // alles andere → Bindestrich
    .replace(/^-+|-+$/g, "");                           // Bindestriche an den Rändern weg
}

// Teamname → 3-Buchstaben-Kürzel (Initialen, sonst erste Buchstaben)
function shortName(name) {
  const words = String(name).trim().split(/\s+/).filter(Boolean);
  let sn = words.length >= 2 ? words.map(w => w[0]).join("") : String(name);
  if (sn.length < 3) sn = String(name).replace(/\s+/g, "");
  sn = sn.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  return sn || "TBD";
}

// Fahrer-Objekt { vorname, nachname } → "Vorname Nachname"
function fullName(driver) {
  if (!driver) return "";
  return [driver.vorname, driver.nachname].filter(Boolean).join(" ").trim();
}

// Eine Anmeldung → ein Team-Objekt im config.js-Format
function toTeam(reg, index) {
  const name = String(reg.teamname || `Team ${index + 1}`).trim();
  const slug = slugify(name) || `team-${index + 1}`;
  const drivers = [fullName(reg.fahrer1), fullName(reg.fahrer2)].filter(Boolean);
  return {
    id: `team-${slug}`,
    name,
    shortName: shortName(name),
    color: COLORS[index % COLORS.length],
    logo: `logos/team-${slug}.png`,
    drivers,
  };
}

// teams-Array als hübsch eingerückter JS-Code (passt zu js/config.js)
function renderTeams(teams) {
  const items = teams.map(t => {
    const drivers = t.drivers.map(d => JSON.stringify(d)).join(", ");
    return [
      "    {",
      `      id: ${JSON.stringify(t.id)},`,
      `      name: ${JSON.stringify(t.name)},`,
      `      shortName: ${JSON.stringify(t.shortName)},`,
      `      color: ${JSON.stringify(t.color)},`,
      `      logo: ${JSON.stringify(t.logo)},`,
      `      drivers: [${drivers}],`,
      "    },",
    ].join("\n");
  });
  return "  teams: [\n" + items.join("\n") + "\n  ],";
}

function main() {
  const inputPath = process.argv[2] || "anmeldungen.json";

  let raw;
  try {
    raw = fs.readFileSync(inputPath, "utf8");
  } catch (e) {
    console.error(`✗ Datei nicht gefunden: ${inputPath}`);
    console.error(`  Nutzung: node tools/convert-registration.js [pfad/zur/anmeldungen.json]`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`✗ Ungültiges JSON in ${inputPath}: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error("✗ Erwartet wird ein JSON-Array von Anmeldungen (Admin-Export).");
    process.exit(1);
  }
  if (data.length === 0) {
    console.error("✗ Keine Anmeldungen im Export gefunden.");
    process.exit(1);
  }

  const teams = data.map(toTeam);

  // Plausibilitätsprüfungen → stderr (stören die stdout-Ausgabe nicht)
  const seen = new Map();
  teams.forEach((t, i) => {
    if (seen.has(t.id)) {
      console.error(`⚠ Doppelte Team-ID "${t.id}" (Teamname mehrfach vergeben?) – Eintrag ${i + 1}.`);
    }
    seen.set(t.id, true);
    if (t.drivers.length < 2) {
      console.error(`⚠ Team "${t.name}" hat nur ${t.drivers.length} Fahrer (erwartet: 2).`);
    }
  });

  console.error(`✓ ${teams.length} Team(s) konvertiert.`);
  console.error(`  → Den folgenden Block in js/config.js über den bestehenden teams-Array kopieren.`);
  console.error(`  → Fahrernamen müssen EXAKT den Namen in den AC-Ergebnissen entsprechen!\n`);

  // Eigentliche Ausgabe → stdout
  console.log(renderTeams(teams));
}

main();
