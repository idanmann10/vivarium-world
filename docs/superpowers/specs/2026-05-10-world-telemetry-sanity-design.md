# World Telemetry Sanity Design

## Goal

Close the local Phase 3 anti-gaming gap by making world auto-merge flag implausible pull-and-use telemetry patterns before merge.

## Scope

- Add a deterministic telemetry anomaly detector for world usage events.
- Treat the roadmap example as the default gate: at least 500 pull/use events for one artifact inside a 60-minute window from at most 5 distinct source keys.
- Count source keys from `ipHash`, `installId`, or `agentId`, in that order, so raw IP addresses are not required.
- Add a CLI script that reads newline-delimited JSON events from `telemetry/events.jsonl` when present and exits nonzero when anomalies are found.
- Add the telemetry check to the auto-merge workflow before merge enforcement.

## Non-Goals

- No live telemetry ingestion service.
- No raw IP address collection.
- No GitHub API changes.
- No change to trust-score math or validator fingerprint logic.

## Testing

World operation tests verify that 500 pull events for one skill from 5 source keys inside an hour produce a held anomaly, while the auto-merge workflow runs the telemetry check before merge enforcement.
