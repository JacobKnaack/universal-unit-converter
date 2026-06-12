import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert, revertAllConvertedText } from "@/content/dom/walker.js";
import { VELOCITY_REGEX } from "@/content/converters/velocity.js";

describe("Speed conversion", () => {
  let map;

  beforeEach(() => {
    document.body.innerHTML = `
      <p>
        The runner reached 10 m/s.
        The car was traveling at 100 km/h.
        The athlete sprinted at 12 mps.
        The wind speed was 30 mph.
        The arrow flew at 50 ft/s.
        The drone moved at 40 fps.
      </p>
    `;
    map = new Map();
  });

  it("converts metric → imperial speed units", () => {
    walkAndConvert(document.body, map, "imperial");

    const text = document.body.textContent;

    // m/s → mph
    expect(text).toMatch(/10 m\/s \(\d+(\.\d+)? mph\)/);

    // km/h → mph
    expect(text).toMatch(/100 km\/h \(\d+(\.\d+)? mph\)/);

    // mps → mph (ASCII fallback)
    expect(text).toMatch(/12 mps \(\d+(\.\d+)? mph\)/);
  });

  it("converts imperial → metric speed units", () => {
    walkAndConvert(document.body, map, "metric");

    const text = document.body.textContent;

    // mph → km/h
    expect(text).toMatch(/30 mph \(\d+(\.\d+)? km\/h\)/);

    // ft/s → m/s
    expect(text).toMatch(/50 ft\/s \(\d+(\.\d+)? m\/s\)/);

    // fps → m/s (ASCII fallback)
    expect(text).toMatch(/40 fps \(\d+(\.\d+)? m\/s\)/);
  });

  it("stores original text in the map", () => {
    walkAndConvert(document.body, map, "imperial");

    const node = document.querySelector("p").firstChild;
    expect(map.has(node)).toBe(true);
  });

  it("reverts converted speed text back to original", () => {
    walkAndConvert(document.body, map, "imperial");
    revertAllConvertedText(map);

    const text = document.body.textContent;

    expect(text).toContain("10 m/s");
    expect(text).toContain("100 km/h");
    expect(text).toContain("12 mps");
    expect(text).toContain("30 mph");
    expect(text).toContain("50 ft/s");
    expect(text).toContain("40 fps");

    // Ensure no converted parentheses remain
    expect(text.includes("(")).toBe(false);
  });

  it("regex matches all supported speed units", () => {
    const samples = [
      "10 m/s",
      "12 mps",
      "100 km/h",
      "90 kph",
      "30 mph",
      "50 ft/s",
      "40 fps"
    ];

    const re = new RegExp(VELOCITY_REGEX.source, "i");

    for (const s of samples) {
    expect(re.test(s)).toBe(true);
    }
  });
});