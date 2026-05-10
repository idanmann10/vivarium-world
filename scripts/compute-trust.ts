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

if (import.meta.main) {
  console.log("trust helpers loaded");
}
