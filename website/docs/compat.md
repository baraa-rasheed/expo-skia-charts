---
id: compat
title: Rainbow-compatible API
---

Drop-in replacement for `@rainbow-me/react-native-animated-charts`.


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

