import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { screens } from './app/screens';

export default function App() {
  const [active, setActive] = useState<number | null>(null);
  const screen = active === null ? null : screens[active];
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.flex}>
          <StatusBar style="auto" />
          {screen ? (
            <View style={styles.flex}>
              <Pressable onPress={() => setActive(null)} style={styles.back}><Text style={styles.backText}>‹ All charts</Text></Pressable>
              <Text style={styles.title}>{screen.title}</Text>
              <ScrollView contentContainerStyle={styles.body}><screen.Component /></ScrollView>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.body}>
              <Text style={styles.title}>expo-skia-charts</Text>
              {screens.map((s, i) => (
                <Pressable key={s.title} style={styles.row} onPress={() => setActive(i)}>
                  <Text style={styles.rowTitle}>{s.title}</Text>
                  <Text style={styles.rowSub}>{s.subtitle}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 16, gap: 16 },
  title: { fontSize: 26, fontWeight: '700', paddingHorizontal: 16, paddingTop: 8 },
  row: { padding: 14, borderRadius: 12, backgroundColor: '#F4F4F8' },
  rowTitle: { fontSize: 17, fontWeight: '600' },
  rowSub: { color: '#777', marginTop: 2 },
  back: { padding: 16, paddingBottom: 0 },
  backText: { color: '#6C5CE7', fontSize: 16 },
});
