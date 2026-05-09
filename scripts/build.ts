import { existsSync } from "node:fs";

const required = [
  "README.md",
  "CONSTITUTION.md",
  "CONTRIBUTING.md",
  "STATS.md",
  "domains/coding/curriculum.md",
  "domains/research/curriculum.md",
  "domains/summarization/curriculum.md",
  "scripts/validate-world.ts",
];

const missing = required.filter((path) => !existsSync(path));
if (missing.length > 0) {
  console.error(`missing required files:\n${missing.join("\n")}`);
  process.exit(1);
}

console.log(`build ok: ${required.length} required files present`);
