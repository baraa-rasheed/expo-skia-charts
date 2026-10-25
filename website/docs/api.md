---
id: api
title: API reference
---

Generated from the TypeScript sources in `src/`.

## `PaddingInput`

_src/types.ts_

```ts
export type PaddingInput = number | Partial<Padding>;
```

## `CurveType`

_src/types.ts_

```ts
export type CurveType = 'linear' | 'monotone' | 'step';
```

## `AnimationConfig`

_src/types.ts_

```ts
export interface AnimationConfig {
  /** Animation duration in ms (default 600). Set 0 to disable. */
  duration?: number;
  /** Delay before entry animation, ms. */
  delay?: number;
}
```

## `BaseChartProps`

_src/types.ts_

```ts
export interface BaseChartProps {
  width: number;
  height: number;
  padding?: PaddingInput;
  style?: StyleProp<ViewStyle>;
  animation?: AnimationConfig;
  /** Optional Skia font used for labels (load with `useFont`). Labels are skipped when absent. */
  font?: SkFont | null;
  backgroundColor?: string;
  /** GPU effects: shadow, glow, blur, colour filter, blend mode, dash/corner path effects, clip reveal, SkSL shader. */
  effects?: ChartEffects;
  gradient?: ChartGradient; // see Gradients
}
```

## `ColorFilterPreset`

_src/effects/EffectsLayer.tsx_

```ts
export type ColorFilterPreset = keyof typeof COLOR_MATRICES;
```

## `ChartBlendMode`

_src/effects/EffectsLayer.tsx_

```ts
export type ChartBlendMode = 'srcOver' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'colorDodge' | 'colorBurn' | 'hardLight' | 'softLight' | 'difference' | 'exclusion' | 'plus' | 'hue' | 'saturation' | 'color' | 'luminosity';
```

## `ShaderPreset`

_src/effects/EffectsLayer.tsx_

```ts
/** Built-in SkSL runtime shaders, composited over the chart with `srcATop` so they only tint drawn pixels. */
export type ShaderPreset = 'none' | 'shimmer' | 'aurora' | 'scanlines';
```

## `ChartGradient`

`{ type?: 'linear' | 'radial' | 'sweep'; colors: string[]; positions?: number[]; start?: [x, y]; end?: [x, y]; center?: [x, y]; radius?: number; mode?: 'tint' | 'overlay'; opacity?: number }`. See [Gradients](./gradients).

## `ChartEffects`

_src/effects/EffectsLayer.tsx_

```ts
export interface ChartEffects {
  /** Drop shadow image filter on the whole chart layer. */
  shadow?: { dx?: number; dy?: number; blur?: number; color?: string } | boolean;
  /** Neon glow: a blurred copy (BlurMask) drawn under the chart. Value = sigma. */
  glow?: number;
  /** Gaussian blur image filter on the chart layer (e.g. for a "loading" state). */
  blur?: number;
  /** Colour filter preset or a custom 4x5 colour matrix. */
  colorFilter?: ColorFilterPreset | number[];
  /** Blend mode used when compositing the chart layer onto the canvas. */
  blendMode?: ChartBlendMode;
  /** Dashed strokes/fills: DashPathEffect intervals, e.g. [8, 4]. */
  dash?: number[];
  /** Round sharp path corners with CornerPathEffect (radius in px). */
  cornerRadius?: number;
  /** Clip-path reveal animation from left to right on mount/data change (ms, 0 = off). */
  clipReveal?: number;
  /** Animated SkSL runtime shader overlay. */
  shader?: ShaderPreset;
}
```

## `BarChartProps`

_src/charts/BarChart.tsx_

```ts
export interface BarChartProps extends BaseChartProps {
  /** Single series shorthand. */
  data?: number[];
  color?: string;
  series?: BarSeries[];
  /** Stack series on top of each other instead of grouping side by side. */
  stacked?: boolean;
  horizontal?: boolean;
  labels?: string[];
  /** 0..1 fraction of the slot occupied by bars. */
  barWidthRatio?: number;
  radius?: number;
  showGrid?: boolean;
  formatY?: (v: number) => string;
  /** Stagger between bars, ms-equivalent fraction (0..1) of total duration. */
  stagger?: number;
}
```

## `StackedBarChartProps`

_src/charts/BarChart.tsx_

```ts
export type StackedBarChartProps = Omit<BarChartProps, 'stacked'>;
```

## `CandlestickChartProps`

_src/charts/CandlestickChart.tsx_

```ts
export interface CandlestickChartProps extends BaseChartProps {
  data: Candle[];
  positiveColor?: string;
  negativeColor?: string;
  /** 'candle' (default) or 'ohlc' bars. */
  variant?: 'candle' | 'ohlc';
  showGrid?: boolean;
  formatY?: (v: number) => string;
  interactive?: boolean;
  onScrub?: (candle: Candle | null, index: number) => void;
}
```

## `OHLCChartProps`

_src/charts/CandlestickChart.tsx_

```ts
export type OHLCChartProps = Omit<CandlestickChartProps, 'variant'>;
```

## `GaugeChartProps`

_src/charts/GaugeChart.tsx_

