import {
  convertLength,
  LENGTH_REGEX,
  convertTemperature,
  TEMPERATURE_REGEX,
  convertMass,
  MASS_REGEX,
  convertVolume,
  VOLUME_REGEX,
  VELOCITY_REGEX,
  convertVelocity,
  CSS_UNIT_REGEX,
  convertCssUnits,
 } from "../converters/index.js";

const ALREADY_CONVERTED_REGEX = /\(\s*\d+(\.\d+)?\s*(cm|mm|m|km|in|ft|yd|mi|g|kg|lb|oz|c|f|px|rem|em)\s*\)/i;
const URL_REGEX = /https?:\/\/[^\s]+/i;

const CONVERTERS = [
  { regex: VELOCITY_REGEX, fn: convertVelocity },
  { regex: CSS_UNIT_REGEX, fn: convertCssUnits },
  { regex: LENGTH_REGEX, fn: convertLength },
  { regex: TEMPERATURE_REGEX, fn: convertTemperature },
  { regex: MASS_REGEX, fn: convertMass },
  { regex: VOLUME_REGEX, fn: convertVolume },
];

function revertAllConvertedText(textMap) {
  for (const [node, original] of textMap.entries()) {
    node.nodeValue = original;
  }
  textMap.clear();
}

function enableConversion(converter, unitSystem = 'imperial', cssUnitSystem = 'px') {
  // Run immediately
  walkAndConvert(document.body, converter.textMap, unitSystem, cssUnitSystem);

  // Start observing
  converter.observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          walkAndConvert(node, converter.textMap, unitSystem, cssUnitSystem);
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

function walkAndConvert(root, textMap = new Map(), systemType, cssUnitType) {
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

    for (const { regex, fn } of CONVERTERS) {
      const system = fn === convertCssUnits ? cssUnitType : systemType; // this is a little brittle
      text = text.replace(regex, (match, num, unit) => {
        const c = fn(parseFloat(num), unit, system);
        if (!c) return match;
        changed = true;
        return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
      });
    }

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