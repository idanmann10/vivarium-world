# World Trust Gates Slice Design

## Context

Phase 3 requires trust-weighted auto-merge, first-ten-contribution manual review, and maintainer tooling. The workflow files exist, but the local scripts need deterministic gate logic that can be tested without GitHub credentials.

## Approach

Implement local helpers:

- `computeContributorTrust` applies sigmoid over `LB * log(1 + uses)`.
- `requiredValidatorCount` maps contributor trust to K = 3 through 5.
- `canAutoMerge` checks effective lower bound, K validators, and zero regression votes.
- `listHeldReviews` reads local proposal metadata and returns held proposals for manual review.

## Success Criteria

- Tests cover high-trust and low-trust K selection.
- Tests cover auto-merge accept/reject decisions.
- Tests cover held proposal listing for first-ten manual review.
- `the-world` gates pass.
