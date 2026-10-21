import { Circle, Group, Oval, Path, RoundedRect } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import { artColors, colors } from '../../../lib/theme';
import { iconColors } from './iconPalette';
import { Dot, Shape, shine, Sparkle, starPath } from './shapes';

// Gegenstände im Budi-Stil (WEB-4): Tageskiste, Ernte-Werkzeuge, Shop-Upgrades. Einheiten 100 × 100.
// Dieselben Zeichnungen landen als PNG in assets/images/ (assets/render-art.cjs), damit Shop und
// Ernte-Screen sie über assets.ts bekommen.

export type ItemIconId =
  | 'chest'
  | 'chestOpen'
  | 'lupe'
  | 'scissors'
  | 'potTier1'
  | 'potTier2'
  | 'potTier3'
  | 'led'
  | 'fanDehumidifier'
  | 'bioSoil'
  | 'ladybug';

/** Topf mit Keimling, Stufe 1 bis 3 im Shop. */
function TierPot({ body, rim, band, stars }: { body: string; rim: string; band?: string; stars?: boolean }) {
  return (
    <Group>
      <Path path="M50 40 C50 30 50 24 50 18" color={artColors.outline} style="stroke" strokeWidth={7} strokeCap="round" />
      <Path path="M50 40 C50 30 50 24 50 18" color={artColors.stem} style="stroke" strokeWidth={3} strokeCap="round" />
      <Shape d="M50 24 C40 14 28 16 24 22 C32 30 44 30 50 24 Z" fill={colors.plantLight} line={5} />
      <Shape d="M50 22 C58 10 72 10 78 16 C70 26 58 28 50 22 Z" fill={artColors.leafLight} line={5} />
      <Shape d="M22 50 L78 50 L70 90 C69 93 67 94 64 94 L36 94 C33 94 31 93 30 90 Z" fill={body} />
      {band ? <Path path="M25 66 L75 66 L73 76 L27 76 Z" color={band} /> : null}
      {stars ? (
        <Group>
          <Path path={starPath(38, 74, 6)} color={colors.white} opacity={0.9} />
          <Path path={starPath(60, 70, 8)} color={colors.white} opacity={0.9} />
        </Group>
      ) : null}
      <RoundedRect x={14} y={38} width={72} height={16} r={6} color={artColors.outline} />
      <RoundedRect x={17} y={41} width={66} height={10} r={4} color={rim} />
      {shine('M24 45 L50 45', 3.5)}
      {shine('M30 60 L34 82', 4)}
    </Group>
  );
}

