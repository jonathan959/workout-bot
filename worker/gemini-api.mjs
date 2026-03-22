/**
 * Gemini REST — Workers + Node. Merged user message; retries on 429.
 */

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseRetryDelaySeconds(rawBody) {
  try {
    const j = JSON.parse(rawBody);
    const details = j.error?.details || [];
    for (const d of details) {
      if (String(d["@type"] || "").includes("RetryInfo") && d.retryDelay) {
        const m = String(d.retryDelay).match(/^(\d+)s$/);
        if (m) return parseInt(m[1], 10);
      }
    }
    const msg = j.error?.message || "";
    const m2 = msg.match(/[Rr]etry in ([\d.]+)s/i);
    if (m2) return Math.ceil(parseFloat(m2[1]));
  } catch (_) {
    /* ignore */
  }
  return 35;
}

export async function generateContentGemini({ apiKey, systemInstruction, userText, model = "gemini-2.0-flash" }) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const combined = [
    systemInstruction,
    "\n\n--- CONTEXT / USER PAYLOAD ---\n\n",
    userText,
  ].join("");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: combined }],
      },
    ],
  };

  const maxAttempts = 4;
  let lastRaw = "";
  let lastStatus = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    lastRaw = await res.text();
    lastStatus = res.status;

    if (res.status === 429 && attempt < maxAttempts) {
      const sec = Math.min(120, parseRetryDelaySeconds(lastRaw) + 2);
      await sleep(sec * 1000);
      continue;
    }

    if (!res.ok) {
      let extra = "";
      if (res.status === 429) {
        extra =
          " Quota: if you see limit:0, create a new API key in AI Studio or enable billing / another model. https://ai.google.dev/gemini-api/docs/rate-limits";
      }
      throw new Error(`Gemini API error ${res.status}: ${lastRaw}${extra}`);
    }

    const json = JSON.parse(lastRaw);
    const text =
      json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    if (!text) throw new Error("Gemini returned empty response");
    return text;
  }

  throw new Error(`Gemini API error ${lastStatus} after retries: ${lastRaw}`);
}

export function parseJsonFromText(text) {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return JSON.parse(t);
}
