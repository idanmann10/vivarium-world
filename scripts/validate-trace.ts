import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { hasPossiblePii } from "./pii.js";
import { readText, walkSync } from "./world-utils.js";

function traceFiles(root: string): readonly string[] {
  return walkSync(join(root, "domains")).filter((path) => path.endsWith("TRACE.md"));
}

function relativeWorldPath(root: string, path: string): string {
  return relative(root, path).replaceAll("\\", "/");
}

export function validateTraceFiles(root = "."): readonly string[] {
  return traceFiles(root).flatMap((path) => {
    const text = readText(path);
    const relativePath = relativeWorldPath(root, path);
    const failures: string[] = [];
    if (!text.includes("# Goal") || !existsSync(join(dirname(path), "steps.jsonl")) || !existsSync(join(dirname(path), "meta.yaml"))) {
      failures.push(`${relativePath}: invalid structure`);
    }
    if (hasPossiblePii(text)) {
      failures.push(`${relativePath}: possible PII`);
    }

    return failures;
  });
}

if (import.meta.main) {
  const failures = validateTraceFiles(".");

  if (failures.length > 0) {
    console.error(`invalid trace files:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`traces ok: ${traceFiles(".").length}`);
}
