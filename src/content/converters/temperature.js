import { WORD_NUMBER_SOURCE } from "../utility/wordsToNumbers.js";

// Note: bare "k" is deliberately NOT matched here (unlike c/f) — it would
// collide constantly with common shorthand like "10k views" or "$10k".
// Kelvin is still fully supported as a conversion target/manual unit below,
// it's just never auto-detected from page text.
const TEMPERATURE_REGEX = new RegExp(
  `\\b(\\d+(?:\\.\\d+)?|\\b(?:${WORD_NUMBER_SOURCE})\\b)\\s?(c|f|°c|°f|celsius|fahrenheit)\\b(?!/[a-z])`,
  "gi"
);

const NORMALIZE_TEMP = {
  c: "C",
  "°c": "C",
  celsius: "C",
  f: "F",
  "°f": "F",
  fahrenheit: "F",
  k: "K",
  "°k": "K",
  kelvin: "K",
};

const TEMPERATURE_TARGET_UNITS = {
  C: ["F", "K"],
  F: ["C", "K"],
  K: ["C", "F"],
};

const TO_CELSIUS = {
  C: (v) => v,
  F: (v) => ((v - 32) * 5) / 9,
  K: (v) => v - 273.15,
};

const FROM_CELSIUS = {
  C: (v) => v,
  F: (v) => (v * 9) / 5 + 32,
  K: (v) => v + 273.15,
};

function convertTemperature(value, fromUnit, toUnit) {
  const from = NORMALIZE_TEMP[fromUnit.toLowerCase()];
  const to = NORMALIZE_TEMP[toUnit.toLowerCase()];

  if (!from || !to) return null;

  // Identity conversion
  if (from === to) {
    return { value, unit: to };
  }

  const celsius = TO_CELSIUS[from](value);

  return {
    value: FROM_CELSIUS[to](celsius),
    unit: to,
  };
}

export {
  convertTemperature,
  NORMALIZE_TEMP,
  TEMPERATURE_REGEX,
  TEMPERATURE_TARGET_UNITS,
};
