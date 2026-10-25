import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';
import { screens } from './app/screens';
import { palette, theme } from './app/theme';

export type RootStackParamList = { Home: undefined; Chart: { index: number } };
const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, primary: theme.accent, background: theme.bg, card: theme.bg, text: theme.text, border: theme.cardBorder },
};

function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const { width } = useWindowDimensions();
  const tileW = (width - 44) / 2;
  const previewW = tileW - 28;
  return (
    // `automatic` lets the iOS large title collapse as the list scrolls.
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.body} style={styles.flex}>
      <Text style={styles.kicker}>react-native-skia 3.8 · Graphite GPU</Text>
      <Text style={styles.subtitle}>60 fps charts, animated on the UI thread and drawn on the GPU.</Text>
      <View style={styles.grid}>
        {screens.map((s, i) => {
          const color = palette[i % palette.length] ?? theme.accent;
          return (
            <Pressable key={s.title} accessibilityRole="button" style={({ pressed }) => [styles.tile, { width: tileW }, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Chart', { index: i })}>
              <View style={styles.preview} pointerEvents="none"><s.Preview w={previewW} h={56} color={color} /></View>
              <Text style={styles.rowTitle}>{s.title}</Text>
              <Text style={styles.rowSub} numberOfLines={2}>{s.subtitle}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function ChartScreen({ route }: NativeStackScreenProps<RootStackParamList, 'Chart'>) {
  const screen = screens[route.params.index];
  if (!screen) return null;
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.body} style={styles.flex}>
      <Text style={styles.subtitle}>{screen.subtitle}</Text>
      <screen.Component />
    </ScrollView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerLargeTitle: true,
              headerLargeTitleShadowVisible: false,
              headerShadowVisible: false,
              headerBlurEffect: 'systemChromeMaterialDark',
              headerTransparent: false,
              headerStyle: { backgroundColor: theme.bg },
              headerLargeStyle: { backgroundColor: theme.bg },
              headerTintColor: theme.accent,
              headerTitleStyle: { color: theme.text },
              headerLargeTitleStyle: { color: theme.text },
              contentStyle: { backgroundColor: theme.bg },
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'expo-skia-charts' }} />
            <Stack.Screen name="Chart" component={ChartScreen}
              options={({ route }) => ({ title: screens[route.params.index]?.title ?? 'Chart', headerBackTitle: 'Charts' })} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bg },
  body: { padding: 16, gap: 16, paddingBottom: 48 },
  kicker: { color: theme.accent, fontWeight: '700', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  subtitle: { color: theme.sub, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { backgroundColor: theme.card, borderRadius: theme.radius, padding: 14, gap: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.cardBorder },
  preview: { height: 56, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pressed: { opacity: 0.8 },
  rowTitle: { color: theme.text, fontSize: 16, fontWeight: '700' },
  rowSub: { color: theme.sub, fontSize: 12 },
});
