import { existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { hasPossiblePii } from "./pii.js";
import { readText, walkSync } from "./world-utils.js";

type ProposalKind = "skill" | "anti-pattern" | "trace" | "run";

interface ProposalFile {
  readonly kind: ProposalKind;
  readonly path: string;
}

function relativeWorldPath(root: string, path: string): string {
  return relative(root, path).replaceAll("\\", "/");
}

function proposalFile(root: string, path: string): ProposalFile | undefined {
  const normalized = relativeWorldPath(root, path);
  if (/^proposals\/skills\/[^/]+\/[^/]+\/SKILL\.md$/.test(normalized)) {
    return { kind: "skill", path };
  }
  if (/^proposals\/anti-patterns\/[^/]+\/[^/]+\/ANTI-PATTERN\.md$/.test(normalized)) {
    return { kind: "anti-pattern", path };
  }
  if (/^proposals\/traces\/[^/]+\/[^/]+\/TRACE\.md$/.test(normalized)) {
    return { kind: "trace", path };
  }
  if (/^proposals\/runs\/[^/]+\/RUN\.md$/.test(normalized)) {
    return { kind: "run", path };
  }

  return undefined;
}

function proposalFiles(root: string): readonly ProposalFile[] {
  return walkSync(join(root, "proposals"))
    .filter((path) => path.endsWith(".md"))
    .flatMap((path) => {
      const proposal = proposalFile(root, path);
      return proposal === undefined ? [] : [proposal];
    })
    .sort((left, right) => left.path.localeCompare(right.path));
}

function hasFrontmatter(text: string): boolean {
  return (
    text.startsWith("---\n") &&
    text.includes("id:") &&
    text.includes("domain:") &&
    text.includes("visibility:") &&
    text.includes("contributor:")
  );
}

function hasSkillStructure(text: string): boolean {
  return hasFrontmatter(text) && text.includes("name:") && text.includes("description:") && text.includes("# Provenance");
}

function hasAntiPatternStructure(text: string): boolean {
  return (
    hasFrontmatter(text) &&
    text.includes("name:") &&
    text.includes("## What Not To Do") &&
    text.includes("## Why") &&
    text.includes("## Instead Do")
  );
}

function hasTraceStructure(path: string, text: string): boolean {
  return (
    hasFrontmatter(text) &&
    text.includes("title:") &&
    text.includes("# Goal") &&
    existsSync(join(dirname(path), "steps.jsonl")) &&
    existsSync(join(dirname(path), "meta.yaml"))
  );
}

function hasRunStructure(path: string, text: string): boolean {
  return (
    text.includes("# Goal") &&
    text.includes("# Outcome") &&
    existsSync(join(dirname(path), "episodes.jsonl")) &&
    existsSync(join(dirname(path), "meta.yaml"))
  );
}

function hasRequiredStructure(proposal: ProposalFile, text: string): boolean {
  switch (proposal.kind) {
    case "skill":
      return hasSkillStructure(text);
    case "anti-pattern":
      return hasAntiPatternStructure(text);
    case "trace":
      return hasTraceStructure(proposal.path, text);
    case "run":
      return hasRunStructure(proposal.path, text);
  }
}

export function validateProposalFiles(root = "."): readonly string[] {
  return proposalFiles(root)
    .flatMap((proposal) => {
      const text = readText(proposal.path);
      const relativePath = relativeWorldPath(root, proposal.path);
      const failures: string[] = [];
      if (!hasRequiredStructure(proposal, text)) {
        failures.push(`${relativePath}: invalid structure`);
      }
      if (hasPossiblePii(text)) {
        failures.push(`${relativePath}: possible PII`);
      }

      return failures;
    })
    .sort();
}

if (import.meta.main) {
  const failures = validateProposalFiles(".");

  if (failures.length > 0) {
    console.error(`invalid proposal files:\n${failures.join("\n")}`);
    process.exit(1);
  }

  console.log(`proposals ok: ${proposalFiles(".").length}`);
}
