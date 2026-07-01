import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert, revertAllConvertedText } from "@/content/dom/walker.js";
import { VOLUME_REGEX } from "@/content/converters/volume.js";

function tooltipsByMatch() {
  const spans = document.querySelectorAll(".uuc-unit");
  return Array.from(spans).reduce((acc, s) => {
    acc[s.textContent] = s.dataset.tooltip;
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

    expect(byMatch["750 ml"]).toMatch(/^\d+(\.\d+)? fl oz$/);
    expect(byMatch["2 liters"]).toMatch(/^\d+(\.\d+)? gal$/);
    expect(byMatch["1.2 m3"]).toMatch(/^\d+(\.\d+)? ft³$/);
  });

  it("converts imperial → metric volume units", () => {
    walkAndConvert(document.body, map);

    const byMatch = tooltipsByMatch();

    expect(byMatch["8 fl oz"]).toMatch(/^\d+(\.\d+)? ml$/);
    expect(byMatch["1 gal"]).toMatch(/^\d+(\.\d+)? l$/);
    expect(byMatch["4 ft3"]).toMatch(/^\d+(\.\d+)? m³$/);
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
});
