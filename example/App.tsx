import React, { useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer, useIsFocused, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';
import { CHARTS, type ChartDef } from './app/charts';
import { Aurora } from './app/Aurora';
import { ChartView, EmbeddedChart, SeeAll, Tile, WatchRow } from './app/ChartCard';
import { CustomizeSheet } from './app/CustomizeSheet';
import { ChartStoreProvider, useChartStore } from './app/store';
import { theme } from './app/theme';
import { Carousel, type CarouselHandle } from './app/Carousel';
import { Segmented } from './app/Segmented';

export type RootStackParamList = { Home: undefined; Customize: { id: string } };
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: theme.accent, background: theme.bg, card: theme.bg, text: theme.text, border: theme.separator },
};

/** Must match `sheetAllowedDetents[0]` of the Customize sheet. */
const SHEET_DETENT = 0.6;
/** Collapsed iOS nav bar height (below the status bar). */
const BAR = 52;
const PAD = 20;
const RANGES = ['1D', '1W', '1M', '6M', '1Y'] as const;
const RANGE_POINTS = [20, 40, 70, 110, 150] as const;
/** Ticker rows → the chart each one customises. */
const WATCHLIST = [
  { ticker: 'AAPL', name: 'Apple Inc.', id: 'line', seed: 11 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', id: 'area', seed: 23 },
  { ticker: 'BTC-USD', name: 'Bitcoin', id: 'candle', seed: 5 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', id: 'bar', seed: 42 },
] as const;
/** Staggered (masonry) grid: two columns with different tile heights, as ratios of the column width. */
const MASONRY: readonly (readonly [string, number])[][] = [
  [['pie', 1.15], ['scatter', 0.8], ['radar', 1.0]],
  [['gauge', 0.8], ['rings', 1.05], ['bubble', 1.1]],
];
/** Swipeable parallax carousels (section → chart ids). */
const CAROUSELS = {
  markets: ['candle', 'area', 'bar'],
  insights: ['stackedArea', 'stackedBar', 'histogram'],
} as const;
type CarouselKey = keyof typeof CAROUSELS;
const WIDE_BOTTOM = ['heatmap'];
const carouselOf = (id: string): CarouselKey | undefined =>
  (Object.keys(CAROUSELS) as CarouselKey[]).find((k) => (CAROUSELS[k] as readonly string[]).includes(id));
const byId = (id: string): ChartDef | undefined => CHARTS.find((d) => d.id === id);

type ViewRef = React.ComponentRef<typeof View>;
type ScrollRef = React.ComponentRef<typeof ScrollView>;

/** Staggered entrance: each block fades up slightly after the previous one. */
const Stagger = ({ i, children }: { i: number; children: React.ReactNode }) => (
  <Animated.View entering={FadeInDown.delay(80 + i * 55).duration(480)}>{children}</Animated.View>
);

function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { configs, update } = useChartStore();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollRef>(null);
  const offset = useRef(0);
  const nodes = useRef(new Map<string, ViewRef>());
  const carousels = useRef(new Map<CarouselKey, CarouselHandle>());
  const focused = useIsFocused();
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => { offset.current = e.nativeEvent.contentOffset.y; }, []);
  const full = width - PAD * 2;
  const colGap = 16;
  const col = (full - colGap) / 2;

  /**
   * Opens the sheet and, in the same frame, smoothly scrolls the chart being edited into the strip of
   * the home screen that stays visible above the sheet (centred if it fits, otherwise top-aligned).
   */
  const open = useCallback((id: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Charts inside a carousel: swipe the carousel to that page too, then scroll the carousel into view.
    const ck = carouselOf(id);
    if (ck) carousels.current.get(ck)?.scrollToId(id);
    nodes.current.get(ck ?? id)?.measureInWindow((_x: number, y: number, _w: number, h: number) => {
      const top = insets.top + BAR;
      const visible = height * (1 - SHEET_DETENT) - top;
      const desired = top + Math.max(8, (visible - h) / 2);
      scrollRef.current?.scrollTo({ y: Math.max(-top, offset.current + (y - desired)), animated: true });
    });
    navigation.navigate('Customize', { id });
  }, [navigation, insets.top, height]);
  const register = (id: string) => (v: ViewRef | null) => { if (v) nodes.current.set(id, v); else nodes.current.delete(id); };

  const line = byId('line');
  const lineCfg = configs.line;
  const range = Math.max(0, RANGE_POINTS.findIndex((p) => p >= (lineCfg?.count ?? 0)));
  let k = 0;
  const wide = (id: string) => {
    const def = byId(id);
    const cfg = configs[id];
    if (!def || !cfg) return null;
    return (
      <Stagger key={id} i={k++}>
        <View ref={register(id)} collapsable={false} style={styles.divider}>
          <EmbeddedChart def={def} cfg={cfg} width={full} onOpen={() => open(id)} />
        </View>
      </Stagger>
    );
  };

  const carousel = (key: CarouselKey, title: string, hint: string) => {
    const defs = CAROUSELS[key].map(byId).filter((d): d is ChartDef => d !== undefined);
    return (
      <Stagger key={key} i={k++}>
        <View style={styles.carouselHead}>
          <Text style={styles.section}>{title}</Text>
          <Text style={styles.sub}>{hint}</Text>
        </View>
        {/* Bleeds to the screen edges so pages swipe edge-to-edge; content keeps the page padding. */}
        <View ref={register(key)} collapsable={false} style={[styles.divider, styles.bleed]}>
          <Carousel ref={(h) => { if (h) carousels.current.set(key, h); else carousels.current.delete(key); }}
            defs={defs} configs={configs} width={width} paused={!focused} inset={PAD} onOpen={open} />
        </View>
      </Stagger>
    );
  };

  return (
    <View style={styles.flex}>
      <Aurora width={width} height={Math.min(520, height * 0.6)} />
      {/* `automatic` lets the iOS large title collapse as the list scrolls. */}
      <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentInsetAdjustmentBehavior="automatic" style={styles.flex}
        // Extra room at the bottom so even the last chart can be lifted above the sheet.
        contentContainerStyle={[styles.body, { paddingBottom: height * SHEET_DETENT }]}>
        <Stagger i={k++}>
          <Text style={styles.caption}>My Portfolio</Text>
          <Text style={styles.balance}>$128,420.55</Text>
          <Text style={styles.change}>▲ $1,204.18 (0.95%) <Text style={styles.sub}>Today</Text></Text>
        </Stagger>

        {line && lineCfg ? (
          <Stagger i={k++}>
            <View ref={register('line')} collapsable={false} style={styles.hero}>
              <View style={styles.row}>
                <Text style={styles.heroTicker}>{line.title} <Text style={styles.sub}>{line.subtitle}</Text></Text>
                <SeeAll onPress={() => open('line')} />
              </View>
              <View style={styles.heroChart}><ChartView def={line} cfg={lineCfg} width={full} height={220} /></View>
              <Segmented options={RANGES} value={RANGES[range] ?? '1D'}
                onChange={(r) => update('line', { count: RANGE_POINTS[RANGES.indexOf(r)] ?? 20 })} />
            </View>
          </Stagger>
        ) : null}

        <Stagger i={k++}>
          <View style={styles.sectionRow}><Text style={styles.section}>Watchlist</Text></View>
          {WATCHLIST.map((w, i) => (
            <View key={w.ticker} style={i > 0 && styles.divider}>
              <WatchRow ticker={w.ticker} name={w.name} seed={w.seed} onPress={() => open(w.id)} />
            </View>
          ))}
        </Stagger>

{carousel('markets', 'Markets', 'Swipe to switch')}

        <Stagger i={k++}>
          <Text style={[styles.section, styles.sectionGap]}>Discover</Text>
          <View style={styles.masonry}>
            {MASONRY.map((column, c) => (
              <View key={c} style={[styles.column, { width: col }]}>
                {column.map(([id, ratio]) => {
                  const def = byId(id);
                  const cfg = configs[id];
                  return def && cfg ? (
                    <View key={id} ref={register(id)} collapsable={false}>
                      <Tile def={def} cfg={cfg} width={col} height={col * ratio + 64} onOpen={() => open(id)} />
                    </View>
                  ) : null;
                })}
              </View>
            ))}
          </View>
        </Stagger>

        {carousel('insights', 'Insights', 'Portfolio analytics')}
        {WIDE_BOTTOM.map(wide)}
        <Text style={styles.footer}>Rendered with react-native-skia 3.8 · Graphite GPU</Text>
      </ScrollView>
    </View>
  );
}

