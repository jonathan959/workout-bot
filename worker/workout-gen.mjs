import profile from "../config/profile.json";
import substitutions from "../config/substitutions.json";
import { buildSystemPrompt } from "./prompts.mjs";
import { generateContentGemini, parseJsonFromText } from "./gemini-api.mjs";
import { validateWorkout } from "./workout-validate.mjs";

export async function generateWorkoutFromContext(ctx, apiKey, opts = {}) {
  const systemPrompt = buildSystemPrompt({
    weekNumber: ctx.programWeek,
    mesocycle: ctx.mesocycle,
    phase: ctx.phase,
    dayLabel: ctx.dayLabel,
    recentHistory: ctx.recentHistory,
    lastSessionNote: ctx.lastSessionNote,
    progressionLines: ctx.progressionLines,
    profile,
  });

  let validationFeedback = "";
  let workout;
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const userParts = [
      `ATHLETE_PROFILE_JSON:\n${JSON.stringify(profile)}`,
      `SUBSTITUTIONS_JSON:\n${JSON.stringify(substitutions)}`,
      `EXERCISE_DAY_PLAN_JSON:\n${JSON.stringify(ctx.dayPlan || {}, null, 2)}`,
      `MESOCYCLE_VARIATIONS_JSON:\n${JSON.stringify(ctx.mesoVars || {}, null, 2)}`,
      `PROGRESSION_TRACKING_JSON:\n${JSON.stringify(ctx.progressionTracking || {}, null, 2)}`,
      `RULES: Each "reason" field must be at most ${profile.sessionFormat.reasonMaxWords} words.`,
      `Deload week rules if phase is Deload: ${JSON.stringify(profile.progression.deload)}`,
      `Week-in-mesocycle (1-4): ${ctx.weekInMeso}. If week 3 and phase is not Deload, only last isolation may have dropset; never hip thrusts or RDL.`,
      validationFeedback ? `VALIDATION FAILED — FIX AND REGENERATE:\n${validationFeedback}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const text = await generateContentGemini({
      apiKey,
      systemInstruction: systemPrompt,
      userText: userParts,
      model: opts.model || "gemini-2.5-flash",
    });

    let parsed;
    try {
      parsed = parseJsonFromText(text);
    } catch (e) {
      validationFeedback = `JSON parse error: ${e.message}`;
      console.error(validationFeedback);
      continue;
    }

    const v = validateWorkout(parsed, ctx);
    if (v.ok) {
      workout = parsed;
      break;
    }
    validationFeedback = v.errors.join("\n");
    console.error("validateWorkout attempt", attempt + 1, validationFeedback);
  }

  if (!workout) {
    throw new Error(
      `Workout generation failed after ${maxAttempts} attempts. Last issue: ${validationFeedback || "unknown"}`,
    );
  }

  return workout;
}
