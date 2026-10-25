import React, { useState } from 'react';
import { Button, Text, View, useWindowDimensions } from 'react-native';
import {
  AreaChart, BarChart, BubbleChart, CandlestickChart, ChartDot, ChartPath, ChartPathProvider, ChartYLabel, DonutChart, GaugeChart,
  HeatmapChart, Histogram, LineChart, OHLCChart, PieChart, ProgressRing, ProgressRings, RadarChart, ScatterChart, Sparkline,
  StackedAreaChart, StackedBarChart, type Candle, type DataPoint,
} from 'expo-skia-charts';
import { candles, randomWalk } from './data';

const useW = () => useWindowDimensions().width - 32;
const Caption = ({ children }: { children: React.ReactNode }) => <Text style={{ color: '#666' }}>{children}</Text>;

const LineScreen = () => {
  const w = useW();
  const [data, setData] = useState(() => randomWalk(40));
  const [scrub, setScrub] = useState<DataPoint | null>(null);
  return (
    <View style={{ gap: 12 }}>
      <Caption>{scrub ? `x=${scrub.x}  y=${scrub.y}` : 'Press and drag to scrub'}</Caption>
      <LineChart width={w} height={220} data={data} onScrub={(p) => setScrub(p)} />
      <Button title="Randomize (morph)" onPress={() => setData(randomWalk(40))} />
      <Caption>Multi-series, step curve</Caption>
      <LineChart width={w} height={180} curve="step" series={[{ data: randomWalk(20), color: '#E17055' }, { data: randomWalk(20), color: '#0984E3' }]} />
      <Caption>Sparkline</Caption>
      <Sparkline width={120} height={36} data={randomWalk(30)} color="#00B894" />
    </View>
  );
};

const AreaScreen = () => {
  const w = useW();
  const [data, setData] = useState(() => randomWalk(30));
  return (
    <View style={{ gap: 12 }}>
      <AreaChart width={w} height={220} data={data} color="#00B894" />
      <Button title="Randomize" onPress={() => setData(randomWalk(30))} />
    </View>
  );
};

const StackedAreaScreen = () => {
  const w = useW();
  const s = [{ data: randomWalk(12, 20, 6).map(Math.abs), color: '#6C5CE7' }, { data: randomWalk(12, 15, 6).map(Math.abs), color: '#00CEC9' }, { data: randomWalk(12, 10, 6).map(Math.abs), color: '#FDCB6E' }];
  return (
    <View style={{ gap: 12 }}>
      <StackedAreaChart width={w} height={200} series={s} />
      <Caption>100% stacked</Caption>
      <StackedAreaChart width={w} height={200} series={s} percent />
    </View>
  );
};

const BarScreen = () => {
  const w = useW();
  const [seed, setSeed] = useState(0);
  const rnd = () => Array.from({ length: 7 }, () => Math.round(Math.random() * 100));
  return (
    <View style={{ gap: 12 }} key={seed}>
      <BarChart width={w} height={200} data={rnd()} labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} />
      <Caption>Grouped</Caption>
      <BarChart width={w} height={200} series={[{ data: rnd(), color: '#6C5CE7' }, { data: rnd(), color: '#FD79A8' }]} />
      <Caption>Horizontal with negatives</Caption>
      <BarChart width={w} height={200} horizontal data={[30, -20, 45, -10, 25]} color="#0984E3" />
      <Button title="Replay" onPress={() => setSeed((s) => s + 1)} />
    </View>
  );
};

const StackedBarScreen = () => {
  const w = useW();
  return <StackedBarChart width={w} height={240} series={[{ data: [10, 20, 30, 25], color: '#00B894' }, { data: [15, 10, 5, 20], color: '#FDCB6E' }, { data: [5, 15, 10, 8], color: '#E17055' }]} />;
};

const HistogramScreen = () => {
  const w = useW();
  const values = Array.from({ length: 500 }, () => (Math.random() + Math.random() + Math.random()) * 33);
  return <Histogram width={w} height={220} values={values} bins={20} color="#A29BFE" />;
};

