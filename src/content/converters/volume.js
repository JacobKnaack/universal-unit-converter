const VOLUME_REGEX = /\b(\d+(?:\.\d+)?)\s?(milliliters?|millilitres?|mils|mls|ml|liters?|litres?|l|m³|m3|m^3|fl oz|gallon|gal|ft³|ft3|cf|cu ft|cu\.ft|cu\. ft)\b/gi;

const conversion = {
  milliliter: 0.033814, // conversion to fluid ounce
  liter: 0.264172, // conversion to gallon
  cubic_meter: 35.3147, // conversion to cubic foot
  fluid_ounce: 29.5735, // conversion to millileter
  gallon: 3.78541, // conversion to liter
  cubic_foot: 0.0283168 // conversion to cubic meter
}

const milliliter = ['milliliter', 'milliliters', 'millilitres', 'millilitres', 'ml', 'mils', 'mls'];
const liter = ['liter', 'liters', 'litre', 'litres', 'l'];
const cubic_meter = ['m3', 'm^3', 'm³'];
const fluid_ounce = ['fl oz', 'fl. oz'];
const gallon = ['gallon', 'gal'];
const cubic_foot = ['cf', 'cu ft', 'ft3', 'ft³', 'cu.ft', 'cu. ft'];

const handleImperial = (value, unit) => {
  if (milliliter.includes(unit)) {
    return { value: value * conversion.milliliter, unit: 'fl oz'};
  }
  if (liter.includes(unit)) {
    return { value: value * conversion.liter, unit: 'gal' };
  }
  if (cubic_meter.includes(unit)) {
    return { value: value* conversion.cubic_meter, unit: 'ft³' };
  }
  return null;
}

const handleMetric = (value, unit) => {
  if (fluid_ounce.includes(unit)) {
    return { value: value * conversion.fluid_ounce, unit: 'ml'};
  }
  if (gallon.includes(unit)) {
    return { value: value * conversion.gallon, unit: 'l'}
  }
  if (cubic_foot.includes(unit)) {
    return { value: value * conversion.cubic_foot, unit: 'm³' };
  }
  return null;
}

function convertVolume(value, unit, system) {
  const u = unit.toLowerCase();

  if (system === 'imperial') {
    return handleImperial(value, u);
  }
  if (system === 'metric') {
    return handleMetric(value, u);
  }
  return null;
}

export {
  convertVolume,
  VOLUME_REGEX
}