import { WORD_NUMBER_SOURCE } from "../utility/wordsToNumbers.js";

// Note: unlike most converters, the digit branches here have no leading
// \b of their own — only the word-number branch is explicitly bounded.
const AREA_REGEX = new RegExp(
  `(\\d{1,3}(?:,\\d{3})*(?:\\.\\d+)?|\\d+(?:\\.\\d+)?|\\b(?:${WORD_NUMBER_SOURCE})\\b)[ ]*(mm²|cm²|m²|km²|in²|ft²|yd²|mi²|mm2|cm2|m2|km2|in2|ft2|yd2|mi2|mm\\^2|cm\\^2|m\\^2|km\\^2|in\\^2|ft\\^2|yd\\^2|mi\\^2)(?![A-Za-z0-9/])`,
  "gi"
);

const NORMALIZE_AREA_UNIT = {
  "mm²": "mm2",
  "cm²": "cm2",
  "m²": "m2",
  "km²": "km2",
  "in²": "in2",
  "ft²": "ft2",
  "yd²": "yd2",
  "mi²": "mi2",
  "ha": "ha",
  "acre": "acre",
  "mm2": "mm2",
  "cm2": "cm2",
  "m2": "m2",
  "km2": "km2",
  "in2": "in2",
  "ft2": "ft2",
  "yd2": "yd2",
  "mi2": "mi2",
  "mm^2": "mm2",
  "cm^2": "cm2",
  "m^2": "m2",
  "km^2": "km2",
  "in^2": "in2",
  "ft^2": "ft2",
  "yd^2": "yd2",
  "mi^2": "mi2",
};

const AREA_TARGET_UNITS = {
  in2: ["cm2"],
  ft2: ["m2"],
  yd2: ["m2"],
  mi2: ["km2"],
  acre: ["m2"], // or "ha"
  mm2: ["in2"],
  cm2: ["in2"],
  m2: ["ft2"],
  km2: ["mi2"],
  ha: ["acre"],
};

// Base conversions (length → meters)
const LENGTH_TO_M = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};

function convertArea(value, fromUnit, toUnit) {
  const from = NORMALIZE_AREA_UNIT[fromUnit];
  const to = NORMALIZE_AREA_UNIT[toUnit];

  if (!from || !to || from === to) return null;
  const fromLength = from.replace("2", "");
  const toLength = to.replace("2", "");

  const fromMeters = LENGTH_TO_M[fromLength];
  const toMeters = LENGTH_TO_M[toLength];

  if (!fromMeters || !toMeters) return null;

  const factor = (fromMeters / toMeters) ** 2;

  return {
    value: value * factor,
    unit: toUnit,
  };
}

export {
  convertArea,
  NORMALIZE_AREA_UNIT,
  AREA_REGEX,
  AREA_TARGET_UNITS,
}