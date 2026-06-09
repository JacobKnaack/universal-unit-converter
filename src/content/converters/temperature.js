const TEMPERATURE_REGEX = /\b(\d+(\.\d+)?)\s*(°?\s*[CFcf]|celsius|fahrenheit)\b/g;

function convertTemperature(value, unit) {
  const u = unit.toLowerCase();

  if (u === "c" || u === "°c" || u === "celsius") {
    return { value: (value * 9/5) + 32, unit: "°F" };
  }

  if (u === "f" || u === "°f" || u === "fahrenheit") {
    return { value: (value - 32) * 5/9, unit: "°C" };
  }

  return null;
}

export {
  convertTemperature,
  TEMPERATURE_REGEX,
}
