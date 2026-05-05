/**
 * Exercise templates per mesocycle. Mesocycles 2 and 3 are mesocycle 1 plus explicit name swaps only.
 */

function clone(o) {
  return JSON.parse(JSON.stringify(o));
}

function applyExerciseNameSwaps(mesocycle, swapsByDay) {
  const out = clone(mesocycle);
  for (const [dayKey, swapMap] of Object.entries(swapsByDay || {})) {
    const dayPlan = out[dayKey];
    if (!dayPlan || typeof dayPlan !== "object") continue;
    for (const arr of Object.values(dayPlan)) {
      if (!Array.isArray(arr)) continue;
      for (const row of arr) {
        if (row && typeof row.exercise === "string" && swapMap[row.exercise]) {
          row.exercise = swapMap[row.exercise];
        }
      }
    }
  }
  return out;
}

const mesocycle1 = {
  day1: {
    // Pull A
    back: [
      {
        exercise: "Pull-Up (weighted if possible, assisted if needed)",
        muscle: "Back",
        reason: "Vertical pull, lat width, V-taper — anchor compound",
        rest: "2 min",
        warmupRequired: true,
        cue: "Drive elbows down to hips, full hang at bottom",
      },
      {
        exercise: "Chest-Supported Machine Row",
        muscle: "Back",
        reason: "Horizontal thickness, zero lower back load",
        rest: "2 min",
        warmupRequired: true,
        cue: "Pull elbows to ribs, squeeze shoulder blades",
      },
      {
        exercise: "Straight Arm Cable Pulldown",
        muscle: "Back",
        reason: "Lat isolation with no bicep involvement",
        rest: "90s",
        cue: "Slight elbow bend locked, feel lats stretch then contract",
      },
    ],
    rearDelts: [
      {
        exercise: "Cable Reverse Fly",
        muscle: "Rear Delts",
        reason: "Rear delt isolation with constant tension",
        rest: "60s",
        cue: "Light weight, lead with pinkies",
      },
    ],
    biceps: [
      {
        exercise: "Incline DB Curl",
        muscle: "Biceps",
        reason: "Long head stretch — preferred bicep variation",
        rest: "90s",
        cue: "Full stretch at bottom, no swinging",
      },
      {
        exercise: "Cable Curl (bar attachment)",
        muscle: "Biceps",
        reason: "Constant tension peak contraction",
        rest: "90s",
        cue: "Elbows pinned to sides",
      },
    ],
    forearms: [
      {
        exercise: "Reverse Curl (EZ bar)",
        muscle: "Forearms",
        reason: "Brachioradialis development",
        rest: "60s",
        cue: "Slow tempo, no momentum",
      },
    ],
    core: [
      {
        exercise: "Cable Crunch",
        muscle: "Core",
        reason: "Weighted abs for actual growth",
        rest: "60s",
        cue: "Ribs to hips, not head down",
      },
    ],
  },

  day2: {
    // Push A
    chest: [
      {
        exercise: "Incline DB Press",
        muscle: "Chest",
        reason: "Upper chest priority — anchor compound",
        rest: "2-3 min",
        warmupRequired: true,
        cue: "30 degree bench, drive through chest",
      },
      {
        exercise: "Machine Chest Press",
        muscle: "Chest",
        reason: "Different angle and loading from DB press",
        rest: "2 min",
        cue: "Slight pause at chest, controlled negative",
      },
      {
        exercise: "Cable Chest Fly (low to high)",
        muscle: "Chest",
        reason: "Upper chest stretch with constant tension",
        rest: "90s",
        cue: "Squeeze hands together at top",
      },
    ],
    shoulders: [
      {
        exercise: "Cable Lateral Raise",
        muscle: "Shoulders",
        reason: "Side delt with constant tension at bottom",
        rest: "60s",
        cue: "Lead with elbow not hand",
      },
    ],
    rearDelts: [
      {
        exercise: "Cable Reverse Fly",
        muscle: "Rear Delts",
        reason: "Rear delt second hit — Push A would otherwise lack this",
        rest: "60s",
        cue: "Light weight, feel rear delt only",
      },
    ],
    core: [
      {
        exercise: "Hanging Leg Raise",
        muscle: "Core",
        reason: "Lower abs full ROM",
        rest: "60s",
        cue: "Curl pelvis up, no swinging",
      },
    ],
  },

  day3: {
    // Legs A
    glutes: [
      {
        exercise: "Hip Thrust (machine or barbell)",
        muscle: "Glutes",
        reason: "Best glute mass builder — anchor compound",
        rest: "2-3 min",
        warmupRequired: true,
        cue: "Drive hips up, squeeze glutes hard at top",
      },
    ],
    quadsGlutes: [
      {
        exercise: "Bulgarian Split Squat (DB)",
        muscle: "Quads + Glutes",
        reason: "Glute + quad + VMO with upright torso, knee-safe — responds well",
        rest: "2 min",
        cue: "Upright torso, knee tracks over toes",
      },
      {
        exercise: "Leg Press (feet high and wide)",
        muscle: "Glutes + Quads",
        reason: "Glute-biased press, moderate weight only — knee constraint",
        rest: "2 min",
        cue: "Moderate weight only, full controlled ROM",
      },
    ],
    quadsVMO: [
      {
        exercise: "Leg Extension (VMO focus)",
        muscle: "Quads (VMO)",
        reason: "Direct VMO/teardrop work — anchor exercise",
        rest: "90s",
        cue: "Toes slightly out, 1 second pause at top lockout",
      },
    ],
    hamstrings: [
      {
        exercise: "Lying Leg Curl",
        muscle: "Hamstrings",
        reason: "Hamstring shortened position",
        rest: "90s",
        cue: "Slow 3-second negative, full contraction",
      },
      {
        exercise: "Seated Leg Curl",
        muscle: "Hamstrings",
        reason: "Hamstring lengthened position — best position for growth",
        rest: "90s",
        cue: "Feel stretch at start of each rep",
      },
    ],
    glutesFinisher: [
      {
        exercise: "Cable Kickback",
        muscle: "Glutes",
        reason: "Glute isolation finisher",
        rest: "60s",
        cue: "Squeeze glute at end of kick",
      },
    ],
    core: [
      {
        exercise: "Ab Wheel Rollout",
        muscle: "Core",
        reason: "Deep core + lower back stability",
        rest: "60s",
        cue: "Brace hard, don't sag",
      },
    ],
  },

  day4: {
    // Arms
    triceps: [
      {
        exercise: "Overhead Cable Extension",
        muscle: "Triceps (long head)",
        reason: "Long head priority — non-negotiable, fresh first",
        rest: "90s",
        warmupRequired: true,
        cue: "Full stretch at bottom, lock elbows in place",
      },
      {
        exercise: "Rope Pushdown",
        muscle: "Triceps (lateral/medial)",
        reason: "Lateral and medial head",
        rest: "90s",
        cue: "Spread rope at bottom, full lockout",
      },
      {
        exercise: "Cable Tricep Extension (rope)",
        muscle: "Triceps (all heads)",
        reason: "All three heads finisher with no joint stress",
        rest: "90s",
        cue: "Slow tempo, control the negative",
      },
    ],
    biceps: [
      {
        exercise: "Incline DB Curl",
        muscle: "Biceps (long head)",
        reason: "Long head bicep, still relatively fresh",
        rest: "90s",
        cue: "Full stretch at bottom",
      },
      {
        exercise: "Cable Hammer Curl (rope)",
        muscle: "Biceps + Forearms",
        reason: "Brachialis and forearm thickness",
        rest: "90s",
        cue: "Neutral grip throughout",
      },
      {
        exercise: "Preacher Curl (machine)",
        muscle: "Biceps (short head)",
        reason: "Short head bicep, different angle from incline",
        rest: "60s",
        cue: "Don't lose tension at top",
      },
    ],
    quadsVMO: [
      {
        exercise: "Leg Extension (VMO focus)",
        muscle: "Quads (VMO)",
        reason: "Second quad/VMO hit of the week — anchor",
        rest: "90s",
        cue: "Toes slightly out, 1s pause at top",
      },
      {
        exercise: "Walking DB Lunge or Reverse Lunge",
        muscle: "Quads",
        reason: "Quad-biased single-leg, knee-friendly",
        rest: "90s",
        cue: "Long stride, knee tracks over toes",
      },
    ],
    forearms: [
      {
        exercise: "Wrist Curl",
        muscle: "Forearms",
        reason: "Forearm flexor",
        rest: "60s",
        cue: "Full ROM at the wrist",
      },
    ],
    core: [
      {
        exercise: "Cable Crunch",
        muscle: "Core",
        reason: "Weighted abs",
        rest: "60s",
        cue: "Ribs to hips",
      },
    ],
  },

  day5: {
    // Pull B
    back: [
      {
        exercise: "Single-Arm Cable Row",
        muscle: "Back",
        reason: "Unilateral horizontal pull, full ROM — anchor compound",
        rest: "2 min",
        warmupRequired: true,
        cue: "Full stretch forward, drive elbow back",
      },
      {
        exercise: "Lat Pulldown (close neutral grip)",
        muscle: "Back",
        reason: "Different vertical pull from Day 1's wide grip",
        rest: "2 min",
        cue: "Pull to upper chest, lean back slightly",
      },
      {
        exercise: "Seated Cable Row (wide grip)",
        muscle: "Back (mid)",
        reason: "Mid-back and rhomboid emphasis",
        rest: "90s",
        cue: "Squeeze shoulder blades together",
      },
    ],
    rearDelts: [
      {
        exercise: "Rear Delt Machine (Reverse Pec Deck)",
        muscle: "Rear Delts",
        reason: "Different stimulus than Pull A's cable fly",
        rest: "60s",
        cue: "Squeeze and pause for 1 second",
      },
    ],
    biceps: [
      {
        exercise: "Incline DB Curl",
        muscle: "Biceps",
        reason: "Long head bicep — primary variation",
        rest: "90s",
        cue: "Full stretch at bottom",
      },
      {
        exercise: "Hammer Curl (DB)",
        muscle: "Biceps + Forearms",
        reason: "Brachialis, different from Pull A's cable curl",
        rest: "90s",
        cue: "Neutral grip throughout",
      },
    ],
    forearms: [
      {
        exercise: "Wrist Curl + Reverse Wrist Curl",
        muscle: "Forearms",
        reason: "Both flexor and extensor",
        rest: "60s",
        cue: "Full ROM both directions",
      },
    ],
    core: [
      {
        exercise: "Hanging Leg Raise",
        muscle: "Core",
        reason: "Lower abs full ROM",
        rest: "60s",
        cue: "No swinging, controlled",
      },
    ],
  },

  day6: {
    // Push B — chest blocks before shoulders for push-order validation
    chest: [
      {
        exercise: "Flat DB Press",
        muscle: "Chest",
        reason: "Mid chest — different angle than Push A's incline",
        rest: "2 min",
        cue: "Slight pause at chest",
      },
      {
        exercise: "Cable Fly (high to low)",
        muscle: "Chest (lower)",
        reason: "Lower chest fibers — different angle than Push A",
        rest: "90s",
        cue: "Squeeze low and across body",
      },
    ],
    shoulders: [
      {
        exercise: "Machine Shoulder Press (neutral grip)",
        muscle: "Shoulders",
        reason: "Vertical press WITHOUT elbow stress — anchor compound",
        rest: "2-3 min",
        warmupRequired: true,
        cue: "Neutral grip mandatory, controlled descent",
      },
      {
        exercise: "DB Lateral Raise",
        muscle: "Shoulders",
        reason: "Top-position overload, different from Push A's cable",
        rest: "60s",
        cue: "Lead with elbow, slight forward lean",
      },
    ],
    triceps: [
      {
        exercise: "Single-Arm Overhead Cable Extension",
        muscle: "Triceps (long head)",
        reason: "Long head 2nd hit, unilateral variation",
        rest: "90s",
        cue: "Full stretch at bottom",
      },
      {
        exercise: "EZ Bar Skull Crusher",
        muscle: "Triceps (all heads)",
        reason: "All three heads, heavy loading available",
        rest: "90s",
        cue: "Lower to forehead slowly, elbows locked in place",
      },
    ],
    core: [
      {
        exercise: "Cable Crunch",
        muscle: "Core",
        reason: "Weighted abs",
        rest: "60s",
        cue: "Ribs to hips",
      },
    ],
  },
};

