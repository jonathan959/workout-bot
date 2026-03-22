# Discord Daily Workout Bot

AI-generated hypertrophy workouts (Google Gemini), posted to Discord via webhook. Schedules run on **GitHub Actions** (Mon–Sat). Optional **`/workout`** slash command via **Cloudflare Workers**.

## Stack

- **Gemini** — workout JSON (free tier API key)
- **Discord webhook** — rich embeds
- **GitHub Actions** — `cron` + commit `data/history.json` back to the repo
- **Cloudflare Workers** — verify Discord interactions, defer, generate, webhook post
- **Node.js 18+**

## Quick start

1. **Clone** this repo.

2. **Install**

   ```bash
   npm install
   ```

3. **Environment**

   Copy `.env.example` to `.env` and fill in:

   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/)
   - `DISCORD_WEBHOOK_URL` — Server Settings → Integrations → Webhooks → New Webhook → copy URL
   - `DISCORD_APPLICATION_ID` — Discord Developer Portal → your application → Application ID
   - `DISCORD_PUBLIC_KEY` — same page → Public Key (for the Worker interaction endpoint)
   - `DISCORD_BOT_TOKEN` — Bot token (for registering slash commands only)
   - `GITHUB_TOKEN` — optional; Actions uses the default `GITHUB_TOKEN` for commits
   - `HISTORY_JSON_URL` — raw URL to `data/history.json` on GitHub (for the Worker only), e.g.  
     `https://raw.githubusercontent.com/OWNER/REPO/main/data/history.json`

4. **Run locally**

   ```bash
   npm run workout
   ```

   This runs `node src/generate-workout.js`, posts to Discord, and updates `data/history.json`.

### Editing `config/*.js`

The canonical sources are `config/profile.js`, `config/exercises.js`, and `config/substitutions.js`. After you change any of them, regenerate the JSON copies (used by the Cloudflare Worker and by Node via `require("*.json")`):

```bash
npm run build:config
```

Commit both the `.js` and updated `.json` files.

## GitHub Actions (daily automation)

1. Push the repo to GitHub.

2. **Repository secrets** (Settings → Secrets and variables → Actions):

   - `GEMINI_API_KEY`
   - `DISCORD_WEBHOOK_URL`

3. Workflow **Daily Workout** runs at **15:00 UTC Monday–Saturday** (`0 15 * * 1-6`). It installs deps, runs the generator, then commits `data/history.json` if it changed.

4. Grant **Actions** write permission to contents (the workflow uses `contents: write` and `git push`).

## Cloudflare Worker (`/workout`)

1. Install Wrangler: `npm install` (includes `wrangler` devDependency).

2. Log in: `npx wrangler login`

3. Set secrets (values are not committed):

   ```bash
   npx wrangler secret put GEMINI_API_KEY
   npx wrangler secret put DISCORD_WEBHOOK_URL
   npx wrangler secret put DISCORD_PUBLIC_KEY
   npx wrangler secret put DISCORD_APPLICATION_ID
   ```

   (`HISTORY_JSON_URL` can also be set in `wrangler.toml` `[vars]` — already set for this repo.)

4. Deploy:

   ```bash
   npx wrangler deploy
   ```

5. In **Discord Developer Portal** → your app → **Interactions** → **Interactions Endpoint URL**:  
   `https://<your-worker-subdomain>.workers.dev/`

6. **Register the slash command** (once, or after changing commands):

   ```bash
   node scripts/register-slash-command.js
   ```

   Uses `DISCORD_BOT_TOKEN` and `DISCORD_APPLICATION_ID` from `.env`.

### Worker vs GitHub history

- The **Worker** reads `HISTORY_JSON_URL` so Gemini sees recent sessions; it **does not** push commits.  
- The **GitHub Action** is the canonical updater for `data/history.json` (schedule + progression).

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| `401` / invalid signature (Worker) | `DISCORD_PUBLIC_KEY` matches the app; URL in Portal is exactly your Worker URL with trailing behavior Discord expects; no proxy stripping headers. |
| **`429` quota / “exceeded usage”** | Often **`limit: 0`** in the JSON means your **Google Cloud project has no free-tier quota for that model**, not that you personally burned a budget. Fix: create a **new API key** in [Google AI Studio](https://aistudio.google.com/) (new project), ensure **Generative Language API** is enabled in [Google Cloud Console](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com), or attach **billing** / use a model your tier allows. Set optional **`GEMINI_MODEL`** (repo **Variable** `GEMINI_MODEL` for Actions, or `.env` / Wrangler) to a model listed under [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits). The workflow **retries** a few times on 429 with the server’s delay. |
| `GEMINI_API_KEY` errors | Key from AI Studio; model name `gemini-2.5-flash` or your `GEMINI_MODEL` must be enabled for the key. |
| Webhook fails | Webhook URL still valid; bot not deleted; channel exists. |
| Action does not commit | Repo permissions for `GITHUB_TOKEN`; workflow on default branch; `data/history.json` changed. |
| Empty Gemini JSON | Rare model glitch; re-run workflow; check API quota. |
| Slash command missing | Re-run `register-slash-command.js`; wait a few minutes for global commands. |

## Security

- **Never commit** `.env` or real webhook URLs / API keys.
- Rotate a webhook if it was exposed publicly.

## License

MIT (or your choice).
