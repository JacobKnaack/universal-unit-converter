import { describe, it, expect } from "vitest";
import { applyTooltipSettings, DEFAULT_TOOLTIP_SETTINGS, THEMES } from "@/content/utility/applyTooltipTheme.js";

function mockRoot() {
  const el = document.createElement("div");
  return el;
}

describe("applyTooltipSettings", () => {
  it("applies the default (dark) theme, underline color, and font size when no settings are given", () => {
    const root = mockRoot();
    applyTooltipSettings(undefined, root);

    expect(root.style.getPropertyValue("--uuc-tooltip-bg")).toBe(THEMES.dark.bg);
    expect(root.style.getPropertyValue("--uuc-tooltip-bg-alt")).toBe(THEMES.dark.bgAlt);
    expect(root.style.getPropertyValue("--uuc-tooltip-fg")).toBe(THEMES.dark.fg);
    expect(root.style.getPropertyValue("--uuc-underline-color")).toBe(DEFAULT_TOOLTIP_SETTINGS.underlineColor);
    expect(root.style.getPropertyValue("--uuc-tooltip-font-size")).toBe(`${DEFAULT_TOOLTIP_SETTINGS.fontSize}rem`);
  });

  it("applies the light theme palette", () => {
    const root = mockRoot();
    applyTooltipSettings({ theme: "light" }, root);

    expect(root.style.getPropertyValue("--uuc-tooltip-bg")).toBe(THEMES.light.bg);
    expect(root.style.getPropertyValue("--uuc-tooltip-bg-alt")).toBe(THEMES.light.bgAlt);
    expect(root.style.getPropertyValue("--uuc-tooltip-fg")).toBe(THEMES.light.fg);
  });

  it("falls back to the dark theme for an unrecognized theme name", () => {
    const root = mockRoot();
    applyTooltipSettings({ theme: "neon" }, root);

    expect(root.style.getPropertyValue("--uuc-tooltip-bg")).toBe(THEMES.dark.bg);
  });

  it("applies a custom underline color", () => {
    const root = mockRoot();
    applyTooltipSettings({ underlineColor: "#ff0000" }, root);

    expect(root.style.getPropertyValue("--uuc-underline-color")).toBe("#ff0000");
  });

  it("applies a custom font size in rem", () => {
    const root = mockRoot();
    applyTooltipSettings({ fontSize: 1.4 }, root);

    expect(root.style.getPropertyValue("--uuc-tooltip-font-size")).toBe("1.4rem");
  });

  it("merges partial settings with the defaults rather than replacing them entirely", () => {
    const root = mockRoot();
    applyTooltipSettings({ underlineColor: "#00ff00" }, root);

    // Untouched fields still get their defaults applied
    expect(root.style.getPropertyValue("--uuc-tooltip-font-size")).toBe(`${DEFAULT_TOOLTIP_SETTINGS.fontSize}rem`);
    expect(root.style.getPropertyValue("--uuc-underline-color")).toBe("#00ff00");
  });

  it("defaults to document.documentElement when no root is provided", () => {
    applyTooltipSettings({ underlineColor: "#123456" });

    expect(document.documentElement.style.getPropertyValue("--uuc-underline-color")).toBe("#123456");
  });
});
