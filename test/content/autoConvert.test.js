import { describe, it, expect, vi, beforeEach } from "vitest";
import { enableConversion, disableConversion } from "@/content/dom/walker";

global.MutationObserver = vi.fn(function () {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
});

beforeEach(async () => {
  vi.resetModules();
});

describe("auto-convert toggle behavior", () => {
  it("converts text when enableConversion is called", () => {
    document.body.innerHTML = `<p>10 cm</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion({ observer: null, textMap: map });

    expect(node.nodeValue).toMatch(/\(.+in\)/);
  });

  it("reverts text when disableConversion is called", () => {
    document.body.innerHTML = `<p>10 cm</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, "10 cm");
    node.nodeValue = "10 cm (3.94 in)";

    disableConversion({ observer: null, textMap: map });

    expect(node.nodeValue).toBe("10 cm");
  });

  it("converts CSS units from pixels to rem when enableConversion is called", () => {
    document.body.innerHTML = `<p>16px</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion({ observer: null, textMap: map }, "imperial", "rem");

    expect(node.nodeValue).toMatch(/16px\s*\(\s*1(\.00)?\s*rem\)/);
  });

  it("converts CSS units from rem to pixels when enableConversion is called", () => {
    document.body.innerHTML = `<p>2rem</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion({ observer: null, textMap: map }, "imperial", "px");

    expect(node.nodeValue).toMatch(/2rem\s*\(\s*32(\.00)?\s*px\)/);
  });

  it("reverts CSS unit conversion when disableConversion is called", () => {
    document.body.innerHTML = `<p>16px</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, "16px");
    node.nodeValue = "16px (1.00 rem)";

    disableConversion({ observer: null, textMap: map });

    expect(node.nodeValue).toBe("16px");
  });

  it("converts vh to pixels when enableConversion is called", () => {
    // Mock viewport height
    Object.defineProperty(window, "innerHeight", {
      value: 900,
      configurable: true
    });

    document.body.innerHTML = `<p>10vh</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    // cssUnitSystem = "px" so vh → px
    enableConversion({ observer: null, textMap: map }, "imperial", "px");

    // 10vh = 10% of 900px = 90px
    expect(node.nodeValue).toMatch(/10vh\s*\(\s*90(\.00)?\s*px\)/);
  });

  it("converts vw to pixels when enableConversion is called", () => {
    // Mock viewport width
    Object.defineProperty(window, "innerWidth", {
      value: 1200,
      configurable: true
    });

    document.body.innerHTML = `<p>25vw</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    // cssUnitSystem = "px" so vw → px
    enableConversion({ observer: null, textMap: map }, "imperial", "px");

    // 25vw = 25% of 1200px = 300px
    expect(node.nodeValue).toMatch(/25vw\s*\(\s*300(\.00)?\s*px\)/);
  });

  it("does not collide with length, velocity, or other unit types", () => {
    document.body.innerHTML = `
      <p>
        10 m/s  
        50 ft/s  
        3m  
        10cm  
        https://example.com/16px/image  
        m3  
        16px/s  
      </p>
    `;

    const map = new Map();
    const node = document.querySelector("p").firstChild;

    // Store original text
    map.set(node, node.nodeValue);

    // Enable conversion with cssUnitSystem = "rem"
    enableConversion({ observer: null, textMap: map }, "imperial", "rem");

    const text = node.nodeValue;

    // Should NOT convert any of these:
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*rem\)/); // no px→rem
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*px\)/);  // no rem→px
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*in\)/);  // no length conversion
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*mph\)/); // no velocity conversion

    // And ensure original text is still present
    expect(text).toContain("10 m/s");
    expect(text).toContain("50 ft/s");
    expect(text).toContain("3m");
    expect(text).toContain("10cm");
    expect(text).toContain("https://example.com/16px/image");
    expect(text).toContain("m3");
    expect(text).toContain("16px/s");
  });

  it("converts area units when enableConversion is called", () => {
    document.body.innerHTML = `<p>20 m²</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion(
      { observer: null, textMap: map },
      "imperial",
      "px",
      { convertArea: true }
    );

    expect(node.nodeValue).toMatch(/20 m²\s*\(\s*215\.28(\s*ft²)?/i);
  });

  it("converts ASCII area units when enableConversion is called", () => {
    document.body.innerHTML = `<p>5000 m2</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion(
      { observer: null, textMap: map },
      "imperial",
      "px",
      { convertArea: true }
    );

    expect(node.nodeValue).toMatch(/5000 m2\s*\(\s*53819(\.\d+)?\s*ft2\)/i);
  });

  it("reverts area conversions when disableConversion is called", () => {
    document.body.innerHTML = `<p>20 m²</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, "20 m²");
    node.nodeValue = "20 m² (215.28 ft²)";

    disableConversion({ observer: null, textMap: map });

    expect(node.nodeValue).toBe("20 m²");
  });

  it("does not collide with length, velocity, CSS, or volume units", () => {
    document.body.innerHTML = `
      <p>
        10 m/s
        50 ft/s
        3m
        10cm
        16px
        100 m³
        20 m²/s
      </p>
    `;

    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion(
      { observer: null, textMap: map },
      "imperial",
      "px",
      { convertArea: true }
    );

    const text = node.nodeValue;

    // Should NOT convert:
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*ft²\)/); // no area conversion inside composite units
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*in\)/);  // no length conversion
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*mph\)/); // no velocity conversion
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*px\)/);  // no CSS conversion
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*ft³\)/); // no volume conversion

    // Original text still present
    expect(text).toContain("10 m/s");
    expect(text).toContain("50 ft/s");
    expect(text).toContain("3m");
    expect(text).toContain("10cm");
    expect(text).toContain("16px");
    expect(text).toContain("100 m³");
    expect(text).toContain("20 m²/s");
  });

  it("converts density units when enableConversion is called", () => {
    document.body.innerHTML = `<p>1000 kg/m³</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion(
      { observer: null, textMap: map },
      "imperial",
      "px",
      { convertDensity: true }
    );

    expect(parseFloat(node.nodeValue.match(/(\d+\.\d+)/)[1])).toBeCloseTo(62.4279, 2);
  });

  it("converts ASCII density units when enableConversion is called", () => {
    document.body.innerHTML = `<p>1 g/cm3</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion(
      { observer: null, textMap: map },
      "imperial",
      "px",
      { convertDensity: true }
    );

    // 1 g/cm³ ≈ 0.036127 lb/in³
    expect(node.nodeValue).toMatch(/1 g\/cm3\s*\(\s*0\.04/i);
  });

  it("reverts density conversions when disableConversion is called", () => {
    document.body.innerHTML = `<p>1000 kg/m³</p>`;
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, "1000 kg/m³");
    node.nodeValue = "1000 kg/m³ (62.43 lb/ft³)";

    disableConversion({ observer: null, textMap: map });

    expect(node.nodeValue).toBe("1000 kg/m³");
  });

  it("does not collide with area, volume, velocity, or CSS units", () => {
    document.body.innerHTML = `
      <p>
        20 m²
        100 m³
        10 m/s
        16px
        500 cm²
        2 lb/ft³/s
        7.85 g/cm³/s
      </p>
    `;

    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion(
      { observer: null, textMap: map },
      "imperial",
      "px",
      { convertDensity: true }
    );

    const text = node.nodeValue;

    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*lb\/ft³\)/); // no composite density
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*lb\/in³\)/); // no composite density
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*ft²\)/);    // no area conversion
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*ft³\)/);    // no volume conversion
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*px\)/);     // no CSS conversion
    expect(text).not.toMatch(/\(\s*\d+(\.\d+)?\s*mph\)/);    // no velocity conversion
    expect(text).toContain("20 m²");
    expect(text).toContain("100 m³");
    expect(text).toContain("10 m/s");
    expect(text).toContain("16px");
    expect(text).toContain("500 cm²");
    expect(text).toContain("2 lb/ft³/s");
    expect(text).toContain("7.85 g/cm³/s");
  });
});
