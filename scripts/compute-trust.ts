export interface TrustEvidence {
  readonly lowerBound: number;
  readonly uses: number;
}

export interface ValidatorVote {
  readonly validator: string;
  readonly machineFingerprint: string;
  readonly positive: boolean;
}

export interface AutoMergeInput {
  readonly effectiveLowerBound: number;
  readonly positiveValidators: number;
  readonly requiredValidators: number;
  readonly regressionVotes: number;
  readonly validatorVotes?: readonly ValidatorVote[];
}

export interface AutoMergeGateInput {
  readonly contributorTrust: number;
  readonly effectiveLowerBound: number;
  readonly regressionVotes: number;
  readonly positiveValidators?: number;
  readonly validatorVotes?: readonly ValidatorVote[];
  readonly heldReviews?: readonly { readonly path: string; readonly reason: string }[];
}

export interface AutoMergeGateResult {
  readonly allowed: boolean;
  readonly requiredValidators: number;
  readonly positiveValidators: number;
  readonly reasons: readonly string[];
}

export function computeContributorTrust(evidence: readonly TrustEvidence[]): number {
  const weighted = evidence.reduce((sum, item) => sum + item.lowerBound * Math.log1p(item.uses), 0);
  return 1 / (1 + Math.E ** -weighted);
}

export function requiredValidatorCount(trust: number): number {
  if (trust >= 0.8) {
    return 3;
  }

  if (trust >= 0.6) {
    return 4;
  }

  return 5;
}

export function countIndependentPositiveValidators(votes: readonly ValidatorVote[]): number {
  return new Set(votes.filter((vote) => vote.positive).map((vote) => vote.machineFingerprint)).size;
}

export function canAutoMerge(input: AutoMergeInput): boolean {
  const positiveValidators =
    input.validatorVotes === undefined ? input.positiveValidators : countIndependentPositiveValidators(input.validatorVotes);

  return (
    input.effectiveLowerBound >= 0.55 &&
    positiveValidators >= input.requiredValidators &&
    input.regressionVotes === 0
  );
}

export function evaluateAutoMergeGate(input: AutoMergeGateInput): AutoMergeGateResult {
  const requiredValidators = requiredValidatorCount(input.contributorTrust);
  const positiveValidators =
    input.validatorVotes === undefined ? input.positiveValidators ?? 0 : countIndependentPositiveValidators(input.validatorVotes);
  const reasons = [
    ...(input.heldReviews ?? []).map((review) => `manual review required for ${review.path}: ${review.reason}`),
    ...(input.effectiveLowerBound >= 0.55 ? [] : [`effective lower bound ${input.effectiveLowerBound} is below 0.55`]),
    ...(positiveValidators >= requiredValidators
      ? []
      : [`requires ${requiredValidators} independent positive validators, found ${positiveValidators}`]),
    ...(input.regressionVotes === 0 ? [] : [`regression votes must be 0, found ${input.regressionVotes}`]),
  ];

  return {
    allowed:
      reasons.length === 0 &&
      canAutoMerge({
        effectiveLowerBound: input.effectiveLowerBound,
        positiveValidators,
        requiredValidators,
        regressionVotes: input.regressionVotes,
      }),
    requiredValidators,
    positiveValidators,
    reasons,
  };
}

if (import.meta.main) {
  console.log("trust helpers loaded");
}
