import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { hasPossiblePii } from "./pii.js";
import { readText, walkSync } from "./world-utils.js";

function runFiles(root: string): readonly string[] {
  return walkSync(join(root, "runs")).filter((path) => path.endsWith("RUN.md"));
}

function relativeWorldPath(root: string, path: string): string {
  return relative(root, path).replaceAll("\\", "/");
}

export function validateRunFiles(root = "."): readonly string[] {
  return runFiles(root).flatMap((path) => {
    const text = readText(path);
    const relativePath = relativeWorldPath(root, path);
    const failures: string[] = [];
    if (
      !text.includes("# Goal") ||
      !text.includes("# Outcome") ||
      !existsSync(join(dirname(path), "episodes.jsonl")) ||
      !existsSync(join(dirname(path), "meta.yaml"))
    ) {
      failures.push(`${relativePath}: invalid structure`);
    }
    if (hasPossiblePii(text)) {
      failures.push(`${relativePath}: possible PII`);
    }

    return failures;
  });
}

if (import.meta.main) {
  const failures = validateRunFiles(".");

  if (failures.length > 0) {
    console.error(`invalid run files:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`runs ok: ${runFiles(".").length}`);
}
