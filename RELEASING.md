# Releasing Vivarium World

Vivarium World releases are publication checkpoints for the public commons. They should make validation state,
featured picks, stats, and trust gates inspectable without implying that the full `goal.md` live v1 evidence loop is
complete.

## Release Checklist

1. Run the full local gate:

   ```bash
   bun run scripts/validate-world.ts
   bun run lint
   bun run launch:security-audit
   bun run public-release:scan
   bun run typecheck
   bun run test
   bun run build
   ```

2. Rebuild contributor profiles and stats when artifacts changed:

   ```bash
   bun run scripts/rebuild-contributors.ts
   bun run scripts/compute-stats.ts
   ```

3. Confirm `STATS.md` changed only as expected.
4. Confirm `featured/current.md` has the intended featured picks.
5. Run proposal and artifact validators for changed paths.
6. Confirm auto-merge workflows remain fail-closed for missing trust, missing validators, regression votes, suspicious telemetry, and maintainer veto labels.
7. Archive weekly featured picks when publishing a weekly curation checkpoint.
8. Confirm `LICENSE` still states the MIT tooling license and CC0 dedication for public world content.
9. Confirm the canonical world is still a public repository before calling the checkpoint an open commons release.
10. Verify the GitHub security posture before announcing a publication checkpoint:
    - run `bun run launch:security-audit`
    - private vulnerability reporting is enabled
    - secret scanning is enabled
    - push protection is enabled
    - CodeQL has run and code scanning alerts have been reviewed
11. Record an explicit maintainer decision for `main` branch protection or repository rulesets. Do not enable or
    change branch protection or repository rulesets without explicit approval for this repository.
    If approved, use this recommended baseline:
    - Require pull request reviews before merging.
    - Require status checks to pass before merging, including validation, release scans, and CodeQL.
    - Block force pushes.
    - Block deletions.
    - Require linear history unless the maintainer records a different release policy.

## Release Notes

Release notes should include:

- artifact counts and meaningful changes
- featured pick updates
- validation commands run
- auto-merge or maintainer-veto policy changes
- retired or regression-archived artifacts

Do not include secrets, raw private run logs, unredacted PII, internal API URLs, or private world artifacts.
