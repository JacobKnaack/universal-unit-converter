const systemSelect = document.getElementById("system");
const status = document.getElementById("status");

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
