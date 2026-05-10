import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { countWorld } from "./world-utils.js";

interface ContributorProfile {
  readonly handle: string;
  readonly skills: number;
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function readContributorProfiles(root: string): readonly ContributorProfile[] {
  const contributorsRoot = join(root, "contributors");
  if (!existsSync(contributorsRoot)) {
    return [];
  }

  return readdirSync(contributorsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .flatMap((entry) => {
      try {
        const parsed = JSON.parse(readFileSync(join(contributorsRoot, entry.name), "utf8")) as unknown;
        if (!isRecord(parsed)) {
          return [];
        }

        const contributions = parsed.contributions;
        const handle = typeof parsed.handle === "string" && parsed.handle.length > 0 ? parsed.handle : entry.name.replace(/\.json$/, "");
        const skills = isRecord(contributions) ? numberValue(contributions.skills) : 0;
        return [{ handle, skills }];
      } catch {
        return [];
      }
    });
}

function readFeaturedPicks(root: string): readonly string[] {
  const path = join(root, "featured", "current.md");
  if (!existsSync(path)) {
    return [];
  }

  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter((line) => line.length > 0);
}

function percent(numerator: number, denominator: number): string {
  return `${(denominator === 0 ? 0 : (numerator / denominator) * 100).toFixed(1)}%`;
}

function skillLabel(count: number): string {
  return count === 1 ? "skill" : "skills";
}

export function computeStatsMarkdown(root = "."): string {
  const stats = countWorld(root);
  const topSkillContributors = [...readContributorProfiles(root)].sort((left, right) => right.skills - left.skills).slice(0, 5);
  const topSkillTotal = topSkillContributors.reduce((total, contributor) => total + contributor.skills, 0);
  const featured = readFeaturedPicks(root);
  const topSkillContributorText =
    topSkillContributors.length === 0
      ? "none"
      : topSkillContributors
          .map(
            (contributor) =>
              `${contributor.handle}: ${contributor.skills} ${skillLabel(contributor.skills)} (${percent(contributor.skills, stats.skills)} of ${
                stats.skills
              })`,
          )
          .join(", ");

  return [
    "# Stats",
    "",
    "Generated from the current world contents by `scripts/compute-stats.ts`.",
    "",
    "## Seed Snapshot",
    "",
    `- Domains: ${stats.domains}`,
    `- Skills: ${stats.skills}`,
    `- Anti-patterns: ${stats.antiPatterns}`,
    `- Traces: ${stats.traces}`,
    `- Runs: ${stats.runs}`,
    `- Curricula: ${stats.curricula}`,
    `- Rubrics: ${stats.rubrics}`,
    `- Exemplars: ${stats.exemplars}`,
    `- Contributor profiles: ${stats.contributors}`,
    "",
    "## Contributor Concentration",
    "",
    `- Top 5 skill share: ${percent(topSkillTotal, stats.skills)}`,
    `- Top 5 skill contributors: ${topSkillContributorText}`,
    "",
    "## Featured Picks",
    "",
    ...(featured.length === 0 ? ["- none"] : featured.map((pick) => `- ${pick}`)),
  ].join("\n");
}

export function writeStatsFile(root = "."): string {
  const markdown = computeStatsMarkdown(root);
  writeFileSync(join(root, "STATS.md"), `${markdown}\n`, "utf8");
  return markdown;
}

if (import.meta.main) {
  console.log(writeStatsFile("."));
}
