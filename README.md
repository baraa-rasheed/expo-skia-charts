# expo-skia-charts

GPU-accelerated charts for Expo / React Native, built on **react-native-skia v3.8** (Graphite: Metal / Vulkan).

### 📖 Docs: **https://baraa-rasheed.github.io/expo-skia-charts/**

## 🤖 Agent-ready

Built for AI coding agents (Cursor, Claude, Grok, Copilot) as a first-class feature:

- **[`AGENTS.md`](AGENTS.md)**: the rules, a component picker and a canonical snippet. Agents pick it up automatically.
- **[Agent guide](https://baraa-rasheed.github.io/expo-skia-charts/docs/agents)** and [`llms.txt`](https://baraa-rasheed.github.io/expo-skia-charts/llms.txt).
- **[Type-checked recipes](example/recipes/agent-recipes.tsx)** for every chart, compiled under strict TypeScript.
- **Predictable API**: required pixel `width`/`height`, plain-array data, and the same optional `gradient` and `effects` props on every chart. Every exported prop has JSDoc.

## Install

```sh
npx expo install expo-skia-charts react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler
```

| Peer | Version |
| --- | --- |
| `react-native-skia` | >= 3.8.0 |
| `react-native-reanimated` | >= 4.0.0 |
| `react-native-worklets` | >= 0.7.0 |

Requires a dev build (no Expo Go) and Android `minSdkVersion` 26 (set via `expo-build-properties`).

## Quick start

```tsx
import { LineChart } from 'expo-skia-charts';

<LineChart
  data={[3, 7, 5, 9, 6]}
  width={320}
  height={200}
  effects={{ shadow: true, clipReveal: 800 }}
/>
```

Charts: Line, Area, Bar, Stacked Area, Pie/Donut, Radar, Gauge, Progress Rings, Scatter, Heatmap, Candlestick, Sparkline.

Every chart accepts an `effects` prop: shadow, glow, blur, colour filters, blend modes, dash/corner path effects, clip reveal, and SkSL shaders. See [GPU effects](https://baraa-rasheed.github.io/expo-skia-charts/docs/effects).

Every chart also accepts a `gradient` prop: linear, radial, or sweep GPU gradients with custom colours, positions, and start, end, or centre points. See [Gradients](https://baraa-rasheed.github.io/expo-skia-charts/docs/gradients).

## Example app

```sh
cd example && npm install && npx expo run:ios   # or run:android
```

Includes an interactive playground for every chart and effect.

## License

MIT
