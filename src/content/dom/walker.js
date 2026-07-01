import {
  convertLength, LENGTH_REGEX, LENGTH_TARGET_UNITS,
  convertTemperature, TEMPERATURE_REGEX, NORMALIZE_TEMP, TEMPERATURE_TARGET_UNITS,
  convertMass, MASS_REGEX, MASS_TARGET_UNITS,
  convertVolume, NORMALIZE_VOLUME_UNIT, VOLUME_REGEX, VOLUME_TARGET_UNITS,
  convertVelocity, VELOCITY_REGEX, NORMALIZE_VELOCITY, VELOCITY_TARGET_UNITS,
  convertCssUnits, CSS_UNIT_REGEX, CSS_TARGET_UNIT,
  convertArea, AREA_REGEX, AREA_TARGET_UNITS, NORMALIZE_AREA_UNIT,
  convertDensity, DENSITY_REGEX, NORMALIZE_DENSITY_UNIT, DENSITY_TARGET_UNITS,
  convertBytes, DATA_SIZE_REGEX, NORMALIZE_DATA_SIZE_UNIT, DATA_SIZE_TARGET_UNITS,
  CURRENCY_REGEX,
 } from "../converters/index.js";
import { maskUrls, unmaskUrls } from "../utility/urls.js";

const WRAPPER_CLASS = "uuc-text-wrapper";
const UNIT_CLASS = "uuc-unit";

const MARKER_OPEN = "@@UUC_OPEN@@";
const MARKER_SEP = "@@UUC_SEP@@";
const MARKER_CLOSE = "@@UUC_CLOSE@@";
const MARKER_REGEX = /@@UUC_OPEN@@(.*?)@@UUC_SEP@@(.*?)@@UUC_CLOSE@@/g;

const CONVERTERS = [
  { 
    key: 'convertVelocity',
    regex: VELOCITY_REGEX,
    convert: convertVelocity,
    normalize: (u) => NORMALIZE_VELOCITY[u],
    getTarget: (from) => VELOCITY_TARGET_UNITS[from],
  },
  { 
    key: 'convertCss',
    regex: CSS_UNIT_REGEX,
    convert: convertCssUnits,
    getTarget: (from) => CSS_TARGET_UNIT[from],
  },
  {
    key: 'convertLength',
    regex: LENGTH_REGEX,
    convert: convertLength,
    getTarget: (from) => LENGTH_TARGET_UNITS[from],
  },
  {
    key: 'convertTemperature',
    regex: TEMPERATURE_REGEX,
    convert: convertTemperature,
    normalize: (u) => NORMALIZE_TEMP[u],
    getTarget: (from) => TEMPERATURE_TARGET_UNITS[from],
  },
  {
    key: 'convertMass',
    regex: MASS_REGEX,
    convert: convertMass,
    getTarget: (from) => MASS_TARGET_UNITS[from],
  },
  { 
    key: 'convertVolume',
    regex: VOLUME_REGEX,
    convert: convertVolume,
    normalize: (u) => NORMALIZE_VOLUME_UNIT[u],
    getTarget: (from) => VOLUME_TARGET_UNITS[from],
  },
  { 
    key: 'convertArea',
    regex: AREA_REGEX,
    convert: convertArea,
    normalize: (u) => NORMALIZE_AREA_UNIT[u],
    getTarget: (from) => AREA_TARGET_UNITS[from],
  },
  { 
    key: 'convertDensity',
    regex: DENSITY_REGEX,
    convert: convertDensity,
    normalize: (u) => NORMALIZE_DENSITY_UNIT[u],
    getTarget: (from) => DENSITY_TARGET_UNITS[from],
  },
  {
    key: 'convertBytes',
    regex: DATA_SIZE_REGEX,
    convert: convertBytes,
    normalize: (u) => NORMALIZE_DATA_SIZE_UNIT[u],
    getTarget: (from) => DATA_SIZE_TARGET_UNITS[from],
  }
];

const defaultCategories = {
  convertLength: true,
  convertMass: true,
  convertVolume: true,
  convertVelocity: true,
  convertTemperature: true,
  convertCss: true,
  convertArea: true,
  convertDensity: true,
  convertBytes: true,
}

function revertAllConvertedText(textMap) {
  for (const [wrapper, original] of textMap.entries()) {
    wrapper.replaceWith(document.createTextNode(original));
  }
  textMap.clear();
}

function enableConversion(converter, enabledCategories = defaultCategories) {
  if (converter.observer) {
    converter.observer.disconnect();
  }
  if (converter.textMap) {
    revertAllConvertedText(converter.textMap);
    converter.textMap.clear();
  }
  // Run immediately
  walkAndConvert(document.body, converter.textMap, enabledCategories);

  // Start observing
  converter.observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      m.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && !node.classList.contains(WRAPPER_CLASS)) {
          walkAndConvert(node, converter.textMap, enabledCategories);
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

function buildConvertedFragment(text) {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;

  MARKER_REGEX.lastIndex = 0;
  while ((match = MARKER_REGEX.exec(text))) {
    const [full, matchText, tooltip] = match;

    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const span = document.createElement("span");
    span.className = UNIT_CLASS;
    span.dataset.tooltip = tooltip;
    span.textContent = matchText;
    fragment.appendChild(span);

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return fragment;
}

function walkAndConvert(root, textMap = new Map(), enabledCategories = defaultCategories) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  // Collect nodes before mutating: replacing the current node mid-traversal
  // detaches it, which stops TreeWalker from finding its next sibling.
  const textNodes = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }

  for (const node of textNodes) {
    if (node.parentElement?.closest(`.${WRAPPER_CLASS}`)) {
      continue;
    }

    const original = node.nodeValue;

    let changed = false;
    let text = maskUrls(original);

    const handleReplaceText = (converter) => (match, num, unit) => {
      if (!converter) return match;

      const from = unit.toLowerCase();
      const normalized = converter.normalize ? converter.normalize(from) : from;
      if (!normalized) return match;

      const to = converter.getTarget ? converter.getTarget(normalized) : null;
      if (!to) return match;

      const converted = converter.convert(parseFloat(num.replace(/,/g, '')), normalized, to);
      if (!converted) return match;

      changed = true;
      return `${MARKER_OPEN}${match}${MARKER_SEP}${converted.value.toFixed(2)} ${converted.unit}${MARKER_CLOSE}`;
    }

    // TODO: remove this after currency conversion is complete
    text = text.replace(CURRENCY_REGEX, match => `__CURRENCY_${match}__`);

    for (const converter of CONVERTERS) {
      const { key, regex } = converter;
      if (!enabledCategories?.[key]) continue;

      text = text.replace(regex, handleReplaceText(converter));
    }

    // TODO: remove this after currency conversion is complete
    text = text.replace(/__CURRENCY_(.*?)__/g, (m, original) => original);
    text = unmaskUrls(text);

    if (changed) {
      const wrapper = document.createElement("span");
      wrapper.className = WRAPPER_CLASS;
      wrapper.appendChild(buildConvertedFragment(text));

      node.replaceWith(wrapper);
      textMap.set(wrapper, original);
    }
  }
}

export {
  walkAndConvert,
  revertAllConvertedText,
  enableConversion,
  disableConversion,
  defaultCategories,
}
