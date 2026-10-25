import React, { useMemo } from 'react';
import { EffectsLayer } from '../effects/EffectsLayer';
import { Canvas, Group, RoundedRect, Text } from 'react-native-skia';
import { useDerivedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import type { BaseChartProps } from '../types';
import { resolvePadding } from '../utils/padding';
import { extent } from '../utils/scale';
import { useEntryProgress } from '../hooks/useEntryProgress';
import { ChartFrame, ZoomGroup, useHighlight, useSelection, type SelectableProps, type ZoomableProps } from '../interaction';
import { GestureDetector } from 'react-native-gesture-handler';


/** Heatmap. Selection index = `row * columns + column`. */
export interface HeatmapChartProps extends BaseChartProps, SelectableProps, ZoomableProps {
  /** Row-major matrix of values. */
  data: number[][];
  /** Color stops from low → high (hex #RRGGBB). */
  colors?: [string, string] | [string, string, string];
  gap?: number;
  radius?: number;
  rowLabels?: string[];
  columnLabels?: string[];
  labelColor?: string;
}

const hex = (h: string): [number, number, number] => {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
export const lerpColor = (stops: string[], t: number): string => {
  const seg = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const lt = t * (stops.length - 1) - seg;
  const a = hex(stops[seg]!);
  const b = hex(stops[seg + 1]!);
  const c = a.map((v, i) => Math.round(v + (b[i]! - v) * lt));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

const Cell = ({ x, y, w, h, r, color, progress, delay, index, selected }: { x: number; y: number; w: number; h: number; r: number; color: string; progress: SharedValue<number>; delay: number; index: number; selected: SharedValue<number> }) => {
  const hl = useHighlight(selected, index, 0.35);
  const op = useDerivedValue(() => hl.value * Math.min(1, Math.max(0, (progress.value - delay) / 0.4)));
  const ring = useDerivedValue(() => withTiming(selected.value === index ? 1 : 0, { duration: 180 }));
  return (
    <>
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color={color} opacity={op} />
      <RoundedRect x={x} y={y} width={w} height={h} r={r} color="#FFFFFF" style="stroke" strokeWidth={2} opacity={ring} />
    </>
  );
};

/** Matrix heatmap (calendar / correlation style) with diagonal fade-in. */
export const HeatmapChart = (props: HeatmapChartProps) => {
  const { effects, gradient, width, height, style, data, colors = ['#EBEDF0', '#216E39'], gap = 2, radius = 2, rowLabels, columnLabels, labelColor = '#888', font, animation, backgroundColor, padding } = props;
  const pad = resolvePadding(padding, 4);
  if (font && rowLabels) pad.left = Math.max(pad.left, 32);
  if (font && columnLabels) pad.top = Math.max(pad.top, 16);
  const rows = data.length;
  const cols = Math.max(0, ...data.map((r) => r.length));
  const cw = (width - pad.left - pad.right) / Math.max(1, cols);
  const ch = (height - pad.top - pad.bottom) / Math.max(1, rows);
  const cells = useMemo(() => {
    const d = extent(data.flat());
    return data.flatMap((row, ri) => row.map((v, ci) => ({
      index: ri * cols + ci,
      x: pad.left + ci * cw + gap / 2, y: pad.top + ri * ch + gap / 2, w: cw - gap, h: ch - gap,
      color: lerpColor(colors, (v - d.min) / (d.max - d.min || 1)), delay: ((ri + ci) / Math.max(1, rows + cols)) * 0.6,
    })));
  }, [data, colors, cw, ch, gap, pad.left, pad.top, rows, cols]);
  const progress = useEntryProgress(animation ?? { duration: 900 }, [cells]);
  const left = pad.left;
  const top = pad.top;
  const { gesture, selected } = useSelection(props, (px, py) => {
    'worklet';
    const c = Math.floor((px - left) / cw);
    const r = Math.floor((py - top) / ch);
    return c >= 0 && c < cols && r >= 0 && r < rows ? r * cols + c : -1;
  });
  return (
    <ChartFrame zoom={props.zoom} width={width} height={height}>
    <GestureDetector gesture={gesture}>
    <Canvas style={[{ width, height, backgroundColor }, style]}>
      <ZoomGroup>
      <EffectsLayer effects={effects} gradient={gradient} width={width} height={height}>
      <Group>{cells.map((c, i) => <Cell key={i} {...c} r={radius} progress={progress} selected={selected} />)}</Group>
      {font && rowLabels ? rowLabels.map((l, i) => <Text key={`r${i}`} x={2} y={pad.top + i * ch + ch / 2 + font.getSize() / 3} text={l} font={font} color={labelColor} />) : null}
      {font && columnLabels ? columnLabels.map((l, i) => <Text key={`c${i}`} x={pad.left + i * cw + cw / 2 - font.measureText(l).width / 2} y={pad.top - 4} text={l} font={font} color={labelColor} />) : null}
      </EffectsLayer>
      </ZoomGroup>
    </Canvas>
    </GestureDetector>
    </ChartFrame>
  );
};
