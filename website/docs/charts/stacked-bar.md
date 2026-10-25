---
id: stacked-bar
title: Stacked bar chart
sidebar_position: 4
---

Bars stacked by series.

![Stacked bar chart illustration](/img/charts/stacked-bar.svg)

*Illustration. Run the [example app](../example-app) to see it live.*

## Usage

```tsx
import { StackedBarChart } from 'react-native-skia-chart';

<StackedBarChart width={w} height={200} series={[{ data: a, color: '#7C5CFF' }, { data: b, color: '#00D2D3' }]} />
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `series` | `{ data, color }[]` | `—` | One entry per stack layer. |
| `…BarChart props` |  |  | Except `data` and `stacked`. |

All charts also accept the shared props: `width`, `height`, `padding`, `style`, `backgroundColor`, `animation`, `font`, [`effects`](../effects) and [`gradient`](../gradients).

## Gradient

```tsx
<StackedBarChart {...props} gradient={{ type: 'linear', colors: ['#ffffff', '#7C5CFF'], mode: 'overlay', opacity: 0.4 }} />
```

## GPU notes

Use `mode: 'overlay'` to keep each layer's colour and blend a gradient on top (`srcATop`).
