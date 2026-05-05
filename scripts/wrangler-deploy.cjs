/**
 * Load .env before wrangler so CLOUDFLARE_API_TOKEN is set (fixes non-interactive 400/oauth issues).
 */
const path = require("path");
const { spawnSync } = require("child_process");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

if (!process.env.CLOUDFLARE_API_TOKEN || !String(process.env.CLOUDFLARE_API_TOKEN).trim()) {
  console.error(`CLOUDFLARE_API_TOKEN is missing or empty.

Fix Option A — .env file in this repo (local deploy):
  1. Create token: Workers Scripts:Edit (+ Account read if wizard asks):
     https://dash.cloudflare.com/profile/api-tokens
  2. Add line to .env: CLOUDFLARE_API_TOKEN=<paste>
  3. npm run deploy:worker

Fix Option B — Interactive login (writes token to your user profile, not .env):
  npx wrangler logout
  npx wrangler login
  npx wrangler deploy

Fix Option CI — Push after adding repo secret CLOUDFLARE_API_TOKEN (GitHub → Settings → Secrets).
`);
  process.exit(1);
}

const cwd = path.join(__dirname, "..");
const r = spawnSync("npx", ["wrangler", "deploy"], {
  cwd,
  stdio: "inherit",
  shell: true,
  env: { ...process.env },
});

process.exit(typeof r.status === "number" ? r.status : 1);
