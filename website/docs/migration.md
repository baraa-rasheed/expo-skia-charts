---
id: migration
title: Upgrading to 0.2 (Skia v3)
---

`react-native-skia-chart` (0.2+, previously named `expo-skia-charts` in this repo) targets `react-native-skia` 3.8+.

1. `npm remove @shopify/react-native-skia && npx expo install react-native-skia expo-build-properties`
2. Replace imports of `@shopify/react-native-skia` with `react-native-skia`.
3. Raise Android `minSdkVersion` to 26 (see [Getting started](./intro)).
4. Use a development build — Expo Go ships Skia v2.
5. Reanimated ≥ 4 and react-native-worklets ≥ 0.7 are required.

Need Expo Go, Android TV or pre-Vulkan devices? Stay on the old `expo-skia-charts@0.1.x` package with Skia 2.x.

See the upstream [v3 migration guide](https://github.com/wcandillon/react-native-skia/blob/main/apps/docs/docs/getting-started/migration.md).
