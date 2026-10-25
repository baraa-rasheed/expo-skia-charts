import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorFilterPreset, ShaderPreset } from 'react-native-skia-chart';
import { CHARTS, type GradientKind } from './charts';
import { Segmented } from './Segmented';
import { useChartStore } from './store';
import { palette, theme } from './theme';

const GRADIENTS: readonly GradientKind[] = ['none', 'linear', 'radial', 'sweep'];
const SHADERS: readonly ShaderPreset[] = ['none', 'shimmer', 'aurora', 'scanlines'];
const FILTERS: readonly ColorFilterPreset[] = ['none', 'grayscale', 'sepia', 'invert', 'saturate'];
const tap = () => void Haptics.selectionAsync();

/** SF Symbol on iOS, text glyph elsewhere. */
const Icon = ({ name, fallback, size = 17, color = theme.text }: { name: SymbolViewProps['name']; fallback: string; size?: number; color?: string }) => (
  <SymbolView name={name} size={size} weight="semibold" tintColor={color} fallback={<Text style={[styles.glyph, { color, fontSize: size }]}>{fallback}</Text>} />
);

/** Frosted-glass capsule button (UIBlurEffect on iOS). */
const Glass = ({ children, onPress, label, disabled, style }: {
  children: React.ReactNode; onPress: () => void; label: string; disabled?: boolean; style?: object;
}) => (
  <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} hitSlop={6}
    onPress={() => { tap(); onPress(); }}
    style={({ pressed }) => [styles.glassWrap, style, disabled && styles.disabled, pressed && styles.pressed]}>
    <BlurView intensity={40} tint="systemThinMaterialDark" style={styles.glass}>{children}</BlurView>
  </Pressable>
);

/** iOS inset-grouped section. */
const Section = ({ title, footer, children }: { title?: string; footer?: string; children: React.ReactNode }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text> : null}
    <View style={styles.group}>
      {React.Children.toArray(children).filter(Boolean).map((c, i) => (
        <View key={i} style={i > 0 && styles.sep}>{c}</View>
      ))}
    </View>
    {footer ? <Text style={styles.footer}>{footer}</Text> : null}
  </View>
);

const Cell = ({ label, children }: { label: string; children?: React.ReactNode }) => (
  <View style={styles.cell}><Text style={styles.cellLabel}>{label}</Text>{children}</View>
);
const Stacked = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={styles.stacked}><Text style={styles.cellLabel}>{label}</Text>{children}</View>
);
const SwitchCell = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <Cell label={label}>
    <Switch value={value} onValueChange={(v) => { tap(); onChange(v); }} trackColor={{ true: theme.up }} accessibilityLabel={label} />
  </Cell>
);

const Swatches = ({ value, onChange }: { value: string; onChange: (c: string) => void }) => (
  <View style={styles.swatches}>
    {palette.map((c) => (
      <Pressable key={c} accessibilityRole="button" accessibilityLabel={`Colour ${c}`} accessibilityState={{ selected: c === value }}
        onPress={() => { tap(); onChange(c); }} style={[styles.swatchRing, c === value && { borderColor: c }]}>
        <View style={[styles.swatch, { backgroundColor: c }]} />
      </Pressable>
    ))}
  </View>
);