```ts
export interface GaugeChartProps extends Omit<BaseChartProps, 'padding'> {
  value: number;
  min?: number;
  max?: number;
  /** Total sweep of the dial in degrees (default 240). */
  sweep?: number;
  thickness?: number;
  color?: string;
  /** Gradient colors along the arc (overrides `color`). */
  gradient?: string[];
  trackColor?: string;
  showNeedle?: boolean;
  needleColor?: string;
  formatValue?: (v: number) => string;
  valueFont?: SkFont | null;
  valueColor?: string;
}
```

## `GridProps`

_src/charts/Grid.tsx_

```ts
export interface GridProps {
  width: number;
  height: number;
  padding: Padding;
  yTicks: number[];
  yScale: (v: number) => number;
  color?: string;
  font?: SkFont | null;
  labelColor?: string;
  formatY?: (v: number) => string;
  xLabels?: { x: number; label: string }[];
}
```

## `HeatmapChartProps`

_src/charts/HeatmapChart.tsx_

```ts
export interface HeatmapChartProps extends BaseChartProps {
  /** Row-major matrix of values. */
  data: number[][];
  /** Color stops from low → high (hex #RRGGBB). */
  colors?: [string, string] | [string, string, string];
  gap?: number;
  radius?: number;
  rowLabels?: string[];
  columnLabels?: string[];
  labelColor?: string;
}
```

## `LineSeries`

_src/charts/LineChart.tsx_

```ts
export interface LineSeries {
  data: number[] | DataPoint[];
  color: string;
  strokeWidth?: number;
  /** Fill under the line with a vertical gradient (turns it into an area chart). */
  fill?: boolean;
  fillOpacity?: number;
}
```

## `LineChartProps`

_src/charts/LineChart.tsx_

```ts
export interface LineChartProps extends BaseChartProps {
  /** Single series shorthand. */
  data?: number[] | DataPoint[];
  color?: string;
  strokeWidth?: number;
  /** Multiple series (overrides `data`). */
  series?: LineSeries[];
  curve?: CurveType;
  fill?: boolean;
  showGrid?: boolean;
  gridTicks?: number;
  formatY?: (v: number) => string;
  /** Fixed y domain. */
  yDomain?: [number, number];
  /** Enable press-and-drag scrubbing cursor (first series). */
  interactive?: boolean;
  cursorColor?: string;
  /** Fires (JS thread) as the user scrubs. `null` when released. */
  onScrub?: (point: DataPoint | null, index: number) => void;
  /** 'draw' strokes the path in; 'grow' rises from the baseline. */
  entry?: 'draw' | 'grow' | 'none';
}
```

## `AreaChartProps`

_src/charts/LineChart.tsx_

```ts
export type AreaChartProps = Omit<LineChartProps, 'fill'>;
```

## `PieChartProps`

_src/charts/PieChart.tsx_

```ts
export interface PieChartProps extends Omit<BaseChartProps, 'padding'> {
  data: PieSlice[];
  /** 0 for pie, 0..1 fraction of radius for donut. */
  innerRadius?: number;
  /** Gap between slices in degrees. */
  padAngle?: number;
  startAngle?: number;
  centerLabel?: string;
  centerLabelColor?: string;
  centerFont?: SkFont | null;
}
```

## `DonutChartProps`

_src/charts/PieChart.tsx_

```ts
export type DonutChartProps = Omit<PieChartProps, 'innerRadius'> & { thickness?: number };
```

## `ProgressRingsProps`

_src/charts/ProgressRings.tsx_

```ts
export interface ProgressRingsProps extends Omit<BaseChartProps, 'padding'> {
  /** Outer → inner rings. `progress` in 0..1 (values >1 wrap visually up to 1). */
  data: RingData[];
  thickness?: number;
  gap?: number;
  trackOpacity?: number;
}
```

## `ProgressRingProps`

_src/charts/ProgressRings.tsx_

```ts
export type ProgressRingProps = Omit<ProgressRingsProps, 'data'> & RingData;
```

## `RadarChartProps`

_src/charts/RadarChart.tsx_

```ts
export interface RadarChartProps extends Omit<BaseChartProps, 'padding'> {
  axes: string[];
  series: RadarSeries[];
  /** Max value on each axis (default: max over data). */
  max?: number;
  rings?: number;
  gridColor?: string;
  labelColor?: string;
}
```

## `ScatterChartProps`

_src/charts/ScatterChart.tsx_

```ts
export interface ScatterChartProps extends BaseChartProps {
  data: ScatterPoint[];
  color?: string;
  radius?: number;
  opacity?: number;
  showGrid?: boolean;
  formatY?: (v: number) => string;
}
```

## `BubbleChartProps`

_src/charts/ScatterChart.tsx_

```ts
export interface BubbleChartProps extends BaseChartProps {
  data: BubblePoint[];
  color?: string;
  minRadius?: number;
  maxRadius?: number;
  opacity?: number;
  showGrid?: boolean;
  formatY?: (v: number) => string;
}
```

## `StackedAreaChartProps`

_src/charts/StackedAreaChart.tsx_

```ts
export interface StackedAreaChartProps extends BaseChartProps {
  series: { data: number[]; color: string; label?: string }[];
  curve?: CurveType;
  /** Normalise each x to 100%. */
  percent?: boolean;
  showGrid?: boolean;
  formatY?: (v: number) => string;
  fillOpacity?: number;
}
```
