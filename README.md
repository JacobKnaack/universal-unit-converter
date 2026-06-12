# Universal Unit Converter

A Chrome extension that automatically converts units on any webpage into your preferred measurement system. Supports metric ↔ imperial conversions across multiple categories, with reversible DOM updates and smart text parsing.

## Features

- **Automatic unit conversion** directly in the webpage text  
- **Choose your target system** (Imperial or Metric) from the popup  
- **Smart parsing** with strict regexes to avoid false positives  
- **Reversible conversions** using a DOM text‑map  
- **Live updates** via MutationObserver for dynamically loaded content  
- **Comprehensive test suite** for converters, regexes, and DOM behavior  

## Supported Unit Categories

### **Length**
- mm, cm, m, km  
- in, ft, yd, mi  

### **Temperature**
- °C ↔ °F  

### **Mass**
- g, kg  
- oz, lb  

### **Volume**
- ml, L, m³  
- fl oz, gal, ft³  

(More categories coming soon.)

## How It Works

The content script walks the DOM using a `TreeWalker`, identifies text nodes containing supported units, and replaces them with converted values:

`"750 ml" → "750 ml (25.36 fl oz)"`


Original text is stored in a `Map` so conversions can be fully reverted.

A MutationObserver ensures new content added to the page is also converted.

## Settings

The popup allows you to configure:

- **Auto Convert** — enable/disable conversions  
- **Target System** — choose `"imperial"` or `"metric"`  

Settings are stored in `chrome.storage.sync` and applied instantly.

## Development

- Built with modern ES modules  
- Fully tested with Vitest  
- Modular converter architecture (`length.js`, `mass.js`, `volume.js`, etc.)  
- Regex‑driven parsing with normalization for ASCII and Unicode variants  

## Running Tests

`npm test`

## Roadmap

- Additional unit categories (energy, pressure, speed, area, etc.)  
- Per‑category toggles  
- Inline UI for showing/hiding conversions  
- Currency conversions with live rates  

## License

MIT
