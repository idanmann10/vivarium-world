import { existsSync, readFileSync } from "node:fs";

export type TelemetryEventKind = "pull" | "use";

export interface TelemetryEvent {
  readonly artifactId: string;
  readonly kind: TelemetryEventKind;
  readonly timestamp: string;
  readonly ipHash?: string;
  readonly installId?: string;
  readonly agentId?: string;
}

export interface TelemetryAnomaly {
  readonly artifactId: string;
  readonly reason: "implausible-telemetry";
  readonly eventCount: number;
  readonly distinctSources: number;
  readonly windowMinutes: number;
}

export interface TelemetrySanityOptions {
  readonly windowMinutes?: number;
  readonly minEvents?: number;
  readonly maxDistinctSources?: number;
}

interface NormalizedTelemetryEvent {
  readonly artifactId: string;
  readonly timestampMs: number;
  readonly sourceKey: string;
}

const DEFAULT_OPTIONS = {
  windowMinutes: 60,
  minEvents: 500,
  maxDistinctSources: 5,
} as const;

function sourceKey(event: TelemetryEvent): string | undefined {
  return event.ipHash ?? event.installId ?? event.agentId;
}

function normalizeEvent(event: TelemetryEvent): NormalizedTelemetryEvent | undefined {
  const key = sourceKey(event);
  const timestampMs = Date.parse(event.timestamp);
  if (event.artifactId.trim().length === 0 || key === undefined || key.trim().length === 0 || !Number.isFinite(timestampMs)) {
    return undefined;
  }

  return { artifactId: event.artifactId, timestampMs, sourceKey: key };
}

export function detectTelemetryAnomalies(
  events: readonly TelemetryEvent[],
  options: TelemetrySanityOptions = {},
): readonly TelemetryAnomaly[] {
  const windowMinutes = options.windowMinutes ?? DEFAULT_OPTIONS.windowMinutes;
  const minEvents = options.minEvents ?? DEFAULT_OPTIONS.minEvents;
  const maxDistinctSources = options.maxDistinctSources ?? DEFAULT_OPTIONS.maxDistinctSources;
  const windowMs = windowMinutes * 60 * 1000;
  const byArtifact = new Map<string, NormalizedTelemetryEvent[]>();

  for (const event of events.filter((candidate) => candidate.kind === "pull" || candidate.kind === "use")) {
    const normalized = normalizeEvent(event);
    if (normalized === undefined) {
      continue;
    }

    const artifactEvents = byArtifact.get(normalized.artifactId) ?? [];
    artifactEvents.push(normalized);
    byArtifact.set(normalized.artifactId, artifactEvents);
  }

  const anomalies: TelemetryAnomaly[] = [];
  for (const [artifactId, artifactEvents] of byArtifact) {
    const sorted = [...artifactEvents].sort((left, right) => left.timestampMs - right.timestampMs);
    let start = 0;

    for (let end = 0; end < sorted.length; end += 1) {
      const endEvent = sorted[end];
      if (endEvent === undefined) {
        continue;
      }

      while (start < end) {
        const startEvent = sorted[start];
        if (startEvent === undefined || endEvent.timestampMs - startEvent.timestampMs <= windowMs) {
          break;
        }
        start += 1;
      }

      const windowEvents = sorted.slice(start, end + 1);
      if (windowEvents.length < minEvents) {
        continue;
      }

      const distinctSources = new Set(windowEvents.map((event) => event.sourceKey)).size;
      if (distinctSources <= maxDistinctSources) {
        anomalies.push({
          artifactId,
          reason: "implausible-telemetry",
          eventCount: windowEvents.length,
          distinctSources,
          windowMinutes,
        });
        break;
      }
    }
  }

  return anomalies;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseTelemetryEvent(value: unknown): TelemetryEvent | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (
    typeof value.artifactId !== "string" ||
    (value.kind !== "pull" && value.kind !== "use") ||
    typeof value.timestamp !== "string"
  ) {
    return undefined;
  }

  return {
    artifactId: value.artifactId,
    kind: value.kind,
    timestamp: value.timestamp,
    ...(typeof value.ipHash === "string" ? { ipHash: value.ipHash } : {}),
    ...(typeof value.installId === "string" ? { installId: value.installId } : {}),
    ...(typeof value.agentId === "string" ? { agentId: value.agentId } : {}),
  };
}

export function readTelemetryEvents(path: string): readonly TelemetryEvent[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .flatMap((line) => {
      try {
        const event = parseTelemetryEvent(JSON.parse(line));
        return event === undefined ? [] : [event];
      } catch {
        return [];
      }
    });
}

if (import.meta.main) {
  const path = process.env.WORLD_TELEMETRY_PATH ?? "telemetry/events.jsonl";
  if (!existsSync(path)) {
    console.log("No telemetry events to check.");
    process.exit(0);
  }

  const anomalies = detectTelemetryAnomalies(readTelemetryEvents(path));
  if (anomalies.length === 0) {
    console.log("Telemetry sanity check passed.");
    process.exit(0);
  }

  console.error(JSON.stringify(anomalies, null, 2));
  process.exit(1);
}
