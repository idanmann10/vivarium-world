import { relative } from "node:path";
import { readText, walkSync } from "./world-utils.js";

export interface HeldReview {
  readonly path: string;
  readonly contributor: string;
  readonly reason: "first-ten-contributions";
}

function metadataValue(text: string, key: string): string | undefined {
  return text.match(new RegExp(`^${key}:\\s*(.+)$`, "m"))?.[1]?.trim();
}

export function listHeldReviews(root = "."): readonly HeldReview[] {
  return walkSync(`${root}/proposals`)
    .filter((path) => path.endsWith(".md"))
    .flatMap((path) => {
      const text = readText(path);
      const contributor = metadataValue(text, "contributor") ?? "unknown";
      const contributions = Number(metadataValue(text, "contributor_contributions") ?? "0");
      if (contributions >= 10) {
        return [];
      }

      return [
        {
          path: relative(root, path),
          contributor,
          reason: "first-ten-contributions" as const,
        },
      ];
    });
}

if (import.meta.main) {
  console.log(JSON.stringify(listHeldReviews("."), null, 2));
}
