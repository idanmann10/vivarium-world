# Independent Validator Fingerprints Design

## Goal

Close the local Phase 3 anti-gaming gap by making world trust gates count positive validators by independent machine fingerprint when detailed validator evidence is available.

## Scope

- Add `ValidatorVote` records with validator ID, machine fingerprint, and positive/negative outcome.
- Add `countIndependentPositiveValidators`.
- Have `canAutoMerge` use independent positive machine count when validator vote details are provided.
- Keep existing numeric `positiveValidators` behavior for callers that only have aggregate counts.

## Non-Goals

- No live machine fingerprint collection.
- No GitHub reviewer identity verification.
- No cryptographic attestation.
- No change to trust-score math.

## Testing

World operation tests verify that multiple positive validators from the same machine count once and cannot satisfy a three-validator auto-merge gate.
