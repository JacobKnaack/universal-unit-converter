import {
  enableConversion,
  disableConversion
} from "./dom/walker.js";

const converter = {
  observer: null,
  textMap: new Map(),
}

// Load setting and initialize behavior
chrome.storage.sync.get(["autoConvert"], ({ autoConvert }) => {
  if (autoConvert) enableConversion(converter);
});

// Listen for changes from popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoConvert) {
    const enabled = changes.autoConvert.newValue;
    if (enabled) enableConversion(converter);
    else disableConversion(converter);
  }
});
