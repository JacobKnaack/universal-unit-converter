import { describe, it, expect, beforeEach } from "vitest";
import { walkAndConvert } from "@/content/dom/walker.js";

describe("walkAndConvert()", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("converts length units inside text nodes", () => {
    document.body.innerHTML = `<p>The board is 10 cm long.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span).not.toBeNull();
    expect(span.textContent).toBe("10 cm");
    expect(span.dataset.tooltip).toMatch(/^\d+\.\d{2} in$/);

    // Visible text stays unchanged — no inline parenthetical
    expect(document.body.textContent).toContain("The board is 10 cm long.");
    expect(document.body.textContent).not.toContain("(");
  });

  it("converts temperature units", () => {
    document.body.innerHTML = `<p>It is 30 C outside.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span.textContent).toBe("30 C");
    expect(span.dataset.tooltip).toMatch(/^\d+\.\d{2} F$/);
  });

  it("converts mass units", () => {
    document.body.innerHTML = `<p>The bag weighs 5 kg.</p>`;

    walkAndConvert(document.body, undefined);

    const span = document.querySelector(".uuc-unit");
    expect(span.textContent).toBe("5 kg");
    expect(span.dataset.tooltip).toMatch(/^\d+\.\d{2} lb$/);
  });

  it("wraps the converted text with a purple-underline span and a tooltip attribute", () => {
    document.body.innerHTML = `<p>The board is 10 cm long.</p>`;

    walkAndConvert(document.body, undefined);

    const wrapper = document.querySelector(".uuc-text-wrapper");
    const span = wrapper.querySelector(".uuc-unit");

    expect(span).not.toBeNull();
    expect(span.hasAttribute("data-tooltip")).toBe(true);
  });

  it("does not re-wrap already-converted text on a second pass", () => {
    document.body.innerHTML = `<p>The board is 10 cm long.</p>`;

    walkAndConvert(document.body, undefined);
    walkAndConvert(document.body, undefined);

    // Exactly one wrapper/span pair, not nested or duplicated
    expect(document.querySelectorAll(".uuc-text-wrapper").length).toBe(1);
    expect(document.querySelectorAll(".uuc-unit").length).toBe(1);
    expect(document.body.textContent).toContain("The board is 10 cm long.");
  });

  it("ignores text without units", () => {
    document.body.innerHTML = `<p>Hello world</p>`;

    walkAndConvert(document.body, undefined);

    expect(document.body.textContent).toBe("Hello world");
    expect(document.querySelector(".uuc-unit")).toBeNull();
  });

  it("converts units inside newly added DOM nodes (MutationObserver simulation)", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    const newNode = document.createElement("p");
    newNode.textContent = "The table is 2 m wide.";
    container.appendChild(newNode);

    walkAndConvert(container, undefined);

    const span = container.querySelector(".uuc-unit");
    expect(span.textContent).toBe("2 m");
    expect(span.dataset.tooltip).toMatch(/^\d+\.\d{2} ft$/);
  });

  it("handles multiple units in the same text node", () => {
    document.body.innerHTML = `<p>10 cm and 5 kg and 20 C</p>`;

    walkAndConvert(document.body, undefined);

    const spans = document.querySelectorAll(".uuc-unit");
    const byText = Array.from(spans).reduce((acc, s) => {
      acc[s.textContent] = s.dataset.tooltip;
      return acc;
    }, {});

    expect(byText["10 cm"]).toMatch(/^\d+\.\d{2} in$/);
    expect(byText["5 kg"]).toMatch(/^\d+\.\d{2} lb$/);
    expect(byText["20 C"]).toMatch(/^\d+\.\d{2} F$/);

    // All three matches live inside a single wrapper for that text node
    expect(document.querySelectorAll(".uuc-text-wrapper").length).toBe(1);
  });

  it("does not convert nonsense text that only looks like it might contain units", () => {
    document.body.innerHTML = `
      <p>aisdfhuwhfkasf17834234mfwuihfq87yf</p>
      <p>123abc456def789</p>
      <p>foo99bar88baz77</p>
    `;

    walkAndConvert(document.body, undefined);

    const text = document.body.textContent;

    // Should remain EXACTLY the same — no conversions
    expect(text).toContain("aisdfhuwhfkasf17834234mfwuihfq87yf");
    expect(text).toContain("123abc456def789");
    expect(text).toContain("foo99bar88baz77");

    expect(document.querySelector(".uuc-unit")).toBeNull();
  });

  it("does not convert units or numbers inside URLs", () => {
    document.body.innerHTML = `
      <p>
        Check this link: https://example.com/path/10cm/image.png?size=20m&foo=30C
      </p>
    `;

    walkAndConvert(document.body, undefined);

    const text = document.body.textContent.trim();

    // URL should remain EXACTLY the same
    expect(text).toContain("https://example.com/path/10cm/image.png?size=20m&foo=30C");

    expect(document.querySelector(".uuc-unit")).toBeNull();
  });
});
