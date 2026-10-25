import { useEffect } from 'react';
import { Easing, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import type { AnimationConfig } from '../types';

/**
 * Shared value animating 0 → 1 on the UI thread whenever `deps` change.
 * All charts derive geometry from this inside worklets so no JS frames are spent animating.
 */
export const useEntryProgress = (
  animation: AnimationConfig | undefined,
  deps: readonly unknown[],
): SharedValue<number> => {
  const duration = animation?.duration ?? 600;
  const delay = animation?.delay ?? 0;
  const progress = useSharedValue(duration === 0 ? 1 : 0);
  useEffect(() => {
    if (duration === 0) {
      progress.value = 1;
      return;
    }
    progress.value = 0;
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return progress;
};
