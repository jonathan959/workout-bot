const deepClone = (o) => JSON.parse(JSON.stringify(o));

const mesocycle1 = {
  day1: {
    back: [
      { exercise: "Wide Grip Lat Pulldown", muscle: "Back", reason: "Upper lat width, V-taper", rest: "2 min", cue: "Pull elbows to back pockets" },
      { exercise: "Straight Arm Cable Pulldown", muscle: "Back", reason: "Lat isolation, zero bicep", rest: "90s", cue: "Feel lats fully stretch at top" },
    ],
    rearDelts: [
      { exercise: "Cable Reverse Fly", muscle: "Rear Delts", reason: "Constant tension, full ROM", rest: "60s", cue: "Light weight, feel rear delt" },
      { exercise: "Face Pull", muscle: "Rear Delts", reason: "Rear delt + joint health", rest: "60s", cue: "Pull to forehead, elbows high" },
    ],
    biceps: [
      { exercise: "Incline DB Curl", muscle: "Biceps", reason: "Long head stretch, maximum peak", rest: "90s", cue: "Full stretch at bottom" },
      { exercise: "Cable Curl", muscle: "Biceps", reason: "Constant tension, full ROM", rest: "90s", cue: "Squeeze hard at top" },
    ],
    forearms: [
      { exercise: "Reverse Curl (EZ Bar)", muscle: "Forearms", reason: "Brachioradialis thickness", rest: "60s", cue: "Slow and controlled" },
    ],
    core: [
      { exercise: "Cable Crunch", muscle: "Core", reason: "Weighted abs", rest: "60s", cue: "Ribs to hips not head down" },
    ],
  },
  day2: {
    chest: [
      { exercise: "Incline DB Press", muscle: "Chest", reason: "Upper chest — your weak spot", rest: "2-3 min", warmupRequired: true, cue: "Drive through upper chest not shoulders" },
      { exercise: "Cable Fly Low to High", muscle: "Chest", reason: "Upper chest constant tension", rest: "90s", cue: "Squeeze at peak, control descent" },
      { exercise: "Cable Fly Mid Height", muscle: "Chest", reason: "Mid chest, full tension", rest: "90s", cue: "Feel inner chest at peak" },
    ],
    shoulders: [
      { exercise: "Cable Lateral Raise", muscle: "Shoulders", reason: "Side delt width, constant tension", rest: "60s", cue: "Lead with elbow not hand" },
      { exercise: "Single Arm Cable OHP", muscle: "Shoulders", reason: "Delt compound, constant tension", rest: "2 min", cue: "Drive up not forward" },
      { exercise: "Seated DB Lateral Raise", muscle: "Shoulders", reason: "Side delt overload", rest: "60s", cue: "Raise to ear height" },
    ],
    core: [
      { exercise: "Hanging Leg Raise", muscle: "Core", reason: "Lower abs, full ROM", rest: "60s", cue: "Control descent, no swinging" },
    ],
  },
  day3: {
    glutes: [
      { exercise: "Hip Thrust", muscle: "Glutes", reason: "Overall glute size, max contraction", rest: "2-3 min", warmupRequired: true, cue: "Squeeze glutes hard at top" },
      { exercise: "Cable Kickback", muscle: "Glutes", reason: "Upper glute isolation", rest: "60s", cue: "Squeeze at full extension" },
      { exercise: "Cable Pull Through", muscle: "Glutes", reason: "Glute stretch position", rest: "90s", cue: "Hinge at hips not waist" },
    ],
    quadsAndGlutes: [
      { exercise: "Leg Press (feet high and wide)", muscle: "Quads + Glutes", reason: "Glute + quad compound", rest: "2 min", cue: "Drive through heels" },
    ],
    hamstrings: [
      { exercise: "Lying Leg Curl", muscle: "Hamstrings", reason: "Hamstring short position", rest: "90s", cue: "Curl heel to glute" },
    ],
    lowerBack: [
      { exercise: "Machine Hyperextension (light)", muscle: "Lower Back", reason: "Lower back strengthening", rest: "60s", cue: "Squeeze glutes at top" },
    ],
    core: [
      { exercise: "Ab Wheel Rollout", muscle: "Core", reason: "Deep core + lower back", rest: "60s", cue: "Brace core throughout" },
    ],
  },
  day4: {
    triceps: [
      { exercise: "Overhead Cable Extension", muscle: "Triceps", reason: "Long head — your missing angle", rest: "90s", cue: "Feel the stretch at the bottom" },
      { exercise: "Rope Pushdown", muscle: "Triceps", reason: "Lateral head peak contraction", rest: "90s", cue: "Supinate at bottom for peak" },
      { exercise: "EZ Bar Skull Crusher", muscle: "Triceps", reason: "All 3 heads, max stretch", rest: "2 min", cue: "Lower to forehead slowly" },
    ],
    biceps: [
      { exercise: "Incline DB Curl", muscle: "Biceps", reason: "Long head — maximum stretch", rest: "90s", cue: "Full stretch at bottom" },
      { exercise: "Hammer Curl", muscle: "Biceps", reason: "Brachialis + forearm thickness", rest: "90s", cue: "Neutral grip throughout" },
      { exercise: "Cable Curl (low pulley)", muscle: "Biceps", reason: "Constant tension lengthened", rest: "90s", cue: "Squeeze hard at top" },
    ],
    forearms: [
      { exercise: "Cable Reverse Curl", muscle: "Forearms", reason: "Brachioradialis thickness", rest: "60s", cue: "Slow and controlled" },
      { exercise: "Behind Back Wrist Curl", muscle: "Forearms", reason: "Forearm flexor thickness", rest: "60s", cue: "Full wrist ROM" },
    ],
    core: [
      { exercise: "Cable Crunch", muscle: "Core", reason: "Weighted abs", rest: "60s", cue: "Ribs to hips not head down" },
    ],
  },
  day5: {
    back: [
      { exercise: "Chest Supported Machine Row", muscle: "Back", reason: "Mid back thickness, zero lower back", rest: "2 min", warmupRequired: true, cue: "Pull to lower chest" },
      { exercise: "Single Arm Cable Row", muscle: "Back", reason: "Unilateral — fixes imbalances", rest: "2 min", cue: "Elbow past your back" },
      { exercise: "Close Grip Lat Pulldown", muscle: "Back", reason: "Lower lat thickness", rest: "2 min", cue: "Pull elbows to hips" },
    ],
    rearDelts: [
      { exercise: "Reverse Pec Deck", muscle: "Rear Delts", reason: "Pure rear delt isolation", rest: "60s", cue: "Light weight, feel rear delt" },
      { exercise: "Single Arm Cable Reverse Fly", muscle: "Rear Delts", reason: "Unilateral — fixes imbalance", rest: "60s", cue: "Lead with elbow back" },
    ],
    biceps: [
      { exercise: "Preacher Curl", muscle: "Biceps", reason: "Short head peak, different angle", rest: "90s", cue: "Full extension at bottom" },
      { exercise: "Cable Curl (cross body)", muscle: "Biceps", reason: "Peak contraction angle", rest: "90s", cue: "Supinate at top" },
    ],
    forearms: [
      { exercise: "Behind Back Wrist Curl", muscle: "Forearms", reason: "Forearm flexor thickness", rest: "60s", cue: "Full wrist ROM" },
    ],
    core: [
      { exercise: "Hanging Leg Raise", muscle: "Core", reason: "Lower abs, full ROM", rest: "60s", cue: "Control descent" },
    ],
  },
  day6: {
    hamstrings: [
      { exercise: "Seated Leg Curl", muscle: "Hamstrings", reason: "Long position, max stretch", rest: "90s", warmupRequired: true, cue: "Curl heel to glute fully" },
      { exercise: "Romanian Deadlift (light DB)", muscle: "Hamstrings", reason: "Glute-ham tie in stretch", rest: "2 min", cue: "Hinge at hips, soft knees" },
      { exercise: "Nordic Curl", muscle: "Hamstrings", reason: "Highest hamstring activation", rest: "2 min", cue: "Control descent slowly" },
    ],
    glutes: [
      { exercise: "Hip Thrust (single leg)", muscle: "Glutes", reason: "Glutes always in, unilateral", rest: "2 min", cue: "Squeeze glutes at top" },
    ],
    quads: [
      { exercise: "Leg Extension (pause at top)", muscle: "Quads", reason: "VMO teardrop activation", rest: "90s", cue: "Pause and squeeze at extension" },
      { exercise: "Hack Squat Machine", muscle: "Quads", reason: "Quad isolation, no lower back", rest: "2 min", cue: "Drive through quads not back" },
    ],
    lowerBack: [
      { exercise: "Machine Hyperextension (light)", muscle: "Lower Back", reason: "Lower back strengthening", rest: "60s", cue: "Squeeze glutes at top" },
    ],
    core: [
      { exercise: "Ab Wheel Rollout", muscle: "Core", reason: "Deep core strength", rest: "60s", cue: "Brace core throughout" },
    ],
  },
};

