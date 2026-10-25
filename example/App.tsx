import React, { useCallback, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';
import { CHARTS } from './app/charts';
import { ChartCard } from './app/ChartCard';
import { CustomizeSheet } from './app/CustomizeSheet';
import { ChartStoreProvider, useChartStore } from './app/store';
import { theme } from './app/theme';

export type RootStackParamList = { Home: undefined; Customize: { id: string } };
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: theme.accent, background: theme.bg, card: theme.bg, text: theme.text, border: theme.cardBorder },
};

/** Charts that read best as squares go in the 2-column grid; the rest are full-width "ticker" rows. */
const COMPACT = new Set(['pie', 'radar', 'gauge', 'rings']);
/** Must match `sheetAllowedDetents[0]` of the Customize sheet. */
const SHEET_DETENT = 0.6;
/** Collapsed iOS nav bar height (below the status bar). */
const BAR = 52;
type ViewRef = React.ComponentRef<typeof View>;
type ScrollRef = React.ComponentRef<typeof ScrollView>;

function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { configs } = useChartStore();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollRef>(null);
  const offset = useRef(0);
  const cards = useRef(new Map<string, ViewRef>());
  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => { offset.current = e.nativeEvent.contentOffset.y; }, []);
  const full = width - 32;
  const half = (width - 44) / 2;
  /**
   * Opens the sheet and, in the same frame, smoothly scrolls the chart being edited into the strip of
   * the home screen that stays visible above the sheet (centred if it fits, otherwise top-aligned).
   */
  const open = useCallback((id: string) => {
    const node = cards.current.get(id);
    node?.measureInWindow((_x: number, y: number, _w: number, h: number) => {
      const top = insets.top + BAR;
      const visible = height * (1 - SHEET_DETENT) - top;
      const desired = top + Math.max(8, (visible - h) / 2);
      scrollRef.current?.scrollTo({ y: Math.max(-top, offset.current + (y - desired)), animated: true });
    });
    navigation.navigate('Customize', { id });
  }, [navigation, insets.top, height]);
  const register = (id: string) => (v: ViewRef | null) => { if (v) cards.current.set(id, v); else cards.current.delete(id); };
  const wide = CHARTS.filter((d) => !COMPACT.has(d.id));
  const compact = CHARTS.filter((d) => COMPACT.has(d.id));
  return (
    // `automatic` lets the iOS large title collapse as the list scrolls.
    <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16} contentInsetAdjustmentBehavior="automatic" style={styles.flex}
      // Extra room at the bottom so even the last card can be lifted above the sheet.
      contentContainerStyle={[styles.body, { paddingBottom: height * SHEET_DETENT }]}>
      <Text style={styles.kicker}>react-native-skia 3.8 · Graphite GPU</Text>
      <Text style={styles.section}>Watchlist</Text>
      {wide.map((d) => {
        const cfg = configs[d.id];
        return cfg ? <View key={d.id} ref={register(d.id)} collapsable={false}><ChartCard def={d} cfg={cfg} width={full} onPress={() => open(d.id)} /></View> : null;
      })}
      <Text style={styles.section}>Breakdown</Text>
      <View style={styles.grid}>
        {compact.map((d) => {
          const cfg = configs[d.id];
          return cfg ? <View key={d.id} ref={register(d.id)} collapsable={false}><ChartCard def={d} cfg={cfg} width={half} compact onPress={() => open(d.id)} /></View> : null;
        })}
      </View>
    </ScrollView>
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
                  title: 'Charts',
                  headerLargeTitle: true,
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: false,
                  headerBlurEffect: 'systemChromeMaterialDark',
                  headerStyle: { backgroundColor: theme.bg },
                  headerLargeStyle: { backgroundColor: theme.bg },
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
                  sheetCornerRadius: 24,
                  sheetExpandsWhenScrolledToEdge: true,
                  contentStyle: { backgroundColor: theme.bg },
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
  flex: { flex: 1, backgroundColor: theme.bg },
  body: { padding: 16, gap: 12, paddingBottom: 48 },
  kicker: { color: theme.accent, fontWeight: '700', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  section: { color: theme.text, fontSize: 22, fontWeight: '800', marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
