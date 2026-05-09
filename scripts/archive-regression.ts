import { relative } from "node:path";
import { readText, walkSync } from "./world-utils.js";

function metadataNumber(text: string, key: string): number | undefined {
  const match = text.match(new RegExp(`^${key}:\\s*([0-9.]+)`, "m"));
  return match === null ? undefined : Number(match[1]);
}

export function archiveRegressionCandidates(root = "."): readonly string[] {
  return walkSync(`${root}/domains`)
    .filter((path) => path.endsWith("SKILL.md"))
    .filter((path) => {
      const text = readText(path);
      const votes = metadataNumber(text, "regression_votes") ?? 0;
      const effectiveLb = metadataNumber(text, "effective_lb") ?? 1;
      return votes >= 3 && effectiveLb < 0.4;
    })
    .map((path) => relative(root, path));
}

if (import.meta.main) {
  console.log(archiveRegressionCandidates(".").join("\n"));
}
