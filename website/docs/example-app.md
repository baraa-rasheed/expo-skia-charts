---
id: example-app
title: Example app
---

`example/` is an Expo SDK 58 app styled like a production iOS stocks app, with a dark **aurora** look.

```sh
cd example
npm install
npx expo run:ios   # or run:android. Skia v3 needs a dev build.
```

## Home

- One screen, **Stocks**, on a native stack. The large title and header are transparent over an animated aurora (blurred Skia circles driven by `useClock`). The header blurs once the title collapses.
- **Portfolio**: total balance and today's change, then a hero **AAPL** line chart with a native segmented range control (1D / 1W / 1M / 6M / 1Y). The range changes the number of points.
- **Watchlist**: rows with a ticker and name, a `Sparkline`, the price and a green or red change badge.
- **Markets** (BTC-USD candlesticks, NVDA area, MSFT volume) and **Insights** (allocation, AMZN revenue, SPY returns) are swipeable **parallax carousels**. Pages snap natively. The chart lags behind the header and fades and scales at the edges, and animated page dots follow your finger. Each carousel auto-advances with a smooth animated scroll every 5 s. It pauses for 8 s after you touch it and stops while the sheet is open.
- **ETH-USD activity** (heatmap) is embedded full width with no background card.
- **Discover**: a staggered two-column masonry grid with Holdings (donut), Risk / Return (scatter), GOOGL factors (radar), Fear & Greed (gauge), Goals (rings) and Mega caps (bubble).
- Blocks fade in one after another (Reanimated `FadeInDown`).
- Charts stay interactive in place (scrubbing, crosshair).
- Data comes from a seeded PRNG, so a chart and its preview in the sheet always match.

## Customize sheet

Each section has a subtle **See All ›** link. You can also tap a watchlist row or a tile title. Either one opens a native bottom sheet (`presentation: 'formSheet'`, detents 60% / 100%, grabber). The home page scrolls smoothly so the chart you are editing sits centred in the area still visible above the sheet. If that chart is inside a carousel (for example when you tap the BTC-USD watchlist row), the carousel also swipes to the right page.

The sheet follows iOS Settings patterns, with inset-grouped sections, native switches, segmented controls, glassy `expo-blur` buttons, SF Symbols (`expo-symbols`) and haptics:

- a header with the chart type, title and a glass **Done** button;
- a live preview;
- **Appearance**: colour swatches, a **Gradient** segmented control (None / Linear / Radial / Sweep) and an end colour (uses the `gradient` prop);
- **Data**: a glass −/+ stepper for the point count, and **Randomize**;
- **Options**: chart-specific switches such as grid, smooth curve, scrubbing, horizontal, 100% stacked, donut, needle and OHLC bars;
- **GPU Effects**: drop shadow, neon glow, an SkSL shader segment control and a colour filter segment control;
- **Reset to Defaults**.

Edits apply live to the chart behind the sheet. On Android, `formSheet` is presented as a modal, and blur falls back to a translucent fill.

The app resolves the library from `../src` via `metro.config.js`, so edits hot-reload.
