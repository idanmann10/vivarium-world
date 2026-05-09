import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

import { archiveRegressionCandidates } from "./archive-regression.js";
import { computeStatsMarkdown } from "./compute-stats.js";
import { canAutoMerge, computeContributorTrust, requiredValidatorCount } from "./compute-trust.js";
import { flagStaleSkills } from "./flag-stale.js";
import { listHeldReviews } from "./list-held-reviews.js";

function skill(root: string, slug: string, metadata: string): string {
  const directory = join(root, "domains", "coding", "skills", slug);
  mkdirSync(directory, { recursive: true });
  const path = join(directory, "SKILL.md");
  writeFileSync(path, `---\n${metadata}\n---\n\n# ${slug}\n\nBody.\n\n# Provenance\n\nFixture.\n`);
  return path;
}

describe("world operations", () => {
  test("computes stats markdown", () => {
    const root = mkdtempSync(join(tmpdir(), "world-stats-"));
    skill(root, "one", "description: one");

    expect(computeStatsMarkdown(root)).toContain("Skills: 1");
  });

  test("archives regression candidates", () => {
    const root = mkdtempSync(join(tmpdir(), "world-archive-"));
    skill(root, "bad", "regression_votes: 3\neffective_lb: 0.3");

    expect(archiveRegressionCandidates(root)).toEqual(["domains/coding/skills/bad/SKILL.md"]);
  });

  test("flags stale skills", () => {
    const root = mkdtempSync(join(tmpdir(), "world-stale-"));
    skill(root, "old", "last_validated_at: 2025-01-01\nnewer_alternatives: true");

    expect(flagStaleSkills(root, new Date("2026-05-09T00:00:00.000Z"))).toEqual([
      "domains/coding/skills/old/SKILL.md",
    ]);
  });

  test("computes trust and required validator counts", () => {
    const lowTrust = computeContributorTrust([{ lowerBound: 0.1, uses: 1 }]);
    const highTrust = computeContributorTrust([{ lowerBound: 0.9, uses: 100 }]);

    expect(lowTrust).toBeLessThan(highTrust);
    expect(requiredValidatorCount(highTrust)).toBe(3);
    expect(requiredValidatorCount(lowTrust)).toBe(5);
  });

  test("checks auto-merge gates", () => {
    expect(
      canAutoMerge({
        effectiveLowerBound: 0.6,
        positiveValidators: 3,
        requiredValidators: 3,
        regressionVotes: 0,
      }),
    ).toBe(true);
    expect(
      canAutoMerge({
        effectiveLowerBound: 0.6,
        positiveValidators: 3,
        requiredValidators: 3,
        regressionVotes: 1,
      }),
    ).toBe(false);
  });

  test("lists held reviews for first-ten manual review", () => {
    const root = mkdtempSync(join(tmpdir(), "world-held-"));
    const directory = join(root, "proposals", "skills", "coding", "new-skill");
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, "SKILL.md"),
      "---\ncontributor: new-agent\ncontributor_contributions: 2\n---\n\n# New Skill\n\nBody.\n",
    );

    expect(listHeldReviews(root)).toEqual([
      {
        path: "proposals/skills/coding/new-skill/SKILL.md",
        contributor: "new-agent",
        reason: "first-ten-contributions",
      },
    ]);
  });
});
