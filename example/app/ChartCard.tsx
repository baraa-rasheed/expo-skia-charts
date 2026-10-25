import React, { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Sparkline } from 'react-native-skia-chart';
import { SymbolView } from 'expo-symbols';
import { effectsFor, gradientFor, makeRng, type ChartConfig, type ChartDef } from './charts';
import { theme } from './theme';

/** A chart rendered from its config. Shared by the home list and the sheet's live preview. */
export const ChartView = ({ def, cfg, width, height }: { def: ChartDef; cfg: ChartConfig; width: number; height: number }) => {
  const built = useMemo(() => def.build(cfg), [def, cfg]);
  return built.render({ cfg, w: width, h: height, effects: effectsFor(cfg), gradient: gradientFor(cfg) });
};

/** Stocks-app price-change badge. */
export const DeltaPill = ({ delta, small }: { delta: number; small?: boolean }) => {
  const up = delta >= 0;
  return (
    <View style={[styles.pill, small && styles.pillSmall, { backgroundColor: up ? theme.up : theme.down }]}>
      <Text style={[styles.pillText, small && styles.pillTextSmall]}>{`${up ? '+' : ''}${delta.toFixed(2)}%`}</Text>
    </View>
  );
};

/** "See all ›" accessory, the lightweight entry point to the customise sheet. */
export const SeeAll = ({ onPress, label = 'See All' }: { onPress: () => void; label?: string }) => (
  <Pressable accessibilityRole="button" accessibilityLabel={`${label}, customise`} onPress={onPress} hitSlop={10}
    style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}>
    <Text style={styles.seeAllText}>{label}</Text>
    <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={theme.accent} fallback={<Text style={styles.seeAllText}>›</Text>} />
  </Pressable>
);

/** Full-width chart embedded straight into the page (no card), like a production stocks app. */
export const EmbeddedChart = memo(function EmbeddedChart({ def, cfg, width, height = 170, onOpen }: {
  def: ChartDef; cfg: ChartConfig; width: number; height?: number; onOpen: () => void;
}) {
  const { summary } = useMemo(() => def.build(cfg), [def, cfg]);
  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Text style={styles.ticker} numberOfLines={1}>{def.title}</Text>
        <SeeAll onPress={onOpen} />
      </View>
      <View style={styles.row}>
        <Text style={styles.sub} numberOfLines={1}>{def.subtitle}</Text>
        <View style={styles.quote}>
          <Text style={styles.price}>{summary.value}</Text>
          {summary.delta !== undefined ? <DeltaPill delta={summary.delta} small /> : <Text style={styles.sub}>{summary.caption}</Text>}
        </View>
      </View>
      {/* The chart stays interactive (scrub / crosshair) right in the list. */}
      <View style={[styles.chart, { height }]}>
        <ChartView def={def} cfg={cfg} width={width} height={height} />
      </View>
    </View>
  );
});

/** Masonry tile for the staggered grid. Tapping the title opens the sheet. */
export const Tile = memo(function Tile({ def, cfg, width, height, onOpen }: {
  def: ChartDef; cfg: ChartConfig; width: number; height: number; onOpen: () => void;
}) {
  const { summary } = useMemo(() => def.build(cfg), [def, cfg]);
  const chartH = Math.max(60, height - 64);
  return (
    <View style={[styles.tile, { width }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${def.title}, customise`} onPress={onOpen} style={({ pressed }) => pressed && styles.pressed}>
        <View style={styles.tileHead}>
          <Text style={styles.tileTitle} numberOfLines={1}>{def.title}</Text>
          <SymbolView name="chevron.right" size={11} weight="semibold" tintColor={theme.sub} fallback={<Text style={styles.sub}>›</Text>} />
        </View>
        <Text style={styles.tileValue} numberOfLines={1}>{summary.value} <Text style={styles.sub}>{summary.caption}</Text></Text>
      </Pressable>
      <View style={[styles.chart, { height: chartH }]}>
        <ChartView def={def} cfg={cfg} width={width} height={chartH} />
      </View>
    </View>
  );
});

/** Classic watchlist row: ticker + name, sparkline, price + change badge. */
export const WatchRow = memo(function WatchRow({ ticker, name, seed, color, onPress }: {
  ticker: string; name: string; seed: number; color?: string; onPress: () => void;
}) {
  const data = useMemo(() => {
    const rng = makeRng(seed);
    const out: number[] = [100];
    for (let i = 1; i < 32; i++) out.push((out[i - 1] ?? 100) * (1 + (rng() - 0.48) * 0.035));
    return out;
  }, [seed]);
  const first = data[0] ?? 0;
  const last = data[data.length - 1] ?? 0;
  const delta = ((last - first) / first) * 100;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${ticker}, customise`} onPress={onPress}
      style={({ pressed }) => [styles.watch, pressed && styles.pressedRow]}>
      <View style={styles.flex}>
        <Text style={styles.ticker}>{ticker}</Text>
        <Text style={styles.sub} numberOfLines={1}>{name}</Text>
      </View>
      <Sparkline width={76} height={32} data={data} color={color ?? (delta >= 0 ? theme.up : theme.down)} strokeWidth={1.8} />
      <View style={styles.watchRight}>
        <Text style={styles.price}>{last.toFixed(2)}</Text>
        <DeltaPill delta={delta} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  block: { paddingVertical: 18, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  quote: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticker: { color: theme.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.3, flexShrink: 1 },
  sub: { color: theme.sub, fontSize: 13, fontWeight: '500', flexShrink: 1 },
  price: { color: theme.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  chart: { marginTop: 12, alignItems: 'center', justifyContent: 'center' },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { color: theme.accent, fontSize: 15, fontWeight: '500' },
  pill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, minWidth: 74, alignItems: 'flex-end' },
  pillSmall: { minWidth: 0, paddingHorizontal: 6, paddingVertical: 2 },
  pillText: { color: '#fff', fontWeight: '700', fontSize: 14, fontVariant: ['tabular-nums'] },
  pillTextSmall: { fontSize: 12 },
  tile: { paddingVertical: 12 },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileTitle: { color: theme.text, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  tileValue: { color: theme.text, fontSize: 15, fontWeight: '600', marginTop: 2, fontVariant: ['tabular-nums'] },
  watch: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  watchRight: { alignItems: 'flex-end', gap: 4 },
  pressed: { opacity: 0.6 },
  pressedRow: { opacity: 0.7 },
});
