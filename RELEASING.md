# Releasing Vivarium World

Vivarium World releases are publication checkpoints for the public commons. They should make validation state,
featured picks, stats, and trust gates inspectable without implying that the full `goal.md` live v1 evidence loop is
complete.

## Release Checklist

1. Run the full local gate:

   ```bash
   bun run scripts/validate-world.ts
   bun run lint
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

## Release Notes

Release notes should include:

- artifact counts and meaningful changes
- featured pick updates
- validation commands run
- auto-merge or maintainer-veto policy changes
- retired or regression-archived artifacts

Do not include secrets, raw private run logs, unredacted PII, internal API URLs, or private world artifacts.
