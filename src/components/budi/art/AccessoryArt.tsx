import { Circle, Group, Oval, Path, RoundedRect } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import type { CosmeticId } from '../../../game/config';
import { artColors, colors } from '../../../lib/theme';
import { starPath } from '../../ui/icons/shapes';

// Accessoires (U16) auf Budis Leinwand 100 × 100: Brille über den Augen, Hüte schräg auf dem
// Topfrand links, damit die Pflanze in der Mitte frei bleibt. Wird als PNG nach assets/budi/
// gerendert (assets/render-art.cjs) und liegt als Bild-Ebene über Budi.
const OUTLINE = 1.7;
const TILT = { transform: [{ rotate: -0.22 }], origin: { x: 30, y: 60 } };

function Sunglasses() {
  return (
    <Group>
      <Path path="M22 76 L31 77 M78 76 L69 77" color={artColors.outline} style="stroke" strokeWidth={2.4} strokeCap="round" />
      <Path path="M45 78 Q50 74.5 55 78" color={artColors.outline} style="stroke" strokeWidth={2.6} strokeCap="round" />
      {[39.5, 60.5].map((x) => (
        <Group key={x}>
          <RoundedRect x={x - 8.4} y={73} width={16.8} height={12.6} r={5} color={artColors.outline} />
          <RoundedRect x={x - 6.9} y={74.5} width={13.8} height={9.6} r={3.8} color={artColors.eye} />
          <Path path={`M${x - 4.5} ${77.5} L${x - 1} ${76.2}`} color={colors.white} style="stroke" strokeWidth={1.6} strokeCap="round" opacity={0.8} />
          <Path path={`M${x + 1} ${82} L${x + 4} ${80.6}`} color={colors.lavender} style="stroke" strokeWidth={1.2} strokeCap="round" opacity={0.7} />
        </Group>
      ))}
    </Group>
  );
}

function Cap() {
  return (
    <Group {...TILT}>
      <Path path="M8 61 Q16 56 24 59 L26 63 Q16 62 8 64 Z" color={artColors.outline} />
      <Path path="M9.5 61.6 Q16 58 24 60 L24.6 62 Q16 61.4 9.5 62.8 Z" color={artColors.denim} />
      <Path path="M20 61 C20 48 28 43 36 43 C44 43 50 49 50 61 Z" color={artColors.outline} style="stroke" strokeWidth={OUTLINE * 2} strokeJoin="round" />
      <Path path="M20 61 C20 48 28 43 36 43 C44 43 50 49 50 61 Z" color={colors.coral} />
      <Path path="M36 43 C34 49 34 55 35 61" color={artColors.ribbonShade} style="stroke" strokeWidth={1.2} />
      <Circle cx={36} cy={43.2} r={2.2} color={artColors.outline} />
      <Circle cx={36} cy={43.2} r={1.3} color={artColors.denim} />
      <Path path="M24 52 C25 48 28 46 31 45.5" color={colors.white} style="stroke" strokeWidth={1.6} strokeCap="round" opacity={0.7} />
      <Path path={starPath(43, 54, 3.2)} color={colors.white} />
    </Group>
  );
}

function StrawHat() {
  return (
    <Group {...TILT}>
      <Oval x={4} y={55} width={56} height={10} color={artColors.outline} />
      <Oval x={5.6} y={56.4} width={52.8} height={7.2} color={artColors.straw} />
      <Path path="M18 60 C18 46 24 40 32 40 C40 40 46 46 46 60 Z" color={artColors.outline} style="stroke" strokeWidth={OUTLINE * 2} strokeJoin="round" />
      <Path path="M18 60 C18 46 24 40 32 40 C40 40 46 46 46 60 Z" color={artColors.straw} />
      <Path path="M18.6 55 L45.4 55 L45.8 59.4 L18.2 59.4 Z" color={colors.coral} />
      <Path path="M24 46 L40 46 M21 51 L43 51" color={artColors.strawShade} style="stroke" strokeWidth={0.9} strokeCap="round" />
      <Path path="M10 60 L54 60" color={artColors.strawShade} style="stroke" strokeWidth={0.9} strokeCap="round" />
      <Circle cx={42} cy={57.2} r={2.6} color={colors.white} />
      <Circle cx={42} cy={57.2} r={1.1} color={colors.lamp} />
    </Group>
  );
}

function Crown() {
  const d = 'M20 60 L18 44 L26 51 L32 40 L38 51 L46 44 L44 60 Z';
  return (
    <Group {...TILT}>
      <Path path={d} color={artColors.outline} style="stroke" strokeWidth={OUTLINE * 2} strokeJoin="round" />
      <Path path={d} color={artColors.gold} />
      <Path path="M20 60 L44 60 L44.5 56 L19.5 56 Z" color={artColors.goldShade} />
      {[
        [18, 44],
        [32, 40],
        [46, 44],
      ].map(([x, y]) => (
        <Circle key={x} cx={x} cy={y} r={2} color={colors.coral} />
      ))}
      <Circle cx={32} cy={53} r={2.4} color={colors.lavender} />
      <Path path="M22 54 L24 47" color={colors.white} style="stroke" strokeWidth={1.4} strokeCap="round" opacity={0.7} />
    </Group>
  );
}

const ART: Record<CosmeticId, () => ReactNode> = {
  u16_sunglasses: Sunglasses,
  u16_hat_cap: Cap,
  u16_hat_straw: StrawHat,
  u16_hat_crown: Crown,
};

/** Ein Accessoire auf der Budi-Leinwand. */
export function AccessoryArt({ id }: { id: CosmeticId }) {
  return <>{ART[id]()}</>;
}
