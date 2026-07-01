const VOLUME_REGEX = /\b(\d+(?:\.\d+)?)\s?(milliliters?|millilitres?|mils|mls|ml|liters?|litres?|l|m(?:³|3|\^3)|fl oz|gallon|gal|ft(?:³|3|\^3)|cf|cu ft|cu\.ft|cu\. ft)(?=[)\].,;:!? ]|$)/gi;

// Normalize all unit spellings to canonical forms
const NORMALIZE_VOLUME_UNIT = {
  milliliter: "ml",
  milliliters: "ml",
  millilitres: "ml",
  mils: "ml",
  mls: "ml",
  ml: "ml",
  liter: "l",
  liters: "l",
  litre: "l",
  litres: "l",
  l: "l",
  "m³": "m³",
  m3: "m³",
  "m^3": "m³",
  "fl oz": "fl oz",
  "fl. oz": "fl oz",
  gallon: "gal",
  gal: "gal",
  "ft³": "ft³",
  ft3: "ft³",
  cf: "ft³",
  "cu ft": "ft³",
  "cu.ft": "ft³",
  "cu. ft": "ft³"
};

// Convert everything → cubic meters
const VOLUME_TO_M3 = {
  ml: 0.000001,
  l: 0.001,
  "m³": 1,

  "fl oz": 2.95735e-5,
  gal: 0.00378541,
  "ft³": 0.0283168
};

// Convert cubic meters → target unit
const M3_TO_UNIT = {
  ml: 1_000_000,
  l: 1000,
  "m³": 1,

  "fl oz": 1 / 2.95735e-5,
  gal: 1 / 0.00378541,
  "ft³": 1 / 0.0283168
};

const VOLUME_TARGET_UNITS = {
  ml: ["fl oz"],
  l: ["gal"],
  "m³": ["ft³"],
  "fl oz": ["ml"],
  gal: ["l"],
  "ft³": ["m³"],
};

function convertVolume(value, fromUnit, toUnit) {
  const from = NORMALIZE_VOLUME_UNIT[fromUnit.toLowerCase()];
  const to = NORMALIZE_VOLUME_UNIT[toUnit.toLowerCase()];

  if (!from || !to) return null;
  if (!VOLUME_TO_M3[from] || !M3_TO_UNIT[to]) return null;

  // Identity conversion
  if (from === to) {
    return { value, unit: to };
  }

  // Step 1: convert FROM → m³
  const m3 = value * VOLUME_TO_M3[from];

  // Step 2: convert m³ → TO
  const converted = m3 * M3_TO_UNIT[to];

  return {
    value: converted,
    unit: to
  };
}

export {
  convertVolume,
  NORMALIZE_VOLUME_UNIT,
  VOLUME_REGEX,
  VOLUME_TARGET_UNITS,
};
