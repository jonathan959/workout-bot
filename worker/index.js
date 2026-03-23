/**
 * Cloudflare Worker — Discord slash `/workout` and `/sub`.
 *
 * History: tries GitHub Contents API first when `GITHUB_TOKEN` is set; on failure
 * falls back to `HISTORY_JSON_URL`. Writes back via Contents API when GET returned a SHA;
 * PUT errors are logged and the user still gets a successful workout (see history-github.mjs).
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
  loadHistoryForWorkout,
  applyWorkoutToHistory,
  putHistoryToGitHub,
} from "./history-github.mjs";

const router = Router();

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
    const { history, sha: githubSha, owner: githubOwner, repo: githubRepo, canWriteGithub } =
      await loadHistoryForWorkout(env);

    const runCtx = computeRunContext(history, profile);
    const workout = await generateWorkoutFromContext(runCtx, env.GEMINI_API_KEY, {
      model: env.GEMINI_MODEL || "gemini-2.5-flash",
    });
    workout.week = runCtx.programWeek;
    workout.phase = runCtx.phase;
    workout.mesocycle = runCtx.mesocycle;

    await postWebhook(env, buildWebhookPayload(workout));

    let historyNote = "";
    if (canWriteGithub && githubSha) {
      const updated = applyWorkoutToHistory(history, workout);
      const putResult = await putHistoryToGitHub(env, updated, githubSha, githubOwner, githubRepo);
      if (putResult.ok) {
        historyNote = " History saved to GitHub.";
      } else {
        console.error("[workout] GitHub history write failed; workout still posted.", putResult);
      }
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
