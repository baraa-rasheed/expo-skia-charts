# expo-skia-charts

GPU-accelerated, animated charts for **React Native & Expo**, drawn with [`@shopify/react-native-skia`](https://shopify.github.io/react-native-skia/) and animated entirely on the UI thread with **Reanimated shared values & worklets**. A modern successor to the unmaintained `@rainbow-me/react-native-animated-charts`, including a familiar `ChartPathProvider` / `ChartPath` / `ChartDot` API.

- 🚀 60fps: every animation (path morphing, bar growth, arc sweeps, scrubbing) runs in worklets; no JS animation loops
- 🧩 15+ chart types, all in TypeScript strict mode, `.d.ts` shipped
- 📦 Pure JS library: no native code of its own, works in Expo (dev builds & Expo Go where Skia is available), uses Skia's immutable `PathBuilder` API
- 👆 Press-and-drag scrubbing via `react-native-gesture-handler`

## Install

```sh
npx expo install expo-skia-charts @shopify/react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler
```

### Peer dependencies

| Package | Version |
| --- | --- |
| `@shopify/react-native-skia` | `>= 2.0` (tested with 2.14, the Expo SDK 58 version) |
| `react-native-reanimated` | `>= 3.16` (4.x recommended, plus `react-native-worklets`) |
| `react-native-gesture-handler` | `>= 2.20` |
| `react`, `react-native` | any version supported by the above |

Wrap your app in `GestureHandlerRootView`. In Expo SDK 54+ `babel-preset-expo` sets up the worklets Babel plugin for you.

## Quick start

```tsx
import { LineChart } from 'expo-skia-charts';

<LineChart width={340} height={200} data={[3, 8, 5, 12, 9, 15]} onScrub={(p) => console.log(p)} />
```

All charts share these props: `width`, `height`, `padding?`, `style?`, `backgroundColor?`, `animation?: { duration?, delay? }`, and `font?` (an `SkFont` from Skia's `useFont`; axis labels only render when you pass one).

```tsx
import { useFont } from '@shopify/react-native-skia';
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
