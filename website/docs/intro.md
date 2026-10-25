---
id: intro
title: Getting started
slug: /intro
---

GPU-accelerated, animated charts for **React Native & Expo**, drawn with [react-native-skia](https://github.com/wcandillon/react-native-skia) v3 (Skia Graphite) and animated on the UI thread with Reanimated.

## Install

```sh
npx expo install expo-skia-charts react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler expo-build-properties
```

| Peer | Version |
| --- | --- |
| `react-native-skia` | `>= 3.8.0` |
| `react-native-reanimated` | `>= 4.0` |
| `react-native-worklets` | `>= 0.7` |
| `react-native-gesture-handler` | `>= 2.20` |

Skia v3 needs a **development build** (not Expo Go), **Android minSdk 26** with Vulkan 1.1, and iOS 15.1+:

```json title="app.json"
{ "expo": { "plugins": [["expo-build-properties", { "android": { "minSdkVersion": 26 } }]] } }
```

:::warning
Install the unscoped `react-native-skia`. `@shopify/react-native-skia` stops at 2.x — don't install both.
:::

## First chart

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LineChart } from 'expo-skia-charts';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <LineChart width={340} height={200} data={[3, 8, 5, 12, 9, 15]} onScrub={(p) => console.log(p)} />
    </GestureHandlerRootView>
  );
}
```

## Labels

Axis labels render when you pass a Skia font:

```tsx
import { useFont } from 'react-native-skia';
const font = useFont(require('./assets/Inter.ttf'), 11);
<BarChart font={font} width={340} height={200} data={[4, 8, 2]} />
```
