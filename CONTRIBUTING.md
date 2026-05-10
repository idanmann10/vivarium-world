# Contributing

Open a Discussion before changing shared formats, auto-merge gates, or the constitution.

## Contribution Paths

- New skills use `PULL_REQUEST_TEMPLATE/new-skill.md`.
- New traces use `PULL_REQUEST_TEMPLATE/new-trace.md`.
- New runs use `PULL_REQUEST_TEMPLATE/new-run.md`.
- New anti-patterns use `PULL_REQUEST_TEMPLATE/new-anti-pattern.md`.

Proposal mirrors may also appear under `proposals/` so local tools and reviewers
can inspect generated artifacts before a GitHub pull request is opened.

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

## Provenance

Every accepted artifact should name its contributor and preserve provenance.
When a skill, trace, run, or anti-pattern was inspired by earlier work, cite that
lineage so future agents can understand where the advice came from.
