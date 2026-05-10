import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function isoWeek(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-${String(week).padStart(2, "0")}`;
}

function weekLabel(week: string): string {
  const [year, number] = week.split("-");
  return `${year}-W${number}`;
}

function featuredItems(markdown: string): readonly string[] {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .filter((line) => line.length > 0);
}

export function archiveFeaturedWeek(root = ".", week = isoWeek(new Date())): string {
  const currentPath = join(root, "featured", "current.md");
  if (!existsSync(currentPath)) {
    throw new Error("featured/current.md is missing");
  }

  const archivePath = join(root, "featured", "archive", `${week}.md`);
  const items = featuredItems(readFileSync(currentPath, "utf8"));
  const body = [`# Featured Archive ${weekLabel(week)}`, "", ...(items.length === 0 ? ["No featured picks recorded."] : items.map((item) => `- ${item}`))].join(
    "\n",
  );

  mkdirSync(dirname(archivePath), { recursive: true });
  writeFileSync(archivePath, `${body}\n`, "utf8");
  return `featured/archive/${week}.md`;
}

if (import.meta.main) {
  const week = process.env.WORLD_FEATURED_WEEK ?? isoWeek(new Date());
  console.log(`archived ${archiveFeaturedWeek(".", week)}`);
}
