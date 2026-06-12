import {
  enableConversion,
  disableConversion
} from "./dom/walker.js";

const converter = {
  observer: null,
  textMap: new Map(),
}

// Load setting and initialize behavior
chrome.storage.sync.get(["autoConvert", "unitSystem"], ({ autoConvert, unitSystem }) => {
  if (autoConvert) enableConversion(converter, unitSystem || 'imperial');
});

// Listen for changes from popup
chrome.storage.onChanged.addListener((changes) => {
  const autoConvertChanged = "autoConvert" in changes;
  const systemChanged = "unitSystem" in changes;

  if (!autoConvertChanged && !systemChanged) return;

  const enabled = autoConvertChanged
    ? changes.autoConvert.newValue
    : true; // if only system changed, keep enabled

  const system = systemChanged
    ? changes.unitSystem.newValue
    : undefined;

  if (enabled) {
    enableConversion(converter, system ?? "imperial");
  } else {
    disableConversion(converter);
  }
});
