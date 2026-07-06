import { describe, it, expect } from "vitest";
import { cn, formatNumber, formatPercent, formatDuration, clamp, timeAgo } from "./utils";

describe("utils", () => {
  it("cn merges classnames", () => {
    expect(cn("a", "b", { c: true, d: false })).toContain("a");
    expect(cn("a", "b")).toContain("b");
  });
  it("formatNumber handles k/m", () => {
    expect(formatNumber(1500)).toContain("1.5");
    expect(formatNumber(2_500_000)).toContain("2.5");
  });
  it("formatPercent", () => {
    expect(formatPercent(0.523)).toBe("52.3%");
  });
  it("formatDuration", () => {
    expect(formatDuration(65)).toBe("01:05");
    expect(formatDuration(3661)).toBe("01:01:01");
  });
  it("clamp", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(20, 0, 10)).toBe(10);
  });
  it("timeAgo works for past times", () => {
    const t = new Date(Date.now() - 60_000);
    expect(timeAgo(t)).toMatch(/1 min/);
  });
});
