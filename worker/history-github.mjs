/**
 * Mirror src/progression.js schedule + tracking (Workers-safe) and GitHub Contents API.
 */

import {
  getWeekInMesocycle,
  getPhaseName,
  getMesocycleFromWeek,
} from "./progression.mjs";

const DEFAULT_OWNER = "jonathan959";
const DEFAULT_REPO = "workout-bot";
const HISTORY_PATH = "data/history.json";
/** Exact Contents API URL (default branch). No query string — avoids some 400s from bad ref params. */
const GITHUB_CONTENTS_GET_URL =
  "https://api.github.com/repos/jonathan959/workout-bot/contents/data/history.json";

function decodeGitHubFileContent(b64) {
  const clean = String(b64 || "").replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder("utf-8").decode(bytes);
}

function encodeGitHubFileContent(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

/**
 * Wrangler secrets sometimes include wrapping quotes or a duplicated "Bearer " prefix;
 * that can produce GitHub 400 with an empty body.
 */
export function sanitizeGithubToken(raw) {
  if (raw == null) return "";
  let s = String(raw).replace(/^\uFEFF/, "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (/^Bearer\s+/i.test(s)) {
    s = s.replace(/^Bearer\s+/i, "").trim();
  }
  return s;
}

function githubContentsHeadersNoAuth() {
  return {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "workout-bot",
  };
}

/**
 * GitHub REST API headers (GET + PUT) — keep in sync.
 */
export function githubApiHeaders(token) {
  const t = sanitizeGithubToken(token);
  return {
    Authorization: `Bearer ${t}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "workout-bot",
  };
}

function headersToObject(res) {
  const o = {};
  res.headers.forEach((value, key) => {
    o[key] = value;
  });
  return o;
}

export function logGitHubErrorResponse(label, res, bodyText, extra = {}) {
  console.error(`[history-github] ${label} failed`, {
    status: res.status,
    statusText: res.statusText,
    responseHeaders: headersToObject(res),
    responseBody: bodyText,
    ...extra,
  });
}

function parseContentsJson(text) {
  const data = JSON.parse(text);
  const jsonText = decodeGitHubFileContent(data.content);
  const history = JSON.parse(jsonText);
  return { history, sha: data.sha };
}

async function fetchHistoryFromRawUrl(rawUrl) {
  if (!rawUrl || !String(rawUrl).trim()) {
    throw new Error("HISTORY_JSON_URL is not configured");
  }
  const res = await fetch(String(rawUrl).trim(), {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`History raw fetch failed: ${res.status} ${text.slice(0, 300)}`);
  }
  return JSON.parse(text);
}

/**
 * Load history for /workout: try GitHub API first if token exists; on any failure fall back to HISTORY_JSON_URL.
 * Returns sha/owner/repo only when GitHub GET succeeded (enables PUT).
 */
export async function loadHistoryForWorkout(env) {
  const owner = env.GITHUB_REPO_OWNER || DEFAULT_OWNER;
  const repo = env.GITHUB_REPO_NAME || DEFAULT_REPO;
  const rawUrl = env.HISTORY_JSON_URL;
  const token = sanitizeGithubToken(env.GITHUB_TOKEN);

  if (token) {
    try {
      const res = await fetch(GITHUB_CONTENTS_GET_URL, {
        headers: githubApiHeaders(token),
      });
      const text = await res.text();

      if (res.ok) {
        try {
          const { history, sha } = parseContentsJson(text);
          return {
            history,
            sha,
            owner,
            repo,
            canWriteGithub: true,
          };
        } catch (parseErr) {
          console.error(
            "[history-github] GitHub GET OK but JSON/base64 parse failed",
            parseErr?.message || parseErr,
            "bodyPreview:",
            text.slice(0, 400),
          );
        }
      } else {
        logGitHubErrorResponse("GET data/history.json (Contents API)", res, text, {
          tokenLength: token.length,
          hint:
            res.status === 400 && !String(text).trim()
              ? "Empty 400 often means a bad Authorization value — re-save secret with wrangler secret put GITHUB_TOKEN (raw PAT only, no quotes, no Bearer prefix)."
              : undefined,
        });

        // Recover: public repos allow unauthenticated Contents GET; bad/mangled PAT can yield 400 + empty body.
        if (res.status === 400 && !String(text).trim()) {
          console.warn(
            "[history-github] Retrying GET without Authorization (public repo)",
          );
          const res2 = await fetch(GITHUB_CONTENTS_GET_URL, {
            headers: githubContentsHeadersNoAuth(),
          });
          const text2 = await res2.text();
          if (res2.ok) {
            try {
              const { history, sha } = parseContentsJson(text2);
              return {
                history,
                sha,
                owner,
                repo,
                canWriteGithub: true,
              };
            } catch (parseErr) {
              console.error(
                "[history-github] Anonymous GET OK but parse failed",
                parseErr?.message || parseErr,
              );
            }
          } else {
            logGitHubErrorResponse(
              "GET data/history.json (anonymous retry)",
              res2,
              text2,
            );
          }
        }
      }
    } catch (err) {
      console.error("[history-github] GitHub GET threw (network/exception)", err);
    }

    console.warn(
      "[history-github] Falling back to HISTORY_JSON_URL after GitHub GET failure or parse error",
    );
  }

  const history = await fetchHistoryFromRawUrl(rawUrl);
  return {
    history,
    sha: null,
    owner,
    repo,
    canWriteGithub: false,
  };
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

/** Keep at most `max` sessions (drop oldest). */
function appendRecentSession(history, workout, max = 6) {
  const sessions = [...(history.recentSessions || [])];
  const names = (workout.exercises || []).map((e) => e.exercise).filter(Boolean);
  sessions.push({
    date: new Date().toISOString().slice(0, 10),
    day: workout.day || `Day ${history.currentDay}`,
    focus: workout.focus || "",
    exercises: names,
  });
  while (sessions.length > max) sessions.shift();
  return sessions;
}

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

export function applyWorkoutToHistory(history, workout) {
  let next = { ...history };
  next.recentSessions = appendRecentSession(next, workout, 6);
  next.progressionTracking = updateProgressionTracking(next, workout);
  next.lastProgressionNote = workout.progressionNote || "";
  next.lastSessionNote = workout.progressionNote || "";
  next = advanceSchedule(next);
  return next;
}

const GITHUB_CONTENTS_PUT_URL =
  "https://api.github.com/repos/jonathan959/workout-bot/contents/data/history.json";

/**
 * PUT updated history. Same headers as GET. On failure logs full response; returns { ok }.
 */
export async function putHistoryToGitHub(env, history, sha, owner, repo) {
  const token = sanitizeGithubToken(env.GITHUB_TOKEN);
  if (!token) {
    console.warn("[history-github] PUT skipped: no GITHUB_TOKEN");
    return { ok: false, reason: "no_token" };
  }

  const putUrl =
    owner === DEFAULT_OWNER && repo === DEFAULT_REPO
      ? GITHUB_CONTENTS_PUT_URL
      : `https://api.github.com/repos/${owner}/${repo}/contents/${HISTORY_PATH}`;

  const bodyStr = JSON.stringify(history, null, 2) + "\n";
  const res = await fetch(putUrl, {
    method: "PUT",
    headers: {
      ...githubApiHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `chore: update history.json after /workout (${history.lastUpdated || "session"})`,
      content: encodeGitHubFileContent(bodyStr),
      sha,
      branch: "main",
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    logGitHubErrorResponse("PUT data/history.json (Contents API)", res, text);
    return { ok: false, status: res.status, body: text };
  }
  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: true, data: text };
  }
}
