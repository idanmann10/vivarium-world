import { join, relative } from "node:path";
import { hasPossiblePii } from "./pii.js";
import { readText, walkSync } from "./world-utils.js";

function antiPatternFiles(root: string): readonly string[] {
  return walkSync(join(root, "domains"))
    .filter((path) => path.endsWith("ANTI-PATTERN.md"))
    .sort();
}

function relativeWorldPath(root: string, path: string): string {
  return relative(root, path).replaceAll("\\", "/");
}

function hasRequiredStructure(text: string): boolean {
  return (
    text.startsWith("---\n") &&
    text.includes("id:") &&
    text.includes("name:") &&
    text.includes("domain:") &&
    text.includes("visibility:") &&
    text.includes("## What Not To Do") &&
    text.includes("## Why") &&
    text.includes("## Instead Do")
  );
}

export function validateAntiPatternFiles(root = "."): readonly string[] {
  return antiPatternFiles(root).flatMap((path) => {
    const text = readText(path);
    const relativePath = relativeWorldPath(root, path);
    const failures: string[] = [];
    if (!hasRequiredStructure(text)) {
      failures.push(`${relativePath}: invalid structure`);
    }
    if (hasPossiblePii(text)) {
      failures.push(`${relativePath}: possible PII`);
    }

    return failures;
  });
}

if (import.meta.main) {
  const failures = validateAntiPatternFiles(".");

  if (failures.length > 0) {
    console.error(`invalid anti-pattern files:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`anti-patterns ok: ${antiPatternFiles(".").length}`);
}
