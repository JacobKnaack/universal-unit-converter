import { describe, it, expect } from "vitest";
import { walkAndConvert } from "@/content/dom/walker.js";
import getWindowDistance from "@/content/utility/getWindowDistance.js";

function mockElement(rect) {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => rect;
  return el;
}

function setViewport(width, height) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(window, "innerHeight", { value: height, configurable: true });
}

// The tooltip is a single shared element appended to <body> and populated
// on hover, not nested inside each .uuc-unit span (that would make its
// text part of the span's textContent). Simulate a hover to populate it.
function hoverAndGetTooltipRows(span) {
  span.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  const tooltip = document.querySelector(".uuc-tooltip");
  return Array.from(tooltip.querySelectorAll(".uuc-tooltip-row")).map((row) => ({
    value: row.querySelector(".uuc-tooltip-value").textContent,
    unit: row.querySelector(".uuc-tooltip-unit").textContent,
  }));
}

describe("getWindowDistance utility", () => {
  it("returns null when no element is provided", () => {
    expect(getWindowDistance(null)).toBeNull();
    expect(getWindowDistance(undefined)).toBeNull();
  });

  it("computes distances to each viewport edge for an element within bounds", () => {
    setViewport(1000, 800);
    const el = mockElement({ top: 100, left: 50, right: 250, bottom: 150 });

    expect(getWindowDistance(el)).toEqual({
      top: 100,
      left: 50,
      bottom: 650, // 800 - 150
      right: 750,  // 1000 - 250
    });
  });

  it("clamps left to 0 when the element starts before the left edge", () => {
    setViewport(1000, 800);
    const el = mockElement({ top: 10, left: -40, right: 100, bottom: 50 });

    expect(getWindowDistance(el).left).toBe(0);
  });

  it("clamps top to 0 when the element starts above the top edge", () => {
    setViewport(1000, 800);
    const el = mockElement({ top: -20, left: 10, right: 100, bottom: 50 });

    expect(getWindowDistance(el).top).toBe(0);
  });

  it("clamps right to 0 when the element extends past the right edge", () => {
    setViewport(1000, 800);
    const el = mockElement({ top: 10, left: 950, right: 1200, bottom: 50 });

    expect(getWindowDistance(el).right).toBe(0);
  });

  it("clamps bottom to 0 when the element extends past the bottom edge", () => {
    setViewport(1000, 800);
    const el = mockElement({ top: 10, left: 10, right: 100, bottom: 900 });

    expect(getWindowDistance(el).bottom).toBe(0);
  });

  it("returns zero distances for an element flush against every edge", () => {
    setViewport(500, 400);
    const el = mockElement({ top: 0, left: 0, right: 500, bottom: 400 });

    expect(getWindowDistance(el)).toEqual({ top: 0, left: 0, bottom: 0, right: 0 });
  });
});

