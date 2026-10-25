import React, { useMemo } from 'react';
import { EffectsLayer } from '../effects/EffectsLayer';
import { Canvas, Group, Path } from 'react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import type { BaseChartProps, CurveType } from '../types';
import { resolvePadding } from '../utils/padding';
import { extent, linearScale, niceTicks } from '../utils/scale';
import { buildBandPath } from '../utils/path';
import { useEntryProgress } from '../hooks/useEntryProgress';
import { Grid } from './Grid';

export interface StackedAreaChartProps extends BaseChartProps {
  series: { data: number[]; color: string; label?: string }[];
  curve?: CurveType;
  /** Normalise each x to 100%. */
  percent?: boolean;
  showGrid?: boolean;
  formatY?: (v: number) => string;
  fillOpacity?: number;
}

/** Stacked (or 100%-stacked) area chart. Bands grow up from the baseline. */
export const StackedAreaChart = ({ effects, gradient, width, height, style, series, curve = 'monotone', percent = false, showGrid = true, formatY, fillOpacity = 0.85, font, animation, backgroundColor, padding }: StackedAreaChartProps) => {
  const pad = resolvePadding(padding, 16);
  if (font) pad.left = Math.max(pad.left, 36);
  const { bands, yS, ticks } = useMemo(() => {
    const n = Math.max(0, ...series.map((s) => s.data.length));
    const totals = Array.from({ length: n }, (_, i) => series.reduce((a, s) => a + (s.data[i] ?? 0), 0));
    const yd = percent ? { min: 0, max: 100 } : extent([0, ...totals]);
    const xS = linearScale({ min: 0, max: Math.max(1, n - 1) }, [pad.left, width - pad.right]);
    const ys = linearScale(yd, [height - pad.bottom, pad.top]);
    const acc = new Array<number>(n).fill(0);
    const out = series.map((s) => {
      const lower = acc.map((v, i) => ({ x: xS(i), y: ys(v) }));
      for (let i = 0; i < n; i++) acc[i]! += percent ? ((s.data[i] ?? 0) / (totals[i] || 1)) * 100 : (s.data[i] ?? 0);
      const upper = acc.map((v, i) => ({ x: xS(i), y: ys(v) }));
      return { path: buildBandPath(upper, lower, curve), color: s.color };
    });
    return { bands: out, yS: ys, ticks: niceTicks(yd, 4) };
  }, [series, percent, curve, width, height, pad.left, pad.right, pad.top, pad.bottom]);
  const progress = useEntryProgress(animation, [bands]);
  const base = height - pad.bottom;
  const transform = useDerivedValue(() => [{ translateY: base }, { scaleY: progress.value }, { translateY: -base }]);
  return (
    <Canvas style={[{ width, height, backgroundColor }, style]}>
      {showGrid ? <Grid width={width} height={height} padding={pad} yTicks={ticks} yScale={yS} font={font} formatY={formatY ?? (percent ? (v) => `${v}%` : undefined)} /> : null}
      <EffectsLayer effects={effects} gradient={gradient} width={width} height={height}>
      <Group transform={transform}>
        {bands.map((b, i) => <Path key={i} path={b.path} color={b.color} opacity={fillOpacity} />)}
      </Group>
      </EffectsLayer>
    </Canvas>
  );
};
