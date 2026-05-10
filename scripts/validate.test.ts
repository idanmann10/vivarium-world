import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { validateAntiPatternFiles } from "./validate-anti-pattern.js";
import { validateDomainArtifactFiles } from "./validate-domain-artifacts.js";
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

  test("anti-pattern validator rejects malformed or leaky files", () => {
    const root = mkdtempSync(join(tmpdir(), "world-anti-pattern-validation-"));
    const badRoot = join(root, "domains", "coding", "anti-patterns", "bad");
    const leakyRoot = join(root, "domains", "coding", "anti-patterns", "leaky");
    mkdirSync(badRoot, { recursive: true });
    mkdirSync(leakyRoot, { recursive: true });
    writeFileSync(join(badRoot, "ANTI-PATTERN.md"), "# Bad\n\n## Why\n\nNo replacement.\n", "utf8");
    writeFileSync(
      join(leakyRoot, "ANTI-PATTERN.md"),
      "---\nid: coding.leaky\nname: Leaky\ndomain: coding\nvisibility: public\n---\n\n# Leaky\n\n## What Not To Do\n\nPaste ida@example.com.\n\n## Why\n\nLeaks Bearer sk-secret.\n\n## Instead Do\n\nRedact first.\n",
      "utf8",
    );

    expect(validateAntiPatternFiles(root)).toEqual([
      "domains/coding/anti-patterns/bad/ANTI-PATTERN.md: invalid structure",
      "domains/coding/anti-patterns/leaky/ANTI-PATTERN.md: possible PII",
    ]);
  });

  test("domain artifact validator rejects malformed curricula, rubrics, and exemplars", () => {
    const root = mkdtempSync(join(tmpdir(), "world-domain-artifact-validation-"));
    const domainRoot = join(root, "domains", "coding");
    mkdirSync(join(domainRoot, "rubrics"), { recursive: true });
    mkdirSync(join(domainRoot, "exemplars", "baseline"), { recursive: true });
    mkdirSync(join(domainRoot, "exemplars", "leaky"), { recursive: true });
    writeFileSync(join(domainRoot, "curriculum.md"), "# coding Curriculum\n\nEmail ida@example.com.\n", "utf8");
    writeFileSync(join(domainRoot, "rubrics", "bad.md"), "# Bad Rubric\n\nNo criteria.\n", "utf8");
    writeFileSync(join(domainRoot, "exemplars", "baseline", "output.md"), "# coding Exemplar\n\nLooks ok.\n", "utf8");
    writeFileSync(join(domainRoot, "exemplars", "leaky", "output.md"), "# coding Exemplar\n\nUse Bearer sk-secret.\n", "utf8");
    writeFileSync(join(domainRoot, "exemplars", "leaky", "meta.yaml"), "domain: coding\nkind: exemplar\n", "utf8");

    expect(validateDomainArtifactFiles(root)).toEqual([
      "domains/coding/curriculum.md: invalid structure",
      "domains/coding/curriculum.md: possible PII",
      "domains/coding/exemplars/baseline/output.md: missing meta.yaml",
      "domains/coding/exemplars/leaky/output.md: possible PII",
      "domains/coding/rubrics/bad.md: invalid structure",
    ]);
  });
});
