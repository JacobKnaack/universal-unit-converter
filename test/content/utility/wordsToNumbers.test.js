import { describe, it, expect, vi } from "vitest";
import wordsToNumber, { parseNumberToken, WORD_NUMBER_SOURCE } from "@/content/utility/wordsToNumbers.js";

describe("wordsToNumber", () => {
  it("parses zero through nineteen", () => {
    expect(wordsToNumber("zero")).toBe(0);
    expect(wordsToNumber("one")).toBe(1);
    expect(wordsToNumber("nine")).toBe(9);
    expect(wordsToNumber("ten")).toBe(10);
    expect(wordsToNumber("thirteen")).toBe(13);
    expect(wordsToNumber("nineteen")).toBe(19);
  });

  it("parses bare tens", () => {
    expect(wordsToNumber("twenty")).toBe(20);
    expect(wordsToNumber("fifty")).toBe(50);
    expect(wordsToNumber("ninety")).toBe(90);
  });

  it("parses hyphenated compound numbers (twenty-one through ninety-nine)", () => {
    expect(wordsToNumber("twenty-one")).toBe(21);
    expect(wordsToNumber("thirty-two")).toBe(32);
    expect(wordsToNumber("forty-five")).toBe(45);
    expect(wordsToNumber("ninety-nine")).toBe(99);
  });

  it("parses space-separated compound numbers the same way as hyphenated ones", () => {
    expect(wordsToNumber("twenty one")).toBe(21);
    expect(wordsToNumber("ninety nine")).toBe(99);
  });

  it("is case-insensitive", () => {
    expect(wordsToNumber("Twenty-Five")).toBe(25);
    expect(wordsToNumber("NINETY NINE")).toBe(99);
  });

  it("parses hundreds", () => {
    expect(wordsToNumber("one hundred")).toBe(100);
    expect(wordsToNumber("three hundred")).toBe(300);
    expect(wordsToNumber("nine hundred ninety-nine")).toBe(999);
  });

  it("filters out the filler word 'and'", () => {
    expect(wordsToNumber("one hundred and twenty-three")).toBe(123);
    expect(wordsToNumber("one hundred and one")).toBe(101);
  });

  it("parses thousands", () => {
    expect(wordsToNumber("one thousand")).toBe(1000);
    expect(wordsToNumber("twenty thousand")).toBe(20000);
    expect(wordsToNumber("two thousand three hundred forty-five")).toBe(2345);
  });

  it("parses millions and billions", () => {
    expect(wordsToNumber("one million")).toBe(1000000);
    expect(wordsToNumber("one million two hundred thousand")).toBe(1200000);
    expect(wordsToNumber("one billion")).toBe(1000000000);
  });

  it("handles a large mixed-magnitude phrase", () => {
    // 1,234,567
    expect(
      wordsToNumber("one million two hundred thirty-four thousand five hundred sixty-seven")
    ).toBe(1234567);
  });

  it("tolerates extra/irregular whitespace", () => {
    expect(wordsToNumber("  twenty   five  ")).toBe(25);
    expect(wordsToNumber("one\thundred")).toBe(100);
  });

  it("strips punctuation other than hyphens", () => {
    expect(wordsToNumber("one hundred, twenty-three.")).toBe(123);
  });

  it("returns 0 for empty input", () => {
    expect(wordsToNumber("")).toBe(0);
  });

  it("ignores unrecognized words and warns instead of throwing", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(wordsToNumber("banana twenty-two")).toBe(22);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("banana"));

    warnSpy.mockRestore();
  });
});

describe("parseNumberToken", () => {
  it("parses digit tokens, including thousands separators, as numbers", () => {
    expect(parseNumberToken("10")).toBe(10);
    expect(parseNumberToken("3.5")).toBe(3.5);
    expect(parseNumberToken("1,234.5")).toBe(1234.5);
  });

  it("parses word tokens via wordsToNumber", () => {
    expect(parseNumberToken("twenty-five")).toBe(25);
    expect(parseNumberToken("one hundred and three")).toBe(103);
  });

  it("trims surrounding whitespace before deciding which parser to use", () => {
    expect(parseNumberToken("  42  ")).toBe(42);
    expect(parseNumberToken("  forty-two  ")).toBe(42);
  });
});

describe("WORD_NUMBER_SOURCE", () => {
  function wordNumberRegex() {
    return new RegExp(`^(?:${WORD_NUMBER_SOURCE})$`, "i");
  }

  it("matches single number words and hyphenated/spaced compounds", () => {
    const re = wordNumberRegex();
    expect(re.test("ten")).toBe(true);
    expect(re.test("twenty-five")).toBe(true);
    expect(re.test("twenty five")).toBe(true);
    expect(re.test("one hundred and twenty-three")).toBe(true);
  });

  it("does not match plain prose with no number words", () => {
    const re = wordNumberRegex();
    expect(re.test("hello world")).toBe(false);
  });

  it("prefers the longer word over a shorter one that prefixes it (seventeen vs seven)", () => {
    const re = new RegExp(`^(?:${WORD_NUMBER_SOURCE})`, "i");
    const match = "seventeen".match(re);
    expect(match[0]).toBe("seventeen");
  });
});
