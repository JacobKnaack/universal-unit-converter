const MASS_REGEX = /\b(\d+(\.\d+)?)\s*(kg|kilogram|kilograms|g|gram|grams|lb|lbs|pound|pounds|oz|ounce|ounces)\b/gi;

function convertMass(value, unit, targetSystem) {
  const u = unit.toLowerCase();

  // Base unit: kilograms
  const MASS_UNITS = {
    kg: 1,
    kilogram: 1,
    kilograms: 1,
    g: 0.001,
    gram: 0.001,
    grams: 0.001,
    lb: 0.45359237,
    lbs: 0.45359237,
    pound: 0.45359237,
    pounds: 0.45359237,
    oz: 0.0283495,
    ounce: 0.0283495,
    ounces: 0.0283495
  };

  const kg = value * (MASS_UNITS[u] || 1);

  const isMetric = ["kg", "kilogram", "kilograms", "g", "gram", "grams"].includes(u);

  if (targetSystem === "imperial" && isMetric) {
    return { value: kg / 0.45359237, unit: "lb" };
  }

  if (targetSystem === "metric" && !isMetric) {
    return { value: kg, unit: "kg" };
  }

  return null;
}

export {
  convertMass,
  MASS_REGEX,
}