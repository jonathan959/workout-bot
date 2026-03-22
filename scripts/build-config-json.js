/**
 * Regenerates config/*.json from config/*.js (single source: the .js modules).
 * Run after editing profile.js, exercises.js, or substitutions.js.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function write(name) {
  const mod = require(path.join(root, "config", `${name}.js`));
  const out = path.join(root, "config", `${name}.json`);
  fs.writeFileSync(out, JSON.stringify(mod, null, 2) + "\n", "utf8");
  console.log("Wrote", out);
}

["profile", "exercises", "substitutions"].forEach(write);
