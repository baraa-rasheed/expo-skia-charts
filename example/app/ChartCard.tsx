import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { effectsFor, gradientFor, type ChartConfig, type ChartDef } from './charts';
import { theme } from './theme';

export const UP = '#2FD47A';
export const DOWN = '#FF5A5F';

export const DeltaPill = ({ delta }: { delta: number }) => {
  const up = delta >= 0;
  return (
    <View style={[styles.pill, { backgroundColor: up ? UP : DOWN }]}>
      <Text style={styles.pillText}>{`${up ? '+' : ''}${delta.toFixed(2)}%`}</Text>
    </View>
  );
};

/** A chart rendered from its config. Shared by the home card and the sheet's live preview. */
export const ChartView = ({ def, cfg, width, height }: { def: ChartDef; cfg: ChartConfig; width: number; height: number }) => {
  const built = useMemo(() => def.build(cfg), [def, cfg]);
  return built.render({ cfg, w: width, h: height, effects: effectsFor(cfg), gradient: gradientFor(cfg) });
};

export const ChartCard = memo(function ChartCard({ def, cfg, width, compact, onPress }: {
  def: ChartDef; cfg: ChartConfig; width: number; compact?: boolean; onPress: () => void;
}) {
  const { summary } = useMemo(() => def.build(cfg), [def, cfg]);
  const inner = width - 32;
  const chartH = compact ? inner * 0.8 : 150;
  return (
    <View style={[styles.card, { width }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Customize ${def.title}`} onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.title} numberOfLines={1}>{def.title}</Text>
            <Text style={styles.sub} numberOfLines={1}>{def.subtitle}</Text>
          </View>
          {compact ? null : (
            <View style={styles.right}>
              <Text style={styles.value}>{summary.value}</Text>
              {summary.delta !== undefined ? <DeltaPill delta={summary.delta} /> : <Text style={styles.sub}>{summary.caption}</Text>}
            </View>
          )}
        </View>
        {compact ? <Text style={styles.value}>{summary.value} <Text style={styles.sub}>{summary.caption}</Text></Text> : null}
      </Pressable>
      {/* Chart stays interactive (scrub/crosshair); tap the header or "Customize" to open the sheet. */}
      <View style={[styles.chart, { height: chartH }]}>
        <ChartView def={def} cfg={cfg} width={inner} height={chartH} />
      </View>
      <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.more, pressed && styles.pressed]}>
        <Text style={styles.moreText}>Customize ›</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { backgroundColor: theme.card, borderRadius: theme.radius, padding: 16, gap: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.cardBorder },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  title: { color: theme.text, fontSize: 17, fontWeight: '700' },
  sub: { color: theme.sub, fontSize: 13, fontWeight: '400' },
  value: { color: theme.text, fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  pill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, minWidth: 72, alignItems: 'center' },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 13, fontVariant: ['tabular-nums'] },
  chart: { alignItems: 'center', justifyContent: 'center' },
  more: { alignSelf: 'flex-start' },
  moreText: { color: theme.accent, fontWeight: '600', fontSize: 14 },
  pressed: { opacity: 0.7 },
});
