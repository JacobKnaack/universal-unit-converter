import {
  enableConversion,
  disableConversion,
  defaultCategories as defaultEnabled,
} from "./dom/walker.js";
import { applyTooltipSettings } from "./utility/applyTooltipTheme.js";

const converter = {
  observer: null,
  textMap: new Map(),
}

// Load setting and initialize behavior
chrome.storage.sync.get(
  ['autoConvert', 'enabledCategories', 'tooltipSettings', 'tooltipTargetUnits'],
  ({ autoConvert, enabledCategories, tooltipSettings, tooltipTargetUnits }) => {
    applyTooltipSettings(tooltipSettings);

    const categories = enabledCategories ?? defaultEnabled;
    if (autoConvert) {
      enableConversion(converter, categories, tooltipTargetUnits ?? null);
    };
  }
);

// Listen for changes from popup/options
chrome.storage.onChanged.addListener((changes) => {
  if ("tooltipSettings" in changes) {
    applyTooltipSettings(changes.tooltipSettings.newValue);
  }

  const autoConvertChanged = "autoConvert" in changes;
  const categoriesChanged = 'enabledCategories' in changes;
  const targetUnitsChanged = 'tooltipTargetUnits' in changes;

  if (!autoConvertChanged && !categoriesChanged && !targetUnitsChanged) return;

  chrome.storage.sync.get(["autoConvert", "enabledCategories", "tooltipTargetUnits"], (data) => {
    const enabled = data.autoConvert === true;
    const enabledCategories = data.enabledCategories ?? defaultEnabled;

    if (enabled) {
      enableConversion(converter, enabledCategories, data.tooltipTargetUnits ?? null);
    } else {
      disableConversion(converter);
    }
  });
});
