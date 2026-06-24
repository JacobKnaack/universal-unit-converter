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
chrome.storage.sync.get(['autoConvert', 'unitSystem', 'cssUnitSystem', 'enabledCategories'], ({ autoConvert, unitSystem, cssUnitSystem, enabledCategories }) => {
  const categories = enabledCategories ?? defaultEnabled;
  if (autoConvert) {
    enableConversion(converter, unitSystem || 'imperial', cssUnitSystem || 'px', categories);
  };
});

// Listen for changes from popup
chrome.storage.onChanged.addListener((changes) => {
  const autoConvertChanged = "autoConvert" in changes;
  const systemChanged = "unitSystem" in changes;
  const cssChanged = "cssUnitSystem" in changes;
  const categoriesChanged = 'enabledCategories' in changes;

  if (!autoConvertChanged && !systemChanged && !cssChanged && !categoriesChanged) return;

  chrome.storage.sync.get(["autoConvert", "unitSystem", "cssUnitSystem", "enabledCategories"], (data) => {
    const enabled = data.autoConvert === true;
    const system = data.unitSystem ?? "imperial";
    const cssUnitSystem = data.cssUnitSystem ?? "px";
    const enabledCategories = data.enabledCategories ?? defaultEnabled;

    if (enabled) {
      enableConversion(converter, system, cssUnitSystem, enabledCategories);
    } else {
      disableConversion(converter);
    }
  });
});
