import { describe, expect, test } from "bun:test";

import { assertMinimums, countWorld } from "./world-utils.js";

describe("world seed content", () => {
  test("covers every Phase 0 primitive type", () => {
    const summary = countWorld(".");
    expect(assertMinimums(summary)).toEqual([]);
  });
});