export const ITEMS: Record<ItemIconId, () => ReactNode> = {
  chest: () => (
    <Group>
      <Shape d="M12 48 L88 48 L88 84 C88 89 85 92 80 92 L20 92 C15 92 12 89 12 84 Z" fill={artColors.wood} />
      <Path path="M12 64 L88 64 M12 78 L88 78" color={artColors.woodShade} style="stroke" strokeWidth={4} />
      <Shape d="M12 48 C12 26 26 18 50 18 C74 18 88 26 88 48 Z" fill={artColors.woodShade} />
      <Path path="M24 22 L24 92 M76 22 L76 92" color={artColors.outline} style="stroke" strokeWidth={10} />
      <Path path="M24 22 L24 92 M76 22 L76 92" color={artColors.gold} style="stroke" strokeWidth={5} />
      <Shape d="M40 40 L60 40 L60 62 C60 66 57 68 54 68 L46 68 C43 68 40 66 40 62 Z" fill={artColors.gold} line={5} />
      <Path path={starPath(50, 53, 7)} color={artColors.outline} />
      {shine('M30 30 C36 26 44 24 50 24', 4)}
    </Group>
  ),
  // U13 offen: Deckel hinten hoch, Münzen und Schein
  chestOpen: () => (
    <Group>
      <Circle cx={50} cy={40} r={36} color={artColors.glowSoft} />
      <Shape d="M16 50 L22 14 C40 8 60 8 78 14 L84 50 Z" fill={artColors.woodShade} gloss={false} />
      <Path path="M28 12 L24 50 M72 12 L76 50" color={artColors.gold} style="stroke" strokeWidth={4} />
      <Dot cx={36} cy={46} r={10} fill={iconColors.coin} line={5} />
      <Dot cx={62} cy={44} r={10} fill={iconColors.coin} line={5} />
      <Dot cx={49} cy={38} r={10} fill={iconColors.coin} line={5} />
      <Shape d="M12 50 L88 50 L88 84 C88 89 85 92 80 92 L20 92 C15 92 12 89 12 84 Z" fill={artColors.wood} />
      <Path path="M12 66 L88 66 M12 80 L88 80" color={artColors.woodShade} style="stroke" strokeWidth={4} />
      <Path path="M24 50 L24 92 M76 50 L76 92" color={artColors.outline} style="stroke" strokeWidth={10} />
      <Path path="M24 50 L24 92 M76 50 L76 92" color={artColors.gold} style="stroke" strokeWidth={5} />
      <Sparkle cx={22} cy={22} r={8} />
      <Sparkle cx={82} cy={28} r={6} color={iconColors.star} />
      <Sparkle cx={50} cy={12} r={6} />
    </Group>
  ),
  lupe: () => (
    <Group>
      <Path path="M64 64 L88 88" color={artColors.outline} style="stroke" strokeWidth={18} strokeCap="round" />
      <Path path="M64 64 L88 88" color={artColors.wood} style="stroke" strokeWidth={11} strokeCap="round" />
      <Dot cx={42} cy={42} r={30} fill={artColors.metal} />
      <Circle cx={42} cy={42} r={23} color={artColors.outline} />
      <Circle cx={42} cy={42} r={20} color={artColors.lens} />
      <Circle cx={42} cy={48} r={7} color={artColors.bud} opacity={0.6} />
      {shine('M28 38 C30 30 36 26 42 24', 5)}
    </Group>
  ),
  scissors: () => (
    <Group>
      <Shape d="M47 56 L22 10 C20 6 26 4 28 8 L56 54 Z" fill={artColors.metalLight} line={5} />
      <Shape d="M53 56 L78 10 C80 6 74 4 72 8 L44 54 Z" fill={artColors.metalLight} line={5} />
      <Dot cx={50} cy={54} r={4} fill={artColors.metal} line={4} />
      <Path path="M46 58 L36 70 M54 58 L64 70" color={artColors.outline} style="stroke" strokeWidth={9} strokeCap="round" />
      <Dot cx={32} cy={78} r={13} fill={colors.coral} />
      <Dot cx={68} cy={78} r={13} fill={colors.coral} />
      <Circle cx={32} cy={78} r={6} color={colors.cream} />
      <Circle cx={68} cy={78} r={6} color={colors.cream} />
      {shine('M26 14 L40 38', 2.5)}
    </Group>
  ),
  potTier1: () => <TierPot body={artColors.pot} rim={artColors.potRim} />,
  potTier2: () => <TierPot body={artColors.glaze} rim={artColors.glazeShade} band={colors.white} />,
  potTier3: () => <TierPot body={artColors.gold} rim={artColors.goldShade} stars />,
  led: () => (
    <Group>
      <Path path="M24 8 L24 28 M76 8 L76 28" color={artColors.outline} style="stroke" strokeWidth={4} />
      <Path path="M10 46 L90 46 L74 92 L26 92 Z" color={artColors.glowSoft} opacity={0.45} />
      <Shape d="M8 26 L92 26 L92 42 C92 45 90 47 87 47 L13 47 C10 47 8 45 8 42 Z" fill={artColors.metal} />
      {[18, 30, 42, 54, 66, 78].map((x) => (
        <Circle key={x} cx={x + 2} cy={41} r={4} color={colors.lamp} />
      ))}
      {shine('M14 31 L60 31', 3)}
    </Group>
  ),
  fanDehumidifier: () => (
    <Group>
      <Shape d="M44 30 L88 30 C91 30 92 32 92 35 L92 88 C92 91 90 92 87 92 L49 92 C46 92 44 91 44 88 Z" fill={artColors.plastic} />
      <RoundedRect x={52} y={62} width={32} height={22} r={4} color={artColors.outline} />
      <RoundedRect x={55} y={70} width={26} height={11} r={3} color={artColors.sweat} />
      <Path path="M52 40 L84 40 M52 48 L84 48" color={artColors.plasticShade} style="stroke" strokeWidth={4} strokeCap="round" />
      <Path path="M30 62 L30 90 M18 92 L42 92" color={artColors.outline} style="stroke" strokeWidth={7} strokeCap="round" />
      <Dot cx={30} cy={40} r={24} fill={colors.white} />
      {[0, 120, 240].map((deg) => (
        <Oval
          key={deg}
          x={25}
          y={20}
          width={10}
          height={20}
          color={colors.lavender}
          transform={[{ rotate: (deg * Math.PI) / 180 }]}
          origin={{ x: 30, y: 40 }}
        />
      ))}
      <Dot cx={30} cy={40} r={4} fill={artColors.metal} line={3} />
    </Group>
  ),
  bioSoil: () => (
    <Group>
      <Shape d="M20 22 L80 22 C84 40 86 70 82 88 C81 91 79 92 76 92 L24 92 C21 92 19 91 18 88 C14 70 16 40 20 22 Z" fill={artColors.sack} />
      <Path path="M20 22 L28 14 L36 22 L44 14 L52 22 L60 14 L68 22 L76 14 L80 22" color={artColors.outline} style="stroke" strokeWidth={4} strokeJoin="round" />
      <Path path="M64 26 C70 50 72 70 70 88" color={artColors.sackShade} style="stroke" strokeWidth={6} strokeCap="round" />
      <Circle cx={50} cy={58} r={18} color={colors.white} opacity={0.9} />
      <Shape d="M40 68 C38 54 46 44 62 44 C62 60 54 68 40 68 Z" fill={colors.plantLight} line={4} />
      <Path path="M41 67 C47 60 52 54 60 46" color={artColors.outline} style="stroke" strokeWidth={2.5} strokeCap="round" />
    </Group>
  ),
  ladybug: () => (
    <Group>
      {[-1, 1].flatMap((s) =>
        [52, 66, 80].map((y) => (
          <Path key={`${s}${y}`} path={`M${50 + s * 20} ${y} L${50 + s * 38} ${y + 4}`} color={artColors.outline} style="stroke" strokeWidth={5} strokeCap="round" />
        )),
      )}
      <Path path="M42 26 C38 16 32 12 26 12 M58 26 C62 16 68 12 74 12" color={artColors.outline} style="stroke" strokeWidth={4} strokeCap="round" />
      <Dot cx={50} cy={34} r={13} fill={artColors.eye} />
      <Circle cx={45} cy={32} r={3.2} color={colors.white} />
      <Circle cx={55} cy={32} r={3.2} color={colors.white} />
      <Dot cx={50} cy={64} r={28} fill={artColors.ladybug} />
      <Path path="M50 37 L50 92" color={artColors.outline} style="stroke" strokeWidth={4} />
      {[
        [38, 54, 6],
        [62, 54, 6],
        [34, 72, 5],
        [66, 72, 5],
        [44, 84, 4],
        [56, 84, 4],
      ].map(([x, y, r]) => (
        <Circle key={`${x}${y}`} cx={x} cy={y} r={r} color={artColors.eye} />
      ))}
      {shine('M30 52 C32 46 36 42 42 40', 4)}
    </Group>
  ),
};
