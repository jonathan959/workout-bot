const exercises = require("../config/exercises");
const progression = require("./progression");

const DAY_KEYS = ["day1", "day2", "day3", "day4", "day5", "day6"];

function getDayLabel(dayNum, split) {
  const key = DAY_KEYS[dayNum - 1];
  const focus = split[key] || "";
  return `Day ${dayNum} — ${focus}`;
}

function buildRecentHistoryString(history) {
  const sessions = history.recentSessions || [];
  if (!sessions.length) return "None yet.";
  return sessions
    .slice(-6)
    .map((s) => `${s.date} ${s.day}: ${(s.exercises || []).join(", ")}`)
    .join("\n");
}

function getDayExercisePlan(mesocycleNum, dayKey) {
  const meso = exercises.mesocycles[mesocycleNum] || exercises.mesocycles[1];
  return meso[dayKey] || exercises.mesocycles[1][dayKey];
}

/**
 * Shared context for Gemini + Discord (CLI and Worker).
 */
function computeRunContext(history, profile) {
  const dayNum = history.currentDay || 1;
  const programWeek = progression.getProgramWeek(history.currentWeek || 1);
  const mesocycle = progression.getMesocycleFromWeek(history.currentWeek || 1);
  const weekInMeso = progression.getWeekInMesocycle(history.currentWeek || 1);
  const phase = progression.getPhaseName(weekInMeso);
  const dayKey = DAY_KEYS[dayNum - 1];
  const dayPlan = getDayExercisePlan(mesocycle, dayKey);
  const mesoVars = exercises.mesocycleVariations[mesocycle] || {};
  const recentHistory = buildRecentHistoryString(history);
  const lastSessionNote = history.lastProgressionNote || history.lastSessionNote || "None";
  const dayLabel = getDayLabel(dayNum, profile.split);

  return {
    dayNum,
    programWeek,
    mesocycle,
    weekInMeso,
    phase,
    dayKey,
    dayPlan,
    mesoVars,
    recentHistory,
    lastSessionNote,
    dayLabel,
  };
}

module.exports = {
  DAY_KEYS,
  getDayLabel,
  buildRecentHistoryString,
  getDayExercisePlan,
  computeRunContext,
};
