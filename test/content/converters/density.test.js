import { describe, it, expect } from "vitest";
import {
  convertDensity,
  NORMALIZE_DENSITY_UNIT,
  DENSITY_REGEX
} from "@/content/converters/density.js";

describe('Density Conversion', () => {
  it('converts metric to imperial', () => {
    // 1000 kg/m³ → lb/ft³
    // Water density: ~62.42796 lb/ft³
    const r1 = convertDensity(1000, "kg/m³", "lb/ft³");
    expect(r1.value).toBeCloseTo(62.42796, 4);
    expect(r1.unit).toBe("lb/ft³");

    // 1 g/cm³ → lb/in³
    // 1 g/cm³ = 0.036127 lb/in³
    const r2 = convertDensity(1, "g/cm³", "lb/in³");
    expect(r2.value).toBeCloseTo(0.036127, 5);
  });
  it("converts imperial to metric", () => {
    // 62.42796 lb/ft³ → kg/m³
    const r1 = convertDensity(62.42796, "lb/ft³", "kg/m³");
    expect(r1.value).toBeCloseTo(1000, 1);

    // 0.036127 lb/in³ → g/cm³
    const r2 = convertDensity(0.036127, "lb/in³", "g/cm³");
    expect(r2.value).toBeCloseTo(1, 3);
  });
    it("supports ASCII fallbacks", () => {
    const r1 = convertDensity(1000, "kg/m3", "lb/ft3");
    expect(r1.value).toBeCloseTo(62.42796, 4);

    const r2 = convertDensity(1, "g/cm3", "lb/in3");
    expect(r2.value).toBeCloseTo(0.036127, 5);
  });
  it("returns null for unsupported units", () => {
    expect(convertDensity(10, "banana", "kg/m³")).toBeNull();
    expect(convertDensity(10, "kg/m³", "pizza")).toBeNull();
  });
});

describe("Density normalization", () => {
  it("normalizes metric units", () => {
    expect(NORMALIZE_DENSITY_UNIT["kg/m³"]).toBe("kg_m3");
    expect(NORMALIZE_DENSITY_UNIT["kg/m3"]).toBe("kg_m3");
    expect(NORMALIZE_DENSITY_UNIT["g/cm³"]).toBe("g_cm3");
    expect(NORMALIZE_DENSITY_UNIT["g/cm3"]).toBe("g_cm3");
    expect(NORMALIZE_DENSITY_UNIT["g/mL"]).toBe("g_cm3");
  });

  it("normalizes imperial units", () => {
    expect(NORMALIZE_DENSITY_UNIT["lb/ft³"]).toBe("lb_ft3");
    expect(NORMALIZE_DENSITY_UNIT["lb/ft3"]).toBe("lb_ft3");
    expect(NORMALIZE_DENSITY_UNIT["lb/in³"]).toBe("lb_in3");
    expect(NORMALIZE_DENSITY_UNIT["lb/in3"]).toBe("lb_in3");
  });
});

describe('Density Regex', () => {
  it('Matches valid density expressions', () => {
    const text = `
      Water: 1000 kg/m³
      Steel: 7.85 g/cm³
      Oil: 0.9 g/mL
      Foam: 2 lb/ft³
      Lead: 0.41 lb/in³
    `;

    const matches = [...text.matchAll(DENSITY_REGEX)].map(m => m[0]);

    expect(matches).toContain("1000 kg/m³");
    expect(matches).toContain("7.85 g/cm³");
    expect(matches).toContain("0.9 g/mL");
    expect(matches).toContain("2 lb/ft³");
    expect(matches).toContain("0.41 lb/in³");
  });
  it("does NOT match area units", () => {
    const text = `
      20 m²
      500 cm²
    `;
    expect([...text.matchAll(DENSITY_REGEX)].length).toBe(0);
  });
  it("does NOT match volume units", () => {
    const text = `
      100 m³
      500 ml
    `;
    expect([...text.matchAll(DENSITY_REGEX)].length).toBe(0);
  });
  it("does NOT match composite units like kg/m³/s", () => {
    const text = `
      1000 kg/m³/s
      7.85 g/cm³/s
    `;
    expect([...text.matchAll(DENSITY_REGEX)].length).toBe(0);
  });
  it("does NOT match malformed density units", () => {
    const text = `
      1000 kg/m
      7.85 g/cm
      2 lb/ft
    `;
    expect([...text.matchAll(DENSITY_REGEX)].length).toBe(0);
  });
});
