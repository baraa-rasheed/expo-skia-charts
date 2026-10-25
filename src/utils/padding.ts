import type { Padding, PaddingInput } from '../types';

export const resolvePadding = (p: PaddingInput | undefined, fallback = 16): Padding => {
  if (p === undefined) return { top: fallback, right: fallback, bottom: fallback, left: fallback };
  if (typeof p === 'number') return { top: p, right: p, bottom: p, left: p };
  return {
    top: p.top ?? fallback,
    right: p.right ?? fallback,
    bottom: p.bottom ?? fallback,
    left: p.left ?? fallback,
  };
};
