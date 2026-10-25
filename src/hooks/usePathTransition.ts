import { useEffect, useRef } from 'react';
import type { SkPath } from '@shopify/react-native-skia';
import { Easing, useDerivedValue, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

/**
 * Morphs from the previous path to the next one on the UI thread (like rainbow's animated charts),
 * using Skia's native `SkPath.interpolate`. Falls back to snapping when verb structure differs.
 */
export const usePathTransition = (next: SkPath, initial: SkPath, duration = 600): SharedValue<SkPath> => {
  const from = useSharedValue<SkPath>(initial);
  const to = useSharedValue<SkPath>(next);
  const t = useSharedValue(0);
  const last = useRef<SkPath>(initial);
  useEffect(() => {
    from.value = last.current;
    to.value = next;
    last.current = next;
    t.value = 0;
    t.value = withTiming(1, { duration, easing: Easing.inOut(Easing.cubic) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next]);
  return useDerivedValue(() => {
    if (t.value >= 1) return to.value;
    if (!from.value.isInterpolatable(to.value)) return to.value;
    return to.value.interpolate(from.value, t.value) ?? to.value;
  });
};
