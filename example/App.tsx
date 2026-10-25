import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Sparkline } from 'expo-skia-charts';
import { screens } from './app/screens';
import { palette, theme } from './app/theme';
import { randomWalk } from './app/data';

const previews = screens.map(() => randomWalk(24));

export default function App() {
  const [active, setActive] = useState<number | null>(null);
  const { width } = useWindowDimensions();
  const tileW = (width - 44) / 2;
  const screen = active === null ? null : screens[active];
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.flex}>
          <StatusBar style="light" />
          {screen ? (
            <View style={styles.flex}>
              <Pressable onPress={() => setActive(null)} style={styles.back} hitSlop={12}><Text style={styles.backText}>‹ All charts</Text></Pressable>
              <ScrollView contentContainerStyle={styles.body}>
                <Text style={styles.title}>{screen.title}</Text>
                <Text style={styles.subtitle}>{screen.subtitle}</Text>
                <screen.Component />
              </ScrollView>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.body}>
              <Text style={styles.kicker}>react-native-skia 3.8 · Graphite GPU</Text>
              <Text style={styles.hero}>expo-skia-charts</Text>
              <Text style={styles.subtitle}>60 fps charts, animated on the UI thread and drawn on the GPU.</Text>
              <View style={styles.grid}>
                {screens.map((s, i) => (
                  <Pressable key={s.title} style={({ pressed }) => [styles.tile, { width: tileW }, pressed && styles.pressed]} onPress={() => setActive(i)}>
                    <Sparkline width={tileW - 28} height={36} data={previews[i] ?? []} color={palette[i % palette.length] ?? theme.accent} fill />
                    <Text style={styles.rowTitle}>{s.title}</Text>
                    <Text style={styles.rowSub} numberOfLines={2}>{s.subtitle}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  body: { padding: 16, gap: 16, paddingBottom: 48 },
  kicker: { color: theme.accent, fontWeight: '700', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  hero: { color: theme.text, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  title: { color: theme.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: theme.sub, fontSize: 15, marginTop: -8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, gap: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.cardBorder },
  pressed: { opacity: 0.8 },
  rowTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  rowSub: { color: theme.sub, fontSize: 12 },
  back: { padding: 16, paddingBottom: 4 },
  backText: { color: theme.accent, fontSize: 16, fontWeight: '600' },
});
