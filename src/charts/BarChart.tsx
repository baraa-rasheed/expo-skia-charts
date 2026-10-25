import React, { useMemo } from 'react';
import { EffectsLayer } from '../effects/EffectsLayer';
import { Canvas, Group, RoundedRect } from 'react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import type { BarSeries, BaseChartProps } from '../types';
import { resolvePadding } from '../utils/padding';
import { extent, linearScale, niceTicks } from '../utils/scale';
import { useEntryProgress } from '../hooks/useEntryProgress';
import { Grid } from './Grid';
import {
  ChartFrame,
  ZoomGroup,
  useHighlight,
  useSelection,
  type SelectableProps,
  type ZoomableProps,
} from '../interaction';
import { GestureDetector } from 'react-native-gesture-handler';

/** Bars. Selection index = category (slot) index. */
export interface BarChartProps extends BaseChartProps, SelectableProps, ZoomableProps {
  /** Single series shorthand. */
  data?: number[];
  /** Primary mark colour (hex). */
  color?: string;
  series?: BarSeries[];
  /** Stack series on top of each other instead of grouping side by side. */
  stacked?: boolean;
  horizontal?: boolean;
  labels?: string[];
  /** 0..1 fraction of the slot occupied by bars. */
  barWidthRatio?: number;
  radius?: number;
  /** Draw horizontal grid lines (axis labels also need `font`). */
  showGrid?: boolean;
  /** Formats y-axis labels, e.g. `(v) => "$" + v.toFixed(0)`. */
  formatY?: (v: number) => string;
  /** Stagger between bars, ms-equivalent fraction (0..1) of total duration. */
  stagger?: number;
}

interface BarGeom {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  order: number;
  horizontal: boolean;
  base: number;
}

const AnimatedBar = ({
  g,
  progress,
  radius,
  count,
  stagger,
  selected,
}: {
  g: BarGeom;
  progress: SharedValue<number>;
  radius: number;
  count: number;
  stagger: number;
  selected: SharedValue<number>;
}) => {
  const opacity = useHighlight(selected, g.order);
  const t = useDerivedValue(() => {
    const s = (g.order / Math.max(1, count)) * stagger;
    const v = (progress.value - s) / (1 - stagger);
    return Math.min(1, Math.max(0, v));
  });
  const x = useDerivedValue(() => (g.horizontal ? g.base + (g.x - g.base) * t.value : g.x));
  const y = useDerivedValue(() => (g.horizontal ? g.y : g.base + (g.y - g.base) * t.value));
  const w = useDerivedValue(() => (g.horizontal ? g.w * t.value : g.w));
  const h = useDerivedValue(() => (g.horizontal ? g.h : g.h * t.value));
  return <RoundedRect x={x} y={y} width={w} height={h} r={radius} color={g.color} opacity={opacity} />;
};

