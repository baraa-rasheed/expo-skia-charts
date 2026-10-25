import React from 'react';
import { Group, Line, Text, vec, type SkFont } from 'react-native-skia';
import type { Padding } from '../types';

export interface GridProps {
  width: number;
  height: number;
  padding: Padding;
  yTicks: number[];
  yScale: (v: number) => number;
  color?: string;
  font?: SkFont | null;
  labelColor?: string;
  formatY?: (v: number) => string;
  xLabels?: { x: number; label: string }[];
}

/** Horizontal grid lines with optional y-axis/x-axis labels. */
export const Grid = ({ width, height, padding, yTicks, yScale, color = 'rgba(128,128,128,0.2)', font, labelColor = '#888', formatY = (v) => `${v}`, xLabels }: GridProps) => (
  <Group>
    {yTicks.map((t) => {
      const y = yScale(t);
      return (
        <Group key={`y${t}`}>
          <Line p1={vec(padding.left, y)} p2={vec(width - padding.right, y)} color={color} strokeWidth={1} />
          {font ? <Text x={2} y={y + font.getSize() / 3} text={formatY(t)} font={font} color={labelColor} /> : null}
        </Group>
      );
    })}
    {font && xLabels
      ? xLabels.map((l, i) => {
          const w = font.measureText(l.label).width;
          return <Text key={`x${i}`} x={l.x - w / 2} y={height - 2} text={l.label} font={font} color={labelColor} />;
        })
      : null}
  </Group>
);
