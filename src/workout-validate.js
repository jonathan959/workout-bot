/**
 * Post-generation checks for Gemini workout JSON.
 */

/** Phrases only — allow e.g. Romanian deadlift (light DB) per program */
const BANNED_SUBSTRINGS = [
  "barbell bench press",
  "bench press", // barbell flat bench
  "conventional deadlift",
  "trap bar deadlift",
  "sumo deadlift",
  "stiff-leg deadlift",
  "stiff leg deadlift",
  "bent over barbell",
  "heavy barbell squat",
  "t-bar row",
  "t bar row",
  "pendlay row",
  "calf raise",
  "upright row",
  "behind the neck",
  "behind-the-neck",
];

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function sortedExercises(workout) {
  const ex = Array.isArray(workout?.exercises) ? workout.exercises : [];
  return [...ex].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function isChest(m) {
  return norm(m).includes("chest");
}
function isShoulder(m) {
  const x = norm(m);
  return x.includes("shoulder") || x.includes("delt");
}
function isTricep(m) {
  return norm(m).includes("tricep");
}
function isBicep(m) {
  return norm(m).includes("bicep");
}
function isRearDeltMuscle(m) {
  return norm(m).includes("rear");
}
function isCore(m) {
  return norm(m).includes("core");
}

function validateBanned(exercises, errors) {
  for (const e of exercises) {
    const name = norm(e.exercise);
    for (const b of BANNED_SUBSTRINGS) {
      if (name.includes(b)) {
        errors.push(`Banned exercise pattern "${b}" in: ${e.exercise}`);
      }
    }
  }
}

function validatePush(exercises, errors) {
  const idxChest = [];
  const idxSh = [];
  const idxTri = [];
  exercises.forEach((e, i) => {
    const m = e.muscle;
    if (isChest(m)) idxChest.push(i);
    if (isShoulder(m)) idxSh.push(i);
    if (isTricep(m)) idxTri.push(i);
  });
  if (!idxChest.length || !idxSh.length) return;
  const maxC = Math.max(...idxChest);
  const minS = Math.min(...idxSh);
  if (maxC >= minS) {
    errors.push(
      "Push order: all chest exercises must finish before any shoulder exercise",
    );
  }
  if (idxTri.length) {
    const maxS = Math.max(...idxSh);
    const minT = Math.min(...idxTri);
    if (maxS >= minT) {
      errors.push(
        "Push order: all shoulder exercises must finish before any tricep exercise",
      );
    }
  }
}

function validatePull(exercises, errors) {
  const rdIdx = [];
  exercises.forEach((e, i) => {
    if (isRearDeltMuscle(e.muscle)) rdIdx.push(i);
  });
  for (let j = 1; j < rdIdx.length; j++) {
    if (rdIdx[j] === rdIdx[j - 1] + 1) {
      errors.push("Pull order: two rear delt exercises must not be back-to-back");
    }
  }
  const biceps = exercises.filter((e) => isBicep(e.muscle));
  if (biceps.length) {
    const first = norm(biceps[0].exercise);
    if (!first.includes("incline") || !first.includes("curl")) {
      errors.push(
        `Pull order: first bicep must be Incline DB Curl, got: ${biceps[0].exercise}`,
      );
    }
  }
}

function validateArms(exercises, errors) {
  const firstTri = exercises.find((e) => isTricep(e.muscle));
  if (firstTri) {
    const n = norm(firstTri.exercise);
    if (!n.includes("overhead")) {
      errors.push(
        `Arms day: first tricep must be an overhead cable extension pattern, got: ${firstTri.exercise}`,
      );
    }
  }
}

function validateFirstBicepAllDays(exercises, errors) {
  const biceps = exercises.filter((e) => isBicep(e.muscle));
  if (!biceps.length) return;
  const first = norm(biceps[0].exercise);
  if (!first.includes("incline") || !first.includes("curl")) {
    errors.push(
      `First bicep of session must be Incline DB Curl pattern, got: ${biceps[0].exercise}`,
    );
  }
}

/**
 * @param {object} workout - parsed Gemini JSON
 * @param {{ dayNum: number }} ctx - run context
 * @returns {{ ok: boolean, errors: string[] }}
 */
function validateWorkout(workout, ctx) {
  const errors = [];
  const exercises = sortedExercises(workout);
  if (!exercises.length) {
    errors.push("No exercises in workout");
    return { ok: false, errors };
  }

  validateBanned(exercises, errors);

  const day = ctx.dayNum;
  if (day === 2 || day === 6) {
    validatePush(exercises, errors);
  }
  if (day === 1 || day === 5) {
    validatePull(exercises, errors);
  }
  if (day === 4) {
    validateArms(exercises, errors);
  }
  validateFirstBicepAllDays(exercises, errors);

  return { ok: errors.length === 0, errors };
}

module.exports = { validateWorkout, BANNED_SUBSTRINGS };
