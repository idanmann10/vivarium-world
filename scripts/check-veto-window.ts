export interface MaintainerVetoInput {
  readonly createdAt?: string;
  readonly now?: Date;
  readonly labels?: readonly string[];
  readonly windowHours?: number;
}

export interface MaintainerVetoResult {
  readonly allowed: boolean;
  readonly reason?: "maintainer-veto-window-open" | "maintainer-veto-label";
  readonly ageHours?: number;
  readonly windowHours: number;
}

const DEFAULT_WINDOW_HOURS = 48;
const VETO_LABEL = "maintainer-veto";

function normalizedLabels(labels: readonly string[]): ReadonlySet<string> {
  return new Set(labels.map((label) => label.trim().toLowerCase()).filter((label) => label.length > 0));
}

function ageHours(createdAt: string, now: Date): number | undefined {
  const createdMs = Date.parse(createdAt);
  if (!Number.isFinite(createdMs)) {
    return undefined;
  }

  return Math.max(0, Math.floor((now.getTime() - createdMs) / (60 * 60 * 1000)));
}

export function evaluateMaintainerVetoWindow(input: MaintainerVetoInput): MaintainerVetoResult {
  const windowHours = input.windowHours ?? DEFAULT_WINDOW_HOURS;
  const labels = normalizedLabels(input.labels ?? []);
  const createdAt = input.createdAt?.trim();
  const age = createdAt === undefined || createdAt.length === 0 ? undefined : ageHours(createdAt, input.now ?? new Date());

  if (labels.has(VETO_LABEL)) {
    return {
      allowed: false,
      reason: "maintainer-veto-label",
      ...(age === undefined ? {} : { ageHours: age }),
      windowHours,
    };
  }

  if (age === undefined) {
    return { allowed: true, windowHours };
  }

  if (age < windowHours) {
    return { allowed: false, reason: "maintainer-veto-window-open", ageHours: age, windowHours };
  }

  return { allowed: true, ageHours: age, windowHours };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function labelsFromJson(value: string | undefined): readonly string[] {
  if (value === undefined || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((item) => {
      if (typeof item === "string") {
        return [item];
      }

      if (isRecord(item) && typeof item.name === "string") {
        return [item.name];
      }

      return [];
    });
  } catch {
    return value.split(",").map((label) => label.trim());
  }
}

if (import.meta.main) {
  const windowHoursValue = process.env.WORLD_VETO_WINDOW_HOURS;
  const parsedWindowHours = windowHoursValue === undefined ? DEFAULT_WINDOW_HOURS : Number(windowHoursValue);
  const windowHours = Number.isFinite(parsedWindowHours) && parsedWindowHours > 0 ? parsedWindowHours : DEFAULT_WINDOW_HOURS;
  const now = process.env.WORLD_VETO_NOW === undefined ? new Date() : new Date(process.env.WORLD_VETO_NOW);
  const createdAt = process.env.WORLD_PR_CREATED_AT;
  const result = evaluateMaintainerVetoWindow({
    ...(createdAt === undefined ? {} : { createdAt }),
    now,
    labels: labelsFromJson(process.env.WORLD_PR_LABELS_JSON),
    windowHours,
  });

  if (result.allowed) {
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
