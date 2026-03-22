/** Discord webhook embed payload (same shape as src/discord.js). */

function formatWarmup(warmupSets) {
  if (!warmupSets || !Array.isArray(warmupSets) || warmupSets.length === 0) return null;
  return warmupSets
    .map((w) => `${w.weight || "?"} × ${w.reps ?? "?"}`)
    .join(" · ");
}

function buildEmbed(workout) {
  const dayTitle = workout.day || "Workout";
  const focus = workout.focus || "";
  const week = workout.week ?? "?";
  const phase = workout.phase || "";
  const meso = workout.mesocycle ?? "?";
  const intensityCue = workout.intensityCue || "—";
  const progressionNote = workout.progressionNote || "—";

  const fields = [
    {
      name: `📅 Week ${week} · ${phase} · Mesocycle ${meso}`,
      value: "\u200b",
      inline: true,
    },
    {
      name: "🎯 Intensity",
      value: intensityCue,
      inline: false,
    },
    {
      name: "📈 Progression",
      value: progressionNote,
      inline: false,
    },
  ];

  for (const ex of workout.exercises || []) {
    const order = ex.order ?? 0;
    const name = `${order}. ${ex.exercise} — ${ex.muscle || ""}`;
    const warmup = formatWarmup(ex.warmupSets);
    const dropset = ex.dropset;
    let dropLine = "";
    if (dropset && dropset.weekThreeOnly) {
      const pct = dropset.dropPercent ?? "?";
      const extra = dropset.extraReps ?? "?";
      dropLine = `\n⬇️ DROP SET: -${pct}% × ${extra} reps — Week 3 only`;
    }
    const warmupLine = warmup ? `\n[Warm-up: ${warmup}]` : "";
    const value = [
      `Sets: ${ex.sets} × ${ex.reps} | Rest: ${ex.rest}`,
      `→ ${ex.reason || ""}`,
      `💭 ${ex.cue || ""}`,
      warmupLine,
      dropLine,
    ]
      .filter(Boolean)
      .join("\n");

    fields.push({ name, value, inline: false });
  }

  return {
    title: `💪 ${dayTitle} — ${focus}`,
    color: 0xff6b35,
    fields,
    footer: { text: "Modified Arms Day Split · 12-Week Hypertrophy Program" },
    timestamp: new Date().toISOString(),
  };
}

export function buildWebhookPayload(workout) {
  return { embeds: [buildEmbed(workout)] };
}