const mesocycle2Swaps = {
  day1: {
    "Chest-Supported Machine Row": "Seal Row (or Chest-Supported T-Handle alternative)",
  },
  day2: {
    "Machine Chest Press": "Incline Machine Press",
  },
  day3: {
    "Bulgarian Split Squat (DB)": "Step-Up (high box, weighted)",
  },
  day4: {
    "Rope Pushdown": "V-Bar Pushdown",
    "Cable Hammer Curl (rope)": "Hammer Curl (DB, alternating)",
  },
  day5: {
    "Single-Arm Cable Row": "Chest-Supported DB Row (incline bench)",
    "Seated Cable Row (wide grip)": "Machine Row (wide grip)",
  },
  day6: {
    "Flat DB Press": "Decline Cable Press (or Decline Machine Press)",
    "DB Lateral Raise": "Cable Lateral Raise (single arm)",
  },
};

const mesocycle3Swaps = {
  day1: {
    "Chest-Supported Machine Row":
      "Meadows Row Alternative (single-arm DB row, chest-supported)",
    "Cable Curl (bar attachment)": "Spider Curl (DB on incline bench, face down)",
  },
  day2: {
    "Machine Chest Press": "Smith Machine Incline Press (controlled, light-moderate)",
    "Cable Chest Fly (low to high)": "Pec Deck Machine",
  },
  day3: {
    "Bulgarian Split Squat (DB)": "Walking DB Lunge (long stride)",
    "Leg Press (feet high and wide)": "Hack Squat (light-moderate, knee-safe range)",
  },
  day4: {
    "Rope Pushdown": "Cross-Body Cable Extension",
    "Preacher Curl (machine)": "Concentration Curl (DB)",
  },
  day5: {
    "Single-Arm Cable Row": "Chest-Supported Row Machine (alternative angle)",
    "Hammer Curl (DB)": "Cross-Body Hammer Curl (DB)",
  },
  day6: {
    "Flat DB Press": "Machine Chest Press (mid-chest setting)",
    "EZ Bar Skull Crusher": "Cable Skull Crusher (rope, lying)",
  },
};

