# AGENTS.md: react-native-skia-chart

Guidance for AI coding agents (Cursor, Claude, Grok, Copilot, …) generating charts with this package.
Full docs: https://baraa-rasheed.github.io/react-native-skia-chart/docs/agents · Type-checked recipes: [`example/recipes/agent-recipes.tsx`](example/recipes/agent-recipes.tsx)

## Rules
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

## Interactivity

- Scrubbing: `interactive` (default true) and `onScrub` on Line, Area and Candlestick. Inside scroll views, use `scrubActivation="longPress"`.
- Selection: `selectable`, `selectedIndex` and `onSelect(index | null)` on Bar, Pie/Donut, Scatter, Bubble, Heatmap and ProgressRings. Unselected marks dim.
- Zoom: `zoom` (`true` or `{ min, max, doubleTap }`) on axis charts. Pinch to zoom, two-finger pan, double-tap to toggle 2x or reset. Touches are mapped back to chart coordinates, so selection and scrubbing still work while zoomed.
- Custom charts: `ChartFrame`, `ZoomGroup`, `useSelection(props, hitTestWorklet)` and `useHighlight(selected, index)`.
