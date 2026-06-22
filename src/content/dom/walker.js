import {
  convertLength,
  LENGTH_REGEX,
  NORMALIZE_VOLUME_UNIT,
  convertTemperature,
  TEMPERATURE_REGEX,
  NORMALIZE_TEMP,
  convertMass,
  MASS_REGEX,
  convertVolume,
  VOLUME_REGEX,
  VELOCITY_REGEX,
  NORMALIZE_VELOCITY,
  convertVelocity,
  CSS_UNIT_REGEX,
  convertCssUnits,
 } from "../converters/index.js";

const ALREADY_CONVERTED_REGEX = /\(\s*\d+(\.\d+)?\s*(cm|mm|m|km|in|ft|yd|mi|g|kg|lb|oz|c|f|px|rem|em|mph|km\/h|m\/s|ft\/s)\s*\)/i;
const URL_REGEX = /https?:\/\/[^\s]+/i;

const LENGTH_TARGET_UNITS = {
  imperial: {
    mm: "in",
    cm: "in",
    m: "ft",
    km: "mi"
  },
  metric: {
    in: "cm",
    ft: "m",
    yd: "m",
    mi: "km"
  }
};

const MASS_TARGET_UNITS = {
  imperial: { g: "oz", kg: "lb" },
  metric: { lb: "kg", oz: "g" }
};

const VOLUME_TARGET_UNITS = {
  imperial: {
    ml: "fl oz",
    l: "gal",
    "m³": "ft³"
  },
  metric: {
    "fl oz": "ml",
    gal: "l",
    "ft³": "m³"
  }
};

const TEMPERATURE_TARGET_UNITS = {
  imperial: { C: "F" },
  metric: { F: "C" }
};

const VELOCITY_TARGET_UNITS = {
  imperial: {
    "m/s": "mph",
    "km/h": "mph"
  },
  metric: {
    mph: "km/h",
    "ft/s": "m/s"
  }
};


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
  if (converter.observer) {
    converter.observer.disconnect();
  }
  converter.textMap.clear();
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
      text = text.replace(regex, (match, num, unit) => {
        const from = unit.toLowerCase();
        let to;

        // --- CSS UNITS ---
        if (fn === convertCssUnits) {
          to = cssUnitType;
          if (from === to) return match;
        }

        // --- LENGTH UNITS ---
        else if (fn === convertLength) {
          to = LENGTH_TARGET_UNITS[systemType]?.[from];
          if (!to) return match;
        }

        // --- MASS UNITS ---
        else if (fn === convertMass) {
          to = MASS_TARGET_UNITS[systemType]?.[from];
          if (!to) return match;
        }

        // --- VOLUME UNITS ---
        else if (fn === convertVolume) {
          const normalized = NORMALIZE_VOLUME_UNIT[from];
          if (!normalized) return match;

          to = VOLUME_TARGET_UNITS[systemType]?.[normalized];
          if (!to) return match;

          const c = fn(parseFloat(num), normalized, to);
          if (!c) return match;

          changed = true;
          return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
        }

        else if (fn === convertTemperature) {
          const normalized = NORMALIZE_TEMP[from];
          if (!normalized) return match;

          to = TEMPERATURE_TARGET_UNITS[systemType]?.[normalized];
          if (!to) return match;

          const c = fn(parseFloat(num), normalized, to);
          if (!c) return match;

          changed = true;
          return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
        }

        else if (fn === convertVelocity) {
          const normalized = NORMALIZE_VELOCITY[from];
          if (!normalized) return match;

          to = VELOCITY_TARGET_UNITS[systemType]?.[normalized];
          if (!to) return match;

          const c = fn(parseFloat(num), normalized, to);
          if (!c) return match;

          changed = true;
          return `${match} (${c.value.toFixed(2)} ${c.unit})/*converted*/`;
        }
        // --- UNIVERSAL CONVERTER CALL ---
        const c = fn(parseFloat(num), from, to);
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
