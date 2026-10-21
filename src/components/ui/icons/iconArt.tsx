import { Circle, Group, Oval, Path, RoundedRect } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import { artColors, colors } from '../../../lib/theme';
import { ITEMS, type ItemIconId } from './itemArt';
import { Dot, Shape, shine } from './shapes';

// Icons im Budi-Stil (dunkelgrüne Kontur, flache Farben), Einheiten 100 × 100.

export type GameIconId =
  | 'water'
  | 'nutrients'
  | 'light'
  | 'mood'
  | 'coin'
  | 'wateringCan'
  | 'fertilizerGrow'
  | 'fertilizerBloom'
  | 'minigames'
  | 'shop'
  | 'album'
  | 'settings'
  | 'mite'
  | 'gnat'
  | 'mold'
  | ItemIconId;

const DROP = 'M50 10 C62 30 78 46 78 63 C78 80 65 90 50 90 C35 90 22 80 22 63 C22 46 38 30 50 10 Z';
const LEAF = 'M22 80 C18 48 38 18 82 16 C84 56 62 84 22 80 Z';
const HEART = 'M50 86 C18 66 10 48 14 34 C18 20 38 14 50 30 C62 14 82 20 86 34 C90 48 82 66 50 86 Z';

function Bottle({ fill }: { fill: string }) {
  return (
    <Group>
      <Shape d="M40 10 L60 10 L60 26 L40 26 Z" fill={artColors.metal} />
      <Shape d="M38 26 L62 26 C62 34 76 38 76 52 L76 82 C76 88 72 92 66 92 L34 92 C28 92 24 88 24 82 L24 52 C24 38 38 34 38 26 Z" fill={fill} />
      <RoundedRect x={30} y={54} width={40} height={22} r={5} color={colors.white} opacity={0.85} />
      {shine('M32 44 L32 52')}
    </Group>
  );
}

