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
      "10 m/s",     // should not match "m"
      "50 ft/s",    // should not match "ft"
      "m3",         // should not match "m"
      "16px/s"      // should not match "px"
    ];

    for (const s of badSamples) {
      reset(CSS_UNIT_REGEX);
      expect(CSS_UNIT_REGEX.test(s)).toBe(false);
    }
  });

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

  it("converts vh → px using viewport height", () => {
    // Mock viewport height
    Object.defineProperty(window, "innerHeight", { value: 1000 });

    const out = convertCssUnits(10, "vh", "px");
    expect(out.value).toBe(100); // 10% of 1000
    expect(out.unit).toBe("px");
  });

  it("converts vw → px using viewport width", () => {
    // Mock viewport width
    Object.defineProperty(window, "innerWidth", { value: 1200 });

    const out = convertCssUnits(25, "vw", "px");
    expect(out.value).toBe(300); // 25% of 1200
    expect(out.unit).toBe("px");
  });

  it("returns null for unsupported units", () => {
    const out = convertCssUnits(10, "foobar", "px");
    expect(out).toBeNull();
  });
});
