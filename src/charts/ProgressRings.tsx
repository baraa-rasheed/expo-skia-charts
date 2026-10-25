import React, { useEffect } from 'react';
import { EffectsLayer } from '../effects/EffectsLayer';
import { Canvas, Group, Path } from 'react-native-skia';
import { Easing, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import type { BaseChartProps, RingData } from '../types';
import { arcPath } from '../utils/path';

export interface ProgressRingsProps extends Omit<BaseChartProps, 'padding'> {
  /** Outer → inner rings. `progress` in 0..1 (values >1 wrap visually up to 1). */
  data: RingData[];
  thickness?: number;
  gap?: number;
  trackOpacity?: number;
}

const Ring = ({ cx, cy, r, thickness, ring, index, duration, trackOpacity }: { cx: number; cy: number; r: number; thickness: number; ring: RingData; index: number; duration: number; trackOpacity: number }) => {
  const end = useSharedValue(0);
  useEffect(() => {
    end.value = withDelay(index * 120, withTiming(Math.min(1, Math.max(0, ring.progress)), { duration, easing: Easing.out(Easing.exp) }));
  }, [ring.progress, index, duration, end]);
  const path = arcPath(cx, cy, r, -90, 359.99);
  return (
    <Group>
      <Path path={path} style="stroke" strokeWidth={thickness} color={ring.backgroundColor ?? ring.color} opacity={ring.backgroundColor ? 1 : trackOpacity} />
      <Path path={path} style="stroke" strokeWidth={thickness} strokeCap="round" color={ring.color} start={0} end={end} />
    </Group>
  );
};

/** Apple-Activity-style concentric progress rings. */
export const ProgressRings = ({ effects, width, height, style, data, thickness = 18, gap = 4, trackOpacity = 0.2, animation, backgroundColor }: ProgressRingsProps) => {
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - thickness / 2;
  return (
    <Canvas style={[{ width, height, backgroundColor }, style]}>
      <EffectsLayer effects={effects} width={width} height={height}>
      {data.map((ring, i) => (
        <Ring key={i} cx={cx} cy={cy} r={outer - i * (thickness + gap)} thickness={thickness} ring={ring} index={i} duration={animation?.duration ?? 1000} trackOpacity={trackOpacity} />
      ))}
      </EffectsLayer>
    </Canvas>
  );
};

export type ProgressRingProps = Omit<ProgressRingsProps, 'data'> & RingData;
/** Single progress ring. */
export const ProgressRing = ({ progress, color, backgroundColor: bg, label, ...p }: ProgressRingProps) => (
  <ProgressRings {...p} data={[{ progress, color, backgroundColor: bg, label }]} />
);
