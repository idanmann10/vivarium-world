import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

import { archiveRegressionCandidates } from "./archive-regression.js";
import { computeAutoMergeSignals, formatGitHubEnv } from "./compute-signals.js";
import { computeStatsMarkdown } from "./compute-stats.js";
import {
  canAutoMerge,
  computeContributorTrust,
  countIndependentPositiveValidators,
  requiredValidatorCount,
} from "./compute-trust.js";
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

  test("counts positive validators by independent machine fingerprint", () => {
    const votes = [
      { validator: "agent-a", machineFingerprint: "machine-1", positive: true },
      { validator: "agent-b", machineFingerprint: "machine-1", positive: true },
      { validator: "agent-c", machineFingerprint: "machine-2", positive: true },
      { validator: "agent-d", machineFingerprint: "machine-3", positive: false },
    ];

    expect(countIndependentPositiveValidators(votes)).toBe(2);
    expect(
      canAutoMerge({
        effectiveLowerBound: 0.6,
        positiveValidators: 3,
        requiredValidators: 3,
        regressionVotes: 0,
        validatorVotes: votes,
      }),
    ).toBe(false);
  });

  test("computes auto-merge signal env values from contribution proposals", () => {
    const root = mkdtempSync(join(tmpdir(), "world-signals-"));
    const directory = join(root, "proposals", "skills", "coding", "gated-skill");
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, "SKILL.md"),
      [
        "---",
        "contributor: trusted-agent",
        "contributor_trust: 0.82",
        "effective_lb: 0.61",
        "regression_votes: 0",
        "positive_validators: 2",
        'validator_votes_json: [{"validator":"agent-a","machineFingerprint":"machine-1","positive":true},{"validator":"agent-b","machineFingerprint":"machine-2","positive":true},{"validator":"agent-c","machineFingerprint":"machine-3","positive":false}]',
        "---",
        "",
        "# Gated Skill",
        "",
        "Body.",
      ].join("\n"),
    );

    const signals = computeAutoMergeSignals(root);

    expect(signals).toEqual({
      contributorTrust: 0.82,
      effectiveLowerBound: 0.61,
      positiveValidators: 2,
      regressionVotes: 0,
      validatorVotes: [
        { validator: "agent-a", machineFingerprint: "machine-1", positive: true },
        { validator: "agent-b", machineFingerprint: "machine-2", positive: true },
        { validator: "agent-c", machineFingerprint: "machine-3", positive: false },
      ],
    });
    expect(formatGitHubEnv(signals)).toContain("WORLD_EFFECTIVE_LB=0.61");
    expect(formatGitHubEnv(signals)).toContain("WORLD_VALIDATOR_VOTES_JSON=");
  });

  test("evaluates auto-merge gates with trust thresholds and manual holds", async () => {
    const trustModule = await import("./compute-trust.js");
    expect("evaluateAutoMergeGate" in trustModule).toBe(true);
    const evaluateAutoMergeGate = (
      trustModule as typeof trustModule & {
        readonly evaluateAutoMergeGate: (input: {
          readonly contributorTrust: number;
          readonly effectiveLowerBound: number;
          readonly regressionVotes: number;
          readonly validatorVotes: readonly {
            readonly validator: string;
            readonly machineFingerprint: string;
            readonly positive: boolean;
          }[];
          readonly heldReviews?: readonly { readonly path: string; readonly contributor: string; readonly reason: string }[];
        }) => {
          readonly allowed: boolean;
          readonly requiredValidators: number;
          readonly positiveValidators: number;
          readonly reasons: readonly string[];
        };
      }
    ).evaluateAutoMergeGate;

    expect(
      evaluateAutoMergeGate({
        contributorTrust: 0.82,
        effectiveLowerBound: 0.6,
        regressionVotes: 0,
        validatorVotes: [
          { validator: "agent-a", machineFingerprint: "machine-1", positive: true },
          { validator: "agent-b", machineFingerprint: "machine-2", positive: true },
          { validator: "agent-c", machineFingerprint: "machine-3", positive: true },
        ],
      }),
    ).toEqual({ allowed: true, requiredValidators: 3, positiveValidators: 3, reasons: [] });

    expect(
      evaluateAutoMergeGate({
        contributorTrust: 0.82,
        effectiveLowerBound: 0.6,
        regressionVotes: 0,
        validatorVotes: [
          { validator: "agent-a", machineFingerprint: "machine-1", positive: true },
          { validator: "agent-b", machineFingerprint: "machine-2", positive: true },
        ],
        heldReviews: [{ path: "proposals/skills/coding/new/SKILL.md", contributor: "new-agent", reason: "first-ten-contributions" }],
      }).reasons,
    ).toEqual([
      "manual review required for proposals/skills/coding/new/SKILL.md: first-ten-contributions",
      "requires 3 independent positive validators, found 2",
    ]);
  });

  test("lists held reviews for first-ten manual review", () => {
    const root = mkdtempSync(join(tmpdir(), "world-held-"));
    const proposalsRoot = join(root, "proposals");
    const directory = join(root, "proposals", "skills", "coding", "new-skill");
    mkdirSync(proposalsRoot, { recursive: true });
    writeFileSync(join(proposalsRoot, "README.md"), "# Proposals\n\nDesign proposal index.\n");
    writeFileSync(join(proposalsRoot, "0001-phase-0-bootstrap-rfc.md"), "# Phase 0 RFC\n\nDiscussion mirror.\n");
    mkdirSync(directory, { recursive: true });
    writeFileSync(
      join(directory, "SKILL.md"),
      "---\ncontributor: new-agent\ncontributor_contributions: 2\n---\n\n# New Skill\n\nEmail ida@example.com with Bearer sk-secret.\n",
    );

    expect(listHeldReviews(root)).toEqual([
      {
        path: "proposals/skills/coding/new-skill/SKILL.md",
        contributor: "new-agent",
        reason: "first-ten-contributions",
        anonymizerSummary: {
          redactions: 2,
          preview: "---\ncontributor: new-agent\ncontributor_contributions: 2\n---\n\n# New Skill\n\nEmail [REDACTED_EMAIL] with Bearer [REDACTED_TOKEN].\n",
        },
      },
    ]);
  });

  test("maintenance workflows run concrete world scripts", () => {
    const archiveWorkflow = readFileSync(".github/workflows/archive-regression.yml", "utf8");
    const autoMergeWorkflow = readFileSync(".github/workflows/auto-merge.yml", "utf8");

    expect(archiveWorkflow).not.toContain("placeholder");
    expect(archiveWorkflow).not.toContain("echo \"Archive skills after regression gates in Phase 3.\"");
    expect(archiveWorkflow).toContain("bun run scripts/archive-regression.ts");

    expect(autoMergeWorkflow).not.toContain("placeholder");
    expect(autoMergeWorkflow).not.toContain("echo \"Trust-weighted K-agent auto-merge starts in Phase 3.\"");
    expect(autoMergeWorkflow).toContain("bun run scripts/compute-signals.ts");
    expect(autoMergeWorkflow).toContain("bun run scripts/enforce-auto-merge.ts");
    expect(autoMergeWorkflow).toContain("bun run scripts/list-held-reviews.ts");
    expect(autoMergeWorkflow).toContain("gh pr merge");
  });
});