describe("walkAndConvert()", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("converts length units inside text nodes", () => {
    document.body.innerHTML = `<p>The board is 10 cm long.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span).not.toBeNull();
    expect(span.textContent).toBe("10 cm");

    const rows = hoverAndGetTooltipRows(span);
    expect(rows).toHaveLength(1);
    expect(rows[0].value).toMatch(/^\d+\.\d{2}$/);
    expect(rows[0].unit).toBe("in");

    // Visible text stays unchanged — no inline parenthetical
    expect(document.body.textContent).toContain("The board is 10 cm long.");
    expect(document.body.textContent).not.toContain("(");
  });

  it("converts temperature units", () => {
    document.body.innerHTML = `<p>It is 30 C outside.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span.textContent).toBe("30 C");

    const rows = hoverAndGetTooltipRows(span);
    expect(rows[0].value).toMatch(/^\d+\.\d{2}$/);
    expect(rows[0].unit).toBe("F");
  });

  it("converts mass units", () => {
    document.body.innerHTML = `<p>The bag weighs 5 kg.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span.textContent).toBe("5 kg");

    const rows = hoverAndGetTooltipRows(span);
    expect(rows[0].value).toMatch(/^\d+\.\d{2}$/);
    expect(rows[0].unit).toBe("lb");
  });

  it("converts data size units to the binary crossover plus neighbors above and below", () => {
    document.body.innerHTML = `<p>The download is 512 KB in size.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span.textContent).toBe("512 KB");
    expect(hoverAndGetTooltipRows(span)).toEqual([
      { value: "500.00", unit: "kib" },
      { value: "512,000.00", unit: "b" },
      { value: "0.51", unit: "mb" },
    ]);
  });

  it("falls back to 3 decimal places when a conversion rounds to 0.00", () => {
    document.body.innerHTML = `<p>The video is 2.5 GB.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span.textContent).toBe("2.5 GB");
    // gb -> tb (0.0025) would round to "0.00" at 2 decimals, so it gets a 3rd
    expect(hoverAndGetTooltipRows(span)).toEqual([
      { value: "2.33", unit: "gib" },
      { value: "2,500.00", unit: "mb" },
      { value: "0.003", unit: "tb" },
    ]);
  });

  it("wraps the converted text with a purple-underline span, and hovering shows a 2-column tooltip table", () => {
    document.body.innerHTML = `<p>The board is 10 cm long.</p>`;

    walkAndConvert(document.body, undefined);

    const wrapper = document.querySelector(".uuc-text-wrapper");
    const span = wrapper.querySelector(".uuc-unit");

    // Tooltip doesn't exist until hovered — it's a shared element appended
    // to <body>, not nested inside the span (see hoverAndGetTooltipRows).
    expect(document.querySelector(".uuc-tooltip")).toBeNull();

    span.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    const tooltip = document.querySelector(".uuc-tooltip");

    expect(tooltip).not.toBeNull();
    expect(tooltip.querySelectorAll(".uuc-tooltip-row")).toHaveLength(1);
    expect(tooltip.querySelector(".uuc-tooltip-value")).not.toBeNull();
    expect(tooltip.querySelector(".uuc-tooltip-unit")).not.toBeNull();
  });

  it("does not re-wrap already-converted text on a second pass", () => {
    document.body.innerHTML = `<p>The board is 10 cm long.</p>`;

    walkAndConvert(document.body, undefined);
    walkAndConvert(document.body, undefined);

    // Exactly one wrapper/span pair, not nested or duplicated
    expect(document.querySelectorAll(".uuc-text-wrapper").length).toBe(1);
    expect(document.querySelectorAll(".uuc-unit").length).toBe(1);
    expect(document.body.textContent).toContain("The board is 10 cm long.");
  });

  it("ignores text without units", () => {
    document.body.innerHTML = `<p>Hello world</p>`;

    walkAndConvert(document.body, undefined);

    expect(document.body.textContent).toBe("Hello world");
    expect(document.querySelector(".uuc-unit")).toBeNull();
  });

  it("converts units inside newly added DOM nodes (MutationObserver simulation)", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const newNode = document.createElement("p");
    newNode.textContent = "The table is 2 m wide.";
    container.appendChild(newNode);

    walkAndConvert(container, undefined);

    const span = container.querySelector(".uuc-unit");
    expect(span.textContent).toBe("2 m");

    const rows = hoverAndGetTooltipRows(span);
    expect(rows[0].value).toMatch(/^\d+\.\d{2}$/);
    expect(rows[0].unit).toBe("ft");
  });

  it("handles multiple units in the same text node", () => {
    document.body.innerHTML = `<p>10 cm and 5 kg and 20 C</p>`;

    walkAndConvert(document.body, undefined);

    const spans = document.querySelectorAll(".uuc-unit");
    const byText = Array.from(spans).reduce((acc, s) => {
      acc[s.textContent] = hoverAndGetTooltipRows(s)[0];
      return acc;
    }, {});

    expect(byText["10 cm"].unit).toBe("in");
    expect(byText["5 kg"].unit).toBe("lb");
    expect(byText["20 C"].unit).toBe("F");

    // All three matches live inside a single wrapper for that text node
    expect(document.querySelectorAll(".uuc-text-wrapper").length).toBe(1);
  });

  it("does not convert nonsense text that only looks like it might contain units", () => {
    document.body.innerHTML = `
      <p>aisdfhuwhfkasf17834234mfwuihfq87yf</p>
      <p>123abc456def789</p>
      <p>foo99bar88baz77</p>
    `;

    walkAndConvert(document.body, undefined);

    const text = document.body.textContent;

    // Should remain EXACTLY the same — no conversions
    expect(text).toContain("aisdfhuwhfkasf17834234mfwuihfq87yf");
    expect(text).toContain("123abc456def789");
    expect(text).toContain("foo99bar88baz77");

    expect(document.querySelector(".uuc-unit")).toBeNull();
  });

  it("does not convert units or numbers inside URLs", () => {
    document.body.innerHTML = `
      <p>
        Check this link: https://example.com/path/10cm/image.png?size=20m&foo=30C
      </p>
    `;

    walkAndConvert(document.body, undefined);

    const text = document.body.textContent.trim();

    // URL should remain EXACTLY the same
    expect(text).toContain("https://example.com/path/10cm/image.png?size=20m&foo=30C");

    expect(document.querySelector(".uuc-unit")).toBeNull();
  });
});
