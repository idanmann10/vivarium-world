# the-world

Git-hosted cultural commons for the local-first agent.

This repository holds skills, anti-patterns, traces, runs, exemplars, rubrics, curricula, contributor profiles, featured picks, and validation tooling.

## Domains

- `coding`
- `research`
- `summarization`

## Commands

- `bun run seed`
- `bun run lint`
- `bun run typecheck`
- `bun run test`
- `bun run build`

## Auto-Merge Gate

The auto-merge workflow fails closed until live signal collection provides trust and validation evidence:

- `WORLD_CONTRIBUTOR_TRUST`
- `WORLD_EFFECTIVE_LB`
- `WORLD_REGRESSION_VOTES`
- `WORLD_POSITIVE_VALIDATORS` or `WORLD_VALIDATOR_VOTES_JSON`

`scripts/compute-signals.ts` reads contribution proposal metadata and writes these values to `$GITHUB_ENV` when it runs inside GitHub Actions. Proposal frontmatter can provide `contributor_trust`, `effective_lb`, `regression_votes`, `positive_validators`, and `validator_votes_json`.
