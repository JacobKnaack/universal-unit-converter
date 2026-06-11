import {
  convertLength,
  LENGTH_REGEX,
  convertTemperature,
  TEMPERATURE_REGEX,
  convertMass,
  MASS_REGEX
} from "@/content/converters/index.js";

const systemSelect = document.getElementById("system");
const status = document.getElementById("status");
const convertInput = document.getElementById("convertInput");
const convertBtn = document.getElementById("convertBtn");
const result = document.getElementById("result");

// Load saved setting
chrome.storage.sync.get(["targetSystem"], (data) => {
  if (data.targetSystem) {
    systemSelect.value = data.targetSystem;
  }
});

// Save on change
systemSelect.addEventListener("change", () => {
  chrome.storage.sync.set({ targetSystem: systemSelect.value }, () => {
    status.textContent = "Saved!";
    setTimeout(() => (status.textContent = ""), 1200);
  });
});

// Unified converter
function convertAny(value, unit, targetSystem) {
  const u = unit.toLowerCase();

  // Temperature
  const t = convertTemperature(value, u);
  if (t) {
    return `${value} ${unit} = ${t.value.toFixed(2)} ${t.unit}`;
  }

  // Length
  const l = convertLength(value, u, targetSystem);
  if (l) {
    return `${value} ${unit} = ${l.value.toFixed(2)} ${l.unit}`;
  }

  // Mass
  const m = convertMass(value, u, targetSystem);
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
  const targetSystem = systemSelect.value;

  const output = convertAny(value, unit, targetSystem);
  result.textContent = output;
});

