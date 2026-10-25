import type { SkFont } from 'react-native-skia';
import type { StyleProp, ViewStyle } from 'react-native';

export interface Padding { top: number; right: number; bottom: number; left: number }
export type PaddingInput = number | Partial<Padding>;

export interface Point { x: number; y: number }
export interface DataPoint { x: number; y: number }
export interface ScatterPoint { x: number; y: number; color?: string }
export interface BubblePoint { x: number; y: number; z: number; color?: string }
export interface Candle { x: number; open: number; high: number; low: number; close: number }
export interface PieSlice { value: number; color: string; label?: string }
export interface BarSeries { data: number[]; color: string; label?: string }
export interface RingData { progress: number; color: string; backgroundColor?: string; label?: string }
export interface RadarSeries { values: number[]; color: string; fillOpacity?: number; label?: string }

export type CurveType = 'linear' | 'monotone' | 'step';

export interface AnimationConfig {
  /** Animation duration in ms (default 600). Set 0 to disable. */
  duration?: number;
  /** Delay before entry animation, ms. */
  delay?: number;
}

export interface BaseChartProps {
  width: number;
  height: number;
  padding?: PaddingInput;
  style?: StyleProp<ViewStyle>;
  animation?: AnimationConfig;
  /** Optional Skia font used for labels (load with `useFont`). Labels are skipped when absent. */
  font?: SkFont | null;
  backgroundColor?: string;
}
