import React, { useMemo, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import {
  AreaChart, BarChart, BubbleChart, CandlestickChart, ChartDot, ChartPath, ChartPathProvider, ChartYLabel, DonutChart, GaugeChart,
  HeatmapChart, Histogram, LineChart, OHLCChart, PieChart, ProgressRing, ProgressRings, RadarChart, ScatterChart, Sparkline,
  StackedAreaChart, StackedBarChart, type Candle, type DataPoint,
} from 'expo-skia-charts';
import { Controls, useChartControls } from '../components/Controls';
import { palette, theme } from './theme';
import { Playground } from './Playground';
import { candles, randInt, randomWalk, seriesColors } from './data';

const useW = () => useWindowDimensions().width - 32;
const glow = (color: string) => ({ shadow: { dy: 6, blur: 10, color: `${color}73` }, clipReveal: 800 }) as const;
const Caption = ({ children }: { children: React.ReactNode }) => <Text style={{ color: theme.sub }}>{children}</Text>;
const Stack = ({ children, center }: { children: React.ReactNode; center?: boolean }) => (
  <View style={{ gap: 12, alignItems: center ? 'center' : 'stretch' }}>{children}</View>
);
const colorsFor = (base: string, n: number) => seriesColors(base, palette, n);
const AXES = ['Speed', 'Power', 'Range', 'Armor', 'Agility', 'Stealth', 'Focus', 'Luck', 'Vision', 'Grit'];
const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'];

const LineScreen = () => {
  const w = useW();
  const c = useChartControls(40, 5, 120, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => randomWalk(c.count), [c.count, c.seed]);
  const multi = useMemo(() => colorsFor(c.color, 2).map((color) => ({ data: randomWalk(20), color })), [c.color, c.seed]);
  const [scrub, setScrub] = useState<DataPoint | null>(null);
  return (
    <Stack>
      <Controls c={c} unit="points" />
      <Caption>{scrub ? `x=${scrub.x}  y=${scrub.y}` : 'Press and drag to scrub'}</Caption>
      <LineChart width={w} height={220} data={data} color={c.color} effects={glow(c.color)} onScrub={(p) => setScrub(p)} />
      <Caption>Multi-series, step curve</Caption>
      <LineChart width={w} height={180} curve="step" series={multi} />
      <Caption>Sparkline</Caption>
      <Sparkline width={120} height={36} data={data} color={c.color} />
    </Stack>
  );
};

const AreaScreen = () => {
  const w = useW();
  const c = useChartControls(30, 5, 120, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => randomWalk(c.count), [c.count, c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="points" />
      <AreaChart width={w} height={220} effects={glow(c.color)} data={data} color={c.color} />
    </Stack>
  );
};

const StackedAreaScreen = () => {
  const w = useW();
  const c = useChartControls(3, 1, 6);
  const series = useMemo(
    () => colorsFor(c.color, c.count).map((color, i) => ({ data: randomWalk(12, 20 - i * 2, 6).map(Math.abs), color })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c.color, c.count, c.seed],
  );
  return (
    <Stack>
      <Controls c={c} unit="series" />
      <StackedAreaChart width={w} height={200} series={series} />
      <Caption>100% stacked</Caption>
      <StackedAreaChart width={w} height={200} series={series} percent />
    </Stack>
  );
};

const BarScreen = () => {
  const w = useW();
  const c = useChartControls(7, 2, 14);
  const rnd = (n: number) => Array.from({ length: n }, () => randInt(100));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const d = useMemo(() => ({ main: rnd(c.count), a: rnd(c.count), b: rnd(c.count), h: Array.from({ length: Math.min(c.count, 8) }, () => randInt(90) - 40) }), [c.count, c.seed]);
  const [c1, c2] = colorsFor(c.color, 2);
  return (
    <Stack>
      <Controls c={c} unit="bars" />
      <BarChart key={`v${c.seed}`} width={w} height={200} data={d.main} color={c.color} labels={DAYS.slice(0, c.count)} />
      <Caption>Grouped</Caption>
      <BarChart key={`g${c.seed}`} width={w} height={200} series={[{ data: d.a, color: c1 ?? c.color }, { data: d.b, color: c2 ?? c.color }]} />
      <Caption>Horizontal with negatives</Caption>
      <BarChart key={`h${c.seed}`} width={w} height={200} horizontal data={d.h} color={c.color} />
    </Stack>
  );
};

const StackedBarScreen = () => {
  const w = useW();
  const c = useChartControls(3, 1, 6);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const series = useMemo(() => colorsFor(c.color, c.count).map((color) => ({ data: Array.from({ length: 5 }, () => 5 + randInt(25)), color })), [c.color, c.count, c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="series" />
      <StackedBarChart key={c.seed} width={w} height={240} series={series} />
    </Stack>
  );
};

const HistogramScreen = () => {
  const w = useW();
  const c = useChartControls(20, 5, 60, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const values = useMemo(() => Array.from({ length: 500 }, () => (Math.random() + Math.random() + Math.random()) * 33), [c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="bins" />
      <Histogram key={c.seed} width={w} height={220} values={values} bins={c.count} color={c.color} />
    </Stack>
  );
};

const PieScreen = () => {
  const c = useChartControls(4, 2, 6);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => colorsFor(c.color, c.count).map((color) => ({ value: 5 + randInt(40), color })), [c.color, c.count, c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="slices" />
      <Stack center>
        <PieChart key={`p${c.seed}`} width={240} height={240} data={data} padAngle={1.5} />
        <Caption>Donut</Caption>
        <DonutChart key={`d${c.seed}`} width={240} height={240} data={data} thickness={0.3} padAngle={2} />
      </Stack>
    </Stack>
  );
};

const ScatterScreen = () => {
  const w = useW();
  const c = useChartControls(80, 10, 400, 20);
  const pts = useMemo(
    () => Array.from({ length: c.count }, () => { const x = Math.random() * 100; return { x, y: x * 0.6 + Math.random() * 30 }; }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c.count, c.seed],
  );
  return (
    <Stack>
      <Controls c={c} unit="points" />
      <ScatterChart key={c.seed} width={w} height={240} data={pts} color={c.color} />
    </Stack>
  );
};

const BubbleScreen = () => {
  const w = useW();
  const c = useChartControls(20, 3, 60, 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pts = useMemo(() => Array.from({ length: c.count }, () => ({ x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 1000 })), [c.count, c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="bubbles" />
      <BubbleChart key={c.seed} width={w} height={260} data={pts} color={c.color} />
    </Stack>
  );
};

const RadarScreen = () => {
  const c = useChartControls(6, 3, AXES.length);
  const series = useMemo(
    () => colorsFor(c.color, 2).map((color) => ({ values: Array.from({ length: c.count }, () => 2 + randInt(8)), color })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [c.color, c.count, c.seed],
  );
  return (
    <Stack>
      <Controls c={c} unit="axes" />
      <Stack center>
        <RadarChart key={`${c.seed}-${c.count}`} width={300} height={300} axes={AXES.slice(0, c.count)} max={10} series={series} />
      </Stack>
    </Stack>
  );
};

const CandleScreen = () => {
  const w = useW();
  const c = useChartControls(40, 10, 120, 10);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => candles(c.count), [c.count, c.seed]);
  const [hit, setHit] = useState<Candle | null>(null);
  const down = colorsFor(c.color, 3)[2] ?? '#EF5350';
  return (
    <Stack>
      <Controls c={c} unit="candles" />
      <Caption>{hit ? `O ${hit.open.toFixed(2)}  H ${hit.high.toFixed(2)}  L ${hit.low.toFixed(2)}  C ${hit.close.toFixed(2)}` : 'Drag for OHLC'}</Caption>
      <CandlestickChart key={c.seed} width={w} effects={glow(c.color)} height={260} data={data} positiveColor={c.color} negativeColor={down} onScrub={(x) => setHit(x)} />
      <Caption>OHLC bars</Caption>
      <OHLCChart key={`o${c.seed}`} width={w} height={200} data={data} positiveColor={c.color} negativeColor={down} />
    </Stack>
  );
};

const HeatmapScreen = () => {
  const w = useW();
  const c = useChartControls(20, 5, 40, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const m = useMemo(() => Array.from({ length: 7 }, () => Array.from({ length: c.count }, () => Math.random())), [c.count, c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="weeks" />
      <HeatmapChart key={c.seed} width={w} height={140} data={m} colors={[theme.chip, c.color]} />
    </Stack>
  );
};

const GaugeScreen = () => {
  const c = useChartControls(1, 1, 3);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const values = useMemo(() => Array.from({ length: c.count }, () => randInt(100)), [c.count, c.seed]);
  const g = colorsFor(c.color, 3) as [string, string, string];
  return (
    <Stack>
      <Controls c={c} unit="gauges" />
      <Stack center>
        <GaugeChart width={260} height={260} value={values[0] ?? 0} gradient={g} />
        {values.slice(1).map((v, i) => (
          <GaugeChart key={i} width={260} height={160} value={v} sweep={180} color={g[i + 1] ?? c.color} showNeedle={false} />
        ))}
      </Stack>
    </Stack>
  );
};

const RingsScreen = () => {
  const c = useChartControls(3, 1, 6);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rings = useMemo(() => colorsFor(c.color, c.count).map((color) => ({ progress: Math.random(), color })), [c.color, c.count, c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="rings" />
      <Stack center>
        <ProgressRings key={`${c.seed}-${c.count}`} width={240} height={240} data={rings} />
        <ProgressRing key={`r${c.seed}`} width={80} height={80} thickness={10} progress={rings[0]?.progress ?? 0.7} color={c.color} />
      </Stack>
    </Stack>
  );
};

const CompatScreen = () => {
  const w = useW();
  const c = useChartControls(50, 10, 150, 10);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const points = useMemo(() => randomWalk(c.count).map((y, x) => ({ x, y })), [c.count, c.seed]);
  return (
    <Stack>
      <Controls c={c} unit="points" />
      <ChartPathProvider data={{ points, smoothingStrategy: 'bezier' }}>
        <ChartYLabel style={{ fontSize: 22, fontWeight: '700', color: theme.text }} />
        <View>
          <ChartPath width={w} height={200} stroke={c.color} />
          <ChartDot color={c.color} />
        </View>
      </ChartPathProvider>
    </Stack>
  );
};

// ---------- distinct home-tile previews (static, non-interactive) ----------
type PreviewProps = { w: number; h: number; color: string };
const fx = (n: number, f: (i: number) => number) => Array.from({ length: n }, (_, i) => f(i));
const wave = fx(24, (i) => 50 + Math.sin(i / 3) * 20 + i);
const quiet = { animation: { duration: 0 } } as const;

const previews: Record<string, (p: PreviewProps) => React.ReactElement> = {
  Playground: ({ w, h, color }) => <AreaChart {...quiet} width={w} height={h} data={wave} color={color} showGrid={false} interactive={false} padding={{ top: 4, right: 2, bottom: 4, left: 2 }} effects={{ glow: 8 }} />,
  Line: ({ w, h, color }) => <Sparkline width={w} height={h} data={wave} color={color} />,
  Area: ({ w, h, color }) => <Sparkline width={w} height={h} data={wave.map((v, i) => v + Math.cos(i) * 6)} color={color} fill />,
  'Stacked area': ({ w, h, color }) => (
    <StackedAreaChart {...quiet} width={w} height={h} showGrid={false} padding={{ top: 2, right: 0, bottom: 2, left: 0 }}
      series={colorsFor(color, 3).map((c, k) => ({ data: fx(10, (i) => 8 + ((i * (k + 3)) % 7)), color: c }))} />
  ),
  Bar: ({ w, h, color }) => <BarChart {...quiet} width={w} height={h} data={[5, 9, 6, 12, 8, 11, 7]} color={color} showGrid={false} padding={{ top: 2, right: 0, bottom: 2, left: 0 }} />,
  'Stacked bar': ({ w, h, color }) => (
    <StackedBarChart {...quiet} width={w} height={h} showGrid={false} padding={{ top: 2, right: 0, bottom: 2, left: 0 }}
      series={colorsFor(color, 3).map((c, k) => ({ data: fx(6, (i) => 3 + ((i + k * 2) % 5)), color: c }))} />
  ),
  Histogram: ({ w, h, color }) => <BarChart {...quiet} width={w} height={h} data={[1, 3, 6, 10, 13, 10, 6, 3, 1]} color={color} showGrid={false} padding={{ top: 2, right: 0, bottom: 2, left: 0 }} />,
  'Pie / Donut': ({ h, color }) => <DonutChart {...quiet} width={h} height={h} thickness={0.35} padAngle={3} data={colorsFor(color, 4).map((c, i) => ({ value: [40, 25, 20, 15][i] ?? 10, color: c }))} />,
  Scatter: ({ w, h, color }) => <ScatterChart {...quiet} width={w} height={h} radius={2.5} showGrid={false} color={color} padding={{ top: 4, right: 4, bottom: 4, left: 4 }} data={fx(30, (i) => i).map((i) => ({ x: i, y: i * 0.6 + ((i * 37) % 11) }))} />,
  Bubble: ({ w, h, color }) => <BubbleChart {...quiet} width={w} height={h} maxRadius={12} showGrid={false} color={color} padding={{ top: 10, right: 10, bottom: 10, left: 10 }} data={fx(8, (i) => i).map((i) => ({ x: i, y: (i * 53) % 10, z: ((i * 71) % 9) * 100 + 50 }))} />,
  Radar: ({ h, color }) => <RadarChart {...quiet} width={h} height={h} axes={AXES.slice(0, 6)} max={10} series={[{ values: [8, 6, 7, 4, 9, 5], color }]} />,
  'Candlestick / OHLC': ({ w, h, color }) => <CandlestickChart {...quiet} width={w} height={h} showGrid={false} interactive={false} positiveColor={color} padding={{ top: 2, right: 0, bottom: 2, left: 0 }} data={previewCandles} />,
  Heatmap: ({ w, h, color }) => <HeatmapChart {...quiet} width={w} height={h} colors={[theme.chip, color]} padding={{ top: 0, right: 0, bottom: 0, left: 0 }} data={fx(4, (r) => r).map((r) => fx(12, (c2) => ((r * 7 + c2 * 13) % 10) / 10))} />,
  Gauge: ({ h, color }) => <GaugeChart {...quiet} width={h * 1.6} height={h} value={68} sweep={180} color={color} showNeedle={false} />,
  'Progress rings': ({ h, color }) => <ProgressRings {...quiet} width={h} height={h} data={colorsFor(color, 3).map((c, i) => ({ progress: [0.8, 0.6, 0.4][i] ?? 0.5, color: c }))} />,
  'Rainbow-compatible API': ({ w, h, color }) => <LineChart {...quiet} width={w} height={h} data={wave.map((v, i) => v - (i % 4) * 3)} color={color} curve="step" showGrid={false} interactive={false} padding={{ top: 4, right: 2, bottom: 4, left: 2 }} />,
};
const previewCandles: Candle[] = fx(14, (i) => i).map((i) => {
  const open = 100 + Math.sin(i / 2) * 6;
  const close = open + (i % 3 === 0 ? -3 : 3);
  return { x: i, open, close, high: Math.max(open, close) + 1.5, low: Math.min(open, close) - 1.5 };
});

export interface ScreenDef { title: string; subtitle: string; Component: React.ComponentType; Preview: (p: PreviewProps) => React.ReactElement }
const defs: Omit<ScreenDef, 'Preview'>[] = [
  { title: 'Playground', subtitle: 'Every option & GPU effect as a live control', Component: Playground },
  { title: 'Line', subtitle: 'Scrubbing, morphing, multi-series, sparkline', Component: LineScreen },
  { title: 'Area', subtitle: 'Gradient fill, grow-in', Component: AreaScreen },
  { title: 'Stacked area', subtitle: 'Absolute and 100%', Component: StackedAreaScreen },
  { title: 'Bar', subtitle: 'Vertical, grouped, horizontal', Component: BarScreen },
  { title: 'Stacked bar', subtitle: 'Stacked series', Component: StackedBarScreen },
  { title: 'Histogram', subtitle: 'Binned distribution', Component: HistogramScreen },
  { title: 'Pie / Donut', subtitle: 'Sweep-in slices', Component: PieScreen },
  { title: 'Scatter', subtitle: 'Staggered pop-in', Component: ScatterScreen },
  { title: 'Bubble', subtitle: 'Size-encoded third dimension', Component: BubbleScreen },
  { title: 'Radar', subtitle: 'Spider chart, multiple series', Component: RadarScreen },
  { title: 'Candlestick / OHLC', subtitle: 'Financial charts with crosshair', Component: CandleScreen },
  { title: 'Heatmap', subtitle: 'Contribution-style matrix', Component: HeatmapScreen },
  { title: 'Gauge', subtitle: 'Dial with needle', Component: GaugeScreen },
  { title: 'Progress rings', subtitle: 'Activity rings', Component: RingsScreen },
  { title: 'Rainbow-compatible API', subtitle: 'ChartPathProvider / ChartPath / ChartDot', Component: CompatScreen },
];
export const screens: ScreenDef[] = defs.map((d) => ({ ...d, Preview: previews[d.title] ?? previews.Line! }));
