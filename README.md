# expo-skia-charts

GPU-accelerated, animated charts for **React Native & Expo**, drawn with [React Native Skia](https://github.com/wcandillon/react-native-skia) (v3, installed as `react-native-skia`) and animated entirely on the UI thread with **Reanimated shared values & worklets**. A modern successor to the unmaintained `@rainbow-me/react-native-animated-charts`, including a familiar `ChartPathProvider` / `ChartPath` / `ChartDot` API.

- 🚀 60fps: every animation (path morphing, bar growth, arc sweeps, scrubbing) runs in worklets; no JS animation loops
- 🧩 15+ chart types, all in TypeScript strict mode, `.d.ts` shipped
- 📦 Pure JS library: no native code of its own, works in Expo (dev builds & Expo Go where Skia is available), uses Skia's immutable `PathBuilder` API
- 👆 Press-and-drag scrubbing via `react-native-gesture-handler`

## Install

```sh
npx expo install expo-skia-charts react-native-skia expo-build-properties react-native-reanimated react-native-worklets react-native-gesture-handler
```

### Peer dependencies

| Package | Version |
| --- | --- |
| `react-native-skia` | `>= 3.8.0` (tested with 3.8.0). Skia v3 is published under the unscoped name; `@shopify/react-native-skia` stops at 2.14 |
| `react-native-reanimated` | `>= 4.0` (required by Skia v3) |
| `react-native-worklets` | `>= 0.7` (required by Skia v3) |
| `react-native-gesture-handler` | `>= 2.20` |
| `react`, `react-native` | any version supported by the above |

Skia v3 renders with **Graphite** (Metal on Apple, Vulkan on Android) and therefore needs a **development build** (Expo Go ships Skia v2), **Android minSdk 26 + Vulkan 1.1**, and iOS 15.1+ (Expo SDK 58 already requires 16.4). Raise the Android minSdk in `app.json`:

```json
{ "expo": { "plugins": [["expo-build-properties", { "android": { "minSdkVersion": 26 } }]] } }
```

Do not install `@shopify/react-native-skia` alongside `react-native-skia` (same native module). Need Expo Go, Android TV, or pre-Vulkan devices? Stay on `expo-skia-charts@0.1.x` with Skia 2.x.

Wrap your app in `GestureHandlerRootView`. In Expo SDK 54+ `babel-preset-expo` sets up the worklets Babel plugin for you.


## Skia reference

The npm package [`react-native-skia`](https://www.npmjs.com/package/react-native-skia) is used **only for installation**. For Skia API docs, examples, and best practices, the source of truth for this project is the GitHub repo **[https://github.com/wcandillon/react-native-skia](https://github.com/wcandillon/react-native-skia)** (see its `apps/docs` and `apps/example` folders). Implementation follows that repo's guidance: drive animations with Reanimated shared values passed directly as Skia props (no React re-renders per frame), build paths with `Skia.Path` / path builders inside worklets, and keep one `<Canvas>` per chart.

## GPU vs CPU: what runs where (Skia v3)

Skia v3 replaced the Ganesh/OpenGL backend with **Skia Graphite** running on Dawn (Metal on iOS/macOS, Vulkan on Android). Per the [v3 migration guide](https://github.com/wcandillon/react-native-skia/blob/main/apps/docs/docs/getting-started/migration.md) and [v3.8.0 release notes](https://github.com/wcandillon/react-native-skia/releases/tag/v3.8.0), the drawing API is unchanged; what changed is *where* frames are produced: each `<Canvas>` scene is recorded once per React commit and replayed into a Graphite frame by a dedicated native thread pool. The UI thread only applies animated values — it no longer rasterizes.

### Skia features used by expo-skia-charts

| Feature | Used in | Runs on |
| --- | --- | --- |
| Path rasterization (`<Path>` fill & stroke, round caps/joins) | Line, StackedArea, Radar, Pie, Gauge, ProgressRings, compat `ChartPath` | **GPU** (Graphite tessellation/MSAA) |
| Anti-aliasing (default on every paint) | all charts | **GPU** |
| Primitive shapes (`Rect`, `RoundedRect`, `Circle`, `Line`) | Bar, Candlestick, Heatmap, Scatter, cursors/dots, grid lines | **GPU** |
| Linear gradient shader (`<LinearGradient>`) | LineChart area fill | **GPU** (fragment shader) |
| Sweep gradient shader (`<SweepGradient>`) | GaugeChart arc | **GPU** (fragment shader) |
| Opacity / alpha blending (`opacity`, color alpha, default `srcOver` blend) | Scatter, Heatmap, Candlestick, StackedArea, Radar, ProgressRings, compat `ChartDot` (Reanimated view style, not Skia) | **GPU** (Skia) / RN compositor (compat dot) |
| Affine transforms (`<Group transform>`) | Radar, StackedArea (draw-in scale) | **GPU** (matrix applied in vertex stage) |
| Groups / paint inheritance (`<Group>`) | all charts | recorded on CPU, drawn on **GPU** |
| Text (`<Text>` with `useFont`) | axis labels, Gauge value | glyph shaping/atlas on **CPU**, glyph quads drawn on **GPU** |
| Animated props (Reanimated shared values → Skia props) | all charts (draw-in, morph, scrub) | value computed in a **UI-thread worklet (CPU)**; frame replayed on **GPU** without React re-render |
| Path building (`Skia.PathBuilder.Make()` in `useDerivedValue`) | line/area/radar/pie geometry, interpolation | **CPU** (worklet on UI thread) |
| Gestures (`react-native-gesture-handler` `Gesture.Pan`) | Line & Candlestick scrubbing, compat | **CPU** (UI thread worklet) |
| Data scaling, monotone cubic interpolation, min/max | `utils/` | **CPU** (JS / worklet) |

### Skia v3 GPU features *not* currently used (available for future work)

Blur & mask filters (`BlurMask`, `Blur`), image filters (`Shadow`, `DropShadow`, `Morphology`, `DisplacementMap`), color filters (`ColorMatrix`, `Lerp`, `MakeLuma`), custom blend modes (`blendMode`), runtime shaders (`<Shader>` / `Skia.RuntimeEffect`, SkSL), radial/two-point-conical gradients, path effects (`DashPathEffect`, `CornerPathEffect`, `DiscretePathEffect`), clipping (`<Group clip>`), save-layers (`<Group layer>`), backdrop filters, `<Atlas>` instanced sprites, offscreen GPU surfaces (`Skia.Surface.MakeOffscreen`, texture hooks — in v3 GPU images can be shared across threads), `highBitDepth` (now also on Android, 10-bit), `SkiaGraphiteView`, and WebGPU interop. None are required for the current charts; they are listed so contributors know what is GPU-accelerated in v3 before reaching for a CPU fallback.

### Not used and removed in v3
`Canvas` props `onSize`, `opaque`, `colorSpace`, `debug`, `androidWarmup`, `makeImageSnapshotAsync`, `useVideo`, `SkiaPictureView`, and the `Make*` factory renames from 3.8.0 (e.g. `Skia.Image.MakeFromEncoded`) — this library uses none of them, so the v3 bump required only the package rename.

## Quick start

```tsx
import { LineChart } from 'expo-skia-charts';

<LineChart width={340} height={200} data={[3, 8, 5, 12, 9, 15]} onScrub={(p) => console.log(p)} />
```

All charts share these props: `width`, `height`, `padding?`, `style?`, `backgroundColor?`, `animation?: { duration?, delay? }`, and `font?` (an `SkFont` from Skia's `useFont`; axis labels only render when you pass one).

```tsx
import { useFont } from 'react-native-skia';
const font = useFont(require('./assets/Inter.ttf'), 11);
<BarChart font={font} ... />
```

## Chart types

### Line
```tsx
<LineChart width={w} height={220} data={values} curve="monotone" interactive onScrub={(pt, i) => {}} />
<LineChart width={w} height={180} series={[{ data: a, color: '#E17055' }, { data: b, color: '#0984E3' }]} curve="step" />
```
When `data` changes, the line morphs from the old path to the new one on the UI thread (`SkPath.interpolate`).
`data` accepts `number[]` or `{ x, y }[]`. `curve`: `'linear' | 'monotone' | 'step'`. `entry`: `'draw' | 'grow' | 'none'`.

### Area / Sparkline
```tsx
<AreaChart width={w} height={200} data={values} color="#00B894" />
<Sparkline width={120} height={36} data={values} />
```

### Stacked area
```tsx
<StackedAreaChart width={w} height={200} percent series={[{ data: a, color: '#6C5CE7' }, { data: b, color: '#00CEC9' }]} />
```

### Bar (vertical, horizontal, grouped, stacked) & Histogram
```tsx
<BarChart width={w} height={200} data={[4, 8, 2]} labels={['A', 'B', 'C']} />
<BarChart width={w} height={200} series={[{ data: a, color: '#6C5CE7' }, { data: b, color: '#FD79A8' }]} />
<BarChart width={w} height={200} horizontal data={[30, -20, 45]} />
<StackedBarChart width={w} height={240} series={[...]} />
<Histogram width={w} height={200} values={samples} bins={20} />
```

### Pie / Donut
```tsx
<PieChart width={240} height={240} data={[{ value: 40, color: '#6C5CE7' }, { value: 60, color: '#00CEC9' }]} padAngle={1.5} />
<DonutChart width={240} height={240} data={slices} thickness={0.3} centerLabel="72%" font={font} />
```

### Scatter / Bubble
```tsx
<ScatterChart width={w} height={240} data={[{ x: 1, y: 2 }, { x: 3, y: 5, color: 'red' }]} radius={4} />
<BubbleChart width={w} height={260} data={[{ x: 1, y: 2, z: 300 }]} minRadius={4} maxRadius={24} />
```

### Radar / Spider
```tsx
<RadarChart width={300} height={300} axes={['Speed', 'Power', 'Range']} max={10}
  series={[{ values: [8, 6, 7], color: '#6C5CE7' }]} font={font} />
```

### Candlestick / OHLC
```tsx
<CandlestickChart width={w} height={260} data={[{ x: 0, open: 10, high: 12, low: 9, close: 11 }]} onScrub={(c) => {}} />
<OHLCChart width={w} height={200} data={candles} />
```

### Heatmap
```tsx
<HeatmapChart width={w} height={140} data={matrix} colors={['#EBEDF0', '#216E39']} rowLabels={['Mon', 'Tue']} font={font} />
```

### Gauge
```tsx
<GaugeChart width={260} height={260} value={64} min={0} max={100} gradient={['#00B894', '#FDCB6E', '#E17055']} />
<GaugeChart width={260} height={160} value={64} sweep={180} showNeedle={false} />
```

### Progress rings
```tsx
<ProgressRings width={240} height={240} data={[{ progress: 0.8, color: '#FF2D55' }, { progress: 0.5, color: '#A4FF00' }]} />
<ProgressRing width={80} height={80} progress={0.72} color="#6C5CE7" thickness={10} />
```

### Rainbow-style API (migration from `@rainbow-me/react-native-animated-charts`)
```tsx
import { ChartPathProvider, ChartPath, ChartDot, ChartYLabel, ChartXLabel, monotoneCubicInterpolation } from 'expo-skia-charts';

<ChartPathProvider data={{ points, smoothingStrategy: 'bezier' }}>
  <ChartYLabel style={{ fontSize: 22 }} />
  <View>
    <ChartPath width={w} height={200} stroke="#FD79A8" />
    <ChartDot color="#FD79A8" />
  </View>
</ChartPathProvider>
```
`useChartData()` exposes the `isActive`, `originalX`, `originalY`, `positionX`, `positionY` and `index` shared values.

## Low-level building blocks
`buildLinePath`, `buildAreaPath`, `buildBandPath`, `arcPath`, `slicePath`, `linearScale`, `niceTicks`, `useEntryProgress`, `usePathTransition`, `Grid`: compose your own Skia charts.

## Example app
`example/` is an Expo SDK 58 app with a screen for every chart type. It resolves the library from `../src` through `metro.config.js`.

```sh
cd example
npm install
npx expo run:ios   # or run:android
```

## Development
```sh
npm install
npm run typecheck
npm run build   # emits build/*.js + .d.ts
```

## License
MIT © Baraa Rasheed
