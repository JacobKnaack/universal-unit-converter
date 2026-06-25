import {
  DATA_SIZE_REGEX,
  NORMALIZE_DATA_SIZE_UNIT,
  DATA_SIZE_TARGET_UNITS,
  convertBytes,
} from "@/content/converters/bytes.js";

describe("Data Size Converter", () => {

  // -----------------------------
  // REGEX MATCHING
  // -----------------------------
  it("matches valid data size units", () => {
    const samples = [
      "10 KB",
      "5kb",
      "3 MB",
      "3mb",
      "1 GB",
      "2gb",
      "4 TB",
      "4tb",
      "512 B",
      "12 KiB",
      "8 MiB",
      "1 GiB",
      "2 TiB",
    ];

    for (const s of samples) {
      expect(s.match(DATA_SIZE_REGEX)).not.toBeNull();
    }
  });

  it("does NOT match non‑data units", () => {
    const samples = [
      "10m",      // meters
      "5g",       // grams
      "20C",      // temperature
      "30px",     // css
      "100ft",    // length
      "50mph",    // velocity
    ];

    for (const s of samples) {
      expect(s.match(DATA_SIZE_REGEX)).toBeNull();
    }
  });

  // -----------------------------
  // NORMALIZATION
  // -----------------------------
  it("normalizes units correctly", () => {
    expect(NORMALIZE_DATA_SIZE_UNIT["KB".toLowerCase()]).toBe("kb");
    expect(NORMALIZE_DATA_SIZE_UNIT["MiB".toLowerCase()]).toBe("mib");
    expect(NORMALIZE_DATA_SIZE_UNIT["bytes"]).toBe("b");
    expect(NORMALIZE_DATA_SIZE_UNIT["tb"]).toBe("tb");
  });

  // -----------------------------
  // CONVERSION: METRIC
  // -----------------------------
  it("converts metric units correctly", () => {
    const result = convertBytes(1, "gb", "mb");
    expect(result.value).toBeCloseTo(1000);
    expect(result.unit).toBe("mb");
  });

  it("converts MB → KB", () => {
    const result = convertBytes(2, "mb", "kb");
    expect(result.value).toBeCloseTo(2000);
    expect(result.unit).toBe("kb");
  });

  // -----------------------------
  // CONVERSION: BINARY
  // -----------------------------
  it("converts GiB → MiB", () => {
    const result = convertBytes(1, "gib", "mib");
    expect(result.value).toBeCloseTo(1024);
    expect(result.unit).toBe("mib");
  });

  it("converts MiB → KiB", () => {
    const result = convertBytes(2, "mib", "kib");
    expect(result.value).toBeCloseTo(2048);
    expect(result.unit).toBe("kib");
  });

  // -----------------------------
  // METRIC ↔ BINARY CROSSOVER
  // -----------------------------
  it("converts MB → MiB", () => {
    const result = convertBytes(1, "mb", "mib");
    // 1 MB = 1,000,000 bytes → 1,000,000 / 1,048,576 ≈ 0.9537 MiB
    expect(result.value).toBeCloseTo(0.9537, 4);
    expect(result.unit).toBe("mib");
  });

  it("converts GiB → GB", () => {
    const result = convertBytes(1, "gib", "gb");
    // 1 GiB = 1,073,741,824 bytes → / 1e9 = 1.073741824 GB
    expect(result.value).toBeCloseTo(1.073741824, 6);
    expect(result.unit).toBe("gb");
  });

  // -----------------------------
  // TARGET UNIT MAP
  // -----------------------------
  it("maps to metric target units", () => {
    expect(DATA_SIZE_TARGET_UNITS.metric["gib"]).toBe("gb");
    expect(DATA_SIZE_TARGET_UNITS.metric["mib"]).toBe("mb");
  });

  it("maps to binary target units", () => {
    expect(DATA_SIZE_TARGET_UNITS.binary["gb"]).toBe("gib");
    expect(DATA_SIZE_TARGET_UNITS.binary["mb"]).toBe("mib");
  });

  // -----------------------------
  // IDENTITY CONVERSION
  // -----------------------------
  it("returns identity conversion when units match", () => {
    const result = convertBytes(123, "mb", "mb");
    expect(result.value).toBe(123);
    expect(result.unit).toBe("mb");
  });

  // -----------------------------
  // INVALID INPUT
  // -----------------------------
  it("returns null for invalid units", () => {
    expect(convertBytes(10, "foo", "mb")).toBeNull();
    expect(convertBytes(10, "mb", "bar")).toBeNull();
  });

});
