import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export interface CountSummary {
  readonly skills: number;
  readonly antiPatterns: number;
  readonly traces: number;
  readonly runs: number;
  readonly curricula: number;
  readonly rubrics: number;
  readonly exemplars: number;
  readonly contributors: number;
}

export interface DomainStarterPackSummary {
  readonly skills: number;
  readonly traces: number;
}

export function ensureFile(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

export function walkSync(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walkSync(path) : [path];
  });
}

export function countWorld(root = "."): CountSummary {
  const files = walkSync(root);

  return {
    skills: files.filter((path) => path.endsWith("SKILL.md")).length,
    antiPatterns: files.filter((path) => path.endsWith("ANTI-PATTERN.md")).length,
    traces: files.filter((path) => path.endsWith("TRACE.md")).length,
    runs: files.filter((path) => path.endsWith("RUN.md")).length,
    curricula: files.filter((path) => path.endsWith("curriculum.md")).length,
    rubrics: files.filter((path) => path.includes("/rubrics/") && path.endsWith(".md")).length,
    exemplars: files.filter((path) => path.includes("/exemplars/") && path.endsWith("output.md")).length,
    contributors: files.filter((path) => path.startsWith(join(root, "contributors")) && path.endsWith(".json")).length,
  };
}

export function countDomainStarterPack(root: string, domain: string): DomainStarterPackSummary {
  const files = walkSync(join(root, "domains", domain));
  return {
    skills: files.filter((path) => path.endsWith("SKILL.md")).length,
    traces: files.filter((path) => path.endsWith("TRACE.md")).length,
  };
}

export function readText(path: string): string {
  return readFileSync(path, "utf8");
}

export function assertMinimums(summary: CountSummary): readonly string[] {
  const failures: string[] = [];
  if (summary.skills < 30) failures.push(`expected at least 30 skills, found ${summary.skills}`);
  if (summary.antiPatterns < 5) failures.push(`expected at least 5 anti-patterns, found ${summary.antiPatterns}`);
  if (summary.traces < 5) failures.push(`expected at least 5 traces, found ${summary.traces}`);
  if (summary.runs < 5) failures.push(`expected at least 5 runs, found ${summary.runs}`);
  if (summary.curricula < 3) failures.push(`expected at least 3 curricula, found ${summary.curricula}`);
  if (summary.rubrics < 3) failures.push(`expected at least 3 rubrics, found ${summary.rubrics}`);
  if (summary.exemplars < 3) failures.push(`expected at least 3 exemplars, found ${summary.exemplars}`);
  if (summary.contributors < 1) failures.push("expected at least 1 contributor profile");
  return failures;
}

export function assertCodingStarterPack(summary: DomainStarterPackSummary): readonly string[] {
  const failures: string[] = [];
  if (summary.skills < 20 || summary.skills > 30) {
    failures.push(`expected coding starter pack to have 20-30 skills, found ${summary.skills}`);
  }
  if (summary.traces < 3 || summary.traces > 5) {
    failures.push(`expected coding starter pack to have 3-5 traces, found ${summary.traces}`);
  }
  return failures;
}
