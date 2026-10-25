export interface Domain { min: number; max: number }

export const extent = (values: readonly number[], includeZero = false): Domain => {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (!Number.isFinite(min)) return { min: 0, max: 1 };
  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }
  if (min === max) {
    min -= 1;
    max += 1;
  }
  return { min, max };
};

/** Linear scale factory. Returned function is worklet-safe. */
export const linearScale = (domain: Domain, range: readonly [number, number]) => {
  const d0 = domain.min;
  const d1 = domain.max;
  const r0 = range[0];
  const r1 = range[1];
  const k = (r1 - r0) / (d1 - d0 || 1);
  return (v: number): number => {
    'worklet';
    return r0 + (v - d0) * k;
  };
};

export const niceTicks = (domain: Domain, count = 5): number[] => {
  const span = domain.max - domain.min;
  if (span <= 0) return [domain.min];
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const ticks: number[] = [];
  for (let t = Math.ceil(domain.min / step) * step; t <= domain.max + step * 1e-9; t += step) {
    ticks.push(Number(t.toFixed(10)));
  }
  return ticks;
};

export const clamp = (v: number, lo: number, hi: number): number => {
  'worklet';
  return Math.min(hi, Math.max(lo, v));
};
