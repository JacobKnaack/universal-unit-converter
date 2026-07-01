const DENSITY_REGEX = /\b(\d+(?:\.\d+)?)\s*(kg\/m³|kg\/m3|g\/cm³|g\/cm3|g\/mL|g\/ml|lb\/ft³|lb\/ft3|lb\/in³|lb\/in3)(?![A-Za-z0-9/])/giu;

const NORMALIZE_DENSITY_UNIT = {
  // Metric — Unicode + ASCII
  "kg/m³": "kg_m3",
  "kg/m3": "kg_m3",
  "kg_m3": "kg_m3",
  "g/cm³": "g_cm3",
  "g/cm3": "g_cm3",
  "g/mL":  "g_cm3",
  "g/ml":  "g_cm3",
  "g_cm3": "g_cm3",
  // Imperial — Unicode + ASCII
  "lb/ft³": "lb_ft3",
  "lb/ft3": "lb_ft3",
  "lb_ft3": "lb_ft3",
  "lb/in³": "lb_in3",
  "lb/in3": "lb_in3",
  "lb_in3": "lb_in3",
};

const MASS_TO_KG = {
  kg: 1,
  g: 0.001,
  lb: 0.45359237,
};

const VOLUME_TO_M3 = {
  "m3": 1,
  "cm3": 1e-6,
  "ml": 1e-6,
  "ft3": 0.028316846592,
  "in3": 1.6387064e-5,
};

const DENSITY_TARGET_UNITS = {
  kg_m3: ["lb/ft³"],
  g_cm3: ["lb/in³"],
  lb_ft3: ["kg/m³"],
  lb_in3: ["g/cm³"],
};

function splitDensityUnit(unit) {
  const [mass, volume] = unit.split("_");
  return { mass, volume };
}

function convertDensity(value, fromUnit, toUnit) {
  const from = NORMALIZE_DENSITY_UNIT[fromUnit];
  const to = NORMALIZE_DENSITY_UNIT[toUnit];
  if (!from || !to || from == to) return null;

  const { mass: fromMass, volume: fromVol } = splitDensityUnit(from);
  const { mass: toMass, volume: toVol } = splitDensityUnit(to);

  const massFactor = MASS_TO_KG[fromMass] / MASS_TO_KG[toMass];
  const volumeFactor = VOLUME_TO_M3[fromVol] / VOLUME_TO_M3[toVol];

  return {
    value: value * (massFactor / volumeFactor),
    unit: toUnit,
  };
}

export {
  DENSITY_REGEX,
  NORMALIZE_DENSITY_UNIT,
  DENSITY_TARGET_UNITS,
  convertDensity,
}
