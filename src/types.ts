import type { SkFont } from 'react-native-skia';
import type { ChartEffects, ChartGradient } from './effects/EffectsLayer';
import type { StyleProp, ViewStyle } from 'react-native';

export interface Padding { top: number; right: number; bottom: number; left: number }
export type PaddingInput = number | Partial<Padding>;

/** A position in chart pixels. */
export interface Point { x: number; y: number }
/** A data-space sample for line/area charts. */
export interface DataPoint { x: number; y: number }
export interface ScatterPoint { x: number; y: number; color?: string }
export interface BubblePoint { x: number; y: number; z: number; color?: string }
/** One OHLC candle. `x` is usually an index or timestamp. */
export interface Candle { x: number; open: number; high: number; low: number; close: number }
/** A pie/donut slice; slices are sized by `value` relative to the total. */
export interface PieSlice { value: number; color: string; label?: string }
/** One bar series; all series should have the same length. */
export interface BarSeries { data: number[]; color: string; label?: string }
/** One progress ring; `progress` is 0..1. */
export interface RingData { progress: number; color: string; backgroundColor?: string; label?: string }
/** One radar polygon; `values` align with the chart's `axes`. */
export interface RadarSeries { values: number[]; color: string; fillOpacity?: number; label?: string }

/** Line interpolation: straight segments, smooth monotone cubic, or steps. */
export type CurveType = 'linear' | 'monotone' | 'step';

export interface AnimationConfig {
  /** Animation duration in ms (default 600). Set 0 to disable. */
  duration?: number;
  /** Delay before entry animation, ms. */
  delay?: number;
}

/** Props shared by every chart. Only `width` and `height` are required. */
export interface BaseChartProps {
  /** Canvas width in pixels (required, must be a number). Derive it from `useWindowDimensions()` or `onLayout`. */
  width: number;
  /** Canvas height in pixels (required, must be a number). */
  height: number;
  /** Inner padding in px: one number for all sides, or `{ top, right, bottom, left }` partials. */
  padding?: PaddingInput;
  /** Style for the wrapping view (margins, positioning). Sizing comes from `width`/`height`. */
  style?: StyleProp<ViewStyle>;
  /** Entry/update animation timing. `{ duration: 0 }` disables animation. */
  animation?: AnimationConfig;
  /** Optional Skia font used for labels (load with `useFont`). Labels are skipped when absent. */
  font?: SkFont | null;
  /** Canvas background colour (default transparent). */
  backgroundColor?: string;
  /** GPU effects: shadow, glow, blur, colour filter, blend mode, dash/corner path effects, clip reveal, SkSL shader. */
  effects?: ChartEffects;
  /** GPU gradient (linear / radial / sweep) applied to the chart's marks. */
  gradient?: ChartGradient;
}
