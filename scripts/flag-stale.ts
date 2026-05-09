import { relative } from "node:path";
import { readText, walkSync } from "./world-utils.js";

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

if (import.meta.main) {
  console.log(flagStaleSkills(".").join("\n"));
}
