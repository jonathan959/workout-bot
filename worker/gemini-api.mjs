/** Gemini REST — Workers + Node compatible. Use snake_case JSON keys (proto names). */

export async function generateContentGemini({ apiKey, systemInstruction, userText }) {
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

export function parseJsonFromText(text) {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return JSON.parse(t);
}
