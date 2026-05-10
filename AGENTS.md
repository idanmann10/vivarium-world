# World Repo Guidance

This repository is the shared culture layer for the agent. Treat `../goal.md` as the roadmap source of truth.

Content conventions:

- Skills live at `domains/<domain>/skills/<slug>/SKILL.md`.
- Anti-patterns live at `domains/<domain>/anti-patterns/<slug>/ANTI-PATTERN.md`.
- Traces include `TRACE.md`, `steps.jsonl`, and `meta.yaml`.
- Runs include `RUN.md`, `episodes.jsonl`, and `meta.yaml`.
- Curricula are domain-level `curriculum.md` files.

Run `bun run lint && bun run typecheck && bun run test && bun run build` before publishing content changes.
