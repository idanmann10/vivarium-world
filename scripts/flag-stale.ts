import { writeFileSync } from "node:fs";
import { relative } from "node:path";
import { readText, walkSync } from "./world-utils.js";

export interface StaleSkillResult {
  readonly marked: readonly string[];
}

function metadataValue(text: string, key: string): string | undefined {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

function monthsBetween(left: Date, right: Date): number {
  return (right.getTime() - left.getTime()) / (1000 * 60 * 60 * 24 * 30);
}

export function flagStaleSkills(root = ".", now = new Date()): readonly string[] {
  return walkSync(`${root}/domains`)
    .filter((path) => path.endsWith("SKILL.md"))
    .filter((path) => {
      const text = readText(path);
      const lastValidated = metadataValue(text, "last_validated_at");
      const newerAlternatives = metadataValue(text, "newer_alternatives") === "true";
      if (lastValidated === undefined) {
        return false;
      }

      return newerAlternatives && monthsBetween(new Date(lastValidated), now) > 6;
    })
    .map((path) => relative(root, path));
}

function markStale(text: string): string {
  if (metadataValue(text, "stale") === "true") {
    return text;
  }

  if (text.startsWith("---\n")) {
    return text.replace("---\n", "---\nstale: true\n");
  }

  return `---\nstale: true\n---\n\n${text}`;
}

export function markStaleSkills(root = ".", now = new Date()): StaleSkillResult {
  const marked: string[] = [];

  for (const relativePath of flagStaleSkills(root, now)) {
    const path = `${root}/${relativePath}`;
    const previous = readText(path);
    const next = markStale(previous);
    if (next === previous) {
      continue;
    }

    writeFileSync(path, next, "utf8");
    marked.push(relativePath);
  }

  return { marked };
}

if (import.meta.main) {
  const now = process.env.WORLD_STALE_NOW === undefined ? new Date() : new Date(process.env.WORLD_STALE_NOW);
  const result = markStaleSkills(".", now);
  if (result.marked.length === 0) {
    console.log("No stale skills to mark.");
  } else {
    for (const path of result.marked) {
      console.log(`marked ${path}`);
    }
  }
}
