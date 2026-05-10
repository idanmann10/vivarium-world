import { appendFileSync } from "node:fs";
import { relative } from "node:path";
import type { ValidatorVote } from "./compute-trust.js";
import { readText, walkSync } from "./world-utils.js";

export interface AutoMergeSignals {
  readonly contributorTrust: number;
  readonly effectiveLowerBound: number;
  readonly positiveValidators: number;
  readonly regressionVotes: number;
  readonly validatorVotes: readonly ValidatorVote[];
}

function isContributionProposal(path: string): boolean {
  const normalized = path.replaceAll("\\", "/");
  return [
    /^proposals\/skills\/[^/]+\/[^/]+\/SKILL\.md$/,
    /^proposals\/anti-patterns\/[^/]+\/[^/]+\/ANTI-PATTERN\.md$/,
    /^proposals\/traces\/[^/]+\/[^/]+\/TRACE\.md$/,
    /^proposals\/runs\/[^/]+\/RUN\.md$/,
  ].some((pattern) => pattern.test(normalized));
}

function metadataValue(text: string, key: string): string | undefined {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

function metadataNumber(text: string, key: string): number {
  const value = metadataValue(text, key);
  if (value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function metadataValidatorVotes(text: string): readonly ValidatorVote[] {
  const value = metadataValue(text, "validator_votes_json");
  if (value === undefined || value.length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as readonly Partial<ValidatorVote>[];
    return parsed.flatMap((vote) =>
      typeof vote.validator === "string" && typeof vote.machineFingerprint === "string" && typeof vote.positive === "boolean"
        ? [{ validator: vote.validator, machineFingerprint: vote.machineFingerprint, positive: vote.positive }]
        : [],
    );
  } catch {
    return [];
  }
}

export function computeAutoMergeSignals(root = "."): AutoMergeSignals {
  const proposalSignals = walkSync(`${root}/proposals`)
    .filter((path) => isContributionProposal(relative(root, path)))
    .map((path) => {
      const text = readText(path);
      return {
        contributorTrust: metadataNumber(text, "contributor_trust"),
        effectiveLowerBound: metadataNumber(text, "effective_lb"),
        positiveValidators: metadataNumber(text, "positive_validators"),
        regressionVotes: metadataNumber(text, "regression_votes"),
        validatorVotes: metadataValidatorVotes(text),
      };
    });

  if (proposalSignals.length === 0) {
    return {
      contributorTrust: 0,
      effectiveLowerBound: 0,
      positiveValidators: 0,
      regressionVotes: 0,
      validatorVotes: [],
    };
  }

  return {
    contributorTrust: Math.min(...proposalSignals.map((signal) => signal.contributorTrust)),
    effectiveLowerBound: Math.min(...proposalSignals.map((signal) => signal.effectiveLowerBound)),
    positiveValidators: Math.max(...proposalSignals.map((signal) => signal.positiveValidators)),
    regressionVotes: proposalSignals.reduce((sum, signal) => sum + signal.regressionVotes, 0),
    validatorVotes: proposalSignals.flatMap((signal) => signal.validatorVotes),
  };
}

export function formatGitHubEnv(signals: AutoMergeSignals): string {
  return [
    `WORLD_CONTRIBUTOR_TRUST=${signals.contributorTrust}`,
    `WORLD_EFFECTIVE_LB=${signals.effectiveLowerBound}`,
    `WORLD_REGRESSION_VOTES=${signals.regressionVotes}`,
    `WORLD_POSITIVE_VALIDATORS=${signals.positiveValidators}`,
    `WORLD_VALIDATOR_VOTES_JSON=${JSON.stringify(signals.validatorVotes)}`,
  ].join("\n");
}

if (import.meta.main) {
  const signals = computeAutoMergeSignals(".");
  console.log(JSON.stringify(signals, null, 2));

  const githubEnv = process.env.GITHUB_ENV;
  if (githubEnv !== undefined && githubEnv.trim().length > 0) {
    appendFileSync(githubEnv, `${formatGitHubEnv(signals)}\n`, "utf8");
  }
}
