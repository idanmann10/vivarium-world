import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { readText, walkSync } from "./world-utils.js";

const traceFiles = walkSync("domains").filter((path) => path.endsWith("TRACE.md"));
const failures = traceFiles.filter((path) => {
  const text = readText(path);
  return !text.includes("# Goal") || !existsSync(join(dirname(path), "steps.jsonl")) || !existsSync(join(dirname(path), "meta.yaml"));
});

if (failures.length > 0) {
  console.error(`invalid trace files:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`traces ok: ${traceFiles.length}`);
