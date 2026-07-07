# Universal Unit Converter

A Chrome extension that automatically converts units on any webpage into your preferred measurement system. Supports metric ↔ imperial conversions across multiple categories, with reversible DOM updates, per‑category toggles, and a collision‑safe parsing engine.

## Features

- **Tooltip‑based conversion** — detected units get a purple underline; the page text itself is never altered, and hovering shows the converted value(s)  
- **Multiple target units per conversion** — e.g. hovering over "3 MB" shows MiB, KB, and GB together, laid out as a two‑column table  
- **Configurable tooltip targets** — the Options page lets you choose exactly which unit(s) each detected value converts to, per source unit, per category; unconfigured units fall back to sensible shipped defaults  
- **Manual Conversion form with full unit names** — the popup's From/To dropdowns display readable names ("Kilometers", "Fluid Ounces") instead of raw abbreviations, with the full name available as a hover tooltip if a longer label gets truncated  
- **Locale‑aware number formatting** — converted values use the user's own locale for thousands/decimal separators (e.g. `512,000.00` vs. `512.000,00`)  
- **Viewport‑aware tooltip positioning** — tooltips flip to stay on‑screen instead of spilling off the edge of the page  
- **Per‑category toggles** — enable or disable conversions for length, mass, volume, velocity, temperature, CSS units, area, density, and data sizes (bytes)  
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

- °C, °F, and Kelvin — each converts to the other two  
- Kelvin is not auto‑detected from page text (bare "K" collides too often with shorthand like "10k"), but is available as a conversion target and in manual conversion  

### **Mass**

- g, kg  
- oz, lb  

### **Area**

- mm², cm², m², km²  
- in², ft², yd², mi²  
- Supports both Unicode (m²) and ASCII (m2) formats  

### **Volume**

- ml, L, m³  
- fl oz, gal, ft³  

### **Velocity**

- m/s, km/h  
- mph, ft/s, fps  

### **CSS Units**

- px, rem, em, vh, vw  

### **Density**

- kg/m³, g/cm³ (and g/mL)  
- lb/ft³, lb/in³  

### **Data Size**

- Bytes, KB/KiB, MB/MiB, GB/GiB, TB/TiB  
- By default, each unit converts to its metric↔binary crossover (e.g. KB ↔ KiB) plus the unit directly above and below it in the same system, all shown together in the tooltip — this is fully customizable per unit from the Options page  

## How It Works

The content script walks the DOM using a `TreeWalker`, identifies text nodes containing supported units, and wraps each match in a styled span — the visible page text is left completely untouched:

`"750 ml"` stays exactly as `"750 ml"`, now underlined in purple. Hovering over it shows a tooltip with the converted value(s):

```txt
25.36  fl oz
```

When a unit has more than one target (bytes being the richest example), each conversion gets its own row in a two‑column table, with alternating row colors to make it easier to scan:

```txt
2.33      gib
2,500.00  mb
0.003     tb
```

Numbers are formatted with `Intl.NumberFormat` so grouping/decimal separators match the user's own locale, and the tooltip repositions itself so it never spills off the left or right edge of the viewport.

Original text is stored in a `Map`, allowing conversions to be fully reverted when:

- The user disables auto‑conversion  
- The user toggles individual unit categories  

A MutationObserver ensures newly added content (infinite scroll, dynamic pages, etc.) is also converted.

## Settings

The popup allows you to configure:

- **Auto Convert** — enable/disable automatic conversions on the page  
- **Per‑category toggles** — choose which unit types to convert (length, temperature, mass, volume, velocity, CSS units, area, density, bytes)  
- **Manual Conversion** — a standalone from/to converter with live results, independent of the auto‑convert toggle; From/To dropdowns show full unit names rather than abbreviations  

The Options page (`chrome.runtime.openOptionsPage()`, linked from the popup) additionally lets you configure:

- **Tooltip appearance** — theme (dark/light), underline color, and tooltip font size, with a live preview  
- **Tooltip Conversion Targets** — a collapsible section per category; for each unit the extension can detect, check which other unit(s) in that category should appear in the tooltip. Unchecking every target for a unit suppresses its tooltip entirely (the text is left as plain, unconverted). Anything left unconfigured uses the shipped defaults described above  

All settings are stored in `chrome.storage.sync` and applied instantly across all tabs.

## Development

- Built with modern ES modules  
- Fully tested with Vitest  
- Modular converter architecture (`length.js`, `mass.js`, `velocity.js`, `bytes.js`, etc.) — each exposes an `X_TARGET_UNITS` map of `{ fromUnit: [toUnit, ...] }` as the shipped default, so a single source unit can render multiple converted values in the tooltip  
- User overrides of those defaults are read from `chrome.storage.sync` (`tooltipTargetUnits`, keyed by category → source unit → target unit ids) and take priority over the hardcoded map at conversion time; `src/options/tooltipTargetsConfig.js` is the single source of truth the Options page UI is generated from, importing each category's default target map directly so it can't drift out of sync  
- Regex‑driven parsing with normalization for ASCII and Unicode variants  
- Collision‑safe matching (no interference between length/velocity/CSS units)  
- Robust DOM walker with reversible text mapping and a marker‑based pipeline so multiple converters can safely run over the same text node  
- A single shared tooltip element is appended to `<body>` and positioned/populated in JS on hover, rather than nested inside each converted span — this keeps the page's own text content from being polluted by hidden tooltip data  
- `getWindowDistance` utility (`src/content/utility/getWindowDistance.js`) computes an element's distance to each viewport edge, used to flip the tooltip so it stays on‑screen  

## Running Tests

`npm test`

## Known Limitations

- **Numbers and units split across separate DOM nodes aren't detected.** Some sites (notably Wikipedia's Parsoid‑generated markup) wrap the non‑breaking space between a number and its unit in its own element, e.g. `0<span>&nbsp;</span>K`. The converter matches a number and its unit within a single text node at a time, so when an element sits between them like this, nothing matches. A fix is possible — either merging whitespace‑only inline elements into their surrounding text before scanning, or a more general pass that flattens sibling inline nodes into one logical text run before matching — but isn't implemented yet.

## Roadmap

- Additional unit categories (energy, pressure, torque, etc.)
- Per‑site allowlists  
- Currency conversions with live rates  
- “Convert once” mode for static pages  

## License

MIT
