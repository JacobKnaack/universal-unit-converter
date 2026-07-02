import { applyTooltipSettings, DEFAULT_TOOLTIP_SETTINGS } from "@/content/utility/applyTooltipTheme.js";

const themeSelect = document.getElementById("tooltipTheme");
const underlineColorInput = document.getElementById("underlineColor");
const fontSizeInput = document.getElementById("tooltipFontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const status = document.getElementById("status");

function currentSettings() {
  return {
    theme: themeSelect.value,
    underlineColor: underlineColorInput.value,
    fontSize: parseFloat(fontSizeInput.value),
  };
}

// Applies the in-progress settings to this page's own preview, so changes
// are visible immediately without waiting for a save.
function updatePreview() {
  const settings = currentSettings();
  fontSizeValue.textContent = `${settings.fontSize}rem`;
  applyTooltipSettings(settings);
}

function save() {
  chrome.storage.sync.set({ tooltipSettings: currentSettings() }, () => {
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1200);
  });
}

// Load saved settings
chrome.storage.sync.get(["tooltipSettings"], ({ tooltipSettings }) => {
  const settings = { ...DEFAULT_TOOLTIP_SETTINGS, ...tooltipSettings };

  themeSelect.value = settings.theme;
  underlineColorInput.value = settings.underlineColor;
  fontSizeInput.value = settings.fontSize;

  updatePreview();
});

// Live-update the preview as the user drags/picks, but only write to
// storage once the value is committed (avoids spamming chrome.storage.sync
// with a write per drag tick, which has a fairly low rate limit).
[themeSelect, underlineColorInput, fontSizeInput].forEach((el) => {
  el.addEventListener("input", updatePreview);
  el.addEventListener("change", save);
});