/** Vertical / horizontal, grouped or stacked bar chart with staggered grow-in. */
export const BarChart = (props: BarChartProps) => {
  const {
    width,
    height,
    style,
    animation,
    font,
    backgroundColor,
    data,
    color = '#00B894',
    series,
    stacked = false,
    horizontal = false,
    labels,
    barWidthRatio = 0.7,
    radius = 4,
    showGrid = true,
    formatY,
    stagger = 0.4,
  } = props;
  const pad = resolvePadding(props.padding, 16);
  if (font) {
    pad.left = Math.max(pad.left, 36);
    pad.bottom = Math.max(pad.bottom, 20);
  }
  const all: BarSeries[] = useMemo(() => series ?? (data ? [{ data, color }] : []), [series, data, color]);

  const { bars, ticks, valueScale, xLabels, start, slot } = useMemo(() => {
    const n = Math.max(0, ...all.map((s) => s.data.length));
    const totals: number[] = [];
    const negTotals: number[] = [];
    for (let i = 0; i < n; i++) {
      totals.push(all.reduce((a, s) => a + Math.max(0, s.data[i] ?? 0), 0));
      negTotals.push(all.reduce((a, s) => a + Math.min(0, s.data[i] ?? 0), 0));
    }
    const vals = stacked ? [...totals, ...negTotals] : all.flatMap((s) => s.data);
    const vd = extent(vals, true);
    const along: [number, number] = horizontal
      ? [pad.top, height - pad.bottom]
      : [pad.left, width - pad.right];
    const vRange: [number, number] = horizontal
      ? [pad.left, width - pad.right]
      : [height - pad.bottom, pad.top];
    const vS = linearScale(vd, vRange);
    const slot = (along[1] - along[0]) / Math.max(1, n);
    const bw = slot * barWidthRatio;
    const zero = vS(0);
    const out: BarGeom[] = [];
    const xl: { x: number; label: string }[] = [];
    for (let i = 0; i < n; i++) {
      const slotStart = along[0] + slot * i + (slot - bw) / 2;
      if (labels?.[i] !== undefined) xl.push({ x: slotStart + bw / 2, label: labels[i]! });
      let posAcc = 0;
      let negAcc = 0;
      all.forEach((s, si) => {
        const v = s.data[i] ?? 0;
        let a0: number;
        let a1: number;
        let thick: number;
        let offset: number;
        if (stacked) {
          if (v >= 0) {
            a0 = posAcc;
            a1 = posAcc + v;
            posAcc = a1;
          } else {
            a0 = negAcc;
            a1 = negAcc + v;
            negAcc = a1;
          }
          thick = bw;
          offset = slotStart;
        } else {
          a0 = 0;
          a1 = v;
          thick = bw / all.length;
          offset = slotStart + thick * si;
        }
        const p0 = vS(a0);
        const p1 = vS(a1);
        if (horizontal) {
          out.push({
            x: Math.min(p0, p1),
            y: offset,
            w: Math.abs(p1 - p0),
            h: thick * 0.92,
            color: s.color,
            order: i,
            horizontal,
            base: zero,
          });
        } else {
          out.push({
            x: offset,
            y: Math.min(p0, p1),
            w: thick * 0.92,
            h: Math.abs(p1 - p0),
            color: s.color,
            order: i,
            horizontal,
            base: zero,
          });
        }
      });
    }
    return {
      bars: out,
      ticks: niceTicks(vd, 4),
      valueScale: vS,
      xLabels: xl,
      count: n,
      start: along[0],
      slot,
    };
  }, [
    all,
    stacked,
    horizontal,
    width,
    height,
    pad.left,
    pad.right,
    pad.top,
    pad.bottom,
    barWidthRatio,
    labels,
  ]);

  const progress = useEntryProgress(animation ?? { duration: 800 }, [bars]);
  const count = Math.max(1, ...all.map((s) => s.data.length));
  const { gesture, selected } = useSelection(props, (px, py) => {
    'worklet';
    const i = Math.floor(((horizontal ? py : px) - start) / slot);
    return i >= 0 && i < count ? i : -1;
  });

  return (
    <ChartFrame zoom={props.zoom} width={width} height={height}>
      <GestureDetector gesture={gesture}>
        <Canvas style={[{ width, height, backgroundColor }, style]}>
          <ZoomGroup>
            {showGrid && !horizontal ? (
              <Grid
                width={width}
                height={height}
                padding={pad}
                yTicks={ticks}
                yScale={valueScale}
                font={font}
                formatY={formatY}
                xLabels={xLabels}
              />
            ) : null}
            <EffectsLayer effects={props.effects} gradient={props.gradient} width={width} height={height}>
              <Group>
                {bars.map((g, i) => (
                  <AnimatedBar
                    key={i}
                    g={g}
                    progress={progress}
                    radius={radius}
                    count={count}
                    stagger={stagger}
                    selected={selected}
                  />
                ))}
              </Group>
            </EffectsLayer>
          </ZoomGroup>
        </Canvas>
      </GestureDetector>
    </ChartFrame>
  );
};

export type StackedBarChartProps = Omit<BarChartProps, 'stacked'>;
export const StackedBarChart = (p: StackedBarChartProps) => <BarChart {...p} stacked />;

export interface HistogramProps extends Omit<BarChartProps, 'data' | 'series' | 'labels'> {
  values: number[];
  bins?: number;
}
/** Bins raw values and renders them as bars. */
export const Histogram = ({ values, bins = 10, ...rest }: HistogramProps) => {
  const counts = useMemo(() => {
    const d = extent(values);
    const step = (d.max - d.min) / bins;
    const c = new Array<number>(bins).fill(0);
    for (const v of values) c[Math.min(bins - 1, Math.floor((v - d.min) / (step || 1)))]! += 1;
    return c;
  }, [values, bins]);
  return <BarChart barWidthRatio={0.98} radius={1} {...rest} data={counts} />;
};
