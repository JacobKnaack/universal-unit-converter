import { describe, it, expect } from "vitest";
import {
  CSS_UNIT_REGEX,
  convertCssUnits
} from "@/content/converters/css.js";

// Helper to reset regex state (because /g)
function reset(re) {
  re.lastIndex = 0;
}

describe("CSS unit converter", () => {

  it("regex matches all supported CSS units", () => {
    const samples = [
      "16px",
      "1.5rem",
      "2em",
      "50vh",
      "25vw"
    ];

    for (const s of samples) {
      reset(CSS_UNIT_REGEX);
      expect(CSS_UNIT_REGEX.test(s)).toBe(true);
    }
  });

  it("does not match inside URLs or composite units", () => {
    const badSamples = [
      "https://example.com/16px/image",
      "10 m/s",
      "50 ft/s",
      "m3",
      "16px/s"
    ];

    for (const s of badSamples) {
      reset(CSS_UNIT_REGEX);
      expect(CSS_UNIT_REGEX.test(s)).toBe(false);
    }
  });

  /* -----------------------------
     BASIC PX ↔ REM/EM
  ----------------------------- */

  it("converts px → rem", () => {
    const out = convertCssUnits(16, "px", "rem");
    expect(out.value).toBeCloseTo(1);
    expect(out.unit).toBe("rem");
  });

  it("converts px → em", () => {
    const out = convertCssUnits(24, "px", "em");
    expect(out.value).toBeCloseTo(1.5);
    expect(out.unit).toBe("em");
  });

  it("converts rem → px", () => {
    const out = convertCssUnits(2, "rem", "px");
    expect(out.value).toBe(32);
    expect(out.unit).toBe("px");
  });

  it("converts em → px", () => {
    const out = convertCssUnits(1.25, "em", "px");
    expect(out.value).toBeCloseTo(20);
    expect(out.unit).toBe("px");
  });

  /* -----------------------------
     REM ↔ EM (same math)
  ----------------------------- */

  it("converts rem → em", () => {
    const out = convertCssUnits(2, "rem", "em");
    expect(out.value).toBeCloseTo(2);
    expect(out.unit).toBe("em");
  });

  it("converts em → rem", () => {
    const out = convertCssUnits(3, "em", "rem");
    expect(out.value).toBeCloseTo(3);
    expect(out.unit).toBe("rem");
  });

  /* -----------------------------
     VIEWPORT → PX
  ----------------------------- */

  it("converts vh → px using viewport height", () => {
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });

    const out = convertCssUnits(10, "vh", "px");
    expect(out.value).toBe(100);
    expect(out.unit).toBe("px");
  });

  it("converts vw → px using viewport width", () => {
    Object.defineProperty(window, "innerWidth", { value: 1200, configurable: true });

    const out = convertCssUnits(25, "vw", "px");
    expect(out.value).toBe(300);
    expect(out.unit).toBe("px");
  });

  /* -----------------------------
     PX → VIEWPORT
  ----------------------------- */

  it("converts px → vh", () => {
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });

    const out = convertCssUnits(200, "px", "vh");
    expect(out.value).toBeCloseTo(20);
    expect(out.unit).toBe("vh");
  });

  it("converts px → vw", () => {
    Object.defineProperty(window, "innerWidth", { value: 800, configurable: true });

    const out = convertCssUnits(80, "px", "vw");
    expect(out.value).toBeCloseTo(10);
    expect(out.unit).toBe("vw");
  });

  /* -----------------------------
     VIEWPORT ↔ VIEWPORT
  ----------------------------- */

  it("converts vh → vw", () => {
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 500, configurable: true });

    // 10vh = 100px → 100px = 20vw
    const out = convertCssUnits(10, "vh", "vw");
    expect(out.value).toBeCloseTo(20);
    expect(out.unit).toBe("vw");
  });

  it("converts vw → vh", () => {
    Object.defineProperty(window, "innerHeight", { value: 900, configurable: true });
    Object.defineProperty(window, "innerWidth", { value: 450, configurable: true });

    // 10vw = 45px → 45px = 5vh
    const out = convertCssUnits(10, "vw", "vh");
    expect(out.value).toBeCloseTo(5);
    expect(out.unit).toBe("vh");
  });

  /* -----------------------------
     IDENTITY CONVERSION
  ----------------------------- */

  it("returns same value/unit when fromUnit === toUnit", () => {
    const out = convertCssUnits(12, "px", "px");
    expect(out.value).toBe(12);
    expect(out.unit).toBe("px");
  });

  /* -----------------------------
     UNSUPPORTED
  ----------------------------- */

  it("returns null for unsupported units", () => {
    const out = convertCssUnits(10, "foobar", "px");
    expect(out).toBeNull();
  });
});
