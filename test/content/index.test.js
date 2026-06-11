import { describe, it, expect, vi, beforeEach } from "vitest";

// We will mock walker.js so we can observe calls to enable/disable
vi.mock("@/content/dom/walker.js", () => ({
  enableConversion: vi.fn(),
  disableConversion: vi.fn()
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
    listener({ autoConvert: { newValue: true } });

    expect(enableConversion).toHaveBeenCalledTimes(1);

    // Simulate a toggle OFF
    listener({ autoConvert: { newValue: false } });

    expect(disableConversion).toHaveBeenCalledTimes(1);
  });
});
