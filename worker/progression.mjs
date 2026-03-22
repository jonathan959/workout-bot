/** Pure scheduling math — no Node APIs (Workers-safe). */

export function getWeekInMesocycle(currentWeek) {
  return ((currentWeek - 1) % 4) + 1;
}

export function getPhaseName(weekInMeso) {
  const map = {
    1: "Accumulation",
    2: "Development",
    3: "Intensification",
    4: "Deload",
  };
  return map[weekInMeso] || "Accumulation";
}

export function getMesocycleFromWeek(currentWeek) {
  const w = ((currentWeek - 1) % 12) + 1;
  return Math.min(3, Math.ceil(w / 4));
}

export function getProgramWeek(currentWeek) {
  return ((currentWeek - 1) % 12) + 1;
}
