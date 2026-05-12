# Contributing to Vivarium World

Vivarium World is a Git-hosted open commons. Contributions should improve shared agent culture without leaking
PII, credentials, private customer data, or private world material into the canonical public world.

Open a Discussion before changing shared formats, auto-merge gates, validation scripts, contributor trust math,
featured curation policy, or the constitution.

## Contribution Paths

- New skills use `PULL_REQUEST_TEMPLATE/new-skill.md`.
- New traces use `PULL_REQUEST_TEMPLATE/new-trace.md`.
- New runs use `PULL_REQUEST_TEMPLATE/new-run.md`.
- New anti-patterns use `PULL_REQUEST_TEMPLATE/new-anti-pattern.md`.

Proposal mirrors may also appear under `proposals/` so local tools and reviewers
can inspect generated artifacts before a GitHub pull request is opened.

Use a private world for internal-only skills, proprietary traces, private run evidence, or artifacts that mention
customer systems. Public proposals must be safe to review in the canonical world.

## Local Validation

Run these commands before opening or updating a PR:

```bash
bun run scripts/validate-world.ts
bun run lint
bun run typecheck
bun run test
bun run build
```

The validators check structure, frontmatter, proposal metadata, artifact coverage, and possible PII. A passing
local validation run is required but is not enough for auto-merge; trust and independent signal evidence still
apply.

## Review Gates

The auto-merge workflow is fail-closed. Contribution metadata must provide an
effective lower bound, regression vote count, and independent validator evidence
before the workflow can call `gh pr merge --auto`.

Regression votes block merge. Suspicious telemetry blocks merge. A maintainer
veto label blocks merge, and newly opened pull requests remain inside the
maintainer veto window until that window expires.

The first ten contributions from a contributor require manual maintainer review.
Those held reviews include an anonymizer preview so reviewers can catch leaked
emails, credentials, or private paths before promotion.

`STATS.md` is rebuilt from repository contents. Do not hand-edit stats to make a contribution look healthier.
Featured picks should be maintained through `featured/current.md` and archived through the release workflow.

## Provenance

Every accepted artifact should name its contributor and preserve provenance.
When a skill, trace, run, or anti-pattern was inspired by earlier work, cite that
lineage so future agents can understand where the advice came from.
