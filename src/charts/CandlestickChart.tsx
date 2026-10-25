import React, { useMemo } from 'react';
import { EffectsLayer } from '../effects/EffectsLayer';
import { View } from 'react-native';
import { Canvas, Group, Line, Rect, vec } from 'react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useAnimatedReaction, useDerivedValue, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';
import type { BaseChartProps, Candle } from '../types';
import { resolvePadding } from '../utils/padding';
import { extent, linearScale, niceTicks } from '../utils/scale';
import { useEntryProgress } from '../hooks/useEntryProgress';
import { Grid } from './Grid';

export interface CandlestickChartProps extends BaseChartProps {
  data: Candle[];
  positiveColor?: string;
  negativeColor?: string;
  /** 'candle' (default) or 'ohlc' bars. */
  variant?: 'candle' | 'ohlc';
  showGrid?: boolean;
  formatY?: (v: number) => string;
  interactive?: boolean;
  onScrub?: (candle: Candle | null, index: number) => void;
}

interface CG { x: number; w: number; hi: number; lo: number; o: number; c: number; mid: number; color: string }

const CandleShape = ({ g, progress, variant }: { g: CG; progress: SharedValue<number>; variant: 'candle' | 'ohlc' }) => {
  const s = (v: number) => {
    'worklet';
    return g.mid + (v - g.mid) * progress.value;
  };
  const w1 = useDerivedValue(() => vec(g.x + g.w / 2, s(g.hi)));
  const w2 = useDerivedValue(() => vec(g.x + g.w / 2, s(g.lo)));
  const by = useDerivedValue(() => s(Math.min(g.o, g.c)));
  const bh = useDerivedValue(() => Math.max(1, Math.abs(g.c - g.o) * progress.value));
  const o1 = useDerivedValue(() => vec(g.x, s(g.o)));
  const o2 = useDerivedValue(() => vec(g.x + g.w / 2, s(g.o)));
  const c1 = useDerivedValue(() => vec(g.x + g.w / 2, s(g.c)));
  const c2 = useDerivedValue(() => vec(g.x + g.w, s(g.c)));
  return (
    <Group>
      <Line p1={w1} p2={w2} color={g.color} strokeWidth={1.2} />
      {variant === 'candle' ? (
        <Rect x={g.x} y={by} width={g.w} height={bh} color={g.color} />
      ) : (
        <Group>
          <Line p1={o1} p2={o2} color={g.color} strokeWidth={1.5} />
          <Line p1={c1} p2={c2} color={g.color} strokeWidth={1.5} />
        </Group>
      )}
    </Group>
  );
};

/** Candlestick / OHLC chart with crosshair scrubbing. */
export const CandlestickChart = ({ effects, gradient, width, height, style, data, positiveColor = '#26A69A', negativeColor = '#EF5350', variant = 'candle', showGrid = true, formatY, font, animation, backgroundColor, padding, interactive = true, onScrub }: CandlestickChartProps) => {
  const pad = resolvePadding(padding, 12);
  if (font) pad.left = Math.max(pad.left, 40);
  const { candles, yS, ticks } = useMemo(() => {
    const yd = extent(data.flatMap((c) => [c.high, c.low]));
    const ys = linearScale(yd, [height - pad.bottom, pad.top]);
    const slot = (width - pad.left - pad.right) / Math.max(1, data.length);
    const w = Math.max(1, slot * 0.65);
    return {
      yS: ys,
      ticks: niceTicks(yd, 4),
      candles: data.map((c, i): CG => ({
        x: pad.left + slot * i + (slot - w) / 2, w, hi: ys(c.high), lo: ys(c.low), o: ys(c.open), c: ys(c.close),
        mid: ys((c.high + c.low) / 2), color: c.close >= c.open ? positiveColor : negativeColor,
      })),
    };
  }, [data, width, height, pad.left, pad.right, pad.top, pad.bottom, positiveColor, negativeColor]);
  const progress = useEntryProgress(animation, [candles]);

  const xs = useMemo(() => candles.map((c) => c.x + c.w / 2), [candles]);
  const idx = useSharedValue(-1);
  const active = useSharedValue(0);
  const shown = useSharedValue(-1);
  const find = (x: number) => {
    'worklet';
    let b = 0; let bd = Infinity;
    for (let i = 0; i < xs.length; i++) { const d = Math.abs((xs[i] as number) - x); if (d < bd) { bd = d; b = i; } }
    return b;
  };
  const emit = (i: number) => onScrub?.(i >= 0 ? (data[i] ?? null) : null, i);
  useAnimatedReaction(() => idx.value, (i, prev) => { if (i !== prev && onScrub) runOnJS(emit)(i); });
  const gesture = Gesture.Pan().enabled(interactive).minDistance(0)
    .onBegin((e) => { const i = find(e.x); shown.value = i; idx.value = i; active.value = withTiming(1, { duration: 100 }); })
    .onUpdate((e) => { const i = find(e.x); shown.value = i; idx.value = i; })
    .onFinalize(() => { active.value = withTiming(0, { duration: 160 }); idx.value = -1; });
  const cxv = useDerivedValue(() => xs[Math.max(0, shown.value)] ?? 0);
  const p1 = useDerivedValue(() => vec(cxv.value, pad.top));
  const p2 = useDerivedValue(() => vec(cxv.value, height - pad.bottom));

  return (
    <View style={[{ width, height }, style]}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height, backgroundColor }}>
          {showGrid ? <Grid width={width} height={height} padding={pad} yTicks={ticks} yScale={yS} font={font} formatY={formatY} /> : null}
          <EffectsLayer effects={effects} gradient={gradient} width={width} height={height}>
          {candles.map((g, i) => <CandleShape key={i} g={g} progress={progress} variant={variant} />)}
          <Line p1={p1} p2={p2} color="#888" strokeWidth={1} opacity={active} />
          </EffectsLayer>
        </Canvas>
      </GestureDetector>
    </View>
  );
};

export type OHLCChartProps = Omit<CandlestickChartProps, 'variant'>;
export const OHLCChart = (p: OHLCChartProps) => <CandlestickChart {...p} variant="ohlc" />;
