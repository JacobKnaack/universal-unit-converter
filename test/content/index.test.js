import { describe, it, expect, vi, beforeEach } from "vitest";

// We will mock walker.js so we can observe calls to enable/disable
vi.mock("@/content/dom/walker.js", () => ({
  enableConversion: vi.fn(),
  disableConversion: vi.fn(),
  defaultCategories: { },
}));

let enableConversion;
let disableConversion;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  // Mock chrome.storage
  global.chrome = {
    storage: {
      sync: {
        get: vi.fn(),
        set: vi.fn()
      },
      onChanged: {
        addListener: vi.fn()
      }
    }
  };

  // Import the mocked functions
  const walker = await import("@/content/dom/walker.js");
  enableConversion = walker.enableConversion;
  disableConversion = walker.disableConversion;
});

describe("content/index.js storage behavior", () => {
  it("calls enableConversion when autoConvert is true", async () => {
    chrome.storage.sync.get.mockImplementation((keys, cb) =>
      cb({ autoConvert: true })
    );

    await import("@/content/index.js");

    expect(enableConversion).toHaveBeenCalledTimes(1);
    expect(disableConversion).not.toHaveBeenCalled();
  });

  it("does NOT call enableConversion when autoConvert is false", async () => {
    chrome.storage.sync.get.mockImplementation((keys, cb) =>
      cb({ autoConvert: false })
    );

    await import("@/content/index.js");

    expect(enableConversion).not.toHaveBeenCalled();
    expect(disableConversion).not.toHaveBeenCalled();
  });

  it("responds to storage changes", async () => {
    chrome.storage.sync.get.mockImplementation((keys, cb) =>
      cb({ autoConvert: false })
    );

    await import("@/content/index.js");

    // Simulate a toggle ON
    const listener = chrome.storage.onChanged.addListener.mock.calls[0][0];
    chrome.storage.sync.get.mockImplementation((keys, cb) =>
      cb({
        autoConvert: true,
        enabledCategories: { convertLength: true }
      })
    );

    listener({ autoConvert: { newValue: true } });

    expect(enableConversion).toHaveBeenCalledTimes(1);

    // --- Simulate toggle OFF ---
    chrome.storage.sync.get.mockImplementation((keys, cb) =>
      cb({
        autoConvert: false,
        enabledCategories: { convertLength: true }
      })
    );
    listener({ autoConvert: { newValue: false } });

    expect(disableConversion).toHaveBeenCalledTimes(1);
  });

  it("applies tooltip settings on load", async () => {
    chrome.storage.sync.get.mockImplementation((keys, cb) =>
      cb({ autoConvert: false, tooltipSettings: { underlineColor: "#123456" } })
    );

    await import("@/content/index.js");

    expect(document.documentElement.style.getPropertyValue("--uuc-underline-color")).toBe("#123456");
  });

  it("re-applies tooltip settings when they change, without touching auto-convert state", async () => {
    chrome.storage.sync.get.mockImplementation((keys, cb) =>
      cb({ autoConvert: false })
    );

    await import("@/content/index.js");

    const listener = chrome.storage.onChanged.addListener.mock.calls[0][0];
    listener({ tooltipSettings: { newValue: { underlineColor: "#abcdef" } } });

    expect(document.documentElement.style.getPropertyValue("--uuc-underline-color")).toBe("#abcdef");
    expect(enableConversion).not.toHaveBeenCalled();
    expect(disableConversion).not.toHaveBeenCalled();
  });
});
