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
import getWindowDistance from "../utility/getWindowDistance.js";
import { parseNumberToken } from "../utility/wordsToNumbers.js";

const WRAPPER_CLASS = "uuc-text-wrapper";
const UNIT_CLASS = "uuc-unit";
const TOOLTIP_CLASS = "uuc-tooltip";
const TOOLTIP_ROW_CLASS = "uuc-tooltip-row";
const TOOLTIP_VALUE_CLASS = "uuc-tooltip-value";
const TOOLTIP_UNIT_CLASS = "uuc-tooltip-unit";
const CONVERSIONS_ATTR = "conversions";

// Elements whose text isn't visible prose: <style>/<script> text is source
// code (often full of "10px"/"1.5em"-style values that match our own unit
// regexes), <textarea>/<title> text has non-prose semantics, and
// contenteditable regions are live user-editable content. Wrapping matches
// inside these — especially <style> — corrupts the page instead of just
// annotating it: browsers stop parsing a <style> element as CSS once it
// contains element children instead of only text.
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "TITLE"]);

function isSkippableTextNode(node) {
  const parent = node.parentElement;
  if (!parent) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  return !!parent.closest('[contenteditable="true"], [contenteditable=""]');
}

const MARKER_OPEN = "@@UUC_OPEN@@";
const MARKER_SEP = "@@UUC_SEP@@";
const MARKER_CLOSE = "@@UUC_CLOSE@@";
const MARKER_REGEX = /@@UUC_OPEN@@(.*?)@@UUC_SEP@@(.*?)@@UUC_CLOSE@@/gs;

function shouldFlipTooltip(distance, tooltipWidth) {
  return distance - tooltipWidth < 0;
}

// A single shared tooltip element, appended directly to <body> rather than
// nested inside each .uuc-unit span. Nesting it would make its (hidden) text
// part of the span's — and therefore the page's — textContent.
let tooltipEl = null;

function getTooltipEl() {
  if (!tooltipEl || !document.body.contains(tooltipEl)) {
    tooltipEl = document.createElement("div");
    tooltipEl.className = TOOLTIP_CLASS;
    tooltipEl.setAttribute("role", "tooltip");
    tooltipEl.style.display = "none";
    document.body.appendChild(tooltipEl);
  }
  return tooltipEl;
}

function renderTooltipRows(tooltip, conversions) {
  tooltip.replaceChildren(
    ...conversions.map(({ value, unit }) => {
      const row = document.createElement("div");
      row.className = TOOLTIP_ROW_CLASS;

      const valueEl = document.createElement("span");
      valueEl.className = TOOLTIP_VALUE_CLASS;
      valueEl.textContent = formatConvertedValue(value);

      const unitEl = document.createElement("span");
      unitEl.className = TOOLTIP_UNIT_CLASS;
      unitEl.textContent = unit;

      row.append(valueEl, unitEl);
      return row;
    })
  );
}

// Anchored above the span; flips to grow leftward from the span's right
// edge instead of rightward whenever it would otherwise overflow the
// viewport.
function positionTooltip(tooltip, span) {
  const spanRect = span.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const { right } = getWindowDistance(span);

  tooltip.style.top = `${spanRect.top - tooltipRect.height - 4}px`;
  tooltip.style.left = shouldFlipTooltip(right, tooltipRect.width)
    ? `${spanRect.right - tooltipRect.width}px`
    : `${spanRect.left}px`;
}

document.addEventListener("mouseover", (event) => {
  const span = event.target.closest?.(`.${UNIT_CLASS}`);
  if (!span?.dataset[CONVERSIONS_ATTR]) return;

  const tooltip = getTooltipEl();
  renderTooltipRows(tooltip, JSON.parse(span.dataset[CONVERSIONS_ATTR]));
  tooltip.style.display = "grid";
  positionTooltip(tooltip, span);
});

document.addEventListener("mouseout", (event) => {
  if (!tooltipEl) return;

  const span = event.target.closest?.(`.${UNIT_CLASS}`);
  if (!span || span.contains(event.relatedTarget)) return;

  tooltipEl.style.display = "none";
});

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
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          !node.classList.contains(WRAPPER_CLASS) &&
          !SKIP_TAGS.has(node.tagName)
        ) {
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

// Formats using the user's own locale (comma vs. period grouping/decimal
// separators). Falls back to 3 fraction digits when 2 would round to "0.00"
// for a genuinely non-zero value.
function formatConvertedValue(value) {
  const fractionDigits = (value !== 0 && Math.round(value * 100) / 100 === 0) ? 3 : 2;

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function buildConvertedFragment(text) {
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;
  let match;

  MARKER_REGEX.lastIndex = 0;
  while ((match = MARKER_REGEX.exec(text))) {
    const [full, matchText, conversionsJson] = match;

    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const span = document.createElement("span");
    span.className = UNIT_CLASS;
    span.textContent = matchText;
    span.dataset[CONVERSIONS_ATTR] = conversionsJson;
    fragment.appendChild(span);

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  return fragment;
}

function walkAndConvert(root, textMap = new Map(), enabledCategories = defaultCategories) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, (node) =>
    isSkippableTextNode(node) ? NodeFilter.FILTER_SKIP : NodeFilter.FILTER_ACCEPT
  );

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

      const targets = converter.getTarget ? converter.getTarget(normalized) : null;
      if (!targets || !targets.length) return match;

      const value = parseNumberToken(num);
      if (Number.isNaN(value)) return match;

      const conversions = targets
        .map((to) => converter.convert(value, normalized, to))
        .filter(Boolean);

      if (!conversions.length) return match;

      changed = true;
      const conversionsJson = JSON.stringify(
        conversions.map(({ value, unit }) => ({ value, unit }))
      );

      return `${MARKER_OPEN}${match}${MARKER_SEP}${conversionsJson}${MARKER_CLOSE}`;
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
  shouldFlipTooltip,
  isSkippableTextNode,
}
