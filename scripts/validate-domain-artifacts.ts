import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { hasPossiblePii } from "./pii.js";
import { readText, walkSync } from "./world-utils.js";

interface DomainArtifactFiles {
  readonly curricula: readonly string[];
  readonly rubrics: readonly string[];
  readonly exemplars: readonly string[];
}

function relativeWorldPath(root: string, path: string): string {
  return relative(root, path).replaceAll("\\", "/");
}

function listDomainDirectories(root: string): readonly string[] {
  const domainsRoot = join(root, "domains");
  if (!existsSync(domainsRoot)) {
    return [];
  }

  return readdirSync(domainsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(domainsRoot, entry.name))
    .sort();
}

function domainArtifactFiles(root: string): DomainArtifactFiles {
  const domainDirectories = listDomainDirectories(root);
  const curricula = domainDirectories.map((domainRoot) => join(domainRoot, "curriculum.md")).filter((path) => existsSync(path));
  const files = walkSync(join(root, "domains")).sort();

  return {
    curricula,
    rubrics: files.filter((path) => path.includes(`${join("rubrics")}/`) && path.endsWith(".md")),
    exemplars: files.filter((path) => path.includes(`${join("exemplars")}/`) && path.endsWith("output.md")),
  };
}

function hasCurriculumStructure(text: string, path: string): boolean {
  const domain = basename(dirname(path));
  return text.includes(`# ${domain} Curriculum`) && /^\d+\.\s+/m.test(text);
}

function hasRubricStructure(text: string): boolean {
  return text.includes("Rubric") && /^-\s+/m.test(text);
}

function hasExemplarStructure(root: string, path: string, text: string): string | undefined {
  if (!text.includes("Exemplar")) {
    return "invalid structure";
  }

  const metaPath = join(dirname(path), "meta.yaml");
  if (!existsSync(metaPath)) {
    return "missing meta.yaml";
  }

  const meta = readText(metaPath);
  if (!meta.includes("kind: exemplar")) {
    return "invalid meta.yaml";
  }

  if (hasPossiblePii(meta)) {
    return `${relativeWorldPath(root, metaPath)}: possible PII`;
  }

  return undefined;
}

export function validateDomainArtifactFiles(root = "."): readonly string[] {
  const files = domainArtifactFiles(root);
  const failures: string[] = [];

  for (const path of files.curricula) {
    const text = readText(path);
    const relativePath = relativeWorldPath(root, path);
    if (!hasCurriculumStructure(text, path)) {
      failures.push(`${relativePath}: invalid structure`);
    }
    if (hasPossiblePii(text)) {
      failures.push(`${relativePath}: possible PII`);
    }
  }

  for (const path of files.rubrics) {
    const text = readText(path);
    const relativePath = relativeWorldPath(root, path);
    if (!hasRubricStructure(text)) {
      failures.push(`${relativePath}: invalid structure`);
    }
    if (hasPossiblePii(text)) {
      failures.push(`${relativePath}: possible PII`);
    }
  }

  for (const path of files.exemplars) {
    const text = readText(path);
    const relativePath = relativeWorldPath(root, path);
    const structureFailure = hasExemplarStructure(root, path, text);
    if (structureFailure !== undefined) {
      failures.push(structureFailure.includes(":") ? structureFailure : `${relativePath}: ${structureFailure}`);
    }
    if (hasPossiblePii(text)) {
      failures.push(`${relativePath}: possible PII`);
    }
  }

  return failures.sort();
}

if (import.meta.main) {
  const failures = validateDomainArtifactFiles(".");

  if (failures.length > 0) {
    console.error(`invalid domain artifact files:\n${failures.join("\n")}`);
    process.exit(1);
  }

  const files = domainArtifactFiles(".");
  console.log(`domain artifacts ok: ${files.curricula.length} curricula, ${files.rubrics.length} rubrics, ${files.exemplars.length} exemplars`);
}
