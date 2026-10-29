import { describe, expect, it } from "vitest";

import { calculateImpactScore } from "@/lib/cricket/impact-score";

describe("calculateImpactScore", () => {
  it("applies the batsman run multiplier", () => {
    const score = calculateImpactScore({
      role: "BATSMAN",
      totalRuns: 100,
      totalWickets: 0,
      matchesPlayed: 10,
    });

    expect(score).toBe(156);
  });

  it("applies the bowler wicket multiplier and rookie penalty", () => {
    const score = calculateImpactScore({
      role: "BOWLER",
      totalRuns: 0,
      totalWickets: 10,
      matchesPlayed: 0,
    });

    expect(score).toBe(250);
  });

  it("gives a wicketkeeper the flat bonus without bowler multiplier", () => {
    const score = calculateImpactScore({
      role: "WICKETKEEPER",
      totalRuns: 100,
      totalWickets: 10,
      matchesPlayed: 10,
    });

    expect(score).toBe(350);
  });

  it("applies the veteran bonus after more than 20 matches", () => {
    const score = calculateImpactScore({
      role: "ALL_ROUNDER",
      totalRuns: 100,
      totalWickets: 10,
      matchesPlayed: 25,
    });

    expect(score).toBe(420);
  });
});