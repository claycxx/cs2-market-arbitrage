# CS2 Market Intelligence & Real-Time Price Arbitrage Scanner 📈

A financial analytics dashboard and cross-market arbitrage scanner for Counter-Strike 2 items, modeled after PriceEmpire. Monitors real-time skin pricing, market caps, 24h volume, candlestick financial charts, and computes live cross-platform spreads across **Buff163, Skinport, CSFloat, and Steam**.

![CS2 Market Intel](https://img.shields.io/badge/Market%20Cap-$5.7B+-emerald?style=for-the-badge)
![Price Arbitrage](https://img.shields.io/badge/Arbitrage%20Scanner-Real--Time-blue?style=for-the-badge)
![HTML5 Canvas](https://img.shields.io/badge/Engine-HTML5%20Canvas%20Finance-orange?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

- **📊 CS2 Aggregate Market Cap & Candlestick Charts:**
  - Full financial historical data spanning 2014 to 2026.
  - Interactive multi-period zoom: `24H`, `7D`, `30D`, `90D`, `1Y`, `ALL`.
  - Seamless toggle between **Smooth Gradient Area Chart** and **Financial Candlestick (OHLC)** modes.
  - Crosshair cursor overlay reporting exact date, aggregate market cap, and 24h percentage swings.
- **⚡ Cross-Marketplace Arbitrage Engine:**
  - Live price comparisons across tier-1 marketplaces: **Buff163**, **Skinport**, **CSFloat**, and **Steam Community Market**.
  - Automatic spread computation highlighting instant cash arbitrage margins:
    $$\text{Spread} = \frac{\text{High} - \text{Low}}{\text{Low}} \times 100\%$$
  - Real-time price fluctuations simulating active order book flow and trade executions.
- **🔍 Deep Filtering & Search:**
  - Real-time search across hundreds of CS2 skins and finishes.
  - Filter by weapon category (*Knives, Gloves, Rifles, Pistols, SMGs, Heavies*).
  - Filter by rarity grade (*Covert, Classified, Restricted, Mil-Spec*).
  - Custom sort by *Spread %*, *Price (High/Low)*, *24h Volume*, and *Popularity*.
  - Favorite skin bookmarking with local persistence.
- **🔎 Interactive Skin Inspector:**
  - Inspect item wear conditions (*Factory New, Minimal Wear, Field-Tested, Well-Worn, Battle-Scarred*).
  - Detailed marketplace order books with direct purchase shortcuts.

---

## 🚀 Quick Start

### Option 1: Direct Browser Launch
Open `index.html` directly in your favorite browser.

### Option 2: Local HTTP Server
```bash
python -m http.server 8080
```
Then visit `http://localhost:8080`.

---

## 🏗️ Architecture

- **`index.html`**: Clean responsive layout styled with Tailwind CSS and glassmorphic cards.
- **`cs2-tracker.js`**: Core financial engine containing the canvas charting renderer, candlestick generator, order book simulator, search indexing, and arbitrage sorting algorithm.
- **`skins.json`**: Pre-indexed database of CS2 weapon skins, rarity tiers, wears, and metadata.

---

## 📄 License

MIT License © [claycxx](https://github.com/claycxx)
