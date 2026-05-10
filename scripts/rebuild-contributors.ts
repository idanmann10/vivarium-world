import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

import { readText, walkSync } from "./world-utils.js";

interface ContributionCounts {
  skills: number;
  antiPatterns: number;
  traces: number;
  runsPublished: number;
  skillsArchived: number;
}

interface ContributorAccumulator {
  handle: string;
  domains: Set<string>;
  contributions: ContributionCounts;
}

interface ExistingContributorProfile {
  firstContribution?: string;
  trustScore?: number;
  domainTrust?: Record<string, number>;
}

function emptyCounts(): ContributionCounts {
  return { skills: 0, antiPatterns: 0, traces: 0, runsPublished: 0, skillsArchived: 0 };
}

function metadataValue(text: string, key: string): string | undefined {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

function existingProfile(root: string, handle: string): ExistingContributorProfile {
  const path = join(root, "contributors", `${handle}.json`);
  if (!existsSync(path)) {
    return {};
  }

  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as {
      readonly firstContribution?: unknown;
      readonly trustScore?: unknown;
      readonly domainTrust?: unknown;
    };
    return {
      ...(typeof parsed.firstContribution === "string" ? { firstContribution: parsed.firstContribution } : {}),
      ...(typeof parsed.trustScore === "number" ? { trustScore: parsed.trustScore } : {}),
      ...(typeof parsed.domainTrust === "object" && parsed.domainTrust !== null
        ? { domainTrust: parsed.domainTrust as Record<string, number> }
        : {}),
    };
  } catch {
    return {};
  }
}

function handleFor(text: string): string {
  const contributor = metadataValue(text, "contributor");
  return contributor === undefined || contributor.length === 0 ? "maintainer" : contributor;
}

function safeHandle(handle: string): string {
  return handle.replace(/[^A-Za-z0-9._-]+/g, "-");
}

function runDomain(root: string, path: string, text: string): string {
  const frontmatterDomain = metadataValue(text, "domain");
  if (frontmatterDomain !== undefined && frontmatterDomain.length > 0) {
    return frontmatterDomain;
  }

  const metaPath = join(dirname(path), "meta.yaml");
  if (existsSync(metaPath)) {
    const metaDomain = metadataValue(readFileSync(metaPath, "utf8"), "domain");
    if (metaDomain !== undefined && metaDomain.length > 0) {
      return metaDomain;
    }
  }

  return relative(root, path).split("/")[0] ?? "unknown";
}

function artifactKind(root: string, path: string, text: string): { domain: string; count: keyof ContributionCounts } | undefined {
  const relativePath = relative(root, path);
  const domainArtifact = relativePath.match(/^domains\/([^/]+)\/(skills|anti-patterns|traces)\/[^/]+\/(?:SKILL|ANTI-PATTERN|TRACE)\.md$/);
  if (domainArtifact !== null && domainArtifact[1] !== undefined && domainArtifact[2] !== undefined) {
    const domain = domainArtifact[1];
    const kind = domainArtifact[2];
    if (kind === "skills") return { domain, count: "skills" };
    if (kind === "anti-patterns") return { domain, count: "antiPatterns" };
    if (kind === "traces") return { domain, count: "traces" };
  }

  const retiredSkill = relativePath.match(/^retired\/skills\/([^/]+)\/[^/]+\/SKILL\.md$/);
  if (retiredSkill !== null && retiredSkill[1] !== undefined) {
    return { domain: retiredSkill[1], count: "skillsArchived" };
  }

  if (relativePath.match(/^runs\/[^/]+\/RUN\.md$/) !== null) {
    return { domain: runDomain(root, path, text), count: "runsPublished" };
  }

  return undefined;
}

function accumulatorFor(contributors: Map<string, ContributorAccumulator>, handle: string): ContributorAccumulator {
  const existing = contributors.get(handle);
  if (existing !== undefined) {
    return existing;
  }

  const next = { handle, domains: new Set<string>(), contributions: emptyCounts() };
  contributors.set(handle, next);
  return next;
}

export function rebuildContributorProfiles(root = "."): readonly string[] {
  const contributors = new Map<string, ContributorAccumulator>();

  for (const path of walkSync(root).filter((file) => file.endsWith(".md"))) {
    const text = readText(path);
    const kind = artifactKind(root, path, text);
    if (kind === undefined) {
      continue;
    }

    const contributor = accumulatorFor(contributors, handleFor(text));
    contributor.domains.add(kind.domain);
    contributor.contributions[kind.count] += 1;
  }

  const written: string[] = [];
  for (const contributor of [...contributors.values()].sort((left, right) => left.handle.localeCompare(right.handle))) {
    const handle = safeHandle(contributor.handle);
    const existing = existingProfile(root, handle);
    const trustScore = existing.trustScore ?? 0.5;
    const domains = [...contributor.domains].sort();
    const domainTrust = Object.fromEntries(domains.map((domain) => [domain, existing.domainTrust?.[domain] ?? trustScore]));
    const path = join(root, "contributors", `${handle}.json`);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
      path,
      `${JSON.stringify(
        {
          handle: contributor.handle,
          firstContribution: existing.firstContribution ?? "2026-05-09",
          domains,
          contributions: contributor.contributions,
          trustScore,
          domainTrust,
        },
        null,
        2,
      )}\n`,
      "utf8",
    );
    written.push(`contributors/${handle}.json`);
  }

  return written;
}

if (import.meta.main) {
  for (const path of rebuildContributorProfiles(".")) {
    console.log(`rebuilt ${path}`);
  }
}
