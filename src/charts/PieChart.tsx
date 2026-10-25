import React, { useMemo } from 'react';
import { EffectsLayer } from '../effects/EffectsLayer';
import { Canvas, Group, Path, Text, type SkFont } from 'react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import type { BaseChartProps, PieSlice } from '../types';
import { slicePath } from '../utils/path';
import { useEntryProgress } from '../hooks/useEntryProgress';

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

const Slice = ({ cx, cy, r, inner, start, sweep, color, progress, startAngle }: {
  cx: number; cy: number; r: number; inner: number; start: number; sweep: number; color: string; progress: SharedValue<number>; startAngle: number;
}) => {
  const path = useDerivedValue(() => {
    const p = progress.value;
    return slicePath(cx, cy, r, inner, startAngle + (start - startAngle) * p, Math.max(0.01, sweep * p));
  });
  return <Path path={path} color={color} />;
};

/** Pie / donut chart; slices sweep open on the UI thread. */
export const PieChart = ({ effects, gradient, width, height, style, data, innerRadius = 0, padAngle = 0, startAngle = -90, animation, backgroundColor, centerLabel, centerLabelColor = '#222', centerFont, font }: PieChartProps) => {
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const r = size / 2 - 4;
  const inner = r * innerRadius;
  const slices = useMemo(() => {
    const total = data.reduce((a, s) => a + Math.max(0, s.value), 0) || 1;
    let acc = startAngle;
    return data.map((s) => {
      const sweep = (Math.max(0, s.value) / total) * 360;
      const out = { start: acc + padAngle / 2, sweep: Math.max(0.01, sweep - padAngle), color: s.color, label: s.label };
      acc += sweep;
      return out;
    });
  }, [data, padAngle, startAngle]);
  const progress = useEntryProgress(animation ?? { duration: 900 }, [slices]);
  const cf = centerFont ?? font;
  return (
    <Canvas style={[{ width, height, backgroundColor }, style]}>
      <EffectsLayer effects={effects} gradient={gradient} width={width} height={height}>
      <Group>
        {slices.map((s, i) => <Slice key={i} cx={cx} cy={cy} r={r} inner={inner} start={s.start} sweep={s.sweep} color={s.color} progress={progress} startAngle={startAngle} />)}
      </Group>
      {cf && centerLabel ? <Text x={cx - cf.measureText(centerLabel).width / 2} y={cy + cf.getSize() / 3} text={centerLabel} font={cf} color={centerLabelColor} /> : null}
      </EffectsLayer>
    </Canvas>
  );
};

export type DonutChartProps = Omit<PieChartProps, 'innerRadius'> & { thickness?: number };
export const DonutChart = ({ thickness = 0.4, ...p }: DonutChartProps) => <PieChart {...p} innerRadius={1 - thickness} />;
