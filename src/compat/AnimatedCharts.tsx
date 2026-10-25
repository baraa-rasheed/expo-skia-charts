/**
 * Drop-in-style API inspired by @rainbow-me/react-native-animated-charts:
 * <ChartPathProvider data={{ points }}><ChartPath .../><ChartDot/><ChartYLabel/></ChartPathProvider>
 * Rendering is Skia; all scrubbing state lives in Reanimated shared values.
 */
import React, { createContext, useContext, useMemo, type ReactNode } from 'react';
import { TextInput, type TextInputProps, type TextStyle, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { LineChart } from '../charts/LineChart';
import type { CurveType, DataPoint } from '../types';

export interface ChartData {
  points: DataPoint[];
  smoothingStrategy?: 'bezier' | 'simple' | 'none';
}

interface Ctx {
  data: ChartData;
  isActive: SharedValue<boolean>;
  originalX: SharedValue<string>;
  originalY: SharedValue<string>;
  positionX: SharedValue<number>;
  positionY: SharedValue<number>;
  index: SharedValue<number>;
}
const ChartContext = createContext<Ctx | null>(null);

export const useChartData = (): Ctx => {
  const c = useContext(ChartContext);
  if (!c) throw new Error('useChartData must be used inside <ChartPathProvider>');
  return c;
};

export const ChartPathProvider = ({ data, children }: { data: ChartData; children: ReactNode }) => {
  const isActive = useSharedValue(false);
  const originalX = useSharedValue('');
  const originalY = useSharedValue('');
  const positionX = useSharedValue(-1);
  const positionY = useSharedValue(-1);
  const index = useSharedValue(-1);
  const value = useMemo(
    () => ({ data, isActive, originalX, originalY, positionX, positionY, index }),
    [data, isActive, originalX, originalY, positionX, positionY, index],
  );
  return <ChartContext.Provider value={value}>{children}</ChartContext.Provider>;
};

export interface ChartPathProps {
  width: number;
  height: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
  curve?: CurveType;
}

export const ChartPath = ({
  width,
  height,
  stroke = '#6C5CE7',
  strokeWidth = 3,
  fill = false,
  style,
  curve,
}: ChartPathProps) => {
  const { data, isActive, originalX, originalY, index, positionX, positionY } = useChartData();
  const strategy =
    data.smoothingStrategy === 'none' || data.smoothingStrategy === 'simple' ? 'linear' : 'monotone';
  const pts = data.points;
  const ys = pts.map((p) => p.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const minX = pts[0]?.x ?? 0;
  const maxX = pts[pts.length - 1]?.x ?? 1;
  return (
    <LineChart
      width={width}
      height={height}
      style={style}
      data={pts}
      color={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      curve={curve ?? strategy}
      showGrid={false}
      padding={8}
      cursorColor="transparent"
      onScrub={(p, i) => {
        index.value = i;
        isActive.value = p !== null;
        originalX.value = p ? String(p.x) : '';
        originalY.value = p ? String(p.y) : '';
        positionX.value = p ? 8 + ((p.x - minX) / (maxX - minX || 1)) * (width - 16) : -1;
        positionY.value = p ? 8 + (1 - (p.y - minY) / (maxY - minY || 1)) * (height - 16) : -1;
      }}
    />
  );
};

export const ChartDot = ({
  size = 10,
  color = '#6C5CE7',
  style,
}: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) => {
  const { isActive, positionX, positionY } = useChartData();
  const s = useAnimatedStyle(() => ({
    opacity: isActive.value ? 1 : 0,
    transform: [{ translateX: positionX.value - size / 2 }, { translateY: positionY.value - size / 2 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        s,
      ]}
    />
  );
};

Animated.addWhitelistedNativeProps?.({ text: true });
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const Label = ({
  source,
  format,
  style,
}: {
  source: SharedValue<string>;
  format?: (v: string) => string;
  style?: StyleProp<TextStyle>;
}) => {
  const text = useDerivedValue(() => (format ? format(source.value) : source.value));
  const animatedProps = useAnimatedProps(() => ({ text: text.value }) as unknown as Partial<TextInputProps>);
  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      style={style}
      animatedProps={animatedProps}
    />
  );
};

/** `format` must be a worklet. */
export const ChartYLabel = (p: { format?: (v: string) => string; style?: StyleProp<TextStyle> }) => {
  const { originalY } = useChartData();
  return <Label source={originalY} {...p} />;
};
export const ChartXLabel = (p: { format?: (v: string) => string; style?: StyleProp<TextStyle> }) => {
  const { originalX } = useChartData();
  return <Label source={originalX} {...p} />;
};

/** Monotone-cubic helper kept for API familiarity with rainbow's `monotoneCubicInterpolation`. */
export const monotoneCubicInterpolation = ({
  data,
  range = 80,
}: {
  data: DataPoint[];
  range?: number;
}): DataPoint[] => {
  if (data.length < 2) return data;
  const minX = data[0]!.x;
  const maxX = data[data.length - 1]!.x;
  const out: DataPoint[] = [];
  let j = 0;
  for (let k = 0; k < range; k++) {
    const x = minX + ((maxX - minX) * k) / (range - 1);
    while (j < data.length - 2 && data[j + 1]!.x < x) j++;
    const a = data[j]!;
    const b = data[j + 1]!;
    const t = (x - a.x) / (b.x - a.x || 1);
    const s = t * t * (3 - 2 * t);
    out.push({ x, y: a.y + (b.y - a.y) * s });
  }
  return out;
};
