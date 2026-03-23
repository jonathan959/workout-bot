/**
 * Weekly plan embed → DISCORD_SUMMARY_WEBHOOK_URL (GitHub Actions: Monday 12:00 UTC).
 */
require("dotenv").config();

const path = require("path");
const progression = require("./progression");
const progressionIo = require("./progression-io");

function getDataPath() {
  return path.join(__dirname, "..", "data", "history.json");
}

function weekTargets(weekInMeso) {
  const repByWeek = {
    1: "10-12 reps per working set (3 sets, accumulation)",
    2: "8-10 reps per working set (3 sets, development)",
    3: "6-8 reps per working set (3 sets, intensification)",
    4: "12-15 reps · 2 sets · ~60% load (deload)",
  };
  const rpeByWeek = {
    1: "RPE 7-8 on working sets",
    2: "RPE ~8 on working sets",
    3: "RPE ~9 on hardest set — last rep matters",
    4: "RPE 6 max — recovery week",
  };
  const w = weekInMeso >= 1 && weekInMeso <= 4 ? weekInMeso : 1;
  return { rep: repByWeek[w], rpe: rpeByWeek[w] };
}

function buildEmbed(history) {
  const cw = history.currentWeek || 1;
  const programWeek = progression.getProgramWeek(cw);
  const meso = progression.getMesocycleFromWeek(cw);
  const weekInMeso = progression.getWeekInMesocycle(cw);
  const phase = progression.getPhaseName(weekInMeso);
  const phaseUpper = phase.toUpperCase();
  const { rep, rpe } = weekTargets(weekInMeso);

  const fields = [
    { name: "Monday", value: "💪 Pull A     — Back Width · Rear Delts · Biceps · Forearms", inline: false },
    { name: "Tuesday", value: "🏋️ Push A     — Chest · Shoulders", inline: false },
    { name: "Wednesday", value: "🦵 Legs A     — Glute Focus", inline: false },
    { name: "Thursday", value: "💪 Arms       — Biceps · Triceps · Forearms (All Fresh)", inline: false },
    { name: "Friday", value: "🏋️ Pull B     — Back Thickness · Rear Delts · Biceps", inline: false },
    { name: "Saturday", value: "🦵 Legs B     — Hamstring · Lower Quad · Glutes", inline: false },
    { name: "Sunday", value: "😴 Rest       — Recovery", inline: false },
    { name: "Rep target this week", value: rep, inline: false },
    { name: "Intensity target", value: rpe, inline: false },
  ];

  if (weekInMeso === 4) {
    fields.push({
      name: "Deload",
      value: "Week 4 of meso: lighter loads, 2 sets, RPE cap — lower back unloaded per profile.",
      inline: false,
    });
  }

  return {
    title: `📅 WEEK ${programWeek} — ${phaseUpper} PHASE`,
    description: `Mesocycle ${meso} of 3 · 12-Week Hypertrophy Program`,
    color: 0x5865f2,
    fields,
    footer: { text: "Modified Arms Day Split · Type /workout each day for your session" },
    timestamp: new Date().toISOString(),
  };
}

async function postSummaryWebhook(embed) {
  const url = process.env.DISCORD_SUMMARY_WEBHOOK_URL;
  if (!url) throw new Error("DISCORD_SUMMARY_WEBHOOK_URL is not set");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Summary webhook failed: ${res.status} ${t}`);
  }
}

async function main() {
  const dataPath = getDataPath();
  const history = progressionIo.loadHistory(dataPath);
  const embed = buildEmbed(history);
  await postSummaryWebhook(embed);
  console.log("Weekly summary posted.");
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { buildEmbed, main };
