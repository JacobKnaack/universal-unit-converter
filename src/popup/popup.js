import {
  convertLength,
  convertTemperature,
  convertMass,
  convertCssUnits,
  convertVolume,
  convertVelocity,
  convertArea,
  convertDensity,
  convertBytes,
} from "@/content/converters/index.js";
import { defaultCategories } from "@/content/dom/walker";

/* -----------------------------
   ELEMENT REFERENCES
----------------------------- */

// Auto-conversion settings
const autoConvert = document.getElementById("autoConvert");
const status = document.getElementById("status");
const openOptionsBtn = document.getElementById("openOptionsBtn");

openOptionsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

const categoryCheckboxes = {
  convertLength: document.getElementById("convertLength"),
  convertMass: document.getElementById("convertMass"),
  convertVolume: document.getElementById("convertVolume"),
  convertVelocity: document.getElementById("convertVelocity"),
  convertTemperature: document.getElementById("convertTemperature"),
  convertCss: document.getElementById("convertCss"),
  convertArea: document.getElementById("convertArea"),
  convertDensity: document.getElementById('convertDensity'),
  convertBytes: document.getElementById('convertBytes'),
}

// Adds eventlistener to save settings after each click
Object.keys(categoryCheckboxes).forEach((key) => {
  const el = categoryCheckboxes[key];
  el.addEventListener("change", () => {
    const enabledCategories = Object.fromEntries(
      Object.keys(categoryCheckboxes).map((k) => [
        k,
        categoryCheckboxes[k].checked,
      ])
    );
    chrome.storage.sync.set({ enabledCategories }, showSaved);
  });
});

// Manual conversion elements
const manualCategory = document.getElementById("manualCategory");
const manualFrom = document.getElementById("manualFrom");
const manualTo = document.getElementById("manualTo");
const manualValue = document.getElementById("manualValue");
const swapUnitsBtn = document.getElementById("swapUnitsBtn");
const resultValue = document.getElementById("resultValue");
const resultUnit = document.getElementById("resultUnit");

/* -----------------------------
   SETTINGS SAVING
----------------------------- */

autoConvert.addEventListener("change", () => {
  chrome.storage.sync.set({ autoConvert: autoConvert.checked }, showSaved);
});

let tid = null;
function showSaved() {
  if (status) {
    status.textContent = "Saved!";
    if (tid === null) {
      tid = setTimeout(() => {
        status.textContent = "";
        tid = null;
      }, 1200);
    }
  }
}

/* -----------------------------
   UNIT MAPS FOR MANUAL MODE
----------------------------- */

const UNIT_MAP = {
  length: ["m", "cm", "km", "ft", "in", "mi"],
  temperature: ["C", "F", "K"],
  mass: ["g", "kg", "lb", "oz"],
  volume: ["ml", "l", "m³", "fl oz", "gal", "ft³"],
  velocity: ["m/s", "km/h", "mph", "ft/s"],
  css: ["px", "rem", "em", "vh", "vw"],
  area: ["mm²", "cm²", "m²", "km²", "in²", "ft²", "yd²", "mi²"],
  density: ["kg/m³", "g/cm³", "g/mL", "lb/ft³", "lb/in³"],
  bytes: ["B", "KB", "KiB", "MB", "MiB", "GB", "GiB", "TB", "TiB"],
};

/* -----------------------------
   POPULATE FROM/TO DROPDOWNS
----------------------------- */

function populateUnitDropdowns(category) {
  const units = UNIT_MAP[category];

  manualFrom.innerHTML = "";
  manualTo.innerHTML = "";

  units.forEach((u) => {
    const opt1 = document.createElement("option");
    opt1.value = u;
    opt1.textContent = u;

    const opt2 = document.createElement("option");
    opt2.value = u;
    opt2.textContent = u;

    manualFrom.appendChild(opt1);
    manualTo.appendChild(opt2);
  });

  // Default: from first unit to second unit
  if (units.length > 1) {
    manualTo.value = units[1];
  }
}

populateUnitDropdowns(manualCategory.value);

/* -----------------------------
   REMEMBER LAST MANUAL CONVERSION
----------------------------- */

// Restores the category/from/to/value the user last entered, so reopening
// the popup picks up where they left off instead of resetting to defaults.
function restoreLastManualConversion(last) {
  if (!last || !UNIT_MAP[last.category]) return;

  manualCategory.value = last.category;
  populateUnitDropdowns(last.category);

  if (UNIT_MAP[last.category].includes(last.fromUnit)) {
    manualFrom.value = last.fromUnit;
  }
  if (UNIT_MAP[last.category].includes(last.toUnit)) {
    manualTo.value = last.toUnit;
  }
  if (last.value !== undefined && last.value !== null) {
    manualValue.value = last.value;
  }

  handleLiveConversion();
}

