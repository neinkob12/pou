import { Circle, Group, LinearGradient, Path, RoundedRect, vec } from '@shopify/react-native-skia';

import { artColors, colors } from '../../../lib/theme';

// H3: Trockenraum, dunkler Schrank mit Leine (docs/ASSETS.md). Breites Format, Einheiten 100 × 31.
const OUTLINE = 1.2;
export const DRYING_ROOM_H = 31;

function Sprig({ x, len, tint }: { x: number; len: number; tint: string }) {
  const top = 8.6;
  return (
    <Group>
      <Path path={`M${x} ${top} L${x} ${top + len}`} color={artColors.outline} style="stroke" strokeWidth={1.6} strokeCap="round" />
      {[0.35, 0.65].map((f) => (
        <Path
          key={f}
          path={`M${x} ${top + len * f} q-3 1 -3.6 4 M${x} ${top + len * f} q3 1 3.6 4`}
          color={tint}
          style="stroke"
          strokeWidth={1.4}
          strokeCap="round"
        />
      ))}
      <Circle cx={x} cy={top + len} r={1.9} color={tint} />
      <Circle cx={x - 1.4} cy={top + len * 0.82} r={1.4} color={tint} />
      <Circle cx={x + 1.4} cy={top + len * 0.82} r={1.4} color={tint} />
    </Group>
  );
}

/** Offener Holzschrank: innen dunkel, Leine mit Zweigen, Hygrometer an der Tür. */
export function DryingRoomArt() {
  const sprigs = [22, 30, 38, 46, 54, 62, 70, 78];
  return (
    <Group>
      {/* Türen, aufgeklappt */}
      <Path path="M2 4 L12 2 L12 29 L2 27 Z" color={artColors.outline} />
      <Path path="M3 5 L11 3.4 L11 27.6 L3 26 Z" color={artColors.woodShade} />
      <Path path="M98 4 L88 2 L88 29 L98 27 Z" color={artColors.outline} />
      <Path path="M97 5 L89 3.4 L89 27.6 L97 26 Z" color={artColors.woodShade} />
      {/* Korpus und Innenraum */}
      <RoundedRect x={11} y={1} width={78} height={29} r={2} color={artColors.outline} />
      <RoundedRect x={12.2} y={2.2} width={75.6} height={26.6} r={1.4} color={artColors.wood} />
      <RoundedRect x={15} y={4.4} width={70} height={22.4} r={1}>
        <LinearGradient start={vec(0, 4)} end={vec(0, 27)} colors={[artColors.cabinetShade, artColors.cabinet]} />
      </RoundedRect>
      {/* Leine und Zweige */}
      <Path path="M15.5 8 Q50 11 84.5 8" color={artColors.string} style="stroke" strokeWidth={0.8} />
      {sprigs.map((x, i) => (
        <Sprig key={x} x={x} len={9 + (i % 3) * 2.4} tint={i % 2 ? artColors.leafShade : artColors.budShade} />
      ))}
      {/* Hygrometer an der linken Tür */}
      <Circle cx={7} cy={14} r={3 + OUTLINE / 2} color={artColors.outline} />
      <Circle cx={7} cy={14} r={3} color={colors.cream} />
      <Path path="M7 14 L8.6 12.4" color={colors.coral} style="stroke" strokeWidth={0.8} strokeCap="round" />
      {/* Türknäufe */}
      <Circle cx={10} cy={18} r={0.9} color={artColors.gold} />
      <Circle cx={90} cy={18} r={0.9} color={artColors.gold} />
    </Group>
  );
}
