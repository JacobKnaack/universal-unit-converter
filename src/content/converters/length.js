const LENGTH_REGEX = /\b(\d+(?:\.\d+)?)\s?(cm|mm|m|km|in|ft|yd|mi)\b/gi;

const LENGTH_UNITS = {
  m: 1, meter: 1, meters: 1,
  km: 1000, kilometer: 1000, kilometers: 1000,
  cm: 0.01, centimeter: 0.01, centimeters: 0.01,
  ft: 0.3048, foot: 0.3048, feet: 0.3048,
  in: 0.0254, inch: 0.0254, inches: 0.0254,
  yd: 0.9144, yard: 0.9144, yards: 0.9144,
  mi: 1609.344, mile: 1609.344, miles: 1609.344,
};

const meterUnits = ["m", "meter", "meters"];
const kiloUnits = ["km", "kilometer", "kilometers"];
const centiUnits = ["cm", "centimeter", "centimeters"];
const footUnits = ["ft", "foot", "feet"];
const inchUnits = ["in", "inch", "inches"];
const yardUnits = ["yd", "yard", "yards"];
// const mileUnits = ["mi", "mile", "miles"];

const isMetricUnit = (unit) => {
  return [...meterUnits, ...kiloUnits, ...centiUnits].includes(unit.toLowerCase());
};

const handleImperial = (value, unit) => {
  if (centiUnits.includes(unit)) {
    return { value: value / LENGTH_UNITS.in, unit: "in" };
  }
  if (meterUnits.includes(unit)) {
    return { value: value / LENGTH_UNITS.ft, unit: "ft" };
  }
  if (kiloUnits.includes(unit)) {
    return { value: value / LENGTH_UNITS.mi, unit: "mi" };
  }
}

const handleMetric = (value, unit) => {
  if (inchUnits.includes(unit)) {
    return { value: value * LENGTH_UNITS.cm, unit: "cm" };
  }
  if (footUnits.includes(unit)) {
    return { value: value * LENGTH_UNITS.m, unit: "m" };
  }
  if (yardUnits.includes(unit)) {
    return { value: value * LENGTH_UNITS.m, unit: "m" };
  }
}

function convertLength(value, unit, targetSystem) {
  const u = unit.toLowerCase();
  const meters = value * (LENGTH_UNITS[u] || 1);
  const isMetric = isMetricUnit(u);

  if (targetSystem === "imperial" && isMetric) {
    return handleImperial(meters, u);
  }
  if (targetSystem === "metric" && !isMetric) {
    return handleMetric(meters, u);
  }

  return null;
}


export {
  convertLength,
  LENGTH_REGEX,
}