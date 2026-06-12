import {
  convertLength,
  LENGTH_REGEX,
  convertTemperature,
  TEMPERATURE_REGEX,
  convertMass,
  MASS_REGEX,
  convertVolume,
  VOLUME_REGEX,
 } from "../converters/index.js";

const ALREADY_CONVERTED_REGEX = /\(\s*\d+(\.\d+)?\s*(cm|mm|m|km|in|ft|yd|mi|g|kg|lb|oz|c|f)\s*\)/i;
const URL_REGEX = /https?:\/\/[^\s]+/i;

function revertAllConvertedText(textMap) {
  for (const [node, original] of textMap.entries()) {
    node.nodeValue = original;
  }
  textMap.clear();
}

function enableConversion(converter, unitSystem = 'imperial') {
  // Run immediately
  walkAndConvert(document.body, converter.textMap, unitSystem);

  // Start observing
  converter.observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          walkAndConvert(node, converter.textMap, unitSystem);
        }
      });
    }
  });

  converter.observer.observe(document.body, { childList: true, subtree: true });
}

function disableConversion(converter) {
  if (converter.observer) {
    converter.observer.disconnect();
    converter.observer = null;
  }

  revertAllConvertedText(converter.textMap);
}

function walkAndConvert(root, textMap = new Map(), systemType) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue;

    if (ALREADY_CONVERTED_REGEX.test(original) || URL_REGEX.test(original)) {
      continue;
    }

    if (!textMap.has(node)) {
      textMap.set(node, original);
    }

    let changed = false;
    let text = original;

    // Length
    text = text.replace(LENGTH_REGEX,
      (match, num, unit) => {
        const c = convertLength(parseFloat(num), unit, systemType);
        if (!c) return match;
        changed = true;
        return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
      }
    );

    // Temperature
    text = text.replace(TEMPERATURE_REGEX,
      (match, num, unit) => {
        const c = convertTemperature(parseFloat(num), unit);
        if (!c) return match;
        changed = true;
        return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
      }
    );

    // Mass
    text = text.replace(MASS_REGEX,
      (match, num, unit) => {
        const c = convertMass(parseFloat(num), unit, systemType);
        if (!c) return match;
        changed = true;
        return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
      }
    );

    // Volume
    text = text.replace(VOLUME_REGEX,
      (match, num, unit) => {
        const c = convertVolume(parseFloat(num), unit, systemType);
        if (!c) return match;
        changed = true;
        return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
      }
    );

    if (changed) {
      node.nodeValue = text.replace(/\/\*converted\*\//g, "");
    }
  }
}

export {
  walkAndConvert,
  revertAllConvertedText,
  enableConversion,
  disableConversion
}