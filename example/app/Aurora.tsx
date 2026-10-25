import React from 'react';
import { StyleSheet } from 'react-native';
import { BlurMask, Canvas, Circle, Group, LinearGradient, Rect, useClock, vec } from 'react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';
import { aurora, theme } from './theme';

/**
 * Slowly drifting aurora behind the large title, rendered on the GPU: three blurred blobs (BlurMask)
 * animated from a frame clock on the UI thread, then faded into the page background.
 */
export const Aurora = ({ width, height }: { width: number; height: number }) => {
  const clock = useClock();
  const a = useDerivedValue(() => width * (0.2 + 0.08 * Math.sin(clock.value / 4200)));
  const b = useDerivedValue(() => width * (0.78 + 0.07 * Math.cos(clock.value / 5100)));
  const c = useDerivedValue(() => width * (0.5 + 0.12 * Math.sin(clock.value / 6300 + 1)));
  const r = width * 0.42;
  return (
    <Canvas style={[StyleSheet.absoluteFill, { height }]} pointerEvents="none">
      <Group opacity={0.55}>
        <BlurMask blur={70} style="normal" />
        <Circle cx={a} cy={height * 0.18} r={r} color={aurora[0]} />
        <Circle cx={b} cy={height * 0.12} r={r * 0.85} color={aurora[1]} />
        <Circle cx={c} cy={height * 0.42} r={r * 0.7} color={aurora[2]} opacity={0.7} />
      </Group>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient start={vec(0, height * 0.35)} end={vec(0, height)} colors={['rgba(5,5,12,0)', theme.bg]} />
      </Rect>
    </Canvas>
  );
};
