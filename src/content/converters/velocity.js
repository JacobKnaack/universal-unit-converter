const VELOCITY_REGEX = /\b(\d+(?:\.\d+)?)\s?(m\/s|km\/h|ft\/s|mps|kph|mph|fps)(?![a-zA-Z])/gi;

const meters_per_second = ['m/s', 'mps'];
const kilometers_per_hour = ['km/h', 'kph'];

const miles_per_hour = ['mph'];
const feet_per_second = ['ft/s', 'fps'];

const conversion = {
  // Metric → Imperial
  mps_to_mph: 2.23694,
  kmh_to_mph: 0.621371,

  // Imperial → Metric
  mph_to_mps: 0.44704,
  mph_to_kmh: 1.60934,

  // ft/s ↔ m/s
  fps_to_mps: 0.3048,
  mps_to_fps: 3.28084
};

const handleImperial = (value, unit) => {
  if (meters_per_second.includes(unit)) {
    return { value: value * conversion.mps_to_mph, unit: 'mph' };
  }
  if (kilometers_per_hour.includes(unit)) {
    return { value: value * conversion.kmh_to_mph, unit: 'mph' };
  }
  return null;
};

const handleMetric = (value, unit) => {
  if (miles_per_hour.includes(unit)) {
    return { value: value * conversion.mph_to_kmh, unit: 'km/h' };
  }
  if (feet_per_second.includes(unit)) {
    return { value: value * conversion.fps_to_mps, unit: 'm/s' };
  }
  return null;
};

function convertVelocity(value, unit, system) {
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
    convertVelocity,
    VELOCITY_REGEX,
}
