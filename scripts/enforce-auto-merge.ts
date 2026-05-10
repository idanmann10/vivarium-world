import { evaluateAutoMergeGate, type ValidatorVote } from "./compute-trust.js";
import { listHeldReviews } from "./list-held-reviews.js";

function numberFromEnv(name: string): number {
  const value = process.env[name];
  if (value === undefined || value.trim().length === 0) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseValidatorVotes(): readonly ValidatorVote[] | undefined {
  const value = process.env.WORLD_VALIDATOR_VOTES_JSON;
  if (value === undefined || value.trim().length === 0) {
    return undefined;
  }

  const parsed = JSON.parse(value) as readonly Partial<ValidatorVote>[];
  return parsed.flatMap((vote) =>
    typeof vote.validator === "string" && typeof vote.machineFingerprint === "string" && typeof vote.positive === "boolean"
      ? [{ validator: vote.validator, machineFingerprint: vote.machineFingerprint, positive: vote.positive }]
      : [],
  );
}

const validatorVotes = parseValidatorVotes();
const result = evaluateAutoMergeGate({
  contributorTrust: numberFromEnv("WORLD_CONTRIBUTOR_TRUST"),
  effectiveLowerBound: numberFromEnv("WORLD_EFFECTIVE_LB"),
  regressionVotes: numberFromEnv("WORLD_REGRESSION_VOTES"),
  positiveValidators: numberFromEnv("WORLD_POSITIVE_VALIDATORS"),
  ...(validatorVotes === undefined ? {} : { validatorVotes }),
  heldReviews: listHeldReviews("."),
});

console.log(JSON.stringify(result, null, 2));

if (!result.allowed) {
  console.error(result.reasons.join("\n"));
  process.exit(1);
}
