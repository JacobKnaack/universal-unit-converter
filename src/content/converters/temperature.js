const TEMPERATURE_REGEX = /\b(\d+(?:\.\d+)?)\s?(c|f)\b/gi;

const celcuisUnits = ["c", "°c", "celsius"];
const fahrenheitUnits = ["f", "°f", "fahrenheit"];

const celciusToFahrenheit = (c) => (c * 9/5) + 32;
const fahrenheitToCelcius = (f) => (f - 32) * 5/9;

function convertTemperature(value, unit) {
  const u = unit.toLowerCase();

  if (celcuisUnits.includes(u)) {
    return { value: celciusToFahrenheit(value), unit: "F" };
  }

  if (fahrenheitUnits.includes(u)) {
    return { value: fahrenheitToCelcius(value), unit: "C" };
  }

  return null;
}

export {
  convertTemperature,
  TEMPERATURE_REGEX,
}
