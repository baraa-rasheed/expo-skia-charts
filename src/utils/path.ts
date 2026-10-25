import { Skia, type SkPath } from 'react-native-skia';
import type { CurveType, Point } from '../types';

type Builder = ReturnType<typeof Skia.PathBuilder.Make>;

/** Append a curve through `pts` to a builder. `connect` uses lineTo for the first point instead of moveTo. */
const appendCurve = (b: Builder, pts: readonly Point[], curve: CurveType, connect = false): void => {
  if (pts.length === 0) return;
  const first = pts[0]!;
  if (connect) b.lineTo(first.x, first.y);
  else b.moveTo(first.x, first.y);
  if (curve === 'linear' || pts.length < 3) {
    for (let i = 1; i < pts.length; i++) b.lineTo(pts[i]!.x, pts[i]!.y);
    return;
  }
  if (curve === 'step') {
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i]!;
      const prev = pts[i - 1]!;
      const mx = (prev.x + p.x) / 2;
      b.lineTo(mx, prev.y);
      b.lineTo(mx, p.y);
      b.lineTo(p.x, p.y);
    }
    return;
  }
  // Monotone cubic (Fritsch–Carlson) – no overshoot, ideal for financial data.
  const n = pts.length;
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!;
    const c = pts[i + 1]!;
    dx.push(c.x - a.x);
    slope.push((c.y - a.y) / (c.x - a.x || 1));
  }
  const m: number[] = [slope[0]!];
  for (let i = 1; i < n - 1; i++) {
    const s0 = slope[i - 1]!;
    const s1 = slope[i]!;
    m.push(s0 * s1 <= 0 ? 0 : (3 * (dx[i - 1]! + dx[i]!)) / ((2 * dx[i]! + dx[i - 1]!) / s0 + (dx[i]! + 2 * dx[i - 1]!) / s1));
  }
  m.push(slope[n - 2]!);
  for (let i = 0; i < n - 1; i++) {
    const a = pts[i]!;
    const c = pts[i + 1]!;
    const h = dx[i]! / 3;
    b.cubicTo(a.x + h, a.y + m[i]! * h, c.x - h, c.y - m[i + 1]! * h, c.x, c.y);
  }
};

/** Build an immutable Skia path through points using the requested curve. */
export const buildLinePath = (pts: readonly Point[], curve: CurveType = 'monotone'): SkPath => {
  const b = Skia.PathBuilder.Make();
  appendCurve(b, pts, curve);
  return b.detach();
};

/** Close a line path down to a baseline to form an area. */
export const buildAreaPath = (pts: readonly Point[], baselineY: number, curve: CurveType = 'monotone'): SkPath => {
  const b = Skia.PathBuilder.Make();
  appendCurve(b, pts, curve);
  if (pts.length > 0) {
    b.lineTo(pts[pts.length - 1]!.x, baselineY);
    b.lineTo(pts[0]!.x, baselineY);
    b.close();
  }
  return b.detach();
};

/** Area between an upper and lower line (for stacked areas). */
export const buildBandPath = (upper: readonly Point[], lower: readonly Point[], curve: CurveType = 'monotone'): SkPath => {
  const b = Skia.PathBuilder.Make();
  appendCurve(b, upper, curve);
  appendCurve(b, [...lower].reverse(), curve, true);
  b.close();
  return b.detach();
};

/** Points sharing the same verb structure as `pts` but flattened to baseline: used as entry animation origin. */
export const flatten = (pts: readonly Point[], y: number): Point[] => pts.map((p) => ({ x: p.x, y }));

export const arcPath = (cx: number, cy: number, r: number, startDeg: number, sweepDeg: number): SkPath => {
  'worklet';
  const p = Skia.PathBuilder.Make();
  p.addArc({ x: cx - r, y: cy - r, width: r * 2, height: r * 2 }, startDeg, sweepDeg);
  return p.detach();
};

export const slicePath = (cx: number, cy: number, r: number, inner: number, startDeg: number, sweepDeg: number): SkPath => {
  'worklet';
  const p = Skia.PathBuilder.Make();
  const outer = { x: cx - r, y: cy - r, width: r * 2, height: r * 2 };
  if (inner <= 0) {
    p.moveTo(cx, cy);
    p.arcToOval(outer, startDeg, sweepDeg, false);
    p.close();
    return p.detach();
  }
  const inn = { x: cx - inner, y: cy - inner, width: inner * 2, height: inner * 2 };
  p.arcToOval(outer, startDeg, sweepDeg, true);
  p.arcToOval(inn, startDeg + sweepDeg, -sweepDeg, false);
  p.close();
  return p.detach();
};
