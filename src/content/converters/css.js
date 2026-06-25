const CSS_UNIT_REGEX = /\b(\d+(?:\.\d+)?)\s?(px|rem|em|vh|vw)\b(?!\/[a-z])/gi;


const CSS_TARGET_UNIT = {
  px: "rem",
  rem: "px",
  em: "px",
  vh: "px",
  vw: "px",
};

function convertCssUnits(value, fromUnit, toUnit) {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  if (from === to) {
    return { value, unit: to };
  }

  const basePx = 16; // configurable later

  // Step 1: Convert FROM → px
  let valueInPx;

  switch (from) {
    case "px":
      valueInPx = value;
      break;

    case "rem":
    case "em":
      valueInPx = value * basePx;
      break;

    case "vh":
      valueInPx = (window.innerHeight * value) / 100;
      break;

    case "vw":
      valueInPx = (window.innerWidth * value) / 100;
      break;

    default:
      return null;
  }

  // Step 2: Convert px → TO
  switch (to) {
    case "px":
      return { value: valueInPx, unit: "px" };

    case "rem":
    case "em":
      return { value: valueInPx / basePx, unit: to };

    case "vh":
      return {
        value: (valueInPx / window.innerHeight) * 100,
        unit: "vh"
      };

    case "vw":
      return {
        value: (valueInPx / window.innerWidth) * 100,
        unit: "vw"
      };

    default:
      return null;
  }
}

export {
  CSS_UNIT_REGEX,
  CSS_TARGET_UNIT,
  convertCssUnits,
};
