import { countWorld } from "./world-utils.js";

export function computeStatsMarkdown(root = "."): string {
  const stats = countWorld(root);
  return [
    "# Stats",
    "",
    `- Skills: ${stats.skills}`,
    `- Anti-patterns: ${stats.antiPatterns}`,
    `- Traces: ${stats.traces}`,
    `- Runs: ${stats.runs}`,
    `- Curricula: ${stats.curricula}`,
    `- Rubrics: ${stats.rubrics}`,
    `- Exemplars: ${stats.exemplars}`,
    `- Contributors: ${stats.contributors}`,
  ].join("\n");
}

if (import.meta.main) {
  console.log(computeStatsMarkdown("."));
}