const mesocycle2Day1 = {
  back: [
    { exercise: "Wide Grip Cable Pulldown (single arm)", muscle: "Back", reason: "Unilateral lat width", rest: "2 min", cue: "Pull elbow to hip" },
    { exercise: "Straight Arm Cable Pulldown (single arm)", muscle: "Back", reason: "Unilateral lat isolation", rest: "90s", cue: "Feel full lat stretch" },
  ],
  rearDelts: [
    { exercise: "Rear Delt Cable Row (face away)", muscle: "Rear Delts", reason: "Rear delt from new angle", rest: "60s", cue: "Lead with elbow back" },
    { exercise: "Band Pull Apart", muscle: "Rear Delts", reason: "External rotation health", rest: "60s", cue: "Squeeze shoulder blades" },
  ],
  biceps: [
    { exercise: "High Cable Curl", muscle: "Biceps", reason: "Short head peak, new angle", rest: "90s", cue: "Keep elbows high" },
    { exercise: "Spider Curl", muscle: "Biceps", reason: "Peak contraction emphasis", rest: "90s", cue: "Squeeze hard at top" },
  ],
  forearms: [
    { exercise: "Reverse Curl (DB)", muscle: "Forearms", reason: "Brachioradialis, new stimulus", rest: "60s", cue: "Control the descent" },
  ],
  core: [
    { exercise: "Cable Crunch", muscle: "Core", reason: "Weighted abs", rest: "60s", cue: "Ribs to hips" },
  ],
};

