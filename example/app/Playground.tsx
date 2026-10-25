import React, { useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import {
  AreaChart, BarChart, DonutChart, GaugeChart, LineChart, RadarChart, StackedAreaChart,
  type ChartBlendMode, type ChartEffects, type ColorFilterPreset, type CurveType, type DataPoint, type ShaderPreset,
} from 'expo-skia-charts';
import { Button, Card, ChipGroup, ColorPicker, Label, Toggle } from '../components/ui';
import { palette, theme } from './theme';
import { randomWalk } from './data';

const KINDS = ['line', 'area', 'bar', 'stacked', 'donut', 'radar', 'gauge'] as const;
type Kind = (typeof KINDS)[number];
const CURVES: readonly CurveType[] = ['monotone', 'linear', 'step'];
const FILTERS: readonly ColorFilterPreset[] = ['none', 'grayscale', 'sepia', 'invert', 'saturate'];
const SHADERS: readonly ShaderPreset[] = ['none', 'shimmer', 'aurora', 'scanlines'];
const BLENDS: readonly ChartBlendMode[] = ['srcOver', 'screen', 'plus', 'multiply', 'overlay', 'difference'];
const GLOW = [0, 4, 8, 14] as const;
const BLUR = [0, 2, 6] as const;
const DASH = ['off', '8·4', '2·6', '16·6'] as const;
const CORNER = [0, 6, 16] as const;
const POINTS = [12, 30, 60, 120] as const;

const dashMap: Record<(typeof DASH)[number], number[] | undefined> = { off: undefined, '8·4': [8, 4], '2·6': [2, 6], '16·6': [16, 6] };

/** Interactive playground: every chart option and every GPU effect is a live control. */
export const Playground = () => {
  const w = useWindowDimensions().width - 64;
  const [kind, setKind] = useState<Kind>('area');
  const [color, setColor] = useState<string>(palette[0]);
  const [curve, setCurve] = useState<CurveType>('monotone');
  const [n, setN] = useState<(typeof POINTS)[number]>(30);
  const [seed, setSeed] = useState(0);
  const [grid, setGrid] = useState(true);
  const [interactive, setInteractive] = useState(true);
  const [shadow, setShadow] = useState(true);
  const [glow, setGlow] = useState<(typeof GLOW)[number]>(8);
  const [blur, setBlur] = useState<(typeof BLUR)[number]>(0);
  const [filter, setFilter] = useState<ColorFilterPreset>('none');
  const [shader, setShader] = useState<ShaderPreset>('none');
  const [blend, setBlend] = useState<ChartBlendMode>('srcOver');
  const [dash, setDash] = useState<(typeof DASH)[number]>('off');
  const [corner, setCorner] = useState<(typeof CORNER)[number]>(0);
  const [reveal, setReveal] = useState(true);
  const [scrub, setScrub] = useState<DataPoint | null>(null);

  const data = useMemo(() => randomWalk(n), [n, seed]);
  const bars = useMemo(() => Array.from({ length: 8 }, () => 20 + Math.round(Math.random() * 80)), [seed]);
  const effects: ChartEffects = {
    shadow: shadow ? { dy: 8, blur: 10, color: `${color}88` } : undefined,
    glow: glow || undefined,
    blur: blur || undefined,
    colorFilter: filter,
    shader,
    blendMode: blend,
    dash: dashMap[dash],
    cornerRadius: corner || undefined,
    clipReveal: reveal ? 900 : 0,
  };
  const common = { width: w, height: 240, effects };

  const chart = (() => {
    switch (kind) {
      case 'line': return <LineChart {...common} data={data} color={color} curve={curve} showGrid={grid} interactive={interactive} onScrub={setScrub} />;
      case 'area': return <AreaChart {...common} data={data} color={color} curve={curve} showGrid={grid} interactive={interactive} onScrub={setScrub} />;
      case 'bar': return <BarChart {...common} data={bars} color={color} />;
      case 'stacked': return <StackedAreaChart {...common} curve={curve} showGrid={grid} series={palette.slice(0, 3).map((c, i) => ({ color: c, data: randomWalk(14, 20 - i * 4, 6).map(Math.abs) }))} />;
      case 'donut': return <View style={{ alignItems: 'center' }}><DonutChart {...common} width={240} data={palette.slice(0, 5).map((c) => ({ color: c, value: 10 + Math.random() * 40 }))} padAngle={2} /></View>;
      case 'radar': return <View style={{ alignItems: 'center' }}><RadarChart {...common} width={260} height={260} max={10} axes={['Speed', 'Power', 'Range', 'Armor', 'Agility', 'Stealth']} labelColor={theme.sub}
        series={[{ values: [8, 6, 7, 4, 9, 5], color }, { values: [5, 9, 4, 8, 4, 7], color: palette[2] }]} /></View>;
      case 'gauge': return <View style={{ alignItems: 'center' }}><GaugeChart {...common} width={240} value={Math.round(Math.random() * 100)} gradient={[palette[4], palette[3], palette[2]]} valueColor={theme.text} needleColor={theme.text} /></View>;
    }
  })();

  return (
    <View style={{ gap: 16 }}>
      <Card title="Preview" subtitle={scrub ? `x ${scrub.x} · y ${scrub.y}` : 'Press & drag line/area charts to scrub'}>
        <View key={`${kind}-${seed}`}>{chart}</View>
        <Button title="Shuffle data (morph)" onPress={() => setSeed((s) => s + 1)} />
      </Card>
      <Card title="Chart">
        <ChipGroup label="Type" options={KINDS} value={kind} onChange={setKind} />
        <ColorPicker colors={palette} value={color} onChange={setColor} />
        <ChipGroup label="Curve" options={CURVES} value={curve} onChange={setCurve} />
        <ChipGroup label="Points" options={POINTS} value={n} onChange={setN} />
        <Toggle label="Grid" value={grid} onChange={setGrid} />
        <Toggle label="Scrubbing gesture" value={interactive} onChange={setInteractive} />
      </Card>
      <Card title="GPU effects" subtitle="All rendered by Skia Graphite (Metal / Vulkan)">
        <Toggle label="Drop shadow (image filter)" value={shadow} onChange={setShadow} />
        <Toggle label="Clip-path reveal" value={reveal} onChange={setReveal} />
        <ChipGroup label="Glow (BlurMask σ)" options={GLOW} value={glow} onChange={setGlow} />
        <ChipGroup label="Blur (image filter)" options={BLUR} value={blur} onChange={setBlur} />
        <ChipGroup label="Colour filter" options={FILTERS} value={filter} onChange={setFilter} />
        <ChipGroup label="SkSL shader" options={SHADERS} value={shader} onChange={setShader} />
        <ChipGroup label="Blend mode (layer)" options={BLENDS} value={blend} onChange={setBlend} />
        <ChipGroup label="Dash path effect" options={DASH} value={dash} onChange={setDash} />
        <ChipGroup label="Corner path effect" options={CORNER} value={corner} onChange={setCorner} />
        <Label>Every control above maps 1:1 to the `effects` prop.</Label>
      </Card>
    </View>
  );
};
