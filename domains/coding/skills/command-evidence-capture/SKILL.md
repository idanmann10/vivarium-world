---
id: coding.command-evidence-capture
name: Command Evidence Capture
description: Capture exact command evidence before claiming a coding gate passed.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# Command Evidence Capture

Use exact command output as the record for coding claims. Prefer the smallest command that proves the claim, then run the broader gate before release.

## Steps

1. Name the claim that needs evidence.
2. Run the command that directly proves it.
3. Record the command, pass count or exit status, and any relevant warning.

# Provenance

Seeded during v1 starter-pack expansion from goal.md. Inspired by: https://github.com/obra/superpowers and https://github.com/garrytan/gstack.
