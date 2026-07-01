import { describe, it, expect, vi, beforeEach } from "vitest";
import { enableConversion, disableConversion } from "@/content/dom/walker";

global.MutationObserver = vi.fn(function () {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
});

beforeEach(async () => {
  vi.resetModules();
});

function unitSpan() {
  return document.querySelector(".uuc-unit");
}

// The tooltip is a single shared element appended to <body> and populated
// on hover, not nested inside each .uuc-unit span.
function firstTooltipRow(span) {
  span.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  const row = document.querySelector(".uuc-tooltip-row");
  return {
    value: row.querySelector(".uuc-tooltip-value").textContent,
    unit: row.querySelector(".uuc-tooltip-unit").textContent,
  };
}

describe("auto-convert toggle behavior", () => {
  it("converts text when enableConversion is called", () => {
    document.body.innerHTML = `<p>10 cm</p>`;
    const map = new Map();

    enableConversion({ observer: null, textMap: map });

    const span = unitSpan();
    expect(span).not.toBeNull();
    expect(span.textContent).toBe("10 cm");
    expect(firstTooltipRow(span).unit).toBe("in");
  });

  it("reverts text when disableConversion is called", () => {
    document.body.innerHTML = `<p>10 cm</p>`;
    const map = new Map();

    enableConversion({ observer: null, textMap: map });
    disableConversion({ observer: null, textMap: map });

    expect(document.querySelector("p").textContent).toBe("10 cm");
    expect(unitSpan()).toBeNull();
  });

  it("converts CSS units from pixels to rem when enableConversion is called", () => {
    document.body.innerHTML = `<p>16px</p>`;
    const map = new Map();

    enableConversion({ observer: null, textMap: map });

    const span = unitSpan();
    expect(span.textContent).toBe("16px");
    const row = firstTooltipRow(span);
    expect(row.value).toMatch(/^1(\.00)?$/);
    expect(row.unit).toBe("rem");
  });

  it("converts CSS units from rem to pixels when enableConversion is called", () => {
    document.body.innerHTML = `<p>2rem</p>`;
    const map = new Map();

    enableConversion({ observer: null, textMap: map });

    const span = unitSpan();
    expect(span.textContent).toBe("2rem");
    const row = firstTooltipRow(span);
    expect(row.value).toMatch(/^32(\.00)?$/);
    expect(row.unit).toBe("px");
  });

  it("reverts CSS unit conversion when disableConversion is called", () => {
    document.body.innerHTML = `<p>16px</p>`;
    const map = new Map();

    enableConversion({ observer: null, textMap: map });
    disableConversion({ observer: null, textMap: map });

    expect(document.querySelector("p").textContent).toBe("16px");
    expect(unitSpan()).toBeNull();
  });

  it("converts vh to pixels when enableConversion is called", () => {
    // Mock viewport height
    Object.defineProperty(window, "innerHeight", {
      value: 900,
      configurable: true
    });

    document.body.innerHTML = `<p>10vh</p>`;
    const map = new Map();

    // cssUnitSystem = "px" so vh → px
    enableConversion({ observer: null, textMap: map });

    // 10vh = 10% of 900px = 90px
    const span = unitSpan();
    expect(span.textContent).toBe("10vh");
    const row = firstTooltipRow(span);
    expect(row.value).toMatch(/^90(\.00)?$/);
    expect(row.unit).toBe("px");
  });

  it("converts vw to pixels when enableConversion is called", () => {
    // Mock viewport width
    Object.defineProperty(window, "innerWidth", {
      value: 1200,
      configurable: true
    });

    document.body.innerHTML = `<p>25vw</p>`;
    const map = new Map();

    // cssUnitSystem = "px" so vw → px
    enableConversion({ observer: null, textMap: map });

    // 25vw = 25% of 1200px = 300px
    const span = unitSpan();
    expect(span.textContent).toBe("25vw");
    const row = firstTooltipRow(span);
    expect(row.value).toMatch(/^300(\.00)?$/);
    expect(row.unit).toBe("px");
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

    // Enable conversion with an unrecognized category key — nothing should convert
    enableConversion({ observer: null, textMap: map }, { convertCSSUnit: true });

    const text = node.nodeValue;

    expect(unitSpan()).toBeNull();

    // Original text is still present, untouched
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

    enableConversion(
      { observer: null, textMap: map },
      { convertArea: true }
    );

    const span = unitSpan();
    expect(span.textContent).toBe("20 m²");
    const { value, unit } = firstTooltipRow(span);
    expect(parseFloat(value)).toBeCloseTo(215.28, 1);
    expect(unit).toMatch(/ft2/i);
  });

  it("converts ASCII area units when enableConversion is called", () => {
    document.body.innerHTML = `<p>5000 m2</p>`;
    const map = new Map();

    enableConversion(
      { observer: null, textMap: map },
      { convertArea: true }
    );

    const span = unitSpan();
    expect(span.textContent).toBe("5000 m2");
    const { value, unit } = firstTooltipRow(span);
    expect(parseFloat(value.replace(/,/g, ""))).toBeCloseTo(53819.55, 1);
    expect(unit).toMatch(/ft2/i);
  });

  it("reverts area conversions when disableConversion is called", () => {
    document.body.innerHTML = `<p>20 m²</p>`;
    const map = new Map();

    enableConversion(
      { observer: null, textMap: map },
      { convertArea: true }
    );
    disableConversion({ observer: null, textMap: map });

    expect(document.querySelector("p").textContent).toBe("20 m²");
    expect(unitSpan()).toBeNull();
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

    enableConversion(
      { observer: null, textMap: map },
      { convertArea: true }
    );

    const text = node.nodeValue;

    expect(unitSpan()).toBeNull();

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

    enableConversion(
      { observer: null, textMap: map },
      { convertDensity: true }
    );

    const span = unitSpan();
    const { value } = firstTooltipRow(span);
    expect(parseFloat(value)).toBeCloseTo(62.4279, 2);
  });

  it("converts ASCII density units when enableConversion is called", () => {
    document.body.innerHTML = `<p>1 g/cm3</p>`;
    const map = new Map();

    enableConversion(
      { observer: null, textMap: map },
      { convertDensity: true }
    );

    // 1 g/cm³ ≈ 0.036127 lb/in³
    const span = unitSpan();
    expect(span.textContent).toBe("1 g/cm3");
    expect(firstTooltipRow(span).value).toMatch(/^0\.04/);
  });

  it("reverts density conversions when disableConversion is called", () => {
    document.body.innerHTML = `<p>1000 kg/m³</p>`;
    const map = new Map();

    enableConversion(
      { observer: null, textMap: map },
      { convertDensity: true }
    );
    disableConversion({ observer: null, textMap: map });

    expect(document.querySelector("p").textContent).toBe("1000 kg/m³");
    expect(unitSpan()).toBeNull();
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

    enableConversion(
      { observer: null, textMap: map },
      { convertDensity: true }
    );

    const text = node.nodeValue;

    expect(unitSpan()).toBeNull();

    expect(text).toContain("20 m²");
    expect(text).toContain("100 m³");
    expect(text).toContain("10 m/s");
    expect(text).toContain("16px");
    expect(text).toContain("500 cm²");
    expect(text).toContain("2 lb/ft³/s");
    expect(text).toContain("7.85 g/cm³/s");
  });
});
