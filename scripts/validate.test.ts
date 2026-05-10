import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { validateRunFiles } from "./validate-run.js";
import { validateTraceFiles } from "./validate-trace.js";
import { assertCodingStarterPack, assertMinimums, countDomainStarterPack, countWorld } from "./world-utils.js";

describe("world seed content", () => {
  test("covers every Phase 0 primitive type", () => {
    const summary = countWorld(".");
    expect(assertMinimums(summary)).toEqual([]);
  });

  test("coding domain has v1 starter pack depth", () => {
    const summary = countDomainStarterPack(".", "coding");
    expect(assertCodingStarterPack(summary)).toEqual([]);
  });

  test("run and trace validators reject unredacted PII", () => {
    const root = mkdtempSync(join(tmpdir(), "world-pii-validation-"));
    const runRoot = join(root, "runs", "run-leaky");
    const traceRoot = join(root, "domains", "coding", "traces", "trace-leaky");
    mkdirSync(runRoot, { recursive: true });
    mkdirSync(traceRoot, { recursive: true });
    writeFileSync(join(runRoot, "RUN.md"), "# Goal\n\nCall ida@example.com.\n\n# Outcome\n\nUsed Bearer sk-secret.\n", "utf8");
    writeFileSync(join(runRoot, "episodes.jsonl"), "{}\n", "utf8");
    writeFileSync(join(runRoot, "meta.yaml"), "id: run-leaky\n", "utf8");
    writeFileSync(join(traceRoot, "TRACE.md"), "# Goal\n\nReplay ida@example.com with Bearer sk-secret.\n", "utf8");
    writeFileSync(join(traceRoot, "steps.jsonl"), "{}\n", "utf8");
    writeFileSync(join(traceRoot, "meta.yaml"), "id: trace-leaky\n", "utf8");

    expect(validateRunFiles(root)).toContain("runs/run-leaky/RUN.md: possible PII");
    expect(validateTraceFiles(root)).toContain("domains/coding/traces/trace-leaky/TRACE.md: possible PII");
  });
});
