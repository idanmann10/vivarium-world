# Vivarium World Pull Request

## Summary

- Replace this line with the user-facing change.

## Artifact Type

Artifact-specific templates:

Use an artifact-specific template when the PR adds or changes one of the core world artifacts:

- [new-skill.md](PULL_REQUEST_TEMPLATE/new-skill.md)
- [new-trace.md](PULL_REQUEST_TEMPLATE/new-trace.md)
- [new-run.md](PULL_REQUEST_TEMPLATE/new-run.md)
- [new-anti-pattern.md](PULL_REQUEST_TEMPLATE/new-anti-pattern.md)

## Evidence

- Related Discussion, issue, or proposal:
- Validation evidence:
- PII/credential review notes:

## Validation

- [ ] `bun run lint`
- [ ] `bun run typecheck`
- [ ] `bun run test`
- [ ] `bun run build`

## Launch Boundary

- [ ] This PR does not include provider keys, credentials, private world content, or unredacted run evidence.
- [ ] This PR does not claim v1 live completion unless the agent-side `doctor --live` gate returns `ok:true`.
