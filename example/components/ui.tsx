import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';
import { theme } from '../app/theme';

export const Card = ({ title, subtitle, children, style }: { title?: string; subtitle?: string; children: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.card, style]}>
    {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
    {subtitle ? <Text style={styles.cardSub}>{subtitle}</Text> : null}
    {children}
  </View>
);

export const Label = ({ children }: { children: React.ReactNode }) => <Text style={styles.label}>{children}</Text>;

export function ChipGroup<T extends string | number>({ label, options, value, onChange, format }: {
  label: string; options: readonly T[]; value: T; onChange: (v: T) => void; format?: (v: T) => string;
}) {
  return (
    <View style={styles.group}>
      <Label>{label}</Label>
      <View style={styles.chips}>
        {options.map((o) => {
          const on = o === value;
          return (
            <Pressable key={String(o)} onPress={() => onChange(o)} style={[styles.chip, on && styles.chipOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{format ? format(o) : String(o)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
  <View style={styles.toggle}>
    <Text style={styles.toggleText}>{label}</Text>
    <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.accent, false: theme.chip }} thumbColor="#fff" />
  </View>
);

export const ColorPicker = ({ colors, value, onChange }: { colors: readonly string[]; value: string; onChange: (c: string) => void }) => (
  <View style={styles.group}>
    <Label>Colour</Label>
    <View style={styles.chips}>
      {colors.map((c) => (
        <Pressable key={c} onPress={() => onChange(c)} accessibilityLabel={`colour ${c}`}
          style={[styles.swatch, { backgroundColor: c }, c === value && styles.swatchOn]} />
      ))}
    </View>
  </View>
);

export const Button = ({ title, onPress }: { title: string; onPress: () => void }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.7 }]}>
    <Text style={styles.btnText}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: { backgroundColor: theme.card, borderRadius: theme.radius, padding: 16, gap: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.cardBorder },
  cardTitle: { color: theme.text, fontSize: 17, fontWeight: '700' },
  cardSub: { color: theme.sub, fontSize: 13, marginTop: -6 },
  label: { color: theme.sub, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  group: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: theme.chip },
  chipOn: { backgroundColor: theme.accent },
  chipText: { color: theme.sub, fontSize: 13, fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 },
  toggleText: { color: theme.text, fontSize: 15 },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  swatchOn: { borderColor: '#fff', transform: [{ scale: 1.1 }] },
  btn: { backgroundColor: theme.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