function saveManualConversionState() {
  chrome.storage.sync.set({
    lastManualConversion: {
      category: manualCategory.value,
      fromUnit: manualFrom.value,
      toUnit: manualTo.value,
      value: manualValue.value,
    },
  });
}

// Typing fires an "input" event per keystroke — debounce the save so it
// doesn't spam chrome.storage.sync's write-rate limit while the live
// preview (handleLiveConversion) still updates instantly.
let saveValueTimeout = null;
function debouncedSaveManualConversionState() {
  clearTimeout(saveValueTimeout);
  saveValueTimeout = setTimeout(saveManualConversionState, 400);
}

/* -----------------------------
   MANUAL CONVERSION LOGIC
----------------------------- */

function convertManual(category, value, fromUnit, toUnit) {
  const v = parseFloat(value);
  if (isNaN(v)) return "Invalid number.";

  switch (category) {
    case "length":
      return convertLength(v, fromUnit, toUnit);

    case "temperature":
      return convertTemperature(v, fromUnit, toUnit);

    case "mass":
      return convertMass(v, fromUnit, toUnit);

    case "volume":
      return convertVolume(v, fromUnit, toUnit);

    case "velocity":
      return convertVelocity(v, fromUnit, toUnit);

    case "css":
      return convertCssUnits(v, fromUnit, toUnit);

    case "area":
      return convertArea(v, fromUnit, toUnit);

    case "density":
      return convertDensity(v, fromUnit, toUnit);

    case "bytes":
      return convertBytes(v, fromUnit, toUnit);

    default:
      return "Unsupported category.";
  }
}

/* -----------------------------
   REAL-TIME MANUAL CONVERSION LOGIC
----------------------------- */

function handleLiveConversion() {
  const category = manualCategory.value;
  const fromUnit = manualFrom.value;
  const toUnit = manualTo.value;
  const value = manualValue.value.trim();

  if (value === "") {
    resultValue.textContent = "0";
    resultUnit.textContent = fromUnit;
    return;
  }

  const output = convertManual(category, value, fromUnit, toUnit);

  if (!output || isNaN(output.value)) {
    resultValue.textContent = "Invalid entry";
    resultUnit.textContent = "";
    return;
  }

  resultValue.textContent = output.value.toFixed(4).replace(/\.?0+$/, ""); // Trims trailing zeros clean
  resultUnit.textContent = output.unit;
}

manualValue.addEventListener("input", () => {
  handleLiveConversion();
  debouncedSaveManualConversionState();
});
manualFrom.addEventListener("change", () => {
  handleLiveConversion();
  saveManualConversionState();
});
manualTo.addEventListener("change", () => {
  handleLiveConversion();
  saveManualConversionState();
});

manualCategory.addEventListener("change", () => {
  populateUnitDropdowns(manualCategory.value);
  handleLiveConversion();
  saveManualConversionState();
});

swapUnitsBtn.addEventListener("click", () => {
  const currentFrom = manualFrom.value;
  manualFrom.value = manualTo.value;
  manualTo.value = currentFrom;

  handleLiveConversion();
  saveManualConversionState();
});

// Run a starting calculation loop once on popup load (immediately, before
// the async storage read resolves — restoreLastManualConversion() will
// re-run this again if a previous conversion is found).
handleLiveConversion();

/* -----------------------------
   SETTINGS LOADING
----------------------------- */

// Placed last, after every function/constant it references (populateUnitDropdowns,
// handleLiveConversion, restoreLastManualConversion, UNIT_MAP) has already been
// defined above — the bundler doesn't preserve function-declaration hoisting
// once minified, so calling any of these before their own definition runs
// would throw a "Cannot access before initialization" error.
chrome.storage.sync.get(
  ["autoConvert", "enabledCategories", "lastManualConversion"],
  (data) => {
    autoConvert.checked = data.autoConvert ?? false;

    const cats = data.enabledCategories ?? defaultCategories;

    const {
      convertLength: lengthBox,
      convertMass: massBox,
      convertVolume: volumeBox,
      convertVelocity: velocityBox,
      convertTemperature: tempBox,
      convertCss: cssBox,
      convertArea: areaBox,
      convertDensity: densityBox,
      convertBytes: bytesBox,
    } = categoryCheckboxes;

    lengthBox.checked = cats.convertLength;
    massBox.checked = cats.convertMass;
    volumeBox.checked = cats.convertVolume;
    velocityBox.checked = cats.convertVelocity;
    tempBox.checked = cats.convertTemperature;
    cssBox.checked = cats.convertCss;
    areaBox.checked = cats.convertArea;
    densityBox.checked = cats.convertDensity;
    bytesBox.checked = cats.convertBytes;

    restoreLastManualConversion(data.lastManualConversion);
  }
);
