import React, { useEffect, useMemo } from 'react';
import {
  Blur, BlurMask, ColorMatrix, CornerPathEffect, DashPathEffect, Fill, Group, Paint, Shader, Shadow, Skia, rect, useClock,
  type SkRuntimeEffect,
} from 'react-native-skia';
import { Easing, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';

/** 4x5 colour matrices for the built-in colour-filter presets (GPU colour filter). */
export const COLOR_MATRICES = {
  none: null,
  grayscale: [0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0.2126, 0.7152, 0.0722, 0, 0, 0, 0, 0, 1, 0],
  sepia: [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0],
  invert: [-1, 0, 0, 0, 1, 0, -1, 0, 0, 1, 0, 0, -1, 0, 1, 0, 0, 0, 1, 0],
  saturate: [1.6, -0.3, -0.3, 0, 0, -0.3, 1.6, -0.3, 0, 0, -0.3, -0.3, 1.6, 0, 0, 0, 0, 0, 1, 0],
} as const;
export type ColorFilterPreset = keyof typeof COLOR_MATRICES;

export type ChartBlendMode = 'srcOver' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'colorDodge' | 'colorBurn' | 'hardLight' | 'softLight' | 'difference' | 'exclusion' | 'plus' | 'hue' | 'saturation' | 'color' | 'luminosity';

/** Built-in SkSL runtime shaders, composited over the chart with `srcATop` so they only tint drawn pixels. */
export type ShaderPreset = 'none' | 'shimmer' | 'aurora' | 'scanlines';

export interface ChartEffects {
  /** Drop shadow image filter on the whole chart layer. */
  shadow?: { dx?: number; dy?: number; blur?: number; color?: string } | boolean;
  /** Neon glow: a blurred copy (BlurMask) drawn under the chart. Value = sigma. */
  glow?: number;
  /** Gaussian blur image filter on the chart layer (e.g. for a "loading" state). */
  blur?: number;
  /** Colour filter preset or a custom 4x5 colour matrix. */
  colorFilter?: ColorFilterPreset | number[];
  /** Blend mode used when compositing the chart layer onto the canvas. */
  blendMode?: ChartBlendMode;
  /** Dashed strokes/fills: DashPathEffect intervals, e.g. [8, 4]. */
  dash?: number[];
  /** Round sharp path corners with CornerPathEffect (radius in px). */
  cornerRadius?: number;
  /** Clip-path reveal animation from left to right on mount/data change (ms, 0 = off). */
  clipReveal?: number;
  /** Animated SkSL runtime shader overlay. */
  shader?: ShaderPreset;
}

const SHADERS: Record<Exclude<ShaderPreset, 'none'>, string> = {
  shimmer: `uniform float t; uniform float2 size;
half4 main(float2 p){ float x = p.x / size.x - fract(t * 0.35) * 2.0 + 0.5; float a = smoothstep(0.25, 0.0, abs(x)) * 0.65; return half4(a, a, a, a); }`,
  aurora: `uniform float t; uniform float2 size;
half4 main(float2 p){ float2 uv = p / size; float r = 0.5 + 0.5 * sin(t + uv.x * 6.0); float g = 0.5 + 0.5 * sin(t * 1.3 + uv.y * 5.0 + 2.0); float b = 0.5 + 0.5 * sin(t * 0.7 + (uv.x + uv.y) * 4.0 + 4.0); return half4(r, g, b, 1.0) * 0.55; }`,
  scanlines: `uniform float t; uniform float2 size;
half4 main(float2 p){ float l = step(0.5, fract((p.y + t * 20.0) / 4.0)) * 0.35; return half4(0.0, 0.0, 0.0, l); }`,
};
const compiled: Partial<Record<string, SkRuntimeEffect | null>> = {};
const getEffect = (k: Exclude<ShaderPreset, 'none'>): SkRuntimeEffect | null => {
  if (!(k in compiled)) compiled[k] = Skia.RuntimeEffect.Make(SHADERS[k]);
  return compiled[k] ?? null;
};

const ShaderOverlay = ({ preset, width, height }: { preset: Exclude<ShaderPreset, 'none'>; width: number; height: number }) => {
  const source = getEffect(preset);
  const clock = useClock();
  const uniforms = useDerivedValue(() => ({ t: clock.value / 1000, size: [width, height] }));
  if (!source) return null;
  return (
    <Fill blendMode="srcATop">
      <Shader source={source} uniforms={uniforms} />
    </Fill>
  );
};

/**
 * Wraps chart content inside a `<Canvas>` and applies optional Skia effects.
 * Everything here runs on the GPU (Graphite): image filters, colour filters, blend modes, path effects,
 * clipping and the offscreen layer (`<Group layer>` = saveLayer into a GPU render target).
 */
export const EffectsLayer = ({ effects, width, height, children, revealKey }: {
  effects?: ChartEffects; width: number; height: number; children: React.ReactNode; revealKey?: unknown;
}) => {
  const e = effects ?? {};
  const reveal = useSharedValue(e.clipReveal ? 0 : 1);
  useEffect(() => {
    if (!e.clipReveal) { reveal.value = 1; return; }
    reveal.value = 0;
    reveal.value = withTiming(1, { duration: e.clipReveal, easing: Easing.out(Easing.cubic) });
  }, [e.clipReveal, revealKey, reveal]);
  const clip = useDerivedValue(() => rect(0, 0, width * reveal.value, height));

  const shadow = e.shadow === true ? {} : e.shadow || null;
  const matrix = typeof e.colorFilter === 'string' ? COLOR_MATRICES[e.colorFilter] : e.colorFilter ?? null;
  const needsLayer = !!(shadow || e.blur || matrix || e.blendMode || (e.shader && e.shader !== 'none'));
  const layer = useMemo(() => needsLayer ? (
    <Paint blendMode={e.blendMode}>
      {e.blur ? <Blur blur={e.blur} /> : null}
      {shadow ? <Shadow dx={shadow.dx ?? 0} dy={shadow.dy ?? 6} blur={shadow.blur ?? 8} color={shadow.color ?? 'rgba(0,0,0,0.35)'} /> : null}
      {matrix ? <ColorMatrix matrix={[...matrix]} /> : null}
    </Paint>
  ) : undefined, [needsLayer, e.blendMode, e.blur, shadow?.dx, shadow?.dy, shadow?.blur, shadow?.color, matrix]);

  const pathEffects = (
    <>
      {e.dash && e.dash.length >= 2 ? <DashPathEffect intervals={e.dash} /> : null}
      {e.cornerRadius ? <CornerPathEffect r={e.cornerRadius} /> : null}
    </>
  );

  return (
    <Group clip={e.clipReveal ? clip : undefined}>
      <Group layer={layer}>
        {e.glow ? (
          <Group opacity={0.9}>
            <BlurMask blur={e.glow} style="normal" />
            {pathEffects}
            {children}
          </Group>
        ) : null}
        <Group>
          {pathEffects}
          {children}
        </Group>
        {e.shader && e.shader !== 'none' ? <ShaderOverlay preset={e.shader} width={width} height={height} /> : null}
      </Group>
    </Group>
  );
};
