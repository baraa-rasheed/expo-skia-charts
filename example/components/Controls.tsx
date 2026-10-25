import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, ColorPicker } from './ui';
import { palette, theme } from '../app/theme';

export interface ChartControls {
  color: string;
  setColor: (c: string) => void;
  count: number;
  seed: number;
  randomize: () => void;
  more: () => void;
  less: () => void;
  min: number;
  max: number;
}

/** Shared per-screen state: colour, a count (points / series / slices) and a seed that bumps on randomize. */
export const useChartControls = (initial: number, min: number, max: number, step = 1): ChartControls => {
  const [color, setColor] = useState<string>(palette[0]);
  const [count, setCount] = useState(initial);
  const [seed, setSeed] = useState(0);
  const randomize = useCallback(() => setSeed((s) => s + 1), []);
  const more = useCallback(() => setCount((c) => Math.min(max, c + step)), [max, step]);
  const less = useCallback(() => setCount((c) => Math.max(min, c - step)), [min, step]);
  return { color, setColor, count, seed, randomize, more, less, min, max };
};

const Step = ({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={label === '−' ? 'Less' : 'More'} onPress={onPress} disabled={disabled} hitSlop={8}
    style={({ pressed }) => [styles.step, disabled && styles.disabled, pressed && styles.pressed]}>
    <Text style={styles.stepText}>{label}</Text>
  </Pressable>
);

export const Controls = ({ c, unit }: { c: ChartControls; unit: string }) => (
  <View style={styles.wrap}>
    <ColorPicker colors={palette} value={c.color} onChange={c.setColor} />
    <View style={styles.row}>
      <Step label="−" onPress={c.less} disabled={c.count <= c.min} />
      <Text style={styles.count}>{c.count} {unit}</Text>
      <Step label="+" onPress={c.more} disabled={c.count >= c.max} />
      <View style={styles.flex}><Button title="Randomize" onPress={c.randomize} /></View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { gap: 12, backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.cardBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  step: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.cardBorder, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: theme.text, fontSize: 22, fontWeight: '700', marginTop: -2 },
  count: { color: theme.text, fontWeight: '600', minWidth: 76, textAlign: 'center', fontVariant: ['tabular-nums'] },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
});
