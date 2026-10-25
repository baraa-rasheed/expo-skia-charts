---
id: example-app
title: Example app & playground
---

`example/` is an Expo SDK 58 app (dark theme) with a screen per chart type plus a **Playground** where every chart option and GPU effect is a live control: chart type, colour, curve, point count, grid, scrubbing, shadow, clip reveal, glow, blur, colour filter, SkSL shader, blend mode, dash and corner path effects.

```sh
cd example
npm install
npx expo run:ios   # or run:android — a dev build is required for Skia v3
```

<div className="placeholder">Screenshot placeholder — home grid</div>
<div className="placeholder">Screenshot placeholder — Playground</div>

The app resolves the library from `../src` via `metro.config.js`, so edits hot-reload.
