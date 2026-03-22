require("dotenv").config();

const path = require("path");

const profile = require("../config/profile");
const substitutions = require("../config/substitutions");
const { postWorkout } = require("./discord");
const progression = require("./progression");
const progressionIo = require("./progression-io");
const { buildSystemPrompt } = require("./prompts");
const { generateContentGemini, parseJsonFromText } = require("./gemini-api");
const { computeRunContext } = require("./run-context");
const { generateWorkoutFromContext } = require("./workout-gen");

function getDataPath() {
  return path.join(__dirname, "..", "data", "history.json");
}

async function generateWorkout(
  dayNum,
  weekNumber,
  mesocycle,
  phase,
  recentHistory,
  lastSessionNote,
  extraContext = {}
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const dayLabel = extraContext.dayLabel || `Day ${dayNum}`;
  const systemPrompt = buildSystemPrompt({
    weekNumber,
    mesocycle,
    phase,
    dayLabel,
    recentHistory,
    lastSessionNote,
  });

  const userParts = [
    `ATHLETE_PROFILE_JSON:\n${JSON.stringify(profile)}`,
    `SUBSTITUTIONS_JSON:\n${JSON.stringify(substitutions)}`,
    `EXERCISE_DAY_PLAN_JSON:\n${JSON.stringify(extraContext.dayPlan || {}, null, 2)}`,
    `MESOCYCLE_VARIATIONS_JSON:\n${JSON.stringify(extraContext.mesoVars || {}, null, 2)}`,
    `RULES: Each "reason" field must be at most ${profile.sessionFormat.reasonMaxWords} words.`,
    `Deload week rules if phase is Deload: ${JSON.stringify(profile.progression.deload)}`,
    `Week-in-mesocycle (1-4): ${extraContext.weekInMeso}. If week 3, only last isolation may have dropset; never hip thrusts or RDL.`,
  ].join("\n\n");

  const text = await generateContentGemini({
    apiKey,
    systemInstruction: systemPrompt,
    userText: userParts,
  });
  return parseJsonFromText(text);
}

async function runPipeline() {
  const dataPath = getDataPath();
  let history = progressionIo.loadHistory(dataPath);

  const ctx = computeRunContext(history, profile);
  const apiKey = process.env.GEMINI_API_KEY;
  const workout = await generateWorkoutFromContext(ctx, apiKey);

  workout.week = ctx.programWeek;
  workout.phase = ctx.phase;
  workout.mesocycle = ctx.mesocycle;

  await postWorkout(workout);

  history.recentSessions = progression.appendRecentSession(history, workout);
  history.progressionTracking = progression.updateProgressionTracking(history, workout);
  history.lastProgressionNote = workout.progressionNote || "";
  history.lastSessionNote = workout.progressionNote || "";

  history = progression.advanceSchedule(history);
  progressionIo.saveHistory(dataPath, history);

  console.log("Workout posted and history updated.");
}

if (require.main === module) {
  runPipeline().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  generateWorkout,
  generateWorkoutFromContext,
  runPipeline,
  computeRunContext,
  buildSystemPrompt,
};
