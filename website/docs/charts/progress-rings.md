---
id: progress-rings
title: Progress rings
sidebar_position: 14
---

Concentric activity-style rings.

![Progress rings illustration](/img/charts/progress-rings.svg)

*Illustration. Run the [example app](../example-app) to see it live.*

## Usage

```tsx
import { ProgressRings } from 'expo-skia-charts';

<ProgressRings width={220} height={220} data={[{ progress: 0.8, color: '#FF6B9A' }, { progress: 0.6, color: '#4CD97B' }]} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `data` | `{ progress, color, backgroundColor?, label? }[]` | `—` | `progress` in 0..1. |
| `thickness` | `number` | `18` |  |
| `gap` | `number` | `4` |  |
| `trackOpacity` | `number` | `0.2` |  |
| `ProgressRing` | `{ progress, color, … }` |  | Single ring shortcut. |

All charts also accept the shared props: `width`, `height`, `padding`, `style`, `backgroundColor`, `animation`, `font`, [`effects`](../effects) and [`gradient`](../gradients).

## Gradient

```tsx
<ProgressRings {...props} gradient={{ type: 'sweep', colors: ['#7C5CFF', '#00D2D3', '#7C5CFF'] }} />
```

## GPU notes

Ring sweeps animate with Reanimated `end` values on the UI thread.
