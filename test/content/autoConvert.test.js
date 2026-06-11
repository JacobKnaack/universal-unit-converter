import { describe, it, expect, vi, beforeEach } from "vitest";

let enableConversion;
let disableConversion;

global.MutationObserver = vi.fn(function () {
  this.observe = vi.fn();
  this.disconnect = vi.fn();
});

beforeEach(async () => {
  vi.resetModules();
  document.body.innerHTML = `<p>10 cm</p>`;
  const mod = await import("@/content/dom/walker.js");
  enableConversion = mod.enableConversion;
  disableConversion = mod.disableConversion;
});

describe("auto-convert toggle behavior", () => {
  it("converts text when enableConversion is called", () => {
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, node.nodeValue);

    enableConversion({ observer: null, textMap: map });

    expect(node.nodeValue).toMatch(/\(.+in\)/);
  });

  it("reverts text when disableConversion is called", () => {
    const map = new Map();
    const node = document.querySelector("p").firstChild;

    map.set(node, "10 cm");
    node.nodeValue = "10 cm (3.94 in)";

    disableConversion({ observer: null, textMap: map });

    expect(node.nodeValue).toBe("10 cm");
  });
});

