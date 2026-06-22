const LENGTH_REGEX = /\b(\d+(?:\.\d+)?)\s?(cm|mm|m|km|in|ft|yd|mi)\b(?!\/[a-z])/gi;

// Base conversion map: all units → meters
const LENGTH_TO_METERS = {
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,

  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344
};

// Reverse map: meters → unit
const METERS_TO_UNIT = {
  mm: 1000,
  cm: 100,
  m: 1,
  km: 1 / 1000,

  in: 1 / 0.0254,
  ft: 1 / 0.3048,
  yd: 1 / 0.9144,
  mi: 1 / 1609.344
};

function convertLength(value, fromUnit, toUnit) {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (!LENGTH_TO_METERS[from] || !METERS_TO_UNIT[to]) {
    return null;
  }

  // Identity conversion
  if (from === to) {
    return { value, unit: to };
  }

  // Step 1: convert FROM → meters
  const meters = value * LENGTH_TO_METERS[from];

  // Step 2: convert meters → TO
  const converted = meters * METERS_TO_UNIT[to];

  return {
    value: converted,
    unit: to
  };
}

export {
  convertLength,
  LENGTH_REGEX
};
