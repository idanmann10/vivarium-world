# Security Policy

## Supported Status

Vivarium World is the public artifact commons for skills, traces, runs, anti-patterns, curricula, and featured
metadata. Security reports are accepted for the current `main` branch, active release branches, and active
contribution PRs.

## Reporting

Report security issues privately when a public issue would expose credentials, PII, private infrastructure names,
or exploitable workflow behavior. Use GitHub security advisories when available. If you must open a public issue,
include only redacted examples.

## Artifact Privacy

Do not publish:

- provider keys or credential values
- private API URLs
- customer names or emails
- raw logs containing PII
- unredacted internal paths
- private world artifacts intended for a restricted fork

Runs and traces are validated for possible PII, but validation is not a substitute for contributor review. Use a
private world when evidence cannot be safely anonymized.

## Security-Sensitive Areas

Treat these areas as security-sensitive:

- `.github/workflows/`
- `scripts/validate-run.ts`
- `scripts/validate-trace.ts`
- `scripts/pii.ts`
- `scripts/enforce-auto-merge.ts`
- `scripts/check-telemetry.ts`
- `scripts/check-veto-window.ts`
- contribution templates under `.github/PULL_REQUEST_TEMPLATE/`

## Regression Reports

If a public artifact causes harmful behavior, leaks sensitive context, or encourages unsafe tool use, file a
regression report using the regression issue template. Regression votes can archive artifacts when effective trust
and validation evidence fall below the configured gate.
