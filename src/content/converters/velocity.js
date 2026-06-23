const VELOCITY_REGEX = /\b(\d+(?:\.\d+)?)\s?(m\/s|km\/h|ft\/s|mps|kph|mph|fps)\b(?![a-zA-Z])/gi;

const NORMALIZE_VELOCITY = {
  "m/s": "m/s",
  mps: "m/s",
  "km/h": "km/h",
  kph: "km/h",
  mph: "mph",
  "ft/s": "ft/s",
  fps: "ft/s"
};

const VELOCITY_TO_MPS = {
  "m/s": 1,
  "km/h": 1 / 3.6,
  mph: 0.44704,
  "ft/s": 0.3048
};

const MPS_TO_UNIT = {
  "m/s": 1,
  "km/h": 3.6,
  mph: 1 / 0.44704,
  "ft/s": 1 / 0.3048
};

function convertVelocity(value, fromUnit, toUnit) {
  const from = NORMALIZE_VELOCITY[fromUnit.toLowerCase()];
  const to = NORMALIZE_VELOCITY[toUnit.toLowerCase()];

  if (!from || !to) return null;

  // Identity conversion
  if (from === to) {
    return { value, unit: to };
  }

  // Step 1: convert FROM → m/s
  const mps = value * VELOCITY_TO_MPS[from];

  // Step 2: convert m/s → TO
  const converted = mps * MPS_TO_UNIT[to];

  return {
    value: converted,
    unit: to
  };
}

export {
  convertVelocity,
  NORMALIZE_VELOCITY,
  VELOCITY_REGEX
};
