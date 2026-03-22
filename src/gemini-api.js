/**
 * Gemini REST API — works in Node 18+ and Cloudflare Workers (no @google/generative-ai required).
 *
 * Request JSON must use proto field names (snake_case): system_instruction, generation_config,
 * response_mime_type. CamelCase triggers 400 INVALID_ARGUMENT on generativelanguage.googleapis.com.
 */
async function generateContentGemini({ apiKey, systemInstruction, userText }) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generation_config: {
      response_mime_type: "application/json",
      temperature: 0.7,
    },
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