const pie = [{ value: 40, color: '#6C5CE7' }, { value: 25, color: '#00CEC9' }, { value: 20, color: '#FDCB6E' }, { value: 15, color: '#E17055' }];
const PieScreen = () => (
  <View style={{ gap: 12, alignItems: 'center' }}>
    <PieChart width={240} height={240} data={pie} padAngle={1.5} />
    <Caption>Donut</Caption>
    <DonutChart width={240} height={240} data={pie} thickness={0.3} padAngle={2} />
  </View>
);

const ScatterScreen = () => {
  const w = useW();
  const pts = Array.from({ length: 80 }, () => { const x = Math.random() * 100; return { x, y: x * 0.6 + Math.random() * 30 }; });
  return <ScatterChart width={w} height={240} data={pts} />;
};

const BubbleScreen = () => {
  const w = useW();
  const pts = Array.from({ length: 20 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 1000 }));
  return <BubbleChart width={w} height={260} data={pts} />;
};

const RadarScreen = () => (
  <View style={{ alignItems: 'center' }}>
    <RadarChart width={300} height={300} axes={['Speed', 'Power', 'Range', 'Armor', 'Agility', 'Stealth']} max={10}
      series={[{ values: [8, 6, 7, 4, 9, 5], color: '#6C5CE7' }, { values: [5, 9, 4, 8, 4, 7], color: '#E17055' }]} />
  </View>
);

const CandleScreen = () => {
  const w = useW();
  const [data] = useState(() => candles(40));
  const [c, setC] = useState<Candle | null>(null);
  return (
    <View style={{ gap: 12 }}>
      <Caption>{c ? `O ${c.open.toFixed(2)}  H ${c.high.toFixed(2)}  L ${c.low.toFixed(2)}  C ${c.close.toFixed(2)}` : 'Drag for OHLC'}</Caption>
      <CandlestickChart width={w} height={260} data={data} onScrub={(x) => setC(x)} />
      <Caption>OHLC bars</Caption>
      <OHLCChart width={w} height={200} data={data} />
    </View>
  );
};

const HeatmapScreen = () => {
  const w = useW();
  const m = Array.from({ length: 7 }, () => Array.from({ length: 20 }, () => Math.random()));
  return <HeatmapChart width={w} height={140} data={m} />;
};

const GaugeScreen = () => {
  const [v, setV] = useState(64);
  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <GaugeChart width={260} height={260} value={v} gradient={['#00B894', '#FDCB6E', '#E17055']} />
      <GaugeChart width={260} height={160} value={v} sweep={180} color="#0984E3" showNeedle={false} />
      <Button title="Random value" onPress={() => setV(Math.round(Math.random() * 100))} />
    </View>
  );
};

const RingsScreen = () => {
  const [k, setK] = useState(0);
  const r = () => Math.random();
  return (
    <View style={{ alignItems: 'center', gap: 12 }} key={k}>
      <ProgressRings width={240} height={240} data={[{ progress: r(), color: '#FF2D55' }, { progress: r(), color: '#A4FF00' }, { progress: r(), color: '#00E5FF' }]} />
      <ProgressRing width={80} height={80} thickness={10} progress={0.72} color="#6C5CE7" />
      <Button title="Replay" onPress={() => setK((x) => x + 1)} />
    </View>
  );
};

const CompatScreen = () => {
  const w = useW();
  const points = randomWalk(50).map((y, x) => ({ x, y }));
  return (
    <ChartPathProvider data={{ points, smoothingStrategy: 'bezier' }}>
      <ChartYLabel style={{ fontSize: 22, fontWeight: '700', color: '#222' }} />
      <View>
        <ChartPath width={w} height={200} stroke="#FD79A8" />
        <ChartDot color="#FD79A8" />
      </View>
    </ChartPathProvider>
  );
};

export const screens: { title: string; subtitle: string; Component: React.ComponentType }[] = [
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
