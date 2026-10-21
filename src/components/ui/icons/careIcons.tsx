import { Group, Oval, Path, RoundedRect } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import { artColors } from '../../../lib/theme';
import { iconColors as c, iconInk } from './iconPalette';
import { Dot, Line, Shape, shine, Sparkle } from './shapes';

// Pflege-Icons (ART-2): Bedürfnisse, Werkzeuge, Schädlinge. Einheiten 100 × 100.

export type CareIconId =
  | 'water'
  | 'nutrients'
  | 'light'
  | 'mood'
  | 'wateringCan'
  | 'fertilizerGrow'
  | 'fertilizerBloom'
  | 'mite'
  | 'gnat'
  | 'mold';

const DROP = 'M50 8 C62 30 80 46 80 64 C80 82 66 92 50 92 C34 92 20 82 20 64 C20 46 38 30 50 8 Z';
const LEAF = 'M18 84 C12 50 36 16 86 12 C90 56 64 88 18 84 Z';
const HEART = 'M50 88 C16 68 6 50 10 34 C14 18 38 10 50 28 C62 10 86 18 90 34 C94 50 84 68 50 88 Z';

function Bottle({ fill, label }: { fill: string; label: ReactNode }) {
  return (
    <Group>
      <Shape d="M38 6 L62 6 C64 6 65 7 65 9 L65 22 L35 22 L35 9 C35 7 36 6 38 6 Z" fill={c.metal} />
      <Shape d="M38 22 L62 22 C62 32 78 36 78 52 L78 84 C78 90 74 94 68 94 L32 94 C26 94 22 90 22 84 L22 52 C22 36 38 32 38 22 Z" fill={fill} />
      <RoundedRect x={29} y={52} width={42} height={28} r={7} color={iconInk.outline} />
      <RoundedRect x={31.5} y={54.5} width={37} height={23} r={5} color={c.paper} />
      {label}
      {shine('M30 42 L30 48', 5)}
    </Group>
  );
}

function SproutLabel({ color }: { color: string }) {
  return (
    <Group>
      <Path path="M50 75 L50 64" color={iconInk.outline} style="stroke" strokeWidth={3} strokeCap="round" />
      <Path path="M50 66 C44 58 38 60 37 63 C41 68 47 68 50 66 Z" color={color} />
      <Path path="M50 64 C56 56 62 57 63 60 C59 66 53 66 50 64 Z" color={color} />
    </Group>
  );
}

