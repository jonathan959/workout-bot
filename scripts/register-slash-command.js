/**
 * One-time (or when you change the command): register global slash /workout with Discord.
 * Requires: DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID in .env
 *
 *   node scripts/register-slash-command.js
 */
require("dotenv").config();

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_APPLICATION_ID;

if (!token || !appId) {
  console.error("Set DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID in .env");
  process.exit(1);
}

const commands = [
  {
    name: "workout",
    description: "Generate today’s workout with Gemini and post to the webhook channel",
  },
];

async function main() {
  const url = `https://discord.com/api/v10/applications/${appId}/commands`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(res.status, text);
    process.exit(1);
  }
  console.log("Registered global slash commands:", text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
