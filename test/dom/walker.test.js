import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert } from "@/content/dom/walker.js";

import {
  convertLength,
  convertTemperature,
  convertMass,
} from "@/content/converters/index.js";

describe("walkAndConvert()", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("converts length units inside text nodes", () => {
    document.body.innerHTML = `<p>The board is 10 cm long.</p>`;

    walkAndConvert(document.body);

    const text = document.body.textContent;
    expect(text).toMatch(/10 cm \(\d+\.\d{2} in\)/);
  });

  it("converts temperature units", () => {
    document.body.innerHTML = `<p>It is 30 C outside.</p>`;

    walkAndConvert(document.body);

    const text = document.body.textContent;
    expect(text).toMatch(/30 C \(\d+\.\d{2} F\)/);
  });

  it("converts mass units", () => {
    document.body.innerHTML = `<p>The bag weighs 5 kg.</p>`;

    walkAndConvert(document.body);

    const text = document.body.textContent;
    expect(text).toMatch(/5 kg \(\d+\.\d{2} lb\)/);
  });

  it("does not double‑convert already converted text", () => {
    document.body.innerHTML = `<p>The board is 10 cm (3.94 in).</p>`;

    walkAndConvert(document.body);
    walkAndConvert(document.body);

    const text = document.body.textContent;

    // Should appear exactly once
    expect(text.match(/10 cm/g).length).toBe(1);
    expect(text.match(/\(/g).length).toBe(1);
  });

  it("ignores text without units", () => {
    document.body.innerHTML = `<p>Hello world</p>`;

    walkAndConvert(document.body);

    expect(document.body.textContent).toBe("Hello world");
  });

  it("converts units inside newly added DOM nodes (MutationObserver simulation)", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const newNode = document.createElement("p");
    newNode.textContent = "The table is 2 m wide.";
    container.appendChild(newNode);

    walkAndConvert(container);

    expect(container.textContent).toMatch(/2 m \(\d+\.\d{2} ft\)/);
  });

  it("handles multiple units in the same text node", () => {
    document.body.innerHTML = `<p>10 cm and 5 kg and 20 C</p>`;

    walkAndConvert(document.body);

    const text = document.body.textContent;

    expect(text).toMatch(/10 cm \(\d+\.\d{2} in\)/);
    expect(text).toMatch(/5 kg \(\d+\.\d{2} lb\)/);
    expect(text).toMatch(/20 C \(\d+\.\d{2} F\)/);
  });

  it("does not convert nonsense text that only looks like it might contain units", () => {
    document.body.innerHTML = `
        <p>aisdfhuwhfkasf17834234mfwuihfq87yf</p>
        <p>123abc456def789</p>
        <p>foo99bar88baz77</p>
    `;

    walkAndConvert(document.body);

    const text = document.body.textContent;

    // Should remain EXACTLY the same — no conversions
    expect(text).toContain("aisdfhuwhfkasf17834234mfwuihfq87yf");
    expect(text).toContain("123abc456def789");
    expect(text).toContain("foo99bar88baz77");

    // Should NOT contain parentheses from conversions
    expect(text.includes("(")).toBe(false); 
  });

  it("does not convert units or numbers inside URLs", () => {
    document.body.innerHTML = `
      <p>
        Check this link: https://example.com/path/10cm/image.png?size=20m&foo=30C
      </p>
    `;

    walkAndConvert(document.body);

    const text = document.body.textContent.trim();

    // URL should remain EXACTLY the same
    expect(text).toContain("https://example.com/path/10cm/image.png?size=20m&foo=30C");

    // Should NOT contain any converted parentheses
    expect(text.includes("(")).toBe(false);

    // Should NOT convert embedded unit-like substrings
    expect(text).not.toMatch(/\(\d+\.\d{2}/); // no converted values
  });
});
