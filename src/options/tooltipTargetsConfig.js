import {
  LENGTH_TARGET_UNITS,
  TEMPERATURE_TARGET_UNITS,
  MASS_TARGET_UNITS,
  VOLUME_TARGET_UNITS,
  VELOCITY_TARGET_UNITS,
  CSS_TARGET_UNIT,
  AREA_TARGET_UNITS,
  DENSITY_TARGET_UNITS,
  DATA_SIZE_TARGET_UNITS,
} from "@/content/converters/index.js";

// DENSITY_TARGET_UNITS values are the pretty symbol form (e.g. "lb/ft³")
// while its keys are ascii ids (e.g. "kg_m3") — normalize the values here so
// defaults live in the same id space as the source keys/checkboxes below.
const DENSITY_SYMBOL_TO_ID = {
  "kg/m³": "kg_m3",
  "g/cm³": "g_cm3",
  "lb/ft³": "lb_ft3",
  "lb/in³": "lb_in3",
};
const DENSITY_DEFAULTS = Object.fromEntries(
  Object.entries(DENSITY_TARGET_UNITS).map(([id, targets]) => [
    id,
    targets.map((t) => DENSITY_SYMBOL_TO_ID[t] ?? t),
  ])
);

// Each entry describes one auto-conversion category: its storage key
// (matches enabledCategories / CONVERTERS[].key), a display label, the
// shipped default target unit(s) per source unit (used to prefill
// checkboxes before a user override exists), and a label per unit id.
// Unit ids match exactly what each converter normalizes a matched unit to
// at runtime (see the `normalize` functions in content/dom/walker.js), so
// these ids double as the keys/values persisted in a user override.
const TOOLTIP_TARGET_CATEGORIES = [
  {
    key: "convertLength",
    label: "Length",
    defaults: LENGTH_TARGET_UNITS,
    labels: {
      mm: "Millimeters", cm: "Centimeters", m: "Meters", km: "Kilometers",
      in: "Inches", ft: "Feet", yd: "Yards", mi: "Miles",
    },
  },
  {
    key: "convertTemperature",
    label: "Temperature",
    defaults: TEMPERATURE_TARGET_UNITS,
    labels: { C: "Celsius", F: "Fahrenheit", K: "Kelvin" },
  },
  {
    key: "convertMass",
    label: "Mass",
    defaults: MASS_TARGET_UNITS,
    labels: { g: "Grams", kg: "Kilograms", lb: "Pounds", oz: "Ounces" },
  },
  {
    key: "convertVolume",
    label: "Volume",
    defaults: VOLUME_TARGET_UNITS,
    labels: {
      ml: "Milliliters", l: "Liters", "m³": "Cubic Meters",
      "fl oz": "Fluid Ounces", gal: "Gallons", "ft³": "Cubic Feet",
      qt: "Quarts", pt: "Pints", "imp pt": "Pints (Imperial)",
      cup: "Cups", gi: "Gill", "imp gi": "Gill (Imperial)",
      tbsp: "Tablespoons", tsp: "Teaspoons",
    },
  },
  {
    key: "convertVelocity",
    label: "Velocity",
    defaults: VELOCITY_TARGET_UNITS,
    labels: {
      "m/s": "Meters/Second", "km/h": "Kilometers/Hour",
      mph: "Miles/Hour", "ft/s": "Feet/Second",
    },
  },
  {
    key: "convertCss",
    label: "CSS Units",
    defaults: CSS_TARGET_UNIT,
    labels: { px: "Pixels", rem: "Rem", em: "Em", vh: "Viewport Height", vw: "Viewport Width" },
  },
  {
    key: "convertArea",
    label: "Area",
    defaults: AREA_TARGET_UNITS,
    labels: {
      mm2: "Square Millimeters", cm2: "Square Centimeters", m2: "Square Meters",
      km2: "Square Kilometers", in2: "Square Inches", ft2: "Square Feet",
      yd2: "Square Yards", mi2: "Square Miles",
    },
  },
  {
    key: "convertDensity",
    label: "Density",
    defaults: DENSITY_DEFAULTS,
    labels: { kg_m3: "kg/m³", g_cm3: "g/cm³", lb_ft3: "lb/ft³", lb_in3: "lb/in³" },
  },
  {
    key: "convertBytes",
    label: "Data Size",
    defaults: DATA_SIZE_TARGET_UNITS,
    labels: {
      b: "Bytes", kb: "Kilobytes", kib: "Kibibytes", mb: "Megabytes",
      mib: "Mebibytes", gb: "Gigabytes", gib: "Gibibytes", tb: "Terabytes", tib: "Tebibytes",
    },
  },
];

export { TOOLTIP_TARGET_CATEGORIES };
