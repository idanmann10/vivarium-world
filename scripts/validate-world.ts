import { assertMinimums, countWorld } from "./world-utils.js";

const summary = countWorld(".");
const failures = assertMinimums(summary);

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`world ok: ${JSON.stringify(summary)}`);
