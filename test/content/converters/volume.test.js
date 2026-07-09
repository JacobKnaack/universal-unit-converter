import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert, revertAllConvertedText } from "@/content/dom/walker.js";
import { VOLUME_REGEX, NORMALIZE_VOLUME_UNIT, convertVolume } from "@/content/converters/volume.js";

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

describe("Volume conversion — US customary and imperial cooking/serving units", () => {
  let map;

  beforeEach(() => {
    map = new Map();
  });

  it("matches quarts, cups, teaspoons, tablespoons, pints, and gills", () => {
    const samples = [
      "1 quart", "2 quarts", "1 qt", "3 qts",
      "1 cup", "2 cups",
      "1 teaspoon", "2 teaspoons", "1 tsp", "2 tsps",
      "1 tablespoon", "2 tablespoons", "1 tbsp", "2 tbsps",
      "1 pint", "2 pints", "1 pt",
      "1 gill", "2 gills", "1 gi",
      "1 imperial pint", "2 imperial pints", "1 imp pt",
      "1 imperial gill", "2 imperial gills", "1 imp gi",
    ];

    for (const s of samples) {
      expect(s.match(VOLUME_REGEX)).not.toBeNull();
    }
  });

  it("normalizes US customary units to canonical ids", () => {
    expect(NORMALIZE_VOLUME_UNIT["quart"]).toBe("qt");
    expect(NORMALIZE_VOLUME_UNIT["qt"]).toBe("qt");
    expect(NORMALIZE_VOLUME_UNIT["cup"]).toBe("cup");
    expect(NORMALIZE_VOLUME_UNIT["teaspoon"]).toBe("tsp");
    expect(NORMALIZE_VOLUME_UNIT["tsp"]).toBe("tsp");
    expect(NORMALIZE_VOLUME_UNIT["tablespoon"]).toBe("tbsp");
    expect(NORMALIZE_VOLUME_UNIT["tbsp"]).toBe("tbsp");
    expect(NORMALIZE_VOLUME_UNIT["pint"]).toBe("pt");
    expect(NORMALIZE_VOLUME_UNIT["gill"]).toBe("gi");
  });

  it("normalizes imperial units to canonical ids distinct from their US namesakes", () => {
    expect(NORMALIZE_VOLUME_UNIT["imperial pint"]).toBe("imp pt");
    expect(NORMALIZE_VOLUME_UNIT["imp pt"]).toBe("imp pt");
    expect(NORMALIZE_VOLUME_UNIT["imperial gill"]).toBe("imp gi");
    expect(NORMALIZE_VOLUME_UNIT["imp gi"]).toBe("imp gi");
  });

  it("converts a US quart to liters", () => {
    const result = convertVolume(1, "qt", "l");
    expect(result.value).toBeCloseTo(0.946353, 5);
  });

  it("converts a US cup to milliliters", () => {
    const result = convertVolume(1, "cup", "ml");
    expect(result.value).toBeCloseTo(236.588, 2);
  });

  it("converts US teaspoons and tablespoons to milliliters", () => {
    expect(convertVolume(1, "tsp", "ml").value).toBeCloseTo(4.92892, 3);
    expect(convertVolume(1, "tbsp", "ml").value).toBeCloseTo(14.7868, 3);
  });

  it("distinguishes a US pint from an imperial pint", () => {
    const usPint = convertVolume(1, "pt", "ml");
    const impPint = convertVolume(1, "imp pt", "ml");

    expect(usPint.value).toBeCloseTo(473.176, 2);
    expect(impPint.value).toBeCloseTo(568.261, 2);
    expect(impPint.value).toBeGreaterThan(usPint.value);
  });

  it("distinguishes a US gill from an imperial gill", () => {
    const usGill = convertVolume(1, "gi", "ml");
    const impGill = convertVolume(1, "imp gi", "ml");

    expect(usGill.value).toBeCloseTo(118.294, 2);
    expect(impGill.value).toBeCloseTo(142.065, 2);
    expect(impGill.value).toBeGreaterThan(usGill.value);
  });

  it("shows the shipped default tooltip target for each new unit", () => {
    document.body.innerHTML = `<p>Add 2 cups, 1 tbsp, and 1 imp pt to the bowl.</p>`;
    walkAndConvert(document.body, map);

    const byMatch = tooltipsByMatch();
    expect(byMatch["2 cups"].unit).toBe("ml");
    expect(byMatch["1 tbsp"].unit).toBe("ml");
    expect(byMatch["1 imp pt"].unit).toBe("ml");
  });
});
