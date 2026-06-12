import {
  enableConversion,
  disableConversion
} from "./dom/walker.js";

const converter = {
  observer: null,
  textMap: new Map(),
}

// Load setting and initialize behavior
chrome.storage.sync.get(['autoConvert', 'unitSystem', 'cssUnitSystem'], ({ autoConvert, unitSystem, cssUnitSystem }) => {
  if (autoConvert) {
    enableConversion(converter, unitSystem || 'imperial', cssUnitSystem || 'px');
  };
});

// Listen for changes from popup
chrome.storage.onChanged.addListener((changes) => {
  const autoConvertChanged = 'autoConvert' in changes;
  const systemChanged = 'unitSystem' in changes;
  const cssChanged = 'cssUnitSystem' in changes;

  if (!autoConvertChanged && !systemChanged && !cssChanged) return;

  const enabled = autoConvertChanged
    ? changes.autoConvert.newValue
    : true; // if only system changed, keep enabled

  const system = systemChanged
    ? changes.unitSystem.newValue
    : undefined;

  const cssUnitSystem = cssChanged
    ? changes.cssUnitSystem.newValue
    : undefined;

  if (enabled) {
    enableConversion(converter, system ?? 'imperial', cssUnitSystem || 'px');
  } else {
    disableConversion(converter);
  }
});
