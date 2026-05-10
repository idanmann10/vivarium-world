import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

import { archiveRegressionCandidates } from "./archive-regression.js";
import { archiveFeaturedWeek } from "./archive-featured.js";
import { computeAutoMergeSignals, formatGitHubEnv } from "./compute-signals.js";
import { computeStatsMarkdown } from "./compute-stats.js";
import { rebuildContributorProfiles } from "./rebuild-contributors.js";
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

function expectCheckpointAfter(workflow: string, anchorCommand: string): void {
  const anchorIndex = workflow.indexOf(anchorCommand);
  expect(anchorIndex).toBeGreaterThanOrEqual(0);

  for (const command of ["bun run lint", "bun run typecheck", "bun run build", "bun test scripts"]) {
    expect(workflow.indexOf(command, anchorIndex)).toBeGreaterThan(anchorIndex);
  }
}

describe("world operations", () => {
  test("computes stats markdown", () => {
    const root = mkdtempSync(join(tmpdir(), "world-stats-"));
    skill(root, "one", "description: one");
    mkdirSync(join(root, "contributors"), { recursive: true });
    writeFileSync(
      join(root, "contributors", "maintainer.json"),
      `${JSON.stringify({
        handle: "maintainer",
        contributions: { skills: 1, antiPatterns: 0, traces: 0, runsPublished: 0, skillsArchived: 0 },
      })}\n`,
    );
    mkdirSync(join(root, "featured"), { recursive: true });
    writeFileSync(join(root, "featured", "current.md"), "# Current Featured Picks\n\n- coding.one\n", "utf8");

    const markdown = computeStatsMarkdown(root);

    expect(markdown).toContain("## Seed Snapshot");
    expect(markdown).toContain("- Domains: 1");
    expect(markdown).toContain("- Skills: 1");
    expect(markdown).toContain("## Contributor Concentration");
    expect(markdown).toContain("- Top 5 skill share: 100.0%");
    expect(markdown).toContain("- Top 5 skill contributors: maintainer: 1 skill (100.0% of 1)");
    expect(markdown).toContain("## Featured Picks");
    expect(markdown).toContain("- coding.one");
  });

  test("script writes STATS.md from computed stats", () => {
    const root = mkdtempSync(join(tmpdir(), "world-stats-write-"));
    skill(root, "one", "description: one");

    const result = Bun.spawnSync(["bun", join(import.meta.dir, "compute-stats.ts")], { cwd: root });

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(root, "STATS.md"))).toBe(true);
    expect(readFileSync(join(root, "STATS.md"), "utf8")).toBe(`${computeStatsMarkdown(root)}\n`);
  });

  test("keeps checked-in stats in sync with computed stats", () => {
    expect(readFileSync("STATS.md", "utf8")).toBe(`${computeStatsMarkdown(".")}\n`);
  });

  test("README surfaces navigation, featured picks, and current stats", () => {
    const readme = readFileSync("README.md", "utf8");

    for (const link of [
      "[domains/](domains/)",
      "[featured/current.md](featured/current.md)",
      "[STATS.md](STATS.md)",
      "[contributors/](contributors/)",
      "[proposals/](proposals/)",
      "[retired/](retired/)",
      "[.github/workflows/](.github/workflows/)",
    ]) {
      expect(readme).toContain(link);
    }

    expect(readme).toContain("- coding.inspect-before-edit");
    expect(readme).toContain("- Skills: 40");
    expect(readme).toContain("- Top 5 skill share: 100.0%");
  });

  test("documents world governance and directory contracts", () => {
    const docs = {
      "CONSTITUTION.md": ["Search the world", "Predict outcomes", "Reflect", "Refuse", "provenance", "private"],
      "CONTRIBUTING.md": [
        "Discussion",
        "auto-merge",
        "validator",
        "regression",
        "first ten",
        "PULL_REQUEST_TEMPLATE/new-skill.md",
      ],
      "featured/README.md": ["featured/current.md", "featured/archive", "maintainer", "weekly", "STATS.md"],
      "proposals/README.md": ["skills", "traces", "runs", "anti-patterns", "RFC", "manual review"],
      "retired/README.md": ["retired/skills", "lineage", "provenance", "regression", "stale"],
      "AGENTS.md": ["bun run lint", "bun run typecheck", "bun run test", "bun run build"],
    } as const;

    for (const [path, terms] of Object.entries(docs)) {
      const body = readFileSync(path, "utf8");
      for (const term of terms) {
        expect(body).toContain(term);
      }
    }

    for (const domain of ["coding", "research", "summarization"]) {
      const body = readFileSync(join("domains", domain, "README.md"), "utf8");
      for (const term of ["skills/", "traces/", "anti-patterns/", "rubrics/", "exemplars/", "curriculum.md"]) {
        expect(body).toContain(term);
      }
    }
  });

  test("rebuilds contributor profiles from world artifacts", () => {
    const root = mkdtempSync(join(tmpdir(), "world-contributors-"));
    skill(root, "one", "contributor: agent-a");
    skill(root, "seed", "description: seed");

    const result = rebuildContributorProfiles(root);

    expect(result).toEqual(["contributors/agent-a.json", "contributors/maintainer.json"]);
    expect(JSON.parse(readFileSync(join(root, "contributors", "agent-a.json"), "utf8"))).toMatchObject({
      handle: "agent-a",
      domains: ["coding"],
      contributions: { skills: 1, antiPatterns: 0, traces: 0, runsPublished: 0, skillsArchived: 0 },
      trustScore: 0.5,
      domainTrust: { coding: 0.5 },
    });
    expect(JSON.parse(readFileSync(join(root, "contributors", "maintainer.json"), "utf8"))).toMatchObject({
      handle: "maintainer",
      domains: ["coding"],
      contributions: { skills: 1, antiPatterns: 0, traces: 0, runsPublished: 0, skillsArchived: 0 },
    });
  });

  test("archives current featured picks by week", () => {
    const root = mkdtempSync(join(tmpdir(), "world-featured-"));
    mkdirSync(join(root, "featured"), { recursive: true });
    writeFileSync(join(root, "featured", "current.md"), "# Current Featured Picks\n\n- coding.one\n", "utf8");

    expect(archiveFeaturedWeek(root, "2026-20")).toEqual("featured/archive/2026-20.md");
    expect(readFileSync(join(root, "featured", "archive", "2026-20.md"), "utf8")).toBe(
      "# Featured Archive 2026-W20\n\n- coding.one\n",
    );
  });

  test("archives regression candidates", () => {
    const root = mkdtempSync(join(tmpdir(), "world-archive-"));
    skill(root, "bad", "regression_votes: 3\neffective_lb: 0.3");

    expect(archiveRegressionCandidates(root)).toEqual(["domains/coding/skills/bad/SKILL.md"]);
  });

  test("moves regression candidates into retired skills", () => {
    const root = mkdtempSync(join(tmpdir(), "world-archive-move-"));
    skill(root, "bad", "regression_votes: 3\neffective_lb: 0.3");

    const result = Bun.spawnSync(["bun", join(import.meta.dir, "archive-regression.ts")], { cwd: root });

    expect(result.exitCode).toBe(0);
    expect(existsSync(join(root, "domains", "coding", "skills", "bad", "SKILL.md"))).toBe(false);
    expect(existsSync(join(root, "retired", "skills", "coding", "bad", "SKILL.md"))).toBe(true);
  });

  test("flags stale skills", () => {
    const root = mkdtempSync(join(tmpdir(), "world-stale-"));
    skill(root, "old", "last_validated_at: 2025-01-01\nnewer_alternatives: true");

    expect(flagStaleSkills(root, new Date("2026-05-09T00:00:00.000Z"))).toEqual([
      "domains/coding/skills/old/SKILL.md",
    ]);
  });

  test("script marks stale skills in frontmatter", () => {
    const root = mkdtempSync(join(tmpdir(), "world-stale-marker-"));
    const path = skill(root, "old", "last_validated_at: 2025-01-01\nnewer_alternatives: true");

    const result = Bun.spawnSync(["bun", join(import.meta.dir, "flag-stale.ts")], {
      cwd: root,
      env: { ...process.env, WORLD_STALE_NOW: "2026-05-09T00:00:00.000Z" },
    });

    expect(result.exitCode).toBe(0);
    expect(readFileSync(path, "utf8")).toContain("stale: true\n");
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

  test("flags implausible pull telemetry concentration", async () => {
    const scriptPath = join(import.meta.dir, "check-telemetry.ts");
    expect(existsSync(scriptPath)).toBe(true);

    const telemetryModule = await import("./check-telemetry.js");
    const detectTelemetryAnomalies = (
      telemetryModule as typeof telemetryModule & {
        readonly detectTelemetryAnomalies: (
          events: readonly {
            readonly artifactId: string;
            readonly kind: "pull" | "use";
            readonly timestamp: string;
            readonly ipHash?: string;
            readonly installId?: string;
            readonly agentId?: string;
          }[],
        ) => readonly {
          readonly artifactId: string;
          readonly reason: "implausible-telemetry";
          readonly eventCount: number;
          readonly distinctSources: number;
          readonly windowMinutes: number;
        }[];
      }
    ).detectTelemetryAnomalies;
    const events = Array.from({ length: 500 }, (_, index) => ({
      artifactId: "domains/coding/skills/hot/SKILL.md",
      kind: "pull" as const,
      timestamp: new Date(Date.UTC(2026, 4, 10, 12, index % 60, 0)).toISOString(),
      ipHash: `ip-${index % 5}`,
    }));

    expect(detectTelemetryAnomalies(events)).toEqual([
      {
        artifactId: "domains/coding/skills/hot/SKILL.md",
        reason: "implausible-telemetry",
        eventCount: 500,
        distinctSources: 5,
        windowMinutes: 60,
      },
    ]);
  });

  test("evaluates maintainer veto window before auto-merge", async () => {
    const scriptPath = join(import.meta.dir, "check-veto-window.ts");
    expect(existsSync(scriptPath)).toBe(true);

    const vetoModule = await import("./check-veto-window.js");
    const evaluateMaintainerVetoWindow = (
      vetoModule as typeof vetoModule & {
        readonly evaluateMaintainerVetoWindow: (input: {
          readonly createdAt?: string;
          readonly now: Date;
          readonly labels?: readonly string[];
          readonly windowHours?: number;
        }) => {
          readonly allowed: boolean;
          readonly reason?: "maintainer-veto-window-open" | "maintainer-veto-label";
          readonly ageHours?: number;
          readonly windowHours: number;
        };
      }
    ).evaluateMaintainerVetoWindow;
    const now = new Date("2026-05-10T12:00:00.000Z");

    expect(evaluateMaintainerVetoWindow({ createdAt: "2026-05-09T12:00:00.000Z", now })).toEqual({
      allowed: false,
      reason: "maintainer-veto-window-open",
      ageHours: 24,
      windowHours: 48,
    });
    expect(evaluateMaintainerVetoWindow({ createdAt: "2026-05-08T11:00:00.000Z", now })).toEqual({
      allowed: true,
      ageHours: 49,
      windowHours: 48,
    });
    expect(evaluateMaintainerVetoWindow({ createdAt: "2026-05-08T11:00:00.000Z", now, labels: ["maintainer-veto"] })).toEqual({
      allowed: false,
      reason: "maintainer-veto-label",
      ageHours: 49,
      windowHours: 48,
    });
  });

  test("maintenance workflows run concrete world scripts", () => {
    const ciWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
    const archiveWorkflow = readFileSync(".github/workflows/archive-regression.yml", "utf8");
    const autoMergeWorkflow = readFileSync(".github/workflows/auto-merge.yml", "utf8");
    const featuredArchiveWorkflow = readFileSync(".github/workflows/featured-archive.yml", "utf8");
    const nightlyStatsWorkflow = readFileSync(".github/workflows/nightly-stats.yml", "utf8");
    const revalidateWorkflow = readFileSync(".github/workflows/revalidate.yml", "utf8");
    const staleSkillsWorkflow = readFileSync(".github/workflows/stale-skills.yml", "utf8");

    expect(ciWorkflow).toContain("pull_request:");
    expect(ciWorkflow).toContain("push:");
    expect(ciWorkflow).toContain("bun run lint");
    expect(ciWorkflow).toContain("bun run typecheck");
    expect(ciWorkflow).toContain("bun run test");
    expect(ciWorkflow).toContain("bun run build");

    expect(archiveWorkflow).not.toContain("placeholder");
    expect(archiveWorkflow).not.toContain("echo \"Archive skills after regression gates in Phase 3.\"");
    expect(archiveWorkflow).toContain("bun run scripts/archive-regression.ts");
    expectCheckpointAfter(archiveWorkflow, "bun run scripts/archive-regression.ts");

    expect(autoMergeWorkflow).not.toContain("placeholder");
    expect(autoMergeWorkflow).not.toContain("echo \"Trust-weighted K-agent auto-merge starts in Phase 3.\"");
    expect(autoMergeWorkflow).toContain("bun run typecheck");
    expect(autoMergeWorkflow).toContain("bun run build");
    expect(autoMergeWorkflow).toContain("bun test scripts");
    expect(autoMergeWorkflow).toContain("bun run scripts/compute-signals.ts");
    expect(autoMergeWorkflow).toContain("bun run scripts/enforce-auto-merge.ts");
    expect(autoMergeWorkflow).toContain("bun run scripts/list-held-reviews.ts");
    expect(autoMergeWorkflow).toContain("bun run scripts/check-telemetry.ts");
    expect(autoMergeWorkflow).toContain("bun run scripts/check-veto-window.ts");
    expect(autoMergeWorkflow).toContain("gh pr merge");

    expect(featuredArchiveWorkflow).not.toContain("placeholder");
    expect(featuredArchiveWorkflow).toContain("bun run scripts/archive-featured.ts");
    expectCheckpointAfter(featuredArchiveWorkflow, "bun run scripts/archive-featured.ts");
    expect(featuredArchiveWorkflow).toContain("git add featured/archive");
    expect(featuredArchiveWorkflow).toContain("gh pr create");

    expect(nightlyStatsWorkflow).not.toContain("placeholder");
    expect(nightlyStatsWorkflow).toContain("bun run scripts/rebuild-contributors.ts");
    expect(nightlyStatsWorkflow).toContain("bun run scripts/compute-stats.ts");
    expectCheckpointAfter(nightlyStatsWorkflow, "bun run scripts/compute-stats.ts");
    expect(nightlyStatsWorkflow).toContain("git add contributors STATS.md");
    expect(nightlyStatsWorkflow).toContain("gh pr create");

    expect(revalidateWorkflow).not.toContain("placeholder");
    expect(revalidateWorkflow).toContain("bun run typecheck");
    expect(revalidateWorkflow).toContain("bun run build");
    expect(revalidateWorkflow).toContain("bun run scripts/validate-skill.ts");
    expect(revalidateWorkflow).toContain("bun run scripts/validate-trace.ts");
    expect(revalidateWorkflow).toContain("bun run scripts/validate-run.ts");
    expect(revalidateWorkflow).toContain("bun run scripts/rebuild-contributors.ts");
    expect(revalidateWorkflow).toContain("bun run scripts/compute-stats.ts");
    expect(revalidateWorkflow).toContain("git diff --exit-code contributors STATS.md");
    expect(revalidateWorkflow).toContain("bun test scripts");

    expect(staleSkillsWorkflow).not.toContain("placeholder");
    expect(staleSkillsWorkflow).toContain("bun run scripts/flag-stale.ts");
    expectCheckpointAfter(staleSkillsWorkflow, "bun run scripts/flag-stale.ts");
    expect(staleSkillsWorkflow).toContain("git add domains");
    expect(staleSkillsWorkflow).toContain("gh pr create");
  });
});
