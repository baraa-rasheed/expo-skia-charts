---
id: gpu
title: GPU & performance
---



Skia v3 replaced the Ganesh/OpenGL backend with **Skia Graphite** running on Dawn (Metal on iOS/macOS, Vulkan on Android). Per the [v3 migration guide](https://github.com/wcandillon/react-native-skia/blob/main/apps/docs/docs/getting-started/migration.md) and [v3.8.0 release notes](https://github.com/wcandillon/react-native-skia/releases/tag/v3.8.0), the drawing API is unchanged; what changed is *where* frames are produced: each `<Canvas>` scene is recorded once per React commit and replayed into a Graphite frame by a dedicated native thread pool. The UI thread only applies animated values — it no longer rasterizes.

## Skia features used by expo-skia-charts

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

## GPU effects (via the `effects` prop)

| Feature | Skia primitive | Runs on |
| --- | --- | --- |
| Drop shadow | `<Shadow>` image filter | **GPU** |
| Gaussian blur | `<Blur>` image filter | **GPU** |
| Glow | `<BlurMask>` mask filter | **GPU** |
| Colour filters | `<ColorMatrix>` | **GPU** |
| Blend modes | layer paint `blendMode` | **GPU** |
| Dashed strokes | `<DashPathEffect>` | path effect applied at draw, rasterized on **GPU** |
| Rounded corners | `<CornerPathEffect>` | path effect applied at draw, rasterized on **GPU** |
| Clip reveal | animated `<Group clip>` | **GPU** (clip rect animated in a UI-thread worklet) |
| Offscreen layer | `<Group layer>` (saveLayer) | **GPU** render target |
| SkSL runtime shaders | `Skia.RuntimeEffect` + `<Shader>` + `useClock` | **GPU** fragment shader; uniforms updated on the UI thread |

See [GPU effects](./effects).

## Not used and removed in v3
`Canvas` props `onSize`, `opaque`, `colorSpace`, `debug`, `androidWarmup`, `makeImageSnapshotAsync`, `useVideo`, `SkiaPictureView`, and the `Make*` factory renames from 3.8.0 (e.g. `Skia.Image.MakeFromEncoded`) — this library uses none of them, so the v3 bump required only the package rename.


## Performance tips

- Pass Reanimated shared values straight to Skia props; never `setState` per frame.
- Keep one `<Canvas>` per chart; Graphite records the scene once per React commit and replays it off the UI thread.
- Effects that need a layer (shadow, blur, colour filter, blend mode, shader) allocate one offscreen GPU target per chart — cheap, but don't nest dozens.
- `glow` draws the chart twice (blurred + sharp).
- Prefer `clipReveal` over animating path geometry for entry effects on large datasets.
