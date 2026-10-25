import React from 'react';
import {
  AreaChart, BarChart, BubbleChart, CandlestickChart, DonutChart, GaugeChart, HeatmapChart, Histogram, LineChart, OHLCChart,
  PieChart, ProgressRings, RadarChart, ScatterChart, StackedAreaChart, StackedBarChart, type Candle, type ChartEffects,
  type ChartGradient, type ColorFilterPreset, type ShaderPreset,
} from 'expo-skia-charts';
import { palette, theme } from './theme';

/* ---------------- deterministic data ---------------- */
export type Rng = () => number;
/** mulberry32: same seed → same data, so the home card and the sheet preview always match. */
export const makeRng = (seed: number): Rng => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const walk = (r: Rng, n: number, start = 100, vol = 4) => {
  let v = start;
  return Array.from({ length: n }, () => (v = Math.max(1, v + (r() - 0.5) * vol)));
};
const candlesOf = (r: Rng, n: number): Candle[] => {
  let p = 100;
  return Array.from({ length: n }, (_, x) => {
    const open = p;
    const close = open + (r() - 0.5) * 6;
    p = close;
    return { x, open, close, high: Math.max(open, close) + r() * 3, low: Math.min(open, close) - r() * 3 };
  });
};
const colorsFrom = (base: string, n: number) => {
  const i0 = Math.max(0, palette.indexOf(base as (typeof palette)[number]));
  return Array.from({ length: n }, (_, i) => (i === 0 ? base : (palette[(i0 + i) % palette.length] ?? base)));
};

/* ---------------- config ---------------- */
export type FlagKey = 'grid' | 'fill' | 'smooth' | 'percent' | 'horizontal' | 'donut' | 'needle' | 'ohlc' | 'interactive';
export interface ChartConfig {
  color: string;
  count: number;
  seed: number;
  flags: Partial<Record<FlagKey, boolean>>;
  glow: boolean;
  shadow: boolean;
  shader: ShaderPreset;
  filter: ColorFilterPreset;
  /** GPU gradient applied to the marks: 'none' keeps the solid colour. */
  gradient: GradientKind;
  /** Second gradient stop (the first is `color`). */
  color2: string;
}
export type GradientKind = 'none' | 'linear' | 'radial' | 'sweep';
export interface Summary { value: string; delta?: number; caption: string }
interface RenderArgs { cfg: ChartConfig; w: number; h: number; effects: ChartEffects; gradient?: ChartGradient }
export interface ChartDef {
  id: string;
  title: string;
  subtitle: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  initial: number;
  flags: { key: FlagKey; label: string; initial: boolean }[];
  /** Builds deterministic data from the config and returns the headline + a renderer. */
  build: (cfg: ChartConfig) => { summary: Summary; render: (a: RenderArgs) => React.ReactElement };
}

const pct = (a: number, b: number) => ((b - a) / (a || 1)) * 100;
const money = (v: number) => `$${v.toFixed(2)}`;
const seriesSummary = (d: number[], caption: string): Summary => ({ value: money(d[d.length - 1] ?? 0), delta: pct(d[0] ?? 0, d[d.length - 1] ?? 0), caption });
const salt = (id: string) => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7);
const rngFor = (id: string, cfg: ChartConfig) => makeRng(salt(id) + cfg.seed * 7919);
const flag = (cfg: ChartConfig, k: FlagKey) => cfg.flags[k] ?? false;

