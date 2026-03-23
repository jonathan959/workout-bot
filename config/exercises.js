/**
 * Re-exports exercises.json. Mesocycles are maintained in JSON; use
 * `node scripts/merge-mesocycles.cjs` after editing scripts/mesocycle-*.json fragments.
 * `scripts/build-config-json.js` will round-trip this file to exercises.json unchanged.
 */
module.exports = require("./exercises.json");