function BloomLabel() {
  return (
    <Group>
      {[0, 72, 144, 216, 288].map((deg) => (
        <Oval
          key={deg}
          x={47}
          y={56}
          width={6}
          height={9}
          color={c.lavender}
          transform={[{ rotate: (deg * Math.PI) / 180 }]}
          origin={{ x: 50, y: 66 }}
        />
      ))}
      <Oval x={47} y={63} width={6} height={6} color={c.sun} />
    </Group>
  );
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

export const CARE_ICONS: Record<CareIconId, () => ReactNode> = {
  water: () => (
    <Group>
      <Shape d={DROP} fill={c.water} />
      {shine('M33 62 C33 52 38 44 43 38', 6)}
      <Oval x={56} y={70} width={10} height={7} color={iconInk.gloss} opacity={0.6} />
    </Group>
  ),
  nutrients: () => (
    <Group>
      <Shape d={LEAF} fill={c.leaf} />
      <Path path="M20 82 C38 62 54 44 78 20" color={iconInk.outline} style="stroke" strokeWidth={4.5} strokeCap="round" />
      <Path path="M44 58 L42 40 M56 46 L68 50 M34 70 L24 62 M62 36 L60 26" color={iconInk.outline} style="stroke" strokeWidth={3} strokeCap="round" opacity={0.55} />
      <Sparkle cx={80} cy={78} r={9} color={c.sun} />
    </Group>
  ),
  light: () => (
    <Group>
      {RAYS.map((deg) => {
        const a = (deg * Math.PI) / 180;
        const p = `M${50 + Math.cos(a) * 33} ${50 + Math.sin(a) * 33} L${50 + Math.cos(a) * 44} ${50 + Math.sin(a) * 44}`;
        return <Line key={deg} d={p} color={c.sunRay} width={6} />;
      })}
      <Dot cx={50} cy={50} r={25} fill={c.sun} />
      <Oval x={40} y={48} width={5} height={7} color={iconInk.outline} />
      <Oval x={55} y={48} width={5} height={7} color={iconInk.outline} />
      <Path path="M43 59 C47 63 53 63 57 59" color={iconInk.outline} style="stroke" strokeWidth={3} strokeCap="round" />
    </Group>
  ),
  mood: () => (
    <Group>
      <Shape d={HEART} fill={c.heart} />
      {shine('M22 36 C24 28 30 24 36 25', 6)}
      <Sparkle cx={78} cy={22} r={9} />
    </Group>
  ),
  wateringCan: () => (
    <Group>
      <Shape d="M66 46 L90 22 C92 20 96 22 96 26 L96 30 L74 58 Z" fill={c.metalLight} />
      <Line d="M22 46 C6 46 6 74 22 74" color={c.metal} width={6} />
      <Shape d="M20 36 L70 36 L70 84 C70 89 66 92 61 92 L28 92 C23 92 20 89 20 84 Z" fill={c.water} />
      <Shape d="M30 22 C34 10 56 10 60 22 L60 36 L53 36 L53 24 C49 19 41 19 37 24 L37 36 L30 36 Z" fill={c.metal} />
      <RoundedRect x={26} y={58} width={38} height={10} r={5} color={iconInk.gloss} opacity={0.55} />
      <Group>
        {[0, 1, 2].map((i) => (
          <Path key={i} path={`M${92 + i * 2} ${36 + i * 8} l0 4`} color={c.water} style="stroke" strokeWidth={4} strokeCap="round" />
        ))}
      </Group>
    </Group>
  ),
  fertilizerGrow: () => <Bottle fill={c.leaf} label={<SproutLabel color={c.leafDeep} />} />,
  fertilizerBloom: () => <Bottle fill={c.lavender} label={<BloomLabel />} />,
  mite: () => (
    <Group>
      {[-1, 1].flatMap((s) =>
        [40, 54, 68].map((y) => <Line key={`${s}${y}`} d={`M${50 + s * 16} ${y} L${50 + s * 38} ${y - 8}`} color={c.coral} width={3} />),
      )}
      <Shape d="M50 24 C66 24 74 38 74 52 C74 68 64 80 50 80 C36 80 26 68 26 52 C26 38 34 24 50 24 Z" fill={c.coral} />
      <Dot cx={41} cy={46} r={7} fill={c.white} line={4} flat />
      <Dot cx={59} cy={46} r={7} fill={c.white} line={4} flat />
      <Oval x={40} y={44} width={5} height={6} color={artColors.eye} />
      <Oval x={58} y={44} width={5} height={6} color={artColors.eye} />
      <Path path="M42 62 L46 58 L50 62 L54 58 L58 62" color={iconInk.outline} style="stroke" strokeWidth={3} strokeCap="round" strokeJoin="round" />
    </Group>
  ),
  gnat: () => (
    <Group>
      <Shape d="M46 36 C34 14 10 12 8 26 C6 38 26 44 46 40 Z" fill={c.paper} gloss={false} />
      <Shape d="M54 36 C66 14 90 12 92 26 C94 38 74 44 54 40 Z" fill={c.paper} gloss={false} />
      <Shape d="M50 30 C62 30 66 44 66 56 C66 72 58 82 50 82 C42 82 34 72 34 56 C34 44 38 30 50 30 Z" fill={'#4A5280'} />
      <Path path="M36 62 L64 62 M37 71 L63 71" color={iconInk.outline} style="stroke" strokeWidth={3} opacity={0.6} />
      <Dot cx={44} cy={46} r={5} fill={c.white} line={3} flat />
      <Dot cx={56} cy={46} r={5} fill={c.white} line={3} flat />
      <Oval x={43} y={45} width={3.5} height={4} color={artColors.eye} />
      <Oval x={55} y={45} width={3.5} height={4} color={artColors.eye} />
    </Group>
  ),
  mold: () => (
    <Group>
      {[
        { x: 40, y: 46, r: 22 },
        { x: 64, y: 56, r: 18 },
        { x: 44, y: 68, r: 17 },
      ].map((b) => (
        <Dot key={b.x} cx={b.x} cy={b.y} r={b.r} fill={artColors.mold} />
      ))}
      {[
        [34, 42, 4.5],
        [62, 56, 4],
        [48, 70, 3.5],
        [46, 34, 3],
      ].map(([x, y, r]) => (
        <Oval key={`${x}${y}`} x={x - r} y={y - r} width={r * 2} height={r * 2} color={artColors.sick} />
      ))}
    </Group>
  ),
};
