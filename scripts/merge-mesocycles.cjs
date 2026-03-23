/**
 * One-off merge: overwrite mesocycles 2 & 3 and patch mesocycle 1 day4/5/6.
 * Run: node scripts/merge-mesocycles.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const target = path.join(root, "config", "exercises.json");
const data = JSON.parse(fs.readFileSync(target, "utf8"));

const meso2 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "mesocycle-2.json"), "utf8"),
);
const meso3 = JSON.parse(
  fs.readFileSync(path.join(__dirname, "mesocycle-3.json"), "utf8"),
);

data.mesocycles["2"] = meso2;
data.mesocycles["3"] = meso3;

const one = data.mesocycles["1"];
one.day4.secondary = [
  {
    exercise: "Cable Kickback",
    muscle: "Glutes",
    reason: "Glute isolation second hit",
    rest: "60s",
    cue: "Squeeze at full extension",
  },
  {
    exercise: "Lying Leg Curl",
    muscle: "Hamstrings",
    reason: "Hamstring second hit",
    rest: "90s",
    cue: "Curl heel to glute",
  },
];

one.day5.biceps = [
  {
    exercise: "Incline DB Curl",
    muscle: "Biceps",
    reason: "Long head stretch — first bicep Pull B",
    rest: "90s",
    cue: "Full stretch at bottom",
  },
  {
    exercise: "Cable Curl (cross body)",
    muscle: "Biceps",
    reason: "Peak contraction angle",
    rest: "90s",
    cue: "Supinate at top",
  },
];

one.day6 = {
  chest: [
    {
      exercise: "Flat DB Press",
      muscle: "Chest",
      reason: "Mid chest mass builder",
      rest: "2-3 min",
      warmupRequired: true,
      cue: "Drive through chest not shoulders",
    },
    {
      exercise: "Cable Fly High to Low",
      muscle: "Chest",
      reason: "Lower chest constant tension",
      rest: "90s",
      cue: "Squeeze at bottom of movement",
    },
  ],
  shoulders: [
    {
      exercise: "Cable Lateral Raise",
      muscle: "Shoulders",
      reason: "Side delt second hit this week",
      rest: "60s",
      cue: "Lead with elbow not hand",
    },
    {
      exercise: "Reverse Cable Fly",
      muscle: "Shoulders",
      reason: "Rear delt second session",
      rest: "60s",
      cue: "Light weight feel rear delt",
    },
  ],
  triceps: [
    {
      exercise: "Single Arm Overhead Cable Extension",
      muscle: "Triceps",
      reason: "Long head second hit this week",
      rest: "90s",
      cue: "Feel full stretch at bottom",
    },
    {
      exercise: "EZ Bar Skull Crusher",
      muscle: "Triceps",
      reason: "All 3 heads overload",
      rest: "2 min",
      cue: "Lower to forehead slowly",
    },
  ],
  core: [
    {
      exercise: "Cable Crunch",
      muscle: "Core",
      reason: "Weighted abs",
      rest: "60s",
      cue: "Ribs to hips not head down",
    },
  ],
};

fs.writeFileSync(target, JSON.stringify(data, null, 2) + "\n");
console.log("Wrote", target);