const mesocycleVariations = {
  2: {
    tricepsVariation: ["Single Arm Overhead Extension", "Bar Pushdown", "Dip Machine"],
    bicepVariation: ["Spider Curl", "High Cable Curl", "Concentration Curl"],
    rearDeltVariation: ["Rear Delt Cable Row", "Band Pull Apart", "Single Arm Reverse Fly"],
    gluteVariation: ["Single Leg Hip Thrust", "Abduction Machine", "Cable Pull Through"],
    chestVariation: ["Incline DB Press", "Cable Fly High to Low", "Cable Fly Low to High"],
  },
  3: {
    tricepsVariation: ["Cable Overhead Extension (rope)", "Reverse Grip Pushdown", "DB Skull Crusher"],
    bicepVariation: ["Drag Curl", "Low Cable Curl", "Machine Curl"],
    rearDeltVariation: ["Bent Over Cable Fly", "Rope Face Pull", "Machine Reverse Fly"],
    gluteVariation: ["Banded Hip Thrust", "Cable Kickback (different angle)", "Cable Pull Through"],
    backVariation: ["Neutral Grip Pulldown", "Cable Row (high pulley)", "Straight Arm Pulldown (rope)"],
  },
};

const mesocycle2 = { ...deepClone(mesocycle1), day1: mesocycle2Day1 };
const mesocycle3 = deepClone(mesocycle1);

module.exports = {
  mesocycles: {
    1: mesocycle1,
    2: mesocycle2,
    3: mesocycle3,
  },
  mesocycleVariations,
};
