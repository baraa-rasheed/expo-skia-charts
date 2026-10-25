import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Extrapolation, interpolate, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue,
  scrollTo, runOnUI, FadeInRight, type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { EmbeddedChart } from './ChartCard';
import type { ChartConfig, ChartDef } from './charts';
import { theme } from './theme';

/** How long a page stays before the carousel advances by itself. */
const AUTOPLAY_MS = 5000;
/** After the user touches the carousel, wait this long before resuming autoplay. */
const RESUME_MS = 8000;

export interface CarouselHandle { scrollToId: (id: string) => void }

/** One page: the header slides at full speed, the chart lags behind (parallax) and fades/scales at the edges. */
const Page = ({ index, x, width, children }: { index: number; x: SharedValue<number>; width: number; children: React.ReactNode }) => {
  const style = useAnimatedStyle(() => {
    const p = x.value / width - index; // -1 … 0 … 1
    return {
      opacity: interpolate(Math.abs(p), [0, 1], [1, 0.35], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(p, [-1, 0, 1], [-width * 0.35, 0, width * 0.35], Extrapolation.CLAMP) },
        { scale: interpolate(Math.abs(p), [0, 1], [1, 0.9], Extrapolation.CLAMP) },
      ],
    };
  });
  return <View style={{ width, overflow: 'hidden' }}><Animated.View style={style}>{children}</Animated.View></View>;
};

const Dot = ({ index, x, width }: { index: number; x: SharedValue<number>; width: number }) => {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(x.value / width - index);
    return {
      width: interpolate(d, [0, 1], [18, 6], Extrapolation.CLAMP),
      opacity: interpolate(d, [0, 1], [1, 0.35], Extrapolation.CLAMP),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

/**
 * Swipeable parallax carousel of embedded charts. Pages snap natively (pagingEnabled), auto-advance with a
 * smooth animated scroll, pause while the user interacts, and expose `scrollToId` so the home screen can
 * bring a chart into view before opening its sheet.
 */
export const Carousel = React.forwardRef<CarouselHandle, {
  defs: ChartDef[]; configs: Record<string, ChartConfig>; width: number; onOpen: (id: string) => void; paused?: boolean;
  /** Horizontal padding inside each page, so swipes are edge-to-edge but content aligns with the page. */
  inset?: number;
}>(function Carousel({ defs, configs, width, onOpen, paused, inset = 0 }, ref) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const x = useSharedValue(0);
  const [page, setPage] = useState(0);
  const lastTouch = useRef(0);

  const onPage = useCallback((p: number) => { setPage((old) => { if (old !== p) void Haptics.selectionAsync(); return p; }); }, []);
  const handler = useAnimatedScrollHandler({
    onScroll: (e) => { x.value = e.contentOffset.x; },
    onMomentumEnd: (e) => { scheduleOnRN(onPage, Math.round(e.contentOffset.x / width)); },
  });
  const go = useCallback((p: number) => {
    runOnUI((to: number) => { 'worklet'; scrollTo(scrollRef, to, 0, true); })(p * width);
    setPage(p);
  }, [scrollRef, width]);

  React.useImperativeHandle(ref, () => ({
    scrollToId: (id: string) => {
      const i = defs.findIndex((d) => d.id === id);
      if (i >= 0) { lastTouch.current = Date.now(); go(i); }
    },
  }), [defs, go]);

  // Autoplay: smooth native scroll to the next page; skipped while the user recently touched it or a sheet is open.
  useEffect(() => {
    if (paused || defs.length < 2) return;
    const t = setInterval(() => {
      if (Date.now() - lastTouch.current < RESUME_MS) return;
      go((page + 1) % defs.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, page, defs.length, go]);

  return (
    <View>
      <Animated.ScrollView ref={scrollRef} horizontal pagingEnabled decelerationRate="fast" showsHorizontalScrollIndicator={false}
        onScroll={handler} scrollEventThrottle={16} onScrollBeginDrag={() => { lastTouch.current = Date.now(); }}
        onTouchStart={() => { lastTouch.current = Date.now(); }}>
        {defs.map((def, i) => {
          const cfg = configs[def.id];
          return cfg ? (
            <Page key={def.id} index={i} x={x} width={width}>
              <View style={{ paddingHorizontal: inset }}>
                <EmbeddedChart def={def} cfg={cfg} width={width - inset * 2} onOpen={() => onOpen(def.id)} />
              </View>
            </Page>
          ) : null;
        })}
      </Animated.ScrollView>
      <View style={styles.dots} accessibilityRole="adjustable" accessibilityLabel={`Chart ${page + 1} of ${defs.length}`}>
        {defs.map((d, i) => <Dot key={d.id} index={i} x={x} width={width} />)}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 2, marginBottom: 8 },
  dot: { height: 6, borderRadius: 3, backgroundColor: theme.accent },
});

const StripItem = ({ index, x, step, children }: { index: number; x: SharedValue<number>; step: number; children: React.ReactNode }) => {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(x.value / step - index);
    return {
      opacity: interpolate(d, [0, 1.2], [1, 0.45], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(d, [0, 1.2], [1, 0.92], Extrapolation.CLAMP) }],
    };
  });
  return <Animated.View style={style}>{children}</Animated.View>;
};

/**
 * Horizontal "peek" strip (like Stocks' Top Movers): items narrower than the screen so the next one peeks in,
 * snapping per item with native deceleration; the focused item is full-size, neighbours recede.
 */
export const Strip = React.forwardRef<CarouselHandle, {
  ids: readonly string[]; itemWidth: number; gap: number; inset: number;
  renderItem: (id: string, index: number) => React.ReactNode;
}>(function Strip({ ids, itemWidth, gap, inset, renderItem }, ref) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const x = useSharedValue(0);
  const step = itemWidth + gap;
  const handler = useAnimatedScrollHandler({ onScroll: (e) => { x.value = e.contentOffset.x; } });
  React.useImperativeHandle(ref, () => ({
    scrollToId: (id: string) => {
      const i = ids.indexOf(id);
      if (i >= 0) runOnUI((to: number) => { 'worklet'; scrollTo(scrollRef, to, 0, true); })(i * step);
    },
  }), [ids, step, scrollRef]);
  return (
    <Animated.ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} onScroll={handler} scrollEventThrottle={16}
      snapToInterval={step} decelerationRate="fast" disableIntervalMomentum
      contentContainerStyle={{ paddingHorizontal: inset, gap }}>
      {ids.map((id, i) => (
        <Animated.View key={id} entering={FadeInRight.delay(120 + i * 80).duration(500)} style={{ width: itemWidth }}>
          <StripItem index={i} x={x} step={step}>{renderItem(id, i)}</StripItem>
        </Animated.View>
      ))}
    </Animated.ScrollView>
  );
});
