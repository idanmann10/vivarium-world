import { readText, walkSync } from "./world-utils.js";

const skillFiles = walkSync("domains").filter((path) => path.endsWith("SKILL.md"));
const failures = skillFiles.filter((path) => {
  const text = readText(path);
  return !text.startsWith("---\n") || !text.includes("description:") || !text.includes("# Provenance");
});

if (failures.length > 0) {
  console.error(`invalid skill files:\n${failures.join("\n")}`);
  process.exit(1);
}

console.log(`skills ok: ${skillFiles.length}`);
