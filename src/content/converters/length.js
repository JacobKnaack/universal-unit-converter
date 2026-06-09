const LENGTH_REGEX = /\b(\d+(\.\d+)?)\s*(m|km|cm|ft|in|yd)\b/gi;

function convertLength(value, unit, targetSystem) {
  const u = unit.toLowerCase();

  const LENGTH_UNITS = {
    m: 1, meter: 1, meters: 1,
    km: 1000, kilometer: 1000, kilometers: 1000,
    cm: 0.01, centimeter: 0.01, centimeters: 0.01,
    ft: 0.3048, foot: 0.3048, feet: 0.3048,
    in: 0.0254, inch: 0.0254, inches: 0.0254,
    yd: 0.9144, yard: 0.9144, yards: 0.9144
  };

  const meters = value * (LENGTH_UNITS[u] || 1);

  const isMetric = ["m","meter","meters","km","kilometer","kilometers","cm","centimeter","centimeters"].includes(u);

  if (targetSystem === "imperial" && isMetric) {
    return { value: meters / 0.3048, unit: "ft" };
  }

  if (targetSystem === "metric" && !isMetric) {
    return { value: meters, unit: "m" };
  }

  return null;
}

export {
  convertLength,
  LENGTH_REGEX,
}