const ICONS: Record<GameIconId, () => ReactNode> = {
  water: () => (
    <Group>
      <Shape d={DROP} fill={artColors.sweat} />
      {shine('M36 58 C36 50 40 44 44 40')}
    </Group>
  ),
  nutrients: () => (
    <Group>
      <Shape d={LEAF} fill={colors.plantLight} />
      <Path path="M24 78 C40 60 54 44 74 24" color={artColors.outline} style="stroke" strokeWidth={4} strokeCap="round" />
    </Group>
  ),
  light: () => (
    <Group>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        const x1 = 50 + Math.cos(a) * 32;
        const y1 = 50 + Math.sin(a) * 32;
        const x2 = 50 + Math.cos(a) * 44;
        const y2 = 50 + Math.sin(a) * 44;
        return (
          <Path key={deg} path={`M${x1} ${y1} L${x2} ${y2}`} color={artColors.outline} style="stroke" strokeWidth={9} strokeCap="round" />
        );
      })}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <Path
            key={`f${deg}`}
            path={`M${50 + Math.cos(a) * 32} ${50 + Math.sin(a) * 32} L${50 + Math.cos(a) * 44} ${50 + Math.sin(a) * 44}`}
            color={colors.lamp}
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
          />
        );
      })}
      <Dot cx={50} cy={50} r={22} fill={colors.lamp} />
      {shine('M40 42 C42 38 46 36 50 36')}
    </Group>
  ),
  mood: () => (
    <Group>
      <Shape d={HEART} fill={colors.coral} />
      {shine('M26 38 C28 32 34 28 40 30')}
    </Group>
  ),
  coin: () => (
    <Group>
      <Dot cx={50} cy={50} r={38} fill={colors.lamp} />
      <Circle cx={50} cy={50} r={27} color={artColors.pistilRipe} opacity={0.55} />
      <Path path={LEAF} color={colors.white} opacity={0.9} transform={[{ translateX: 25 }, { translateY: 25 }, { scale: 0.5 }]} />
      {shine('M28 40 C30 32 36 26 44 24')}
    </Group>
  ),
  wateringCan: () => (
    <Group>
      <Shape d="M66 44 L92 22 L96 28 L74 56 Z" fill={artColors.metalLight} />
      <Path path="M22 46 C6 46 6 74 22 74" color={artColors.outline} style="stroke" strokeWidth={11} strokeCap="round" />
      <Path path="M22 46 C6 46 6 74 22 74" color={artColors.metal} style="stroke" strokeWidth={5} strokeCap="round" />
      <Shape d="M20 36 L68 36 L68 84 C68 89 64 92 60 92 L28 92 C24 92 20 89 20 84 Z" fill={artColors.sweat} />
      <Shape d="M30 22 C34 12 54 12 58 22 L58 36 L52 36 L52 24 C48 20 40 20 36 24 L36 36 L30 36 Z" fill={artColors.metal} />
      <RoundedRect x={26} y={56} width={36} height={10} r={5} color={colors.white} opacity={0.6} />
      {shine('M28 46 L28 50')}
    </Group>
  ),
  fertilizerGrow: () => <Bottle fill={colors.plantLight} />,
  fertilizerBloom: () => <Bottle fill={colors.lavender} />,
  minigames: () => (
    <Group>
      <Shape d="M22 36 C10 36 6 52 8 66 C10 80 22 84 30 74 L38 64 L62 64 L70 74 C78 84 90 80 92 66 C94 52 90 36 78 36 Z" fill={colors.lavender} />
      <Path path="M24 50 L24 62 M18 56 L30 56" color={artColors.outline} style="stroke" strokeWidth={5} strokeCap="round" />
      <Circle cx={70} cy={50} r={4.5} color={colors.coral} />
      <Circle cx={78} cy={58} r={4.5} color={colors.lamp} />
    </Group>
  ),
  shop: () => (
    <Group>
      <Path path="M36 36 C36 18 64 18 64 36" color={artColors.outline} style="stroke" strokeWidth={7} strokeCap="round" />
      <Shape d="M18 34 L82 34 L76 88 C76 91 73 93 70 93 L30 93 C27 93 24 91 24 88 Z" fill={colors.coral} />
      <Path path={HEART} color={colors.white} transform={[{ translateX: 33 }, { translateY: 44 }, { scale: 0.34 }]} />
    </Group>
  ),
  album: () => (
    <Group>
      <Shape d="M14 22 C30 16 42 18 50 26 L50 88 C42 80 30 78 14 84 Z" fill={colors.plantLight} />
      <Shape d="M86 22 C70 16 58 18 50 26 L50 88 C58 80 70 78 86 84 Z" fill={artColors.leafLight} />
      <Path path="M22 40 L42 36 M22 52 L42 48 M58 36 L78 40 M58 48 L78 52" color={artColors.outline} style="stroke" strokeWidth={3.5} strokeCap="round" opacity={0.6} />
    </Group>
  ),
  settings: () => (
    <Group>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <RoundedRect
          key={deg}
          x={42}
          y={6}
          width={16}
          height={24}
          r={5}
          color={artColors.outline}
          transform={[{ rotate: (deg * Math.PI) / 180 }]}
          origin={{ x: 50, y: 50 }}
        />
      ))}
      <Dot cx={50} cy={50} r={32} fill={artColors.metalLight} />
      <Dot cx={50} cy={50} r={12} fill={colors.white} />
    </Group>
  ),
  mite: () => (
    <Group>
      {[-1, 1].flatMap((s) =>
        [38, 52, 66].map((y) => (
          <Path key={`${s}${y}`} path={`M${50 + s * 16} ${y} L${50 + s * 38} ${y - 8}`} color={artColors.outline} style="stroke" strokeWidth={5} strokeCap="round" />
        )),
      )}
      <Oval x={28} y={28} width={44} height={50} color={artColors.outline} />
      <Oval x={31} y={31} width={38} height={44} color={colors.coral} />
      <Circle cx={42} cy={44} r={5} color={colors.white} />
      <Circle cx={58} cy={44} r={5} color={colors.white} />
      <Circle cx={43} cy={45} r={2.5} color={artColors.eye} />
      <Circle cx={59} cy={45} r={2.5} color={artColors.eye} />
    </Group>
  ),
  gnat: () => (
    <Group>
      <Oval x={10} y={18} width={36} height={26} color={colors.white} opacity={0.9} />
      <Oval x={54} y={18} width={36} height={26} color={colors.white} opacity={0.9} />
      <Path path="M14 30 C20 18 40 18 46 32 M86 30 C80 18 60 18 54 32" color={artColors.outline} style="stroke" strokeWidth={3.5} />
      <Oval x={34} y={30} width={32} height={48} color={artColors.outline} />
      <Oval x={37} y={33} width={26} height={42} color={colors.night} />
      <Circle cx={45} cy={46} r={4} color={colors.white} />
      <Circle cx={55} cy={46} r={4} color={colors.white} />
    </Group>
  ),
  mold: () => (
    <Group>
      {[
        { x: 40, y: 46, r: 22 },
        { x: 62, y: 56, r: 18 },
        { x: 44, y: 66, r: 16 },
      ].map((b) => (
        <Circle key={b.x} cx={b.x} cy={b.y} r={b.r + 3} color={artColors.outline} />
      ))}
      {[
        { x: 40, y: 46, r: 22 },
        { x: 62, y: 56, r: 18 },
        { x: 44, y: 66, r: 16 },
      ].map((b) => (
        <Circle key={`f${b.x}`} cx={b.x} cy={b.y} r={b.r} color={artColors.mold} />
      ))}
      <Circle cx={36} cy={42} r={4} color={artColors.sick} />
      <Circle cx={60} cy={58} r={3.5} color={artColors.sick} />
      <Circle cx={46} cy={68} r={3} color={artColors.sick} />
    </Group>
  ),
  ...ITEMS,
};

/** Ein Icon zeichnen (in einer auf 100 Einheiten skalierten Skia-Gruppe). */
export function IconArt({ id }: { id: GameIconId }) {
  return <>{ICONS[id]()}</>;
}
