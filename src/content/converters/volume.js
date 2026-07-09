import { WORD_NUMBER_SOURCE } from "../utility/wordsToNumbers.js";

const VOLUME_REGEX = new RegExp(
  `\\b(\\d+(?:\\.\\d+)?|\\b(?:${WORD_NUMBER_SOURCE})\\b)\\s?(milliliters?|millilitres?|mils|mls|ml|liters?|litres?|l|m(?:³|3|\\^3)|fl oz|gallon|gal|ft(?:³|3|\\^3)|cf|cu ft|cu\\.ft|cu\\. ft|quarts?|qts?|cups?|teaspoons?|tsps?|tablespoons?|tbsps?|imperial pints?|imp pts?|pints?|pt|imperial gills?|imp gis?|gills?|gi)(?=[)\\].,;:!? ]|$)`,
  "gi"
);

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
  "cu. ft": "ft³",
  // US customary units
  quart: "qt",
  quarts: "qt",
  qt: "qt",
  qts: "qt",
  cup: "cup",
  cups: "cup",
  teaspoon: "tsp",
  teaspoons: "tsp",
  tsp: "tsp",
  tsps: "tsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tbsp: "tbsp",
  tbsps: "tbsp",
  pint: "pt",
  pints: "pt",
  pt: "pt",
  gill: "gi",
  gills: "gi",
  gi: "gi",
  // Imperial (UK) units — distinct from their US customary namesakes above
  "imperial pint": "imp pt",
  "imperial pints": "imp pt",
  "imp pt": "imp pt",
  "imp pts": "imp pt",
  "imperial gill": "imp gi",
  "imperial gills": "imp gi",
  "imp gi": "imp gi",
  "imp gis": "imp gi",
};

const VOLUME_TO_M3 = {
  ml: 0.000001,
  l: 0.001,
  "m³": 1,
  "fl oz": 2.95735e-5,
  gal: 0.00378541,
  "ft³": 0.0283168,
  qt: 9.46353e-4,
  cup: 2.36588e-4,
  tsp: 4.92892e-6,
  tbsp: 1.47868e-5,
  pt: 4.73176e-4,
  gi: 1.18294e-4,
  "imp pt": 5.68261e-4,
  "imp gi": 1.42065e-4,
};

const M3_TO_UNIT = {
  ml: 1_000_000,
  l: 1000,
  "m³": 1,
  "fl oz": 1 / 2.95735e-5,
  gal: 1 / 0.00378541,
  "ft³": 1 / 0.0283168,
  qt: 1 / 9.46353e-4,
  cup: 1 / 2.36588e-4,
  tsp: 1 / 4.92892e-6,
  tbsp: 1 / 1.47868e-5,
  pt: 1 / 4.73176e-4,
  gi: 1 / 1.18294e-4,
  "imp pt": 1 / 5.68261e-4,
  "imp gi": 1 / 1.42065e-4,
};

const VOLUME_TARGET_UNITS = {
  ml: ["fl oz"],
  l: ["gal"],
  "m³": ["ft³"],
  "fl oz": ["ml"],
  gal: ["l"],
  "ft³": ["m³"],
  qt: ["l"],
  cup: ["ml"],
  tsp: ["ml"],
  tbsp: ["ml"],
  pt: ["ml"],
  gi: ["ml"],
  "imp pt": ["ml"],
  "imp gi": ["ml"],
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