export const CHARTS: ChartDef[] = [
  {
    id: 'line', title: 'Line', subtitle: 'ACME · scrub to inspect', unit: 'points', min: 5, max: 150, step: 5, initial: 40,
    flags: [{ key: 'grid', label: 'Grid', initial: false }, { key: 'smooth', label: 'Smooth curve', initial: true }, { key: 'interactive', label: 'Scrubbing', initial: true }],
    build: (cfg) => {
      const d = walk(rngFor('line', cfg), cfg.count);
      return {
        summary: seriesSummary(d, '1D'),
        render: ({ w, h, effects, gradient }) => (
          <LineChart width={w} height={h} data={d} color={cfg.color} curve={flag(cfg, 'smooth') ? 'monotone' : 'linear'}
            showGrid={flag(cfg, 'grid')} interactive={flag(cfg, 'interactive')} effects={effects} gradient={gradient} />
        ),
      };
    },
  },
  {
    id: 'area', title: 'Area', subtitle: 'Portfolio · gradient fill', unit: 'points', min: 5, max: 150, step: 5, initial: 30,
    flags: [{ key: 'grid', label: 'Grid', initial: false }, { key: 'interactive', label: 'Scrubbing', initial: true }],
    build: (cfg) => {
      const d = walk(rngFor('area', cfg), cfg.count, 120, 5);
      return {
        summary: seriesSummary(d, '1W'),
        render: ({ w, h, effects, gradient }) => <AreaChart width={w} height={h} data={d} color={cfg.color} showGrid={flag(cfg, 'grid')} interactive={flag(cfg, 'interactive')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'candle', title: 'Candlestick', subtitle: 'BTC-USD · OHLC', unit: 'candles', min: 10, max: 120, step: 10, initial: 30,
    flags: [{ key: 'ohlc', label: 'OHLC bars', initial: false }, { key: 'grid', label: 'Grid', initial: false }, { key: 'interactive', label: 'Crosshair', initial: true }],
    build: (cfg) => {
      const d = candlesOf(rngFor('candle', cfg), cfg.count);
      const down = colorsFrom(cfg.color, 3)[2] ?? '#FF5A5F';
      const Comp = flag(cfg, 'ohlc') ? OHLCChart : CandlestickChart;
      return {
        summary: { value: money(d[d.length - 1]?.close ?? 0), delta: pct(d[0]?.open ?? 0, d[d.length - 1]?.close ?? 0), caption: '1M' },
        render: ({ w, h, effects, gradient }) => <Comp width={w} height={h} data={d} positiveColor={cfg.color} negativeColor={down} showGrid={flag(cfg, 'grid')} interactive={flag(cfg, 'interactive')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'bar', title: 'Bar', subtitle: 'Daily volume', unit: 'bars', min: 3, max: 30, step: 1, initial: 12,
    flags: [{ key: 'horizontal', label: 'Horizontal', initial: false }, { key: 'grid', label: 'Grid', initial: false }],
    build: (cfg) => {
      const r = rngFor('bar', cfg);
      const d = Array.from({ length: cfg.count }, () => Math.round(10 + r() * 90));
      const total = d.reduce((a, b) => a + b, 0);
      return {
        summary: { value: `${(total / 10).toFixed(1)}M`, caption: 'Volume' },
        render: ({ w, h, effects, gradient }) => <BarChart key={`${cfg.seed}-${flag(cfg, 'horizontal')}`} width={w} height={h} data={d} color={cfg.color} horizontal={flag(cfg, 'horizontal')} showGrid={flag(cfg, 'grid')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'stackedBar', title: 'Stacked bar', subtitle: 'Revenue by segment', unit: 'series', min: 1, max: 6, step: 1, initial: 3,
    flags: [{ key: 'grid', label: 'Grid', initial: false }],
    build: (cfg) => {
      const r = rngFor('stackedBar', cfg);
      const s = colorsFrom(cfg.color, cfg.count).map((color) => ({ color, data: Array.from({ length: 8 }, () => 4 + Math.round(r() * 20)) }));
      return {
        summary: { value: `${cfg.count} segments`, caption: 'Q1–Q8' },
        render: ({ w, h, effects, gradient }) => <StackedBarChart key={cfg.seed} width={w} height={h} series={s} showGrid={flag(cfg, 'grid')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'stackedArea', title: 'Stacked area', subtitle: 'Allocation over time', unit: 'series', min: 1, max: 6, step: 1, initial: 3,
    flags: [{ key: 'percent', label: '100% stacked', initial: false }, { key: 'grid', label: 'Grid', initial: false }],
    build: (cfg) => {
      const r = rngFor('stackedArea', cfg);
      const s = colorsFrom(cfg.color, cfg.count).map((color, i) => ({ color, data: walk(r, 16, 20 - i * 2, 6) }));
      return {
        summary: { value: `${cfg.count} assets`, caption: flag(cfg, 'percent') ? 'Share' : 'Value' },
        render: ({ w, h, effects, gradient }) => <StackedAreaChart width={w} height={h} series={s} percent={flag(cfg, 'percent')} showGrid={flag(cfg, 'grid')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'histogram', title: 'Histogram', subtitle: 'Return distribution', unit: 'bins', min: 5, max: 60, step: 5, initial: 20,
    flags: [{ key: 'grid', label: 'Grid', initial: false }],
    build: (cfg) => {
      const r = rngFor('histogram', cfg);
      const v = Array.from({ length: 600 }, () => (r() + r() + r() - 1.5) * 4);
      const mean = v.reduce((a, b) => a + b, 0) / v.length;
      return {
        summary: { value: `${mean >= 0 ? '+' : ''}${mean.toFixed(2)}%`, caption: 'Mean daily' },
        render: ({ w, h, effects, gradient }) => <Histogram key={cfg.seed} width={w} height={h} values={v} bins={cfg.count} color={cfg.color} showGrid={flag(cfg, 'grid')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'pie', title: 'Pie / Donut', subtitle: 'Holdings breakdown', unit: 'slices', min: 2, max: 6, step: 1, initial: 4,
    flags: [{ key: 'donut', label: 'Donut', initial: true }],
    build: (cfg) => {
      const r = rngFor('pie', cfg);
      const d = colorsFrom(cfg.color, cfg.count).map((color) => ({ color, value: 5 + Math.round(r() * 40) }));
      const top = Math.round((Math.max(...d.map((x) => x.value)) / d.reduce((a, b) => a + b.value, 0)) * 100);
      return {
        summary: { value: `${top}%`, caption: 'Largest holding' },
        render: ({ h, effects, gradient }) => (flag(cfg, 'donut')
          ? <DonutChart key={cfg.seed} width={h} height={h} data={d} thickness={0.32} padAngle={2} effects={effects} gradient={gradient} />
          : <PieChart key={cfg.seed} width={h} height={h} data={d} padAngle={1.5} effects={effects} gradient={gradient} />),
      };
    },
  },
  {
    id: 'scatter', title: 'Scatter', subtitle: 'Risk vs return', unit: 'points', min: 10, max: 400, step: 20, initial: 80,
    flags: [{ key: 'grid', label: 'Grid', initial: false }],
    build: (cfg) => {
      const r = rngFor('scatter', cfg);
      const d = Array.from({ length: cfg.count }, () => { const x = r() * 100; return { x, y: x * 0.6 + r() * 30 }; });
      return {
        summary: { value: 'ρ 0.89', caption: 'Correlation' },
        render: ({ w, h, effects, gradient }) => <ScatterChart key={cfg.seed} width={w} height={h} data={d} color={cfg.color} radius={3} showGrid={flag(cfg, 'grid')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'bubble', title: 'Bubble', subtitle: 'Market cap · P/E · growth', unit: 'bubbles', min: 3, max: 60, step: 3, initial: 15,
    flags: [{ key: 'grid', label: 'Grid', initial: false }],
    build: (cfg) => {
      const r = rngFor('bubble', cfg);
      const d = Array.from({ length: cfg.count }, () => ({ x: r() * 100, y: r() * 100, z: r() * 1000 }));
      return {
        summary: { value: `${cfg.count} cos`, caption: 'Sector' },
        render: ({ w, h, effects, gradient }) => <BubbleChart key={cfg.seed} width={w} height={h} data={d} color={cfg.color} maxRadius={18} showGrid={flag(cfg, 'grid')} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'radar', title: 'Radar', subtitle: 'Fund factor exposure', unit: 'axes', min: 3, max: 10, step: 1, initial: 6,
    flags: [],
    build: (cfg) => {
      const axes = ['Value', 'Growth', 'Momentum', 'Quality', 'Size', 'Yield', 'Vol', 'Beta', 'ESG', 'Liquidity'].slice(0, cfg.count);
      const r = rngFor('radar', cfg);
      const s = colorsFrom(cfg.color, 2).map((color) => ({ color, values: axes.map(() => 2 + Math.round(r() * 8)) }));
      return {
        summary: { value: `${cfg.count} factors`, caption: 'Fund vs index' },
        render: ({ h, effects, gradient }) => <RadarChart key={`${cfg.seed}-${cfg.count}`} width={h} height={h} axes={axes} max={10} series={s} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'heatmap', title: 'Heatmap', subtitle: 'Trading activity', unit: 'weeks', min: 5, max: 40, step: 5, initial: 20,
    flags: [],
    build: (cfg) => {
      const r = rngFor('heatmap', cfg);
      const m = Array.from({ length: 7 }, () => Array.from({ length: cfg.count }, () => r()));
      return {
        summary: { value: `${cfg.count * 7} days`, caption: 'Activity' },
        render: ({ w, h, effects, gradient }) => <HeatmapChart key={cfg.seed} width={w} height={h} data={m} colors={[theme.chip, cfg.color]} padding={0} effects={effects} gradient={gradient} />,
      };
    },
  },
  {
    id: 'gauge', title: 'Gauge', subtitle: 'Fear & greed index', unit: 'value', min: 0, max: 100, step: 10, initial: 60,
    flags: [{ key: 'needle', label: 'Needle', initial: true }],
    build: (cfg) => ({
      summary: { value: String(cfg.count), caption: cfg.count >= 55 ? 'Greed' : cfg.count <= 45 ? 'Fear' : 'Neutral' },
      render: ({ h, effects }) => <GaugeChart width={h * 1.3} height={h} value={cfg.count} gradient={cfg.gradient === 'none' ? colorsFrom(cfg.color, 3) : [cfg.color, cfg.color2]} showNeedle={flag(cfg, 'needle')} effects={effects} />,
    }),
  },
  {
    id: 'rings', title: 'Progress rings', subtitle: 'Savings goals', unit: 'rings', min: 1, max: 6, step: 1, initial: 3,
    flags: [],
    build: (cfg) => {
      const r = rngFor('rings', cfg);
      const d = colorsFrom(cfg.color, cfg.count).map((color) => ({ color, progress: 0.2 + r() * 0.8 }));
      const avg = Math.round((d.reduce((a, b) => a + b.progress, 0) / d.length) * 100);
      return {
        summary: { value: `${avg}%`, caption: 'Avg. progress' },
        render: ({ h, effects, gradient }) => <ProgressRings key={`${cfg.seed}-${cfg.count}`} width={h} height={h} data={d} effects={effects} gradient={gradient} />,
      };
    },
  },
];

export const initialConfig = (def: ChartDef, i: number): ChartConfig => ({
  color: palette[i % palette.length] ?? theme.accent,
  count: def.initial,
  seed: 0,
  flags: Object.fromEntries(def.flags.map((f) => [f.key, f.initial])),
  glow: false,
  shadow: true,
  shader: 'none',
  filter: 'none',
  gradient: 'none',
  color2: palette[(i + 2) % palette.length] ?? theme.accent,
});

export const effectsFor = (cfg: ChartConfig): ChartEffects => ({
  shadow: cfg.shadow ? { dy: 4, blur: 8, color: `${cfg.color}66` } : undefined,
  glow: cfg.glow ? 8 : undefined,
  shader: cfg.shader,
  colorFilter: cfg.filter,
});

/** Maps the sheet's gradient controls to the library's `gradient` prop (GPU Linear/Radial/Sweep gradient shader). */
export const gradientFor = (cfg: ChartConfig): ChartGradient | undefined => {
  if (cfg.gradient === 'none') return undefined;
  const colors = [cfg.color, cfg.color2];
  if (cfg.gradient === 'linear') return { type: 'linear', colors, start: [0, 0], end: [1, 1] };
  if (cfg.gradient === 'radial') return { type: 'radial', colors, center: [0.5, 0.5], radius: 0.9 };
  return { type: 'sweep', colors: [cfg.color, cfg.color2, cfg.color] };
};
