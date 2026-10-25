import type { Candle } from 'expo-skia-charts';

export const randomWalk = (n: number, start = 100, vol = 4): number[] => {
  const out: number[] = [];
  let v = start;
  for (let i = 0; i < n; i++) { v += (Math.random() - 0.5) * vol; out.push(Math.round(v * 100) / 100); }
  return out;
};

export const candles = (n: number): Candle[] => {
  const out: Candle[] = [];
  let p = 100;
  for (let i = 0; i < n; i++) {
    const open = p;
    const close = open + (Math.random() - 0.5) * 6;
    out.push({ x: i, open, close, high: Math.max(open, close) + Math.random() * 3, low: Math.min(open, close) - Math.random() * 3 });
    p = close;
  }
  return out;
};
