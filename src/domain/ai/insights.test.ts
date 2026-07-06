import { describe, it, expect } from "vitest";
import { heuristicInsights, type PlayerInsightInput } from "./insights";

const base: PlayerInsightInput = {
  puuid: "p",
  gameName: "Tester",
  games: 0,
  wins: 0,
  losses: 0,
  avgKda: 0,
  avgCsPerMin: 0,
  avgVisionScore: 0,
  avgGoldPerMin: 0,
  championStats: [],
  recentTrend: [],
};

describe("heuristicInsights", () => {
  it("returns bounded score with no data", () => {
    const out = heuristicInsights(base);
    expect(out.score).toBeGreaterThanOrEqual(0);
    expect(out.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(out.bullets)).toBe(true);
    expect(out.summary.length).toBeGreaterThan(0);
  });

  it("gives high score for strong stats", () => {
    const out = heuristicInsights({
      ...base,
      games: 100,
      wins: 70,
      losses: 30,
      avgKda: 4.5,
      avgCsPerMin: 8.2,
      avgVisionScore: 35,
    });
    expect(out.score).toBeGreaterThan(50);
  });
});
