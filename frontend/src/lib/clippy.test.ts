import { describe, expect, it } from "vitest";
import { FALLBACK, RULES, respond } from "./clippy";

describe("respond", () => {
  it("matches a keyword case-insensitively", () => {
    expect(respond("How do I open PAINT?")).toBe(RULES[1].reply);
  });

  it("matches Indonesian keywords too", () => {
    expect(respond("mau nulis surat")).toBe(RULES[0].reply);
  });

  it("matches on substrings within a word", () => {
    expect(respond("minesweeper is hard")).toBe(RULES[3].reply);
  });

  it("returns the fallback when nothing matches", () => {
    expect(respond("zzz qqq vvv")).toBe(FALLBACK);
  });

  it("returns the first matching rule when several could match", () => {
    // 'write' (rule 0) appears before 'paint' (rule 1) in RULES order.
    expect(respond("write in paint")).toBe(RULES[0].reply);
  });

  it("handles empty input with the fallback", () => {
    expect(respond("")).toBe(FALLBACK);
  });
});

describe("RULES", () => {
  it("every rule has at least one keyword and a non-empty reply", () => {
    for (const r of RULES) {
      expect(r.keywords.length).toBeGreaterThan(0);
      expect(r.reply.length).toBeGreaterThan(0);
    }
  });

  it("keywords are all lowercase so matching is reliable", () => {
    for (const r of RULES) {
      for (const k of r.keywords) {
        expect(k).toBe(k.toLowerCase());
      }
    }
  });
});
