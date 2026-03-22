import exercises from "../config/exercises.json";
import {
  getWeekInMesocycle,
  getPhaseName,
  getMesocycleFromWeek,
  getProgramWeek,
} from "./progression.mjs";

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
  const mesos = exercises.mesocycles || {};
  const meso = mesos[mesocycleNum] || mesos[String(mesocycleNum)] || mesos[1] || mesos["1"];
  const fallback = mesos[1] || mesos["1"];
  if (!meso) return {};
  return meso[dayKey] || fallback[dayKey] || {};
}

export function computeRunContext(history, profile) {
  const dayNum = history.currentDay || 1;
  const programWeek = getProgramWeek(history.currentWeek || 1);
  const mesocycle = getMesocycleFromWeek(history.currentWeek || 1);
  const weekInMeso = getWeekInMesocycle(history.currentWeek || 1);
  const phase = getPhaseName(weekInMeso);
  const dayKey = DAY_KEYS[dayNum - 1];
  const dayPlan = getDayExercisePlan(mesocycle, dayKey);
  const vars = exercises.mesocycleVariations || {};
  const mesoVars = vars[mesocycle] || vars[String(mesocycle)] || {};
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
