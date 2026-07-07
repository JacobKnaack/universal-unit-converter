import { applyTooltipSettings, DEFAULT_TOOLTIP_SETTINGS } from "@/content/utility/applyTooltipTheme.js";
import { TOOLTIP_TARGET_CATEGORIES } from "./tooltipTargetsConfig.js";

const themeSelect = document.getElementById("tooltipTheme");
const underlineColorInput = document.getElementById("underlineColor");
const fontSizeInput = document.getElementById("tooltipFontSize");
const fontSizeValue = document.getElementById("fontSizeValue");
const status = document.getElementById("status");
const tooltipTargetsContainer = document.getElementById("tooltipTargets");

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

/* -----------------------------
   TOOLTIP CONVERSION TARGETS
----------------------------- */

// Builds one collapsible section per category, each listing every unit that
// category detects with a checkbox per other unit in that category (any unit
// can convert to any other within a category) — checked according to the
// saved override, or the shipped default target(s) if no override exists yet.
function renderTooltipTargets(savedOverrides) {
  tooltipTargetsContainer.innerHTML = "";

  TOOLTIP_TARGET_CATEGORIES.forEach((category) => {
    const unitIds = Object.keys(category.labels);

    const details = document.createElement("details");
    details.className = "target-category";

    const summary = document.createElement("summary");
    summary.textContent = category.label;
    details.appendChild(summary);

    unitIds.forEach((sourceId) => {
      const selected =
        savedOverrides?.[category.key]?.[sourceId] ?? category.defaults[sourceId] ?? [];

      const row = document.createElement("div");
      row.className = "target-source";

      const rowLabel = document.createElement("label");
      rowLabel.className = "target-source-label";
      rowLabel.textContent = `When we detect ${category.labels[sourceId]}, show conversions to:`;
      row.appendChild(rowLabel);

      const checkboxGroup = document.createElement("div");
      checkboxGroup.className = "target-checkboxes";

      unitIds
        .filter((targetId) => targetId !== sourceId)
        .forEach((targetId) => {
          const optionLabel = document.createElement("label");

          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.dataset.category = category.key;
          checkbox.dataset.source = sourceId;
          checkbox.dataset.target = targetId;
          checkbox.checked = selected.includes(targetId);
          checkbox.addEventListener("change", saveTooltipTargets);

          optionLabel.appendChild(checkbox);
          optionLabel.appendChild(document.createTextNode(category.labels[targetId]));
          checkboxGroup.appendChild(optionLabel);
        });

      row.appendChild(checkboxGroup);
      details.appendChild(row);
    });

    tooltipTargetsContainer.appendChild(details);
  });
}

// Rebuilds the full override object from every checkbox currently in the DOM
// and saves it as one snapshot, so it always stays internally consistent.
function saveTooltipTargets() {
  const overrides = {};

  tooltipTargetsContainer.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
    const { category, source, target } = checkbox.dataset;
    overrides[category] ??= {};
    overrides[category][source] ??= [];
    if (checkbox.checked) {
      overrides[category][source].push(target);
    }
  });

  chrome.storage.sync.set({ tooltipTargetUnits: overrides }, () => {
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1200);
  });
}

chrome.storage.sync.get(["tooltipTargetUnits"], ({ tooltipTargetUnits }) => {
  renderTooltipTargets(tooltipTargetUnits);
});