function CustomizeScreen({ route, navigation }: NativeStackScreenProps<RootStackParamList, 'Customize'>) {
  return <CustomizeSheet id={route.params.id} onDone={() => navigation.goBack()} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ChartStoreProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar style="light" />
            <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: theme.bg } }}>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                  title: 'Stocks',
                  headerLargeTitle: true,
                  // Transparent large header so the aurora shows through; it blurs once collapsed.
                  headerTransparent: true,
                  headerBlurEffect: 'systemChromeMaterialDark',
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: false,
                  headerLargeStyle: { backgroundColor: 'transparent' },
                  headerTitleStyle: { color: theme.text },
                  headerLargeTitleStyle: { color: theme.text },
                }}
              />
              {/* Customisation is a native bottom sheet (UISheetPresentationController on iOS), not a pushed page. */}
              <Stack.Screen
                name="Customize"
                component={CustomizeScreen}
                options={{
                  presentation: 'formSheet',
                  headerShown: false,
                  sheetAllowedDetents: [SHEET_DETENT, 1],
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 28,
                  sheetExpandsWhenScrolledToEdge: true,
                  contentStyle: { backgroundColor: theme.sheet },
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </ChartStoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: 'transparent' },
  body: { paddingHorizontal: PAD, paddingTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  caption: { color: theme.sub, fontSize: 15, fontWeight: '600' },
  balance: { color: theme.text, fontSize: 40, fontWeight: '700', letterSpacing: -1, fontVariant: ['tabular-nums'], marginTop: 2 },
  change: { color: theme.up, fontSize: 15, fontWeight: '600', marginTop: 2, fontVariant: ['tabular-nums'] },
  sub: { color: theme.sub, fontSize: 13, fontWeight: '500' },
  hero: { marginTop: 22, gap: 12 },
  heroTicker: { color: theme.text, fontSize: 20, fontWeight: '700', flexShrink: 1 },
  heroChart: { marginHorizontal: -4 },
  sectionRow: { marginTop: 30, marginBottom: 4 },
  section: { color: theme.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  sectionGap: { marginTop: 30, marginBottom: 2 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.separator },
  masonry: { flexDirection: 'row', justifyContent: 'space-between' },
  column: { gap: 4 },
  carouselHead: { marginTop: 30, marginBottom: 2, flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  bleed: { marginHorizontal: -PAD },
  footer: { color: theme.sub, fontSize: 12, textAlign: 'center', marginTop: 28 },
});
