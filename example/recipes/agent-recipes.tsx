/**
 * Canonical, type-checked recipes for react-native-skia-chart. AI agents: copy these patterns.
 * Every snippet here compiles under `strict` TypeScript (checked by `npx tsc --noEmit` in example/).
 */
import React, { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import type { SkFont } from 'react-native-skia';
import {
  AreaChart, BarChart, CandlestickChart, DonutChart, GaugeChart, HeatmapChart, LineChart, ProgressRings,
  RadarChart, ScatterChart, Sparkline, StackedAreaChart,
  type Candle, type ChartEffects, type ChartGradient, type DataPoint,
} from 'react-native-skia-chart';

// 1. Responsive line chart: width/height are REQUIRED numbers (pixels). Derive them from layout.
export function PriceLine({ prices }: { prices: number[] }) {
  const { width } = useWindowDimensions();
  return <LineChart data={prices} width={width - 32} height={220} color="#7C5CFF" curve="monotone" />;
}

// 2. Scrubbing with a live readout. onScrub runs on the JS thread; null = finger released.
export function ScrubbableLine({ data }: { data: DataPoint[] }) {
  const [point, setPoint] = useState<DataPoint | null>(null);
  return (
    <View>
      <Text>{point ? point.y.toFixed(2) : 'Drag the chart'}</Text>
      <LineChart data={data} width={340} height={200} interactive onScrub={(p) => setPoint(p)} />
    </View>
  );
}

// 3. Area with a gradient (tint keeps the area's fade).
const aurora: ChartGradient = { type: 'linear', colors: ['#00E0C6', '#7C5CFF'], start: [0, 0], end: [1, 0] };
export const GradientArea = ({ data }: { data: number[] }) => (
  <AreaChart data={data} width={340} height={200} gradient={aurora} />
);

// 4. Multi-series line with grid + labels. Labels need a Skia font; without `font` they are skipped.
//    Load it once in the screen: `const font = useFont(require('./assets/Inter.ttf'), 11);`
export function Revenue({ font }: { font: SkFont | null }) {
  return (
    <LineChart
      width={340} height={220} font={font} showGrid formatY={(v) => `$${v.toFixed(0)}k`}
      series={[{ data: [4, 6, 5, 9], color: '#7C5CFF' }, { data: [2, 3, 4, 3], color: '#00E0C6', fill: true }]}
    />
  );
}

// 5. Bars: single series via data, grouped/stacked via series.
export const Weekly = () => (
  <BarChart width={340} height={200} data={[5, 8, 3, 9, 6]} labels={['M', 'T', 'W', 'T', 'F']} radius={6} />
);
export const Segments = () => (
  <BarChart width={340} height={200} stacked series={[{ data: [3, 4, 5], color: '#7C5CFF' }, { data: [2, 2, 3], color: '#FF4FD8' }]} />
);

// 6. Candlesticks.
export const Btc = ({ candles }: { candles: Candle[] }) => (
  <CandlestickChart data={candles} width={340} height={240} positiveColor="#2FD47A" negativeColor="#FF5A5F" interactive />
);

// 7. Part-to-whole.
export const Holdings = () => (
  <DonutChart width={200} height={200} thickness={0.35} data={[{ value: 60, color: '#7C5CFF' }, { value: 25, color: '#00E0C6' }, { value: 15, color: '#FF4FD8' }]} />
);

// 8. Single value / goals.
export const Sentiment = () => <GaugeChart width={220} height={180} value={72} gradient={['#FF5A5F', '#FFC048', '#2FD47A']} />;
export const Goals = () => (
  <ProgressRings width={180} height={180} data={[{ progress: 0.8, color: '#FF4FD8' }, { progress: 0.55, color: '#00E0C6' }]} />
);

// 9. Distribution / matrix / comparison.
export const Risk = () => <ScatterChart width={340} height={220} data={[{ x: 1, y: 2 }, { x: 2, y: 3.5 }, { x: 3, y: 2.8 }]} />;
export const Activity = () => <HeatmapChart width={340} height={160} data={[[1, 3, 5], [2, 6, 4]]} colors={['#1A1A2B', '#7C5CFF']} />;
export const Factors = () => (
  <RadarChart width={240} height={240} axes={['Value', 'Growth', 'Momentum', 'Quality']} series={[{ values: [3, 5, 4, 2], color: '#3EA6FF' }]} />
);
export const Allocation = () => (
  <StackedAreaChart width={340} height={200} percent series={[{ data: [1, 2, 3], color: '#7C5CFF' }, { data: [3, 2, 1], color: '#00E0C6' }]} />
);

// 10. Inline trend in a list row.
export const RowTrend = ({ data }: { data: number[] }) => <Sparkline width={80} height={32} data={data} color="#2FD47A" />;

// 11. GPU effects: compose freely; all optional.
const neon: ChartEffects = { glow: 6, shadow: { dy: 4, blur: 8, color: 'rgba(0,0,0,0.4)' }, clipReveal: 800 };
export const NeonLine = ({ data }: { data: number[] }) => <LineChart data={data} width={340} height={200} effects={neon} />;
