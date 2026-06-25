import {
  enableConversion,
  disableConversion,
  defaultCategories as defaultEnabled,
} from "./dom/walker.js";

const converter = {
  observer: null,
  textMap: new Map(),
}

// Load setting and initialize behavior
chrome.storage.sync.get(['autoConvert', 'enabledCategories'], ({ autoConvert, enabledCategories }) => {
  const categories = enabledCategories ?? defaultEnabled;
  if (autoConvert) {
    enableConversion(converter, categories);
  };
});

// Listen for changes from popup
chrome.storage.onChanged.addListener((changes) => {
  const autoConvertChanged = "autoConvert" in changes;
  const categoriesChanged = 'enabledCategories' in changes;

  if (!autoConvertChanged && !categoriesChanged) return;

  chrome.storage.sync.get(["autoConvert", "unitSystem", "cssUnitSystem", "enabledCategories"], (data) => {
    const enabled = data.autoConvert === true;
    const enabledCategories = data.enabledCategories ?? defaultEnabled;

    if (enabled) {
      enableConversion(converter, enabledCategories);
    } else {
      disableConversion(converter);
    }
  });
});
