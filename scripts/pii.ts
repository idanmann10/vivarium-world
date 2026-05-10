const possiblePiiPatterns = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /Bearer\s+[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*/,
] as const;

export function hasPossiblePii(text: string): boolean {
  return possiblePiiPatterns.some((pattern) => pattern.test(text));
}
