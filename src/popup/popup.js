import {
  convertLength,
  convertTemperature,
  convertMass,
  convertCssUnits
} from "@/content/converters/index.js";

const systemSelect = document.getElementById("system");
const cssUnitSelect = document.getElementById("cssUnitSystem");
const autoConvert = document.getElementById("autoConvert");
const status = document.getElementById("status");
const convertInput = document.getElementById("convertInput");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");

// Load all settings at once
chrome.storage.sync.get(
  ["autoConvert", "unitSystem", "cssUnitSystem"],
  (data) => {
    autoConvert.checked = data.autoConvert ?? true;
    systemSelect.value = data.unitSystem ?? "imperial";
    cssUnitSelect.value = data.cssUnitSystem ?? "px";
  }
);

// Save autoConvert
autoConvert.addEventListener("change", () => {
  chrome.storage.sync.set({ autoConvert: autoConvert.checked }, showSaved);
});

// Save metric/imperial system
systemSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ unitSystem: systemSelect.value }, showSaved);
});

// Save CSS unit system (px or rem)
cssUnitSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ cssUnitSystem: cssUnitSelect.value }, showSaved);
});

// Small helper for UI feedback
function showSaved() {
  status.textContent = "Saved!";
  setTimeout(() => (status.textContent = ""), 1200);
}

// Unified converter
function convertAny(value, unit, unitSystem, cssUnitSystem) {
  const u = unit.toLowerCase();

  // Temperature
  const t = convertTemperature(value, u);
  if (t) return `${value} ${unit} = ${t.value.toFixed(2)} ${t.unit}`;

  // Length
  const l = convertLength(value, u, unitSystem);
  if (l) return `${value} ${unit} = ${l.value.toFixed(2)} ${l.unit}`;

  // Mass
  const m = convertMass(value, u, unitSystem);
  if (m) return `${value} ${unit} = ${m.value.toFixed(2)} ${m.unit}`;

  // CSS Units (px, rem, em, vh, vw)
  const c = convertCssUnits(value, u, cssUnitSystem);
  if (c) return `${value} ${unit} = ${c.value.toFixed(2)} ${c.unit}`;

  return "Unsupported unit.";
}

// Handle Convert button
convertBtn.addEventListener("click", () => {
  const input = convertInput.value.trim();

  // Match: number + unit (letters or °)
  const match = input.match(/(\d+(\.\d+)?)\s*([a-zA-Z°]+)/);

  if (!match) {
    result.textContent = "Invalid format. Try: 12 m, 32 F, 10 kg, 16px";
    return;
  }

  const value = parseFloat(match[1]);
  const unit = match[3];
  const unitSystem = systemSelect.value;
  const cssUnitSystem = cssUnitSelect.value;

  const output = convertAny(value, unit, unitSystem, cssUnitSystem);
  result.textContent = output;
});