function collectExerciseNamesFromMesocycle(m) {
  const names = [];
  for (const dayPlan of Object.values(m)) {
    if (!dayPlan || typeof dayPlan !== "object") continue;
    for (const arr of Object.values(dayPlan)) {
      if (!Array.isArray(arr)) continue;
      for (const row of arr) {
        if (row && row.exercise) names.push(row.exercise);
      }
    }
  }
  return names;
}

function newExerciseNamesComparedTo(prevMc, nextMc) {
  const prev = new Set(collectExerciseNamesFromMesocycle(prevMc));
  const nextNames = collectExerciseNamesFromMesocycle(nextMc);
  return [...new Set(nextNames.filter((n) => !prev.has(n)))].sort();
}

function approxRotationPercent(prevMc, nextMc) {
  const prevN = [...new Set(collectExerciseNamesFromMesocycle(prevMc))];
  const newNames = newExerciseNamesComparedTo(prevMc, nextMc);
  if (!prevN.length) return 0;
  return Math.round((newNames.length / prevN.length) * 100);
}

const mesocycle2 = applyExerciseNameSwaps(mesocycle1, mesocycle2Swaps);
const mesocycle3 = applyExerciseNameSwaps(mesocycle1, mesocycle3Swaps);

module.exports = {
  mesocycles: {
    "1": mesocycle1,
    "2": mesocycle2,
    "3": mesocycle3,
  },
  mesocycleVariations: {
    "2": {
      newComparedToMesocycle1: newExerciseNamesComparedTo(mesocycle1, mesocycle2),
      approxRotationFromMesocycle1Percent: approxRotationPercent(mesocycle1, mesocycle2),
    },
    "3": {
      newComparedToMesocycle2: newExerciseNamesComparedTo(mesocycle2, mesocycle3),
      approxRotationFromMesocycle2Percent: approxRotationPercent(mesocycle2, mesocycle3),
    },
  },
};
