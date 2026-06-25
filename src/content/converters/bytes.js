const DATA_SIZE_REGEX = /(?<![A-Za-z0-9])(\d+(?:\.\d+)?)\s*(bytes?|b|kb|kib|mb|mib|gb|gib|tb|tib)(?![A-Za-z0-9])/gi;

const NORMALIZE_DATA_SIZE_UNIT = {
  byte: "b",
  bytes: "b",
  b: "b",
  kb: "kb",
  kib: "kib",
  mb: "mb",
  mib: "mib",
  gb: "gb",
  gib: "gib",
  tb: "tb",
  tib: "tib",
};

const DATA_SIZE_TO_BYTES = {
  b: 1,
  // Metric (SI)
  kb: 1000,
  mb: 1000 ** 2,
  gb: 1000 ** 3,
  tb: 1000 ** 4,
  // Binary (IEC)
  kib: 1024,
  mib: 1024 ** 2,
  gib: 1024 ** 3,
  tib: 1024 ** 4,
};

const BYTES_TO_DATA_SIZE = {
  b: 1,

  kb: 1 / 1000,
  mb: 1 / (1000 ** 2),
  gb: 1 / (1000 ** 3),
  tb: 1 / (1000 ** 4),

  kib: 1 / 1024,
  mib: 1 / (1024 ** 2),
  gib: 1 / (1024 ** 3),
  tib: 1 / (1024 ** 4),
};

const DATA_SIZE_TARGET_UNITS = {
  metric: {
    b: "kb",
    kib: "kb",
    mib: "mb",
    gib: "gb",
    tib: "tb",
  },
  binary: {
    b: "kib",
    kb: "kib",
    mb: "mib",
    gb: "gib",
    tb: "tib",
  },
};

function convertBytes(value, fromUnit, toUnit) {
  const from = NORMALIZE_DATA_SIZE_UNIT[fromUnit.toLowerCase()];
  const to = NORMALIZE_DATA_SIZE_UNIT[toUnit.toLowerCase()];

  if (!from || !to) return null;
  if (!DATA_SIZE_TO_BYTES[from] || !BYTES_TO_DATA_SIZE[to]) return null;

  // Identity conversion
  if (from === to) {
    return { value, unit: to };
  }

  // Step 1: convert FROM → bytes
  const bytes = value * DATA_SIZE_TO_BYTES[from];

  // Step 2: convert bytes → TO
  const converted = bytes * BYTES_TO_DATA_SIZE[to];

  return {
    value: converted,
    unit: to,
  };
}

export {
  DATA_SIZE_REGEX,
  NORMALIZE_DATA_SIZE_UNIT,
  DATA_SIZE_TARGET_UNITS,
  convertBytes,
}