import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { readText, walkSync } from "./world-utils.js";

const runFiles = walkSync("runs").filter((path) => path.endsWith("RUN.md"));
const failures = runFiles.filter((path) => {
  const text = readText(path);
  return !text.includes("# Goal") || !text.includes("# Outcome") || !existsSync(join(dirname(path), "episodes.jsonl")) || !existsSync(join(dirname(path), "meta.yaml"));
});

if (failures.length > 0) {
  console.error(`invalid run files:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`runs ok: ${runFiles.length}`);
