const fs = require("fs");

function loadHistory(dataPath) {
  const raw = fs.readFileSync(dataPath, "utf8");
  return JSON.parse(raw);
}

function saveHistory(dataPath, history) {
  fs.writeFileSync(dataPath, JSON.stringify(history, null, 2) + "\n", "utf8");
}

module.exports = { loadHistory, saveHistory };
