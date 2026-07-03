import { describe, it, expect } from "vitest";
import {
  TEMPERATURE_REGEX,
  NORMALIZE_TEMP,
  TEMPERATURE_TARGET_UNITS,
  convertTemperature,
} from "@/content/converters/temperature.js";

function reset(re) {
  re.lastIndex = 0;
}

describe("Temperature converter", () => {
  it("regex matches C and F in their various forms", () => {
    const samples = ["20C", "20 C", "68F", "68 F", "20°C", "68°F", "20 celsius", "68 fahrenheit"];

    for (const s of samples) {
      reset(TEMPERATURE_REGEX);
      expect(TEMPERATURE_REGEX.test(s)).toBe(true);
    }
  });

  it("regex also matches word-based numbers, not just digits", () => {
    const cases = [
      ["thirty c", "thirty", "c"],
      ["sixty-eight f", "sixty-eight", "f"],
      ["one hundred celsius", "one hundred", "celsius"],
    ];

    for (const [sample, expectedNumber, expectedUnit] of cases) {
      reset(TEMPERATURE_REGEX);
      const match = TEMPERATURE_REGEX.exec(sample);
      expect(match[1]).toBe(expectedNumber);
      expect(match[2]).toBe(expectedUnit);
    }
  });

  it("does not mistake ordinary words for number words mid-sentence", () => {
    reset(TEMPERATURE_REGEX);
    expect(TEMPERATURE_REGEX.test("please pay attention")).toBe(false);
  });

  it("does NOT match bare Kelvin — 'k' collides too often with shorthand like '10k'", () => {
    const samples = ["300K", "300 K", "300°K", "300 kelvin", "10k", "10k views", "$10k"];

    for (const s of samples) {
      reset(TEMPERATURE_REGEX);
      expect(TEMPERATURE_REGEX.test(s)).toBe(false);
    }
  });

  it("normalizes Kelvin spellings for direct/manual conversion use", () => {
    expect(NORMALIZE_TEMP["k"]).toBe("K");
    expect(NORMALIZE_TEMP["°k"]).toBe("K");
    expect(NORMALIZE_TEMP["kelvin"]).toBe("K");
  });

  it("maps every unit to the other two", () => {
    expect(TEMPERATURE_TARGET_UNITS.C).toEqual(["F", "K"]);
    expect(TEMPERATURE_TARGET_UNITS.F).toEqual(["C", "K"]);
    expect(TEMPERATURE_TARGET_UNITS.K).toEqual(["C", "F"]);
  });

  it("converts C -> F and F -> C", () => {
    expect(convertTemperature(0, "C", "F").value).toBeCloseTo(32);
    expect(convertTemperature(100, "C", "F").value).toBeCloseTo(212);
    expect(convertTemperature(32, "F", "C").value).toBeCloseTo(0);
    expect(convertTemperature(212, "F", "C").value).toBeCloseTo(100);
  });

  it("converts C -> K and K -> C", () => {
    expect(convertTemperature(0, "C", "K").value).toBeCloseTo(273.15);
    expect(convertTemperature(100, "C", "K").value).toBeCloseTo(373.15);
    expect(convertTemperature(273.15, "K", "C").value).toBeCloseTo(0);
    expect(convertTemperature(0, "K", "C").value).toBeCloseTo(-273.15);
  });

  it("converts F -> K and K -> F", () => {
    expect(convertTemperature(32, "F", "K").value).toBeCloseTo(273.15);
    expect(convertTemperature(212, "F", "K").value).toBeCloseTo(373.15);
    expect(convertTemperature(273.15, "K", "F").value).toBeCloseTo(32);
    expect(convertTemperature(0, "K", "F").value).toBeCloseTo(-459.67, 1);
  });

  it("returns identity conversion when units match, including K -> K", () => {
    expect(convertTemperature(42, "K", "K")).toEqual({ value: 42, unit: "K" });
    expect(convertTemperature(42, "C", "C")).toEqual({ value: 42, unit: "C" });
  });

  it("returns null for invalid units", () => {
    expect(convertTemperature(10, "foo", "C")).toBeNull();
    expect(convertTemperature(10, "C", "bar")).toBeNull();
  });
});
