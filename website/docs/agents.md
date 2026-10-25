---
id: agents
title: Using with AI agents
sidebar_label: AI agents
---

react-native-skia-chart is built to be **agent-ready**. It has predictable props, strict types, and no hidden configuration, so AI coding agents (Cursor, Claude, Grok, Copilot) can generate correct charts on the first try.

Agents can find guidance in three places:
- [`AGENTS.md`](https://github.com/baraa-rasheed/react-native-skia-chart/blob/main/AGENTS.md) at the repo root, which most agents read automatically;
- [`/llms.txt`](pathname:///react-native-skia-chart/llms.txt), an index for LLM crawlers;
- [`example/recipes/agent-recipes.tsx`](https://github.com/baraa-rasheed/react-native-skia-chart/blob/main/example/recipes/agent-recipes.tsx), a set of copy-paste recipes that compile under strict TypeScript (`npx tsc --noEmit` in `example/`).

Every exported prop has JSDoc, so hover info and the `.d.ts` files carry the same guidance.

:::tip Prompt template
"Using **react-native-skia-chart** (react-native-skia 3.8), add an interactive area chart of `data: number[]` with a teal→violet gradient, full width minus 32px, 220px tall. Follow AGENTS.md."
:::

## Rules for agents
1. Import everything from `'react-native-skia-chart'`. Skia is `react-native-skia` **3.8.0** (not `@shopify/react-native-skia`).
2. `width` and `height` are **required numbers in pixels**. No `'100%'`. Use `useWindowDimensions()` or `onLayout`.
3. Data is plain arrays: `number[]`, `{x,y}[]`, or the typed shapes below. Colours are hex strings (`'#7C5CFF'`).
4. Text labels render only when you pass a Skia `font` (`useFont(require('./Inter.ttf'), 11)`). No font means no labels and no error.
5. Optional styling is opt-in and composable: `gradient` (ChartGradient) and `effects` (ChartEffects) work on every chart.
6. Needs a dev build (`npx expo run:ios|android`), not Expo Go. Peers: reanimated ≥ 4, react-native-worklets ≥ 0.7, gesture-handler.
7. For scrubbing, set `interactive` and read `onScrub(point | null, index)`. It runs on the JS thread, so it's safe to `setState`.

## Pick a component
| Goal | Component | Required data prop |
| --- | --- | --- |
| Trend over time | `LineChart` / `AreaChart` | `data: number[] \| DataPoint[]` or `series: LineSeries[]` |
| Inline trend (list row) | `Sparkline` | `data: number[]` |
| Compare categories | `BarChart` (`horizontal`, `stacked`) / `StackedBarChart` | `data: number[]` or `series: BarSeries[]` |
| Distribution of raw values | `Histogram` | `values: number[]`, `bins?` |
| Composition over time | `StackedAreaChart` (`percent`) | `series: {data, color}[]` |
| Part of whole | `PieChart` / `DonutChart` | `data: PieSlice[]` (`{value, color, label?}`) |
| Correlation | `ScatterChart` / `BubbleChart` | `data: {x, y}[]` / `{x, y, z}[]` |
| Multi-axis profile | `RadarChart` | `axes: string[]`, `series: RadarSeries[]` |
| OHLC prices | `CandlestickChart` / `OHLCChart` | `data: Candle[]` (`{x, open, high, low, close}`) |
| Matrix intensity | `HeatmapChart` | `data: number[][]` (row-major) |
| Single KPI | `GaugeChart` | `value: number`, `min?`, `max?` |
| Goal progress | `ProgressRings` / `ProgressRing` | `data: RingData[]` (`progress` 0..1) |

## Common props (all charts)
`width`, `height` (required) · `padding?: number | Partial<Padding>` · `animation?: {duration?, delay?}` (`duration: 0` disables it) · `font?` · `backgroundColor?` · `style?` · `gradient?: ChartGradient` · `effects?: ChartEffects`.
Axis charts also take `showGrid`, `formatY(v) => string` and `color`.

## Canonical snippet
```tsx
import { useWindowDimensions } from 'react-native';
import { AreaChart } from 'react-native-skia-chart';

export function Revenue({ data }: { data: number[] }) {
  const { width } = useWindowDimensions();
  return (
    <AreaChart
      data={data}
      width={width - 32}
      height={220}
      curve="monotone"
      interactive
      gradient={{ type: 'linear', colors: ['#00E0C6', '#7C5CFF'] }}
      effects={{ glow: 6, clipReveal: 800 }}
    />
  );
}
```

## Don't
- Don't wrap charts in `<Canvas>`. Each chart renders its own.
- Don't pass strings for numeric values, or `undefined` holes in `data`.
- Don't use `glow: true`. `glow` is a number (blur sigma). `shadow` accepts `true` or an object.
- Don't import from `react-native-skia-chart/src/...` or from build paths.

## More patterns
```tsx
// Scrub readout
const [p, setP] = useState<DataPoint | null>(null);
<LineChart data={points} width={w} height={200} interactive onScrub={(pt) => setP(pt)} />

// Grouped vs stacked bars
<BarChart width={w} height={200} series={[{ data: [3, 4], color: '#7C5CFF' }, { data: [2, 5], color: '#00E0C6' }]} />
<BarChart width={w} height={200} stacked series={...} />

// KPI gauge with gradient stops
<GaugeChart width={220} height={180} value={72} gradient={['#FF5A5F', '#FFC048', '#2FD47A']} />

// Typed effect presets you can reuse
const neon: ChartEffects = { glow: 6, shadow: true, clipReveal: 800 };
```

See [Charts](./charts.md) for each component's full props, [Gradients](./gradients.md), [GPU effects](./effects.md) and the [API reference](./api.md).

## Interactivity

- Scrubbing: `interactive` (default true) and `onScrub` on Line, Area and Candlestick. Inside scroll views, use `scrubActivation="longPress"`.
- Selection: `selectable`, `selectedIndex` and `onSelect(index | null)` on Bar, Pie/Donut, Scatter, Bubble, Heatmap and ProgressRings. Unselected marks dim.
- Zoom: `zoom` (`true` or `{ min, max, doubleTap }`) on axis charts. Pinch to zoom, two-finger pan, double-tap to toggle 2x or reset. Touches are mapped back to chart coordinates, so selection and scrubbing still work while zoomed.
- Custom charts: `ChartFrame`, `ZoomGroup`, `useSelection(props, hitTestWorklet)` and `useHighlight(selected, index)`.
