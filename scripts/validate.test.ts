import { describe, expect, test } from "bun:test";

import { assertCodingStarterPack, assertMinimums, countDomainStarterPack, countWorld } from "./world-utils.js";

describe("world seed content", () => {
  test("covers every Phase 0 primitive type", () => {
    const summary = countWorld(".");
    expect(assertMinimums(summary)).toEqual([]);
  });

  test("coding domain has v1 starter pack depth", () => {
    const summary = countDomainStarterPack(".", "coding");
    expect(assertCodingStarterPack(summary)).toEqual([]);
  });
});
