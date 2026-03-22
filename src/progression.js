/**
 * Week 1–4 within the repeating block: Accumulation → Development → Intensification → Deload
 */
function getWeekInMesocycle(currentWeek) {
  return ((currentWeek - 1) % 4) + 1;
}

function getPhaseName(weekInMeso) {
  const map = {
    1: "Accumulation",
    2: "Development",
    3: "Intensification",
    4: "Deload",
  };
  return map[weekInMeso] || "Accumulation";
}

function getMesocycleFromWeek(currentWeek) {
  const w = ((currentWeek - 1) % 12) + 1;
  return Math.min(3, Math.ceil(w / 4));
}

function getProgramWeek(currentWeek) {
  return ((currentWeek - 1) % 12) + 1;
}

/**
 * After a completed session: advance day / week and persist history path.
 */
function advanceSchedule(history) {
  const next = { ...history };
  if (next.currentDay < 6) {
    next.currentDay += 1;
  } else {
    next.currentDay = 1;
    next.currentWeek = (next.currentWeek || 1) + 1;
    if (next.currentWeek > 12) next.currentWeek = 1;
  }
  next.currentMesocycle = getMesocycleFromWeek(next.currentWeek);
  const wim = getWeekInMesocycle(next.currentWeek);
  next.phase = getPhaseName(wim).toLowerCase();
  next.lastUpdated = new Date().toISOString().slice(0, 10);
  return next;
}

function extractRepBottom(repStr) {
  if (!repStr || typeof repStr !== "string") return 8;
  const m = repStr.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return parseInt(m[1], 10);
  const n = repStr.match(/(\d+)/);
  return n ? parseInt(n[1], 10) : 8;
}

function extractRepTop(repStr) {
  if (!repStr || typeof repStr !== "string") return 12;
  const m = repStr.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return parseInt(m[2], 10);
  const n = repStr.match(/(\d+)/);
  return n ? parseInt(n[1], 10) : 12;
}

/**
 * Merge Gemini workout into progression tracking (double progression placeholders).
 */
function updateProgressionTracking(history, workout) {
  const pt = { ...(history.progressionTracking || {}) };
  for (const ex of workout.exercises || []) {
    const name = ex.exercise;
    if (!name) continue;
    const prev = pt[name] || {};
    const bottom = extractRepBottom(ex.reps);
    const top = extractRepTop(ex.reps);
    const lastReps = prev.lastReps != null ? prev.lastReps : bottom;
    const targetReps = Math.min(lastReps + 1, top);
    pt[name] = {
      lastReps,
      lastWeight: prev.lastWeight || "—",
      targetReps,
      repRange: ex.reps || prev.repRange,
    };
  }
  return pt;
}

function appendRecentSession(history, workout) {
  const sessions = [...(history.recentSessions || [])];
  const names = (workout.exercises || []).map((e) => e.exercise).filter(Boolean);
  sessions.push({
    date: new Date().toISOString().slice(0, 10),
    day: workout.day || `Day ${history.currentDay}`,
    focus: workout.focus || "",
    exercises: names,
  });
  while (sessions.length > 12) sessions.shift();
  return sessions;
}

module.exports = {
  getWeekInMesocycle,
  getPhaseName,
  getMesocycleFromWeek,
  getProgramWeek,
  advanceSchedule,
  updateProgressionTracking,
  appendRecentSession,
};
