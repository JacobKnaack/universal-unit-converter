const MASS_REGEX = /\b(\d+(?:\.\d+)?)\s?(g|kg|lb|oz)\b(?!\/[a-z])/gi;

// Base conversion map: all units → kilograms
const MASS_TO_KG = {
  kg: 1,
  g: 0.001,
  lb: 0.45359237,
  oz: 0.0283495
};

// Reverse map: kilograms → unit
const KG_TO_UNIT = {
  kg: 1,
  g: 1000,
  lb: 1 / 0.45359237,
  oz: 1 / 0.0283495
};

const MASS_TARGET_UNITS = {
  imperial: { g: "oz", kg: "lb" },
  metric: { lb: "kg", oz: "g" }
};

function convertMass(value, fromUnit, toUnit) {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (!MASS_TO_KG[from] || !KG_TO_UNIT[to]) {
    return null;
  }

  // Identity conversion
  if (from === to) {
    return { value, unit: to };
  }

  // Step 1: convert FROM → kg
  const kg = value * MASS_TO_KG[from];

  // Step 2: convert kg → TO
  const converted = kg * KG_TO_UNIT[to];

  return {
    value: converted,
    unit: to
  };
}

export {
  convertMass,
  MASS_REGEX,
  MASS_TARGET_UNITS,
};