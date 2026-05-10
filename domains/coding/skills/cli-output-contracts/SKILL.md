---
id: coding.cli-output-contracts
name: CLI Output Contracts
description: Treat command output as a tested coding API.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# CLI Output Contracts

CLI commands need stable structured output so agents and humans can build on them.

## Steps

1. Test parsed command arguments and returned structure.
2. Keep errors specific enough to act on.
3. Avoid hiding important state behind prose-only output.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
