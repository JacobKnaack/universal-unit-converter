const THEMES = {
  dark: { bg: "#2b2b2b", bgAlt: "#3a3a3a", fg: "#fff" },
  light: { bg: "#f5f5f5", bgAlt: "#e0e0e0", fg: "#1f2328" },
};

const DEFAULT_TOOLTIP_SETTINGS = {
  theme: "dark",
  underlineColor: "#800080",
  fontSize: 1.1,
};

// Applies tooltip appearance settings as CSS custom properties on the root
// element, so the same values drive both the injected content-script
// tooltip and the live preview on the options page.
function applyTooltipSettings(settings, root = document.documentElement) {
  const { theme, underlineColor, fontSize } = { ...DEFAULT_TOOLTIP_SETTINGS, ...settings };
  const palette = THEMES[theme] || THEMES.dark;

  root.style.setProperty("--uuc-tooltip-bg", palette.bg);
  root.style.setProperty("--uuc-tooltip-bg-alt", palette.bgAlt);
  root.style.setProperty("--uuc-tooltip-fg", palette.fg);
  root.style.setProperty("--uuc-underline-color", underlineColor);
  root.style.setProperty("--uuc-tooltip-font-size", `${fontSize}rem`);
}

export {
  applyTooltipSettings,
  DEFAULT_TOOLTIP_SETTINGS,
  THEMES,
};
