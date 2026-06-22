const TEMPERATURE_REGEX = /\b(\d+(?:\.\d+)?)\s?(c|f|°c|°f|celsius|fahrenheit)\b(?!\/[a-z])/gi;

const NORMALIZE_TEMP = {
  c: "C",
  "°c": "C",
  celsius: "C",

  f: "F",
  "°f": "F",
  fahrenheit: "F"
};

function convertTemperature(value, fromUnit, toUnit) {
  const from = NORMALIZE_TEMP[fromUnit.toLowerCase()];
  const to = NORMALIZE_TEMP[toUnit.toLowerCase()];

  if (!from || !to) return null;

  // Identity conversion
  if (from === to) {
    return { value, unit: to };
  }

  // C → F
  if (from === "C" && to === "F") {
    return {
      value: (value * 9) / 5 + 32,
      unit: "F"
    };
  }

  // F → C
  if (from === "F" && to === "C") {
    return {
      value: ((value - 32) * 5) / 9,
      unit: "C"
    };
  }

  return null;
}

export {
  convertTemperature,
  NORMALIZE_TEMP,
  TEMPERATURE_REGEX
};
