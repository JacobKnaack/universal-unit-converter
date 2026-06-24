import {
  convertLength,
  convertTemperature,
  convertMass,
  convertCssUnits,
  convertVolume,
  convertVelocity,
  convertArea,
} from "@/content/converters/index.js";
import { defaultCategories } from "@/content/dom/walker";

/* -----------------------------
   ELEMENT REFERENCES
----------------------------- */

// Auto-conversion settings
const systemSelect = document.getElementById("system");
const cssUnitSelect = document.getElementById("cssUnitSystem");
const autoConvert = document.getElementById("autoConvert");
const status = document.getElementById("status");

const categoryCheckboxes = {
  convertLength: document.getElementById("convertLength"),
  convertMass: document.getElementById("convertMass"),
  convertVolume: document.getElementById("convertVolume"),
  convertVelocity: document.getElementById("convertVelocity"),
  convertTemperature: document.getElementById("convertTemperature"),
  convertCss: document.getElementById("convertCss"),
  convertArea: document.getElementById("convertArea"),
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
const manualConvertBtn = document.getElementById("manualConvertBtn");
const result = document.getElementById("result");

/* -----------------------------
   SETTINGS LOADING
----------------------------- */

chrome.storage.sync.get(
  ["autoConvert", "unitSystem", "cssUnitSystem", "enabledCategories"],
  (data) => {
    autoConvert.checked = data.autoConvert ?? false;
    systemSelect.value = data.unitSystem ?? "imperial";
    cssUnitSelect.value = data.cssUnitSystem ?? "px";

    const cats = data.enabledCategories ?? defaultCategories;

    const {
      convertLength: lengthBox,
      convertMass: massBox,
      convertVolume: volumeBox,
      convertVelocity: velocityBox,
      convertTemperature: tempBox,
      convertCss: cssBox,
      convertArea: areaBox,
    } = categoryCheckboxes;

    lengthBox.checked = cats.convertLength;
    massBox.checked = cats.convertMass;
    volumeBox.checked = cats.convertVolume;
    velocityBox.checked = cats.convertVelocity;
    tempBox.checked = cats.convertTemperature;
    cssBox.checked = cats.convertCss;
    areaBox.checked = cats.convertArea;
  }
);

/* -----------------------------
   SETTINGS SAVING
----------------------------- */

autoConvert.addEventListener("change", () => {
  chrome.storage.sync.set({ autoConvert: autoConvert.checked }, showSaved);
});

systemSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ unitSystem: systemSelect.value }, showSaved);
});

cssUnitSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ cssUnitSystem: cssUnitSelect.value }, showSaved);
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
  temperature: ["C", "F"],
  mass: ["g", "kg", "lb", "oz"],
  volume: ["ml", "l", "m³", "fl oz", "gal", "ft³"],
  velocity: ["m/s", "km/h", "mph", "ft/s"],
  css: ["px", "rem", "em", "vh", "vw"],
  area: ["mm²", "cm²", "m²", "km²", "in²", "ft²", "yd²", "mi²"], 
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

  // Default: from first unit → to second unit
  if (units.length > 1) {
    manualTo.value = units[1];
  }
}

// Initialize dropdowns on load
populateUnitDropdowns(manualCategory.value);

// Update when category changes
manualCategory.addEventListener("change", () => {
  populateUnitDropdowns(manualCategory.value);
});

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

    default:
      return "Unsupported category.";
  }
}

manualConvertBtn.addEventListener("click", () => {
  const category = manualCategory.value;
  const fromUnit = manualFrom.value;
  const toUnit = manualTo.value;
  const value = manualValue.value.trim();

  const output = convertManual(category, value, fromUnit, toUnit);

  if (!output) {
    result.textContent = "Conversion not supported.";
    return;
  }

  // All converter functions return { value, unit }
  result.textContent = `${value} ${fromUnit} = ${output.value.toFixed(4)} ${output.unit}`;
});
