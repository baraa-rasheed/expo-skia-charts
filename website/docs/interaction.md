---
id: interaction
title: Animation & gestures
---

## Entry & morph animations

All charts animate in on mount. When `data` changes, paths morph on the UI thread with `SkPath.interpolate`.

```tsx
<LineChart data={data} animation={{ duration: 800, delay: 100 }} entry="draw" /> // 'draw' | 'grow' | 'none'
```

Set `animation={{ duration: 0 }}` to disable.

## Scrubbing

`LineChart`, `AreaChart` and `CandlestickChart` support press-and-drag scrubbing via `react-native-gesture-handler`. The cursor is positioned by a worklet; `onScrub` is called on the JS thread only when the index changes.

```tsx
const [pt, setPt] = useState<DataPoint | null>(null);
<LineChart data={data} interactive cursorColor="#999" onScrub={(p, i) => setPt(p)} />
```

Wrap your app in `GestureHandlerRootView`.

## Hooks

- `useEntryProgress(animation, deps)` — 0→1 shared value for custom entry effects.
- `usePathTransition(path, from, duration)` — morph between `SkPath`s on the UI thread.
