import profile from "../config/profile.json";
import substitutions from "../config/substitutions.json";
import { buildSystemPrompt } from "./prompts.mjs";
import { generateContentGemini, parseJsonFromText } from "./gemini-api.mjs";

export async function generateWorkoutFromContext(ctx, apiKey, opts = {}) {
  const systemPrompt = buildSystemPrompt({
    weekNumber: ctx.programWeek,
    mesocycle: ctx.mesocycle,
    phase: ctx.phase,
    dayLabel: ctx.dayLabel,
    recentHistory: ctx.recentHistory,
    lastSessionNote: ctx.lastSessionNote,
  });

  const userParts = [
    `ATHLETE_PROFILE_JSON:\n${JSON.stringify(profile)}`,
    `SUBSTITUTIONS_JSON:\n${JSON.stringify(substitutions)}`,
    `EXERCISE_DAY_PLAN_JSON:\n${JSON.stringify(ctx.dayPlan || {}, null, 2)}`,
    `MESOCYCLE_VARIATIONS_JSON:\n${JSON.stringify(ctx.mesoVars || {}, null, 2)}`,
    `RULES: Each "reason" field must be at most ${profile.sessionFormat.reasonMaxWords} words.`,
    `Deload week rules if phase is Deload: ${JSON.stringify(profile.progression.deload)}`,
    `Week-in-mesocycle (1-4): ${ctx.weekInMeso}. If week 3, only last isolation may have dropset; never hip thrusts or RDL.`,
  ].join("\n\n");

  const text = await generateContentGemini({
    apiKey,
    systemInstruction: systemPrompt,
    userText: userParts,
    model: opts.model || "gemini-2.5-flash",
  });
  return parseJsonFromText(text);
}
