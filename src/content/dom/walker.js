import {
  convertLength,
  LENGTH_REGEX,
  convertTemperature,
  TEMPERATURE_REGEX,
  convertMass,
  MASS_REGEX,
 } from "../converters/index.js";

function walkAndConvert(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  let node;
  while ((node = walker.nextNode())) {
    const original = node.nodeValue;
    let changed = false;
    let text = original;

    // Length
    text = text.replace(LENGTH_REGEX,
      (match, num, _, unit) => {
        const c = convertLength(parseFloat(num), unit, "imperial");
        if (!c) return match;
        changed = true;
        return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
      }
    );

    // Temperature
    text = text.replace(TEMPERATURE_REGEX,
      (match, num, _, unit) => {
        const c = convertTemperature(parseFloat(num), unit);
        if (!c) return match;
        changed = true;
        return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
      }
    );

    // Mass
    text = text.replace(MASS_REGEX,
      (match, num, _, unit) => {
        const c = convertMass(parseFloat(num), unit, "imperial");
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
}