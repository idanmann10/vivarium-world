# World Revalidate Workflow Design

## Goal

Make the roadmap's `revalidate.yml` workflow a concrete manual world-health gate instead of a lint-only placeholder.

## Scope

- Keep `revalidate.yml` manually triggered.
- Run Bun install, lint, TypeScript typecheck, and the world script test suite.
- Run the content validators for skills, traces, and runs.
- Run contributor/stat rebuild commands so stale checked-in profiles or `STATS.md` are detected through the existing stats synchronization test.

## Non-Goals

- No scheduled revalidation cadence.
- No automatic commits or pull requests.
- No live GitHub API calls.
- No new validation rules beyond existing scripts.

## Testing

World operation tests assert that `revalidate.yml` is not a placeholder and contains the concrete validation commands.
