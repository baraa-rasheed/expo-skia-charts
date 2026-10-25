import React, { createContext, useContext, useEffect } from 'react';
import { View } from 'react-native';
import { Group } from 'react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/** Pinch-zoom / pan options. `true` = defaults (1x to 4x, double-tap to toggle 2x / reset). */
export type ZoomConfig = boolean | { min?: number; max?: number; doubleTap?: boolean };

/** Tap / long-press selection, shared by Bar, Pie/Donut, Scatter/Bubble, Heatmap and Progress Rings. */
export interface SelectableProps {
  /** Tap (or long-press) a mark to select and highlight it; tap it again to clear. Default `false`. */
  selectable?: boolean;
  /** Controlled selection: mark index, or `null` for none. Omit for uncontrolled. */
  selectedIndex?: number | null;
  /** Fires on the JS thread with the selected mark index, or `null` when cleared. */
  onSelect?: (index: number | null) => void;
}

/** Pinch-zoom and two-finger pan, for axis charts (Line, Area, Bar, Candlestick, Scatter, Bubble, Heatmap, Stacked area). */
export interface ZoomableProps {
  /** Pinch to zoom, two-finger drag to pan, double-tap to toggle 2x / reset. Rendered by Skia, so it stays crisp. */
  zoom?: ZoomConfig;
}

interface ZoomState {
  scale: SharedValue<number>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  width: number;
  height: number;
}
const ZoomContext = createContext<ZoomState | null>(null);
const SPRING = { damping: 20, stiffness: 180 } as const;

const ZoomFrame = ({
  zoom,
  width,
  height,
  children,
}: {
  zoom: Exclude<ZoomConfig, false>;
  width: number;
  height: number;
  children: React.ReactNode;
}) => {
  const cfg = typeof zoom === 'object' ? zoom : {};
  const min = cfg.min ?? 1;
  const max = cfg.max ?? 4;
  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const s0 = useSharedValue(1);
  const tx0 = useSharedValue(0);
  const ty0 = useSharedValue(0);
  const fx = useSharedValue(0);
  const fy = useSharedValue(0);
  const settle = () => {
    'worklet';
    const s = Math.min(max, Math.max(min, scale.value));
    const mx = ((s - 1) * width) / 2;
    const my = ((s - 1) * height) / 2;
    scale.value = withSpring(s, SPRING);
    tx.value = withSpring(Math.min(mx, Math.max(-mx, tx.value)), SPRING);
    ty.value = withSpring(Math.min(my, Math.max(-my, ty.value)), SPRING);
  };
  const pinch = Gesture.Pinch()
    .onStart((e) => {
      s0.value = scale.value;
      tx0.value = tx.value;
      ty0.value = ty.value;
      fx.value = e.focalX - width / 2;
      fy.value = e.focalY - height / 2;
    })
    .onUpdate((e) => {
      // Rubber-band slightly past the limits, settle on release. Zoom around the focal point.
      const s = Math.min(max * 1.25, Math.max(min * 0.8, s0.value * e.scale));
      const k = s / s0.value;
      scale.value = s;
      tx.value = fx.value - (fx.value - tx0.value) * k;
      ty.value = fy.value - (fy.value - ty0.value) * k;
    })
    .onEnd(settle);
  const pan = Gesture.Pan()
    .minPointers(2)
    .onStart(() => {
      tx0.value = tx.value;
      ty0.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = tx0.value + e.translationX;
      ty.value = ty0.value + e.translationY;
    })
    .onEnd(settle);
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .enabled(cfg.doubleTap ?? true)
    .onEnd((e, ok) => {
      if (!ok) return;
      if (scale.value > 1.01) {
        scale.value = withSpring(1, SPRING);
        tx.value = withSpring(0, SPRING);
        ty.value = withSpring(0, SPRING);
        return;
      }
      const s = Math.min(max, 2);
      scale.value = withSpring(s, SPRING);
      tx.value = withSpring(-(e.x - width / 2) * (s - 1), SPRING);
      ty.value = withSpring(-(e.y - height / 2) * (s - 1), SPRING);
    });
  return (
    <ZoomContext.Provider value={{ scale, tx, ty, width, height }}>
      <GestureDetector gesture={Gesture.Simultaneous(pinch, pan, doubleTap)}>
        <View collapsable={false}>{children}</View>
      </GestureDetector>
    </ZoomContext.Provider>
  );
};

