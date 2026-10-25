<p align="center">
  <img src="website/static/img/logo.svg" width="72" alt="" />
</p>

<h1 align="center">expo-skia-charts</h1>

<p align="center">
  Charts for Expo and React Native that are drawn on the GPU with Skia, animated on the UI thread, and easy for you or your coding agent to get right first time.
  <br />
  <a href="https://baraa-rasheed.github.io/expo-skia-charts/"><b>Docs</b></a> ·
  <a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/agents">Agent guide</a> ·
  <a href="example">Example app</a>
</p>

---

Most React Native chart libraries draw SVG through the bridge. This one draws every bar, slice and candle with `react-native-skia` 3.8 (Metal on iOS, Vulkan on Android). Scrubbing, selection and pinch-zoom run as Reanimated worklets. Your finger moves the cursor without a React re-render on each frame.

```tsx
import { LineChart } from 'expo-skia-charts';

<LineChart
  data={prices}
  width={340}
  height={200}
  fill
  gradient={{ type: 'linear', colors: ['#5EE7DF', '#B490CA'] }}
  onScrub={(p) => p && setPrice(p.y)}
/>
```

## Charts

Click a chart to open its docs page.

<table>
  <tr>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/line"><img src="website/static/img/charts/line.svg" width="150" alt="Line" /><br /><b>Line</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/area"><img src="website/static/img/charts/area.svg" width="150" alt="Area & Sparkline" /><br /><b>Area &amp; Sparkline</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/bar"><img src="website/static/img/charts/bar.svg" width="150" alt="Bar" /><br /><b>Bar</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/stacked-bar"><img src="website/static/img/charts/stacked-bar.svg" width="150" alt="Stacked bar" /><br /><b>Stacked bar</b></a></td>
  </tr>
  <tr>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/histogram"><img src="website/static/img/charts/histogram.svg" width="150" alt="Histogram" /><br /><b>Histogram</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/stacked-area"><img src="website/static/img/charts/stacked-area.svg" width="150" alt="Stacked area" /><br /><b>Stacked area</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/pie-donut"><img src="website/static/img/charts/pie-donut.svg" width="150" alt="Pie & Donut" /><br /><b>Pie &amp; Donut</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/scatter"><img src="website/static/img/charts/scatter.svg" width="150" alt="Scatter" /><br /><b>Scatter</b></a></td>
  </tr>
  <tr>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/bubble"><img src="website/static/img/charts/bubble.svg" width="150" alt="Bubble" /><br /><b>Bubble</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/radar"><img src="website/static/img/charts/radar.svg" width="150" alt="Radar" /><br /><b>Radar</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/candlestick"><img src="website/static/img/charts/candlestick.svg" width="150" alt="Candlestick & OHLC" /><br /><b>Candlestick &amp; OHLC</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/heatmap"><img src="website/static/img/charts/heatmap.svg" width="150" alt="Heatmap" /><br /><b>Heatmap</b></a></td>
  </tr>
  <tr>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/gauge"><img src="website/static/img/charts/gauge.svg" width="150" alt="Gauge" /><br /><b>Gauge</b></a></td>
    <td align="center" width="25%"><a href="https://baraa-rasheed.github.io/expo-skia-charts/docs/charts/progress-rings"><img src="website/static/img/charts/progress-rings.svg" width="150" alt="Progress rings" /><br /><b>Progress rings</b></a></td>
  </tr>
</table>

## What you get

- **Touch:**
  - Scrub or use a crosshair on line, area and candle charts.
  - Tap or long-press to select a bar, slice, point, cell or ring.
  - Pinch, pan or double-tap to zoom any chart with axes.
  - [Interaction docs](https://baraa-rasheed.github.io/expo-skia-charts/docs/interaction).
- **Looks:**
  - Linear, radial and sweep [gradients](https://baraa-rasheed.github.io/expo-skia-charts/docs/gradients).
  - Shadows, glow, blur, blend modes, dashes and SkSL shaders through one [`effects`](https://baraa-rasheed.github.io/expo-skia-charts/docs/effects) prop.
- **Same props everywhere:** every chart takes pixel `width`/`height`, plain-array data, and the same `gradient`, `effects` and `animation` props. Learn one chart and you know the rest.

## Works with coding agents

The API is small and regular on purpose, so an LLM can't easily guess it wrong.

- [`AGENTS.md`](AGENTS.md) ships in the npm package. Cursor, Claude Code, Copilot and others read it automatically. It covers which chart to pick, the rules, and one canonical snippet.
- [`llms.txt`](https://baraa-rasheed.github.io/expo-skia-charts/llms.txt) and an [agent guide](https://baraa-rasheed.github.io/expo-skia-charts/docs/agents) are published with the docs.
- [`example/recipes/agent-recipes.tsx`](example/recipes/agent-recipes.tsx) has one recipe per chart, compiled under strict TypeScript alongside the example app, so the snippets stay correct.

## Install

```sh
npx expo install expo-skia-charts react-native-skia react-native-reanimated react-native-worklets react-native-gesture-handler
```

You need `react-native-skia` ≥ 3.8, Reanimated ≥ 4 and worklets ≥ 0.7. It needs a dev build (not Expo Go) and Android `minSdkVersion` 26.

## Example app

A stocks-style home screen with every chart embedded full width. Tap **See All** on a chart to tweak colours, gradients, effects and interactions live in a native blur sheet.

```sh
cd example && npm install && npx expo run:ios   # or run:android
```

## License

MIT
