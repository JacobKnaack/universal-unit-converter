import { WORD_NUMBER_SOURCE } from "../utility/wordsToNumbers.js";

// Note: uses a negative lookbehind instead of a leading \b — only the
// word-number branch is explicitly bounded with its own \b.
const DATA_SIZE_REGEX = new RegExp(
  `(?<![A-Za-z0-9])(\\d+(?:\\.\\d+)?|\\b(?:${WORD_NUMBER_SOURCE})\\b)\\s*(bytes?|b|kb|kib|mb|mib|gb|gib|tb|tib)(?![A-Za-z0-9])`,
  "gi"
);

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
  b: ["kb"],
  kb: ["kib", "b", "mb"],
  mb: ["mib", "kb", "gb"],
  gb: ["gib", "mb", "tb"],
  tb: ["tib", "gb"],
  kib: ["kb", "b", "mib"],
  mib: ["mb", "kib", "gib"],
  gib: ["gb", "mib", "tib"],
  tib: ["tb", "gib"],
};

function convertBytes(value, fromUnit, toUnit) {
  const from = NORMALIZE_DATA_SIZE_UNIT[fromUnit.toLowerCase()];
  const to = NORMALIZE_DATA_SIZE_UNIT[toUnit.toLowerCase()];

  if (!from || !to) return null;
  if (!DATA_SIZE_TO_BYTES[from] || !BYTES_TO_DATA_SIZE[to]) return null;

  if (from === to) {
    return { value, unit: to };
  }

  const bytes = value * DATA_SIZE_TO_BYTES[from];
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