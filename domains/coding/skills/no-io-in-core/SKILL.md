---
id: coding.no-io-in-core
name: No I/O In Core
description: Keep pure core packages free of filesystem, network, and process effects.
kind: prompt
domains: [coding]
status: promoted
visibility: public
version: 1
---

# No I/O In Core

If code reads files, calls APIs, shells out, or touches time, place it outside core and inject the result.

## Steps

1. Identify the reusable situation.
2. Apply the behavior with local evidence.
3. Record whether it helped.

# Provenance

Seeded during Phase 0 from goal.md. Inspired by: local roadmap.
