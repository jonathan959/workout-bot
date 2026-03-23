import { generateContentGemini, parseJsonFromText } from "./gemini-api.mjs";

function buildSubPrompt(exercise) {
  return `You are a personal trainer. The user cannot do ${exercise} today. Suggest the single best substitute exercise for it based on this profile: full commercial gym, cables preferred over free weights for isolation, no barbell bench press, no deadlifts, no heavy barbell squats, no bent over rows, no calf raises, no upright rows. Return JSON only: { "substitute": string, "reason": string } where reason is max 5 words.`;
}

export async function getSubstitutionJson(env, exerciseName) {
  const trimmed = (exerciseName || "").trim();
  if (!trimmed) throw new Error("Missing exercise name");

  const userText = buildSubPrompt(trimmed.replace(/"/g, "'"));
  const systemInstruction =
    "You reply with a single JSON object only. No markdown. Keys: substitute (string), reason (string, max 5 words).";

  const raw = await generateContentGemini({
    apiKey: env.GEMINI_API_KEY,
    systemInstruction,
    userText,
    model: env.GEMINI_MODEL || "gemini-2.5-flash",
  });

  const parsed = parseJsonFromText(raw);
  if (!parsed.substitute || !parsed.reason) {
    throw new Error("Invalid substitution response from model");
  }
  return { original: trimmed, substitute: String(parsed.substitute), reason: String(parsed.reason) };
}

export function buildSubstitutionEmbed(result) {
  return {
    title: "Exercise Substitution",
    color: 0x5865f2,
    fields: [
      { name: "Original exercise", value: result.original, inline: false },
      { name: "Substitute", value: result.substitute, inline: false },
      { name: "Reason", value: result.reason, inline: false },
    ],
  };
}
