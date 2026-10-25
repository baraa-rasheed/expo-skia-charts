import React, { useMemo } from 'react';
import { EffectsLayer } from '../effects/EffectsLayer';
import { Canvas, Circle, Group } from 'react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import type { BaseChartProps, BubblePoint, ScatterPoint } from '../types';
import { resolvePadding } from '../utils/padding';
import { extent, linearScale, niceTicks } from '../utils/scale';
import { useEntryProgress } from '../hooks/useEntryProgress';
import { Grid } from './Grid';

const Dot = ({ x, y, r, color, opacity, progress, delay }: { x: number; y: number; r: number; color: string; opacity: number; progress: SharedValue<number>; delay: number }) => {
  const rr = useDerivedValue(() => r * Math.min(1, Math.max(0, (progress.value - delay) / (1 - delay))));
  return <Circle cx={x} cy={y} r={rr} color={color} opacity={opacity} />;
};

export interface ScatterChartProps extends BaseChartProps {
  data: ScatterPoint[];
  /** Primary mark colour (hex). */
  color?: string;
  radius?: number;
  opacity?: number;
  /** Draw horizontal grid lines (axis labels also need `font`). */
  showGrid?: boolean;
  /** Formats y-axis labels, e.g. `(v) => "$" + v.toFixed(0)`. */
  formatY?: (v: number) => string;
}

/** Scatter plot – points pop in with a staggered scale. */
export const ScatterChart = ({ data, color = '#0984E3', radius = 4, opacity = 0.85, showGrid = true, ...p }: ScatterChartProps) => (
  <BubbleChart {...p} data={data.map((d) => ({ ...d, z: 1 }))} color={color} minRadius={radius} maxRadius={radius} opacity={opacity} showGrid={showGrid} />
);

export interface BubbleChartProps extends BaseChartProps {
  data: BubblePoint[];
  /** Primary mark colour (hex). */
  color?: string;
  minRadius?: number;
  maxRadius?: number;
  opacity?: number;
  /** Draw horizontal grid lines (axis labels also need `font`). */
  showGrid?: boolean;
  /** Formats y-axis labels, e.g. `(v) => "$" + v.toFixed(0)`. */
  formatY?: (v: number) => string;
}

/** Bubble chart – third dimension `z` mapped to area. */
export const BubbleChart = ({ effects, gradient, width, height, style, data, color = '#E17055', minRadius = 4, maxRadius = 24, opacity = 0.6, showGrid = true, font, formatY, animation, backgroundColor, padding }: BubbleChartProps) => {
  const pad = resolvePadding(padding, maxRadius);
  if (font) pad.left = Math.max(pad.left, 36);
  const { dots, yS, ticks } = useMemo(() => {
    const xS = linearScale(extent(data.map((d) => d.x)), [pad.left, width - pad.right]);
    const yd = extent(data.map((d) => d.y));
    const ys = linearScale(yd, [height - pad.bottom, pad.top]);
    const zd = extent(data.map((d) => Math.sqrt(Math.max(0, d.z))));
    const zS = minRadius === maxRadius ? () => minRadius : linearScale(zd, [minRadius, maxRadius]);
    return { dots: data.map((d) => ({ x: xS(d.x), y: ys(d.y), r: zS(Math.sqrt(Math.max(0, d.z))), color: d.color ?? color })), yS: ys, ticks: niceTicks(yd, 4) };
  }, [data, width, height, pad.left, pad.right, pad.top, pad.bottom, minRadius, maxRadius, color]);
  const progress = useEntryProgress(animation ?? { duration: 800 }, [dots]);
  return (
    <Canvas style={[{ width, height, backgroundColor }, style]}>
      {showGrid ? <Grid width={width} height={height} padding={pad} yTicks={ticks} yScale={yS} font={font} formatY={formatY} /> : null}
      <EffectsLayer effects={effects} gradient={gradient} width={width} height={height}>
      <Group>
        {dots.map((d, i) => <Dot key={i} {...d} opacity={opacity} progress={progress} delay={(i / Math.max(1, dots.length)) * 0.5} />)}
      </Group>
      </EffectsLayer>
    </Canvas>
  );
};
