import { describe, expect, it } from "vitest";

import { fmtCompact, fmtEUR, fmtNum, fmtPercent } from "./index";

// nl-NL Intl outputs use a non-breaking space (U+00A0) between € and digits;
// regex tolerates whitespace shape across Node patch versions.

describe("fmtEUR", () => {
  it("formats millions with nl-NL thousands dot", () => {
    expect(fmtEUR(7_200_000)).toMatch(/€\s*7\.200\.000/);
  });

  it("formats zero", () => {
    expect(fmtEUR(0)).toMatch(/€\s*0/);
  });

  it("formats negative", () => {
    expect(fmtEUR(-450)).toMatch(/-\s*€?\s*450|€\s*-?\s*450/);
  });
});

describe("fmtNum", () => {
  it("formats with nl-NL thousands dot", () => {
    expect(fmtNum(28_400)).toBe("28.400");
  });

  it("formats zero", () => {
    expect(fmtNum(0)).toBe("0");
  });

  it("formats large number", () => {
    expect(fmtNum(1_234_567)).toBe("1.234.567");
  });
});

describe("fmtPercent", () => {
  it("formats 0.85 as 85%", () => {
    const out = fmtPercent(0.85);
    expect(out).toMatch(/85/);
    expect(out).toMatch(/%/);
  });

  it("formats 0.123 with Dutch comma decimal", () => {
    expect(fmtPercent(0.123)).toMatch(/12,3.*%/);
  });

  it("formats 1 as 100%", () => {
    expect(fmtPercent(1)).toMatch(/100.*%/);
  });
});

describe("fmtCompact", () => {
  it("formats millions as €7,2M (Dutch comma decimal)", () => {
    expect(fmtCompact(7_200_000)).toBe("€7,2M");
  });

  it("formats hundreds-of-thousands as €450K", () => {
    expect(fmtCompact(450_000)).toBe("€450K");
  });

  it("falls back to fmtEUR for sub-1K values", () => {
    expect(fmtCompact(450)).toBe(fmtEUR(450));
  });
});
