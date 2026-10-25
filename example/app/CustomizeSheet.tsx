import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { ColorFilterPreset, ShaderPreset } from 'expo-skia-charts';
import { Button, ChipGroup, ColorPicker, Label, Toggle } from '../components/ui';
import { CHARTS, type GradientKind } from './charts';
import { ChartView } from './ChartCard';
import { useChartStore } from './store';
import { palette, theme } from './theme';

const SHADERS: readonly ShaderPreset[] = ['none', 'shimmer', 'aurora', 'scanlines'];
const GRADIENTS: readonly GradientKind[] = ['none', 'linear', 'radial', 'sweep'];
const FILTERS: readonly ColorFilterPreset[] = ['none', 'grayscale', 'sepia', 'invert', 'saturate'];

const Step = ({ label, onPress, disabled }: { label: '−' | '+'; onPress: () => void; disabled: boolean }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={label === '−' ? 'Remove' : 'Add'} onPress={onPress} disabled={disabled} hitSlop={8}
    style={({ pressed }) => [styles.step, disabled && styles.disabled, pressed && styles.pressed]}>
    <Text style={styles.stepText}>{label}</Text>
  </Pressable>
);

/** Bottom-sheet body (presented as a native formSheet with detents). Edits apply live to the home card. */
export const CustomizeSheet = ({ id, onDone }: { id: string; onDone: () => void }) => {
  const { configs, update, reset } = useChartStore();
  const { width } = useWindowDimensions();
  const def = CHARTS.find((d) => d.id === id);
  const cfg = configs[id];
  if (!def || !cfg) return null;
  const w = width - 40;
  const set = update.bind(null, id);
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.body} nestedScrollEnabled>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.title}>{def.title}</Text>
          <Text style={styles.sub}>{def.subtitle}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onDone} hitSlop={10}><Text style={styles.done}>Done</Text></Pressable>
      </View>

      <View style={styles.preview}><ChartView def={def} cfg={cfg} width={w} height={180} /></View>

      <Label>Colour</Label>
      <ColorPicker colors={palette} value={cfg.color} onChange={(color) => set({ color })} />

      <Label>Data</Label>
      <View style={styles.row}>
        <Step label="−" disabled={cfg.count <= def.min} onPress={() => set({ count: Math.max(def.min, cfg.count - def.step) })} />
        <Text style={styles.count}>{cfg.count} {def.unit}</Text>
        <Step label="+" disabled={cfg.count >= def.max} onPress={() => set({ count: Math.min(def.max, cfg.count + def.step) })} />
        <View style={styles.flex}><Button title="Randomize" onPress={() => set({ seed: cfg.seed + 1 })} /></View>
      </View>

      <ChipGroup label="Gradient (GPU shader)" options={GRADIENTS} value={cfg.gradient} onChange={(gradient) => set({ gradient })} />
      {cfg.gradient !== 'none' ? (
        <>
          <Label>Gradient end colour</Label>
          <ColorPicker colors={palette} value={cfg.color2} onChange={(color2) => set({ color2 })} />
        </>
      ) : null}

      {def.flags.length > 0 ? <Label>Options</Label> : null}
      {def.flags.map((f) => (
        <Toggle key={f.key} label={f.label} value={cfg.flags[f.key] ?? false} onChange={(v) => set({ flags: { [f.key]: v } })} />
      ))}

      <Label>GPU effects</Label>
      <Toggle label="Drop shadow" value={cfg.shadow} onChange={(shadow) => set({ shadow })} />
      <Toggle label="Neon glow" value={cfg.glow} onChange={(glow) => set({ glow })} />
      <ChipGroup label="SkSL shader" options={SHADERS} value={cfg.shader} onChange={(shader) => set({ shader })} />
      <ChipGroup label="Colour filter" options={FILTERS} value={cfg.filter} onChange={(filter) => set({ filter })} />

      <Pressable accessibilityRole="button" onPress={() => reset(id)} style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
        <Text style={styles.resetText}>Reset to defaults</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 20, gap: 14, paddingBottom: 48, backgroundColor: theme.bg },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: theme.text, fontSize: 24, fontWeight: '800' },
  sub: { color: theme.sub, fontSize: 14 },
  done: { color: theme.accent, fontSize: 17, fontWeight: '700' },
  preview: { backgroundColor: theme.card, borderRadius: theme.radius, paddingVertical: 12, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: theme.cardBorder },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  step: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.cardBorder, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: theme.text, fontSize: 22, fontWeight: '700', marginTop: -2 },
  count: { color: theme.text, fontWeight: '600', minWidth: 84, textAlign: 'center', fontVariant: ['tabular-nums'] },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7 },
  reset: { alignSelf: 'center', padding: 12 },
  resetText: { color: '#FF5A5F', fontWeight: '600' },
});
