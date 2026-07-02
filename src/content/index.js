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
chrome.storage.sync.get(['autoConvert', 'enabledCategories', 'tooltipSettings'], ({ autoConvert, enabledCategories, tooltipSettings }) => {
  applyTooltipSettings(tooltipSettings);

  const categories = enabledCategories ?? defaultEnabled;
  if (autoConvert) {
    enableConversion(converter, categories);
  };
});

// Listen for changes from popup/options
chrome.storage.onChanged.addListener((changes) => {
  if ("tooltipSettings" in changes) {
    applyTooltipSettings(changes.tooltipSettings.newValue);
  }

  const autoConvertChanged = "autoConvert" in changes;
  const categoriesChanged = 'enabledCategories' in changes;

  if (!autoConvertChanged && !categoriesChanged) return;

  chrome.storage.sync.get(["autoConvert", "enabledCategories"], (data) => {
    const enabled = data.autoConvert === true;
    const enabledCategories = data.enabledCategories ?? defaultEnabled;

    if (enabled) {
      enableConversion(converter, enabledCategories);
    } else {
      disableConversion(converter);
    }
  });
});
