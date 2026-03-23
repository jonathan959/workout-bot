/**
 * Cloudflare Worker — Discord slash `/workout` and `/sub`.
 *
 * When `GITHUB_TOKEN` is set (wrangler secret), `/workout` loads history from the
 * GitHub API and writes updates back after each generation (see history-github.mjs).
 *
 * Deploy: npx wrangler deploy
 * Discord Developer Portal → Interactions Endpoint URL → your workers.dev URL
 */

import { verifyKey } from "discord-interactions";
import { Router } from "itty-router";
import profile from "../config/profile.json";
import { computeRunContext } from "./run-context.mjs";
import { generateWorkoutFromContext } from "./workout-gen.mjs";
import { buildWebhookPayload } from "./discord-embed.mjs";
import { getSubstitutionJson, buildSubstitutionEmbed } from "./sub-handler.mjs";
import {
  fetchHistoryAndShaFromGitHub,
  applyWorkoutToHistory,
  putHistoryToGitHub,
} from "./history-github.mjs";

const router = Router();

async function fetchHistory(url) {
  if (!url) throw new Error("HISTORY_JSON_URL is not configured");
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
  return res.json();
}

async function patchInteractionResponse(env, interaction, body) {
  const appId = env.DISCORD_APPLICATION_ID;
  const token = interaction.token;
  const url = `https://discord.com/api/v10/webhooks/${appId}/${token}/messages/@original`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Discord follow-up failed: ${res.status} ${t}`);
  }
}

async function postWebhook(env, payload) {
  const url = env.DISCORD_WEBHOOK_URL;
  if (!url) throw new Error("DISCORD_WEBHOOK_URL is not set");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Webhook post failed: ${res.status} ${t}`);
  }
}

async function handleWorkout(env, interaction) {
  try {
    const useGitHub = Boolean(env.GITHUB_TOKEN && String(env.GITHUB_TOKEN).trim());
    let history;
    let githubSha = null;
    let githubOwner;
    let githubRepo;

    if (useGitHub) {
      const gh = await fetchHistoryAndShaFromGitHub(env);
      history = gh.history;
      githubSha = gh.sha;
      githubOwner = gh.owner;
      githubRepo = gh.repo;
    } else {
      history = await fetchHistory(env.HISTORY_JSON_URL);
    }

    const runCtx = computeRunContext(history, profile);
    const workout = await generateWorkoutFromContext(runCtx, env.GEMINI_API_KEY, {
      model: env.GEMINI_MODEL || "gemini-2.5-flash",
    });
    workout.week = runCtx.programWeek;
    workout.phase = runCtx.phase;
    workout.mesocycle = runCtx.mesocycle;

    await postWebhook(env, buildWebhookPayload(workout));

    let historyNote = "";
    if (useGitHub && githubSha) {
      const updated = applyWorkoutToHistory(history, workout);
      await putHistoryToGitHub(env, updated, githubSha, githubOwner, githubRepo);
      historyNote = " History saved to GitHub.";
    }

    await patchInteractionResponse(env, interaction, {
      content: `✅ Workout generated and posted to the webhook channel.${historyNote}`,
    });
  } catch (e) {
    console.error(e);
    try {
      await patchInteractionResponse(env, interaction, {
        content: `❌ Error: ${e.message || String(e)}`,
      });
    } catch (_) {
      /* ignore */
    }
  }
}

async function handleSub(env, interaction) {
  try {
    const opt = interaction.data.options?.find((o) => o.name === "exercise");
    const exercise = opt?.value;
    if (!exercise || !String(exercise).trim()) {
      throw new Error("Missing required option: exercise");
    }

    const result = await getSubstitutionJson(env, String(exercise));
    await postWebhook(env, { embeds: [buildSubstitutionEmbed(result)] });

    await patchInteractionResponse(env, interaction, {
      content: "✅ Substitution posted to the webhook channel.",
    });
  } catch (e) {
    console.error(e);
    try {
      await patchInteractionResponse(env, interaction, {
        content: `❌ Error: ${e.message || String(e)}`,
      });
    } catch (_) {
      /* ignore */
    }
  }
}

router.post("/", async (request, env, ctx) => {
  const body = await request.text();
  const sig = request.headers.get("X-Signature-Ed25519");
  const ts = request.headers.get("X-Signature-Timestamp");

  const ok = await verifyKey(body, sig, ts, env.DISCORD_PUBLIC_KEY);
  if (!ok) {
    return new Response("invalid request signature", { status: 401 });
  }

  let interaction;
  try {
    interaction = JSON.parse(body);
  } catch {
    return new Response("bad json", { status: 400 });
  }

  if (interaction.type === 1) {
    return new Response(JSON.stringify({ type: 1 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (interaction.type === 2 && interaction.data?.name === "workout") {
    ctx.waitUntil(handleWorkout(env, interaction));
    return new Response(JSON.stringify({ type: 5 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (interaction.type === 2 && interaction.data?.name === "sub") {
    ctx.waitUntil(handleSub(env, interaction));
    return new Response(JSON.stringify({ type: 5 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ type: 4, data: { content: "Unknown command" } }), {
    headers: { "Content-Type": "application/json" },
  });
});

router.all("*", () => new Response("Workout bot worker — POST / for Discord interactions", { status: 404 }));

export default {
  fetch: (request, env, ctx) => router.handle(request, env, ctx),
};
