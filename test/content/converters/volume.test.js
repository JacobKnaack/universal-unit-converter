import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert, revertAllConvertedText } from "@/content/dom/walker.js";
import { VOLUME_REGEX } from "@/content/converters/volume.js";

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

    const text = document.body.textContent;

    expect(text).toMatch(/750 ml \(\d+(\.\d+)? fl oz\)/);
    expect(text).toMatch(/2 liters \(\d+(\.\d+)? gal\)/);
    expect(text).toMatch(/1\.2 m3 \(\d+(\.\d+)? ft³\)/);
  });

  it("converts imperial → metric volume units", () => {
    walkAndConvert(document.body, map);

    const text = document.body.textContent;

    expect(text).toMatch(/8 fl oz \(\d+(\.\d+)? ml\)/);
    expect(text).toMatch(/1 gal \(\d+(\.\d+)? l\)/);
    expect(text).toMatch(/4 ft3 \(\d+(\.\d+)? m³\)/);
  });

  it("stores original text in the map", () => {
    walkAndConvert(document.body, map);

    const node = document.querySelector("p").firstChild;
    expect(map.has(node)).toBe(true);
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

    // Ensure no converted parentheses remain
    expect(text.includes("(")).toBe(false);
  });
});
