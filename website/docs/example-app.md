---
id: example-app
title: Example app
---

`example/` is an Expo SDK 58 app (dark theme) designed like a native stocks app.

```sh
cd example
npm install
npx expo run:ios   # or run:android. Skia v3 needs a dev build.
```

## Home

- One screen, **Charts**, on a native stack with an iOS large title and a blurred header.
- A **Watchlist** shows full-width cards: line, area, candlestick, bar, stacked bar, stacked area, histogram, scatter, bubble and heatmap.
- A **Breakdown** grid shows compact cards: pie/donut, radar, gauge and progress rings.
- Each card has its own chart type, a headline value, a green or red delta pill, and a **Customize ›** link. Charts stay interactive inside the cards (scrubbing, crosshair).
- Data comes from a seeded PRNG, so a card and its preview in the sheet always match.

## Customize sheet

Tap a card or **Customize** to open a native bottom sheet (`presentation: 'formSheet'`, detents 60% / 100%, grabber). The home page scrolls smoothly so the chart you are editing sits centred in the area still visible above the sheet.

The sheet contains:
- a live preview;
- **Colour**;
- **Data**: −/+ point count and **Randomize**;
- **Gradient**: none, linear, radial or sweep, plus an end colour (uses the `gradient` prop);
- chart options such as grid, smooth curve, scrubbing, horizontal, 100% stacked, donut, needle and OHLC bars;
- **GPU effects**: drop shadow, neon glow, SkSL shader and colour filter;
- **Reset to defaults**.

Edits apply live to the card behind the sheet. On Android, `formSheet` is presented as a modal.

The app resolves the library from `../src` via `metro.config.js`, so edits hot-reload.
