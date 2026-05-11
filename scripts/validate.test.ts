import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { validateAntiPatternFiles } from "./validate-anti-pattern.js";
import { validateDomainArtifactFiles } from "./validate-domain-artifacts.js";
import { validateProposalFiles } from "./validate-proposals.js";
import { validateRunFiles } from "./validate-run.js";
import { validateTraceFiles } from "./validate-trace.js";
import { assertCodingStarterPack, assertMinimums, countDomainStarterPack, countWorld } from "./world-utils.js";

const worldRootDocs = {
  "README.md": [
    "Vivarium World",
    "open commons",
    "STATS.md",
    "featured",
    "auto-merge",
    "SECURITY.md",
    "CODE_OF_CONDUCT.md",
    "RELEASING.md",
    "LICENSE",
    "MIT",
  ],
  "CONTRIBUTING.md": [
    "Vivarium World",
    "validate",
    "PII",
    "auto-merge",
    "private world",
    "STATS.md",
  ],
  "SECURITY.md": [
    "Vivarium World",
    "security",
    "PII",
    "credential",
    "regression",
    "private world",
  ],
  "CODE_OF_CONDUCT.md": [
    "Vivarium World",
    "Code of Conduct",
    "harassment",
    "Enforcement",
  ],
  "RELEASING.md": [
    "Vivarium World",
    "release",
    "validate",
    "STATS.md",
    "featured",
    "auto-merge",
    "LICENSE",
    "CC0",
    "public repository",
  ],
  LICENSE: ["MIT License", "Vivarium contributors", "CC0"],
} as const;

interface WorldPackageJson {
  readonly name?: string;
  readonly private?: boolean;
  readonly description?: string;
  readonly license?: string;
  readonly repository?: {
    readonly type?: string;
    readonly url?: string;
  };
  readonly bugs?: {
    readonly url?: string;
  };
  readonly homepage?: string;
}

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

  test("proposal validator rejects malformed or leaky contribution proposals", () => {
    const root = mkdtempSync(join(tmpdir(), "world-proposal-validation-"));
    const skillRoot = join(root, "proposals", "skills", "coding", "bad-skill");
    const traceRoot = join(root, "proposals", "traces", "coding", "trace-leaky");
    const runRoot = join(root, "proposals", "runs", "run-bad");
    const antiPatternRoot = join(root, "proposals", "anti-patterns", "coding", "anti-leaky");
    mkdirSync(skillRoot, { recursive: true });
    mkdirSync(traceRoot, { recursive: true });
    mkdirSync(runRoot, { recursive: true });
    mkdirSync(antiPatternRoot, { recursive: true });
    writeFileSync(join(skillRoot, "SKILL.md"), "# Bad Skill\n\nNo metadata.\n", "utf8");
    writeFileSync(
      join(traceRoot, "TRACE.md"),
      "---\nid: coding.trace-leaky\ntitle: Trace Leaky\ndomain: coding\nvisibility: public\ncontributor: agent-a\n---\n\n# Goal\n\nReplay ida@example.com.\n\n## Step 1\n\nUse Bearer sk-secret.\n",
      "utf8",
    );
    writeFileSync(join(traceRoot, "steps.jsonl"), "{}\n", "utf8");
    writeFileSync(join(traceRoot, "meta.yaml"), "domain: coding\nvisibility: public\ncontributor: agent-a\n", "utf8");
    writeFileSync(join(runRoot, "RUN.md"), "# Goal\n\nNo outcome.\n", "utf8");
    writeFileSync(
      join(antiPatternRoot, "ANTI-PATTERN.md"),
      "---\nid: coding.anti-leaky\nname: Anti Leaky\ndomain: coding\nvisibility: public\ncontributor: agent-a\n---\n\n# Anti Leaky\n\n## What Not To Do\n\nEmail ida@example.com.\n\n## Why\n\nLeaks Bearer sk-secret.\n\n## Instead Do\n\nRedact.\n",
      "utf8",
    );

    expect(validateProposalFiles(root)).toEqual([
      "proposals/anti-patterns/coding/anti-leaky/ANTI-PATTERN.md: possible PII",
      "proposals/runs/run-bad/RUN.md: invalid structure",
      "proposals/skills/coding/bad-skill/SKILL.md: invalid structure",
      "proposals/traces/coding/trace-leaky/TRACE.md: possible PII",
    ]);
  });

  test("documents open-source production readiness", () => {
    for (const [path, terms] of Object.entries(worldRootDocs)) {
      expect(existsSync(path), `${path} should exist`).toBe(true);
      const body = existsSync(path) ? readFileSync(path, "utf8") : "";
      for (const term of terms) {
        expect(body).toContain(term);
      }
    }
  });

  test("uses public-facing package metadata", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as WorldPackageJson;

    expect(packageJson.name).toBe("vivarium-world");
    expect(packageJson.private).toBe(true);
    expect(packageJson.description).toContain("Git-hosted");
    expect(packageJson.license).toBe("MIT");
    expect(packageJson.repository?.type).toBe("git");
    expect(packageJson.repository?.url).toContain("vivarium-world");
    expect(packageJson.bugs?.url).toContain("vivarium-world/issues");
    expect(packageJson.homepage).toContain("vivarium-world");
  });
});
