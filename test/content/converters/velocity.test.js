import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert, revertAllConvertedText } from "@/content/dom/walker.js";
import { VELOCITY_REGEX } from "@/content/converters/velocity.js";

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
    walkAndConvert(document.body, map);

    const byMatch = tooltipsByMatch();

    // m/s → mph
    expect(byMatch["10 m/s"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["10 m/s"].unit).toBe("mph");

    // km/h → mph
    expect(byMatch["100 km/h"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["100 km/h"].unit).toBe("mph");

    // mps → mph (ASCII fallback)
    expect(byMatch["12 mps"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["12 mps"].unit).toBe("mph");
  });

  it("converts imperial → metric speed units", () => {
    walkAndConvert(document.body, map);

    const byMatch = tooltipsByMatch();

    // mph → km/h
    expect(byMatch["30 mph"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["30 mph"].unit).toBe("km/h");

    // ft/s → m/s
    expect(byMatch["50 ft/s"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["50 ft/s"].unit).toBe("m/s");

    // fps → m/s (ASCII fallback)
    expect(byMatch["40 fps"].value).toMatch(/^\d+(\.\d+)?$/);
    expect(byMatch["40 fps"].unit).toBe("m/s");
  });

  it("stores original text in the map", () => {
    walkAndConvert(document.body, map);

    const wrapper = document.querySelector(".uuc-text-wrapper");
    expect(map.has(wrapper)).toBe(true);
    expect(map.get(wrapper)).toContain("10 m/s");
  });

  it("reverts converted speed text back to original", () => {
    walkAndConvert(document.body, map);
    revertAllConvertedText(map);

    const text = document.body.textContent;

    expect(text).toContain("10 m/s");
    expect(text).toContain("100 km/h");
    expect(text).toContain("12 mps");
    expect(text).toContain("30 mph");
    expect(text).toContain("50 ft/s");
    expect(text).toContain("40 fps");

    // No leftover wrapper/tooltip spans
    expect(document.querySelector(".uuc-unit")).toBeNull();
    expect(document.querySelector(".uuc-text-wrapper")).toBeNull();
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

  it("converts word-based numbers, leaving the original wording as the visible text", () => {
    document.body.innerHTML = `<p>The car was traveling at thirty mph.</p>`;

    walkAndConvert(document.body, map);

    const span = document.querySelector(".uuc-unit");
    // Visible text is exactly what was written — never rewritten to "30 mph"
    expect(span.textContent).toBe("thirty mph");

    const byMatch = tooltipsByMatch();
    expect(byMatch["thirty mph"].unit).toBe("km/h");
    expect(parseFloat(byMatch["thirty mph"].value)).toBeCloseTo(48.28, 1);
  });
});
