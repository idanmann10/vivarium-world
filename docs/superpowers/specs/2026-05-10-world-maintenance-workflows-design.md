# World Maintenance Workflows Design

## Goal

Replace placeholder Phase 3 maintenance workflows with concrete GitHub Actions steps that run the local world scripts.

## Scope

- Make `archive-regression.yml` run validation and `scripts/archive-regression.ts`.
- Make `auto-merge.yml` run validation, tests, signal/trust scripts, held-review listing, and GitHub auto-merge for pull requests.
- Keep workflows usable by `workflow_dispatch`.
- Add tests that reject placeholder echo-only workflows.

## Non-Goals

- No live GitHub execution in this slice.
- No new trust algorithm.
- No branch protection configuration.
- No changes to validator math.

## Testing

`scripts/world-ops.test.ts` verifies the workflows no longer contain placeholder echo commands and include the expected concrete script and `gh pr merge` commands.
