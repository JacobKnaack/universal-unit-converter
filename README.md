# Universal Unit Converter

A Chrome extension that automatically converts units on any webpage into your preferred measurement system. Supports metric ↔ imperial conversions across multiple categories, with reversible DOM updates, per‑category toggles, and a collision‑safe parsing engine.

## Features

- **Automatic unit conversion** directly in webpage text  
- **Per‑category toggles** — enable or disable conversions for length, mass, volume, velocity, temperature, and CSS units  
- **Choose your target system** (Imperial or Metric)  
- **Smart parsing engine** with collision‑safe regexes (no false positives in URLs, area units, or composite units like m/s)  
- **Reversible conversions** using a DOM text‑map  
- **Live updates** via MutationObserver for dynamically loaded content  
- **Fully reactive** — changes in the popup immediately re‑convert the page  
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

### **Velocity**
- m/s, km/h  
- mph, ft/s, fps  

### **CSS Units**
- px, rem, em, vh, vw  

(Area units intentionally excluded to avoid false positives.)

## How It Works

The content script walks the DOM using a `TreeWalker`, identifies text nodes containing supported units, and replaces them with converted values:

`"750 ml" → "750 ml (25.36 fl oz)"`

Original text is stored in a `Map`, allowing conversions to be fully reverted when:

- The user disables auto‑conversion  
- The user changes the target system  
- The user toggles individual unit categories  

A MutationObserver ensures newly added content (infinite scroll, dynamic pages, etc.) is also converted.

## Settings

The popup allows you to configure:

- **Auto Convert** — enable/disable conversions  
- **Target System** — `"imperial"` or `"metric"`  
- **Per‑category toggles** — choose which unit types to convert  
- **CSS Unit Target** — px, rem, em, vh, vw  

All settings are stored in `chrome.storage.sync` and applied instantly across all tabs.

## Development

- Built with modern ES modules  
- Fully tested with Vitest  
- Modular converter architecture (`length.js`, `mass.js`, `velocity.js`, etc.)  
- Regex‑driven parsing with normalization for ASCII and Unicode variants  
- Collision‑safe matching (no interference between length/velocity/CSS units)  
- Robust DOM walker with reversible text mapping  

## Running Tests

`npm test`

## Roadmap

- Additional unit categories (energy, pressure, area, torque, density, etc.)  
- Per‑site allowlists  
- Inline UI for showing/hiding conversions  
- Currency conversions with live rates  
- “Convert once” mode for static pages  

## License

MIT

