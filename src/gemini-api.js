/**
 * Gemini REST API — works in Node 18+ and Cloudflare Workers (no @google/generative-ai required).
 *
 * We send a single user turn only (no system_instruction / response_mime_type). Some API surfaces
 * reject those fields with 400; merging the system prompt into the user text avoids that.
 * JSON is still requested in the prompt text; parseJsonFromText strips fences if needed.
 */
async function generateContentGemini({ apiKey, systemInstruction, userText }) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  // Default stable model; override with GEMINI_MODEL if ListModels shows a different id for your project.
  const model = typeof process !== "undefined" && process.env?.GEMINI_MODEL
    ? process.env.GEMINI_MODEL
    : "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const combined = [
    systemInstruction,
    "\n\n--- CONTEXT / USER PAYLOAD ---\n\n",
    userText,
  ].join("");

  // Minimal payload: only `contents` (some gateways reject generation_config keys too).
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: combined }],
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}: ${raw}`);
  }

  const json = JSON.parse(raw);
  const text =
    json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) throw new Error("Gemini returned empty response");
  return text;
}

function parseJsonFromText(text) {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return JSON.parse(t);
}

module.exports = { generateContentGemini, parseJsonFromText };
