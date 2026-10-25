---
id: gradients
title: Gradients
---

Every chart accepts a `gradient` prop. It is rendered as a Skia GPU shader (`LinearGradient`, `RadialGradient` or `SweepGradient`), composited over the chart's marks inside an offscreen GPU layer. Grids and axes are drawn outside that layer, so they are never tinted.

```tsx
import { LineChart, type ChartGradient } from 'react-native-skia-chart';

const sunset: ChartGradient = {
  type: 'linear',
  colors: ['#7C5CFF', '#FF6B9A', '#FFC048'],
  positions: [0, 0.5, 1],
  start: [0, 0.5], // fractions of the chart size
  end: [1, 0.5],
};

<LineChart width={w} height={220} data={values} fill gradient={sunset} />
```

## `ChartGradient`

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `type` | `'linear' \| 'radial' \| 'sweep'` | `'linear'` | |
| `colors` | `string[]` | — | Two or more stops. |
| `positions` | `number[]` | evenly spaced | Same length as `colors`, 0..1. |
| `start` / `end` | `[x, y]` | `[0.5, 0]` / `[0.5, 1]` | Linear only, fractions of the chart size. |
| `center` | `[x, y]` | `[0.5, 0.5]` | Radial and sweep. |
| `radius` | `number` | `1` | Radial, fraction of half the larger side. |
| `mode` | `'tint' \| 'overlay'` | `'tint'` | `tint` = `srcIn` (replaces colour, keeps alpha). `overlay` = `srcATop` at `opacity`. |
| `opacity` | `number` | `0.6` | Overlay only. |

## Which type where

- **Linear**: lines, areas, bars, histograms and heatmaps.
- **Radial**: scatter, bubble, radar and pie charts.
- **Sweep**: pie/donut, progress rings and gauges. `GaugeChart` maps its `gradient` (either `string[]` or a `ChartGradient`) onto the dial arc.
- **Overlay mode**: multi-series charts (stacked bar/area, candlestick), where you want to keep the series colours.

## GPU notes

A gradient is one fragment shader evaluated per pixel. It costs the same for 10 points as for 10,000, and it combines with `effects` (shadow, glow, colour filters, SkSL shaders) inside the same `saveLayer`. Coordinates are relative, so a gradient stays correct when the chart resizes.
