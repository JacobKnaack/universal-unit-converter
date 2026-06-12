import {
  convertLength,
  convertTemperature,
  convertMass,
} from "@/content/converters/index.js";

const systemSelect = document.getElementById("system");
const status = document.getElementById("status");
const convertInput = document.getElementById("convertInput");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");
const autoConvert = document.getElementById("autoConvert");

// Load both settings at once
chrome.storage.sync.get(["autoConvert", "unitSystem"], (data) => {
  autoConvert.checked = data.autoConvert ?? true;      // default ON
  systemSelect.value = data.unitSytem ?? "imperial"; // default imperial
});

// Save autoConvert toggle
autoConvert.addEventListener("change", () => {
  chrome.storage.sync.set({ autoConvert: autoConvert.checked }, () => {
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1200);
  });
});

// Save system selection
systemSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ unitSystem: systemSelect.value }, () => {
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1200);
  });
});

// Unified converter
function convertAny(value, unit, unitSystem) {
  const u = unit.toLowerCase();

  // Temperature
  const t = convertTemperature(value, u);
  if (t) {
    return `${value} ${unit} = ${t.value.toFixed(2)} ${t.unit}`;
  }

  // Length
  const l = convertLength(value, u, unitSystem);
  if (l) {
    return `${value} ${unit} = ${l.value.toFixed(2)} ${l.unit}`;
  }

  // Mass
  const m = convertMass(value, u, unitSystem);
  if (m) {
    return `${value} ${unit} = ${m.value.toFixed(2)} ${m.unit}`;
  }

  return "Unsupported unit.";
}

// Handle Convert button
convertBtn.addEventListener("click", () => {
  const input = convertInput.value.trim();

  const match = input.match(/(\d+(\.\d+)?)\s*([a-zA-Z°]+)/);

  if (!match) {
    result.textContent = "Invalid format. Try: 12 m, 32 F, 10 kg";
    return;
  }

  const value = parseFloat(match[1]);
  const unit = match[3];
  const unitSystem = systemSelect.value;

  const output = convertAny(value, unit, unitSystem);
  result.textContent = output;
});

