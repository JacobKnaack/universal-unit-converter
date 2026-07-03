import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert, revertAllConvertedText } from "@/content/dom/walker.js";
import { VOLUME_REGEX } from "@/content/converters/volume.js";

// The tooltip is a single shared element appended to <body> and populated
// on hover, not nested inside each .uuc-unit span, so hover each in turn.
function tooltipsByMatch() {
  const spans = document.querySelectorAll(".uuc-unit");
  return Array.from(spans).reduce((acc, s) => {
    s.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    const row = document.querySelector(".uuc-tooltip-row");
    acc[s.textContent] = {
      value: row.querySelector(".uuc-tooltip-value").textContent,
      unit: row.querySelector(".uuc-tooltip-unit").textContent,
    };
    return acc;
  }, {});
}

describe("Volume conversion", () => {
  let map;

  beforeEach(() => {
    document.body.innerHTML = `
      <p>
        The bottle holds 750 ml of water.
        The jug contains 2 liters.
        The tank volume is 1.2 m3.
        The cup has 8 fl oz of juice.
        The container holds 1 gal of fuel.
        The crate volume is 4 ft3.
      </p>
    `;
    map = new Map();
  });

  it("converts metric → imperial volume units", () => {
    walkAndConvert(document.body, map);

    const byMatch = tooltipsByMatch();

    expect(byMatch["750 ml"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["750 ml"].unit).toBe("fl oz");
    expect(byMatch["2 liters"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["2 liters"].unit).toBe("gal");
    expect(byMatch["1.2 m3"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["1.2 m3"].unit).toBe("ft³");
  });

  it("converts imperial → metric volume units", () => {
    walkAndConvert(document.body, map);

    const byMatch = tooltipsByMatch();

    expect(byMatch["8 fl oz"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["8 fl oz"].unit).toBe("ml");
    expect(byMatch["1 gal"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["1 gal"].unit).toBe("l");
    expect(byMatch["4 ft3"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["4 ft3"].unit).toBe("m³");
  });

  it("stores original text in the map", () => {
    walkAndConvert(document.body, map);

    const wrapper = document.querySelector(".uuc-text-wrapper");
    expect(map.has(wrapper)).toBe(true);
    expect(map.get(wrapper)).toContain("750 ml");
  });

  it("reverts converted volume text back to original", () => {
    walkAndConvert(document.body, map);
    revertAllConvertedText(map);

    const text = document.body.textContent;

    expect(text).toContain("750 ml");
    expect(text).toContain("2 liters");
    expect(text).toContain("1.2 m3");
    expect(text).toContain("8 fl oz");
    expect(text).toContain("1 gal");
    expect(text).toContain("4 ft3");

    // No leftover wrapper/tooltip spans
    expect(document.querySelector(".uuc-unit")).toBeNull();
    expect(document.querySelector(".uuc-text-wrapper")).toBeNull();
  });

  it("converts word-based numbers, leaving the original wording as the visible text", () => {
    document.body.innerHTML = `<p>The tank holds one gallon of fuel.</p>`;

    walkAndConvert(document.body, map);

    const span = document.querySelector(".uuc-unit");
    expect(span.textContent).toBe("one gallon");

    const byMatch = tooltipsByMatch();
    expect(byMatch["one gallon"].unit).toBe("l");
    expect(parseFloat(byMatch["one gallon"].value)).toBeCloseTo(3.79, 1);
  });
});
