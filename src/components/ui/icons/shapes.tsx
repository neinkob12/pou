import { Circle, Path } from '@shopify/react-native-skia';

import { artColors, colors } from '../../../lib/theme';

export { starPath } from './starPath';

/** Konturbreite der Icons in Einheiten (Icon = 100 × 100). */
export const LINE = 6;

/** Form mit Kontur: Strich unter der Füllung, damit nur die halbe Strichbreite außen sichtbar ist. */
export function Shape({ d, fill, line = LINE }: { d: string; fill: string; line?: number }) {
  return (
    <>
      <Path path={d} color={artColors.outline} style="stroke" strokeWidth={line} strokeJoin="round" strokeCap="round" />
      <Path path={d} color={fill} />
    </>
  );
}

export function Dot({ cx, cy, r, fill, line = LINE }: { cx: number; cy: number; r: number; fill: string; line?: number }) {
  return (
    <>
      <Circle cx={cx} cy={cy} r={r + line / 2} color={artColors.outline} />
      <Circle cx={cx} cy={cy} r={r} color={fill} />
    </>
  );
}

/** Weißer Glanzstrich. */
export const shine = (d: string, width = 5) => (
  <Path path={d} color={colors.white} opacity={0.7} style="stroke" strokeWidth={width} strokeCap="round" />
);
