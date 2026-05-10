import { existsSync, mkdirSync, renameSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { readText, walkSync } from "./world-utils.js";

export interface ArchiveRegressionResult {
  readonly archived: readonly string[];
  readonly skipped: readonly string[];
}

function metadataNumber(text: string, key: string): number | undefined {
  const match = text.match(new RegExp(`^${key}:\\s*([0-9.]+)`, "m"));
  return match === null ? undefined : Number(match[1]);
}

export function archiveRegressionCandidates(root = "."): readonly string[] {
  return walkSync(`${root}/domains`)
    .filter((path) => path.endsWith("SKILL.md"))
    .filter((path) => {
      const text = readText(path);
      const votes = metadataNumber(text, "regression_votes") ?? 0;
      const effectiveLb = metadataNumber(text, "effective_lb") ?? 1;
      return votes >= 3 && effectiveLb < 0.4;
    })
    .map((path) => relative(root, path));
}

function retiredSkillPath(candidate: string): string | undefined {
  const match = candidate.match(/^domains\/([^/]+)\/skills\/([^/]+)\/SKILL\.md$/);
  if (match === null) {
    return undefined;
  }

  const [, domain, slug] = match;
  return `retired/skills/${domain}/${slug}/SKILL.md`;
}

export function archiveRegressionSkills(root = "."): ArchiveRegressionResult {
  const archived: string[] = [];
  const skipped: string[] = [];

  for (const candidate of archiveRegressionCandidates(root)) {
    const retiredPath = retiredSkillPath(candidate);
    if (retiredPath === undefined) {
      skipped.push(candidate);
      continue;
    }

    const sourceDirectory = dirname(join(root, candidate));
    const retiredDirectory = dirname(join(root, retiredPath));
    if (existsSync(retiredDirectory)) {
      skipped.push(candidate);
      continue;
    }

    mkdirSync(dirname(retiredDirectory), { recursive: true });
    renameSync(sourceDirectory, retiredDirectory);
    archived.push(retiredPath);
  }

  return { archived, skipped };
}

if (import.meta.main) {
  const result = archiveRegressionSkills(".");
  if (result.archived.length === 0 && result.skipped.length === 0) {
    console.log("No regression archives to propose.");
  } else {
    for (const path of result.archived) {
      console.log(`archived ${path}`);
    }
    for (const path of result.skipped) {
      console.log(`skipped ${path}`);
    }
  }
}
