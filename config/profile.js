module.exports = {
  age: 21,
  experience: "advanced",
  trainingYears: 4,
  bodyType: "average",
  goal: "lean muscle growth",
  trainTime: "afternoon",
  cardio: "runs/jogs every other day — never add more cardio",
  gym: "full commercial gym",
  belt: false,

  split: {
    day1: "Pull A — Back Width + Rear Delts + Biceps + Forearms",
    day2: "Push A — Chest + Shoulders",
    day3: "Legs A — Glute Focus",
    day4: "Arms — Biceps + Triceps + Forearms (all fresh)",
    day5: "Pull B — Back Thickness + Rear Delts + Biceps",
    day6: "Legs B — Hamstring + Lower Quad + Glutes",
  },

  strengths: ["back", "chest", "glutes"],

  weaknesses: {
    triceps: {
      problem: "Long head never trained. Only pushdowns, dips, pushups.",
      fix: "Overhead extension every arms day. Rotate all 3 heads. Priority muscle.",
      activationCue: "Feel the stretch at the very bottom of the movement",
    },
    upperChest: {
      problem: "Underdeveloped above nipple line",
      fix: "Incline angle every chest day. Non-negotiable.",
      activationCue: "Drive through upper chest not shoulders",
    },
    sideDelt: {
      problem: "Lacking width",
      fix: "Cable lateral raises every push day. Lead with elbow.",
      activationCue: "Lead with elbow not hand, raise to ear height",
    },
    rearDelt: {
      problem: "Weak — affects posture and shoulder balance",
      fix: "Trained on pull days only where anatomically correct. Every pull session.",
      activationCue: "Light weight, feel the rear delt not your traps",
    },
    upperLats: {
      problem: "Width and V-taper could improve",
      fix: "Wide grip pulldowns + straight arm pulldowns every pull day",
      activationCue: "Pull elbows to back pockets not hands to chest",
    },
    traps: {
      problem: "Underdeveloped, affects upper back thickness",
      fix: "Shrugs or trap work every pull day",
    },
    forearms: {
      problem: "Only one cable exercise currently",
      fix: "Rotate reverse curl, wrist curl, cable reverse curl across sessions",
      activationCue: "Slow and controlled, full wrist ROM",
    },
    hamstrings: {
      problem: "Underdeveloped overall",
      fix: "Leg curl variation every leg day, vary seated vs lying",
      activationCue: "Curl heel to glute, squeeze at top",
    },
    lowerQuadVMO: {
      problem: "Teardrop lacking",
      fix: "Leg extension with 1 second pause at peak contraction",
      activationCue: "Pause and squeeze at full extension",
    },
    core: {
      problem: "Weak",
      fix: "1 weighted ab exercise every session",
    },
    lowerBack: {
      problem: "Mild pain from bending forward and heavy rows",
      fix: "Machine hyperextensions on leg days only. Zero spinal flexion under load.",
      activationCue: "Squeeze glutes at top, do not hyperextend spine",
    },
  },

  hardAvoid: [
    "barbell bench press",
    "deadlifts",
    "heavy barbell squats",
    "bent over barbell rows",
    "T-bar rows",
    "pendlay rows",
    "calf raises",
    "heavy spinal flexion under load",
    "upright rows",
    "behind the neck press",
  ],

  sessionFormat: {
    warmupSets: true,
    warmupNote: "1 warm up set at 50% working weight x10, then 70% x5 — first compound only",
    workingSets: 3,
    noWarmupStretching: true,
    noCooldown: true,
    noStretching: true,
    mainWorkOnly: true,
    reasonPerExercise: true,
    reasonMaxWords: 5,
    activationCueForWeakMuscles: true,
    dropsets: "Week 3 intensification only — last isolation exercise only — drop 25-30% — 6-10 extra reps — never on compounds",
    restTimes: {
      heavyCompound: "2-3 minutes",
      isolation: "60-90 seconds",
      armIsolation: "90 seconds",
      legCompound: "2-3 minutes",
    },
  },

  intensity: {
    set1: "RPE 6-7 — 3-4 reps in tank",
    set2: "RPE 8 — 2 reps in tank",
    set3: "RPE 9 — 1 rep from failure",
    intensityCuePerSession: true,
  },

  progression: {
    model: "double progression",
    explanation:
      "Start at bottom of rep range. Add 1 rep per week. When top of range hit, add small weight and reset to bottom. Bot tracks per exercise.",
    deload: {
      frequency: "every 4th week",
      sets: 2,
      weight: "60% of working weight",
      reps: "12-15",
      intensity: "RPE 6 max",
      lowerBack: "complete rest from all loading",
      legs: "hip thrusts bodyweight only, no leg press",
      focus: "mind muscle connection only",
    },
  },

  glutes: {
    goal: "overall size — bigger all around",
    staples: ["hip thrusts", "cable kickbacks"],
    squatStyle: "smith machine or goblet — light, glute focused only",
  },
};
