/**
 * System prompt for Gemini — full program refresh (May 2026).
 */

function buildSystemPrompt({
  weekNumber,
  mesocycle,
  phase,
  dayLabel,
  recentHistory,
  lastSessionNote,
  progressionLines,
  profile,
}) {
  const phaseLower = String(phase || "").toLowerCase();
  const isDeload = phaseLower === "deload";
  const deloadObj = (profile && profile.progression && profile.progression.deload) || {};

  const deloadBlock = isDeload
    ? `
CURRENT PHASE IS DELOAD — also follow PROFILE JSON progression.deload (sets, reps, RPE, hip thrust bodyweight, no dropsets, no loaded lower-back work).
Mandatory deload echoes:
- ${deloadObj.sets ?? 2} working sets per exercise only.
- ${deloadObj.reps ?? "12-15"} reps — RPE 6 maximum.
- ${deloadObj.weight || "~60% of normal working weight"}.
- Dropset fields must all be null.
`
    : "";

  return `You are generating a workout for a 22-year-old advanced lifter (4 years training experience).

CRITICAL EXCLUSIONS — NEVER include these exercises:
- Bent-over rows, deadlifts, barbell bench press, T-bar rows
- Heavy squats, heavy leg press
- Overhead tricep DB extensions (overhead cable extensions ARE allowed and required)
- Standard bicep curls (use incline DB curl)
- All calf work
- Dips (any variation)
- DB Overhead Press
- Close Grip DB Press

ALWAYS INCLUDE:
- Overhead Cable Extension on Day 4 (Arms) as the FIRST exercise
- Incline DB Curl as the primary bicep variation on every pull/arms day
- Pull-Up (weighted or assisted) as Day 1 first exercise
- Leg Extension on Day 3 AND Day 4 (VMO emphasis: toes slightly out, 1 second pause at top lockout)

SPLIT STRUCTURE (must follow exactly):
- Day 1 Pull A: Back Width + Thickness + Rear Delts + Biceps + Forearms
- Day 2 Push A: Chest + Shoulders only (NO triceps)
- Day 3 Legs A: Glute + Quad + Hamstring balanced
- Day 4 Arms: Triceps priority (FIRST) + Biceps + Quad mini (Leg Ext + Lunge) + Forearms
- Day 5 Pull B: Back Thickness + Rear Delts + Biceps + Forearms
- Day 6 Push B: Chest variation + Shoulders + Triceps 2nd hit

EXERCISE ORDER RULES:
- Compounds first (highest priority muscle), isolations later
- On Day 4 (Arms): Triceps come BEFORE biceps. Quad work comes AFTER all arm work but BEFORE forearms/core.
- Push A: Lateral raise BEFORE rear delt fly is fine (both isolations)
- Push ALL: Every chest exercise must appear before ANY shoulder or rear-delt/tricep work. Within shoulders, compounds before isolations unless EXERCISE_DAY_PLAN_JSON dictates otherwise without breaking chest-first rule.

REP RANGE STRATIFICATION (do not just use one range across the board):
- Heavy compounds (Pull-Up, Incline DB Press, Hip Thrust, Machine Shoulder Press, Single-Arm Cable Row): 8-10 reps in development phase
- Secondary compounds (machine presses, rows, leg press): 10-12 reps
- Isolations (lateral raises, flies, cable curls, leg extension, leg curls): 12-15 reps
- Forearm and small isolations: 15-20 reps

PROGRESSION SCHEME:
- Week 1 Accumulation: rep ranges +2 from above, RPE 7-8
- Week 2 Development: rep ranges as listed, RPE 8
- Week 3 Intensification: rep ranges -2, RPE 9, dropset on last isolation
- Week 4 Deload: 2 sets only, 12-15 reps, RPE 6, ~60% weight, lower back rests fully

All working sets are 3 sets unless deload.

CONTEXT (interpolate faithfully):
PROGRAM WEEK ${weekNumber} of 12 | MESOCYCLE ${mesocycle} of 3 | PHASE LABEL: ${phase}
TODAY: ${dayLabel}
${deloadBlock}

PROGRESSION DATA — BEAT THESE TARGETS TODAY:
${progressionLines || "None yet — use bottom of rep ranges."}

DOUBLE PROGRESSION: Per exercise track reps; progressionNote tells athlete explicitly what to beat.

WARMUP SETS — first compound flagged warmupRequired true only unless deload (lighter protocols on deload).

REST: Heavy compounds 2–3 min | Isolations 60–90s | Arm isolation ~90s

DROPSETS: Week 3 intensification ONLY | last isolation in that session ONLY | Never on compounds never hip thrust

USE EXERCISES FROM EXERCISE_DAY_PLAN_JSON AS THE BLUEPRINT names and grouping for this mesocycle + day — reason/cue/rest may shorten for profile word limits.

RECENT SESSIONS TO AVOID REPEATING BLINDLY:
${recentHistory}

LAST PROGRESSION NOTE:
${lastSessionNote}

Return VALID JSON ONLY. NO markdown. NO preamble.

FORMAT:
{
  "day": "Day N",
  "focus": "...",
  "week": ${weekNumber},
  "phase": "${phase}",
  "mesocycle": ${mesocycle},
  "intensityCue": "...",
  "progressionNote": "...",
  "exercises": [
    {
      "order": 1,
      "muscle": "...",
      "exercise": "...",
      "warmupSets": null,
      "sets": 3,
      "reps": "...",
      "rest": "...",
      "reason": "...",
      "cue": "...",
      "dropset": null
    }
  ]
}`;
}

module.exports = { buildSystemPrompt };