/** Native-feeling settings sheet (formSheet with detents). Edits apply live to the chart on the home screen, which stays visible above the sheet, so there is no in-sheet preview. The background is a native translucent blur. */
export const CustomizeSheet = ({ id, onDone }: { id: string; onDone: () => void }) => {
  const { configs, update, reset } = useChartStore();
  const def = CHARTS.find((d) => d.id === id);
  const cfg = configs[id];
  if (!def || !cfg) return null;
  const set = update.bind(null, id);
  return (
    <View style={styles.flex}>
      {/* Native translucent sheet material: the home screen (and its live chart) shows through the blur. */}
      {Platform.OS === 'ios'
        ? <BlurView intensity={80} tint="systemChromeMaterialDark" style={StyleSheet.absoluteFill} />
        : <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.sheet }]} />}
    <ScrollView style={styles.flex} contentContainerStyle={styles.body} nestedScrollEnabled>
      <View style={styles.header}>
        <View style={styles.flex}>
          <Text style={styles.kind}>{def.kind}</Text>
          <Text style={styles.title} numberOfLines={1}>{def.title}</Text>
          <Text style={styles.sub} numberOfLines={1}>{def.subtitle}</Text>
        </View>
        <Glass label="Done" onPress={onDone}><Text style={styles.done}>Done</Text></Glass>
      </View>


      <Section title="Appearance">
        <Stacked label="Colour"><Swatches value={cfg.color} onChange={(color) => set({ color })} /></Stacked>
        <Stacked label="Gradient">
          <Segmented options={GRADIENTS} labels={['None', 'Linear', 'Radial', 'Sweep']} value={cfg.gradient} onChange={(gradient) => set({ gradient })} />
        </Stacked>
        {cfg.gradient !== 'none' ? (
          <Stacked label="End colour"><Swatches value={cfg.color2} onChange={(color2) => set({ color2 })} /></Stacked>
        ) : null}
      </Section>

      <Section title="Data" footer={`${def.min}–${def.max} ${def.unit}`}>
        <Cell label={`${cfg.count} ${def.unit}`}>
          <View style={styles.stepper}>
            <Glass label="Remove" style={styles.stepBtn} disabled={cfg.count <= def.min} onPress={() => set({ count: Math.max(def.min, cfg.count - def.step) })}>
              <Icon name="minus" fallback="−" />
            </Glass>
            <Glass label="Add" style={styles.stepBtn} disabled={cfg.count >= def.max} onPress={() => set({ count: Math.min(def.max, cfg.count + def.step) })}>
              <Icon name="plus" fallback="+" />
            </Glass>
          </View>
        </Cell>
        <Pressable accessibilityRole="button" onPress={() => { tap(); set({ seed: cfg.seed + 1 }); }} style={({ pressed }) => pressed && styles.pressedCell}>
          <View style={styles.cell}>
            <Text style={styles.link}>Randomize</Text>
            <Icon name="shuffle" fallback="⤨" color={theme.accent} />
          </View>
        </Pressable>
      </Section>

      {def.flags.length > 0 ? (
        <Section title="Options">
          {def.flags.map((f) => (
            <SwitchCell key={f.key} label={f.label} value={cfg.flags[f.key] ?? false} onChange={(v) => set({ flags: { [f.key]: v } })} />
          ))}
        </Section>
      ) : null}

      <Section title="GPU Effects" footer="Shaders and filters run as SkSL on the GPU.">
        <SwitchCell label="Drop shadow" value={cfg.shadow} onChange={(shadow) => set({ shadow })} />
        <SwitchCell label="Neon glow" value={cfg.glow} onChange={(glow) => set({ glow })} />
        <Stacked label="Shader">
          <Segmented options={SHADERS} labels={['None', 'Shimmer', 'Aurora', 'Scan']} value={cfg.shader} onChange={(shader) => set({ shader })} />
        </Stacked>
        <Stacked label="Filter">
          <Segmented options={FILTERS} labels={['None', 'Mono', 'Sepia', 'Invert', 'Vivid']} value={cfg.filter} onChange={(filter) => set({ filter })} />
        </Stacked>
      </Section>

      <Section>
        <Pressable accessibilityRole="button" onPress={() => { void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); reset(id); }}
          style={({ pressed }) => pressed && styles.pressedCell}>
          <View style={styles.cell}><Text style={styles.destructive}>Reset to Defaults</Text></View>
        </Pressable>
      </Section>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  body: { padding: 16, paddingTop: 22, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  kind: { color: theme.accent, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: { color: theme.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.4 },
  sub: { color: theme.sub, fontSize: 14 },
  done: { color: theme.text, fontSize: 16, fontWeight: '600', paddingHorizontal: 18, paddingVertical: 9 },
  glassWrap: { borderRadius: 999, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.18)' },
  glass: { alignItems: 'center', justifyContent: 'center', backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)' },
  section: { marginTop: 22 },
  sectionTitle: { color: theme.sub, fontSize: 13, marginLeft: 16, marginBottom: 7 },
  footer: { color: theme.sub, fontSize: 13, marginLeft: 16, marginTop: 7 },
  group: { backgroundColor: theme.cell, borderRadius: 12, overflow: 'hidden' },
  sep: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.separator, marginLeft: 16 },
  cell: { minHeight: 46, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stacked: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  cellLabel: { color: theme.text, fontSize: 17 },
  link: { color: theme.accent, fontSize: 17 },
  destructive: { color: theme.destructive, fontSize: 17 },
  glyph: { fontWeight: '600' },
  stepper: { flexDirection: 'row', gap: 8 },
  stepBtn: { width: 46 },
  swatches: { flexDirection: 'row', justifyContent: 'space-between' },
  swatchRing: { padding: 3, borderRadius: 999, borderWidth: 2, borderColor: 'transparent' },
  swatch: { width: 30, height: 30, borderRadius: 15 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.6 },
  pressedCell: { backgroundColor: 'rgba(255,255,255,0.06)' },
});
