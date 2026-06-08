// Simple length converter: metric -> imperial and imperial -> metric
// v1: very naive text parsing, good enough to start experimenting.

const LENGTH_UNITS = {
  // metric to imperial (base: meters)
  m: 1,
  meter: 1,
  meters: 1,
  km: 1000,
  kilometer: 1000,
  kilometers: 1000,
  cm: 0.01,
  centimeter: 0.01,
  centimeters: 0.01,

  // imperial to metric (we'll still convert via meters)
  ft: 0.3048,
  foot: 0.3048,
  feet: 0.3048,
  in: 0.0254,
  inch: 0.0254,
  inches: 0.0254,
  yd: 0.9144,
  yard: 0.9144,
  yards: 0.9144
};

// For v1, let's define a simple "target system":
// If source is metric, convert to imperial (meters -> feet).
// If source is imperial, convert to metric (feet -> meters).
function convertLength(value, unit) {
  const lowerUnit = unit.toLowerCase();
  const meters = value * (LENGTH_UNITS[lowerUnit] || 1);

  const isMetric =
    ["m", "meter", "meters", "km", "kilometer", "kilometers", "cm", "centimeter", "centimeters"].includes(lowerUnit);

  if (isMetric) {
    // Convert meters to feet for display
    const feet = meters / 0.3048;
    return { value: feet, unit: "ft" };
  } else {
    // Convert meters to meters (metric) for display
    // If original was feet, show meters; if inches, still show meters for v1.
    return { value: meters, unit: "m" };
  }
}

function formatNumber(num) {
  // Simple formatting; can be improved
  return Number(num.toFixed(2));
}

// Regex: number + optional space + unit (letters)
// e.g., "12 m", "5km", "3.5 feet"
const LENGTH_REGEX = /(\d+(\.\d+)?)\s*(m|meter|meters|km|kilometer|kilometers|cm|centimeter|centimeters|ft|foot|feet|in|inch|inches|yd|yard|yards)\b/gi;

function walkAndConvert(rootNode) {
  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        // Skip script/style tags
        if (node.parentNode && ["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.parentNode.nodeName)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  textNodes.forEach(node => {
    const originalText = node.nodeValue;
    let changed = false;

    const newText = originalText.replace(LENGTH_REGEX, (match, numStr, _decimal, unit) => {
      const value = parseFloat(numStr);
      if (isNaN(value)) return match;

      const converted = convertLength(value, unit);
      const formatted = formatNumber(converted.value);

      changed = true;
      return `${match} (${formatted} ${converted.unit})`;
    });

    if (changed) {
      node.nodeValue = newText;
    }
  });
}

// Run once on load
walkAndConvert(document.body);

// Optional: observe DOM changes for dynamically loaded content
const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        walkAndConvert(node);
      }
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
