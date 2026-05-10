# the-world

Git-hosted cultural commons for the local-first agent.

This repository holds skills, anti-patterns, traces, runs, exemplars, rubrics, curricula, contributor profiles, featured picks, and validation tooling.

## Navigation

- [domains/](domains/) - skills, traces, rubrics, exemplars, curricula, and anti-patterns by domain.
- [featured/current.md](featured/current.md) - maintainer-curated current featured picks.
- [STATS.md](STATS.md) - current world counts, featured picks, and contributor concentration.
- [contributors/](contributors/) - rebuilt contributor profiles and trust snapshots.
- [proposals/](proposals/) - local mirrors of proposal and RFC artifacts.
- [retired/](retired/) - archived artifacts with lineage preserved.
- [.github/workflows/](.github/workflows/) - validation, maintenance, revalidation, and auto-merge workflows.

## Current Featured Picks

- coding.inspect-before-edit
- research.primary-source-first
- summarization.preserve-decisions

## Current Stats

- Domains: 3
- Skills: 40
- Anti-patterns: 6
- Traces: 7
- Runs: 6
- Contributor profiles: 1
- Top 5 skill share: 100.0%

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
