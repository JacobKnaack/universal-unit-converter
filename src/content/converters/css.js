const CSS_UNIT_REGEX = /\b(\d+(?:\.\d+)?)\s?(px|rem|em|vh|vw)\b(?!\/[a-z])/gi;

function convertCssUnits(value, unit, type) {
  const u = unit.toLowerCase();

  const basePx = 16; // configurable later

  switch (u) {
    case "px":
      if (type === "rem") return { value: value / basePx, unit: "rem" };
      if (type === "em") return { value: value / basePx, unit: "em" };
      return null;

    case "rem":
    case "em":
      if (type === "px") return { value: value * basePx, unit: "px" };
      return null;

    case "vh":
      return {
        value: (window.innerHeight * value) / 100,
        unit: "px"
      };

    case "vw":
      return {
        value: (window.innerWidth * value) / 100,
        unit: "px"
      };

    default:
      return null;
  }
}

export {
  CSS_UNIT_REGEX,
  convertCssUnits,
}