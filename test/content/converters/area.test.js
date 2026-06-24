import { describe, it, expect } from "vitest";
import { convertArea, NORMALIZE_AREA_UNIT, AREA_REGEX } from "@/content/converters/area.js";

//
// -----------------------------
// AREA CONVERSION TESTS
// -----------------------------
//

describe("Area conversion", () => {
  it("converts metric → imperial", () => {
    // 1 m² → ft²
    const r1 = convertArea(1, "m²", "ft²");
    expect(r1.value).toBeCloseTo(10.7639, 4);
    expect(r1.unit).toBe("ft²");

    // 100 cm² → in²
    const r2 = convertArea(100, "cm²", "in²");
    expect(r2.value).toBeCloseTo(15.500, 3);

    // 1 km² → mi²
    const r3 = convertArea(1, "km²", "mi²");
    expect(r3.value).toBeCloseTo(0.386102, 6);
  });

  it("converts imperial → metric", () => {
    // 100 ft² → m²
    const r1 = convertArea(100, "ft²", "m²");
    expect(r1.value).toBeCloseTo(9.2903, 4);

    // 10 in² → cm²
    const r2 = convertArea(10, "in²", "cm²");
    expect(r2.value).toBeCloseTo(64.516, 3);

    // 1 mi² → km²
    const r3 = convertArea(1, "mi²", "km²");
    expect(r3.value).toBeCloseTo(2.58999, 5);
  });

  it("supports ASCII fallbacks (m2, ft2, etc.)", () => {
    const r1 = convertArea(1, "m2", "ft2");
    expect(r1.value).toBeCloseTo(10.7639, 4);

    const r2 = convertArea(100, "ft2", "m2");
    expect(r2.value).toBeCloseTo(9.2903, 4);
  });

  it("returns null for unsupported units", () => {
    expect(convertArea(10, "banana", "m²")).toBeNull();
    expect(convertArea(10, "m²", "pizza")).toBeNull();
  });
});


//
// -----------------------------
// AREA NORMALIZATION TESTS
// -----------------------------
//

describe("Area normalization", () => {
  it("normalizes unicode superscript units", () => {
    expect(NORMALIZE_AREA_UNIT["m²"]).toBe("m2");
    expect(NORMALIZE_AREA_UNIT["ft²"]).toBe("ft2");
    expect(NORMALIZE_AREA_UNIT["km²"]).toBe("km2");
  });

  it("normalizes ASCII units", () => {
    expect(NORMALIZE_AREA_UNIT["m2"]).toBe("m2");
    expect(NORMALIZE_AREA_UNIT["ft2"]).toBe("ft2");
  });
});


//
// -----------------------------
// AREA REGEX TESTS
// -----------------------------
//

describe("Area regex", () => {
  it("matches valid area expressions", () => {
    const text = `
      The room is 20 m².
      The field is 5000 m2.
      The lot is 100 ft².
      The park is 2 mi2.
    `;

    const matches = [...text.matchAll(AREA_REGEX)].map(m => m[0]);

    expect(matches).toContain("20 m²");
    expect(matches).toContain("5000 m2");
    expect(matches).toContain("100 ft²");
    expect(matches).toContain("2 mi2");
  });

  it("does NOT match length units", () => {
    const text = `
      The board is 10 m long.
      The rope is 50 ft.
    `;

    const matches = [...text.matchAll(AREA_REGEX)];
    expect(matches.length).toBe(0);
  });

  it("does NOT match velocity units", () => {
    const text = `
      The runner hit 10 m/s.
      The car was going 60 mph.
      The arrow flew at 50 ft/s.
    `;

    const matches = [...text.matchAll(AREA_REGEX)];
    expect(matches.length).toBe(0);
  });

  it("does NOT match volume units", () => {
    const text = `
      The tank holds 100 m³.
      The bottle has 500 ml.
    `;

    const matches = [...text.matchAll(AREA_REGEX)];
    expect(matches.length).toBe(0);
  });

  it("does NOT match area inside composite units (m²/s)", () => {
    const text = `
      The diffusion rate is 10 m²/s.
    `;

    const matches = [...text.matchAll(AREA_REGEX)];
    expect(matches.length).toBe(0);
  });
});
