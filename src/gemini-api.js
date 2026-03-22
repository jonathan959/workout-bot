/**
 * Gemini REST API — works in Node 18+ and Cloudflare Workers (no @google/generative-ai required).
 *
 * Single user turn (merged prompt). Retries on 429 with server-suggested delay.
 */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Parse RetryInfo / message text for seconds to wait before retry. */
function parseRetryDelaySeconds(rawBody) {
  try {
    const j = JSON.parse(rawBody);
    const details = j.error?.details || [];
    for (const d of details) {
      if (String(d["@type"] || "").includes("RetryInfo") && d.retryDelay) {
        const s = String(d.retryDelay);
        const m = s.match(/^(\d+)s$/);
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

function getModel() {
  const v = typeof process !== "undefined" && process.env?.GEMINI_MODEL;
  if (v && String(v).trim()) return String(v).trim();
  return "gemini-2.0-flash";
}

async function generateContentGemini({ apiKey, systemInstruction, userText }) {
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const model = getModel();
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
          "\n\nQuota help: A `limit: 0` in the error usually means this Google Cloud project has no free-tier quota for this model (not that you “used” a budget). " +
          "Try: (1) [Google AI Studio](https://aistudio.google.com/) → create a new API key in a fresh project; (2) Google Cloud Console → enable “Generative Language API”; " +
          "(3) set billing / paid tier if required; (4) set env `GEMINI_MODEL` to another model your key allows (see https://ai.google.dev/gemini-api/docs/rate-limits ).";
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

function parseJsonFromText(text) {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return JSON.parse(t);
}

module.exports = { generateContentGemini, parseJsonFromText };
