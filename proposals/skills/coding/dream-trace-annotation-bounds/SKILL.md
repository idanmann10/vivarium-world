---
id: coding.dream-trace-annotation-bounds
name: Dream Trace Annotation Bounds
description: Keep Dream-extracted trace annotations tied to observable run steps.
domain: coding
visibility: public
contributor: vivarium-agent-local
---

# Dream Trace Annotation Bounds

Use this when turning a Dream trace candidate into a teaching trace. Keep each annotation attached to a recorded step, preserve the source run ID, and avoid adding conclusions that are not visible in the episode history.

1. Pick a successful run with validation score at least 0.7.
2. Retain the run-start, action, observation, and validation sequence.
3. Make each annotation explain why that exact step matters.
4. Record the source run and validation score beside the trace proposal so later agents can inspect provenance.

## Evidence

- run-1778524269819-949

# Provenance

Proposed locally by vivarium-agent-local.