/** Wraps a chart to enable pinch-zoom / pan when `zoom` is set; otherwise renders children unchanged. */
export const ChartFrame = ({
  zoom,
  width,
  height,
  children,
}: {
  zoom?: ZoomConfig;
  width: number;
  height: number;
  children: React.ReactNode;
}) =>
  zoom ? (
    <ZoomFrame zoom={zoom} width={width} height={height}>
      {children}
    </ZoomFrame>
  ) : (
    <>{children}</>
  );

const ZoomGroupInner = ({ z, children }: { z: ZoomState; children: React.ReactNode }) => {
  const transform = useDerivedValue(() => [
    { translateX: z.width / 2 + z.tx.value },
    { translateY: z.height / 2 + z.ty.value },
    { scale: z.scale.value },
    { translateX: -z.width / 2 },
    { translateY: -z.height / 2 },
  ]);
  return <Group transform={transform}>{children}</Group>;
};
/** Skia group that applies the surrounding ChartFrame's zoom/pan (identity when zoom is off). */
export const ZoomGroup = ({ children }: { children: React.ReactNode }) => {
  const z = useContext(ZoomContext);
  return z ? <ZoomGroupInner z={z}>{children}</ZoomGroupInner> : <>{children}</>;
};

/** Worklet that maps a touch point to un-zoomed chart coordinates. */
export const useToChart = () => {
  const z = useContext(ZoomContext);
  const one = useSharedValue(1);
  const zero = useSharedValue(0);
  const scale = z?.scale ?? one;
  const tx = z?.tx ?? zero;
  const ty = z?.ty ?? zero;
  const w = z?.width ?? 0;
  const h = z?.height ?? 0;
  return (x: number, y: number): [number, number] => {
    'worklet';
    return [(x - w / 2 - tx.value) / scale.value + w / 2, (y - h / 2 - ty.value) / scale.value + h / 2];
  };
};

/**
 * Tap toggles selection, long-press selects (and keeps it while held for "details" UIs).
 * `hitTest` must be a worklet returning the mark index at a chart point, or -1.
 */
export const useSelection = (
  { selectable = false, selectedIndex, onSelect }: SelectableProps,
  hitTest: (x: number, y: number) => number,
): { gesture: ReturnType<typeof Gesture.Exclusive>; selected: SharedValue<number> } => {
  const selected = useSharedValue(selectedIndex ?? -1);
  const toChart = useToChart();
  useEffect(() => {
    if (selectedIndex !== undefined) selected.value = selectedIndex ?? -1;
  }, [selectedIndex, selected]);
  const emit = (i: number) => onSelect?.(i < 0 ? null : i);
  const tap = Gesture.Tap()
    .enabled(selectable)
    .maxDuration(280)
    .onEnd((e, ok) => {
      if (!ok) return;
      const [x, y] = toChart(e.x, e.y);
      const i = hitTest(x, y);
      const next = i === selected.value ? -1 : i;
      selected.value = next;
      if (onSelect) runOnJS(emit)(next);
    });
  const long = Gesture.LongPress()
    .enabled(selectable)
    .minDuration(320)
    .onStart((e) => {
      const [x, y] = toChart(e.x, e.y);
      const i = hitTest(x, y);
      selected.value = i;
      if (onSelect) runOnJS(emit)(i);
    });
  return { gesture: Gesture.Exclusive(long, tap), selected };
};

/** Opacity for mark `index`: 1 when nothing or this mark is selected, `dim` otherwise (animated). */
export const useHighlight = (selected: SharedValue<number> | undefined, index: number, dim = 0.28) =>
  useDerivedValue(() =>
    withTiming(!selected || selected.value < 0 || selected.value === index ? 1 : dim, { duration: 180 }),
  );
