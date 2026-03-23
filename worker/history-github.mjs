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

function githubApiHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "workout-bot-cloudflare-worker",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

export async function fetchHistoryAndShaFromGitHub(env) {
  const token = env.GITHUB_TOKEN;
  if (!token || !String(token).trim()) {
    throw new Error("GITHUB_TOKEN is not set (use wrangler secret put GITHUB_TOKEN)");
  }
  const owner = env.GITHUB_REPO_OWNER || DEFAULT_OWNER;
  const repo = env.GITHUB_REPO_NAME || DEFAULT_REPO;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${HISTORY_PATH}?ref=main`;
  const res = await fetch(url, { headers: githubApiHeaders(token) });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GitHub GET ${HISTORY_PATH} failed: ${res.status} ${text.slice(0, 500)}`);
  }
  const data = JSON.parse(text);
  const jsonText = decodeGitHubFileContent(data.content);
  const history = JSON.parse(jsonText);
  return { history, sha: data.sha, owner, repo };
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

export async function putHistoryToGitHub(env, history, sha, owner, repo) {
  const token = env.GITHUB_TOKEN;
  const bodyStr = JSON.stringify(history, null, 2) + "\n";
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${HISTORY_PATH}`;
  const res = await fetch(url, {
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
    throw new Error(`GitHub PUT ${HISTORY_PATH} failed: ${res.status} ${text.slice(0, 800)}`);
  }
  return JSON.parse(text);
}
